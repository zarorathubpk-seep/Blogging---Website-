import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'archived';
  source: string;
  botTrap?: string;
}

const SUBMISSION_COOLDOWN_MS = 20000; // 20 seconds anti-spam throttle
const LAST_SUBMIT_KEY = 'toolcrest_last_contact_submit_ts';

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(String(email).toLowerCase().trim());
}

export async function sendContactMessage(payload: {
  name: string;
  email: string;
  category: string;
  message: string;
  botTrap?: string;
}): Promise<{ id: string; success: boolean }> {
  // 1. Anti-spam honeypot verification
  if (payload.botTrap && payload.botTrap.trim().length > 0) {
    console.warn('Bot submission blocked via honeypot trap.');
    // Return silent fake success to frustrate bots without revealing detection
    return { id: 'bot_blocked', success: true };
  }

  // 2. Strict field validations
  const cleanName = payload.name.trim();
  const cleanEmail = payload.email.trim();
  const cleanMessage = payload.message.trim();
  const cleanCategory = payload.category.trim();

  if (!cleanName || cleanName.length < 2 || cleanName.length > 120) {
    throw new Error('Please enter your full name (2–120 characters).');
  }

  if (!validateEmail(cleanEmail) || cleanEmail.length > 200) {
    throw new Error('Please provide a valid email address so we can reply.');
  }

  if (!cleanMessage || cleanMessage.length < 10 || cleanMessage.length > 4000) {
    throw new Error('Please enter a descriptive message between 10 and 4,000 characters.');
  }

  // 3. Client-side rate limiting / cooldown
  try {
    const lastSubmitStr = localStorage.getItem(LAST_SUBMIT_KEY);
    if (lastSubmitStr) {
      const elapsed = Date.now() - parseInt(lastSubmitStr, 10);
      if (elapsed < SUBMISSION_COOLDOWN_MS) {
        const remainingSec = Math.ceil((SUBMISSION_COOLDOWN_MS - elapsed) / 1000);
        throw new Error(`Please wait ${remainingSec} second(s) before sending another inquiry.`);
      }
    }
  } catch (storageErr: any) {
    if (storageErr?.message?.includes('Please wait')) {
      throw storageErr;
    }
  }

  // 4. Persistence to Firestore
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const docRef = doc(db, 'contact_messages', messageId);

  const newDoc: ContactMessage = {
    id: messageId,
    name: cleanName,
    email: cleanEmail,
    category: cleanCategory || 'General Inquiry',
    message: cleanMessage,
    createdAt: new Date().toISOString(),
    status: 'unread',
    source: 'toolcrest.site',
  };

  try {
    await setDoc(docRef, newDoc);
    try {
      localStorage.setItem(LAST_SUBMIT_KEY, Date.now().toString());
    } catch {}
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `contact_messages/${messageId}`);
  }

  // 5. Optional Webhook dispatch (e.g. Email notification service or Zapier if configured)
  const webhookUrl = (import.meta as any).env?.VITE_CONTACT_WEBHOOK_URL;
  if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http')) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'ToolCrest',
          ...newDoc,
        }),
      });
    } catch (whErr) {
      console.warn('Webhook notification dispatch note:', whErr);
    }
  }

  return { id: messageId, success: true };
}

/**
 * Fetch contact inquiries (Admin only)
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const colRef = collection(db, 'contact_messages');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ContactMessage);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'contact_messages');
    return [];
  }
}

/**
 * Update message status (Admin only)
 */
export async function updateContactMessageStatus(
  messageId: string,
  status: 'unread' | 'read' | 'archived'
): Promise<void> {
  try {
    const docRef = doc(db, 'contact_messages', messageId);
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${messageId}`);
  }
}

/**
 * Delete message (Admin only)
 */
export async function deleteContactMessage(messageId: string): Promise<void> {
  try {
    const docRef = doc(db, 'contact_messages', messageId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `contact_messages/${messageId}`);
  }
}
