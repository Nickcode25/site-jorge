import { MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { whatsappDisplay, whatsappUrl } from "@/src/lib/contact";

export function Footer() {
  return (
    <footer className="footer">
      <div className="site-container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-main">JORGE</span><span className="brand-accent">SOARES</span><span className="brand-tag">IMÓVEIS</span>
          </div>
          <p>Cada detalhe importa. Trabalho com transparência e visão de longo prazo em cada negociação.</p>
        </div>
        <div>
          <span className="footer-title">Navegação</span>
          <Link to="/">Início</Link><Link to="/imoveis">Imóveis</Link><Link to="/#sobre">Sobre</Link><Link to="/admin/login">Área do corretor</Link>
        </div>
        <div>
          <span className="footer-title">Contato</span>
          <a href={whatsappUrl("Olá Jorge! Vim pelo seu site e gostaria de conversar.")} target="_blank" rel="noreferrer"><MessageCircle size={15} /> {whatsappDisplay}</a>
          <span><MapPin size={15} /> Viçosa e região</span>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>© {new Date().getFullYear()} Jorge Soares Imóveis</span><span>CRECI PJ: 8467 · Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
