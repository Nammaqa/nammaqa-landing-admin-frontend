'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('gallery', 'date', {
    type: Sequelize.DATEONLY,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('gallery', 'date');
}
