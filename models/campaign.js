'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Campaign extends Model {
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Campaign',
    tableName: 'campaigns',
  });
  return Campaign;
};
