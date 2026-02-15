const Usuario = require('../modelos/Usuario');

const criar = async (req, res) => {
  const { id, nome, email, tipo } = req.body;
  if (!id || !nome || !email || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: id, nome, email, tipo' });
  }
  try {
    const usuario = await Usuario.create({ id, nome, email, tipo });
    return res.status(201).json(usuario);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao criar usuário' });
  }
};

const listar = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    return res.status(200).json(usuarios);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao listar usuários' });
  }
};

const buscarPorId = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao buscar usuário' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, email, tipo } = req.body;

  try {
    const [linhasAfetadas] = await Usuario.update(
      { nome, email, tipo },
      { where: { id } }
    );

    if (linhasAfetadas === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    const usuarioAtualizado = await Usuario.findByPk(id);

    return res.status(200).json(usuarioAtualizado);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao atualizar usuário' });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;

  try {
    const linhasAfetadas = await Usuario.destroy({ where: { id } });

    if (linhasAfetadas === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    return res.status(204).send();
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao remover usuário' });
  }
};

module.exports = { criar, listar, buscarPorId, atualizar, remover };
