"use strict";
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    // Remove 'topic' column from ContactMessage
    await queryInterface.removeColumn('ContactMessage', 'topic');
}
export async function down(queryInterface, Sequelize) {
    // Recreate 'topic' column if rolling back
    await queryInterface.addColumn('ContactMessage', 'topic', {
      allowNull: false,
      type: Sequelize.STRING,
    });
}

