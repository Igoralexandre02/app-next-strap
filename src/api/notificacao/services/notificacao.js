'use strict';

/**
 * notificacao service
*/

const { createCoreService } = require('@strapi/strapi').factories;

const { obterAgoraLocal, horarioEmMinutos, } = require('./helpers');

const MINUTOS_ANTECEDENCIA = 30;

module.exports = createCoreService(
  'api::notificacao.notificacao',
  ({ strapi }) => ({
    async verificarCortesProximos() {
      const agora = obterAgoraLocal();

      const agendamentos = await strapi
        .documents('api::agendamento.agendamento')
        .findMany({
          filters: {
            data: {
              $eq: agora.data,
            },
          },
        });

      const agoraEmMinutos = horarioEmMinutos(agora.hora);

      for (const agendamento of agendamentos) {
        const horarioAgendamento = horarioEmMinutos(
          agendamento.horario,
        );

        const diferencaMinutos = horarioAgendamento - agoraEmMinutos;

        if (diferencaMinutos <= 0) {
          continue;
        }

        strapi.log.info(
          `[LEMBRETE] ${agendamento.nome} → ${diferencaMinutos} minutos`,
        );

        const estaProximo =
          diferencaMinutos > 0 &&
          diferencaMinutos <= MINUTOS_ANTECEDENCIA;

        if (!estaProximo) {
          continue;
        }

        const notificacoesExistentes = await strapi
          .documents('api::notificacao.notificacao')
          .findMany({
            filters: {
              tipo: {
                $eq: 'CORTE_PROXIMO',
              },
              agendamento: {
                documentId: {
                  $eq: agendamento.documentId,
                },
              },
            },
          });

        if (notificacoesExistentes.length > 0) {
          strapi.log.info(
            `[LEMBRETE] Notificação já existe para ${agendamento.nome}.`,
          );

          continue;
        }

        const notificacao = await strapi
          .documents('api::notificacao.notificacao')
          .create({
            data: {
              tipo: 'CORTE_PROXIMO',
              lida: false,
              agendamento: agendamento.documentId,
            },
          });

        strapi.log.info(
          `[LEMBRETE] 🔔 Notificação criada para ${agendamento.nome} (${notificacao.documentId}).`,
        );
      }
    },
  }),
);