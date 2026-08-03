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
  descricao: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  imagens: string[];
  destaque: boolean;
  criado_em: string;
}

export type PropertyFormData = Omit<Property, "id" | "criado_em" | "imagens"> & {
  id?: string;
  imagens?: string[];
};
