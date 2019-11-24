
// categories/saveTree
// saves subcategories order
// category.id : [ subcategory ids ]
module.exports = async (ctx) => {

  let category = ctx.db.getById('categories', ctx.request.body.categoryId);
  if (!category) {
    ctx.throw(404);
  }

  let subcategories = ctx.db.get('subcategories').filter(subcategory => subcategory.category == ctx.request.body.categoryId)
  let stats = Object.create(null);

  for(let order of orders) {
    let dateStr = order.createdAt.toISOString().replace(/T.*/, '');
    if (!stats[dateStr]) stats[dateStr] = 0;
    stats[dateStr]++;
  }

  ctx.body = stats;
};
