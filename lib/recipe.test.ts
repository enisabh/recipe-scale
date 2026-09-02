import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRecipeForCopy, normalizeRecipeText, scaleRecipe } from './recipe.ts';

void test('scales the reference recipe from 3 to 100 servings', () => {
  const recipe = scaleRecipe('Nasi Goreng Kampung\n3 cawan nasi\n200g ayam\n2 biji telur\nSedikit garam', 3, 100);
  assert.equal(recipe.title, 'Nasi Goreng Kampung');
  assert.equal(recipe.factorLabel, '33.3×');
  assert.deepEqual(recipe.items, [
    { name: 'Nasi', displayAmount: '100 cawan' },
    { name: 'Ayam', displayAmount: '6.67 kg' },
    { name: 'Telur', displayAmount: '67 biji' },
    { name: 'Garam', displayAmount: 'Secukup rasa' },
  ]);
});

void test('understands fractions and converts litres to millilitres', () => {
  const recipe = scaleRecipe('Sirap\n½ L air\n1 1/2 cawan gula', 10, 5);
  assert.deepEqual(recipe.items, [
    { name: 'Air', displayAmount: '250 ml' },
    { name: 'Gula', displayAmount: '0.75 cawan' },
  ]);
});

void test('creates a copy-friendly recipe', () => {
  const recipe = scaleRecipe('Teh\n2 cawan air', 2, 4);
  assert.equal(formatRecipeForCopy(recipe), 'Teh\nUntuk 4 orang\n\n• Air: 4 cawan');
});

void test('detects ingredients pasted from Google without line breaks', () => {
  const pasted = '1 ekor ayam (dipotong mengikut saiz kesukaan)5 ulas bawang merah (dikisar)3 ulas bawang putih (dikisar)2 inci halia (dikisar)2 batang serai (dikisar)4 sudu besar madu3 sudu besar kicap manis2 sudu besar sos tiram2 sudu besar serbuk lada hitam2 sudu besar minyak masak atau marjerin cair';
  const normalized = normalizeRecipeText(pasted);
  assert.equal(normalized.split('\n').length, 10);

  const recipe = scaleRecipe(pasted, 1, 1);
  assert.deepEqual(recipe.items, [
    { name: 'Ayam (Dipotong Mengikut Saiz Kesukaan)', displayAmount: '1 ekor' },
    { name: 'Bawang Merah (Dikisar)', displayAmount: '5 ulas' },
    { name: 'Bawang Putih (Dikisar)', displayAmount: '3 ulas' },
    { name: 'Halia (Dikisar)', displayAmount: '2 inci' },
    { name: 'Serai (Dikisar)', displayAmount: '2 batang' },
    { name: 'Madu', displayAmount: '4 sudu besar' },
    { name: 'Kicap Manis', displayAmount: '3 sudu besar' },
    { name: 'Sos Tiram', displayAmount: '2 sudu besar' },
    { name: 'Serbuk Lada Hitam', displayAmount: '2 sudu besar' },
    { name: 'Minyak Masak Atau Marjerin Cair', displayAmount: '2 sudu besar' },
  ]);
});
