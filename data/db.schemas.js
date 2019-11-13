module.exports = [
  {
    $id:                  "https://javascript.info/schemas/category.json",
    type:                 "object",
    properties:           {
      id:    {type: "string"},
      title: {type: "string"},
      count: {type: "number"},
    },
    required:             ["id", "title", "count"],
    additionalProperties: false // other properties not allowed
  }, {
    $id:                  "https://javascript.info/schemas/subcategory.json",
    type:                 "object",
    properties:           {
      id:       {type: "string"},
      title:    {type: "string"},
      count:    {type: "number"},
      category: {type: "string"}
    },
    required:             ["id", "title", "count", "category"],
    additionalProperties: false
  }, {
    $id:                  "https://javascript.info/schemas/product.json",
    type:                 "object",
    properties:           {
      id:          {type: "string"},
      title:       {type: "string"},
      description: {type: "string"},
      quantity:    {type: "number"},
      category:    {type: "string"},
      subcategory: {type: "string"},
      enabled:     {type: "boolean"},
      images:      {
        type:  "array",
        items: {
          type: "string"
        },
        uniqueItems: true
      },
      price:       {type: "number"}
    },
    required:             ["id", "title", "description", "quantity", "category", "subcategory", "enabled", "images", "price"],
    additionalProperties: false
  }, {
    $id:                  "https://javascript.info/schemas/order.json",
    type:                 "object",
    properties:           {
      id:        {type: "string"},
      products: {
        // array of products: [ {product:..., count:...}, ... ]
        type:                 "array",
        items:                {
          type: "object",
          properties: {
            product: {
              type: "string",
            },
            count: {
              type: "number"
            }
          },
          required:             ["product", "count"],
          additionalProperties: false
        }
      },
      totalCost:    {type: "number"},
//      createdAt: {type: "string", pattern: "^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d.\d{3}Z"},
      createdAt: {type: "string", format: "date-time"},
      user:      {type: "string"},
      phone:     {type: "string"}
    },
    required:             ["id", "product", "count", "amount", "createdAt", "user", "phone"],
    additionalProperties: false
  }, {
    $id:        "https://javascript.info/schemas/db.json",
    type:       "object",
    properties: {
      categories:    {
        type:  "array",
        items: {
          $ref: "https://javascript.info/schemas/category.json",
        }
      },
      subcategories: {
        type:  "array",
        items: {
          $ref: "https://javascript.info/schemas/subcategory.json",
        }
      },
      products:      {
        type:  "array",
        items: {
          $ref: "https://javascript.info/schemas/product.json",
        }
      },
      orders:        {
        type:  "array",
        items: {
          $ref: "https://javascript.info/schemas/order.json",
        }
      }
    }
  }
];
