// @see https://www.dns-shop.ru/sitemap.xml
// const util = require("util");
// util.inspect.defaultOptions.depth = 4;

const PromisePool = require("es6-promise-pool");

const xml2js = require("xml2js");
const fs = require("fs-extra");
const path = require("path");
const request = require("request-promise");
const requestPure = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const parser = new xml2js.Parser(/* options */);
const config = require('../config');
const imageRoot = path.resolve(config.downloadRoot, "image");
const productRoot = path.resolve(config.downloadRoot, "product");

// require('request-debug')(requestPure);


let files = [
  "https://www.dns-shop.ru/products1.xml",
  "https://www.dns-shop.ru/products2.xml",
  "https://www.dns-shop.ru/products3.xml",
  "https://www.dns-shop.ru/products4.xml",
  "https://www.dns-shop.ru/products5.xml"
];

const LOAD_IMAGES = true;
const CONCURRENCY = 1;

async function run(productsXmlUrl) {
  console.log("RUN", productsXmlUrl);

  let xml;
  // console.log(fs.statSync(`${productRoot}/${path.basename(productsXml)}`).mtimeMs, Date.now() - 3600e3, fs.statSync(`${productRoot}/${path.basename(productsXml)}`).mtimeMs > Date.now() - 3600e3);
  if (
    fs.existsSync(`${productRoot}/${path.basename(productsXmlUrl)}`) &&
    fs.statSync(`${productRoot}/${path.basename(productsXmlUrl)}`).mtimeMs >
      Date.now() - 3600e3
  ) {
    xml = fs.readFileSync(`${productRoot}/${path.basename(productsXmlUrl)}`);
  } else {
    xml = await fetchUrl({ url: productsXmlUrl });
    fs.writeFileSync(`${productRoot}/${path.basename(productsXmlUrl)}`, xml);
  }

  let parsed = await parser.parseStringPromise(xml);
  let urls = parsed.urlset.url.map(record => record.loc[0]);

  let i = 0;
  function producer() {
    let url = urls[i++];
    if (!url) return;

    console.log(url, `${i} of ${urls.length}`);

    return loadUrl(url);
  }

  const pool = new PromisePool(producer, CONCURRENCY);

  return pool.start();
}

async function loadUrl(url) {
  let id = url
    .split("/")
    .filter(Boolean)
    .pop();
  if (fs.existsSync(`${productRoot}/${id}.json`)) return;

  let productPage;
  if (fs.existsSync(`${productRoot}/${id}.html`)) {
    productPage = fs.readFileSync(`${productRoot}/${id}.html`, {
      encoding: "utf-8"
    });
  } else {
    productPage = await fetchUrl({ url });
    fs.writeFileSync(`${productRoot}/${id}.html`, productPage);

    if (productPage === null) {
      fs.writeFileSync(`${productRoot}/${id}.json`, JSON.stringify(null));
      return; // no such product
    }
  }

  console.log("PARSE", url);
  let product = parse(productPage);
  product.id = id;
  product.sourceUrl = url;

  if (LOAD_IMAGES) {
    let jobs = [];
    for (let url of product.images) {
      let filename = path.basename(url);
      if (fs.existsSync(`${imageRoot}/${filename}`)) {
        continue;
      }

      console.log(url);

      let job = await fetchUrl({
        url,
        encoding: null
      }).then(function(res) {
        if (res) {
          const buffer = Buffer.from(res, "utf8");
          fs.writeFileSync(`${imageRoot}/${filename}`, buffer);
        }
      });
      jobs.push(job);
    }
    await Promise.all(jobs);
  }

  fs.writeFileSync(
    `${productRoot}/${id}.json`,
    JSON.stringify(product, null, 2)
  );
}

// loads url, retries in case of timeout
// handles 410 as "no data"
// shows itself as googlebot
async function fetchUrl(options = {}) {
  console.log("FETCH", options.url);
  // using requestPure cause (maybe) request-promise aborts on ESOCKETTIMEOUT
  return new Promise((resolve, reject) => {
    requestPure(
      Object.assign(
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            Accept: "*/*"
          },
          timeout: 20000,
          jar: true,
          gzip: true
        },
        options
      ),
      (error, response, body) => {
        if (
          !error &&
          !response.headers["content-type"].startsWith("image") &&
          body &&
          body.includes("ipp.")
        ) {
          // DDOS protection
          body = body.replace("location.href", "window.redir");
          body = body.replace(
            /document.cookie=/g,
            'window.cook = (window.cook || "") + "|||" + '
          );
          const dom = new JSDOM(body, { runScripts: "dangerously" });
          const window = dom.window;

          options.url = window.redir;
          resolve(fetchUrl(options));

          console.log(
            "REDIR",
            window.redir,
            "COOKIE",
            window.cook,
            "BODY",
            body
          );
          const document = window.document;

          console.log("REQUEST", options, error, response, body);

          console.log("COOKIE", document.cookie);
          process.exit(1);

          return;
        }
        if (error) {
          if (error.code == "ESOCKETTIMEDOUT") {
            resolve(fetchUrl(options));
          } else if (error.code == "ECONNRESET") {
            return new Promise(resolve => setTimeout(resolve, 2000)).then(() =>
              resolve(fetchUrl(options))
            );
          } else if (error.message.includes("Exceeded maxRedirects")) {
            resolve(null);
          } else {
            reject(error);
          }
        } else {
          if (response.statusCode == 410 || response.statusCode == 500) {
            // not such product any more
            resolve(null);
          } else if (response.statusCode != 200) {
            console.error("BAD RESPONSE", error, response, body);
            process.exit(1);
            throw new Error("BAD RESPONSE");
          } else {
            resolve(body);
          }
        }
      }
    );
  });
}

function parse(productPage) {
  const dom = new JSDOM(productPage);
  const window = dom.window;
  const document = window.document;

  let product = {};

  product.title = parseTitle(document);
  product.breadcrumb = parseBreadcrumb(document);

  product.code = +document.querySelector('[data-product-param="code"]')
    .innerHTML;
  product.price = parsePrice(document);
  product.images = parseImages(document);

  let descriptionElem = document.querySelector('[itemprop="description"]');
  product.description = descriptionElem
    ? descriptionElem.querySelector("p").textContent
    : "";

  product.characteristics = parseCharacteristics(document);

  product.rating = parseRating(document);

  product.guid = parseGuid(document);

  // trying to avoid "out of memory"
  // doesn't actually work, but maybe helps
  window.close();

  return product;
}

function parsePrice(document) {
  let elem = document.querySelector('meta[itemprop="price"]');
  return elem ? +elem.getAttribute("content") : null;
}

function parseCharacteristics(document) {
  let characteristics = [];
  let characteristicElems = document.querySelectorAll(
    "#main-characteristics tr"
  );
  let section;
  for (let elem of characteristicElems) {
    let partElem = elem.querySelector(".table-part");
    if (partElem) {
      section = {
        title: partElem.innerHTML,
        items: []
      };
      if (elem.classList.contains("hidden")) {
        section.isExtended = true;
      }
      characteristics.push(section);
    } else {
      let item = {
        name: elem.querySelector(".dots span").firstChild.data.trim(),
        value: elem.querySelectorAll("td")[1].innerHTML.trim()
      };
      if (elem.classList.contains("extended-characteristic")) {
        item.isExtended = true;
      }
      section.items.push(item);
    }
  }

  return characteristics;
}

function parseImages(document) {
  let images = [];
  let imagesContainer =
    document.getElementById("thumbsSliderWrap") ||
    document.getElementById("mainImageSliderWrap");
  let imageLinks = imagesContainer.querySelectorAll("[data-original]");
  for (let link of imageLinks) {
    images.push(link.dataset.original);
  }
  return images;
}

function parseTitle(document) {
  let breadcrumbElem = document.querySelector(
    '[itemscope="http://schema.org/BreadcrumbList"]'
  );
  // console.log(document.documentElement.innerHTML)
  let breadcrumbElems = breadcrumbElem.querySelectorAll(
    '[itemprop = "itemListElement"]'
  );
  breadcrumbElems = Array.from(breadcrumbElems);

  let productElem = breadcrumbElems.pop();

  return productElem.querySelector('[itemprop="item"]').innerHTML;
}

function parseBreadcrumb(document) {
  let breadcrumbElems = document
    .querySelector('[itemscope="http://schema.org/BreadcrumbList"]')
    .querySelectorAll('[itemprop = "itemListElement"]');
  breadcrumbElems = Array.from(breadcrumbElems);
  breadcrumbElems.pop();
  breadcrumbElems.shift();

  let breadcrumb = [];
  for (let elem of breadcrumbElems) {
    breadcrumb.push({
      href: elem.querySelector('[itemprop="item"]').href,
      name: elem.querySelector('[itemprop="name"]').innerHTML
    });
  }

  return breadcrumb;
}

function parseRating(document) {
  let ratingElem = document.querySelector('[itemprop="ratingValue"]');
  if (!ratingElem) return null;
  return ratingElem.textContent;
}

function parseGuid(document) {
  let productGuidContainerEl = document.getElementById("product-page");
  return productGuidContainerEl.dataset.id;
}

module.exports = async function() {
  fs.ensureDirSync(imageRoot);
  fs.ensureDirSync(productRoot);
  
  for (let file of files) {
    await run(file);
  }
};
