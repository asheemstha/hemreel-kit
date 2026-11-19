import { RotateCw } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { CheckRow } from '@/ui/CheckRow';
import { SectionHeader } from '@/ui/Divider';
import { Field } from '@/ui/Field';
import { RadioCard, RadioCardGroup } from '@/ui/RadioCard';
import { ScoreBadge } from '@/ui/ScoreBadge';
import { SettingsRow } from '@/ui/SettingsRow';
import { SpendMeter } from '@/ui/SpendMeter';
import { Toggle } from '@/ui/Toggle';
import { TopBar } from '@/ui/TopBar';
import { useDue } from '@/state/clips';
import { ScreenFrame, useFrame } from './Frame';

function Top() {
  const { openHelp } = useFrame();
  const due = useDue();
  return <TopBar title="Settings" due={due} onHelp={openHelp} />;
}

export function SettingsScreen() {
  return (
    <ScreenFrame title="Settings" nav="sidebar" current="settings" topBar={<Top />}>
      <div className="sc-settings">
        <div className="sc-stack sc-gap-24">
          <Card as="section" aria-labelledby="accounts" header={<SectionHeader id="accounts" title="Posting accounts" note="Clips post from these accounts" />} divided>
            <SettingsRow title="TikTok" note="[YOUR HANDLE]" status="connected" action={<Button size="sm" kind="ghost">Disconnect</Button>} />
            <SettingsRow title="Instagram Reels" note="[YOUR HANDLE] · session expired" status="needs-sign-in" action={<Button size="sm">Sign in again</Button>} />
            <SettingsRow title="YouTube Shorts" note="Not set up" status="disconnected" action={<Button size="sm">Connect</Button>} />
            <SettingsRow title="X" note="Not set up" status="disconnected" action={<Button size="sm">Connect</Button>} />
            <div className="sc-pad">
              <Field label="Default hashtags" defaultValue="#ad #fyp" help="Added to every caption. #ad stays in when you edit." />
            </div>
          </Card>
          <Card as="section" aria-labelledby="checks" header={<SectionHeader id="checks" title="System checks" note="Last run 2 min ago" action={<Button size="sm" icon={<RotateCw />}>Run again</Button>} />} divided>
            <CheckRow name="Video tools" value="Installed" status="ok" />
            <CheckRow name="Free disk space" value="[FREE SPACE]" status="warning" statusLabel="Low" />
            <CheckRow name="Chat replay access" value="Twitch, YouTube, Kick" status="ok" />
            <CheckRow name="Posting service" value="No answer" status="failed" />
            <CheckRow name="Captions model" value="Checking" status="running" />
          </Card>
        </div>
        <Card as="section" aria-labelledby="ai" header={<SectionHeader id="ai" title="AI scoring" note="Scores are a guess, not a promise of views" />}>
          <div className="sc-stack sc-gap-24">
            <Toggle defaultChecked label="Score clips with AI" description="Each clip gets a 0 to 100 score and a reason in plain words." />
            <SpendMeter />
            <RadioCardGroup label="When the cap is reached" defaultValue="pause" layout="stack">
              <RadioCard value="pause" title="Pause scoring until midnight">Moments are still found and rendered. They show as Not scored.</RadioCard>
              <RadioCard value="ask" title="Ask me first">Scoring waits until you raise the cap or say no.</RadioCard>
            </RadioCardGroup>
            <div className="sc-stack">
              <h3 className="sc-h3">Score bands</h3>
              <ul className="sc-bands">
                <li><ScoreBadge score={91} showWord showNumber={false} /><span className="hr-tnum">65 to 100</span><span>Likely worth posting</span></li>
                <li><ScoreBadge score={52} showWord showNumber={false} /><span className="hr-tnum">40 to 64</span><span>Watch before you decide</span></li>
                <li><ScoreBadge score={22} showWord showNumber={false} /><span className="hr-tnum">0 to 39</span><span>Usually skipped</span></li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </ScreenFrame>
  );
}
