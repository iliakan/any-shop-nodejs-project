const fs = require("fs-extra");
const path = require("path");
const faker = require("faker");
const glob = require("glob");
const parseCategories = require("../libs/parseCategories");
const config = require('../config');
const productRoot = path.resolve(config.downloadRoot, "product");

const productFileNames = glob.sync("*.json", { cwd: productRoot });

module.exports = async function() {
  {
    // load products in random order, not sorted order, to avoid groups of similar products
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffle(productFileNames);
  }

  let productById = Object.create(null);

  let categories = parseCategories();

  let db = {
    categories: [],
    subcategories: [],
    products: [],
    orders: []
  };

  // console.log(categories);

  let ids = new Set();
  // make categories
  for (let category of Object.values(categories)) {
    if (category.depth == 0) {
      if (category.slug != "markdown" && category.slug != "dorabotka") {
        if (ids.has(category.slug)) {
          console.error("Duplicate id", category.slug);
          process.exit(1);
        }
        ids.add(category.slug);
        db.categories.push({
          id: category.slug,
          title: category.title,
          count: 0,
          weight: category.weight
        });
      }
    }
  }

  ids = new Set();
  // make subcategories (with parent existing in categories)
  for (let category of Object.values(categories)) {
    if (category.depth == 1) {
      let parent = categories[category.parent];
      let existsParent = db.categories.find(c => c.id == parent.slug);
      if (!existsParent) {
        console.log("No parent for " + category);
        continue;
      }

      if (ids.has(category.slug)) {
        console.error("Duplicate subcat id", category.slug);
        process.exit(1);
      }
      ids.add(category.slug);

      db.subcategories.push({
        id: category.slug,
        title: category.title,
        count: 0,
        category: parent.slug,
        weight: category.weight
      });
    }
  }

  db.categories.reduce((accumulator, next) => {
    if (accumulator[next.id]) {
      throw new Error("Duplicate category " + next.id);
    } else {
      accumulator[next.id] = true;
    }
    return accumulator;
  }, {});

  db.subcategories.reduce((accumulator, next) => {
    if (accumulator[next.id]) {
      throw new Error("Duplicate subcategory " + next.id);
    } else {
      accumulator[next.id] = true;
    }
    return accumulator;
  }, {});

  const productsByCategoryMax = Object.create(null);

  for (let productFileName of productFileNames) {
    let json = fs.readFileSync(`${productRoot}/${productFileName}`);
    let product = JSON.parse(json);

    if (!product) {
      // may be null: bad link to that product, maybe 410 (no such product)
      continue;
    }
    // console.log(product);

    if (productById[product.id]) {
      console.error("DUPLICATE ID", product);
      throw new Error("Duplicate id");
    }

    productById[product.id] = product;

    let [breadcrumb1, breadcrumb2] = product.breadcrumb;

    // console.log(product);
    // console.log(breadcrumb1, breadcrumb2);

    let categoryId = breadcrumb1.href.split("/").filter(Boolean)[1];
    let subcategoryId = breadcrumb2.href.split("/").filter(Boolean)[1];

    let categorySlug = categories[categoryId].slug;
    let subcategorySlug = categories[subcategoryId].slug;

    let category = db.categories.find(c => c.id == categorySlug);
    let subcategory = db.subcategories.find(c => c.id == subcategorySlug);

    if (!category) {
      console.error(product);
      throw new Error("No category: " + categoryId);
    }

    if (!subcategory) {
      console.error(product);
      throw new Error("No subcategory: " + subcategoryId);
    }

    if (!productsByCategoryMax[subcategoryId]) {
      productsByCategoryMax[subcategoryId] = faker.random.number({
        min: 8,
        max: 24
      });
    }

    if (subcategory.count == productsByCategoryMax[subcategoryId]) {
      // ignore product, we have enough in this subcategory
      continue;
    }

    db.products.push({
      id: product.id,
      title: product.title,
      description: product.description,
      quantity: faker.random.number({ min: 1, max: 100 }),
      subcategory: subcategory.id,
      status: faker.random.number({ min: 1, max: 10 }) === 10 ? 0 : 1,
      images: product.images.map(link => ({
        url: link,
        source: path.basename(link)
      })),
      price: product.price,
      discount:
        product.price > 1000 && faker.random.number({ min: 1, max: 5 }) === 1
          ? product.price / 10
          : 0
    });

    category.count++;
    subcategory.count++;

    /*

        properties:           {
        id:          {type: "string"},
        title:       {type: "string"},
        description: {type: "string"},
        quantity:    {type: "number"},
        subcategory: {type: "string"},
        status:      {type: "number"},
        images:      {
          type:        "array",
          items:       {
            type:                 "object",
            properties:           {
              source: {type: "string"},
              url:    {type: "string"}
            },
            additionalProperties: false
          },
          uniqueItems: true
        },
        price:       {type: "number"},
        discount:    {type: "number"}
      },
      */

    // break;
  }

  fs.writeFileSync(`${config.dataRoot}/db.json`, JSON.stringify(db, null, 2));

};