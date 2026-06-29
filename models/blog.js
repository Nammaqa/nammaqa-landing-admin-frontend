'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Blog.init({
    blog_image: DataTypes.STRING,
    blog_type: DataTypes.STRING,
    blog_title: DataTypes.STRING,
    blog_description: DataTypes.TEXT,
    blog_link: DataTypes.STRING,
    is_highlight: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Blog',
    tableName: 'Blog',
  });
  return Blog;
};