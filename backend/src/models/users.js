const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');

module.exports = (app) => {
    const Users = app.db.define('User', {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        senha_hash: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        tipo_usuario: {
            type: DataTypes.ENUM('super_admin', 'admin', 'equipe', 'paciente'),
            allowNull: false,
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        data_criacao: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        ultimo_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'Usuarios',
        timestamps: false,
        hooks: {
            beforeCreate: async (user) => {
                if (user.senha_hash) {
                    const salt = await bcrypt.genSalt(10);
                    user.senha_hash = await bcrypt.hash(user.senha_hash, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('senha_hash')) {
                    const salt = await bcrypt.genSalt(10);
                    user.senha_hash = await bcrypt.hash(user.senha_hash, salt);
                }
            }
        }
    });

    Users.associate = (models) => {
        Users.hasMany(models.Logs_Acesso, { foreignKey: 'id_usuario', as: 'logs' });
        Users.hasMany(models.Financeiro, { foreignKey: 'id_usuario', as: 'financeiro' });
        Users.hasMany(models.Relatorios, { foreignKey: 'id_usuario', as: 'relatorios' });
        Users.hasMany(models.Fichas_Clinicas, { foreignKey: 'id_usuario', as: 'fichas_clinicas' });
        Users.hasMany(models.Agendamentos, { foreignKey: 'id_usuario', as: 'agendamentos' });
        
        Users.hasOne(models.Pacientes, { foreignKey: 'id_usuario', as: 'paciente_perfil' });
        Users.hasOne(models.Equipe, { foreignKey: 'id_usuario', as: 'equipe_perfil' });
    };

    return Users;
};