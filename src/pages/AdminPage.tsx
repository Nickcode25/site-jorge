"use client";

import { Building2, Check, Edit3, Eye, ImageOff, ImagePlus, LayoutDashboard, LogOut, Play, Plus, Save, Search, SlidersHorizontal, Star, Trash2, Video, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { formatPrice } from "@/src/components/PropertyCard";
import { AdminOverview, type AdminPropertyFilter } from "@/src/components/AdminOverview";
import { useAuth } from "@/src/hooks/useAuth";
import { cepDigits, formatCep, lookupAddressByCep } from "@/src/lib/address";
import {
  DEFAULT_CHARACTERISTICS,
  SPECIFICATIONS_BY_TYPE,
  applicableCharacteristics,
  legacyColumnsFromSpecifications,
  normalizePropertyRow,
} from "@/src/lib/property-config";
import { supabase } from "@/src/lib/supabase";
import { PROPERTY_TYPES, propertyTypeLabel, type CharacteristicDefinition, type Property, type PropertyFormData, type PropertyType, type SpecificationValue } from "@/src/types/property";

interface SelectedPhoto {
  id: string;
  file: File;
  previewUrl: string;
}

interface SelectedVideo {
  id: string;
  file: File;
  previewUrl: string;
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const SUPPORTED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const emptyForm: PropertyFormData = {
  codigo: "", titulo: "", tipo: "apartamento", preco: 0, cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", status: "disponivel", descricao: "", especificacoes: {}, caracteristicas: [], area: 0,
  quartos: 0, banheiros: 0, vagas: 0, destaque: false, imagens: [], videos: [],
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrencyInput(value: number) {
  return value > 0 ? currencyFormatter.format(value) : "";
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function propertyToFormData(property: Property): PropertyFormData {
  return {
    id: property.id,
    codigo: property.codigo ?? "",
    titulo: property.titulo,
    tipo: property.tipo,
    preco: property.preco,
    cep: formatCep(property.cep ?? ""),
    endereco: property.endereco,
    numero: property.numero ?? "",
    complemento: property.complemento ?? "",
    bairro: property.bairro,
    cidade: property.cidade,
    estado: property.estado ?? "",
    status: property.status,
    descricao: property.descricao,
    especificacoes: property.especificacoes ?? {},
    caracteristicas: property.caracteristicas.map((item) => item.id),
    area: property.area,
    quartos: property.quartos,
    banheiros: property.banheiros,
    vagas: property.vagas,
    destaque: property.destaque,
    imagens: property.imagens,
    videos: property.videos,
  };
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Não foi possível salvar o imóvel.";
}

export function AdminPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [characteristics, setCharacteristics] = useState<CharacteristicDefinition[]>(DEFAULT_CHARACTERISTICS);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<SelectedVideo[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [adminType, setAdminType] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [adminCity, setAdminCity] = useState("");
  const [adminFeaturedOnly, setAdminFeaturedOnly] = useState(false);
  const [adminNoPhotoOnly, setAdminNoPhotoOnly] = useState(false);
  const [adminCodeSearch, setAdminCodeSearch] = useState("");
  const [characteristicSearch, setCharacteristicSearch] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const cepLookupId = useRef(0);

  const activePanel = location.pathname.startsWith("/admin/imoveis") ? "properties" : "overview";

  async function loadProperties(showLoading = true) {
    if (!supabase) return;
    if (showLoading) setPropertiesLoading(true);
    try {
      const { data, error } = await supabase.from("imoveis").select("*, imovel_caracteristicas(caracteristica_id, caracteristicas(id, nome, categoria))").order("criado_em", { ascending: false });
      if (error) throw error;
      setProperties((data ?? []).map((item) => normalizePropertyRow(item as Record<string, unknown>)));
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      if (showLoading) setPropertiesLoading(false);
    }
  }

  async function loadCharacteristics() {
    if (!supabase) return;
    const { data } = await supabase.from("caracteristicas").select("id, nome, categoria, tipos_aplicaveis").order("nome");
    if (data?.length) setCharacteristics(data as CharacteristicDefinition[]);
  }

  useEffect(() => {
    if (!user) return;
    void Promise.resolve().then(() => Promise.all([loadProperties(), loadCharacteristics()]));
  }, [user]);
  useEffect(() => {
    if (!user || !supabase) return;
    const channel = supabase.channel("admin-imoveis-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "imoveis" }, () => { void loadProperties(false); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);
  if (loading) return <div className="admin-loading">Carregando painel...</div>;
  if (!user || !supabase) return <Navigate to="/admin/login" replace />;

  const specificationDefinitions = SPECIFICATIONS_BY_TYPE[form.tipo];
  const availableCharacteristics = applicableCharacteristics(form.tipo, characteristics);
  const normalizedCharacteristicSearch = normalizeSearch(characteristicSearch);
  const characteristicGroups = ([
    ["interna", "Internas"],
    ["externa", "Externas"],
    ["geral", "Gerais"],
  ] as const).map(([category, label]) => ({
    category,
    label,
    items: availableCharacteristics
      .filter((item) => item.categoria === category && (!normalizedCharacteristicSearch || normalizeSearch(item.nome).includes(normalizedCharacteristicSearch)))
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })),
  })).filter((group) => group.items.length > 0);
  const visibleCharacteristicCount = characteristicGroups.reduce((total, group) => total + group.items.length, 0);
  const adminCities = Array.from(new Set(properties.map((property) => property.cidade).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  const normalizedCodeSearch = adminCodeSearch.trim().toLowerCase();
  const hasActiveAdminFilters = Boolean(adminType || adminStatus || adminCity || adminFeaturedOnly || adminNoPhotoOnly || normalizedCodeSearch);
  const filteredAdminProperties = properties.filter((property) => {
    if (adminType && property.tipo !== adminType) return false;
    if (adminStatus && property.status !== adminStatus) return false;
    if (adminCity && property.cidade !== adminCity) return false;
    if (adminFeaturedOnly && !property.destaque) return false;
    if (adminNoPhotoOnly && property.imagens?.some(Boolean)) return false;
    if (normalizedCodeSearch && !String(property.codigo ?? "").toLowerCase().includes(normalizedCodeSearch)) return false;
    return true;
  });

  function clearSelectedPhotos() {
    setSelectedPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return [];
    });
  }

  function clearSelectedVideos() {
    setSelectedVideos((current) => {
      current.forEach((video) => URL.revokeObjectURL(video.previewUrl));
      return [];
    });
  }

  function clearSelectedMedia() { clearSelectedPhotos(); clearSelectedVideos(); }
  function closeEditor() { clearSelectedMedia(); setCharacteristicSearch(""); setEditing(false); }
  function openCreate() { clearSelectedMedia(); setCharacteristicSearch(""); setForm(emptyForm); setMessage(null); setCepStatus("idle"); setEditing(true); }
  function openEdit(property: Property) { clearSelectedMedia(); setCharacteristicSearch(""); setForm(propertyToFormData(property)); setMessage(null); setCepStatus("idle"); setEditing(true); }
  function clearAdminFilters() { setAdminType(""); setAdminStatus(""); setAdminCity(""); setAdminFeaturedOnly(false); setAdminNoPhotoOnly(false); setAdminCodeSearch(""); }
  function showProperties(filter: AdminPropertyFilter = "all") {
    clearAdminFilters();
    if (filter === "featured") setAdminFeaturedOnly(true);
    if (filter === "sold") setAdminStatus("vendido");
    if (filter === "no-photo") setAdminNoPhotoOnly(true);
    navigate("/admin/imoveis");
  }
  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) { setForm((current) => ({ ...current, [key]: value })); }

  function changePropertyType(type: PropertyType) {
    const hasDynamicData = Object.keys(form.especificacoes).length > 0 || form.caracteristicas.length > 0;
    if (hasDynamicData && !confirm("Ao alterar o tipo, as especificações e características já preenchidas serão limpas. Deseja continuar?")) return;
    setCharacteristicSearch("");
    setForm((current) => ({ ...current, tipo: type, especificacoes: {}, caracteristicas: [] }));
  }

  function updateSpecification(key: string, value: SpecificationValue | "") {
    setForm((current) => {
      const next = { ...current.especificacoes };
      if (value === "") delete next[key];
      else next[key] = value;
      return { ...current, especificacoes: next };
    });
  }

  function toggleCharacteristic(id: string) {
    setForm((current) => ({
      ...current,
      caracteristicas: current.caracteristicas.includes(id)
        ? current.caracteristicas.filter((item) => item !== id)
        : [...current.caracteristicas, id],
    }));
  }

  function addPhotos(fileList: FileList | null) {
    // FileList is tied to the input and becomes empty as soon as the field is
    // reset. Copy the files before scheduling the React state update.
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setSelectedPhotos((current) => {
      const knownFiles = new Set(current.map((photo) => `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`));
      const additions = files.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (!file.type.startsWith("image/") || knownFiles.has(key)) return false;
        knownFiles.add(key);
        return true;
      }).map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }));
      return [...current, ...additions];
    });
  }

  function removeSelectedPhoto(id: string) {
    setSelectedPhotos((current) => current.filter((photo) => {
      if (photo.id !== id) return true;
      URL.revokeObjectURL(photo.previewUrl);
      return false;
    }));
  }

  function removeStoredPhoto(url: string) {
    update("imagens", (form.imagens ?? []).filter((image) => image !== url));
  }

  function addVideos(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    const invalidType = files.some((file) => !SUPPORTED_VIDEO_TYPES.has(file.type));
    const oversized = files.some((file) => file.size > MAX_VIDEO_SIZE);
    const validFiles = files.filter((file) => SUPPORTED_VIDEO_TYPES.has(file.type) && file.size <= MAX_VIDEO_SIZE);
    if (invalidType || oversized) {
      setMessage(oversized
        ? "Cada vídeo deve ter no máximo 50 MB. Use MP4, WebM ou MOV."
        : "Formato de vídeo não compatível. Use MP4, WebM ou MOV.");
    }
    setSelectedVideos((current) => {
      const knownFiles = new Set(current.map((video) => `${video.file.name}-${video.file.size}-${video.file.lastModified}`));
      const additions = validFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (knownFiles.has(key)) return false;
        knownFiles.add(key);
        return true;
      }).map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }));
      return [...current, ...additions];
    });
  }

  function removeSelectedVideo(id: string) {
    setSelectedVideos((current) => current.filter((video) => {
      if (video.id !== id) return true;
      URL.revokeObjectURL(video.previewUrl);
      return false;
    }));
  }

  function removeStoredVideo(url: string) {
    update("videos", (form.videos ?? []).filter((video) => video !== url));
  }

  async function completeAddress(cep: string) {
    const lookupId = ++cepLookupId.current;
    setCepStatus("loading");
    try {
      const address = await lookupAddressByCep(cep);
      if (lookupId !== cepLookupId.current) return;
      if (!address) { setCepStatus("error"); return; }
      setForm((current) => ({
        ...current,
        endereco: address.endereco || current.endereco,
        bairro: address.bairro || current.bairro,
        cidade: address.cidade || current.cidade,
        estado: address.estado || current.estado,
      }));
      setCepStatus("success");
    } catch {
      if (lookupId === cepLookupId.current) setCepStatus("error");
    }
  }

  function changeCep(value: string) {
    const formatted = formatCep(value);
    update("cep", formatted);
    if (cepDigits(formatted).length === 8) void completeAddress(formatted);
    else { cepLookupId.current += 1; setCepStatus("idle"); }
  }

  async function uploadImages() {
    const urls: string[] = [];
    for (const { file } of selectedPhotos) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${crypto.randomUUID()}/${safeName}`;
      const { error } = await supabase!.storage.from("imoveis").upload(path, file, { upsert: false });
      if (error) throw error;
      urls.push(supabase!.storage.from("imoveis").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function uploadVideos() {
    const urls: string[] = [];
    for (const { file } of selectedVideos) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `videos/${crypto.randomUUID()}/${safeName}`;
      const { error } = await supabase!.storage.from("imoveis").upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      urls.push(supabase!.storage.from("imoveis").getPublicUrl(path).data.publicUrl);
    }
    return urls;
  }

  async function saveProperty(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const [uploadedImages, uploadedVideos] = await Promise.all([uploadImages(), uploadVideos()]);
      const legacy = legacyColumnsFromSpecifications(form.tipo, form.especificacoes);
      const selectedCharacteristics = form.caracteristicas;
      const values = {
        codigo: form.codigo,
        titulo: form.titulo,
        tipo: form.tipo,
        preco: form.preco,
        cep: form.cep,
        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,
        status: form.status,
        descricao: form.descricao,
        especificacoes: form.especificacoes,
        ...legacy,
        imagens: [...(form.imagens ?? []), ...uploadedImages],
        videos: [...(form.videos ?? []), ...uploadedVideos],
        destaque: form.destaque,
      };
      const result = form.id
        ? await supabase!.from("imoveis").update(values).eq("id", form.id).select("id").single()
        : await supabase!.from("imoveis").insert(values).select("id").single();
      if (result.error) throw result.error;
      const propertyId = result.data.id as string;
      const clearResult = await supabase!.from("imovel_caracteristicas").delete().eq("imovel_id", propertyId);
      if (clearResult.error) throw clearResult.error;
      if (selectedCharacteristics.length) {
        const linkResult = await supabase!.from("imovel_caracteristicas").insert(selectedCharacteristics.map((characteristicId) => ({
          imovel_id: propertyId,
          caracteristica_id: characteristicId,
        })));
        if (linkResult.error) throw linkResult.error;
      }
      await loadProperties(); closeEditor(); clearAdminFilters(); navigate("/admin/imoveis"); setMessage("Imóvel salvo com sucesso.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally { setSaving(false); }
  }

  async function deleteProperty(property: Property) {
    if (!confirm(`Excluir “${property.titulo}”? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase!.from("imoveis").delete().eq("id", property.id);
    if (error) setMessage(error.message); else { setMessage("Imóvel excluído."); await loadProperties(); }
  }

  async function toggleFeatured(property: Property) {
    const { error } = await supabase!.from("imoveis").update({ destaque: !property.destaque }).eq("id", property.id);
    if (error) setMessage(error.message); else await loadProperties();
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-brand-logo" aria-label="JLS Negócios Imobiliários — início">
          <img src="/brand/logo-jls.png" alt="JLS Negócios Imobiliários" />
        </Link>
        <nav aria-label="Navegação do painel">
          <button type="button" className={activePanel === "overview" ? "active" : ""} aria-current={activePanel === "overview" ? "page" : undefined} onClick={() => navigate("/admin")}><LayoutDashboard /> Visão geral</button>
          <button type="button" className={activePanel === "properties" ? "active" : ""} aria-current={activePanel === "properties" ? "page" : undefined} onClick={() => showProperties()}><Building2 /> Imóveis</button>
        </nav>
        <div className="admin-user"><span>{user.email?.slice(0, 1).toUpperCase()}</span><div><strong>JLS Negócios Imobiliários</strong><small>{user.email}</small></div></div>
        <button className="logout" onClick={() => supabase!.auth.signOut()}><LogOut /> Sair</button>
      </aside>
      <section className="admin-main">
        <header className="admin-header"><div><span>PAINEL ADMINISTRATIVO</span><h1>{activePanel === "overview" ? "Visão geral" : "Seus imóveis"}</h1><p>{activePanel === "overview" ? "Acompanhe um resumo dos imóveis publicados." : "Gerencie anúncios, fotos, vídeos e a seleção em destaque."}</p></div><div className="admin-actions"><Link to="/" target="_blank" className="button button--outline-dark"><Eye size={17} /> Ver site</Link><button onClick={openCreate} className="button button--gold"><Plus size={18} /> Novo imóvel</button></div></header>
        {message && <div className="admin-message">{message}<button onClick={() => setMessage(null)}><X size={16} /></button></div>}
        {activePanel === "overview" && <AdminOverview properties={properties} loading={propertiesLoading} onCreate={openCreate} onEdit={openEdit} onShowProperties={showProperties} onToggleFeatured={(property) => { void toggleFeatured(property); }} />}
        {activePanel === "properties" && <>
          <div className="admin-list-head"><strong>Todos os imóveis</strong><span>Atualizados em tempo real</span></div>
          <div className="filters-panel admin-filters-panel">
            <div className="filters-title"><SlidersHorizontal size={19} /><strong>Filtrar imóveis</strong></div>
            <label>Código<span className="input-icon"><Search /><input type="search" inputMode="numeric" value={adminCodeSearch} onChange={(event) => setAdminCodeSearch(event.target.value)} placeholder="Buscar por código..." /></span></label>
            <label>Tipo<select value={adminType} onChange={(event) => setAdminType(event.target.value)}><option value="">Todos os tipos</option>{PROPERTY_TYPES.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <label>Status<select value={adminStatus} onChange={(event) => setAdminStatus(event.target.value)}><option value="">Todos os status</option><option value="disponivel">Disponível</option><option value="vendido">Vendido</option><option value="reservado">Reservado</option><option value="inativo">Inativo</option></select></label>
            <label>Cidade<select value={adminCity} onChange={(event) => setAdminCity(event.target.value)}><option value="">Todas as cidades</option>{adminCities.map((city) => <option value={city} key={city}>{city}</option>)}</select></label>
            <label>Destaque<select value={adminFeaturedOnly ? "featured" : ""} onChange={(event) => setAdminFeaturedOnly(event.target.value === "featured")}><option value="">Todos os imóveis</option><option value="featured">Somente em destaque</option></select></label>
            {hasActiveAdminFilters && <button type="button" className="clear-button" onClick={clearAdminFilters}><X size={15} /> Limpar</button>}
          </div>
          <div className="results-bar admin-results-bar"><div><strong>{filteredAdminProperties.length}</strong> {filteredAdminProperties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</div>{adminNoPhotoOnly && <span className="admin-active-filter"><ImageOff /> Somente sem foto</span>}</div>
          <div className="admin-property-list">
            {propertiesLoading ? Array.from({ length: 4 }, (_, index) => <span className="admin-skeleton admin-skeleton--row" key={index} />) : filteredAdminProperties.map((property) => <article key={property.id} className="admin-property-row"><div className="admin-property-row__thumb">{property.imagens?.[0] ? <img src={property.imagens[0]} alt="" /> : <ImagePlus />}</div><div className="admin-property-info"><div><span className="mini-type">{propertyTypeLabel(property.tipo)}</span>{property.destaque && <span className="mini-featured"><Star size={11} fill="currentColor" /> Destaque</span>}</div><strong>{property.titulo}</strong><small>{property.codigo ? `Cód. ${property.codigo} · ` : ""}{property.bairro}, {property.cidade} · {formatPrice(property.preco)}</small></div><button className={`star-button ${property.destaque ? "active" : ""}`} onClick={() => toggleFeatured(property)} title="Alternar destaque"><Star fill={property.destaque ? "currentColor" : "none"} /></button><button onClick={() => openEdit(property)} title="Editar"><Edit3 /></button><button className="danger" onClick={() => deleteProperty(property)} title="Excluir"><Trash2 /></button></article>)}
            {!propertiesLoading && !filteredAdminProperties.length && <div className="admin-empty"><Building2 /><h2>{properties.length ? "Nenhum imóvel encontrado com esses filtros" : "Nenhum imóvel cadastrado"}</h2><p>{properties.length ? "Ajuste os critérios ou limpe todos os filtros para ver a lista completa." : "Comece adicionando a primeira oportunidade."}</p>{properties.length ? <button className="button button--outline-dark" onClick={clearAdminFilters}>Limpar filtros</button> : <button className="button button--gold" onClick={openCreate}><Plus /> Novo imóvel</button>}</div>}
          </div>
        </>}
      </section>

      {editing && <div className="modal-backdrop" role="presentation"><div className="property-modal" role="dialog" aria-modal="true" aria-label={form.id ? "Editar imóvel" : "Novo imóvel"}><header><div><span className="section-label">Cadastro de imóvel</span><h2>{form.id ? "Editar imóvel" : "Novo imóvel"}</h2></div><button onClick={closeEditor} aria-label="Fechar"><X /></button></header>
        <form onSubmit={saveProperty}>
          <div className="form-section form-section--main"><h3>Informações principais</h3><label className="main-field-half">Título do anúncio<input required value={form.titulo} onChange={(e) => update("titulo", e.target.value)} placeholder="Ex.: Apartamento Jardins Essence" /></label><label className="main-field-half">Código do imóvel<input required inputMode="numeric" pattern="[0-9]+" value={form.codigo} onChange={(e) => update("codigo", e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 1024" /></label><label className="main-field-third main-field-type">Tipo<select value={form.tipo} onChange={(e) => changePropertyType(e.target.value as PropertyType)}>{PROPERTY_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small className="field-helper">Os campos abaixo mudam conforme o tipo.</small></label><label className="main-field-third">Preço<input className="currency-mask-input" required inputMode="numeric" value={formatCurrencyInput(form.preco)} onChange={(e) => update("preco", parseCurrencyInput(e.target.value))} placeholder="R$ 0,00" aria-label="Preço do imóvel em reais" /></label><label className="main-field-third">Status<select value={form.status} onChange={(e) => update("status", e.target.value as PropertyFormData["status"])}><option value="disponivel">Disponível</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="inativo">Inativo</option></select></label></div>
          <div className="form-section form-section--location"><h3>Localização</h3><label>CEP<input required inputMode="numeric" autoComplete="postal-code" value={form.cep} onChange={(e) => changeCep(e.target.value)} placeholder="00000-000" maxLength={9} />{cepStatus === "loading" && <small className="field-helper">Buscando endereço...</small>}{cepStatus === "success" && <small className="field-helper field-helper--success">Endereço preenchido. Confira os dados e informe o número.</small>}{cepStatus === "error" && <small className="field-helper field-helper--error">CEP não encontrado. Preencha os campos manualmente.</small>}</label><label className="span-2">Endereço<input required autoComplete="street-address" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Rua ou avenida" /></label><label>Bairro<input required value={form.bairro} onChange={(e) => update("bairro", e.target.value)} /></label><label>Cidade<input required value={form.cidade} onChange={(e) => update("cidade", e.target.value)} /></label><label>UF<input required value={form.estado} onChange={(e) => update("estado", e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" maxLength={2} /></label><label>Número<input required value={form.numero} onChange={(e) => update("numero", e.target.value)} placeholder="Ex.: 120" /></label><label className="span-2">Complemento<input value={form.complemento} onChange={(e) => update("complemento", e.target.value)} placeholder="Apartamento, bloco, sala ou ponto de referência" /></label></div>
          <div className="form-section form-section--specs"><h3>Especificações</h3><p className="form-section-intro">Preencha somente as informações disponíveis para este imóvel.</p>{specificationDefinitions.map((definition) => {
            const value = form.especificacoes[definition.key];
            const label = `${definition.label}${definition.unit ? ` (${definition.unit})` : ""}${definition.optional ? " · opcional" : ""}`;
            if (definition.type === "text") return <label key={definition.key}>{label}<input type="text" value={typeof value === "string" ? value : ""} onChange={(e) => updateSpecification(definition.key, e.target.value)} placeholder="Ex.: 12 km por estrada asfaltada" /></label>;
            if (definition.type === "select") return <label key={definition.key}>{label}<select value={typeof value === "string" ? value : ""} onChange={(e) => updateSpecification(definition.key, e.target.value)}><option value="">Não informado</option>{definition.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
            if (definition.type === "boolean") return <label key={definition.key}>{label}<select value={typeof value === "boolean" ? String(value) : ""} onChange={(e) => updateSpecification(definition.key, e.target.value === "" ? "" : e.target.value === "true")}><option value="">Não informado</option><option value="true">Sim</option><option value="false">Não</option></select></label>;
            return <label key={definition.key}>{label}<input min="0" step={definition.step ?? "1"} type="number" value={typeof value === "number" ? value : ""} onChange={(e) => updateSpecification(definition.key, e.target.value === "" ? "" : Number(e.target.value))} /></label>;
          })}</div>
          <div className="form-section form-section--characteristics"><h3>Características</h3><p className="form-section-intro">Marque somente os itens presentes no imóvel. A lista já está filtrada para {propertyTypeLabel(form.tipo).toLowerCase()}.</p>{availableCharacteristics.length > 15 && <label className="characteristic-search"><span><Search /> Buscar característica</span><input type="search" value={characteristicSearch} onChange={(e) => setCharacteristicSearch(e.target.value)} placeholder="Ex.: varanda, piscina ou financiamento" /></label>}{characteristicGroups.map((group) => <fieldset key={group.category} className="characteristic-group"><legend>{group.label}</legend><div className="characteristic-options">{group.items.map((item) => {
            const checked = form.caracteristicas.includes(item.id);
            return <label key={item.id} className={`characteristic-option ${checked ? "is-checked" : ""}`}><input type="checkbox" checked={checked} onChange={() => toggleCharacteristic(item.id)} /><span className="characteristic-check"><Check /></span><span>{item.nome}</span></label>;
          })}</div></fieldset>)}{normalizedCharacteristicSearch && visibleCharacteristicCount === 0 && <p className="characteristic-empty">Nenhuma característica encontrada para esta busca.</p>}</div>
          <div className="form-section">
            <h3>Apresentação</h3>
            <label className="span-2">Descrição<textarea required rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} /></label>
            <label className="span-2 upload-field">
              <span><ImagePlus /> Adicionar fotos</span>
              <input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.currentTarget.files); e.currentTarget.value = ""; }} />
              <small>{selectedPhotos.length ? `${selectedPhotos.length} nova(s) foto(s) pronta(s) para enviar` : "Adicione uma ou várias fotos por vez · PNG, JPG ou WebP"}</small>
            </label>
            {((form.imagens?.length ?? 0) > 0 || selectedPhotos.length > 0) && <div className="span-2 photo-preview-grid">
              {form.imagens?.map((image, index) => <div className="photo-preview" key={image}><img src={image} alt={`Foto cadastrada ${index + 1}`} /><span>Cadastrada</span><button type="button" onClick={() => removeStoredPhoto(image)} aria-label={`Remover foto cadastrada ${index + 1}`}><X /></button></div>)}
              {selectedPhotos.map((photo, index) => <div className="photo-preview photo-preview--new" key={photo.id}><img src={photo.previewUrl} alt={`Nova foto ${index + 1}`} /><span>Nova</span><button type="button" onClick={() => removeSelectedPhoto(photo.id)} aria-label={`Remover nova foto ${index + 1}`}><X /></button></div>)}
            </div>}
            <label className="span-2 upload-field upload-field--video">
              <span><Video /> Adicionar vídeos</span>
              <input type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" multiple onChange={(e) => { addVideos(e.currentTarget.files); e.currentTarget.value = ""; }} />
              <small>{selectedVideos.length ? `${selectedVideos.length} novo(s) vídeo(s) pronto(s) para enviar` : "Adicione vídeos em MP4, WebM ou MOV · até 50 MB por arquivo"}</small>
            </label>
            {((form.videos?.length ?? 0) > 0 || selectedVideos.length > 0) && <div className="span-2 photo-preview-grid video-preview-grid">
              {form.videos?.map((video, index) => <div className="photo-preview video-preview" key={video}><video src={video} controls preload="metadata" playsInline /><span><Play /> Cadastrado</span><button type="button" onClick={() => removeStoredVideo(video)} aria-label={`Remover vídeo cadastrado ${index + 1}`}><X /></button></div>)}
              {selectedVideos.map((video, index) => <div className="photo-preview photo-preview--new video-preview" key={video.id}><video src={video.previewUrl} controls preload="metadata" playsInline /><span><Play /> Novo</span><button type="button" onClick={() => removeSelectedVideo(video.id)} aria-label={`Remover novo vídeo ${index + 1}`}><X /></button></div>)}
            </div>}
            <label className="span-2 switch-row"><input type="checkbox" checked={form.destaque} onChange={(e) => update("destaque", e.target.checked)} /><span><b>Exibir na página inicial</b><small>Marcar como imóvel em destaque</small></span></label>
          </div>
          {message && <div className="form-message">{message}</div>}
          <footer><button type="button" className="button button--outline-dark" onClick={closeEditor}>Cancelar</button><button className="button button--gold" disabled={saving}><Save size={17} /> {saving ? "Salvando..." : "Salvar imóvel"}</button></footer>
        </form>
      </div></div>}
    </main>
  );
}
