import { Avatar } from './Avatar';
import './table.css';

/** Channel column of the Live table: Avatar 40 (with the on-air ring when live), name, note. */
export function ChannelCell({ name, note, live = false }: { name: string; note?: string; live?: boolean }) {
  return (
    <div className="hr-channel">
      <Avatar name={name} size={40} live={live} />
      <span className="hr-channel__text">
        <span className="hr-channel__name">{name}</span>
        {note ? <span className="hr-channel__note">{note}</span> : null}
      </span>
    </div>
  );
}
