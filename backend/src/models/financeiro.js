const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Lancamento = app.db.define('Lancamento', {
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
        id_paciente: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        tipo: {
            type: DataTypes.ENUM('RECEITA', 'DESPESA'),
            allowNull: false,
        },
        categoria: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: { notEmpty: true },
        },
        descricao: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        valor: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        forma_pagamento: {
            type: DataTypes.ENUM('À vista', 'Parcelado'),
            allowNull: false,
        },
        data_lancamento: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pendente', 'Pago', 'Cancelado'),
            allowNull: false,
            defaultValue: 'Pendente',
        },
        quantidade_parcelas: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: { min: 1 },
        },
    }, {
        tableName: 'lancamentos',
        timestamps: false,
    });

    Lancamento.associate = (models) => {
        // Fallbacks dinâmicos para prevenir erros de sincronia no Consign
        const UserObj = models.User || models.user || models.Usuarios || models.usuarios;
        const PacientesObj = models.pacientes || models.Pacientes || models.paciente || models.Paciente;
        const ParcelaObj = models.parcelalancamento || models.Parcelalancamento;

        if (UserObj) Lancamento.belongsTo(UserObj, { foreignKey: 'id_usuario', as: 'usuario' });
        if (PacientesObj) Lancamento.belongsTo(PacientesObj, { foreignKey: 'id_paciente', as: 'paciente' });
        if (ParcelaObj) Lancamento.hasMany(ParcelaObj, { foreignKey: 'id_lancamento', as: 'parcelas' });
    };

    return Lancamento;
};