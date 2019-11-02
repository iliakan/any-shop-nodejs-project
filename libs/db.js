const low = require('lowdb');
const config = require('../config');
const path = require('path');
const FileSync = require('lowdb/adapters/FileSync');

module.exports = low(new FileSync(path.resolve(config.projectRoot, 'data/db.json'), {
  deserialize: json => {
    const data = JSON.parse(json, (key, value) => {
      if (key === 'createdAt') {
        return new Date(value);
      } else {
        return value;
      }
    });
    return data;
  }
}));

