const pick = (value: number, labels: readonly [string, string, string]) => {
  if (value < 34) return labels[0];
  if (value < 67) return labels[1];
  return labels[2];
};

export const vibeLine = (mood: number, density: number, craft: number) =>
  `${pick(mood, ['Calm', 'Friendly', 'Playful'])}, ${pick(density, ['airy', 'balanced', 'packed'])}, ${pick(craft, ['scrappy', 'solid', 'polished'])}.`;
