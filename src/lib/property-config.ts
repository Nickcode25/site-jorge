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
  type: "number" | "select" | "boolean";
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
  chacara: houseSpecifications,
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
    { key: "elevadores", label: "Elevadores", type: "number", step: "1" },
    { key: "vagas_totais", label: "Vagas totais", type: "number", step: "1" },
  ],
  sala: apartmentSpecifications,
  sitio: houseSpecifications,
};

const residential: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "sitio"];
const homes: PropertyType[] = ["casa", "chacara", "sitio"];
const condominiums: PropertyType[] = ["apartamento", "cobertura", "predio", "sala"];
const commercial: PropertyType[] = ["galpao", "loja", "predio", "sala"];
const constructed: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "galpao", "loja", "predio", "sala", "sitio"];
const allPropertyTypes: PropertyType[] = ["apartamento", "casa", "chacara", "cobertura", "galpao", "loja", "lote", "lote_condominio", "predio", "sala", "sitio"];
const apartmentLike: PropertyType[] = ["apartamento", "cobertura", "sala"];
const apartmentCondominiums: PropertyType[] = ["apartamento", "cobertura"];

export const DEFAULT_CHARACTERISTICS: CharacteristicDefinition[] = [
  { id: "aquecimento_eletrico", nome: "Aquecimento elétrico", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "aquecimento_gas", nome: "Aquecimento a gás", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "ar_condicionado", nome: "Ar condicionado", categoria: "interna", tipos_aplicaveis: constructed },
  { id: "armario_cozinha", nome: "Armário na cozinha", categoria: "interna", tipos_aplicaveis: residential },
  { id: "armarios_embutidos", nome: "Armários embutidos", categoria: "interna", tipos_aplicaveis: [...residential, "sala"] },
  { id: "area_servico", nome: "Área de serviço", categoria: "interna", tipos_aplicaveis: residential },
  { id: "box_banheiro", nome: "Box no banheiro", categoria: "interna", tipos_aplicaveis: residential },
  { id: "closet", nome: "Closet", categoria: "interna", tipos_aplicaveis: residential },
  { id: "cozinha_planejada", nome: "Cozinha planejada", categoria: "interna", tipos_aplicaveis: residential },
  { id: "conexao_internet_fibra", nome: "Conexão internet (fibra)", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "deposito_despensa", nome: "Depósito / Despensa", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "escritorio_home_office", nome: "Escritório / Home office", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "janelas_antirruido", nome: "Janelas antirruído", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "lareira", nome: "Lareira", categoria: "interna", tipos_aplicaveis: homes },
  { id: "lavabo", nome: "Lavabo", categoria: "interna", tipos_aplicaveis: [...residential, "loja", "sala"] },
  { id: "lavanderia", nome: "Lavanderia", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "piso_laminado", nome: "Piso laminado", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "piso_porcelanato", nome: "Piso porcelanato", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "rouparia", nome: "Rouparia", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "sacada", nome: "Sacada", categoria: "interna", tipos_aplicaveis: ["apartamento", "cobertura", "sala"] },
  { id: "sauna", nome: "Sauna", categoria: "interna", tipos_aplicaveis: residential },
  { id: "terraco_gourmet", nome: "Terraço gourmet", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vista_mar", nome: "Vista para o mar", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vista_montanha", nome: "Vista para montanha", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "vista_panoramica", nome: "Vista panorâmica", categoria: "interna", tipos_aplicaveis: apartmentLike },
  { id: "academia", nome: "Academia", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "bicicletario", nome: "Bicicletário", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "churrasqueira", nome: "Churrasqueira", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "cftv", nome: "Circuito interno de TV (CFTV)", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "condominio_fechado", nome: "Condomínio fechado", categoria: "externa", tipos_aplicaveis: [...condominiums, "casa", "lote_condominio"] },
  { id: "coworking", nome: "Coworking", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "elevador", nome: "Elevador", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "espaco_gourmet", nome: "Espaço gourmet", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "espaco_pet", nome: "Espaço pet", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "gerador", nome: "Gerador", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "jardim", nome: "Jardim", categoria: "externa", tipos_aplicaveis: [...homes, "predio"] },
  { id: "piscina", nome: "Piscina", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "playground", nome: "Playground", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "portao_eletronico", nome: "Portão eletrônico", categoria: "externa", tipos_aplicaveis: [...constructed, "lote_condominio"] },
  { id: "portaria_24h", nome: "Portaria 24h", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "quadra_poliesportiva", nome: "Quadra poliesportiva", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "salao_festas", nome: "Salão de festas", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "sistema_energia_solar", nome: "Sistema de energia solar", categoria: "externa", tipos_aplicaveis: apartmentCondominiums },
  { id: "acesso_pcd", nome: "Acesso para PCD", categoria: "geral", tipos_aplicaveis: constructed },
  { id: "aceita_financiamento", nome: "Aceita financiamento", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "aceita_permuta", nome: "Aceita permuta", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "doca_carga", nome: "Doca de carga", categoria: "geral", tipos_aplicaveis: ["galpao"] },
  { id: "documentacao_regularizada", nome: "Documentação regularizada", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "energia_solar", nome: "Energia solar", categoria: "geral", tipos_aplicaveis: [...homes, "galpao", "loja", "predio"] },
  { id: "fachada_comercial", nome: "Fachada comercial", categoria: "geral", tipos_aplicaveis: commercial },
  { id: "interfone", nome: "Interfone", categoria: "geral", tipos_aplicaveis: [...condominiums, "casa"] },
  { id: "mobiliado", nome: "Mobiliado", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "pe_direito_alto", nome: "Pé-direito alto", categoria: "geral", tipos_aplicaveis: ["galpao"] },
  { id: "proximo_comercio_escolas", nome: "Próximo a comércio/escolas", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "proximo_transporte_publico", nome: "Próximo a transporte público", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "semimobiliado", nome: "Semimobiliado", categoria: "geral", tipos_aplicaveis: allPropertyTypes },
  { id: "sistema_seguranca", nome: "Sistema de segurança", categoria: "geral", tipos_aplicaveis: [...constructed, "lote_condominio"] },
  { id: "vitrine", nome: "Vitrine", categoria: "geral", tipos_aplicaveis: ["loja"] },
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
