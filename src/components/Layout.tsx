import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function Layout() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(currentTheme);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('algo-lab:theme', next); } catch { /* ignore */ }
    window.dispatchEvent(new Event('algo-lab:theme'));
    setTheme(next);
  };

  return (
    <>
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Algo Lab หน้าแรก">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span className="word">Algo Lab</span>
        </NavLink>
        <nav>
          <NavLink to="/" end>บทเรียน</NavLink>
          <NavLink to="/assigned">ตารางทำโจทย์</NavLink>
          <NavLink to="/exam">เส้นทางสอบ</NavLink>
          <NavLink to="/plan">โจทย์ทั้งหมด</NavLink>
        </nav>
        <button className="theme-toggle" onClick={toggle} aria-label={theme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'} title="สลับธีม">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </header>
      <main className={pathname.startsWith('/p/') ? 'main wide' : 'main'}>
        <Outlet />
      </main>
    </>
  );
}
