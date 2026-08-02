import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="site-container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-main">JORGE</span><span className="brand-accent">SOARES</span><span className="brand-tag">IMÓVEIS</span>
          </div>
          <p>Curadoria imobiliária com atenção aos detalhes, transparência e visão de longo prazo.</p>
        </div>
        <div>
          <span className="footer-title">Navegação</span>
          <Link to="/">Início</Link><Link to="/imoveis">Imóveis</Link><Link to="/#sobre">Sobre</Link><Link to="/admin/login">Área do corretor</Link>
        </div>
        <div>
          <span className="footer-title">Contato</span>
          <a href="tel:+5511999999999"><Phone size={15} /> (11) 99999-9999</a>
          <a href="mailto:contato@jorgesoares.com.br"><Mail size={15} /> contato@jorgesoares.com.br</a>
          <span><MapPin size={15} /> São Paulo e região</span>
          <a href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={15} /> @jorgesoares.imoveis</a>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} Jorge Soares Imóveis</span><span>CRECI 123.456-F · Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
