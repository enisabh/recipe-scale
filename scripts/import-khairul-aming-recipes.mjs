import { writeFile } from 'node:fs/promises';

const recipeIds = [
  14260, 8628, 14243, 14229, 14216,
  9850, 9902, 9905, 8255, 7152,
  8272, 14814, 9945, 11993, 12012,
  14288, 14474, 14496, 14512, 14541,
];

const categoryPriority = [
  'Ayam', 'Daging', 'Ikan', 'Seafood', 'Nasi, Pulut & Bubur',
  'Pasta & Pizza', 'Sambal, Sos & Pencicah', 'Snack',
  'Pencuci Mulut', 'Kek, Roti & Pastri', 'Sup',
];
const quantityPattern = String.raw`(?:\d+(?:[.,]\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞])`;
const unitPattern = String.raw`(?:kg|g|gram|ml|l|liter|cawan|sudu(?:\s+(?:besar|kecil))?|biji|ulas|batang|keping|helai|ekor|bungkus|kotak|tin|tangkai|ketul|paket|kiub|akar|penutup|blok|inci|cm|mm)`;

function decodeHtml(value = '') {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIngredient(value) {
  const parentheticalRange = value.match(new RegExp(
    String.raw`^(.+?)\s*\((${quantityPattern})\s*(${unitPattern})\s*[–-]\s*(${quantityPattern})\s*(${unitPattern})\)$`,
    'iu',
  ));
  if (parentheticalRange && parentheticalRange[3].toLowerCase() === parentheticalRange[5].toLowerCase()) {
    return `${parentheticalRange[2]}–${parentheticalRange[4]} ${parentheticalRange[3]} ${parentheticalRange[1]}`;
  }

  const parentheticalQuantity = value.match(new RegExp(
    String.raw`^(.+?)\s*\((${quantityPattern})\s*(${unitPattern})(?:\s*[,/]\s*(.*?))?\)$`,
    'iu',
  ));
  if (parentheticalQuantity) {
    const note = parentheticalQuantity[4] ? ` (${parentheticalQuantity[4]})` : '';
    return `${parentheticalQuantity[2]} ${parentheticalQuantity[3]} ${parentheticalQuantity[1]}${note}`;
  }

  const trailingRange = value.match(new RegExp(
    String.raw`^(.+?)\s+(${quantityPattern})\s*[–-]\s*(${quantityPattern})\s*(${unitPattern})$`,
    'iu',
  ));
  if (trailingRange) return `${trailingRange[2]}–${trailingRange[3]} ${trailingRange[4]} ${trailingRange[1]}`;

  const trailingQuantity = value.match(new RegExp(
    String.raw`^(.+?)\s+(${quantityPattern})\s*(${unitPattern})(\s*\(.*\))?$`,
    'iu',
  ));
  if (trailingQuantity) {
    return `${trailingQuantity[2]} ${trailingQuantity[3]} ${trailingQuantity[1]}${trailingQuantity[4] ?? ''}`;
  }

  return value;
}

function extractIngredients(meta) {
  const groups = Object.entries(meta)
    .filter(([key, value]) => /^bahan-(utama|tambahan)/.test(key) && value && typeof value === 'object')
    .map(([, value]) => value);

  const ingredients = groups.flatMap((group) =>
    Object.values(group)
      .map((item) => normalizeIngredient(decodeHtml(item?.bahan ?? '')))
      .filter(Boolean),
  );

  return [...new Set(ingredients)];
}

function pickCategory(meta) {
  const flags = meta['category-resipi'] ?? {};
  return categoryPriority.find((category) => flags[category] === 'true')
    ?? meta['jenis-masakan']
    ?? 'Lain-lain';
}

const posts = await Promise.all(recipeIds.map(async (id) => {
  const response = await fetch(`https://www.resipikita.com/wp-json/wp/v2/resipi/${id}`);
  if (!response.ok) throw new Error(`Resipi ${id} gagal dimuatkan: ${response.status}`);
  return response.json();
}));

const recipes = posts.map((post) => {
  const meta = post.meta ?? {};
  return {
    id: post.id,
    slug: post.slug,
    name: decodeHtml(meta['nama-resipi'] || post.title?.rendered).replace(/^Resepi\s+/i, ''),
    servings: Number(meta['jumlah-hidangan']) || 4,
    minutes: Number(meta['jumlah-masa']) || null,
    level: decodeHtml(meta.level) || 'Mudah',
    category: pickCategory(meta),
    ingredients: extractIngredients(meta),
    sourceUrl: post.link,
  };
});

await writeFile(
  new URL('../lib/khairul-aming-recipes.json', import.meta.url),
  `${JSON.stringify(recipes, null, 2)}\n`,
  'utf8',
);

console.log(`Imported ${recipes.length} recipes with ${recipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0)} ingredients.`);
