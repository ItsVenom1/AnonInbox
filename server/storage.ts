import { 
  type TempAccount, 
  type InsertTempAccount, 
  type EmailAddress, 
  type InsertEmailAddress, 
  type Message, 
  type InsertMessage,
  type BlogPost,
  type InsertBlogPost,
  type BlogCategory,
  type InsertBlogCategory,
  type BackupConfig,
  type InsertBackupConfig
} from "@shared/schema";
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
  // Admin methods
  getTotalAccountsCount(): Promise<number>;
  getTotalEmailsCount(): Promise<number>;
  getTodayEmailsCount(): Promise<number>;
  getTotalMessagesCount(): Promise<number>;
  getRecentMessages(limit: number): Promise<Message[]>;
  getRecentEmails(limit: number): Promise<EmailAddress[]>;
  getRecentAccounts(limit: number): Promise<TempAccount[]>;
  getAllTempAccounts(): Promise<TempAccount[]>;
  getAllEmailAddresses(): Promise<EmailAddress[]>;
  getAllMessages(): Promise<Message[]>;
  
  // Blog Management
  createBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(filters?: { status?: string; limit?: number; offset?: number }): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | null>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  
  createBlogCategory(data: InsertBlogCategory): Promise<BlogCategory>;
  getBlogCategories(): Promise<BlogCategory[]>;
  deleteBlogCategory(id: string): Promise<void>;

  // Backup Management
  createBackupConfig(data: InsertBackupConfig): Promise<BackupConfig>;
  getBackupConfigs(): Promise<BackupConfig[]>;
  updateBackupConfig(id: string, data: Partial<InsertBackupConfig>): Promise<BackupConfig>;
  deleteBackupConfig(id: string): Promise<void>;
  performBackup(configId: string): Promise<{ success: boolean; message: string; backupId?: string }>;
  getBackupHistory(limit?: number): Promise<Array<{
    id: string;
    configId: string;
    status: 'success' | 'failed';
    filename: string;
    size: number;
    createdAt: Date;
    error?: string;
  }>>;
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

  // Admin methods
  async getTotalAccountsCount(): Promise<number> {
    return this.accounts.size;
  }

  async getTotalEmailsCount(): Promise<number> {
    return this.emails.size;
  }

  async getTodayEmailsCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from(this.emails.values())
      .filter(email => email.createdAt >= today)
      .length;
  }

  async getTotalMessagesCount(): Promise<number> {
    return this.messages.size;
  }

  async getRecentMessages(limit: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentEmails(limit: number): Promise<EmailAddress[]> {
    return Array.from(this.emails.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getRecentAccounts(limit: number): Promise<TempAccount[]> {
    return Array.from(this.accounts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getAllTempAccounts(): Promise<TempAccount[]> {
    return Array.from(this.accounts.values());
  }

  async getAllEmailAddresses(): Promise<EmailAddress[]> {
    return Array.from(this.emails.values());
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values());
  }

  // Blog Management (Memory storage - will be replaced with DB)
  private blogPosts: Map<string, BlogPost> = new Map();
  private blogCategories: Map<string, BlogCategory> = new Map();
  private backupConfigs: Map<string, BackupConfig> = new Map();

  async createBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const blogPost: BlogPost = {
      id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || null,
      featuredImage: data.featuredImage || null,
      status: data.status || 'draft',
      author: data.author,
      tags: data.tags ? [...data.tags] : null,
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      publishedAt: data.publishedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async getBlogPosts(filters?: { status?: string; limit?: number; offset?: number }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());
    
    if (filters?.status) {
      posts = posts.filter(post => post.status === filters.status);
    }
    
    posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (filters?.offset) {
      posts = posts.slice(filters.offset);
    }
    
    if (filters?.limit) {
      posts = posts.slice(0, filters.limit);
    }
    
    return posts;
  }

  async getBlogPost(id: string): Promise<BlogPost | null> {
    return this.blogPosts.get(id) || null;
  }

  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const post = this.blogPosts.get(id);
    if (!post) {
      throw new Error('Blog post not found');
    }
    
    const updatedPost: BlogPost = { 
      ...post,
      title: data.title !== undefined ? data.title : post.title,
      slug: data.slug !== undefined ? data.slug : post.slug,
      content: data.content !== undefined ? data.content : post.content,
      excerpt: data.excerpt !== undefined ? data.excerpt : post.excerpt,
      featuredImage: data.featuredImage !== undefined ? data.featuredImage : post.featuredImage,
      status: data.status !== undefined ? data.status : post.status,
      author: data.author !== undefined ? data.author : post.author,
      tags: data.tags !== undefined ? (data.tags ? [...data.tags] : null) : post.tags,
      metaTitle: data.metaTitle !== undefined ? data.metaTitle : post.metaTitle,
      metaDescription: data.metaDescription !== undefined ? data.metaDescription : post.metaDescription,
      publishedAt: data.publishedAt !== undefined ? data.publishedAt : post.publishedAt,
      updatedAt: new Date() 
    };
    this.blogPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    this.blogPosts.delete(id);
  }

  async createBlogCategory(data: InsertBlogCategory): Promise<BlogCategory> {
    const id = randomUUID();
    const category: BlogCategory = {
      id,
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      createdAt: new Date(),
    };
    this.blogCategories.set(id, category);
    return category;
  }

  async getBlogCategories(): Promise<BlogCategory[]> {
    return Array.from(this.blogCategories.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async deleteBlogCategory(id: string): Promise<void> {
    this.blogCategories.delete(id);
  }

  async createBackupConfig(data: InsertBackupConfig): Promise<BackupConfig> {
    const id = randomUUID();
    const config: BackupConfig = {
      id,
      provider: data.provider,
      accessKey: data.accessKey || null,
      secretKey: data.secretKey || null,
      bucketName: data.bucketName || null,
      region: data.region || null,
      frequency: data.frequency || 'daily',
      retention: data.retention,
      isActive: data.isActive !== undefined ? data.isActive : true,
      lastBackup: null,
      createdAt: new Date(),
    };
    this.backupConfigs.set(id, config);
    return config;
  }

  async getBackupConfigs(): Promise<BackupConfig[]> {
    return Array.from(this.backupConfigs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateBackupConfig(id: string, data: Partial<InsertBackupConfig>): Promise<BackupConfig> {
    const config = this.backupConfigs.get(id);
    if (!config) {
      throw new Error('Backup config not found');
    }
    
    const updatedConfig = { ...config, ...data };
    this.backupConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteBackupConfig(id: string): Promise<void> {
    this.backupConfigs.delete(id);
  }

  async performBackup(configId: string): Promise<{ success: boolean; message: string; backupId?: string }> {
    // This is a mock implementation - will be replaced with real backup logic
    const config = this.backupConfigs.get(configId);
    if (!config) {
      return { success: false, message: 'Backup config not found' };
    }
    
    const backupId = randomUUID();
    
    // Update last backup time
    config.lastBackup = new Date();
    this.backupConfigs.set(configId, config);
    
    return { 
      success: true, 
      message: 'Backup completed successfully', 
      backupId 
    };
  }

  async getBackupHistory(limit = 10): Promise<Array<{
    id: string;
    configId: string;
    status: 'success' | 'failed';
    filename: string;
    size: number;
    createdAt: Date;
    error?: string;
  }>> {
    // Mock backup history - will be replaced with real data
    return [];
  }
}

export const storage = new MemStorage();
