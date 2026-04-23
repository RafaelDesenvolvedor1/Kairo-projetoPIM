const bodyParser = require("body-parser");
const cors = require('cors');

module.exports = (app) => {
  app.set("port", process.env.PORT || 3000);
  app.set("json spaces", 4);
  app.use(bodyParser.json());
  app.use(cors({
      origin: '*', // Permite requisições de qualquer lugar (Windows, Linux, Celular)
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
  }));
  // Middleware para remover o id do body
  app.use((req, res, next) => {
    if (req.body && req.body.id) {
      delete req.body.id;
    }
    next();
  });
};
