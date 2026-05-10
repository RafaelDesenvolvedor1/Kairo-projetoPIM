const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Anexos = app.db.define('Anexos', {
        id_anexo: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_relatorio: {
            type: DataTypes.INTEGER,
            allowNull: true, // "opcional" conforme diagrama
        },
        id_ficha: {
            type: DataTypes.INTEGER,
            allowNull: true, // "opcional" conforme diagrama
        },
        nome_arquivo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        caminho_arquivo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tipo_arquivo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        data_upload: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'Anexos',
        timestamps: false,
    });

    Anexos.associate = (models) => {
        Anexos.belongsTo(models.Relatorios, { foreignKey: 'id_relatorio', as: 'relatorio' });
        Anexos.belongsTo(models.Fichas_Clinicas, { foreignKey: 'id_ficha', as: 'ficha_clinica' });
    };

    return Anexos;
};