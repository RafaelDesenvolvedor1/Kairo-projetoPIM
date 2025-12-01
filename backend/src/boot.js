module.exports = (app) => {
  async function start(port) {
    try {
      try {
        await app.db.authenticate();
        await app.db.sync();
        console.log("Conexão com banco de dados estabelecida com sucesso!");
      } catch (err) {
        console.log("Erro na conexão com o banco de dados!");
        console.error(err)
      }
      app.listen(port, () => {
        console.log(`Aplicação rodando na porta ${port}`);
      });
    } catch (err) {
      console.log("Erro de conexão");
      console.error(err);
    }
  }

  start(app.get("port"));
};
