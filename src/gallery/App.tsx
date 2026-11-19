import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router';
import type { ReactNode } from 'react';
import { ClockProvider } from '@/hooks/clock';
import { TooltipProvider } from '@/ui/Tooltip';
import { Logo } from '@/ui/Logo';
import { Components, ReducedMotionToggle } from './Components';
import { Foundations } from './Foundations';
import { Index } from './Index';
import { SCREEN_ROUTES } from './routes';
import './gallery.css';

function GalleryChrome({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <>
      <a className="g-skip" href="#main">Skip to content</a>
      <header className="g-topnav">
        <Link to="/" aria-label="hemreel UI kit, index"><Logo /></Link>
        <nav className="g-topnav__links" aria-label="Gallery">
          <NavLink to="/" end>Index</NavLink>
          <NavLink to="/foundations">Foundations</NavLink>
          <NavLink to="/components">Components</NavLink>
          <NavLink to="/home">Screens</NavLink>
        </nav>
        <div className="g-topnav__end">{pathname === '/components' || pathname === '/foundations' ? <ReducedMotionToggle /> : null}</div>
      </header>
      {children}
    </>
  );
}

function Clocked({ children }: { children: ReactNode }) {
  const [params] = useSearchParams();
  return <ClockProvider frozen={params.has('freeze')}>{children}</ClockProvider>;
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
      <Clocked>
        <TooltipProvider>
          <Routes>
            <Route path="/" element={<GalleryChrome><Index /></GalleryChrome>} />
            <Route path="/foundations" element={<GalleryChrome><Foundations /></GalleryChrome>} />
            <Route path="/components" element={<GalleryChrome><Components /></GalleryChrome>} />
            {SCREEN_ROUTES.map((r) => (
              <Route key={r.path} path={r.path} element={<r.Component />} />
            ))}
          </Routes>
        </TooltipProvider>
      </Clocked>
    </BrowserRouter>
  );
}
