export interface LeadType {
  id: number;
  leadTypeName: string;
  active: boolean;
  createdDate?: string;
}

export interface LeadTypeRequest {
  leadTypeName: string;
  active: boolean;
}