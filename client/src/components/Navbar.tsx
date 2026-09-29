import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { navItems } from '../data/mockData';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = () => setIsOpen(false);

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav container" aria-label="Main navigation">
        <NavLink to="/" className="brand" onClick={handleLinkClick}>
          M Nithya Shree
        </NavLink>

        <div className="nav-actions">
          <ThemeToggle theme={theme} setTheme={setTheme} />

          <button
            type="button"
            className="menu-button"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
