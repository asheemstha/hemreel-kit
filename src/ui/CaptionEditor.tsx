import { CircleCheck } from 'lucide-react';
import { useState } from 'react';
import { FEATURED, type Platform } from '@/data/fixtures';
import { Checkbox } from './Checkbox';
import { Segmented } from './Segmented';
import { Textarea } from './Textarea';
import './caption-editor.css';

const PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reels', label: 'Reels' },
  { value: 'shorts', label: 'Shorts' },
];
const NAME: Record<Platform, string> = { tiktok: 'TikTok', reels: 'Reels', shorts: 'Shorts' };

export type Captions = Record<Platform, string>;

export interface CaptionEditorProps {
  /** Starting captions. A string means the same caption on all three. */
  initial?: string | Captions;
  initialPlatform?: Platform;
  onChange?: (captions: Captions, same: boolean) => void;
  /** Campaign requires #ad. When true and a caption lacks it, the editor shows the --fail state. */
  requireAd?: boolean;
  id?: string;
}

const hasAd = (s: string) => /(^|\s)#ad\b/i.test(s);

/**
 * Caption per platform. Character count, the #ad check, and "Same caption on all three".
 * Layout: fills the parent's width.
 */
export function CaptionEditor({ initial = FEATURED.caption, initialPlatform = 'tiktok', onChange, requireAd = true, id }: CaptionEditorProps) {
  const start: Captions = typeof initial === 'string' ? { tiktok: initial, reels: initial, shorts: initial } : initial;
  const [captions, setCaptions] = useState<Captions>(start);
  const [same, setSame] = useState(typeof initial === 'string' || (start.tiktok === start.reels && start.reels === start.shorts));
  const [platform, setPlatform] = useState<Platform>(initialPlatform);
  const text = captions[platform];
  const missingAd = requireAd && !hasAd(text);
  const edited = PLATFORMS.filter((p) => captions[p.value] !== captions.tiktok).map((p) => NAME[p.value]);

  const update = (next: Captions, nextSame: boolean) => {
    setCaptions(next);
    onChange?.(next, nextSame);
  };
  const write = (value: string) => update(same ? { tiktok: value, reels: value, shorts: value } : { ...captions, [platform]: value }, same);
  const toggleSame = (v: boolean) => {
    setSame(v);
    if (v) update({ tiktok: text, reels: text, shorts: text }, true);
  };

  return (
    <div className="hr-caption">
      <div className="hr-caption__head">
        <span className="hr-caption__label" id={id ? `${id}-label` : undefined}>Caption</span>
        <Segmented
          label="Caption for platform"
          items={PLATFORMS.map((p) => ({ value: p.value, label: !same && captions[p.value] !== captions.tiktok ? `${p.label} · edited` : p.label }))}
          value={platform}
          onValueChange={setPlatform}
          as="tabs"
        />
      </div>
      <Textarea
        id={id}
        label={`Caption for ${NAME[platform]}`}
        hideLabel
        value={text}
        onChange={(e) => write(e.target.value)}
        error={missingAd ? 'Add #ad before posting' : undefined}
        footer={
          <>
            <span className="hr-tnum">{text.length} characters</span>
            {requireAd && !missingAd ? (
              <span className="hr-caption__check"><CircleCheck aria-hidden="true" />#ad is in</span>
            ) : null}
            <span className="hr-caption__same">
              <Checkbox checked={same} onCheckedChange={toggleSame} label="Same caption on all three" />
            </span>
          </>
        }
      />
      {!same && edited.length > 0 ? <p className="hr-caption__note">Edited for {edited.join(' and ')}. The others use the TikTok caption.</p> : null}
    </div>
  );
}
