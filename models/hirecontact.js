import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class HireContact extends Model {
    static associate(models) {
      // define association here
    }
  }
  HireContact.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    organizationName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    emailAddress: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'HireContact',
  });
  return HireContact;
};