'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`ALTER TYPE "enum_nconnect_mode" ADD VALUE IF NOT EXISTS 'hybrid';`);
}

export async function down(queryInterface, Sequelize) {
  // PostgreSQL does not support removing values from an ENUM type without recreating the type
}
