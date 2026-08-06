import type {
  CharacteristicDefinition,
  Property,
  PropertySpecifications,
  PropertyType,
  SpecificationValue,
} from "@/src/types/property";

export interface SpecificationOption {
  value: string;
  label: string;
}

export interface SpecificationDefinition {
  key: string;
  label: string;
  type: "number" | "select" | "boolean" | "text";
  unit?: string;
  optional?: boolean;
  options?: SpecificationOption[];
  step?: string;
}

const furnishing: SpecificationDefinition = {
  key: "mobilia",
  label: "Mobília",
  type: "select",
  options: [
    { value: "sem_mobilia", label: "Sem mobília" },
    { value: "mobiliado", label: "Mobiliado" },
    { value: "semimobiliado", label: "Semimobiliado" },
  ],
};

const bedrooms: SpecificationDefinition = { key: "quartos", label: "Quartos", type: "number", step: "1" };
const bathrooms: SpecificationDefinition = { key: "banheiros", label: "Banheiros", type: "number", step: "1" };
const parking: SpecificationDefinition = { key: "vagas", label: "Vagas", type: "number", step: "1" };
const builtArea: SpecificationDefinition = { key: "area_construida_m2", label: "Área construída", type: "number", unit: "m²", step: "0.01" };
const landArea: SpecificationDefinition = { key: "area_terreno_m2", label: "Área do terreno", type: "number", unit: "m²", step: "0.01" };

const apartmentSpecifications: SpecificationDefinition[] = [
  furnishing,
  bedrooms,
  bathrooms,
  parking,
  { key: "area_m2", label: "Área", type: "number", unit: "m²", step: "0.01" },
  { key: "andar", label: "Andar", type: "number", step: "1" },
  { key: "elevadores_predio", label: "Elevadores no prédio", type: "number", step: "1", optional: true },
];

const houseSpecifications: SpecificationDefinition[] = [
  furnishing,
  bedrooms,
  bathrooms,
  parking,
  builtArea,
  landArea,
  { key: "pavimentos", label: "Número de pavimentos", type: "number", step: "1" },
];

const lotSpecifications: SpecificationDefinition[] = [
  landArea,
  { key: "testada_m", label: "Testada / frente", type: "number", unit: "m", step: "0.01" },
  {
    key: "topografia",
    label: "Topografia",
    type: "select",
    options: [
      { value: "plano", label: "Plano" },
      { value: "aclive", label: "Aclive" },
      { value: "declive", label: "Declive" },
    ],
  },
  { key: "esquina", label: "Terreno de esquina", type: "boolean" },
];

export const SPECIFICATIONS_BY_TYPE: Record<PropertyType, SpecificationDefinition[]> = {
  apartamento: apartmentSpecifications,
  casa: houseSpecifications,
  chacara: [
    ...houseSpecifications,
    { key: "distancia_cidade", label: "Distância da cidade", type: "text", optional: true },
  ],
  cobertura: apartmentSpecifications,
  galpao: [
    builtArea,
    landArea,
    { key: "pe_direito_m", label: "Pé-direito", type: "number", unit: "m", step: "0.01" },
    { key: "docas_carga", label: "Docas de carga", type: "number", step: "1" },
    { key: "capacidade_carga", label: "Capacidade de carga", type: "number", unit: "t", step: "0.01", optional: true },
    parking,
  ],
  loja: [
    { key: "area_m2", label: "Área", type: "number", unit: "m²", step: "0.01" },
    parking,
    { key: "vitrine", label: "Possui vitrine", type: "boolean" },
    { key: "banheiro", label: "Possui banheiro", type: "boolean" },
  ],
  lote: lotSpecifications,
  lote_condominio: lotSpecifications,
  predio: [
    { key: "area_total_m2", label: "Área total", type: "number", unit: "m²", step: "0.01" },
    { key: "andares", label: "Número de andares", type: "number", step: "1" },
    { key: "unidades", label: "Número de unidades", type: "number", step: "1" },
    { key: "unidades_por_andar", label: "Unidades por andar", type: "number", step: "1", optional: true },
    { key: "elevadores", label: "Elevadores", type: "number", step: "1" },
    { key: "vagas_totais", label: "Vagas totais", type: "number", step: "1" },
  ],
  sala: apartmentSpecifications,
  sitio: [
    ...houseSpecifications,
    { key: "distancia_cidade", label: "Distância da cidade", type: "text", optional: true },
  ],
};

const residential: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "sitio"];
const homes: PropertyType[] = ["casa", "chacara", "sitio"];
const condominiums: PropertyType[] = ["apartamento", "cobertura", "predio", "sala"];
const commercial: PropertyType[] = ["galpao", "loja", "predio", "sala"];
const constructed: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "galpao", "loja", "predio", "sala", "sitio"];
const allPropertyTypes: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "galpao", "loja", "lote", "lote_condominio", "predio", "sala", "sitio"];
const apartmentLike: PropertyType[] = ["apartamento", "cobertura", "sala"];
const apartmentCondominiums: PropertyType[] = ["apartamento", "cobertura"];
const rural: PropertyType[] = ["chacara", "sitio"];
const businessUnits: PropertyType[] = ["loja", "sala"];
const lots: PropertyType[] = ["lote", "lote_condominio"];

export const DEFAULT_CHARACTERISTICS: CharacteristicDefinition[] = [
  { id: "aquecimento_eletrico", nome: "Aquecimento elétrico", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "aquecimento_gas", nome: "Aquecimento a gás", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "aquecimento_solar", nome: "Aquecimento solar", categoria: "interna", tipos_aplicaveis: homes },
  { id: "ar_condicionado", nome: "Ar condicionado", categoria: "interna", tipos_aplicaveis: constructed },
  { id: "armario_cozinha", nome: "Armário na cozinha", categoria: "interna", tipos_aplicaveis: residential },
  { id: "armarios_embutidos", nome: "Armários embutidos", categoria: "interna", tipos_aplicaveis: [...residential, "sala"] },
  { id: "area_servico", nome: "Área de serviço", categoria: "interna", tipos_aplicaveis: residential },
  { id: "banheiro_comercial", nome: "Banheiro", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "box_banheiro", nome: "Box no banheiro", categoria: "interna", tipos_aplicaveis: residential },
  { id: "casa_maquinas", nome: "Casa de máquinas", categoria: "interna", tipos_aplicaveis: ["predio"] },
  { id: "closet", nome: "Closet", categoria: "interna", tipos_aplicaveis: residential },
  { id: "copa_kitchenette", nome: "Copa / Kitchenette", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "cozinha_planejada", nome: "Cozinha planejada", categoria: "interna", tipos_aplicaveis: residential },
  { id: "conexao_internet_fibra", nome: "Conexão internet (fibra)", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "deposito_despensa", nome: "Depósito / Despensa", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "deposito_interno", nome: "Depósito interno", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "divisorias", nome: "Divisórias", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "escada_incendio", nome: "Escada de incêndio", categoria: "interna", tipos_aplicaveis: ["predio"] },
  { id: "escritorio_home_office", nome: "Escritório / Home office", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "escritorio_interno", nome: "Escritório interno", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "forro_gesso", nome: "Forro de gesso", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "iluminacao_industrial", nome: "Iluminação industrial", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "janelas_antirruido", nome: "Janelas antirruído", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "lareira", nome: "Lareira", categoria: "interna", tipos_aplicaveis: homes },
  { id: "lavabo", nome: "Lavabo", categoria: "interna", tipos_aplicaveis: [...residential, "loja", "sala"] },
  { id: "lavanderia", nome: "Lavanderia", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "mezanino", nome: "Mezanino", categoria: "interna", tipos_aplicaveis: [...homes, "galpao"] },
  { id: "piso_industrial", nome: "Piso industrial", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "piso_laminado", nome: "Piso laminado", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "piso_porcelanato", nome: "Piso porcelanato", categoria: "interna", tipos_aplicaveis: [...apartmentLike, "loja"] },
  { id: "porao", nome: "Porão", categoria: "interna", tipos_aplicaveis: homes },
  { id: "rede_eletrica_trifasica", nome: "Rede elétrica trifásica", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "refeitorio", nome: "Refeitório", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "rouparia", nome: "Rouparia", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "sacada", nome: "Sacada", categoria: "interna", tipos_aplicaveis: [...apartmentLike, ...homes] },
  { id: "sauna", nome: "Sauna", categoria: "interna", tipos_aplicaveis: residential },
  { id: "sistema_exaustao", nome: "Sistema de exaustão", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "sotao", nome: "Sótão", categoria: "interna", tipos_aplicaveis: homes },
  { id: "terraco_gourmet", nome: "Terraço gourmet", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vestiario", nome: "Vestiário", categoria: "interna", tipos_aplicaveis: ["galpao"] },
  { id: "vista_mar", nome: "Vista para o mar", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vista_montanha", nome: "Vista para montanha", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vista_panoramica", nome: "Vista panorâmica", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vitrine", nome: "Vitrine", categoria: "interna", tipos_aplicaveis: businessUnits },
  { id: "academia", nome: "Academia", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "acesso_carga_descarga", nome: "Acesso para carga / descarga", categoria: "externa", tipos_aplicaveis: businessUnits },
  { id: "area_gourmet_externa", nome: "Área gourmet externa", categoria: "externa", tipos_aplicaveis: homes },
  { id: "area_mata_nativa", nome: "Área de mata nativa", categoria: "externa", tipos_aplicaveis: rural },
  { id: "asfalto_pavimentacao", nome: "Asfalto / Pavimentação", categoria: "externa", tipos_aplicaveis: lots },
  { id: "bicicletario", nome: "Bicicletário", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "campo_futebol", nome: "Campo de futebol", categoria: "externa", tipos_aplicaveis: rural },
  { id: "casa_caseiro", nome: "Casa de caseiro", categoria: "externa", tipos_aplicaveis: rural },
  { id: "cerca", nome: "Cerca", categoria: "externa", tipos_aplicaveis: rural },
  { id: "cerca_eletrica", nome: "Cerca elétrica", categoria: "externa", tipos_aplicaveis: homes },
  { id: "cerca_muro_perimetral", nome: "Cerca / Muro perimetral", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "churrasqueira", nome: "Churrasqueira", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "cftv", nome: "Circuito interno de TV (CFTV)", categoria: "externa", tipos_aplicaveis: [...apartmentCondominiums, "casa", "loja", "sala", "predio"] },
  { id: "condominio_fechado", nome: "Condomínio fechado", categoria: "externa", tipos_aplicaveis: [...condominiums, "casa", "lote_condominio"] },
  { id: "coworking", nome: "Coworking", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "curral", nome: "Curral", categoria: "externa", tipos_aplicaveis: rural },
  { id: "doca_carga", nome: "Doca de carga", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "edicula", nome: "Edícula", categoria: "externa", tipos_aplicaveis: ["casa"] },
  { id: "energia_eletrica_propria", nome: "Energia elétrica própria", categoria: "externa", tipos_aplicaveis: rural },
  { id: "energia_solar", nome: "Energia solar", categoria: "externa", tipos_aplicaveis: [...homes, "galpao", "loja", "predio"] },
  { id: "energia_trifasica_externa", nome: "Energia trifásica externa", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "elevador", nome: "Elevador", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "espaco_gourmet", nome: "Espaço gourmet", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "espaco_pet", nome: "Espaço pet", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "estacionamento", nome: "Estacionamento", categoria: "externa", tipos_aplicaveis: businessUnits },
  { id: "estacionamento_caminhoes", nome: "Estacionamento de caminhões", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "estacionamento_proprio", nome: "Estacionamento próprio", categoria: "externa", tipos_aplicaveis: ["predio"] },
  { id: "estrada_acesso", nome: "Estrada de acesso", categoria: "externa", tipos_aplicaveis: rural },
  { id: "fachada_propria", nome: "Fachada própria", categoria: "externa", tipos_aplicaveis: businessUnits },
  { id: "fossa_septica", nome: "Fossa séptica", categoria: "externa", tipos_aplicaveis: homes },
  { id: "galpao_deposito", nome: "Galpão / Depósito", categoria: "externa", tipos_aplicaveis: rural },
  { id: "garagem_coberta", nome: "Garagem coberta", categoria: "externa", tipos_aplicaveis: homes },
  { id: "gerador", nome: "Gerador", categoria: "externa", tipos_aplicaveis: [...apartmentCondominiums, "casa", "predio"] },
  { id: "guarita", nome: "Guarita", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "horta", nome: "Horta", categoria: "externa", tipos_aplicaveis: homes },
  { id: "jardim", nome: "Jardim", categoria: "externa", tipos_aplicaveis: [...homes, "predio"] },
  { id: "meio_fio", nome: "Meio-fio", categoria: "externa", tipos_aplicaveis: lots },
  { id: "muro_alto", nome: "Muro alto", categoria: "externa", tipos_aplicaveis: ["casa"] },
  { id: "muro_divisa", nome: "Muro de divisa", categoria: "externa", tipos_aplicaveis: lots },
  { id: "nascente_agua", nome: "Nascente d'água", categoria: "externa", tipos_aplicaveis: rural },
  { id: "pasto", nome: "Pasto", categoria: "externa", tipos_aplicaveis: rural },
  { id: "patio_manobra", nome: "Pátio de manobra", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "piscina", nome: "Piscina", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "poco_artesiano", nome: "Poço artesiano", categoria: "externa", tipos_aplicaveis: homes },
  { id: "pomar", nome: "Pomar", categoria: "externa", tipos_aplicaveis: homes },
  { id: "playground", nome: "Playground", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "portao_caminhao", nome: "Portão para caminhão", categoria: "externa", tipos_aplicaveis: ["galpao"] },
  { id: "portao_eletronico", nome: "Portão eletrônico", categoria: "externa", tipos_aplicaveis: [...constructed, "lote_condominio"] },
  { id: "portaria", nome: "Portaria", categoria: "externa", tipos_aplicaveis: [...businessUnits, "predio"] },
  { id: "portaria_24h", nome: "Portaria 24h", categoria: "externa", tipos_aplicaveis: [...apartmentCondominiums, "lote_condominio"] },
  { id: "quadra_poliesportiva", nome: "Quadra poliesportiva", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "quintal", nome: "Quintal", categoria: "externa", tipos_aplicaveis: homes },
  { id: "quiosque", nome: "Quiosque", categoria: "externa", tipos_aplicaveis: rural },
  { id: "rede_agua", nome: "Rede de água", categoria: "externa", tipos_aplicaveis: lots },
  { id: "rede_eletrica_disponivel", nome: "Rede elétrica disponível", categoria: "externa", tipos_aplicaveis: lots },
  { id: "rede_esgoto", nome: "Rede de esgoto", categoria: "externa", tipos_aplicaveis: lots },
  { id: "represa_acude", nome: "Represa / Açude", categoria: "externa", tipos_aplicaveis: rural },
  { id: "reservatorio_agua", nome: "Reservatório de água próprio", categoria: "externa", tipos_aplicaveis: ["predio"] },
  { id: "salao_festas", nome: "Salão de festas", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "sistema_energia_solar", nome: "Sistema de energia solar", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "acesso_pcd", nome: "Acesso para PCD", categoria: "geral", tipos_aplicaveis: constructed },
  { id: "aceita_financiamento", nome: "Aceita financiamento", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "aceita_permuta", nome: "Aceita permuta", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "alvara_funcionamento", nome: "Alvará de funcionamento", categoria: "geral", tipos_aplicaveis: businessUnits },
  { id: "area_preservacao_proxima", nome: "Área de preservação próxima", categoria: "geral", tipos_aplicaveis: lots },
  { id: "documentacao_regularizada", nome: "Documentação regularizada", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "fachada_comercial", nome: "Fachada comercial", categoria: "geral", tipos_aplicaveis: commercial },
  { id: "fluxo_pessoas_alto", nome: "Fluxo de pessoas alto", categoria: "geral", tipos_aplicaveis: businessUnits },
  { id: "habite_se", nome: "Habite-se emitido", categoria: "geral", tipos_aplicaveis: ["predio"] },
  { id: "interfone", nome: "Interfone", categoria: "geral", tipos_aplicaveis: [...condominiums, "casa"] },
  { id: "mobiliado", nome: "Mobiliado", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "pe_direito_alto", nome: "Pé-direito alto", categoria: "geral", tipos_aplicaveis: ["galpao"] },
  { id: "proximo_comercio_escolas", nome: "Próximo a comércio/escolas", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "proximo_rodovia", nome: "Próximo a rodovia", categoria: "geral", tipos_aplicaveis: ["galpao"] },
  { id: "proximo_transporte_publico", nome: "Próximo a transporte público", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "rua_asfaltada", nome: "Rua asfaltada", categoria: "geral", tipos_aplicaveis: ["casa"] },
  { id: "semimobiliado", nome: "Semimobiliado", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "sistema_seguranca", nome: "Sistema de segurança", categoria: "geral", tipos_aplicaveis: [...constructed, "lote_condominio"] },
  { id: "uso_misto", nome: "Uso misto (comercial / residencial)", categoria: "geral", tipos_aplicaveis: ["predio"] },
  { id: "vista_privilegiada", nome: "Vista privilegiada", categoria: "geral", tipos_aplicaveis: lots },
  { id: "zoneamento_industrial", nome: "Zoneamento industrial", categoria: "geral", tipos_aplicaveis: ["galpao"] },
];

export function applicableCharacteristics(type: PropertyType, characteristics = DEFAULT_CHARACTERISTICS) {
  return characteristics.filter((item) => item.tipos_aplicaveis.includes(type));
}

export function legacyColumnsFromSpecifications(type: PropertyType, specifications: PropertySpecifications) {
  const number = (...keys: string[]) => {
    const value = keys.map((key) => specifications[key]).find((item) => typeof item === "number");
    return typeof value === "number" ? value : 0;
  };
  return {
    area: number("area_m2", "area_construida_m2", "area_terreno_m2", "area_total_m2"),
    quartos: number("quartos"),
    banheiros: number("banheiros") || (specifications.banheiro === true ? 1 : 0),
    vagas: number("vagas", "vagas_totais"),
  };
}

function specificationsFromLegacy(property: Record<string, unknown>): PropertySpecifications {
  const type = property.tipo as PropertyType;
  const area = Number(property.area) || 0;
  const quartos = Number(property.quartos) || 0;
  const banheiros = Number(property.banheiros) || 0;
  const vagas = Number(property.vagas) || 0;
  const specifications: PropertySpecifications = {};
  const add = (key: string, value: number) => { if (value > 0) specifications[key] = value; };
  if (["apartamento", "cobertura", "sala", "loja"].includes(type)) add("area_m2", area);
  else if (["casa", "chacara", "sitio", "galpao"].includes(type)) add("area_construida_m2", area);
  else if (["lote", "lote_condominio"].includes(type)) add("area_terreno_m2", area);
  else if (type === "predio") add("area_total_m2", area);
  add("quartos", quartos);
  add("banheiros", banheiros);
  add(type === "predio" ? "vagas_totais" : "vagas", vagas);
  return specifications;
}

export function normalizePropertyRow(row: Record<string, unknown>): Property {
  const savedSpecifications = row.especificacoes && typeof row.especificacoes === "object"
    ? row.especificacoes as PropertySpecifications
    : {};
  const specifications = Object.keys(savedSpecifications).length ? savedSpecifications : specificationsFromLegacy(row);
  const links = Array.isArray(row.imovel_caracteristicas) ? row.imovel_caracteristicas : [];
  const characteristics = links.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const link = item as { caracteristica_id?: string; caracteristicas?: unknown };
    const nested = Array.isArray(link.caracteristicas) ? link.caracteristicas[0] : link.caracteristicas;
    if (nested && typeof nested === "object") return [nested as Property["caracteristicas"][number]];
    const fallback = DEFAULT_CHARACTERISTICS.find((feature) => feature.id === link.caracteristica_id);
    return fallback ? [{ id: fallback.id, nome: fallback.nome, categoria: fallback.categoria }] : [];
  }).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  return {
    ...(row as unknown as Property),
    numero: (row.numero as string) ?? "",
    complemento: (row.complemento as string) ?? "",
    status: (row.status as Property["status"]) ?? "disponivel",
    imagens: Array.isArray(row.imagens) ? row.imagens.filter((item): item is string => typeof item === "string" && Boolean(item)) : [],
    videos: Array.isArray(row.videos) ? row.videos.filter((item): item is string => typeof item === "string" && Boolean(item)) : [],
    especificacoes: specifications,
    caracteristicas: characteristics,
  };
}

export function isFilledSpecification(value: SpecificationValue | undefined) {
  return value !== undefined && value !== "" && !(typeof value === "number" && value === 0);
}

export function formatSpecificationValue(definition: SpecificationDefinition, value: SpecificationValue) {
  if (definition.type === "boolean") return value ? "Sim" : "Não";
  if (definition.type === "select") return definition.options?.find((option) => option.value === value)?.label ?? String(value);
  if (definition.type === "text") return String(value);
  const formatted = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value));
  return definition.unit ? `${formatted} ${definition.unit}` : formatted;
}

export function displaySpecifications(property: Property) {
  return SPECIFICATIONS_BY_TYPE[property.tipo]
    .filter((definition) => isFilledSpecification(property.especificacoes[definition.key]))
    .map((definition) => ({
      key: definition.key,
      label: definition.label,
      value: formatSpecificationValue(definition, property.especificacoes[definition.key]),
    }));
}
