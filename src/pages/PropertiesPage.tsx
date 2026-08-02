"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLoader } from "@/src/components/PageLoader";
import { PropertyCard } from "@/src/components/PropertyCard";
import { useProperties } from "@/src/hooks/useProperties";
import type { PropertyType } from "@/src/types/property";

const perPage = 6;

export function PropertiesPage() {
  const { properties, loading, demoMode } = useProperties();
  const [params, setParams] = useSearchParams();
  const [type, setType] = useState(params.get("tipo") ?? "");
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [price, setPrice] = useState("");
  const [visible, setVisible] = useState(perPage);

  useEffect(() => setType(params.get("tipo") ?? ""), [params]);

  const filtered = useMemo(() => properties.filter((property) => {
    if (type && property.tipo !== type) return false;
    if (city && !`${property.bairro} ${property.cidade}`.toLowerCase().includes(city.toLowerCase())) return false;
    if (bedrooms && property.quartos < Number(bedrooms)) return false;
    if (price && property.preco > Number(price)) return false;
    return true;
  }), [properties, type, city, bedrooms, price]);

  function changeType(value: string) {
    setType(value);
    setVisible(perPage);
    const next = new URLSearchParams(params);
    value ? next.set("tipo", value) : next.delete("tipo");
    setParams(next);
  }

  function clearFilters() {
    setType(""); setCity(""); setBedrooms(""); setPrice(""); setVisible(perPage); setParams({});
  }

  return (
    <main className="inner-page">
      <section className="page-hero page-hero--properties">
        <div className="site-container"><span className="section-label section-label--gold">Curadoria Jorge Soares</span><h1>Imóveis para viver<br /><em>boas histórias.</em></h1><p>Explore nossa seleção e encontre o endereço que conversa com o seu momento.</p></div>
      </section>
      <section className="list-section section-light">
        <div className="site-container">
          <div className="filters-panel">
            <div className="filters-title"><SlidersHorizontal size={19} /><strong>Filtrar imóveis</strong></div>
            <label>Tipo<select value={type} onChange={(e) => changeType(e.target.value)}><option value="">Todos os tipos</option><option value="apartamento">Apartamentos</option><option value="casa">Casas</option><option value="lote">Lotes</option></select></label>
            <label>Bairro ou cidade<div className="input-icon"><Search size={16} /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Jardins" /></div></label>
            <label>Quartos<select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}><option value="">Qualquer</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></label>
            <label>Valor máximo<select value={price} onChange={(e) => setPrice(e.target.value)}><option value="">Sem limite</option><option value="1000000">Até R$ 1 mi</option><option value="2000000">Até R$ 2 mi</option><option value="3000000">Até R$ 3 mi</option></select></label>
            {(type || city || bedrooms || price) && <button className="clear-button" onClick={clearFilters}><X size={15} /> Limpar</button>}
          </div>
          <div className="results-bar"><div><strong>{filtered.length}</strong> {filtered.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</div>{demoMode && <span className="demo-badge">Seleção demonstrativa</span>}</div>
          {loading ? <PageLoader /> : filtered.length ? <>
            <div className="property-grid">{filtered.slice(0, visible).map((property) => <PropertyCard key={property.id} property={property} />)}</div>
            {visible < filtered.length && <div className="center-action"><button className="button button--dark" onClick={() => setVisible((count) => count + perPage)}>Carregar mais imóveis</button></div>}
          </> : <div className="empty-state"><span>—</span><h2>Nenhum imóvel encontrado</h2><p>Tente ampliar os filtros para descobrir outras oportunidades.</p><button onClick={clearFilters} className="button button--dark">Limpar filtros</button></div>}
        </div>
      </section>
    </main>
  );
}
