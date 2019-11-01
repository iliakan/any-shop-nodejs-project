const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const transliterate = require('../libs/transliterate');

const dataDir = path.resolve(__dirname, '../data');
const files = fs.readdirSync(path.join(dataDir, 'original_data'));

module.exports = async function() {
  const categories = {/*
  [title]: [...titles]
*/
  };

  const products = {
    items:  [/* {title, description, category, subcategory, images, price} */],
    titles: new Set(),/*
  [category]: {
    [subcategory]: count,
  },
*/
  };

  for (const file of files) {
    if (file[0] === '~') continue;
    if (!file.endsWith('.xlsx')) continue;

    console.log(`processing ${file} ...`);

    const workbook = XLSX.readFile(path.join(dataDir, 'original_data', file));
    const sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheet_name];

    const items = XLSX.utils.sheet_to_json(worksheet);

    for (const product of items) {
      const category = product['Категория'];
      const subcategory = product['Подкатегория 2'];
      //const subcategorySlug = transliterate(subcategory.toLowerCase().replace(/ /g, '-'));

      categories[category] = categories[category] || new Set();
      categories[category].add(subcategory);
      products[category] = products[category] || {};
      products[category][subcategory] = products[category][subcategory] || 0;

      const title = product['Имя товара'];

      if (products.titles.has(title)) continue;

      if (products[category][subcategory] < 10 && product['Описание']) {
        products[category][subcategory]++;

        products.titles.add(title);

        products.items.push({
          title,
          description: product['Описание'],
          category,
          subcategory: subcategory,
          images:      product['Ссылки на фото (через пробел)'].split(' ').map(link => link.trim()).slice(0, 5),
          price:       parseInt(product['Цена'].replace(/\s/g, '').replace(',', '.')) // make price integer for simplicity
        });
      }
    }
  }

  Object.keys(categories).forEach(category => {
    categories[category] = Array.from(categories[category]);
  });

  fs.writeFileSync(path.resolve(dataDir, 'categories.json'), JSON.stringify(categories, null, 2));
  fs.writeFileSync(path.resolve(dataDir, 'products.json'), JSON.stringify(products.items, null, 2));
};
