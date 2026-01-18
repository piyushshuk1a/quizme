export const normalizeEmail = (email: string): string =>
  String(email || '')
    .trim()
    .toLowerCase();

export const getInviteSafeId = (email: string): string => {
  const emailNormalized = normalizeEmail(email);
  // safe id for a per-quiz subcollection doc id
  return encodeURIComponent(emailNormalized);
};

export const getGlobalInviteDocId = (quizId: string, email: string): string => {
  const safeId = getInviteSafeId(email);
  return `${quizId}_${safeId}`;
};
