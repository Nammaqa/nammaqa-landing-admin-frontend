'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('ContactMessage', 'otp', {
    allowNull: true,
    type: Sequelize.STRING,
  });

  await queryInterface.addColumn('ContactMessage', 'otpverified', {
    allowNull: false,
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('ContactMessage', 'otpverified');
  await queryInterface.removeColumn('ContactMessage', 'otp');
}
