import { ArrowDownRight, ArrowRight, Award, CheckCircle2, Clock3, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { PropertyTypeButtons } from "@/src/components/PropertyTypeButtons";
import { useProperties } from "@/src/hooks/useProperties";
import { propertyImages } from "@/src/lib/mock-data";

export function HomePage() {
  const { properties, loading } = useProperties(true);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${propertyImages.exterior})` }}>
        <div className="hero-overlay" />
        <div className="hero-lines" aria-hidden="true" />
        <div className="site-container hero-content">
          <div className="hero-kicker"><span /> Curadoria imobiliária em São Paulo</div>
          <h1>Seu próximo<br />capítulo começa<br /><em>no lugar certo.</em></h1>
          <p>Imóveis escolhidos com critério. Uma jornada conduzida com clareza, proximidade e segurança.</p>
          <div className="hero-actions">
            <Link className="button button--gold" to="/imoveis">Explorar imóveis <ArrowRight size={18} /></Link>
            <a className="button button--glass" href="https://wa.me/5511999999999" target="_blank" rel="noreferrer"><MessageCircle size={18} /> Falar com Jorge</a>
          </div>
        </div>
        <a className="scroll-cue" href="#encontre"><span>DESCUBRA</span><ArrowDownRight size={21} /></a>
        <div className="hero-credential"><strong>CRECI</strong><span>123.456-F</span></div>
      </section>

      <section className="find-section section-light" id="encontre">
        <div className="site-container">
          <div className="profile-strip">
            <div className="profile-intro">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=88" alt="Retrato de Jorge Soares" />
              <div><span>Seu corretor</span><h2>Jorge Soares</h2><p>Especialista em imóveis residenciais · CRECI 123.456-F</p></div>
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
            <p>Meu trabalho começa antes da visita e continua depois das chaves. Entendo o que realmente importa para você, seleciono as oportunidades certas e conduzo cada negociação com transparência.</p>
            <p>Atuo com apartamentos, casas e terrenos em São Paulo e região, combinando conhecimento de mercado com um atendimento próximo e sem pressa.</p>
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
            <span className="section-label section-label--gold">Próximo passo</span>
            <h2>Conte-me o que você<br />está buscando.</h2>
            <p>Uma boa escolha começa com uma conversa. Respondo pessoalmente e sem compromisso.</p>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="whatsapp-direct"><MessageCircle /> <span><small>Prefere WhatsApp?</small><strong>(11) 99999-9999</strong></span></a>
          </div>
          <form className="contact-form" onSubmit={(event) => { event.preventDefault(); alert("Mensagem recebida! Jorge entrará em contato em breve."); }}>
            <div className="field-row"><label>Nome<input required name="nome" placeholder="Como posso chamar você?" /></label><label>Telefone<input required name="telefone" placeholder="(11) 99999-9999" /></label></div>
            <label>E-mail<input type="email" name="email" placeholder="voce@email.com" /></label>
            <label>O que você procura?<select name="interesse" defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Comprar um imóvel</option><option>Vender meu imóvel</option><option>Avaliação imobiliária</option><option>Outro assunto</option></select></label>
            <label>Mensagem<textarea name="mensagem" rows={4} placeholder="Conte um pouco sobre o seu momento..." /></label>
            <button className="button button--gold" type="submit">Enviar mensagem <ArrowRight size={18} /></button>
          </form>
        </div>
      </section>
    </>
  );
}
