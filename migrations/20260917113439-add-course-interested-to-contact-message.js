'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const table = await queryInterface.describeTable('ContactMessage');
  if (!table.course_interested) {
    await queryInterface.addColumn('ContactMessage', 'course_interested', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('ContactMessage', 'course_interested');
}
