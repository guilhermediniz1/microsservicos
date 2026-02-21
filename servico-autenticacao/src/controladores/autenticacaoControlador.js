const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Usuario = require('../modelos/Usuario');

const registrar = async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, email, senha, tipo' });
  }

  const tiposValidos = ['medico', 'paciente', 'admin'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo inválido. Use: `medico`, `paciente` ou `admin`' });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const usuario = await Usuario.create({ email, senha_hash: senha, tipo });

    try {
      await axios.post(
        `${process.env.USUARIOS_SERVICO_URL}/usuarios/interno`,
        { id: usuario.id, nome, email, tipo },
        { headers: { 'x-chave-interna': process.env.CHAVE_INTERNA_SERVICO } }
      );
    } catch (erroServico) {
      await usuario.destroy();
      return res.status(500).json({ erro: 'Erro ao criar perfil do usuário' });
    }

    return res.status(201).json({
      id: usuario.id,
      nome,
      email: usuario.email,
      tipo: usuario.tipo
    });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao registrar usuário' });
  }
};

const entrar = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios: email, senha' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SEGREDO,
      { expiresIn: '8h' }
    );

    return res.status(200).json({ token });
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao autenticar usuário' });
  }
};

module.exports = { registrar, entrar };
