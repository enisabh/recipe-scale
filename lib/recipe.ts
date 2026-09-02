export type ScaledIngredient = { name: string; displayAmount: string };
export type ScaledRecipe = {
  title: string;
  factor: number;
  factorLabel: string;
  servings: number;
  items: ScaledIngredient[];
};

const COUNT_UNITS = new Set(['biji', 'ulas', 'batang', 'keping', 'helai', 'ekor', 'tangkai', 'ketul', 'kiub', 'akar', 'penutup', 'blok']);
const SIZED_UNITS = new Set([...COUNT_UNITS, 'kotak', 'tin', 'bungkus', 'paket']);
const UNIT_ALIASES: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g', kg: 'kg', kilogram: 'kg',
  ml: 'ml', mililiter: 'ml', l: 'L', liter: 'L', litre: 'L',
  cawan: 'cawan', cup: 'cawan', cups: 'cawan', sudu: 'sudu',
  tbsp: 'sudu besar', tsp: 'sudu kecil', biji: 'biji', ulas: 'ulas',
  batang: 'batang', keping: 'keping', helai: 'helai', ekor: 'ekor', bungkus: 'bungkus',
  kotak: 'kotak', tin: 'tin', tangkai: 'tangkai', ketul: 'ketul', paket: 'paket',
  kiub: 'kiub', akar: 'akar', penutup: 'penutup', blok: 'blok', inci: 'inci', cm: 'cm', mm: 'mm',
};
const FRACTIONS: Record<string, number> = {
  '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3,
  '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
};

const COLLAPSED_UNITS = [
  ...Object.keys(UNIT_ALIASES),
  'sudu besar', 'sudu kecil', 'inci', 'cm', 'mm',
].sort((a, b) => b.length - a.length);
const QUANTITY_PATTERN = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])`;
const UNIT_PATTERN = COLLAPSED_UNITS
  .map((unit) => unit.replace(/\s+/g, String.raw`\s+`))
  .join('|');
const COLLAPSED_INGREDIENT_START = new RegExp(
  String.raw`^${QUANTITY_PATTERN}\s*(?:${UNIT_PATTERN})\b`,
  'iu',
);
const COLLAPSED_BOUNDARY_PRECEDER = /[^\s\d.,/¼½¾⅓⅔⅛⅜⅝⅞–-]/u;

export function normalizeRecipeText(text: string) {
  const normalized = text.replace(/\u00a0/g, ' ');
  let output = '';
  let parenthesisDepth = 0;

  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    const previous = normalized[index - 1] ?? '';
    if (
      parenthesisDepth === 0
      && index > 0
      && COLLAPSED_BOUNDARY_PRECEDER.test(previous)
      && COLLAPSED_INGREDIENT_START.test(normalized.slice(index))
    ) {
      output += '\n';
    }
    output += character;
    if (character === '(') parenthesisDepth += 1;
    if (character === ')') parenthesisDepth = Math.max(0, parenthesisDepth - 1);
  }

  return output;
}

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
  const normalizedUnit = unit.toLowerCase();
  if (unit && !UNIT_ALIASES[normalizedUnit]) {
    return { unit: '', name: `${unit} ${remainder}`.trim() };
  }
  let canonical = UNIT_ALIASES[normalizedUnit] ?? normalizedUnit;
  let name = remainder.trim();
  if (canonical === 'sudu' && /^(besar|kecil)\b/i.test(name)) {
    const size = name.match(/^(besar|kecil)\b/i)?.[1].toLowerCase();
    canonical = `sudu ${size}`;
    name = name.replace(/^(besar|kecil)\b\s*/i, '');
  }
  if (SIZED_UNITS.has(canonical) && /^(besar|kecil)\b/i.test(name)) {
    const size = name.match(/^(besar|kecil)\b/i)?.[1].toLowerCase();
    canonical = `${canonical} ${size}`;
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
  return `${formatNumber(scaledQuantity, COUNT_UNITS.has(displayUnit.split(' ')[0]))} ${displayUnit}`.trim();
}

function formatRange(minimum: number, maximum: number, unit: string) {
  const first = formatAmount(minimum, unit);
  const second = formatAmount(maximum, unit);
  const suffix = ` ${unit}`;
  if (unit && first.endsWith(suffix) && second.endsWith(suffix)) {
    return `${first.slice(0, -suffix.length)}–${second.slice(0, -suffix.length)}${suffix}`;
  }
  return `${first}–${second}`;
}

export function scaleRecipe(text: string, originalServings: number, targetServings: number): ScaledRecipe {
  const safeOriginal = Math.max(1, originalServings || 1);
  const safeTarget = Math.max(1, targetServings || 1);
  const factor = safeTarget / safeOriginal;
  const lines = normalizeRecipeText(text).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let title = 'Resipi Anda';
  const items: ScaledIngredient[] = [];

  lines.forEach((line, index) => {
    const rangeMatch = line.match(
      /^[-•]?\s*(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*(.*)$/u,
    );
    if (rangeMatch) {
      const minimum = parseNumber(rangeMatch[1]) * factor;
      const maximum = parseNumber(rangeMatch[2]) * factor;
      const { unit, name } = cleanUnit(rangeMatch[3] || '', rangeMatch[4] || '');
      if (name) items.push({ name: titleCase(name), displayAmount: formatRange(minimum, maximum, unit) });
      return;
    }
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
    const qualitativeSuffixMatch = line.match(/^(.+?)\s+(secukup rasa|secukupnya)$/i);
    if (qualitativeSuffixMatch) {
      items.push({ name: titleCase(qualitativeSuffixMatch[1]), displayAmount: 'Secukup rasa' });
      return;
    }
    if (index === 0 || title === 'Resipi Anda') {
      title = titleCase(line);
      return;
    }
    items.push({ name: titleCase(line), displayAmount: 'Ikut keperluan' });
  });

  return { title, factor, factorLabel: `${formatNumber(factor)}×`, servings: safeTarget, items };
}

export function formatRecipeForCopy(recipe: ScaledRecipe) {
  const ingredients = recipe.items.map((item) => `• ${item.name}: ${item.displayAmount}`).join('\n');
  return `${recipe.title}\nUntuk ${recipe.servings} orang\n\n${ingredients}`;
}
