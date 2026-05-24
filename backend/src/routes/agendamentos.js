module.exports = (app) => {
    const agendamentoController = app.controllers.agendamentoController;

    // Listar todos e criar novo agendamento
    app
        .route('/agendamentos')
        .all(app.auth.authenticate())
        .post(async (req, res) => {
            await agendamentoController.create(req, res);
        })
        .get(async (req, res) => {
            await agendamentoController.listAll(req, res);
        });

    // NOVA ROTA: Listar agendamentos específicos do dia de hoje
    app
        .route('/agendamentos/hoje')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.listToday(req, res);
        });

    // Operações com agendamento específico (GET, PUT, DELETE)
    app
        .route('/agendamentos/:id')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.getById(req, res);
        })
        .put(async (req, res) => {
            await agendamentoController.update(req, res);
        })
        .delete(async (req, res) => {
            await agendamentoController.delete(req, res);
        });

    // Listar agendamentos por paciente
    app
        .route('/agendamentos/paciente/:id_paciente')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.listByPaciente(req, res);
        });
};