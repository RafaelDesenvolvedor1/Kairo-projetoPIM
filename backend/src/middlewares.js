const bodyParser = require("body-parser");
const cors = require('cors');

module.exports = (app) => {
  app.set("port", process.env.PORT || 3000);
  app.set("json spaces", 4);
  app.use(bodyParser.json());
  app.use(cors({
    origin: 'http://localhost:5173'
  }))
  // Middleware para remover o id do body
  app.use((req, res, next) => {
    if (req.body && req.body.id) {
      delete req.body.id;
    }
    next();
  });
};
