module.exports = (app) => {
  // Carrega o controller gerenciado pelo Consign
  const controller = app.controllers.relatoriosController || app.controllers.relatorios;

  /**
   * Rotas para manipulação e busca do Prontuário/Timeline do Paciente
   */
  app
    .route('/pacientes/:id_paciente/prontuario')
    .all(app.auth.authenticate())
    .get(controller.getProntuarioPaciente);

  app
    .route('/relatorios')
    .all(app.auth.authenticate())
    .post(controller.create);

  app
    .route('/relatorios/:id')
    .all(app.auth.authenticate())
    .put(controller.update)
    .delete(controller.delete);
};