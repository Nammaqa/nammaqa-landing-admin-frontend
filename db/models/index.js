'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];

let pg;
try {
  pg = require('pg');
} catch (err) {
  throw new Error('Please install the `pg` package: npm install pg');
}
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialectModule: pg
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectModule: pg
  });
}

const UserModel = require('./user')(sequelize, Sequelize.DataTypes);
const NConnectModel = require('./nconnect')(sequelize, Sequelize.DataTypes);
const BlogModel = require('./blog')(sequelize, Sequelize.DataTypes);
const SuccessStoryModel = require('./successstory')(sequelize, Sequelize.DataTypes);
const GalleryModel = require('./gallery')(sequelize, Sequelize.DataTypes);

db[UserModel.name] = UserModel;
db[NConnectModel.name] = NConnectModel;
db[BlogModel.name] = BlogModel;
db[SuccessStoryModel.name] = SuccessStoryModel;
db[GalleryModel.name] = GalleryModel;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize =  Sequelize;
module.exports = db;

