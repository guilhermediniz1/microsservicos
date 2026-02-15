const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NOME,
  process.env.DB_USUARIO,
  process.env.DB_SENHA,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORTA || 3306,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;
