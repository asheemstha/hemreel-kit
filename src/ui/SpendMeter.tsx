import { CircleAlert, CircleCheck, Clock } from 'lucide-react';
import { useState } from 'react';
import { Field } from './Field';
import { Meter } from './Meter';
import './spend-meter.css';

export type SpendState = 'under' | 'near' | 'cap';

export interface SpendMeterProps {
  /** Daily cap in dollars. Placeholder: $5.00 (see section 13). */
  cap?: number;
  /** Spent today in dollars. Placeholder: $1.20. */
  used?: number;
  onCapChange?: (cap: number) => void;
  /** Share of the cap at which the meter turns to the near-cap state. */
  nearAt?: number;
}

const money = (n: number) => `$${n.toFixed(2)}`;
const parseMoney = (s: string) => Number(s.replace(/[^0-9.]/g, ''));

export function spendState(used: number, cap: number, nearAt = 0.8): SpendState {
  if (cap <= 0 || used >= cap) return 'cap';
  return used / cap >= nearAt ? 'near' : 'under';
}

/** Money field "Daily spending cap" beside an 8 px meter. Near cap uses --due, at cap --fail with "Scoring is paused." */
export function SpendMeter({ cap: capProp = 5, used = 1.2, onCapChange, nearAt = 0.8 }: SpendMeterProps) {
  const [text, setText] = useState(capProp.toFixed(2));
  const parsed = parseMoney(text);
  const cap = text.trim() !== '' && Number.isFinite(parsed) ? parsed : capProp;
  const state = spendState(used, cap, nearAt);
  const left = Math.max(0, cap - used);
  const Icon = state === 'cap' ? CircleAlert : state === 'near' ? Clock : CircleCheck;
  return (
    <div className="hr-spend" data-state={state}>
      <Field
        label="Daily spending cap"
        type="money"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const v = parseMoney(e.target.value);
          if (Number.isFinite(v)) onCapChange?.(v);
        }}
      />
      <div className="hr-spend__meter">
        <p className="hr-spend__used hr-tnum">{money(Math.min(used, cap))} used today</p>
        <Meter
          value={Math.min(used, cap)}
          max={cap > 0 ? cap : 1}
          height={8}
          variant={state === 'near' ? 'due' : 'default'}
          label="Spent today on AI scoring"
          valueText={`${money(used)} of ${money(cap)}`}
        />
        <p className="hr-spend__left hr-tnum">
          <Icon aria-hidden="true" />
          {state === 'cap' ? (
            <span><strong>Scoring is paused.</strong> Resets at midnight.</span>
          ) : state === 'near' ? (
            <span><strong>Near the cap.</strong> {money(left)} left · resets at midnight</span>
          ) : (
            <span>{money(left)} left · resets at midnight</span>
          )}
        </p>
      </div>
    </div>
  );
}
