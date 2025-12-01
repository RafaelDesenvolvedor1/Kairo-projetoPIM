const bodyParser = require("body-parser");

module.exports = (app) => {
  app.set("port", process.env.PORT || 3000);
  app.set("json spaces", 4);
  app.use(bodyParser.json());
  // Middleware para remover o id do body
  app.use((req, res, next) => {
    if (req.body && req.body.id) {
      delete req.body.id;
    }
    next();
  });
};
