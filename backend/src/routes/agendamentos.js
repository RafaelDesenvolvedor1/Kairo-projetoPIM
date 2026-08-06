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

    // Listar agendamentos do dia de hoje
    app
        .route('/agendamentos/hoje')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.listToday(req, res);
        });

    // Contagem de agendamentos do mês corrente
    app
        .route('/agendamentos/indicadores/mes-corrente')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.countSchedulesMonthCurrent(req, res);
        });

    // Contagem de agendamentos do mês anterior
    app
        .route('/agendamentos/indicadores/mes-anterior')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.countSchedulesMonthPrevious(req, res);
        });

    // Listar agendamentos por paciente
    app
        .route('/agendamentos/paciente/:id_paciente')
        .all(app.auth.authenticate())
        .get(async (req, res) => {
            await agendamentoController.listByPaciente(req, res);
        });

    // Operações com agendamento específico (GET, PUT, DELETE por ID)
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
};