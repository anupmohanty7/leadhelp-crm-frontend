import { LeadStatus } from './lead-status';
import { LeadType } from './lead-type';
import { Priority } from './priority';

export interface CustomerLead {
  id: number;
  customerName: string;
  mobile: string;
  alternateNumber?: string;
  email?: string;
  city?: string;
  address?: string;
  requirement?: string;
  leadSource?: string;
  assignedExecutive?: string;
  discussionDetails?: string;
  visitDate?: string;
  nextFollowUpDate?: string;
  active: boolean;
  createdDate: string;
  leadType: LeadType;
  status: LeadStatus;
  priority: Priority;
}