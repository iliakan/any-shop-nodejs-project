const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const transliterate = require('../libs/transliterate');
const faker = require('faker');
const dataDir = path.resolve(__dirname, '../data');
const files = fs.readdirSync(path.join(dataDir, 'original_data'));

faker.seed(1);

const PRODUCTS_PER_CATEGORY_MAX = 10;

function makeSlug(str) {
  return transliterate(str.toLowerCase().replace(/ /g, '-'));
}

module.exports = async function() {
  const categories = [];

  const productSlugSet = new Set();

  const products = [];

  for (const file of files) {
    if (file[0] === '~') continue;
    if (!file.endsWith('.xlsx')) continue;

    console.log(`processing ${file} ...`);

    const workbook = XLSX.readFile(path.join(dataDir, 'original_data', file));
    const sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheet_name];

    const items = XLSX.utils.sheet_to_json(worksheet);

    for (const product of items) {
      // skip products w/o desc
      if (!product['Описание']) continue;

      const title = product['Имя товара'];
      const slug = makeSlug(title);

      if (productSlugSet.has(slug)) continue;
      productSlugSet.add(slug);

      const category = product['Категория'];
      const subcategory = product['Подкатегория 2'];
      const subcategorySlug = makeSlug(subcategory);
      const categorySlug = makeSlug(category);

      let categoryObj = categories.find(c => c.id === categorySlug);
      if (!categoryObj) {
        categoryObj = { id: categorySlug, title: category, children: [], count: 0 };
        categories.push(categoryObj)
      }

      let subcategoryObj = categoryObj.children.find(c => c.id === subcategorySlug);
      if (!subcategoryObj) {
        subcategoryObj = {id: subcategorySlug, title: subcategory, count: 0 };
        categoryObj.children.push(subcategoryObj);
      }

      if (subcategoryObj.count === PRODUCTS_PER_CATEGORY_MAX) continue;

      products.push({
        id: slug,
        title,
        description: product['Описание'],
        quantity: faker.random.number({min: 1, max: 100 }),
        category: categorySlug,
        subcategory: subcategorySlug,
        enabled: faker.random.number({min:1, max: 10}) === 10,
        images:      product['Ссылки на фото (через пробел)'].split(' ').map(link => link.trim()).slice(0, 5),
        price:       Math.round(product['Цена'].replace(/\s/g, '').replace(',', '.') / 60) // make price integer for simplicity
      });

      subcategoryObj.count++;
      categoryObj.count++;
    }

    fs.writeFileSync(path.resolve(dataDir, 'db.json'), JSON.stringify({categories, products}, null, 2));
  }

};

