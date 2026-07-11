'use strict';
/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('campaigns', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
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
  await queryInterface.dropTable('campaigns');
}
