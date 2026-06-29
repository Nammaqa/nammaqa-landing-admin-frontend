'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('Blog', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      blog_image: {
        type: Sequelize.STRING
      },
      blog_type: {
        type: Sequelize.STRING
      },
      blog_title: {
        type: Sequelize.STRING
      },
      blog_description: {
        type: Sequelize.TEXT
      },
      blog_link: {
        type: Sequelize.STRING
      },
      is_highlight: {
        type: Sequelize.BOOLEAN
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
}
export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Blog');
  }

