import assert from 'node:assert/strict';
import test from 'node:test';
import { formatRecipeForCopy, scaleRecipe } from './recipe.ts';

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
