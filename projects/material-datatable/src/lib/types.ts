export type PrimitiveType = string | number | boolean | null | undefined;
export interface SelectOptionType {
  key: string;
  value: Exclude<PrimitiveType, null | undefined>;
}

export interface DataModel {
  id: number | string;
  name?: string;
}

export interface FilterPayload {
  textSearch?: string;
  formSearch?: Record<string, PrimitiveType | PrimitiveType[]>;
}
