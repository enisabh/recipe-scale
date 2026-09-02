'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChefHat,
  CircleHelp,
  Clipboard,
  Copy,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
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
import { formatRecipeForCopy, scaleRecipe } from '@/lib/recipe';

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

  const scaledRecipe = useMemo(
    () => scaleRecipe(recipeText, originalServings, targetServings),
    [recipeText, originalServings, targetServings],
  );

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
    showToast('Resipi telah ditetapkan semula');
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-[1180px]">
        <div className="intro-copy">
          <span className="eyebrow">PASTE • SKALA • SIAP</span>
          <h1>Masak untuk 5 orang atau 500 orang.</h1>
          <p>Tampal resipi, pilih jumlah tetamu dan biar kami kira selebihnya.</p>
        </div>

        <section className="recipe-shell" aria-label="Kalkulator skala resipi">
          <header className="app-header">
            <div className="brand-lockup">
              <span className="brand-icon" aria-hidden="true"><ChefHat /></span>
              <div>
                <p className="brand-name">RECIPE SCALE</p>
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
                    <DialogTitle>Cara menggunakan Recipe Scale</DialogTitle>
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
                <Textarea id="recipe-input" value={recipeText} onChange={(e) => setRecipeText(e.target.value)} className="recipe-textarea" spellCheck="false" />
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

        <footer className="site-footer"><span>Recipe Scale</span><p>Sukatan yang lebih mudah. Majlis yang lebih tenang.</p></footer>
      </div>

      {toast && <output className="toast"><Check /> {toast}</output>}
    </main>
  );
}
