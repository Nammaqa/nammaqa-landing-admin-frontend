'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.renameColumn('success_stories', 'placed_company', 'college_name');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.renameColumn('success_stories', 'college_name', 'placed_company');
}
