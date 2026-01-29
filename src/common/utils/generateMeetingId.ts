export function generateMeetingId(sessionId: string, startTime: Date) {
  return `session_${sessionId}_${startTime.getTime()}`;
}
