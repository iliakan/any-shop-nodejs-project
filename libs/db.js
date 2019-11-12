const path = require('path');
const fs = require('fs');
const Ajv = require('ajv');

module.exports = class Db {

  constructor(filePath, schemasPath) {
    this.filePath = filePath;
    let schemas = require(schemasPath);
    this.ajv = new Ajv({
      schemas,
      allErrors: true,
      // verbose: true
    });

    this.load();
  }

  getAll() {
    return this.data;
  }

  get(key) {
    return this.data[key];
  }

  getById(collection, id) {
    collection = this.data[collection];
    if (Array.isArray(collection)) {
      return collection.find(item => item.id == id);
    }
  }

  set(key, value) {
    this.data[key] = value;
  }

  update(key, value) {
    Object.assign(this.data[key], value);
  }

  load() {
    this.data = this.deserialize(fs.readFileSync(this.filePath, 'utf-8'));
  }

  save() {
    fs.writeFileSync(this.filePath, this.serialize(this.data));
  }

  deserialize(json) {
    return JSON.parse(json, (key, value) => {
      if (key === 'createdAt' || key === 'modifiedAt') {
        return new Date(value);
      } else {
        return value;
      }
    });
  }

  serialize(json) {
    return JSON.stringify(json, null, 2);
  }

  // product/db/...
  getValidate(name) {
    return this.ajv.getSchema(`https://javascript.info/schemas/${name}.json`);
  }

};

