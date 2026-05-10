const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Financeiro = app.db.define('Financeiro', {
        id_lancamento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM('receita', 'despesa'),
            allowNull: false,
        },
        descricao: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        data_lancamento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    }, {
        tableName: 'Financeiro',
        timestamps: false,
    });

    Financeiro.associate = (models) => {
        Financeiro.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
    };

    return Financeiro;
};