const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Fichas_Clinicas = app.db.define('Fichas_Clinicas', {
        id_ficha: {
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
        data_preenchimento: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        dados_json: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    }, {
        tableName: 'Fichas_Clinicas',
        timestamps: false,
    });

    Fichas_Clinicas.associate = (models) => {
        Fichas_Clinicas.belongsTo(models.Pacientes, { foreignKey: 'id_paciente', as: 'paciente' });
        Fichas_Clinicas.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
        Fichas_Clinicas.hasMany(models.Anexos, { foreignKey: 'id_ficha', as: 'anexos' });
    };

    return Fichas_Clinicas;
};