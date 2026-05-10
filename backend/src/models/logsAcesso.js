const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Logs_Acesso = app.db.define('Logs_Acesso', {
        id_log: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        acao: {
            type: DataTypes.ENUM('login', 'logout'),
            allowNull: false,
        },
        data_hora: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        ip_origem: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'Logs_Acesso',
        timestamps: false,
    });

    Logs_Acesso.associate = (models) => {
        Logs_Acesso.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
    };

    return Logs_Acesso;
};