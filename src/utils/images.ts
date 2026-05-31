export const backCard = require('../../assets/tcg-card-back-2x.jpg');
export const pokeballImg = require('../../assets/poketball-open.png');

export function getTckImageUrl(image?: string | null): string | null {
  return image ? `${image}/high.webp` : null;
}
