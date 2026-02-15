require('dotenv').config();
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const consultasRotas = require('./rotas/consultasRotas');
const sequelize = require('../config/banco');

const app = express();
app.use(express.json());

const swaggerOpcoes = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Serviço de Consultas',
      version: '1.0.0',
      description: 'API de CRUD de consultas médicas'
    },
    servers: [{ url: `http://localhost:${process.env.PORTA || 3003}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [`${__dirname}/rotas/*.js`]
};

const especificacaoSwagger = swaggerJsdoc(swaggerOpcoes);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(especificacaoSwagger));

app.use('/consultas', consultasRotas);

const porta = process.env.PORTA || 3003;

if (require.main === module) {
  sequelize.sync({ alter: false })
    .then(() => {
      app.listen(porta, () => {
        // eslint-disable-next-line no-console
        console.log(`Serviço de consultas rodando na porta ${porta}`);
      });
    })
    .catch((erro) => {
      // eslint-disable-next-line no-console
      console.error('Erro ao conectar ao banco:', erro);
      process.exit(1);
    });
}

module.exports = app;
