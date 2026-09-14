const { DataTypes } = require('sequelize');

module.exports = (app) => {
  const Locais = app.db.define('Locais', {
    id_local: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_endereco: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Locais_Enderecos',
        key: 'id_endereco',
      },
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_video: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'Locais',
    timestamps: false,
  });

  return Locais;
};