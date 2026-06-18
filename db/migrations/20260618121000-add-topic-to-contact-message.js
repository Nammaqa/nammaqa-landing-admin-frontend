"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ContactMessage', 'topic', {
      allowNull: false,
      type: Sequelize.STRING,
      defaultValue: 'General inquiry',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ContactMessage', 'topic');
  },
};
