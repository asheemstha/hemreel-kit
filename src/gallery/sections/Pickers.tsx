import { useState, type ComponentProps } from 'react';
import { CAPTION_FONTS, DEFAULT_CAPTION_TEMPLATE, TEMPLATE_VARIABLES } from '@/data/captionStyle';
import { FEATURED } from '@/data/fixtures';
import { T0 } from '@/hooks/clock';
import { ColorField } from '@/ui/ColorField';
import { addDays, DatePicker, toISODate, type DateRange } from '@/ui/DatePicker';
import { FontPicker } from '@/ui/FontPicker';
import { TagInput } from '@/ui/TagInput';
import { TemplateField } from '@/ui/TemplateField';
import { GalleryGroup, GallerySection, Row, Specimen } from '../Specimen';

// Caption colours are content. These are the app's own defaults plus one colour that is not in the palette.
const WHITE = '#FFFFFF'; // check-tokens: allow
const YELLOW = '#FFE100'; // check-tokens: allow
const BLACK = '#000000'; // check-tokens: allow
const NEAR_BLACK = '#111111'; // check-tokens: allow
const CUSTOM = '#7CFFB2'; // check-tokens: allow

const TODAY = toISODate(new Date(T0));
const TITLE_VARIABLES = TEMPLATE_VARIABLES.filter((v) => ['hook', 'quote', 'streamer', 'topic'].includes(v.token));
const plainTag = (tag: string) => (/^#\w+$/.test(tag) ? null : 'Use letters, numbers and underscores only.');

function LiveColor({ label, initial, help, disabled }: { label: string; initial: string; help?: string; disabled?: boolean }) {
  const [v, setV] = useState(initial);
  return <ColorField label={label} value={v} onValueChange={setV} help={help} disabled={disabled} />;
}

function LiveFont({ initial, sample, disabled }: { initial: string; sample?: string; disabled?: boolean }) {
  const [v, setV] = useState(initial);
  return <FontPicker label="Caption font" value={v} onValueChange={setV} fonts={CAPTION_FONTS} sample={sample} disabled={disabled} />;
}

function LiveTags({ label, initial, ...rest }: { label: string; initial: string[] } & Omit<ComponentProps<typeof TagInput>, 'label' | 'value' | 'onChange'>) {
  const [tags, setTags] = useState(initial);
  return <TagInput label={label} value={tags} onChange={setTags} prefix="#" {...rest} />;
}

function LiveTemplate({ label, initial, ...rest }: { label: string; initial: string } & Omit<ComponentProps<typeof TemplateField>, 'label' | 'value' | 'onChange' | 'variables'> & { variables?: ComponentProps<typeof TemplateField>['variables'] }) {
  const [v, setV] = useState(initial);
  return <TemplateField label={label} value={v} onChange={setV} variables={rest.variables ?? TEMPLATE_VARIABLES} {...rest} />;
}

function LiveDate({ label, initial, min, max, disabled }: { label: string; initial: string | null; min?: string; max?: string; disabled?: boolean }) {
  const [v, setV] = useState(initial);
  return <DatePicker label={label} value={v} onChange={setV} min={min} max={max} disabled={disabled} />;
}

function LiveRange({ label, initial, max }: { label: string; initial: DateRange; max?: string }) {
  const [v, setV] = useState(initial);
  return <DatePicker mode="range" label={label} value={v} onChange={setV} max={max} />;
}

export function PickersSection() {
  return (
    <GalleryGroup id="pickers" title="Pickers and tags">
      <GallerySection id="color-field" title="ColorField" note="A swatch button that opens the 12 caption colours and a hex field. Arrow keys move through the palette.">
        <Specimen label="caption text · highlight · background" wide>
          <Row gap={16} align="start">
            <LiveColor label="Caption text" initial={WHITE} />
            <LiveColor label="Highlight" initial={YELLOW} />
            <LiveColor label="Background" initial={BLACK} />
          </Row>
        </Specimen>
        <Specimen label="with help">
          <LiveColor label="Outline" initial={NEAR_BLACK} help="Drawn round every letter." />
        </Specimen>
        <Specimen label="a colour that is not in the palette">
          <LiveColor label="Highlight" initial={CUSTOM} />
        </Specimen>
        <Specimen label="disabled">
          <LiveColor label="Background" initial={BLACK} disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="font-picker" title="FontPicker" note="Every option is drawn in its own font. Same list surface as Select.">
        <Specimen label="default">
          <LiveFont initial="Arial Black" />
        </Specimen>
        <Specimen label="options drawn with the clip's hook">
          <LiveFont initial="Impact" sample={FEATURED.hook.toUpperCase()} />
        </Specimen>
        <Specimen label="disabled">
          <LiveFont initial="Futura" disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="tag-input" title="TagInput" note="Enter, comma or space adds a tag. Backspace removes the last one. Paste a list to add them all.">
        <Specimen label="required tag (locked) · limit of 5">
          <LiveTags label="Hashtags" initial={['#ad', '#gta6', '#tomo', '#fyp']} locked={['#ad']} max={5} placeholder="Add a hashtag" help="#ad is required by this campaign." />
        </Specimen>
        <Specimen label="empty with placeholder">
          <LiveTags label="Discovery tags for TikTok" initial={[]} placeholder="Add a tag" />
        </Specimen>
        <Specimen label="refuses a tag: try #gta-6">
          <LiveTags label="Streamer tags" initial={['#tomo', '#tomoclips']} placeholder="Add a tag" validate={plainTag} />
        </Specimen>
        <Specimen label="invalid">
          <LiveTags label="Hashtags" initial={['#gta6', '#tomo']} placeholder="Add a hashtag" error="Add #ad before posting." />
        </Specimen>
        <Specimen label="many tags wrap onto more lines">
          <LiveTags label="Hashtags" initial={['#ad', '#gta6', '#tomo', '#fyp', '#gtaclips', '#launchnight', '#gaming', '#viral']} locked={['#ad']} placeholder="Add a hashtag" />
        </Specimen>
        <Specimen label="disabled">
          <LiveTags label="Hashtags" initial={['#ad', '#gta6']} locked={['#ad']} disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="template-field" title="TemplateField" note="The buttons insert a variable at the caret. The preview fills each variable with a sample.">
        <Specimen label="caption template">
          <LiveTemplate label="Caption template" initial={DEFAULT_CAPTION_TEMPLATE} help="Used for TikTok, Reels and Shorts. X gets the hook and the hashtags." />
        </Specimen>
        <Specimen label="two rows · fewer variables">
          <LiveTemplate label="YouTube title" initial="{streamer}: {hook}" rows={2} variables={TITLE_VARIABLES} />
        </Specimen>
        <Specimen label="unknown variable">
          <LiveTemplate label="Caption template" initial={'{hook}\n{game} {hashtags}'} rows={2} />
        </Specimen>
        <Specimen label="empty">
          <LiveTemplate label="YouTube title" initial="" rows={2} variables={TITLE_VARIABLES} />
        </Specimen>
        <Specimen label="disabled">
          <LiveTemplate label="Caption template" initial={DEFAULT_CAPTION_TEMPLATE} disabled />
        </Specimen>
      </GallerySection>

      <GallerySection id="date-picker" title="DatePicker" note="Arrow keys move by day and week, Page Up and Page Down by month. Days outside the allowed range are disabled.">
        <Specimen label="single · empty · today is the first allowed day">
          <LiveDate label="Post on" initial={null} min={TODAY} />
        </Specimen>
        <Specimen label="single · chosen">
          <LiveDate label="Post on" initial={addDays(TODAY, 2)} min={TODAY} />
        </Specimen>
        <Specimen label="range · quick ranges · no later than today">
          <LiveRange label="Earnings period" initial={{ from: addDays(TODAY, -6), to: TODAY }} max={TODAY} />
        </Specimen>
        <Specimen label="range · end still open">
          <LiveRange label="Posted between" initial={{ from: addDays(TODAY, -3), to: null }} max={TODAY} />
        </Specimen>
        <Specimen label="disabled">
          <LiveDate label="Post on" initial={addDays(TODAY, 2)} disabled />
        </Specimen>
      </GallerySection>
    </GalleryGroup>
  );
}
