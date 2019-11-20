let product = {
  id:       1,
  category: {
    name: 'test'
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
    }
    return value;
  };

}

let getter = createGetter('category.name');

console.log(getter(product));
