export type PropertyType = "apartamento" | "casa" | "lote";

export interface Property {
  id: string;
  titulo: string;
  tipo: PropertyType;
  preco: number;
  endereco: string;
  bairro: string;
  cidade: string;
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
