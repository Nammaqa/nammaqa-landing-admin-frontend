'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Gallery.init({
    image_url: DataTypes.STRING,
    image_title: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    description: DataTypes.TEXT,
    hashtags: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Gallery',
    tableName: 'gallery',
  });
  return Gallery;
};