
// for chat (to prevent dulplicate one-on-one chat creation)
export function generateOneToOneKey(userId1: string, userId2: string) {
  return [userId1, userId2].sort().join("_");
}
