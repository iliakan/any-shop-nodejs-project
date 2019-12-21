# Backend for js advanced course

To run it:

- `npm install` - to install modules,
- `gulp fixtures` - to generate `data/` json data from Excel files in `original_data/`
- `gulp server` - to run the server.

URLs:

- `http://localhost:8080/api/rest/products`
- `http://localhost:8080/api/rest/categories`
- `http://localhost:8080/api/rest/subcategories`
- `http://localhost:8080/api/rest/orders`

Parameters:

- `http://localhost:8080/api/rest/products?_start=0&_end=30&_order=desc&_embed=subcategory.category`
- `/products?_category.name =  _lte=  _gte=  _ne=  _like=`
- `/products?_start=1&_end=10`
- `/products?_sort=category.name,id&order=desc,asc`
- `/products?_embed=category,other`
- `/categories?_refs=subcategory`

