import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json } from "drizzle-orm/pg-core";
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
