import { CustomerLead } from './customer-lead';

export interface Note {
  id: number;
  customerLead: CustomerLead;
  noteText: string;
  createdBy?: string;
  createdDate: string;
}