'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('ContactMessage', 'contact_number', {
    allowNull: true,
    type: Sequelize.STRING,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('ContactMessage', 'contact_number');
}
