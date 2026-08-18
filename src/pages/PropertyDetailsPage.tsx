"use client";

import {
  ArrowLeft,
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  Ruler,
  Share2,
  Sofa,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, PropertyCard } from "@/src/components/PropertyCard";
import { PageLoader } from "@/src/components/PageLoader";
import { useProperties } from "@/src/hooks/useProperties";
import { whatsappUrl } from "@/src/lib/contact";
import { displaySpecifications } from "@/src/lib/property-config";
import { propertyTypeLabel } from "@/src/types/property";

const specificationIcons = {
  mobilia: Sofa,
  quartos: BedDouble,
  banheiros: Bath,
  banheiro: Bath,
  vagas: Car,
  vagas_totais: Car,
  andar: Building2,
  andares: Building2,
  pavimentos: Building2,
  elevadores_predio: ArrowUpDown,
  elevadores: ArrowUpDown,
} as const;

function SpecificationIcon({ specificationKey }: { specificationKey: string }) {
  const Icon = specificationIcons[specificationKey as keyof typeof specificationIcons]
    ?? (specificationKey.includes("area") ? Ruler : Maximize2);

  return <Icon aria-hidden="true" />;
}

export function PropertyDetailsPage() {
  const { id } = useParams();
  const { properties, loading } = useProperties();
  const [mediaIndex, setMediaIndex] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const property = properties.find((item) => item.id === id);
  const related = useMemo(() => properties.filter((item) => item.id !== id && item.tipo === property?.tipo).slice(0, 3), [properties, id, property]);

  const media = useMemo(() => {
    if (!property) return [];
    return [
      ...property.imagens.map((url) => ({ type: "image" as const, url })),
      ...property.videos.map((url) => ({ type: "video" as const, url })),
    ];
  }, [property]);

  const safeMediaIndex = media[mediaIndex] ? mediaIndex : 0;
  const activeMedia = media[safeMediaIndex];
  const specifications = property ? displaySpecifications(property) : [];
  const changeMedia = (direction: number) => setMediaIndex((current) => (current + direction + media.length) % media.length);

  useEffect(() => {
    const activeThumb = thumbnailRefs.current[safeMediaIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [safeMediaIndex]);

  if (loading) return <main className="inner-page"><PageLoader /></main>;
  if (!property) return <main className="inner-page not-found"><span>404</span><h1>Imóvel não encontrado</h1><p>Este anúncio pode ter sido atualizado ou removido.</p><Link className="button button--gold" to="/imoveis">Voltar aos imóveis</Link></main>;

  return (
    <main className="inner-page detail-page">
      <div className="site-container detail-topbar"><Link to="/imoveis"><ArrowLeft size={17} /> Voltar aos imóveis</Link><button onClick={() => navigator.share?.({ title: property.titulo, url: window.location.href })}><Share2 size={17} /> Compartilhar</button></div>
      <section className="gallery">
        <div className="gallery-main">
          {!activeMedia && <div className="gallery-empty"><ImageOff aria-hidden="true" /><span>Fotos e vídeos em breve</span></div>}
          {activeMedia?.type === "image" && <img src={activeMedia.url} alt={`${property.titulo} — foto ${safeMediaIndex + 1}`} />}
          {activeMedia?.type === "video" && <video key={activeMedia.url} src={activeMedia.url} controls playsInline preload="metadata" aria-label={`${property.titulo} — vídeo ${safeMediaIndex + 1}`} />}
          {activeMedia && <span>{safeMediaIndex + 1} / {media.length}</span>}
          {media.length > 1 && <><button className="gallery-prev" onClick={() => changeMedia(-1)} aria-label="Mídia anterior"><ChevronLeft /></button><button className="gallery-next" onClick={() => changeMedia(1)} aria-label="Próxima mídia"><ChevronRight /></button></>}
        </div>
        <div className="gallery-thumbs">
          {media.map((item, index) => (
            <button
              key={`${item.type}-${item.url}`}
              ref={(el) => {
                thumbnailRefs.current[index] = el;
              }}
              className={`${index === safeMediaIndex ? "active" : ""} ${item.type === "video" ? "gallery-video-thumb" : ""}`}
              onClick={() => setMediaIndex(index)}
              aria-label={item.type === "video" ? `Exibir vídeo ${index + 1}` : `Exibir foto ${index + 1}`}
            >
              {item.type === "image" ? (
                <img src={item.url} alt="" />
              ) : (
                <>
                  <video src={item.url} muted playsInline preload="metadata" aria-hidden="true" />
                  <span><Play /></span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>
      <section className="site-container detail-layout">
        <article>
          <span className="property-type property-type--static">{propertyTypeLabel(property.tipo)}{property.codigo ? ` · Cód. ${property.codigo}` : ""}</span>
          <h1>{property.titulo}</h1>
          <div className="detail-address"><MapPin size={18} /> {property.endereco}{property.numero ? `, ${property.numero}` : ""}{property.complemento ? ` — ${property.complemento}` : ""}, {property.bairro} · {property.cidade}{property.estado ? `/${property.estado}` : ""}</div>
          {specifications.length > 0 && <div className="detail-specs">{specifications.map((item) => <div key={item.key}><SpecificationIcon specificationKey={item.key} /><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>}
          <div className="detail-description"><span className="section-label">Sobre o imóvel</span><h2>Um lugar pensado<br />para viver bem.</h2><p>{property.descricao}</p><p>Entre em contato para receber a ficha completa, consultar disponibilidade e agendar uma visita personalizada.</p></div>
          {property.caracteristicas.length > 0 && <div className="detail-characteristics"><span className="section-label">Características</span><h2>O que este imóvel oferece</h2><ul>{property.caracteristicas.map((item) => <li key={item.id}><Check /> {item.nome}</li>)}</ul></div>}
        </article>
        <aside className="contact-card">
          <span>Valor do imóvel</span><strong>{formatPrice(property.preco)}</strong><small>Condições sujeitas a confirmação</small>
          <div className="contact-agent"><img src="/brand/jls-symbol.png" alt="Símbolo da JLS Negócios Imobiliários" /><div><b>JLS Negócios Imobiliários</b><span>CRECI PJ: 8467</span></div></div>
          <a className="button button--whatsapp" href={whatsappUrl(`Olá Jorge, tenho interesse no imóvel ${property.titulo}.`)} target="_blank" rel="noreferrer"><MessageCircle size={19} /> Conversar no WhatsApp</a>
          <p>Atendimento pessoal, sem compromisso.</p>
        </aside>
      </section>
      {related.length > 0 && <section className="related-section"><div className="site-container"><div className="section-heading"><span className="section-label section-label--gold">Você também pode gostar</span><h2>Outras oportunidades</h2></div><div className="property-grid">{related.map((item) => <PropertyCard key={item.id} property={item} />)}</div></div></section>}
    </main>
  );
}
