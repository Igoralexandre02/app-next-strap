'use strict';

/**
 * agendamento controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::agendamento.agendamento',
  ({ strapi }) => ({
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      const agendamentoAtual = await strapi
        .documents('api::agendamento.agendamento')
        .findOne({
          documentId: id,
        });

      if (!agendamentoAtual) {
        return ctx.notFound('Agendamento não encontrado');
      }

      const dataAlterada =
        data.data !== undefined &&
        data.data !== agendamentoAtual.data;

      const horarioAlterado =
        data.horario !== undefined &&
        data.horario !== agendamentoAtual.horario;

      if (dataAlterada || horarioAlterado) {
        await strapi
          .service('api::notificacao.notificacao')
          .removerPorAgendamento(id);
      }

      const response = await super.update(ctx);

      return response;
    },
  }),
);