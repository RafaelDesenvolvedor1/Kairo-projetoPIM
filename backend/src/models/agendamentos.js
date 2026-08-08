const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Agendamentos = app.db.define('Agendamentos', {
        id_agendamento: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_paciente: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_local: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        id_servico: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        data_hora_inicio: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        data_hora_fim: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('agendado', 'concluido', 'cancelado'),
            allowNull: false,
            defaultValue: 'agendado',
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        google_event_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'Agendamentos',
        timestamps: false,
    });

    Agendamentos.associate = (models) => {
        Agendamentos.belongsTo(models.Pacientes || models.pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
        Agendamentos.belongsTo(models.Users || models.users || models.User, { foreignKey: 'id_usuario', as: 'usuario' });
        Agendamentos.belongsTo(models.Locais || models.locais, { foreignKey: 'id_local', as: 'local' });
        Agendamentos.belongsTo(models.Servicos || models.servicos, { foreignKey: 'id_servico', as: 'servico' });
        Agendamentos.hasOne(models.Relatorios || models.relatorios, { foreignKey: 'id_agendamento', as: 'relatorio' });
    };

    return Agendamentos;
};