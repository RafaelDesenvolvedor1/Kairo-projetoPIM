const { google } = require('googleapis');

module.exports = (app) => {
    const Users = app.db.models.User;

    return {
        /**
         * Criar evento no Google Calendar
         * @param {number} userId - ID do usuário
         * @param {object} eventData - Dados do evento
         * @returns {object} Resposta da API do Google
         */
        createCalendarEvent: async (userId, eventData) => {
            try {
                const user = await Users.findByPk(userId);

                if (!user || !user.google_access_token) {
                    throw new Error('Usuário não autenticado com Google');
                }

                const auth = new google.auth.OAuth2({
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectURL: process.env.GOOGLE_CALLBACK_URL
                });

                auth.setCredentials({
                    access_token: user.google_access_token,
                    refresh_token: user.google_refresh_token
                });

                const calendar = google.calendar({ version: 'v3', auth });

                const event = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: eventData
                });

                return event.data;
            } catch (error) {
                console.error('Erro ao criar evento no Google Calendar:', error);
                throw error;
            }
        },

        /**
         * Listar eventos do Google Calendar
         * @param {number} userId - ID do usuário
         * @param {object} options - Opções de busca (timeMin, timeMax, etc)
         * @returns {array} Lista de eventos
         */
        listCalendarEvents: async (userId, options = {}) => {
            try {
                const user = await Users.findByPk(userId);

                if (!user || !user.google_access_token) {
                    throw new Error('Usuário não autenticado com Google');
                }

                const auth = new google.auth.OAuth2({
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectURL: process.env.GOOGLE_CALLBACK_URL
                });

                auth.setCredentials({
                    access_token: user.google_access_token,
                    refresh_token: user.google_refresh_token
                });

                const calendar = google.calendar({ version: 'v3', auth });

                const response = await calendar.events.list({
                    calendarId: 'primary',
                    ...options
                });

                return response.data.items || [];
            } catch (error) {
                console.error('Erro ao listar eventos do Google Calendar:', error);
                throw error;
            }
        },

        /**
         * Atualizar evento no Google Calendar
         * @param {number} userId - ID do usuário
         * @param {string} eventId - ID do evento
         * @param {object} eventData - Dados atualizados do evento
         * @returns {object} Evento atualizado
         */
        updateCalendarEvent: async (userId, eventId, eventData) => {
            try {
                const user = await Users.findByPk(userId);

                if (!user || !user.google_access_token) {
                    throw new Error('Usuário não autenticado com Google');
                }

                const auth = new google.auth.OAuth2({
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectURL: process.env.GOOGLE_CALLBACK_URL
                });

                auth.setCredentials({
                    access_token: user.google_access_token,
                    refresh_token: user.google_refresh_token
                });

                const calendar = google.calendar({ version: 'v3', auth });

                const event = await calendar.events.update({
                    calendarId: 'primary',
                    eventId: eventId,
                    resource: eventData
                });

                return event.data;
            } catch (error) {
                console.error('Erro ao atualizar evento no Google Calendar:', error);
                throw error;
            }
        },

        /**
         * Deletar evento do Google Calendar
         * @param {number} userId - ID do usuário
         * @param {string} eventId - ID do evento
         */
        deleteCalendarEvent: async (userId, eventId) => {
            try {
                const user = await Users.findByPk(userId);

                if (!user || !user.google_access_token) {
                    throw new Error('Usuário não autenticado com Google');
                }

                const auth = new google.auth.OAuth2({
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectURL: process.env.GOOGLE_CALLBACK_URL
                });

                auth.setCredentials({
                    access_token: user.google_access_token,
                    refresh_token: user.google_refresh_token
                });

                const calendar = google.calendar({ version: 'v3', auth });

                await calendar.events.delete({
                    calendarId: 'primary',
                    eventId: eventId
                });

                return { message: 'Evento deletado com sucesso' };
            } catch (error) {
                console.error('Erro ao deletar evento do Google Calendar:', error);
                throw error;
            }
        },

        /**
         * Criar evento no Google Calendar a partir de um agendamento
         * @param {number} userId - ID do usuário
         * @param {object} agendamentoData - Dados do agendamento { data_hora_inicio, data_hora_fim, observacoes }
         * @param {string} pacienteName - Nome do paciente
         * @returns {object} Resposta da API do Google
         */
        createScheduleEvent: async (userId, agendamentoData, pacienteName) => {
            try {
                const user = await Users.findByPk(userId);

                if (!user || !user.google_access_token) {
                    console.warn(`Usuário ${userId} não possui token Google para criar evento`);
                    return null;
                }

                const auth = new google.auth.OAuth2({
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    redirectURL: process.env.GOOGLE_CALLBACK_URL
                });

                auth.setCredentials({
                    access_token: user.google_access_token,
                    refresh_token: user.google_refresh_token
                });

                const calendar = google.calendar({ version: 'v3', auth });

                const eventData = {
                    summary: `Agendamento - ${pacienteName}`,
                    description: agendamentoData.observacoes || 'Sem observações',
                    start: {
                        dateTime: new Date(agendamentoData.data_hora_inicio).toISOString(),
                        timeZone: 'America/Sao_Paulo'
                    },
                    end: {
                        dateTime: new Date(agendamentoData.data_hora_fim).toISOString(),
                        timeZone: 'America/Sao_Paulo'
                    },
                    notifications: {
                        useDefault: true
                    }
                };

                const event = await calendar.events.insert({
                    calendarId: 'primary',
                    resource: eventData
                });

                return event.data;
            } catch (error) {
                console.error('Erro ao criar evento no Google Calendar:', error);
                return null;
            }
        }
    };
};
