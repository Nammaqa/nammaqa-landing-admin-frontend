"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove 'topic' column from ContactMessage
    await queryInterface.removeColumn('ContactMessage', 'topic');
  },

  async down(queryInterface, Sequelize) {
    // Recreate 'topic' column if rolling back
    await queryInterface.addColumn('ContactMessage', 'topic', {
      allowNull: false,
      type: Sequelize.STRING,
    });
  },
};
