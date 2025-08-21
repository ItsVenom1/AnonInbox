// Mail.tm API service utilities
export const MAILTM_API_BASE = 'https://api.mail.tm';

export interface MailTmDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
}

export interface MailTmAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmMessage {
  id: string;
  accountId: string;
  msgid: string;
  from: { name: string; address: string };
  to: Array<{ name: string; address: string }>;
  subject: string;
  intro: string;
  text?: string;
  html?: string;
  seen: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    downloadUrl: string;
  }>;
  createdAt: string;
}

export interface MailTmToken {
  id: string;
  token: string;
}

// Generate random credentials for temporary accounts
export function generateCredentials() {
  const username = 'user_' + Math.random().toString(36).substr(2, 8);
  const password = 'temp_' + Math.random().toString(36).substr(2, 8);
  return { username, password };
}

// Format relative time for message timestamps
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const messageTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// Copy text to clipboard with error handling
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
