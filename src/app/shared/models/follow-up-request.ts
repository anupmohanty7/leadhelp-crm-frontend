export interface FollowUpRequest {
  customerLeadId: number;
  followUpDate: string | null;
  discussionDetails: string;
  nextFollowUpDate: string | null;
  statusId: number;
}