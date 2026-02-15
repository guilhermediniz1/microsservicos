const request = require('supertest');

jest.mock('../config/banco', () => {
  const SequelizeMock = {
    define: jest.fn(() => ({})),
    sync: jest.fn().mockResolvedValue(true),
    authenticate: jest.fn().mockResolvedValue(true)
  };
  return SequelizeMock;
});

jest.mock('../src/modelos/Usuario', () => {
  const usuarios = [];
  let proximoId = 1;

  return {
    findOne: jest.fn(({ where }) => {
      const usuario = usuarios.find(u => u.email === where.email);
      return Promise.resolve(usuario || null);
    }),
    create: jest.fn((dados) => {
      const bcrypt = require('bcryptjs');
      const senhaHash = bcrypt.hashSync(dados.senha_hash, 1);
      const novoUsuario = { ...dados, id: proximoId++, senha_hash: senhaHash };
      usuarios.push(novoUsuario);
      return Promise.resolve(novoUsuario);
    }),
    _limpar: () => { usuarios.length = 0; proximoId = 1; }
  };
});

process.env.JWT_SEGREDO = 'segredo-teste';
process.env.PORTA = '3001';

const app = require('../src/app');
const Usuario = require('../src/modelos/Usuario');

describe('Serviço de Autenticação', () => {
  beforeEach(() => {
    Usuario._limpar();
    jest.clearAllMocks();
  });

  describe('POST /autenticacao/registrar', () => {
    it('deve registrar um novo usuário e retornar 201', async () => {
      const resposta = await request(app)
        .post('/autenticacao/registrar')
        .send({ nome: 'Dr. Silva', email: 'dr@ufes.br', senha: 'Senha123', tipo: 'medico' });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toHaveProperty('id');
      expect(resposta.body.email).toBe('dr@ufes.br');
      expect(resposta.body).not.toHaveProperty('senha_hash');
    });

    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const resposta = await request(app)
        .post('/autenticacao/registrar')
        .send({ nome: 'Dr. Silva' });

      expect(resposta.status).toBe(400);
    });

    it('deve retornar 400 quando o tipo é inválido', async () => {
      const resposta = await request(app)
        .post('/autenticacao/registrar')
        .send({ nome: 'Dr. Silva', email: 'dr@ufes.br', senha: 'Senha123', tipo: 'invalido' });

      expect(resposta.status).toBe(400);
    });

    it('deve retornar 409 quando o email já está cadastrado', async () => {
      Usuario.findOne.mockResolvedValueOnce({ id: 1, email: 'dr@ufes.br' });

      const resposta = await request(app)
        .post('/autenticacao/registrar')
        .send({ nome: 'Dr. Silva', email: 'dr@ufes.br', senha: 'Senha123', tipo: 'medico' });

      expect(resposta.status).toBe(409);
    });
  });

  describe('POST /autenticacao/entrar', () => {
    it('deve retornar token JWT ao autenticar com credenciais válidas', async () => {
      const bcrypt = require('bcryptjs');
      const senhaHash = bcrypt.hashSync('Senha123', 1);

      Usuario.findOne.mockResolvedValueOnce({
        id: 1,
        email: 'dr@ufes.br',
        senha_hash: senhaHash,
        tipo: 'medico'
      });

      const resposta = await request(app)
        .post('/autenticacao/entrar')
        .send({ email: 'dr@ufes.br', senha: 'Senha123' });

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveProperty('token');
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      Usuario.findOne.mockResolvedValueOnce(null);

      const resposta = await request(app)
        .post('/autenticacao/entrar')
        .send({ email: 'inexistente@ufes.br', senha: 'Senha123' });

      expect(resposta.status).toBe(401);
    });

    it('deve retornar 401 com senha incorreta', async () => {
      const bcrypt = require('bcryptjs');
      const senhaHash = bcrypt.hashSync('SenhaCorreta', 1);

      Usuario.findOne.mockResolvedValueOnce({
        id: 1,
        email: 'dr@ufes.br',
        senha_hash: senhaHash,
        tipo: 'medico'
      });

      const resposta = await request(app)
        .post('/autenticacao/entrar')
        .send({ email: 'dr@ufes.br', senha: 'SenhaErrada' });

      expect(resposta.status).toBe(401);
    });

    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const resposta = await request(app)
        .post('/autenticacao/entrar')
        .send({ email: 'dr@ufes.br' });

      expect(resposta.status).toBe(400);
    });
  });
});
