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
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    otpverified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
