"use client";

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const nav = [
  { label: "Home", to: "/" },
  { label: "Imóveis", to: "/imoveis" },
  { label: "Sobre", to: "/#sobre" },
  { label: "Contato", to: "/#contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const overHero = location.pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header className={`site-header ${overHero ? "site-header--hero" : "site-header--solid"}`}>
      <div className="site-container header-inner">
        <Link to="/" className="brand" aria-label="Jorge Soares — início">
          <span className="brand-main">JORGE</span>
          <span className="brand-accent">SOARES</span>
          <span className="brand-tag">IMÓVEIS</span>
        </Link>

        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`main-nav ${open ? "main-nav--open" : ""}`} aria-label="Navegação principal">
          {nav.map((item) => (
            <NavLink key={item.label} to={item.to} className={({ isActive }) => (isActive && item.to !== "/" ? "active" : "")}>
              {item.label}
            </NavLink>
          ))}
          <Link className="nav-cta" to="/#contato">Agendar conversa</Link>
        </nav>
      </div>
    </header>
  );
}
