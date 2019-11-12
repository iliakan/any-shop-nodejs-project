let pluralize = require('pluralize');

let db = {
  products: [
    {id: 1, category: 2}
  ],
  categories: [
    {id: 2, name: 'test'}
  ],
  get(value) {
    return db[value]
  }
};


function createGetter(field) {
  // /products?category=id
  // /products?category.title_like=title
  const parts = field.split('.');

  return value => {
    for (let i = 0; i < parts.length; i++) {
      value = value[parts[i]]; // product -> product.category (id)
      if (value === undefined) return undefined;
      if (i < parts.length - 1) {
        // we have category id, let's get category instead
        let collection = db.get(pluralize(parts[i]));
        value = collection.find(v => v.id == value);
      }
    }
    return value;
  };

}

let getter = createGetter('category.name');

console.log(getter(db.products[0]));
