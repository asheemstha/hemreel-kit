// Caption styling the app offers. These colours and fonts are burned into the video, so they are content, not UI tokens.

export interface Swatch {
  /** Hex colour, six digits, capitals. */
  value: string;
  /** Spoken name, for assistive tech. */
  name: string;
}

/** The twelve caption colours, in the order the app shows them. */
export const CAPTION_PALETTE: readonly Swatch[] = [
  { value: '#FFFFFF', name: 'White' }, // check-tokens: allow
  { value: '#000000', name: 'Black' }, // check-tokens: allow
  { value: '#FFE100', name: 'Yellow' }, // check-tokens: allow
  { value: '#FF4500', name: 'Orange red' }, // check-tokens: allow
  { value: '#2BFF88', name: 'Green' }, // check-tokens: allow
  { value: '#00E5FF', name: 'Cyan' }, // check-tokens: allow
  { value: '#FF2D95', name: 'Pink' }, // check-tokens: allow
  { value: '#A259FF', name: 'Purple' }, // check-tokens: allow
  { value: '#FF6A28', name: 'Orange' }, // check-tokens: allow
  { value: '#FFD257', name: 'Gold' }, // check-tokens: allow
  { value: '#111111', name: 'Near black' }, // check-tokens: allow
  { value: '#1E90FF', name: 'Blue' }, // check-tokens: allow
];

/** The same colours as plain hex strings. */
export const CAPTION_SWATCHES: readonly string[] = CAPTION_PALETTE.map((s) => s.value);

/** Caption fonts. All ship with macOS, so each can be drawn in itself without loading anything. */
export const CAPTION_FONTS = ['Arial Black', 'Impact', 'Helvetica Neue', 'Avenir Next', 'Futura', 'Verdana', 'Georgia'] as const;
export type CaptionFont = (typeof CAPTION_FONTS)[number];

/** The stack a caption font is drawn with: the font itself, then the app's fallback. */
export function captionFontStack(name: string): string {
  return `"${name}", "Arial Black", sans-serif`;
}

export interface TemplateVariable {
  /** Written in the template as {token}. */
  token: string;
  /** Shown on the insert button. */
  label: string;
  /** What the preview puts in its place. */
  sample: string;
}

/** Variables the caption writer fills in (app/services/captions.py). */
export const TEMPLATE_VARIABLES: readonly TemplateVariable[] = [
  { token: 'hook', label: 'Hook', sample: 'He did not see that coming' },
  { token: 'quote', label: 'Quote', sample: 'Wait for it' },
  { token: 'streamer', label: 'Streamer', sample: 'Tomo' },
  { token: 'topic', label: 'Game or topic', sample: 'GTA 6' },
  { token: 'tag', label: 'Required tag', sample: '#ad' },
  { token: 'streamer_line', label: 'Streamer line', sample: 'Tomo in GTA 6' },
  { token: 'hashtags', label: 'Hashtags', sample: '#ad #gta6 #tomo #fyp' },
];

/** The app's default caption template. */
export const DEFAULT_CAPTION_TEMPLATE = '{hook}\n\n{streamer_line}\n{hashtags}';
