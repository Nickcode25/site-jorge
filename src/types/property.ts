export const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "chacara", label: "Chácara" },
  { value: "cobertura", label: "Cobertura" },
  { value: "galpao", label: "Galpão" },
  { value: "loja", label: "Loja" },
  { value: "lote", label: "Lote" },
  { value: "lote_condominio", label: "Lote em Condomínio" },
  { value: "predio", label: "Prédio" },
  { value: "sala", label: "Sala" },
  { value: "sitio", label: "Sítio" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];

export type PropertyStatus = "disponivel" | "reservado" | "vendido" | "inativo";
export type SpecificationValue = string | number | boolean;
export type PropertySpecifications = Record<string, SpecificationValue>;
export type CharacteristicCategory = "interna" | "externa" | "geral";

export interface PropertyCharacteristic {
  id: string;
  nome: string;
  categoria: CharacteristicCategory;
}

export interface CharacteristicDefinition extends PropertyCharacteristic {
  tipos_aplicaveis: PropertyType[];
}

export function propertyTypeLabel(type: PropertyType | string) {
  return PROPERTY_TYPES.find((option) => option.value === type)?.label ?? type;
}

export interface Property {
  id: string;
  codigo: string;
  titulo: string;
  tipo: PropertyType;
  preco: number;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  status: PropertyStatus;
  descricao: string;
  especificacoes: PropertySpecifications;
  caracteristicas: PropertyCharacteristic[];
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
  destaque: boolean;
  criado_em: string;
}

export type PropertyFormData = Omit<Property, "id" | "criado_em" | "imagens" | "caracteristicas"> & {
  id?: string;
  imagens?: string[];
  caracteristicas: string[];
};
