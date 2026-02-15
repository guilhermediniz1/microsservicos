const verificarChaveInterna = (req, res, next) => {
  const chave = req.headers['x-chave-interna'];
  if (!chave || chave !== process.env.CHAVE_INTERNA_SERVICO) {
    return res.status(403).json({ erro: 'Acesso interno não autorizado' });
  }
  next();
};

module.exports = verificarChaveInterna;
