'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('success_stories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      student_name: {
        type: Sequelize.STRING
      },
      student_image: {
        type: Sequelize.STRING
      },
      student_type: {
        type: Sequelize.STRING
      },
      placed_company: {
        type: Sequelize.STRING
      },
      feedback: {
        type: Sequelize.TEXT
      },
      student_package: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('success_stories');
  }
};