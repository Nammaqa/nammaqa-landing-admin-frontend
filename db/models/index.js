'use strict';

import Sequelize from 'sequelize';
import configLoader from '../config/config.js';
import UserFactory from './user.js';
import NConnectFactory from './nconnect.js';
import BlogFactory from './blog.js';
import SuccessStoryFactory from './successstory.js';
import GalleryFactory from './gallery.js';
import NewsletterSubscriptionFactory from './newslettersubscription.js';
import ContactMessageFactory from './contactmessage.js';

const env = process.env.NODE_ENV || 'development';
const config = configLoader[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    dialectModule: config.dialectModule
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialectModule: config.dialectModule
  });
}

const UserModel = UserFactory(sequelize, Sequelize.DataTypes);
const NConnectModel = NConnectFactory(sequelize, Sequelize.DataTypes);
const BlogModel = BlogFactory(sequelize, Sequelize.DataTypes);
const SuccessStoryModel = SuccessStoryFactory(sequelize, Sequelize.DataTypes);
const GalleryModel = GalleryFactory(sequelize, Sequelize.DataTypes);
const NewsletterSubscriptionModel = NewsletterSubscriptionFactory(sequelize, Sequelize.DataTypes);
const ContactMessageModel = ContactMessageFactory(sequelize, Sequelize.DataTypes);

db[UserModel.name] = UserModel;
db[NConnectModel.name] = NConnectModel;
db[BlogModel.name] = BlogModel;
db[SuccessStoryModel.name] = SuccessStoryModel;
db[GalleryModel.name] = GalleryModel;
db[NewsletterSubscriptionModel.name] = NewsletterSubscriptionModel;
db[ContactMessageModel.name] = ContactMessageModel;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
