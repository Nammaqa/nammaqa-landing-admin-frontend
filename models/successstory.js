'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class SuccessStory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SuccessStory.init({
    student_name: DataTypes.STRING,
    student_image: DataTypes.STRING,
    student_type: DataTypes.STRING,
    college_name: DataTypes.STRING,
    feedback: DataTypes.TEXT,
    student_package: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SuccessStory',
    tableName: 'success_stories',
  });
  return SuccessStory;
};
