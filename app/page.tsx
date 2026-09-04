'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChefHat,
  CircleHelp,
  Clock3,
  Clipboard,
  Copy,
  ExternalLink,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import easyCakeRecipes from '@/lib/easy-cake-recipes.json';
import khairulAmingRecipes from '@/lib/khairul-aming-recipes.json';
import { formatRecipeForCopy, normalizeRecipeText, scaleRecipe } from '@/lib/recipe';

const recipePresets = [...easyCakeRecipes, ...khairulAmingRecipes];
type RecipePreset = (typeof recipePresets)[number];

const DEFAULT_RECIPE = `Nasi Goreng Kampung

3 cawan nasi
200g ayam
2 biji telur
3 sudu besar kicap
2 biji bawang
2 ulas bawang putih
Sedikit garam`;

const ingredientEmoji: Record<string, string> = {
  nasi: '🍚', ayam: '🍗', telur: '🥚', kicap: '🫙', putih: '🧄',
  bawang: '🧅', garam: '🧂', gula: '🍬', air: '💧', minyak: '🫗', tepung: '🌾',
};

const categoryEmoji: Record<string, string> = {
  Ayam: '🍗', Daging: '🥩', Ikan: '🐟', Seafood: '🦐',
  'Nasi, Pulut & Bubur': '🍚', 'Pasta & Pizza': '🍝',
  'Kek, Roti & Pastri': '🍰',
  'Pencuci Mulut': '🍮', Snack: '🥨',
  'Sambal, Sos & Pencicah': '🌶️', Sup: '🍲',
};

const recipeCategories = [
  'Semua',
  ...Array.from(new Set(recipePresets.map((recipe) => recipe.category))),
];

function getEmoji(name: string) {
  const match = Object.keys(ingredientEmoji).find((keyword) =>
    name.toLowerCase().includes(keyword),
  );
  return match ? ingredientEmoji[match] : '🥣';
}

function StepHeading({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="step-heading">
      <span className="step-number">{number}</span>
      <h2>{children}</h2>
    </div>
  );
}

export default function Home() {
  const [recipeText, setRecipeText] = useState(DEFAULT_RECIPE);
  const [originalServings, setOriginalServings] = useState(3);
  const [targetServings, setTargetServings] = useState(100);
  const [toast, setToast] = useState('');
  const [pulse, setPulse] = useState(false);
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('Semua');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [activeMethodRecipe, setActiveMethodRecipe] = useState<RecipePreset | null>(null);

  const scaledRecipe = useMemo(
    () => scaleRecipe(recipeText, originalServings, targetServings),
    [recipeText, originalServings, targetServings],
  );

  const filteredRecipes = useMemo(() => {
    const query = recipeSearch.trim().toLowerCase();
    return recipePresets.filter((recipe) => {
      const matchesCategory = recipeCategory === 'Semua' || recipe.category === recipeCategory;
      const matchesSearch = !query
        || recipe.name.toLowerCase().includes(query)
        || recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [recipeCategory, recipeSearch]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const updateTarget = (value: number) => {
    setTargetServings(Math.min(500, Math.max(1, value || 1)));
  };

  const handleConvert = () => {
    setPulse(true);
    window.setTimeout(() => setPulse(false), 500);
    document.getElementById('hasil-resipi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRecipePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text');
    const normalizedText = normalizeRecipeText(pastedText);
    if (normalizedText === pastedText) return;

    event.preventDefault();
    const input = event.currentTarget;
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    const nextText = `${recipeText.slice(0, selectionStart)}${normalizedText}${recipeText.slice(selectionEnd)}`;
    const nextCursor = selectionStart + normalizedText.length;

    setRecipeText(nextText);
    showToast('Bahan tanpa baris telah dikesan secara automatik');
    window.requestAnimationFrame(() => input.setSelectionRange(nextCursor, nextCursor));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatRecipeForCopy(scaledRecipe));
      showToast('Resipi berjaya disalin');
    } catch {
      showToast('Tidak dapat menyalin resipi');
    }
  };

  const handleReset = () => {
    setRecipeText(DEFAULT_RECIPE);
    setOriginalServings(3);
    setTargetServings(100);
    setSelectedRecipeId(null);
    showToast('Resipi telah ditetapkan semula');
  };

  const loadRecipePreset = (recipe: RecipePreset) => {
    setRecipeText([recipe.name, '', ...recipe.ingredients].join('\n'));
    setOriginalServings(recipe.servings);
    setSelectedRecipeId(recipe.id);
    setActiveMethodRecipe(null);
    setPulse(true);
    window.setTimeout(() => setPulse(false), 500);
    showToast(`${recipe.name} dimasukkan ke kalkulator`);
    window.setTimeout(() => {
      document.getElementById('kalkulator-resipi')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="intro-copy">
          <span className="eyebrow">PASTE • SKALA • SIAP</span>
          <h1>Masak untuk 5 orang atau 500 orang.</h1>
          <p>Tampal resipi, pilih jumlah tetamu dan biar kami kira selebihnya.</p>
        </div>

        <section id="kalkulator-resipi" className="recipe-shell" aria-label="Kalkulator skala resipi">
          <header className="app-header">
            <div className="brand-lockup">
              <span className="brand-icon" aria-hidden="true"><ChefHat /></span>
              <div>
                <p className="brand-name">CAL-COOK-LATOR</p>
                <p className="brand-tagline">Resipi tepat, untuk setiap majlis.</p>
              </div>
            </div>
            <div className="header-actions">
              <Dialog>
                <DialogTrigger render={<Button variant="ghost" className="header-button" />}>
                  <CircleHelp /><span>Bagaimana guna?</span>
                </DialogTrigger>
                <DialogContent className="help-dialog">
                  <DialogHeader>
                    <DialogTitle>Cara menggunakan Cal-Cook-Lator</DialogTitle>
                    <DialogDescription>Tiga langkah ringkas untuk mendapatkan sukatan baharu.</DialogDescription>
                  </DialogHeader>
                  <ol className="help-list">
                    <li><span>1</span><p><strong>Tampal resipi.</strong> Letakkan satu bahan pada setiap baris.</p></li>
                    <li><span>2</span><p><strong>Isi jumlah asal.</strong> Beritahu berapa orang resipi asal boleh hidang.</p></li>
                    <li><span>3</span><p><strong>Pilih sasaran.</strong> Kami gandakan bahan dan menukar g kepada kg atau ml kepada L apabila sesuai.</p></li>
                  </ol>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" className="header-button" onClick={handleReset}>
                <RotateCcw /><span>Reset</span>
              </Button>
            </div>
          </header>

          <div className="workflow-grid">
            <section className="workflow-panel input-panel">
              <StepHeading number={1}>Masukkan resipi</StepHeading>
              <p className="step-caption">Tampal resipi anda di bawah</p>
              <label className="sr-only" htmlFor="recipe-input">Teks resipi</label>
              <div className="textarea-wrap">
                <Clipboard className="input-corner-icon" aria-hidden="true" />
                <Textarea id="recipe-input" value={recipeText} onChange={(e) => setRecipeText(e.target.value)} onPaste={handleRecipePaste} className="recipe-textarea" spellCheck="false" />
              </div>
              <div className="serving-row">
                <label htmlFor="original-servings">Resipi ini untuk</label>
                <div className="serving-input-wrap">
                  <Input
                    id="original-servings" type="number" min={1} max={500} value={originalServings}
                    onChange={(e) => setOriginalServings(Math.min(500, Math.max(1, Number(e.target.value) || 1)))}
                  />
                  <span>orang</span>
                </div>
              </div>
            </section>

            <div className="flow-arrow flow-arrow-one" aria-hidden="true"><ArrowRight /></div>

            <section className="workflow-panel target-panel">
              <StepHeading number={2}>Nak masak untuk berapa orang?</StepHeading>
              <div className="target-card">
                <button className="round-control" type="button" onClick={() => updateTarget(targetServings - 1)} aria-label="Kurangkan seorang"><Minus /></button>
                <label className="target-display">
                  <span className="sr-only">Jumlah orang sasaran</span>
                  <input type="number" min={1} max={500} value={targetServings} onChange={(e) => updateTarget(Number(e.target.value))} />
                  <span>ORANG</span>
                </label>
                <button className="round-control" type="button" onClick={() => updateTarget(targetServings + 1)} aria-label="Tambah seorang"><Plus /></button>
              </div>
              <div className="factor-pill"><Sparkles aria-hidden="true" /> Sukatan didarab {scaledRecipe.factorLabel}</div>
              <Button className="convert-button" size="lg" onClick={handleConvert}><Sparkles /> Tukar resipi</Button>
              <p className="range-note">Sesuai untuk 1 hingga 500 orang</p>
            </section>

            <div className="flow-arrow flow-arrow-two" aria-hidden="true"><ArrowRight /></div>

            <section id="hasil-resipi" className={`workflow-panel result-panel ${pulse ? 'result-pulse' : ''}`}>
              <StepHeading number={3}>Resipi baharu — {targetServings} orang</StepHeading>
              <div className="result-card" aria-live="polite">
                <div className="result-title-row">
                  <div><span>HASIL SKALA</span><h3>{scaledRecipe.title}</h3></div>
                  <span className="ready-badge"><Check /> Siap</span>
                </div>
                {scaledRecipe.items.length > 0 ? (
                  <ul className="ingredient-list">
                    {scaledRecipe.items.map((item, index) => (
                      <li key={`${item.name}-${index}`}>
                        <span className="ingredient-icon" aria-hidden="true">{getEmoji(item.name)}</span>
                        <span className="ingredient-name">{item.name}</span>
                        <strong>{item.displayAmount}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="empty-state"><ChefHat /><p>Masukkan bahan berserta sukatan untuk melihat hasil.</p></div>
                )}
              </div>
              <div className="result-actions">
                <Button variant="outline" onClick={handleCopy} disabled={!scaledRecipe.items.length}><Copy /> Copy</Button>
                <Button variant="outline" onClick={() => window.print()} disabled={!scaledRecipe.items.length}><Printer /> Print</Button>
              </div>
            </section>
          </div>
        </section>

        <section className="recipe-library" aria-labelledby="koleksi-resipi-title">
          <div className="library-heading">
            <div>
              <span className="library-kicker">{recipePresets.length} RESIPI PILIHAN</span>
              <h2 id="koleksi-resipi-title">Koleksi Resipi Pilihan</h2>
              <p>Cari resipi, pilih satu dan bahan akan terus masuk ke kalkulator dengan hidangan asal.</p>
            </div>
            <span className="library-count">{filteredRecipes.length} resipi</span>
          </div>

          <div className="library-tools">
            <div className="library-search">
              <Search aria-hidden="true" />
              <label className="sr-only" htmlFor="recipe-library-search">Cari resipi atau bahan</label>
              <Input
                id="recipe-library-search"
                value={recipeSearch}
                onChange={(event) => setRecipeSearch(event.target.value)}
                placeholder="Cari ayam, ikan, sambal..."
              />
            </div>
            <div className="category-filters" aria-label="Tapis kategori resipi">
              {recipeCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={recipeCategory === category ? 'active' : ''}
                  onClick={() => setRecipeCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="recipe-card-grid">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className={`recipe-preset-card ${selectedRecipeId === recipe.id ? 'selected' : ''}`}
                >
                  <div className="recipe-card-topline">
                    <span className="recipe-category-icon" aria-hidden="true">
                      {categoryEmoji[recipe.category] ?? '🍽️'}
                    </span>
                    <span className="recipe-category">{recipe.category}</span>
                    {selectedRecipeId === recipe.id && <span className="selected-label">Dipilih</span>}
                  </div>
                  <h3>{recipe.name}</h3>
                  <div className="recipe-meta">
                    <span><Users aria-hidden="true" /> {recipe.servings} orang</span>
                    {recipe.minutes && <span><Clock3 aria-hidden="true" /> {recipe.minutes} min</span>}
                    <span>{recipe.ingredients.length} bahan</span>
                  </div>
                  <p>{recipe.ingredients.slice(0, 3).join(' • ')}</p>
                  <div className="recipe-card-actions">
                    <Button type="button" onClick={() => loadRecipePreset(recipe)}>Guna resipi</Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="method-button"
                      onClick={() => setActiveMethodRecipe(recipe)}
                    >
                      <BookOpen aria-hidden="true" /> Cara masak
                    </Button>
                    <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
                      Sumber <ExternalLink aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="library-empty">
              <Search aria-hidden="true" />
              <p>Tiada resipi sepadan. Cuba nama bahan atau kategori lain.</p>
            </div>
          )}

          <p className="library-source-note">
            Data bahan, hidangan dan ringkasan cara memasak dirujuk daripada sumber yang dipautkan pada setiap kad. Cal-Cook-Lator bukan laman rasmi atau berafiliasi dengan penerbit resipi tersebut.
          </p>
        </section>

        <Dialog open={Boolean(activeMethodRecipe)} onOpenChange={(open) => { if (!open) setActiveMethodRecipe(null); }}>
          {activeMethodRecipe && (
            <DialogContent className="recipe-method-dialog">
              <DialogHeader className="method-dialog-header">
                <div className="method-dialog-category">
                  <span aria-hidden="true">{categoryEmoji[activeMethodRecipe.category] ?? '🍽️'}</span>
                  {activeMethodRecipe.category}
                </div>
                <DialogTitle>{activeMethodRecipe.name}</DialogTitle>
                <DialogDescription>Ringkasan langkah memasak yang mudah diikuti, dengan pautan ke sumber asal.</DialogDescription>
                <div className="method-dialog-meta">
                  <span><Users aria-hidden="true" /> {activeMethodRecipe.servings} orang</span>
                  {activeMethodRecipe.minutes && <span><Clock3 aria-hidden="true" /> {activeMethodRecipe.minutes} minit</span>}
                  <span>{activeMethodRecipe.ingredients.length} bahan</span>
                  <span>{activeMethodRecipe.steps.length} langkah</span>
                </div>
              </DialogHeader>

              <div className="method-dialog-body">
                <section className="method-ingredients" aria-labelledby="method-ingredients-title">
                  <h3 id="method-ingredients-title">Bahan-bahan</h3>
                  <ul>
                    {activeMethodRecipe.ingredients.map((ingredient, index) => (
                      <li key={`${ingredient}-${index}`}><span aria-hidden="true">{index + 1}</span><p>{ingredient}</p></li>
                    ))}
                  </ul>
                </section>

                <section className="method-steps" aria-labelledby="method-steps-title">
                  <h3 id="method-steps-title">Cara memasak</h3>
                  <ol>
                    {activeMethodRecipe.steps.map((step, index) => (
                      <li key={`${activeMethodRecipe.id}-step-${index}`}><span aria-hidden="true">{index + 1}</span><p>{step}</p></li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="method-dialog-footer">
                <Button type="button" onClick={() => loadRecipePreset(activeMethodRecipe)}>Guna dalam kalkulator</Button>
                <a href={activeMethodRecipe.sourceUrl} target="_blank" rel="noreferrer">
                  Lihat sumber asal <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </DialogContent>
          )}
        </Dialog>

        <footer className="site-footer"><span>Cal-Cook-Lator</span><p>Sukatan yang lebih mudah. Majlis yang lebih tenang.</p></footer>
      </div>

      {toast && <output className="toast"><Check /> {toast}</output>}
    </main>
  );
}
