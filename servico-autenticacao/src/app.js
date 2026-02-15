require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const autenticacaoRotas = require('./rotas/autenticacaoRotas');
const sequelize = require('../config/banco');

const app = express();
app.use(express.json());

const swaggerOpcoes = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Serviço de Autenticação',
      version: '1.0.0',
      description: 'API de autenticação para o sistema de consultas médicas'
    },
    servers: [{ url: `http://localhost:${process.env.PORTA || 3001}` }]
  },
  apis: [`${__dirname}/rotas/*.js`]
};

const especificacaoSwagger = swaggerJsdoc(swaggerOpcoes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(especificacaoSwagger));

app.use('/autenticacao', autenticacaoRotas);

const porta = process.env.PORTA || 3001;

if (require.main === module) {
  sequelize.sync({ alter: false })
    .then(() => {
      app.listen(porta, () => {
        // eslint-disable-next-line no-console
        console.log(`Serviço de autenticação rodando na porta ${porta}`);
      });
    })
    .catch((erro) => {
      // eslint-disable-next-line no-console
      console.error('Erro ao conectar ao banco:', erro);
      process.exit(1);
    });
}

module.exports = app;
