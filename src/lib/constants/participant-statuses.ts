export const testSessionParticipantStatuses = [
	'IN_PROGRESS', // Taking test
	'COMPLETED', // Finished test
	'ABANDONED' // Left test
] as const;
export type TestSessionParticipantStatus = (typeof testSessionParticipantStatuses)[number];
