import 'dotenv/config';
import pg from 'pg';
const ssl = {
  require: true,
  rejectUnauthorized: false,
};

const databaseConfig = {
  development: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: { ssl },
  },
  test: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectModule: pg,

    dialectOptions: { ssl },
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectModule: pg,

    dialectOptions: { ssl },
  },
};

export default databaseConfig;
