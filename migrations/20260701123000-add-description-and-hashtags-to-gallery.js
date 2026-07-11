'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('gallery', 'description', {
    type: Sequelize.TEXT,
    allowNull: true,
  });

  await queryInterface.addColumn('gallery', 'hashtags', {
    type: Sequelize.STRING,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('gallery', 'hashtags');
  await queryInterface.removeColumn('gallery', 'description');
}
