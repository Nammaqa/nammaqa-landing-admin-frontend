'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class NConnect extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  NConnect.init({
    imageurl: DataTypes.STRING,
    meeting_type: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    start_time: DataTypes.TIME,
    end_time: DataTypes.TIME,
    address: DataTypes.STRING,
    participants: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    link: DataTypes.STRING,
    mode: {
      type: DataTypes.ENUM('online', 'offline', 'hybrid'),
      allowNull: false,
      defaultValue: 'offline',
      validate: {
        isValidModeForType(value) {
          if (value === 'hybrid' && this.meeting_type !== 'workshop') {
            throw new Error('Hybrid mode is only allowed for workshops');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'NConnect',
    tableName: 'nconnect',
  });
  return NConnect;
};
