module.exports = function mapCategory(category) {
  return {
    id: category.id,
    title: category.title,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory.id,
      title: subcategory.title,
    })),
  };
};
