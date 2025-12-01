module.exports = {
  db: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    params: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mysql",
      define: {
        underscored: true,
      },
    },
  },
};
