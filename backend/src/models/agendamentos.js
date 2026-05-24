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
        },
        observacoes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Nova coluna para vincular o agendamento ao evento do Google Agenda
        google_event_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'Agendamentos',
        timestamps: false,
    });

    Agendamentos.associate = (models) => {
        Agendamentos.belongsTo(models.Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
        Agendamentos.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
        Agendamentos.hasMany(models.Relatorios, { foreignKey: 'id_agendamento', as: 'relatorios' });
    };

    return Agendamentos;
};