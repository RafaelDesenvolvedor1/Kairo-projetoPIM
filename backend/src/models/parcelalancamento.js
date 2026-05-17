const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Parcelalancamento = app.db.define('Parcelalancamento', {
        id_parcela: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_lancamento: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        numero_parcela: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
        },
        data_vencimento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        valor_parcela: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pendente', 'Pago', 'Atrasado', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Pendente',
        },
        data_pagamento: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
    }, {
        tableName: 'parcelas_lancamentos',
        timestamps: false,
    });

    Parcelalancamento.associate = (models) => {
        const LancamentoObj = models.financeiro || models.lancamento || models.Lancamento;
        if (LancamentoObj) {
            Parcelalancamento.belongsTo(LancamentoObj, { foreignKey: 'id_lancamento', as: 'lancamento' });
        }
    };

    return Parcelalancamento;
};