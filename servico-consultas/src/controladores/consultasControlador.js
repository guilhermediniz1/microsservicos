const Consulta = require('../modelos/Consulta');

const listar = async (req, res) => {
  const { id, tipo } = req.usuario;
  const filtros = {};

  if (tipo === 'paciente') {
    filtros.paciente_id = id;
  } else if (tipo === 'medico') {
    filtros.medico_id = id;
  } else if (tipo === 'admin') {
    const { status, medico_id, paciente_id } = req.query;
    if (status) filtros.status = status;
    if (medico_id) filtros.medico_id = medico_id;
    if (paciente_id) filtros.paciente_id = paciente_id;
  }

  try {
    const consultas = await Consulta.findAll({ where: filtros });
    return res.status(200).json(consultas);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao listar consultas' });
  }
};

const buscarPorId = async (req, res) => {
  const { id: usuarioId, tipo } = req.usuario;
  try {
    const consulta = await Consulta.findByPk(req.params.id);
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada' });

    if (tipo === 'paciente' && consulta.paciente_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });
    if (tipo === 'medico' && consulta.medico_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    return res.status(200).json(consulta);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao buscar consulta' });
  }
};

const criar = async (req, res) => {
  const { id: usuarioId, tipo } = req.usuario;
  const { paciente_id, medico_id, data_consulta, descricao } = req.body;

  if (!paciente_id || !medico_id || !data_consulta)
    return res.status(400).json({ erro: 'Campos obrigatórios: paciente_id, medico_id, data_consulta' });

  if (tipo === 'paciente' && paciente_id !== usuarioId)
    return res.status(403).json({ erro: 'Paciente só pode criar consulta para si mesmo' });
  if (tipo === 'medico' && medico_id !== usuarioId)
    return res.status(403).json({ erro: 'Médico só pode criar consulta para si mesmo' });

  try {
    const consulta = await Consulta.create({ paciente_id, medico_id, data_consulta, descricao });
    return res.status(201).json(consulta);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao criar consulta' });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  const { id: usuarioId, tipo } = req.usuario;
  const { data_consulta, descricao, diagnostico, status } = req.body;

  const statusValidos = ['agendada', 'realizada', 'cancelada'];
  if (status && !statusValidos.includes(status))
    return res.status(400).json({ erro: 'Status inválido. Use: agendada, realizada ou cancelada' });

  try {
    const consulta = await Consulta.findByPk(id);
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada' });

    if (tipo === 'paciente' && consulta.paciente_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });
    if (tipo === 'medico' && consulta.medico_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    await consulta.update({ data_consulta, descricao, diagnostico, status, atualizado_em: new Date() });
    return res.status(200).json(consulta);
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao atualizar consulta' });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  const { id: usuarioId, tipo } = req.usuario;

  try {
    const consulta = await Consulta.findByPk(id);
    if (!consulta) return res.status(404).json({ erro: 'Consulta não encontrada' });

    if (tipo === 'paciente' && consulta.paciente_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });
    if (tipo === 'medico' && consulta.medico_id !== usuarioId)
      return res.status(403).json({ erro: 'Acesso negado' });

    await consulta.destroy();
    return res.status(204).send();
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro interno ao remover consulta' });
  }
};

module.exports = { listar, buscarPorId, criar, atualizar, remover };
