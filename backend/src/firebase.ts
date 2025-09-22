import admin from 'firebase-admin';

import { config } from '@/config';

admin.initializeApp({
  credential: admin.credential.cert({
    privateKey: config.firestorePrivateKey,
    clientEmail: config.firestoreClientEmail,
    projectId: config.firestoreProjectId,
  }),
});

const db = admin.firestore();

export { db };
