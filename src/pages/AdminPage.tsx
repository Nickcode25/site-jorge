"use client";

import { Building2, Edit3, Eye, ImagePlus, LayoutDashboard, LogOut, Plus, Save, Star, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { formatPrice } from "@/src/components/PropertyCard";
import { useAuth } from "@/src/hooks/useAuth";
import { cepDigits, formatCep, lookupAddressByCep } from "@/src/lib/address";
import { supabase } from "@/src/lib/supabase";
import { PROPERTY_TYPES, propertyTypeLabel, type Property, type PropertyFormData, type PropertyType } from "@/src/types/property";

const emptyForm: PropertyFormData = {
  codigo: "", titulo: "", tipo: "apartamento", preco: 0, cep: "", endereco: "", bairro: "", cidade: "", estado: "", descricao: "", area: 0,
  quartos: 0, banheiros: 0, vagas: 0, destaque: false, imagens: [],
};

export function AdminPage() {
  const { user, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<PropertyFormData>(emptyForm);
  const [files, setFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cepStatus, setCepStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const cepLookupId = useRef(0);

  async function loadProperties() {
    if (!supabase) return;
    const { data } = await supabase.from("imoveis").select("*").order("criado_em", { ascending: false });
    setProperties((data as Property[]) ?? []);
  }

  useEffect(() => { if (user) void loadProperties(); }, [user]);
  if (loading) return <div className="admin-loading">Carregando painel...</div>;
  if (!user || !supabase) return <Navigate to="/admin/login" replace />;

  function openCreate() { setForm(emptyForm); setFiles([]); setMessage(null); setCepStatus("idle"); setEditing(true); }
  function openEdit(property: Property) { setForm({ ...emptyForm, ...property, codigo: property.codigo ?? "", cep: formatCep(property.cep ?? ""), estado: property.estado ?? "" }); setFiles([]); setMessage(null); setCepStatus("idle"); setEditing(true); }
  function update<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) { setForm((current) => ({ ...current, [key]: value })); }

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
    for (const file of files) {
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
      const payload = { ...form, imagens: [...(form.imagens ?? []), ...uploaded] };
      const { id, ...values } = payload;
      const result = id
        ? await supabase!.from("imoveis").update(values).eq("id", id)
        : await supabase!.from("imoveis").insert(values);
      if (result.error) throw result.error;
      await loadProperties(); setEditing(false); setMessage("Imóvel salvo com sucesso.");
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

      {editing && <div className="modal-backdrop" role="presentation"><div className="property-modal" role="dialog" aria-modal="true" aria-label={form.id ? "Editar imóvel" : "Novo imóvel"}><header><div><span className="section-label">Cadastro de imóvel</span><h2>{form.id ? "Editar imóvel" : "Novo imóvel"}</h2></div><button onClick={() => setEditing(false)} aria-label="Fechar"><X /></button></header>
        <form onSubmit={saveProperty}>
          <div className="form-section"><h3>Informações principais</h3><label>Título do anúncio<input required value={form.titulo} onChange={(e) => update("titulo", e.target.value)} placeholder="Ex.: Apartamento Jardins Essence" /></label><label>Código do imóvel<input required inputMode="numeric" pattern="[0-9]+" value={form.codigo} onChange={(e) => update("codigo", e.target.value.replace(/\D/g, ""))} placeholder="Ex.: 1024" /></label><label>Tipo<select value={form.tipo} onChange={(e) => update("tipo", e.target.value as PropertyType)}>{PROPERTY_TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label>Preço (R$)<input required min="0" type="number" value={form.preco || ""} onChange={(e) => update("preco", Number(e.target.value))} /></label></div>
          <div className="form-section form-section--location"><h3>Localização</h3><label>CEP<input required inputMode="numeric" autoComplete="postal-code" value={form.cep} onChange={(e) => changeCep(e.target.value)} placeholder="00000-000" maxLength={9} />{cepStatus === "loading" && <small className="field-helper">Buscando endereço...</small>}{cepStatus === "success" && <small className="field-helper field-helper--success">Endereço preenchido. Confira e acrescente o número.</small>}{cepStatus === "error" && <small className="field-helper field-helper--error">CEP não encontrado. Preencha os campos manualmente.</small>}</label><label className="span-2">Endereço<input required autoComplete="street-address" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} placeholder="Rua, avenida e número" /></label><label>Bairro<input required value={form.bairro} onChange={(e) => update("bairro", e.target.value)} /></label><label>Cidade<input required value={form.cidade} onChange={(e) => update("cidade", e.target.value)} /></label><label>UF<input required value={form.estado} onChange={(e) => update("estado", e.target.value.toUpperCase().slice(0, 2))} placeholder="MG" maxLength={2} /></label></div>
          <div className="form-section form-section--specs"><h3>Características</h3>{(["area", "quartos", "banheiros", "vagas"] as const).map((field) => <label key={field}>{field === "area" ? "Área (m²)" : field[0].toUpperCase() + field.slice(1)}<input required min="0" type="number" value={form[field] || ""} onChange={(e) => update(field, Number(e.target.value))} /></label>)}</div>
          <div className="form-section"><h3>Apresentação</h3><label className="span-2">Descrição<textarea required rows={5} value={form.descricao} onChange={(e) => update("descricao", e.target.value)} /></label><label className="span-2 upload-field"><span><ImagePlus /> Adicionar fotos</span><input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files ?? []))} /><small>{files.length ? `${files.length} foto(s) selecionada(s)` : "PNG, JPG ou WebP · múltiplos arquivos"}</small></label><label className="span-2 switch-row"><input type="checkbox" checked={form.destaque} onChange={(e) => update("destaque", e.target.checked)} /><span><b>Exibir na página inicial</b><small>Marcar como imóvel em destaque</small></span></label></div>
          {message && <div className="form-message">{message}</div>}
          <footer><button type="button" className="button button--outline-dark" onClick={() => setEditing(false)}>Cancelar</button><button className="button button--gold" disabled={saving}><Save size={17} /> {saving ? "Salvando..." : "Salvar imóvel"}</button></footer>
        </form>
      </div></div>}
    </main>
  );
}
