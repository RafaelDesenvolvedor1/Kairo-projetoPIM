const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Relatorios = app.db.define('Relatorios', {
        id_relatorio: {
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
        // MUDANÇA: Opcional (allowNull: true), permite criar Laudos/Atestados sem um agendamento vinculado
        id_agendamento: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        data_criacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        conteudo: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        tipo: {
            type: DataTypes.ENUM('sessao', 'laudo', 'atestado', 'encaminhamento'),
            allowNull: false,
            defaultValue: 'sessao',
        },
    }, {
        tableName: 'Relatorios',
        timestamps: false,
    });

    Relatorios.associate = (models) => {
        Relatorios.belongsTo(models.Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
        Relatorios.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
        Relatorios.belongsTo(models.Agendamentos, { foreignKey: 'id_agendamento', as: 'agendamento' });
        Relatorios.hasMany(models.Anexos, { foreignKey: 'id_relatorio', as: 'anexos' });
    };

    return Relatorios;
};