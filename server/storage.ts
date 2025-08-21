import { type TempAccount, type InsertTempAccount, type EmailAddress, type InsertEmailAddress, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTempAccount(id: string): Promise<TempAccount | undefined>;
  getTempAccountByUsername(username: string): Promise<TempAccount | undefined>;
  createTempAccount(account: InsertTempAccount): Promise<TempAccount>;
  updateTempAccount(id: string, updates: Partial<TempAccount>): Promise<TempAccount>;
  getEmailAddresses(accountId: string): Promise<EmailAddress[]>;
  getEmailAddress(id: string): Promise<EmailAddress | undefined>;
  createEmailAddress(accountId: string, email: InsertEmailAddress): Promise<EmailAddress>;
  getMessages(emailId: string): Promise<Message[]>;
  createMessage(emailId: string, message: InsertMessage): Promise<Message>;
  getMessage(id: string): Promise<Message | undefined>;
  getMessageByMailTmId(messageId: string): Promise<Message | undefined>;
  markMessageAsSeen(id: string): Promise<void>;
  deleteMessage(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private accounts: Map<string, TempAccount>;
  private emails: Map<string, EmailAddress>;
  private messages: Map<string, Message>;

  constructor() {
    this.accounts = new Map();
    this.emails = new Map();
    this.messages = new Map();
  }

  async getTempAccount(id: string): Promise<TempAccount | undefined> {
    return this.accounts.get(id);
  }

  async getTempAccountByUsername(username: string): Promise<TempAccount | undefined> {
    return Array.from(this.accounts.values()).find(
      (account) => account.username === username,
    );
  }

  async createTempAccount(insertAccount: InsertTempAccount): Promise<TempAccount> {
    const id = randomUUID();
    const account: TempAccount = {
      ...insertAccount,
      id,
      personalEmail: null,
      createdAt: new Date(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateTempAccount(id: string, updates: Partial<TempAccount>): Promise<TempAccount> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error('Account not found');
    }
    
    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async getEmailAddresses(accountId: string): Promise<EmailAddress[]> {
    return Array.from(this.emails.values())
      .filter((email) => email.accountId === accountId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getEmailAddress(id: string): Promise<EmailAddress | undefined> {
    return this.emails.get(id);
  }

  async createEmailAddress(accountId: string, insertEmail: InsertEmailAddress): Promise<EmailAddress> {
    const id = randomUUID();
    const email: EmailAddress = {
      id,
      accountId,
      emailAddress: insertEmail.emailAddress,
      mailTmAccountId: insertEmail.mailTmAccountId,
      mailTmToken: insertEmail.mailTmToken,
      createdAt: new Date(),
    };
    this.emails.set(id, email);
    return email;
  }

  async getMessages(emailId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.emailId === emailId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createMessage(emailId: string, insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      emailId,
      messageId: insertMessage.messageId,
      from: insertMessage.from,
      to: [...insertMessage.to],
      subject: insertMessage.subject,
      intro: insertMessage.intro || null,
      text: insertMessage.text || null,
      html: insertMessage.html || null,
      seen: false,
      hasAttachments: insertMessage.hasAttachments || false,
      attachments: insertMessage.attachments ? [...insertMessage.attachments] : null,
      createdAt: insertMessage.createdAt,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessageByMailTmId(messageId: string): Promise<Message | undefined> {
    return Array.from(this.messages.values()).find(
      (message) => message.messageId === messageId,
    );
  }

  async markMessageAsSeen(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.seen = true;
      this.messages.set(id, message);
    }
  }

  async deleteMessage(id: string): Promise<void> {
    this.messages.delete(id);
  }
}

export const storage = new MemStorage();
