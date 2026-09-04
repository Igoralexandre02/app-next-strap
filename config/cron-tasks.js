const notificacaoService = require(
  '../src/api/notificacao/services/notificacao'
);

module.exports = {
  verificarCortesProximos: {
    task: async ({ strapi }) => {
      await strapi.service('api::notificacao.notificacao').verificarCortesProximos();
      await strapi.service('api::agendamento.agendamento').finalizarAgendamentos();
    },

    options: {
      rule: '* * * * *',
    },
  },
};