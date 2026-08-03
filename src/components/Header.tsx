"use client";

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { whatsappUrl } from "@/src/lib/contact";

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

  return (
    <header className={`site-header ${overHero ? "site-header--hero" : "site-header--solid"}`}>
      <div className="site-container header-inner">
        <Link to="/" className="header-brand" aria-label="JLS Negócios Imobiliários — início" onClick={() => setOpen(false)}>
          <img src="/brand/logo-jls.png" alt="JLS Negócios Imobiliários" />
        </Link>

        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu" aria-expanded={open}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`main-nav ${open ? "main-nav--open" : ""}`} aria-label="Navegação principal">
          {nav.map((item) => (
            <NavLink key={item.label} to={item.to} onClick={() => setOpen(false)} className={({ isActive }) => (isActive && item.to !== "/" ? "active" : "")}>
              {item.label}
            </NavLink>
          ))}
          <a className="nav-cta" href={whatsappUrl("Olá Jorge! Gostaria de agendar uma conversa.")} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>Falar no WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}
