"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ContactMessage', 'topic', {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue: 'General inquiry',
    });
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ContactMessage', 'topic');
}

