const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Equipe = app.db.define('Equipe', {
        id_equipe: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        id_usuario: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        cargo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        especialidade: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        data_entrada: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
    }, {
        tableName: 'Equipe',
        timestamps: false,
    });

    Equipe.associate = (models) => {
        Equipe.belongsTo(models.User, { foreignKey: 'id_usuario', as: 'usuario' });
    };

    return Equipe;
};