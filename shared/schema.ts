import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tempAccounts = pgTable("temp_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  personalEmail: text("personal_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailAddresses = pgTable("email_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => tempAccounts.id).notNull(),
  emailAddress: text("email_address").notNull(),
  mailTmAccountId: text("mailtm_account_id").notNull(),
  mailTmToken: text("mailtm_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  emailId: varchar("email_id").references(() => emailAddresses.id).notNull(),
  messageId: text("message_id").notNull(),
  from: json("from_data").$type<{ name: string; address: string }>().notNull(),
  to: json("to_data").$type<Array<{ name: string; address: string }>>().notNull(),
  subject: text("subject").notNull(),
  intro: text("intro"),
  text: text("text_content"),
  html: text("html_content"),
  seen: boolean("seen").default(false).notNull(),
  hasAttachments: boolean("has_attachments").default(false).notNull(),
  attachments: json("attachments").$type<Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number;
    downloadUrl: string;
  }>>(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertTempAccountSchema = createInsertSchema(tempAccounts).pick({
  username: true,
  password: true,
});

export const insertEmailAddressSchema = createInsertSchema(emailAddresses).pick({
  emailAddress: true,
  mailTmAccountId: true,
  mailTmToken: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  messageId: true,
  from: true,
  to: true,
  subject: true,
  intro: true,
  text: true,
  html: true,
  hasAttachments: true,
  attachments: true,
  createdAt: true,
});

export type TempAccount = typeof tempAccounts.$inferSelect;
export type InsertTempAccount = z.infer<typeof insertTempAccountSchema>;
export type EmailAddress = typeof emailAddresses.$inferSelect;
export type InsertEmailAddress = z.infer<typeof insertEmailAddressSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// API Response types for Mail.tm
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

// Blog Management Tables
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featured_image"),
  status: text("status").notNull().default('draft'), // 'draft', 'published', 'archived'
  author: text("author").notNull(),
  tags: json("tags").$type<string[]>(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blogCategories = pgTable("blog_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPostCategories = pgTable("blog_post_categories", {
  postId: varchar("post_id").references(() => blogPosts.id, { onDelete: 'cascade' }),
  categoryId: varchar("category_id").references(() => blogCategories.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.postId, table.categoryId] }),
}));

// Blog Schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogCategorySchema = createInsertSchema(blogCategories).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogCategory = z.infer<typeof insertBlogCategorySchema>;
export type BlogCategory = typeof blogCategories.$inferSelect;

// Backup Configuration Table
export const backupConfigs = pgTable("backup_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(), // 's3', 'gcs', 'local'
  accessKey: text("access_key"),
  secretKey: text("secret_key"),
  bucketName: text("bucket_name"),
  region: text("region"),
  frequency: text("frequency").notNull().default('daily'), // 'hourly', 'daily', 'weekly'
  retention: json("retention").$type<{ days: number; weeks: number; months: number }>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastBackup: timestamp("last_backup"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBackupConfigSchema = createInsertSchema(backupConfigs).omit({
  id: true,
  lastBackup: true,
  createdAt: true,
});

export type InsertBackupConfig = z.infer<typeof insertBackupConfigSchema>;
export type BackupConfig = typeof backupConfigs.$inferSelect;
