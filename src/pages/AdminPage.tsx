"use client";

import { Building2, Check, Edit3, Eye, ImagePlus, LayoutDashboard, LogOut, Plus, Save, Search, Star, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { formatPrice } from "@/src/components/PropertyCard";
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

const emptyForm: PropertyFormData = {
  codigo: "", titulo: "", tipo: "apartamento", preco: 0, cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", status: "disponivel", descricao: "", especificacoes: {}, caracteristicas: [], area: 0,
  quartos: 0, banheiros: 0, vagas: 0, destaque: false, imagens: [],
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

export function AdminPage() {
  const { user, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [characteristics, setCharacteristics] = useState<CharacteristicDefinition[]>(DEFAULT_CHARACTERISTICS);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [characteristicSearch, setCharacteristicSearch] = useState("");
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const cepLookupId = useRef(0);

  async function loadProperties() {
    if (!supabase) return;
    const { data } = await supabase.from("imoveis").select("*, imovel_caracteristicas(caracteristica_id, caracteristicas(id, nome, categoria))").order("criado_em", { ascending: false });
    setProperties((data ?? []).map((item) => normalizePropertyRow(item as Record<string, unknown>)));
  }

  async function loadCharacteristics() {
    if (!supabase) return;
    const { data } = await supabase.from("caracteristicas").select("id, nome, categoria, tipos_aplicaveis").order("nome");
    if (data?.length) setCharacteristics(data as CharacteristicDefinition[]);
  }

  useEffect(() => { if (user) void Promise.all([loadProperties(), loadCharacteristics()]); }, [user]);
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

  function clearSelectedPhotos() {
    setSelectedPhotos((current) => {
      current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      return [];
    });
  }

  function closeEditor() { clearSelectedPhotos(); setCharacteristicSearch(""); setEditing(false); }
  function openCreate() { clearSelectedPhotos(); setCharacteristicSearch(""); setForm(emptyForm); setMessage(null); setCepStatus("idle"); setEditing(true); }
  function openEdit(property: Property) { clearSelectedPhotos(); setCharacteristicSearch(""); setForm({ ...emptyForm, ...property, codigo: property.codigo ?? "", cep: formatCep(property.cep ?? ""), estado: property.estado ?? "", numero: property.numero ?? "", complemento: property.complemento ?? "", especificacoes: property.especificacoes ?? {}, caracteristicas: property.caracteristicas.map((item) => item.id) }); setMessage(null); setCepStatus("idle"); setEditing(true); }
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
    if (!fileList?.length) return;
    setSelectedPhotos((current) => {
      const knownFiles = new Set(current.map((photo) => `${photo.file.name}-${photo.file.size}-${photo.file.lastModified}`));
      const additions = Array.from(fileList).filter((file) => {
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

  async function saveProperty(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const uploaded = await uploadImages();
      const legacy = legacyColumnsFromSpecifications(form.tipo, form.especificacoes);
      const payload = { ...form, ...legacy, imagens: [...(form.imagens ?? []), ...uploaded] };
      const { id, caracteristicas: selectedCharacteristics, ...values } = payload;
      const result = id
        ? await supabase!.from("imoveis").update(values).eq("id", id).select("id").single()
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
      await loadProperties(); closeEditor(); setMessage("Imóvel salvo com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar o imóvel.");
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
        <div className="brand"><span className="brand-main">JORGE</span><span className="brand-accent">SOARES</span><span className="brand-tag">GESTÃO</span></div>
        <nav><button className="active"><LayoutDashboard /> Visão geral</button><button><Building2 /> Imóveis</button></nav>
        <div className="admin-user"><span>{user.email?.slice(0, 1).toUpperCase()}</span><div><strong>JLS Negócios Imobiliários</strong><small>{user.email}</small></div></div>
        <button className="logout" onClick={() => supabase!.auth.signOut()}><LogOut /> Sair</button>
      </aside>
      <section className="admin-main">
        <header className="admin-header"><div><span>PAINEL ADMINISTRATIVO</span><h1>Seus imóveis</h1><p>Gerencie anúncios, fotos e a seleção em destaque.</p></div><div className="admin-actions"><Link to="/" target="_blank" className="button button--outline-dark"><Eye size={17} /> Ver site</Link><button onClick={openCreate} className="button button--gold"><Plus size={18} /> Novo imóvel</button></div></header>
        <div className="admin-stats"><div><Building2 /><span><strong>{properties.length}</strong> imóveis cadastrados</span></div><div><Star /><span><strong>{properties.filter((p) => p.destaque).length}</strong> em destaque</span></div><p>Recomendamos até 3 destaques na página inicial.</p></div>
        {message && <div className="admin-message">{message}<button onClick={() => setMessage(null)}><X size={16} /></button></div>}
        <div className="admin-list-head"><strong>Todos os imóveis</strong><span>Atualizados em tempo real</span></div>
        <div className="admin-property-list">
          {properties.map((property) => <article key={property.id} className="admin-property-row"><img src={property.imagens[0]} alt="" /><div className="admin-property-info"><div><span className="mini-type">{propertyTypeLabel(property.tipo)}</span>{property.destaque && <span className="mini-featured"><Star size={11} fill="currentColor" /> Destaque</span>}</div><strong>{property.titulo}</strong><small>{property.codigo ? `Cód. ${property.codigo} · ` : ""}{property.bairro}, {property.cidade} · {formatPrice(property.preco)}</small></div><button className={`star-button ${property.destaque ? "active" : ""}`} onClick={() => toggleFeatured(property)} title="Alternar destaque"><Star fill={property.destaque ? "currentColor" : "none"} /></button><button onClick={() => openEdit(property)} title="Editar"><Edit3 /></button><button className="danger" onClick={() => deleteProperty(property)} title="Excluir"><Trash2 /></button></article>)}
          {!properties.length && <div className="admin-empty"><Building2 /><h2>Nenhum imóvel cadastrado</h2><p>Comece adicionando a primeira oportunidade.</p><button className="button button--gold" onClick={openCreate}><Plus /> Novo imóvel</button></div>}
        </div>
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
          <div className="form-section"><h3>Apresentação</h3><label className="span-2">Descrição<textarea required rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} /></label><label className="span-2 upload-field"><span><ImagePlus /> Adicionar fotos</span><input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(e.currentTarget.files); e.currentTarget.value = ""; }} /><small>{selectedPhotos.length ? `${selectedPhotos.length} nova(s) foto(s) pronta(s) para enviar` : "Adicione uma ou várias fotos por vez · PNG, JPG ou WebP"}</small></label>{((form.imagens?.length ?? 0) > 0 || selectedPhotos.length > 0) && <div className="span-2 photo-preview-grid">{form.imagens?.map((image, index) => <div className="photo-preview" key={image}><img src={image} alt={`Foto cadastrada ${index + 1}`} /><span>Cadastrada</span><button type="button" onClick={() => removeStoredPhoto(image)} aria-label={`Remover foto cadastrada ${index + 1}`}><X /></button></div>)}{selectedPhotos.map((photo, index) => <div className="photo-preview photo-preview--new" key={photo.id}><img src={photo.previewUrl} alt={`Nova foto ${index + 1}`} /><span>Nova</span><button type="button" onClick={() => removeSelectedPhoto(photo.id)} aria-label={`Remover nova foto ${index + 1}`}><X /></button></div>)}</div>}<label className="span-2 switch-row"><input type="checkbox" checked={form.destaque} onChange={(e) => update("destaque", e.target.checked)} /><span><b>Exibir na página inicial</b><small>Marcar como imóvel em destaque</small></span></label></div>
          {message && <div className="form-message">{message}</div>}
          <footer><button type="button" className="button button--outline-dark" onClick={closeEditor}>Cancelar</button><button className="button button--gold" disabled={saving}><Save size={17} /> {saving ? "Salvando..." : "Salvar imóvel"}</button></footer>
        </form>
      </div></div>}
    </main>
  );
}
