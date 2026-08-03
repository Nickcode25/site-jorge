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

export const DEFAULT_CHARACTERISTICS: CharacteristicDefinition[] = [
  { id: "ar_condicionado", nome: "Ar condicionado", categoria: "interna", tipos_aplicaveis: constructed },
  { id: "armario_cozinha", nome: "Armário na cozinha", categoria: "interna", tipos_aplicaveis: residential },
  { id: "armarios_embutidos", nome: "Armários embutidos", categoria: "interna", tipos_aplicaveis: [...residential, "sala"] },
  { id: "area_servico", nome: "Área de serviço", categoria: "interna", tipos_aplicaveis: residential },
  { id: "box_banheiro", nome: "Box no banheiro", categoria: "interna", tipos_aplicaveis: residential },
  { id: "closet", nome: "Closet", categoria: "interna", tipos_aplicaveis: residential },
  { id: "cozinha_planejada", nome: "Cozinha planejada", categoria: "interna", tipos_aplicaveis: residential },
  { id: "lareira", nome: "Lareira", categoria: "interna", tipos_aplicaveis: homes },
  { id: "lavabo", nome: "Lavabo", categoria: "interna", tipos_aplicaveis: [...residential, "loja", "sala"] },
  { id: "sacada", nome: "Sacada", categoria: "interna", tipos_aplicaveis: ["apartamento", "cobertura", "sala"] },
  { id: "sauna", nome: "Sauna", categoria: "interna", tipos_aplicaveis: residential },
  { id: "academia", nome: "Academia", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "churrasqueira", nome: "Churrasqueira", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "condominio_fechado", nome: "Condomínio fechado", categoria: "externa", tipos_aplicaveis: [...condominiums, "casa", "lote_condominio"] },
  { id: "elevador", nome: "Elevador", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "jardim", nome: "Jardim", categoria: "externa", tipos_aplicaveis: [...homes, "predio"] },
  { id: "piscina", nome: "Piscina", categoria: "externa", tipos_aplicaveis: [...residential, "lote_condominio"] },
  { id: "portao_eletronico", nome: "Portão eletrônico", categoria: "externa", tipos_aplicaveis: [...constructed, "lote_condominio"] },
  { id: "salao_festas", nome: "Salão de festas", categoria: "externa", tipos_aplicaveis: condominiums },
  { id: "acesso_pcd", nome: "Acesso para PCD", categoria: "geral", tipos_aplicaveis: constructed },
  { id: "doca_carga", nome: "Doca de carga", categoria: "geral", tipos_aplicaveis: ["galpao"] },
  { id: "energia_solar", nome: "Energia solar", categoria: "geral", tipos_aplicaveis: [...homes, "galpao", "loja", "predio"] },
  { id: "fachada_comercial", nome: "Fachada comercial", categoria: "geral", tipos_aplicaveis: commercial },
  { id: "interfone", nome: "Interfone", categoria: "geral", tipos_aplicaveis: [...condominiums, "casa"] },
  { id: "pe_direito_alto", nome: "Pé-direito alto", categoria: "geral", tipos_aplicaveis: ["galpao"] },
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
