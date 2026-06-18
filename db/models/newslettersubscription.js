'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NewsletterSubscription extends Model {
    static associate(models) {
      // define association here
    }
  }

  NewsletterSubscription.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'NewsletterSubscription',
    tableName: 'NewsletterSubscription',
  });

  return NewsletterSubscription;
};
