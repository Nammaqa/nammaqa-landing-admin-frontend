'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
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
