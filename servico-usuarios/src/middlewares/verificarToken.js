const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const dados = jwt.verify(token, process.env.JWT_SEGREDO);
    req.usuario = dados;
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
};

module.exports = verificarToken;
