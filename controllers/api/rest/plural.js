const Router = require('@koa/router');
const save = require('./save');
const pluralize = require('pluralize');
const _ = require('lodash');
const transliterate = require('../../../libs/transliterate');
const uuid = require('uuid/v4');

module.exports = (db, name, opts) => {
  const router = new Router();

  let collection = db.get(name);

  return router
    .get('/', list)
    .post('/', create, save(db))
    .get('/:id', show)
    .delete('/:id', destroy, save(db))
    .put('/', update, save(db))
    .patch('/', update, save(db))
    .routes();

  // GET /products
  // GET /products?category.name =  _lte=  _gte=  _ne=  _like=
  // GET /products?_start=1&_end=10
  // GET /products?_sort=category.name,id&order=desc,asc
  // GET /products?_embed=category,other
  // GET /categories?_refs=subcategory
  async function list(ctx, next) {

    // await new Promise(resolve => setTimeout(resolve, 1000));

    let filters = {
      lte(compareWith, getter, value) {
        value = getter(value);
        if (value instanceof Date) {
          compareWith = new Date(compareWith);
          compareWith.setHours(23, 59, 59, 999);
        }
        // console.log("LOG", compareWith, value, getter(value));
        return value <= compareWith;
      },
      gte(compareWith, getter, value) {
        value = getter(value);
        if (value instanceof Date) {
          compareWith = new Date(compareWith);
          compareWith.setHours(0, 0, 0, 0);
        }
        return value >= compareWith;
      },
      eq(match, getter, value) {
        return getter(value) == match;
      },
      ne(match, getter, value) {
        return getter(value) != match;
      },
      like(match, getter, value) {
        // console.log(match, value, getter(value));
        return String(getter(value)).toLowerCase().includes(match.toLowerCase());
      }
    };

    let processingChain = {
      filters: [],
      sortFields: [],
      sortOrder: [],
      start: null,
      end: null,
      embed: [],
      refs: []
    };

    let query = Object.assign({}, ctx.query);

    for (let [key, value] of Object.entries(query)) {
      let operator = key.match(/_[^_]+$/g);
      let field;

      if (operator) {
        operator = operator[0]; // ['_lte'] -> _lte
        field = key.slice(0, -operator.length);
        operator = operator.slice(1); // _lte -> lte
      } else {
        field = key;
        operator = 'eq';
      }

      let getter = db.createGetter(field);
      if (filters[operator]) {
        processingChain.filters.push(filters[operator].bind(null, value, getter));
      }

      if (field === '') {
        if (operator === 'sort') {
          processingChain.sortFields = Array.isArray(value) ? value : value.split(',');
        }
        if (operator === 'order') {
          processingChain.sortOrder = Array.isArray(value) ? value : value.split(',');
        }
        if (operator === 'start') {
          processingChain.start = +value;
        }
        if (operator === 'end') {
          processingChain.end = +value;
        }
        if (operator === 'embed') {
          processingChain.embed = Array.isArray(value) ? value : value.split(',');
        }
        if (operator === 'refs') {
          processingChain.refs = Array.isArray(value) ? value : value.split(',');
        }
      }
    }

    let results = collection.slice();
    for(let i=0; i<results.length; i++) {
      let result = results[i];
      if (!result) continue; // filtered out by a previous filter run
      for(let filter of processingChain.filters) {
        if (!filter(result)) {
          // console.log("Removing", filter, result);
          results[i] = null;
          break;
        }
      }
    }


    results = results.filter(Boolean);

    // console.log(results.length, "BEFORE");

    for(let i = 0; i<processingChain.sortFields.length; i++) {
      let sortField = processingChain.sortFields[i];
      let order = processingChain.sortOrder[i] === 'desc' ? -1 : 1;

      let getter = db.createGetter(sortField);

      results.sort((a, b) =>
        getter(a) > getter(b) ? order :
        getter(a) == getter(b) ? 0  : -order);
    }

    // console.log(results.length, "AFTER");

    if (processingChain.start !== null) {
      results = results.slice(processingChain.start, processingChain.end == null ? results.length : processingChain.end);
      ctx.set('X-Total-Count', results.length);
      ctx.append('Access-Control-Expose-Headers', 'X-Total-Count');
    }

    // console.log(results.length, "AFTER");

    // before embedding copy objects, to avoid overwriting in db
    results = results.map(_.cloneDeep);

    // http://localhost:8080/api/rest/products?_start=0&_end=30&_embed=subcategory.category
    for(let embedField of processingChain.embed) {
      for(let result of results) {
        let parts = embedField.split('.');
        let value = result;
        for(let part of parts) {
          if (!(part in value)) continue;
          // clone to avoid overwriting in db
          value[part] = _.cloneDeep(db.getById(pluralize(part), value[part]));
          value = value[part];
        }
      }
    }

    for(let refsField of processingChain.refs) {
      for (let result of results) {
        result[pluralize(refsField)] = [];
        // category = { id: "detskie-tovary-i-igrushki", ... }
        // subcategories = [{ category: ... }]
        // refsField=subcategory
        let children = db.get(pluralize(refsField));
        for(let child of children) {
          // console.log(subcategory, name);
          if (child[pluralize.singular(name)] == result.id) {
            result[pluralize(refsField)].push(child);
          }
          if (children.length && children[0].weight) {
            result[pluralize(refsField)].sort((a, b) => a.weight - b.weight);
          }
        }
      }
    }

    ctx.body = results;

    await next();
  }

  // /GET /products/12
  async function show(ctx, next) {
    let result = db.getById(name, ctx.params.id);

    if (!result) {
      ctx.throw(404, "No such item");
    }

    if (ctx.query._embed) {
      for(let embedField of ctx.query._embed.split(',')) {
        if (result[embedField])  {
          result[embedField] = db.getById(pluralize(embedField), result[embedField]);
        }
      }
    }

    ctx.body = result;

    await next();
  }

  // POST /products
  async function create(ctx, next) {
    if (ctx.request.body.id && db.getById(collection, ctx.request.body.id)) {
      ctx.status = 409;
      ctx.body = {
        errors: {
          id: `ID already exists: ${ctx.request.body.id}`
        }
      };
      return await next();
    }

    let validate = db.getValidate(collection);

    if (!validate(ctx.request.body)) {
      ctx.body = validate.errors;
      ctx.status = 400;
      return await next();
    }

    collection.push(ctx.request.body);
    ctx.status = 201;
    return await next();
  }

  // PUT /name -> replaces (adds if not exists)
  // PATCH /name -> updates (errors if not exists)
  async function update(ctx, next) {
    let incomingResources = Array.isArray(ctx.request.body) ? ctx.request.body : [ctx.request.body];

    let validate = db.getValidate(name);

    let newResources = [];

    for(let incomingResource of incomingResources) {
      let newResource;
      if (ctx.request.method === 'PATCH') {
        if (!incomingResource.id) {
          ctx.throw(404, "PATCH requires id");
        }
        let existingResource = db.getById(name, incomingResource.id);
        if (!existingResource) {
          ctx.throw(404, "No resource with such id: " + incomingResource.id);
        }
        newResource = Object.assign(_.cloneDeep(existingResource), incomingResource);
      } else {
        newResource = incomingResource;
        if (!newResource.id) {
          // autogenerate id
          if (newResource.title) {
            newResource.id = transliterate(newResource.title);
          } else {
            newResource.id = uuid();
          }
        }
      }

      if (!validate(newResource)) {
        ctx.body = {
          resource: incomingResource,
          errors: validate.errors
        };
        ctx.status = 400;
        return await next();
      }

      newResources.push(newResource);
    }

    // console.log("Saving", newResources);

    for(let newResource of newResources) {
      let index = collection.findIndex(r => r.id == newResource.id);

      if (index !== -1) {
        collection.splice(index, 1, newResource);
      } else {
        collection.push(newResource);
      }
    }

    ctx.body = Array.isArray(ctx.request.body) ? newResources : newResources[0];

    await next()
  }

  // DELETE /name/:id
  async function destroy(ctx, next) {
    let resource = db.getById(name, id);

    if (!resource) {
      ctx.throw(404, "No such item");
    }

    collection.splice(collection.indexOf(resource), 1);

    ctx.body = {};
    await next();
  }

};
