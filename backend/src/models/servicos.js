const { DataTypes } = require('sequelize');

module.exports = (app) => {
  const Servicos = app.db.define('Servicos', {
    id_servico: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    modalidade: {
      type: DataTypes.ENUM('Presencial', 'Online', 'Híbrido'),
      allowNull: false,
      defaultValue: 'Presencial',
    },
    agendamento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, {
    tableName: 'Servicos',
    timestamps: false,
  });

  return Servicos;
};
