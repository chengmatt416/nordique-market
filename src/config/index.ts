'use client';

import { BrandConfig } from './brand';

export function useBrand() {
  return BrandConfig;
}

export function getBrandColor(color: keyof typeof BrandConfig.colors): string {
  return BrandConfig.colors[color];
}

export { BrandConfig };