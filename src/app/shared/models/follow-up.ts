import { CustomerLead } from './customer-lead';
import { LeadStatus } from './lead-status';

export interface FollowUp {
  id: number;
  customerLead: CustomerLead;
  followUpDate: string;
  discussionDetails: string;
  nextFollowUpDate?: string;
  status: LeadStatus;
  createdDate: string;
}