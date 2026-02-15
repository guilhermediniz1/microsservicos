const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const { listar, buscarPorId, criar, atualizar, remover } = require('../controladores/consultasControlador');

/**
 * @swagger
 * /consultas:
 *   get:
 *     summary: Lista consultas com filtros opcionais
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [agendada, realizada, cancelada]
 *       - in: query
 *         name: medico_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: paciente_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de consultas
 *       401:
 *         description: Não autorizado
 */
router.get('/', verificarToken, listar);

/**
 * @swagger
 * /consultas/{id}:
 *   get:
 *     summary: Retorna consulta por ID
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados da consulta
 *       404:
 *         description: Consulta não encontrada
 */
router.get('/:id', verificarToken, buscarPorId);

/**
 * @swagger
 * /consultas:
 *   post:
 *     summary: Agenda uma nova consulta
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paciente_id, medico_id, data_consulta]
 *             properties:
 *               paciente_id:
 *                 type: integer
 *               medico_id:
 *                 type: integer
 *               data_consulta:
 *                 type: string
 *                 format: date-time
 *               descricao:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consulta agendada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', verificarToken, criar);

/**
 * @swagger
 * /consultas/{id}:
 *   put:
 *     summary: Atualiza uma consulta existente
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data_consulta:
 *                 type: string
 *                 format: date-time
 *               descricao:
 *                 type: string
 *               diagnostico:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [agendada, realizada, cancelada]
 *     responses:
 *       200:
 *         description: Consulta atualizada
 *       404:
 *         description: Consulta não encontrada
 */
router.put('/:id', verificarToken, atualizar);

/**
 * @swagger
 * /consultas/{id}:
 *   delete:
 *     summary: Cancela/remove uma consulta
 *     tags: [Consultas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Consulta removida
 *       404:
 *         description: Consulta não encontrada
 */
router.delete('/:id', verificarToken, remover);

module.exports = router;
