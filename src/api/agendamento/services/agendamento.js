'use strict';

/**
 * agendamento service
 */

const {
    obterHoraLocal,
} = require('../../notificacao/services/helpers');

const MINUTOS_PARA_FINALIZAR = 60;

const { createCoreService } = require('@strapi/strapi').factories;

/**
 * Converte uma data + horário do calendário em milissegundos.
 *
 * Usamos UTC apenas como uma forma de fazer aritmética
 * com data/hora, sem depender do timezone do servidor.
 *
 * @param {string} data
 * @param {string} horario
 * @returns {number}
 */
function dataHoraParaComparacao(data, horario) {
    const [ano, mes, dia] = data.split('-').map(Number);
    const [hora, minuto] = horario.split(':').map(Number);

    return Date.UTC(
        ano,
        mes - 1,
        dia,
        hora,
        minuto,
    );
}

module.exports = createCoreService(
    'api::agendamento.agendamento',
    ({ strapi }) => ({
        async finalizarAgendamentos() {
            const agora = obterHoraLocal();

            const statusAgendado = await strapi
                .documents('api::status.status')
                .findFirst({
                    filters: {
                        nome: {
                            $eq: 'Agendado',
                        },
                    },
                });

            if (!statusAgendado) {
                console.error(
                    '[AGENDAMENTO] Status "Agendado" não encontrado.'
                );

                return;
            }

            const statusFinalizado = await strapi
                .documents('api::status.status')
                .findFirst({
                    filters: {
                        nome: {
                            $eq: 'Finalizado',
                        },
                    },
                });

            if (!statusFinalizado) {
                console.error(
                    '[AGENDAMENTO] Status "Finalizado" não encontrado.'
                );

                return;
            }

            const agendamentos = await strapi.db
                .query('api::agendamento.agendamento')
                .findMany({
                    where: {
                        status_id: {
                            id: statusAgendado.id,
                        },
                        data: {
                            $eq: agora.data,
                        },
                    },
                    populate: {
                        status_id: true,
                    },
                });

            console.log(`[AGENDAMENTOS]`, agendamentos);

            const agoraMs = dataHoraParaComparacao(
                agora.data,
                agora.hora,
            );

            for (const agendamento of agendamentos) {
                if (!agendamento.data || !agendamento.horario) {
                    continue;
                }

                const agendamentoMs = dataHoraParaComparacao(
                    agendamento.data,
                    agendamento.horario,
                );

                const limiteMs =
                    agendamentoMs +
                    MINUTOS_PARA_FINALIZAR * 60 * 1000;

                if (agoraMs >= limiteMs) {
                    await strapi
                        .documents('api::agendamento.agendamento')
                        .update({
                            documentId: agendamento.documentId,
                            data: {
                                status_id: statusFinalizado.documentId,
                            },
                        });

                    console.log(
                        `[AGENDAMENTO] ${agendamento.nome} ` +
                        `foi finalizado automaticamente.`
                    );
                }
            }
        },
    })
);