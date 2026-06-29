'use strict';

import process from 'process';
import { Sequelize, DataTypes } from 'sequelize';

import configByEnv from '../config/config.js';
import BlogModel from './blog.js';
import ContactMessageModel from './contactmessage.js';
import GalleryModel from './gallery.js';
import NConnectModel from './nconnect.js';
import NewsletterSubscriptionModel from './newslettersubscription.js';
import SuccessStoryModel from './successstory.js';
import UserModel from './user.js';

const env = process.env.NODE_ENV || 'development';
const config = configByEnv[env];
const db = {};

if (!config) {
  throw new Error(`Missing Sequelize config for environment: ${env}`);
}

let sequelize;
if (config.use_env_variable) {
  const databaseUrl = process.env[config.use_env_variable];

  if (!databaseUrl) {
    throw new Error(`${config.use_env_variable} is not set. Check your .env file or command environment.`);
  }

  sequelize = new Sequelize(databaseUrl, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelDefinitions = [
  BlogModel,
  ContactMessageModel,
  GalleryModel,
  NConnectModel,
  NewsletterSubscriptionModel,
  SuccessStoryModel,
  UserModel,
];

modelDefinitions.forEach((defineModel) => {
  const model = defineModel(sequelize, DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
