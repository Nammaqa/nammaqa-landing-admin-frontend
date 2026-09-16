'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('nconnect', 'mode', {
    type: Sequelize.ENUM('online', 'offline'),
    allowNull: false,
    defaultValue: 'offline'
  });
}

/** @type {import('sequelize-cli').Migration} */
export async function down(queryInterface) {
  await queryInterface.removeColumn('nconnect', 'mode');
  await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_nconnect_mode";');
}
