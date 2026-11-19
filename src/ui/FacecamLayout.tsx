import { Segmented } from './Segmented';

export type FacecamPlacement = 'top' | 'bottom' | 'off';

export interface FacecamLayoutProps {
  value?: FacecamPlacement;
  defaultValue?: FacecamPlacement;
  onValueChange?: (value: FacecamPlacement) => void;
}

const ITEMS: Array<{ value: FacecamPlacement; label: string }> = [
  { value: 'top', label: 'On top' },
  { value: 'bottom', label: 'At the bottom' },
  { value: 'off', label: 'Off' },
];

/** Where the facecam sits in the 9:16 result. A stage Segmented, since it lives on the video stage. */
export function FacecamLayout({ value, defaultValue = 'top', onValueChange }: FacecamLayoutProps) {
  return <Segmented label="Facecam" items={ITEMS} value={value} defaultValue={defaultValue} onValueChange={onValueChange} variant="stage" />;
}
