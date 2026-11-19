import { Link } from 'react-router';
import { SCREEN_ROUTES } from './routes';

export function Index() {
  const screens = SCREEN_ROUTES.filter((r) => !r.path.slice(1).includes('/'));
  const states = SCREEN_ROUTES.filter((r) => r.path.slice(1).includes('/') && !r.flow);
  const flow = SCREEN_ROUTES.filter((r) => r.flow);
  return (
    <main className="g-page" id="main">
      <h1 className="g-h1">hemreel UI kit</h1>
      <p className="g-lede">Tokens, every component in every state, and the product screens and flows built only from the kit. Everything renders from fixtures.</p>
      <div className="g-index">
        <h2>Kit</h2>
        <Link to="/foundations"><strong>Foundations</strong><span>Colour, type, space, radii, shadows, focus, motion, heights</span></Link>
        <Link to="/components"><strong>Components</strong><span>Every component, variant and state</span></Link>
        <h2>Screens</h2>
        {screens.map((r) => <Link key={r.path} to={r.path}><strong>{r.title}</strong><span>{r.note}</span></Link>)}
        <h2>States</h2>
        {states.map((r) => <Link key={r.path} to={r.path}><strong>{r.title}</strong><span>{r.note}</span></Link>)}
        <h2>The money path, state by state</h2>
        {flow.map((r) => <Link key={r.path} to={r.path}><strong>{r.title}</strong><span>{r.note}</span></Link>)}
      </div>
    </main>
  );
}
