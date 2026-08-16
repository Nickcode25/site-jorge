"use client";

import { AlertTriangle, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { useProperties } from "@/src/hooks/useProperties";
import { PROPERTY_TYPES } from "@/src/types/property";

const perPage = 6;

export function PropertiesPage() {
  const { properties, loading, error, reload, demoMode } = useProperties();
  const [params, setParams] = useSearchParams();
  const type = params.get("tipo") ?? "";
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [price, setPrice] = useState("");
  const [visible, setVisible] = useState(perPage);

  const cities = useMemo(() => Array.from(new Set(properties.map((property) => property.cidade).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "pt-BR")), [properties]);

  const neighborhoods = useMemo(() => {
    if (!city) return [];
    return Array.from(new Set(properties
      .filter((property) => property.cidade === city)
      .map((property) => property.bairro)
      .filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [properties, city]);

  const showBedrooms = type === "apartamento" || type === "casa";

  const filtered = useMemo(() => properties.filter((property) => {
    if (type && property.tipo !== type) return false;
    if (city && property.cidade !== city) return false;
    if (neighborhood && property.bairro !== neighborhood) return false;
    if (showBedrooms && bedrooms && property.quartos < Number(bedrooms)) return false;
    if (price && property.preco > Number(price)) return false;
    return true;
  }), [properties, type, city, neighborhood, showBedrooms, bedrooms, price]);

  function changeType(value: string) {
    if (value !== "apartamento" && value !== "casa") setBedrooms("");
    setVisible(perPage);
    const next = new URLSearchParams(params);
    if (value) next.set("tipo", value);
    else next.delete("tipo");
    setParams(next);
  }

  function changeCity(value: string) {
    setCity(value);
    setNeighborhood("");
    setVisible(perPage);
  }

  function clearFilters() {
    setCity(""); setNeighborhood(""); setBedrooms(""); setPrice(""); setVisible(perPage); setParams({});
  }

  return (
    <main className="inner-page">
      <section className="page-hero page-hero--properties">
        <div className="site-container"><span className="section-label section-label--gold">Portfólio JLS Negócios Imobiliários</span><h1>Imóveis para viver<br /><em>boas histórias.</em></h1><p>Explore nossa seleção e encontre o endereço que conversa com o seu momento.</p></div>
      </section>
      <section className="list-section section-light">
        <div className="site-container">
          <div className={`filters-panel ${showBedrooms ? "filters-panel--with-bedrooms" : ""}`}>
            <div className="filters-title"><SlidersHorizontal size={19} /><strong>Filtrar imóveis</strong></div>
            <label>Tipo<select value={type} onChange={(e) => changeType(e.target.value)}><option value="">Todos os tipos</option>{PROPERTY_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label>Cidade<select value={city} onChange={(e) => changeCity(e.target.value)}><option value="">Todas as cidades</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label>Bairro<select value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setVisible(perPage); }} disabled={!city}><option value="">{city ? "Todos os bairros" : "Selecione uma cidade"}</option>{neighborhoods.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            {showBedrooms && <label>Quartos<select value={bedrooms} onChange={(e) => { setBedrooms(e.target.value); setVisible(perPage); }}><option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>}
            <label>Valor máximo<select value={price} onChange={(e) => { setPrice(e.target.value); setVisible(perPage); }}><option value="">Sem limite</option><option value="100000">Até R$ 100 mil</option><option value="500000">Até R$ 500 mil</option><option value="1000000">Até R$ 1 mi</option></select></label>
            {(type || city || neighborhood || bedrooms || price) && <button className="clear-button" onClick={clearFilters}><X size={15} /> Limpar</button>}
          </div>
          <div className="results-bar"><div><strong>{loading || error ? "—" : filtered.length}</strong> {loading ? "carregando imóveis" : error ? "falha ao carregar" : filtered.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</div>{demoMode && <span className="demo-badge">Seleção demonstrativa</span>}</div>
          {loading ? <PageLoader /> : error ? <div className="load-error-state"><AlertTriangle /><h2>Não foi possível carregar os imóveis</h2><p>{error} Verifique a conexão e tente novamente.</p><button type="button" onClick={() => { void reload(); }} className="button button--dark"><RefreshCw /> Tentar novamente</button></div> : filtered.length ? <>
            <div className="property-grid">{filtered.slice(0, visible).map((property) => <PropertyCard key={property.id} property={property} />)}</div>
            {visible < filtered.length && <div className="center-action"><button className="button button--dark" onClick={() => setVisible((count) => count + perPage)}>Carregar mais imóveis</button></div>}
          </> : <div className="empty-state"><span>—</span><h2>Nenhum imóvel encontrado</h2><p>Tente ampliar os filtros para descobrir outras oportunidades.</p><button onClick={clearFilters} className="button button--dark">Limpar filtros</button></div>}
        </div>
      </section>
    </main>
  );
}
