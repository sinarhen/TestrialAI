export const testSessionParticipantStatuses = ['joined', 'active', 'completed', 'aborted'] as const;
export type TestSessionParticipantStatus = (typeof testSessionParticipantStatuses)[number];
