const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../config/banco', () => ({
  define: jest.fn(() => ({})),
  sync: jest.fn().mockResolvedValue(true),
  authenticate: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/modelos/Consulta', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

process.env.JWT_SEGREDO = 'segredo-teste';
process.env.PORTA = '3003';

const app = require('../src/app');
const Consulta = require('../src/modelos/Consulta');

const gerarToken = () => jwt.sign({ id: 1, tipo: 'medico' }, 'segredo-teste', { expiresIn: '1h' });

const consultaMock = {
  id: 1,
  paciente_id: 2,
  medico_id: 1,
  data_consulta: '2025-06-15T10:00:00.000Z',
  descricao: 'Dor de cabeça persistente',
  diagnostico: null,
  status: 'agendada',
  criado_em: '2025-06-01T08:00:00.000Z',
  atualizado_em: null
};

describe('Serviço de Consultas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /consultas', () => {
    it('deve agendar nova consulta e retornar 201', async () => {
      Consulta.create.mockResolvedValueOnce(consultaMock);

      const resposta = await request(app)
        .post('/consultas')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({
          paciente_id: 2,
          medico_id: 1,
          data_consulta: '2025-06-15T10:00:00.000Z',
          descricao: 'Dor de cabeça persistente'
        });

      expect(resposta.status).toBe(201);
      expect(resposta.body).toHaveProperty('id');
      expect(resposta.body.status).toBe('agendada');
    });

    it('deve retornar 400 quando campos obrigatórios estão ausentes', async () => {
      const resposta = await request(app)
        .post('/consultas')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ descricao: 'Consulta incompleta' });

      expect(resposta.status).toBe(400);
    });

    it('deve retornar 401 sem token de autenticação', async () => {
      const resposta = await request(app)
        .post('/consultas')
        .send({ paciente_id: 2, medico_id: 1, data_consulta: '2025-06-15T10:00:00.000Z' });

      expect(resposta.status).toBe(401);
    });
  });

  describe('GET /consultas', () => {
    it('deve retornar array de consultas', async () => {
      Consulta.findAll.mockResolvedValueOnce([consultaMock]);

      const resposta = await request(app)
        .get('/consultas')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(200);
      expect(Array.isArray(resposta.body)).toBe(true);
      expect(resposta.body.length).toBe(1);
    });

    it('deve filtrar consultas por status', async () => {
      Consulta.findAll.mockResolvedValueOnce([consultaMock]);

      const resposta = await request(app)
        .get('/consultas?status=agendada')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(200);
      expect(Consulta.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'agendada' }) })
      );
    });

    it('deve retornar 401 sem token', async () => {
      const resposta = await request(app).get('/consultas');
      expect(resposta.status).toBe(401);
    });
  });

  describe('GET /consultas/:id', () => {
    it('deve retornar consulta existente', async () => {
      Consulta.findByPk.mockResolvedValueOnce(consultaMock);

      const resposta = await request(app)
        .get('/consultas/1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(200);
      expect(resposta.body.id).toBe(1);
    });

    it('deve retornar 404 quando consulta não existe', async () => {
      Consulta.findByPk.mockResolvedValueOnce(null);

      const resposta = await request(app)
        .get('/consultas/999')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(404);
    });
  });

  describe('PUT /consultas/:id', () => {
    it('deve atualizar status para realizada', async () => {
      const consultaAtualizada = { ...consultaMock, status: 'realizada', diagnostico: 'Enxaqueca' };
      Consulta.update.mockResolvedValueOnce([1]);
      Consulta.findByPk.mockResolvedValueOnce(consultaAtualizada);

      const resposta = await request(app)
        .put('/consultas/1')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ status: 'realizada', diagnostico: 'Enxaqueca' });

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe('realizada');
      expect(resposta.body.diagnostico).toBe('Enxaqueca');
    });

    it('deve retornar 400 com status inválido', async () => {
      const resposta = await request(app)
        .put('/consultas/1')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ status: 'invalido' });

      expect(resposta.status).toBe(400);
    });

    it('deve retornar 404 quando consulta não existe', async () => {
      Consulta.update.mockResolvedValueOnce([0]);

      const resposta = await request(app)
        .put('/consultas/999')
        .set('Authorization', `Bearer ${gerarToken()}`)
        .send({ status: 'cancelada' });

      expect(resposta.status).toBe(404);
    });
  });

  describe('DELETE /consultas/:id', () => {
    it('deve remover consulta e retornar 204', async () => {
      Consulta.destroy.mockResolvedValueOnce(1);

      const resposta = await request(app)
        .delete('/consultas/1')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(204);
    });

    it('deve retornar 404 quando consulta não existe', async () => {
      Consulta.destroy.mockResolvedValueOnce(0);

      const resposta = await request(app)
        .delete('/consultas/999')
        .set('Authorization', `Bearer ${gerarToken()}`);

      expect(resposta.status).toBe(404);
    });
  });
});
