/**
 * Exemplo de rota para integração com Google Calendar
 * 
 * Para usar este arquivo, adicione o seguinte ao seu index.js
 * na seção de carregamento do consign:
 * 
 * consign({cwd: 'src'})
 *     ...
 *     .then('routes/calendario.js')  // Adicionar esta linha
 *     ...
 */

module.exports = app => {
    const googleCalendarService = app.services.googleCalendarService;

    /**
     * POST /calendario/evento
     * Criar novo evento no Google Calendar
     * 
     * Body:
     * {
     *   "id_usuario": 123,
     *   "summary": "Consulta com Dr. Silva",
     *   "description": "Consulta de rotina",
     *   "start": "2026-05-25T14:00:00",
     *   "end": "2026-05-25T15:00:00"
     * }
     */
    app.post('/calendario/evento', app.auth.authenticate(), async (req, res) => {
        try {
            const { id_usuario, summary, description, start, end } = req.body;

            if (!id_usuario || !summary || !start || !end) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: id_usuario, summary, start, end'
                });
            }

            const eventData = {
                summary,
                description: description || '',
                start: { dateTime: start },
                end: { dateTime: end },
                reminders: {
                    useDefault: true
                }
            };

            const event = await googleCalendarService.createCalendarEvent(
                id_usuario,
                eventData
            );

            return res.status(201).json({
                success: true,
                message: 'Evento criado com sucesso',
                event
            });
        } catch (error) {
            console.error('Erro ao criar evento:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao criar evento no Google Calendar',
                error: error.message
            });
        }
    });

    /**
     * GET /calendario/eventos/:id_usuario
     * Listar eventos do Google Calendar
     * 
     * Query params:
     * - timeMin: Data mínima (ISO format)
     * - timeMax: Data máxima (ISO format)
     * - maxResults: Número máximo de resultados (padrão: 10)
     */
    app.get('/calendario/eventos/:id_usuario', app.auth.authenticate(), async (req, res) => {
        try {
            const { id_usuario } = req.params;
            const { timeMin, timeMax, maxResults = 10 } = req.query;

            const options = {
                maxResults: parseInt(maxResults),
                orderBy: 'startTime',
                singleEvents: true
            };

            if (timeMin) options.timeMin = timeMin;
            if (timeMax) options.timeMax = timeMax;

            const events = await googleCalendarService.listCalendarEvents(
                id_usuario,
                options
            );

            return res.json({
                success: true,
                total: events.length,
                events
            });
        } catch (error) {
            console.error('Erro ao listar eventos:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao listar eventos do Google Calendar',
                error: error.message
            });
        }
    });

    /**
     * PUT /calendario/evento/:eventId
     * Atualizar evento no Google Calendar
     * 
     * Body:
     * {
     *   "id_usuario": 123,
     *   "summary": "Novo título",
     *   "description": "Nova descrição",
     *   "start": "2026-05-25T15:00:00",
     *   "end": "2026-05-25T16:00:00"
     * }
     */
    app.put('/calendario/evento/:eventId', app.auth.authenticate(), async (req, res) => {
        try {
            const { eventId } = req.params;
            const { id_usuario, summary, description, start, end } = req.body;

            if (!id_usuario) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório'
                });
            }

            const eventData = {};
            if (summary) eventData.summary = summary;
            if (description) eventData.description = description;
            if (start) eventData.start = { dateTime: start };
            if (end) eventData.end = { dateTime: end };

            const event = await googleCalendarService.updateCalendarEvent(
                id_usuario,
                eventId,
                eventData
            );

            return res.json({
                success: true,
                message: 'Evento atualizado com sucesso',
                event
            });
        } catch (error) {
            console.error('Erro ao atualizar evento:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar evento no Google Calendar',
                error: error.message
            });
        }
    });

    /**
     * DELETE /calendario/evento/:eventId
     * Deletar evento do Google Calendar
     * 
     * Query params:
     * - id_usuario: ID do usuário (obrigatório)
     */
    app.delete('/calendario/evento/:eventId', app.auth.authenticate(), async (req, res) => {
        try {
            const { eventId } = req.params;
            const { id_usuario } = req.query;

            if (!id_usuario) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do usuário é obrigatório (query param: id_usuario)'
                });
            }

            const result = await googleCalendarService.deleteCalendarEvent(
                id_usuario,
                eventId
            );

            return res.json({
                success: true,
                message: 'Evento deletado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao deletar evento do Google Calendar',
                error: error.message
            });
        }
    });
};
