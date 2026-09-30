/**
 * AI Cyber-Coach client interface.
 * Attempts server-side Gemini API query with offline sports science synthesis fallback.
 */

export interface CoachStatsContext {
  totalTonnage: number;
  completedSets: number;
  totalSets: number;
  activeDayName: string;
}

export async function askAICoach(prompt: string, context: CoachStatsContext): Promise<string> {
  const systemContext = `
Пользователь: Мужчина, 36 лет. Рост: 169 см, Текущий вес: 72 кг.
Цель: Качественный набор мышечной массы с сохранением рельефа (гипертрофия + плотность).
Текущие показатели сессии:
- Активный день: ${context.activeDayName}
- Поднятый тоннаж: ${context.totalTonnage.toLocaleString()} кг (с учетом коэффициента х2 для гантелей)
- Выполнено подходов: ${context.completedSets} из ${context.totalSets}
`;

  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context: systemContext })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return data.text;
      }
    }
  } catch {
    // Fall back to offline intelligence module
  }

  // Robust intelligent fallback generator when offline or API unavailable
  return generateOfflineCoachResponse(prompt, context);
}

function generateOfflineCoachResponse(prompt: string, context: CoachStatsContext): string {
  const p = prompt.toLowerCase();

  if (p.includes('анализ') || p.includes('результат') || p.includes('статистик')) {
    const pct = context.totalSets > 0 ? Math.round((context.completedSets / context.totalSets) * 100) : 0;
    return `**КИБЕР-АНАЛИЗ ТРЕНИРОВОЧНОГО ТОННАЖА:**\n\n` +
      `• Текущий тоннаж: **${context.totalTonnage.toLocaleString()} кг**\n` +
      `• Завершено подходов: **${context.completedSets} / ${context.totalSets} (${pct}%)**\n` +
      `• Режим: **${context.activeDayName}**\n\n` +
      `Для возраста 36 лет и веса 72 кг ключевой фактор — **прогрессивная перегрузка без травм связок**. ` +
      (pct > 75 
        ? `Отличная плотность работы! Сегодня вы создали достаточный механический стимул для гипертрофии. На следующей неделе добавьте +1 повторение в первых двух подходах или увеличьте рабочий вес на 1–2 кг.`
        : `Продолжайте серию. Старайтесь держать паузу отдыха строго по таймеру (90 сек для базовых упражнений) для максимального рекрутирования двигательных единиц.`);
  }

  if (p.includes('питан') || p.includes('съесть') || p.includes('бжу') || p.includes('калор') || p.includes('масс')) {
    return `**ПРОТОКОЛ ПИТАНИЯ ДЛЯ НАБОРА МАССЫ (72 кг / 36 лет):**\n\n` +
      `1. **Калорийность:** ~2400–2550 ккал (небольшой профицит +10–12% для сухого набора без жира).\n` +
      `2. **Белок:** 140–155 г/сутки (2.0–2.2 г на кг веса). Источники: филе индейки/курицы, яйца, творог 5%, говядина, сывороточный протеин.\n` +
      `3. **Углеводы:** 280–320 г (гречка, бурый рис, овсянка, печеный картофель). 60% суточных углеводов употребите до и сразу после тренировки.\n` +
      `4. **Жиры:** 65–75 г (оливковое масло, авокадо, орехи, омега-3) — критически важно для поддержания уровня тестостерона после 35 лет.\n` +
      `5. **Водный баланс:** не менее 2.3–2.6 литра чистой воды в день тренировки.`;
  }

  if (p.includes('техник') || p.includes('дыхан') || p.includes('спин') || p.includes('жим') || p.includes('тяг')) {
    return `**БИОМЕХАНИКА И КИСЛОРОДНЫЙ КОНТРОЛЬ:**\n\n` +
      `• **Фаза опускания (эксцентрика):** 2–3 секунды подконтрольно. Именно в негативной фазе происходит микротравматика волокон, стимулирующая рост.\n` +
      `• **Дыхание:** Вдох при опускании веса (растяжении), мощный выдох через сомкнутые зубы при преодолении максимальной нагрузки.\n` +
      `• **Лопатки:** В жимах гантелей лопатки сведены и прижаты к скамье; плечи не выходят вперед. В тягах движение всегда начинается со сведения лопаток, а не с рывка руками.\n` +
      `• **Суставы:** В верхних точках жимов ногами и жимов руками не «выщелкивайте» суставы до упора — держите мышцы в постоянном напряжении.`;
  }

  return `**КИБЕР-КОУЧ НА СВЯЗИ:**\n\n` +
    `Параметры: 36 лет, 72 кг. Протокол: ${context.activeDayName}.\n` +
    `Ваш текущий тоннаж зафиксирован на отметке **${context.totalTonnage.toLocaleString()} кг**.\n\n` +
    `Для гипертрофии и сохранения рельефа держите диапазон 8–12 повторений с запасом 1–2 повтора до абсолютного отказа (RPE 8-9). ` +
    `Следите за таймером отдыха: короткий отдых накапливает лактат, а 90–120 секунд восстанавливает АТФ-КФ для максимальной силовой отдачи!`;
}
