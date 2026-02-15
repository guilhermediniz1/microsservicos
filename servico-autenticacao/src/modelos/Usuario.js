const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../../config/banco');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('medico', 'paciente', 'admin'),
    allowNull: false
  },
  criado_em: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

Usuario.beforeCreate(async (usuario) => {
  const saltRounds = 12;
  usuario.senha_hash = await bcrypt.hash(usuario.senha_hash, saltRounds);
});

module.exports = Usuario;
