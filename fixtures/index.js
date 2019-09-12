const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const connection = require('../libs/connection');
const users = require('./users');
const categories = require('./categories');
const products = require('./products');

(async () => {
  await User.deleteMany();
  await Category.deleteMany();
  await Product.deleteMany();
  await Order.deleteMany();

  for (const user of users) {
    const u = new User(user);
    await u.setPassword(user.password);
    await u.save();
  }

  const categoriesMap = {/*
    [title]: {
      id: ...,
      subcategories: {
        [title]: id,
      }
    }
  */};

  for (const category of categories) {
    const c = await Category.create(category);

    categoriesMap[category.title] = {
      id: c.id,
      subcategories: c.subcategories.reduce((r, s) => {
        r[s.title] = s.id;
        return r;
      }, {})
    };
  }

  for (const product of products) {
    await Product.create({
      title: product.title,
      description: product.description,
      price: product.price,
      rating: product.rating,
      category: categoriesMap[product.category].id,
      subcategory: categoriesMap[product.category].subcategories[product.subcategory],
      images: product.images,
    });
  }


  connection.close();

  console.log(`${users.length} users have been saved in DB`);
  console.log(`${categories.length} categories have been saved in DB`);
  console.log(`${products.length} products have been saved in DB`);
})();
