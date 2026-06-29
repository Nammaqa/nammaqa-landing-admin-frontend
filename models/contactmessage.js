'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ContactMessage extends Model {
    static associate(models) {
      // define association here
    }
  }

  ContactMessage.init({
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ContactMessage',
    tableName: 'ContactMessage',
  });

  return ContactMessage;
};
