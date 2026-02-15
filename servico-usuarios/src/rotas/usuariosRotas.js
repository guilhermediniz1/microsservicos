const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/verificarToken');
const verificarChaveInterna = require('../middlewares/verificarChaveInterna');
const verificarAdmin = require('../middlewares/verificarAdmin');
const { criar, listar, buscarPorId, atualizar, remover } = require('../controladores/usuariosControlador');

router.post('/interno', verificarChaveInterna, criar);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso restrito a administradores
 */
router.get('/', verificarToken, verificarAdmin, listar);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Retorna usuário por ID
 *     tags: [Usuários]
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
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', verificarAdmin, buscarPorId);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza dados do usuário
 *     tags: [Usuários]
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
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               tipo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', verificarAdmin, atualizar);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Remove usuário
 *     tags: [Usuários]
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
 *         description: Usuário removido
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', verificarAdmin, remover);

module.exports = router;
