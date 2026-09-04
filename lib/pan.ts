export type PanShape = 'round' | 'square' | 'rectangle';

export type PanDimensions = {
  shape: PanShape;
  width: number;
  length?: number;
};

export function getPanArea({ shape, width, length }: PanDimensions) {
  const safeWidth = Math.max(0, width || 0);
  if (shape === 'round') return Math.PI * (safeWidth / 2) ** 2;
  if (shape === 'square') return safeWidth ** 2;
  return safeWidth * Math.max(0, length || 0);
}

export function getPanScaleFactor(original: PanDimensions, target: PanDimensions) {
  const originalArea = getPanArea(original);
  const targetArea = getPanArea(target);
  if (!originalArea || !targetArea) return 1;
  return targetArea / originalArea;
}
