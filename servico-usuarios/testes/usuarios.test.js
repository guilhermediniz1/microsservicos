const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/banco', () => ({
  define: jest.fn(() => ({})),
  sync: jest.fn().mockResolvedValue(true),
  authenticate: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/modelos/Usuario', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

process.env.JWT_SEGREDO = 'segredo-teste';
process.env.PORTA = '3002';

const app = require('../src/app');
const Usuario = require('../src/modelos/Usuario');

const gerarToken = (tipo = 'admin') => jwt.sign({ id: 1, tipo }, 'segredo-teste', { expiresIn: '1h' });

describe('Serviço de Usuários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /usuarios', () => {
    it('deve listar todos os usuários', async () => {
      Usuario.findAll.mockResolvedValueOnce([
        { id: 1, nome: 'Dr. Silva', email: 'dr@ufes.br', tipo: 'medico' },
        { id: 2, nome: 'João', email: 'joao@email.com', tipo: 'paciente' }
      ]);

      const resposta = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(200);
      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body.length).toBe(2);
    });

    it('deve retornar 401 sem token', async () => {
      const resposta = await request(app).get('/usuarios');
      expect(resposta.status).toBe(401);
    });

    it('deve retornar 403 para usuário não-admin', async () => {
      const resposta = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${gerarToken('paciente')}`);
      expect(resposta.status).toBe(403);
    });
  });

  describe('GET /usuarios/:id', () => {
    it('deve retornar usuário por ID', async () => {
      Usuario.findByPk.mockResolvedValueOnce({
        id: 1, nome: 'Dr. Silva', email: 'dr@ufes.br', tipo: 'medico'
      });

      const resposta = await request(app)
        .get('/usuarios/1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body.id).toBe(1);
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      Usuario.findByPk.mockResolvedValueOnce(null);

      const resposta = await request(app)
        .get('/usuarios/999')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(404);
    });
  });

  describe('PUT /usuarios/:id', () => {
    it('deve atualizar dados do usuário', async () => {
      Usuario.update.mockResolvedValueOnce([1]);
      Usuario.findByPk.mockResolvedValueOnce({
        id: 1, nome: 'Dr. Silva Atualizado', email: 'dr@ufes.br', tipo: 'medico'
      });

      const resposta = await request(app)
        .put('/usuarios/1')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Dr. Silva Atualizado' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.nome).toBe('Dr. Silva Atualizado');
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      Usuario.update.mockResolvedValueOnce([0]);

      const resposta = await request(app)
        .put('/usuarios/999')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ nome: 'Inexistente' });

      expect(resposta.status).toBe(404);
    });
  });

  describe('DELETE /usuarios/:id', () => {
    it('deve remover usuário e retornar 204', async () => {
      Usuario.destroy.mockResolvedValueOnce(1);

      const resposta = await request(app)
        .delete('/usuarios/1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(204);
    });

    it('deve retornar 404 quando usuário não existe', async () => {
      Usuario.destroy.mockResolvedValueOnce(0);

      const resposta = await request(app)
        .delete('/usuarios/999')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(404);
    });
  });
});
