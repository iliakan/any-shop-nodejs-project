// reads categories from download/www.dns-shop.ru.har into object
// id => category

const util = require("util");
//util.inspect.defaultOptions.depth = 4;
const config = require('../config');
const fs = require("fs");
const path = require("path");

/**
 * 1. Открыть в Chrome https://www.dns-shop.ru/
 * 2. Сохранить Save as HAR (Export HAR, стрелка вниз сверху) -> в downloadRoot
 */ 
module.exports = function() {
  const har = fs.readFileSync(path.resolve(config.downloadRoot, 'www.dns-shop.ru.har'), "utf-8");
  const json = JSON.parse(har);
  const categoriesEntry = json.log.entries.find(
    entry =>
      entry.request.url == "https://www.dns-shop.ru/ajax-state/catalog-menu/"
  );

  let categoriesSource = JSON.parse(categoriesEntry.response.content.text);
  categoriesSource = categoriesSource.data.states[0].data.roots;

  let weight = 1;

  let categoryById = Object.create(null);
  function listCategories(category, parent = null, depth = 0) {
    if (category.url.includes("/recipe/") || category.url.includes("/?")) {
      return; // ignore
    }
    let slug = category.url
      .split("/")
      .filter(Boolean)
      .pop();
    let id = category.url
      .split("/")
      .filter(Boolean)
      .slice(-2, -1)[0];
    if (categoryById[id]) {
      console.log(categoryById[id]);
      console.log(category);
      throw new Error("Duplicate id: " + id);
    }
    categoryById[id] = {
      title: category.title,
      id,
      slug,
      parent,
      depth,
      weight: weight++
    };

    for (let child of category.childs) {
      listCategories(child, id, depth + 1);
    }
  }

  for (let child of categoriesSource) {
    listCategories(child);
  }

  // console.log(categoryById);
  return categoryById;
};
