export type ScaledIngredient = { name: string; displayAmount: string };
export type ScaledRecipe = {
  title: string;
  factor: number;
  factorLabel: string;
  servings: number;
  items: ScaledIngredient[];
};

const COUNT_UNITS = new Set(['biji', 'ulas', 'batang', 'keping', 'helai', 'ekor', 'bungkus']);
const UNIT_ALIASES: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g', kg: 'kg', kilogram: 'kg',
  ml: 'ml', mililiter: 'ml', l: 'L', liter: 'L', litre: 'L',
  cawan: 'cawan', cup: 'cawan', cups: 'cawan', sudu: 'sudu',
  tbsp: 'sudu besar', tsp: 'sudu kecil', biji: 'biji', ulas: 'ulas',
  batang: 'batang', keping: 'keping', helai: 'helai', ekor: 'ekor', bungkus: 'bungkus',
};
const FRACTIONS: Record<string, number> = {
  '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
};

function parseNumber(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (FRACTIONS[normalized] !== undefined) return FRACTIONS[normalized];
  if (normalized.includes(' ')) {
    const [whole, fraction] = normalized.split(/\s+/);
    return Number(whole) + parseNumber(fraction);
  }
  if (normalized.includes('/')) {
    const [numerator, denominator] = normalized.split('/').map(Number);
    return denominator ? numerator / denominator : 0;
  }
  return Number(normalized);
}

function titleCase(value: string) {
  return value.trim().replace(/^[-•]\s*/, '').replace(/\s+/g, ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function cleanUnit(unit: string, remainder: string) {
  let canonical = UNIT_ALIASES[unit.toLowerCase()] ?? unit.toLowerCase();
  let name = remainder.trim();
  if (canonical === 'sudu' && /^(besar|kecil)\b/i.test(name)) {
    const size = name.match(/^(besar|kecil)\b/i)?.[1].toLowerCase();
    canonical = `sudu ${size}`;
    name = name.replace(/^(besar|kecil)\b\s*/i, '');
  }
  return { unit: canonical, name };
}

function formatNumber(value: number, forceWhole = false) {
  if (forceWhole) return String(Math.max(1, Math.round(value)));
  if (Math.abs(value - Math.round(value)) < 0.001) return String(Math.round(value));
  return value.toLocaleString('ms-MY', {
    maximumFractionDigits: value >= 10 ? 1 : 2,
    minimumFractionDigits: 0,
  });
}

function formatAmount(quantity: number, unit: string) {
  let scaledQuantity = quantity;
  let displayUnit = unit;
  if (unit === 'g' && quantity >= 1000) {
    scaledQuantity = quantity / 1000; displayUnit = 'kg';
  } else if (unit === 'kg' && quantity < 1) {
    scaledQuantity = quantity * 1000; displayUnit = 'g';
  } else if (unit === 'ml' && quantity >= 1000) {
    scaledQuantity = quantity / 1000; displayUnit = 'L';
  } else if (unit === 'L' && quantity < 1) {
    scaledQuantity = quantity * 1000; displayUnit = 'ml';
  }
  return `${formatNumber(scaledQuantity, COUNT_UNITS.has(displayUnit))} ${displayUnit}`.trim();
}

export function scaleRecipe(text: string, originalServings: number, targetServings: number): ScaledRecipe {
  const safeOriginal = Math.max(1, originalServings || 1);
  const safeTarget = Math.max(1, targetServings || 1);
  const factor = safeTarget / safeOriginal;
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let title = 'Resipi Anda';
  const items: ScaledIngredient[] = [];

  lines.forEach((line, index) => {
    const numericMatch = line.match(
      /^[-•]?\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s*([a-zA-Z]+)?\s*(.*)$/u,
    );
    if (numericMatch) {
      const quantity = parseNumber(numericMatch[1]) * factor;
      const { unit, name } = cleanUnit(numericMatch[2] || '', numericMatch[3] || '');
      if (name) items.push({ name: titleCase(name), displayAmount: formatAmount(quantity, unit) });
      return;
    }
    const qualitativeMatch = line.match(/^(sedikit|secukupnya|secukup rasa)\s+(.+)$/i);
    if (qualitativeMatch) {
      items.push({ name: titleCase(qualitativeMatch[2]), displayAmount: 'Secukup rasa' });
      return;
    }
    if (index === 0 || title === 'Resipi Anda') title = titleCase(line);
  });

  return { title, factor, factorLabel: `${formatNumber(factor)}×`, servings: safeTarget, items };
}

export function formatRecipeForCopy(recipe: ScaledRecipe) {
  const ingredients = recipe.items.map((item) => `• ${item.name}: ${item.displayAmount}`).join('\n');
  return `${recipe.title}\nUntuk ${recipe.servings} orang\n\n${ingredients}`;
}
