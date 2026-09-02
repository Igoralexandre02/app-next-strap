'use strict';

export function obterHoraLocal() {
  const agora = new Date();

  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Manaus',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(agora);

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== 'literal') {
      valores[parte.type] = parte.value;
    }
  }

  return {
    data: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}:${valores.second}`,
  };
}

export function horarioEmMinutos(horario) {
  const [hora, minuto] = horario.split(':').map(Number);

  return hora * 60 + minuto;
}