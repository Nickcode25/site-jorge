import { ArrowDownRight, ArrowRight, Award, CheckCircle2, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyTypeButtons } from "@/src/components/PropertyTypeButtons";
import { useProperties } from "@/src/hooks/useProperties";
import { whatsappDisplay, whatsappUrl } from "@/src/lib/contact";
import { propertyImages } from "@/src/lib/mock-data";

export function HomePage() {
  const { properties, loading } = useProperties(true);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${propertyImages.exterior})` }}>
        <div className="hero-overlay" />
        <div className="hero-lines" aria-hidden="true" />
        <div className="site-container hero-content">
          <div className="hero-kicker"><span /> Curadoria imobiliária em Viçosa e região</div>
          <h1>Seu próximo<br />capítulo começa<br /><em>no lugar certo.</em></h1>
          <p>Imóveis escolhidos com critério. Uma jornada conduzida com clareza, proximidade e segurança.</p>
          <div className="hero-actions">
            <Link className="button button--gold" to="/imoveis">Explorar imóveis <ArrowRight size={18} /></Link>
            <a className="button button--glass" href={whatsappUrl("Olá Jorge! Gostaria de conversar sobre um imóvel.")} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Falar com Jorge</a>
          </div>
        </div>
        <a className="scroll-cue" href="#encontre"><span>DESCUBRA</span><ArrowDownRight size={21} /></a>
        <div className="hero-credential"><strong>CRECI PJ</strong><span>8467</span></div>
      </section>

      <section className="find-section section-light" id="encontre">
        <div className="site-container">
          <div className="profile-strip">
            <div className="profile-intro">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=88" alt="Retrato de Jorge Soares" />
              <div><span>Seu corretor</span><h2>Jorge Soares</h2><p>Especialista em imóveis residenciais · CRECI PJ: 8467</p></div>
            </div>
            <p className="profile-quote">“O imóvel certo não é apenas uma escolha financeira. É o cenário da vida que você quer viver.”</p>
          </div>
          <div className="section-heading split-heading">
            <div><span className="section-label">Encontre do seu jeito</span><h2>Que tipo de imóvel<br />você procura?</h2></div>
            <p>Comece pela categoria que combina com o seu momento. Eu cuido dos detalhes a partir daqui.</p>
          </div>
          <PropertyTypeButtons />
        </div>
      </section>

      <section className="featured-section">
        <div className="site-container">
          <div className="section-heading featured-heading">
            <div><span className="section-label section-label--gold">Seleção do corretor</span><h2>Imóveis em <em>destaque</em></h2></div>
            <p>Uma curadoria de oportunidades que unem localização, arquitetura e valor.</p>
          </div>
          {loading ? <PageLoader /> : <div className="property-grid property-grid--featured">{properties.map((property) => <PropertyCard key={property.id} property={property} compact />)}</div>}
          <div className="center-action"><Link to="/imoveis" className="button button--outline-light">Ver todos os imóveis <ArrowRight size={18} /></Link></div>
        </div>
      </section>

      <section className="about-section section-light" id="sobre">
        <div className="site-container about-grid">
          <div className="about-visual">
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=90" alt="Jorge Soares, corretor de imóveis" />
            <div className="experience-stamp"><strong>12</strong><span>anos conectando<br />pessoas e lugares</span></div>
          </div>
          <div className="about-copy">
            <span className="section-label">Sobre Jorge Soares</span>
            <h2>Uma escolha importante pede uma conversa <em>honesta.</em></h2>
            <p>Meu trabalho começa antes da visita e não termina na entrega das chaves. Busco entender o que realmente importa para você, seleciono as oportunidades certas e conduzo cada negociação com transparência.</p>
            <p>Atuo com apartamentos, casas e terrenos em Viçosa e região, unindo conhecimento de mercado a um atendimento próximo, atento e sem pressa.</p>
            <div className="about-values">
              <span><ShieldCheck /> Segurança em cada etapa</span>
              <span><Award /> Curadoria especializada</span>
              <span><Clock3 /> Disponibilidade real</span>
              <span><CheckCircle2 /> Negociação transparente</span>
            </div>
            <Link to="/#contato" className="text-link">Vamos conversar <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contato">
        <div className="site-container contact-grid">
          <div>
            <span className="section-label section-label--gold">Contato direto</span>
            <h2>Uma conversa pode<br />ser o primeiro passo.</h2>
            <p>Sem formulários e sem espera. Fale diretamente comigo pelo WhatsApp para tirar dúvidas, receber sugestões ou agendar uma visita.</p>
            <a href={whatsappUrl("Olá Jorge! Gostaria de saber mais sobre os imóveis disponíveis.")} target="_blank" rel="noreferrer" className="whatsapp-direct"><MessageCircle /> <span><small>WhatsApp</small><strong>{whatsappDisplay}</strong></span></a>
          </div>
          <div className="whatsapp-card">
            <div className="whatsapp-card-icon"><MessageCircle /></div>
            <span className="whatsapp-card-label">Atendimento pelo WhatsApp</span>
            <h3>Fale diretamente<br />com Jorge Soares.</h3>
            <p>Conte o que procura e receba um atendimento pessoal, claro e sem compromisso.</p>
            <div className="whatsapp-benefits">
              <span><CheckCircle2 /> Resposta pessoal</span>
              <span><CheckCircle2 /> Informações dos imóveis</span>
              <span><CheckCircle2 /> Agendamento de visitas</span>
            </div>
            <a className="button button--whatsapp whatsapp-card-button" href={whatsappUrl("Olá Jorge! Vim pelo seu site e gostaria de conversar sobre um imóvel.")} target="_blank" rel="noreferrer">Iniciar conversa <ArrowRight size={18} /></a>
            <small>{whatsappDisplay}</small>
          </div>
        </div>
      </section>
    </>
  );
}
