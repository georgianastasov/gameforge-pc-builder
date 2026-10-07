/** Original App Builder images, downloaded locally into `src/assets/pngs/`. */
const png = (file: string) => `/assets/pngs/${file}.png`;

/** PC Builder hardware slot cards, in slot order. */
export const PC_BUILDER_SLOT_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8].map(n => png(`pc-builer-${n}`));

/** Build Summary hardware cards, in slot order. */
export const BUILD_SUMMARY_IMAGES = [1, 2, 3, 4, 5].map(n => png(`summary-${n}`));

/** Picks the image for the card at `index`, starting over from the first image when the list runs out. */
export function cardImage(images: readonly string[], index: number): string {
  return images[index % images.length];
}
