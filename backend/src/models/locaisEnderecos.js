const { DataTypes } = require('sequelize');

module.exports = (app) => {
  const LocaisEnderecos = app.db.define('Locais_Enderecos', {
    id_endereco: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    cep: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    logradouro: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    complemento: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    bairro: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cidade: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
  }, {
    tableName: 'Locais_Enderecos',
    timestamps: false,
  });

  return LocaisEnderecos;
};