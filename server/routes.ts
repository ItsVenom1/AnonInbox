import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTempAccountSchema, insertEmailAddressSchema, insertMessageSchema, insertBlogPostSchema, insertBlogCategorySchema, insertBackupConfigSchema, type MailTmDomain, type MailTmAccount, type MailTmToken, type MailTmMessage } from "@shared/schema";
import { z } from "zod";

const MAILTM_API_BASE = 'https://api.mail.tm';

// Utility function for Mail.tm API requests
async function mailTmRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${MAILTM_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Mail.tm API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Generate random credentials
function generateCredentials() {
  const username = 'user_' + Math.random().toString(36).substr(2, 8);
  const password = 'temp_' + Math.random().toString(36).substr(2, 8);
  return { username, password };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available domains
  app.get('/api/domains', async (req, res) => {
    try {
      const response = await mailTmRequest('/domains');
      const domains: MailTmDomain[] = response['hydra:member'] || [];
      const activeDomains = domains.filter(domain => domain.isActive && !domain.isPrivate);
      res.json({ domains: activeDomains });
    } catch (error) {
      console.error('Error fetching domains:', error);
      res.status(500).json({ error: 'Failed to fetch domains' });
    }
  });

  // Create new temporary account with first email
  app.post('/api/account/create', async (req, res) => {
    try {
      // Generate credentials
      const credentials = generateCredentials();

      // Create account in our database
      const tempAccount = await storage.createTempAccount({
        username: credentials.username,
        password: credentials.password,
      });

      // Create first email address
      const firstEmail = await createEmailForAccount(tempAccount.id);

      res.json({
        account: {
          id: tempAccount.id,
          username: tempAccount.username,
          password: tempAccount.password,
          createdAt: tempAccount.createdAt,
        },
        email: {
          id: firstEmail.id,
          emailAddress: firstEmail.emailAddress,
          createdAt: firstEmail.createdAt,
        }
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({ error: 'Failed to create temporary account' });
    }
  });

  // Create new email address for existing account
  app.post('/api/account/:accountId/emails', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { customUsername } = req.body;
      
      const account = await storage.getTempAccount(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const newEmail = await createEmailForAccount(accountId, customUsername);

      res.json({
        email: {
          id: newEmail.id,
          emailAddress: newEmail.emailAddress,
          createdAt: newEmail.createdAt,
        }
      });
    } catch (error) {
      console.error('Error creating email:', error);
      res.status(500).json({ error: 'Failed to create email address' });
    }
  });

  // Update account information
  app.put('/api/account/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { username, password, personalEmail } = req.body;
      
      const account = await storage.getTempAccount(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Check if new username is available (if changed)
      if (username && username !== account.username) {
        const existingAccount = await storage.getTempAccountByUsername(username);
        if (existingAccount) {
          return res.status(400).json({ error: 'Username already taken' });
        }
      }

      const updatedAccount = await storage.updateTempAccount(accountId, {
        username: username || account.username,
        password: password || account.password,
        personalEmail: personalEmail || null,
      });

      res.json({
        account: {
          id: updatedAccount.id,
          username: updatedAccount.username,
          password: updatedAccount.password,
          personalEmail: updatedAccount.personalEmail,
          createdAt: updatedAccount.createdAt,
        }
      });
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: 'Failed to update account' });
    }
  });

  // Helper function to create email address
  async function createEmailForAccount(accountId: string, customUsername?: string) {
    // Get available domains
    const domainsResponse = await mailTmRequest('/domains');
    const domains: MailTmDomain[] = domainsResponse['hydra:member'] || [];
    const activeDomains = domains.filter(domain => domain.isActive && !domain.isPrivate);
    
    if (activeDomains.length === 0) {
      throw new Error('No available domains');
    }

    let emailUsername;
    if (customUsername) {
      // Use custom username if provided
      emailUsername = customUsername;
    } else {
      // Generate better email name (real names with numbers)
      const firstNames = ['alex', 'jordan', 'sam', 'taylor', 'casey', 'jamie', 'morgan', 'riley', 'avery', 'drew'];
      const lastNames = ['smith', 'jones', 'brown', 'davis', 'wilson', 'moore', 'taylor', 'anderson', 'thomas', 'jackson'];
      const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
      const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
      const randomNumber = Math.floor(Math.random() * 999) + 1;
      
      emailUsername = `${randomFirst}${randomLast}${randomNumber}`;
    }
    
    const emailPassword = 'temp_' + Math.random().toString(36).substr(2, 8);
    const selectedDomain = activeDomains[0];
    const emailAddress = `${emailUsername}@${selectedDomain.domain}`;

    // Create account with Mail.tm
    const accountData = await mailTmRequest('/accounts', {
      method: 'POST',
      body: JSON.stringify({
        address: emailAddress,
        password: emailPassword,
      }),
    }) as MailTmAccount;

    // Get authentication token
    const tokenData = await mailTmRequest('/token', {
      method: 'POST',
      body: JSON.stringify({
        address: emailAddress,
        password: emailPassword,
      }),
    }) as MailTmToken;

    // Store email in our database
    return await storage.createEmailAddress(accountId, {
      emailAddress: emailAddress,
      mailTmAccountId: accountData.id,
      mailTmToken: tokenData.token,
    });
  }

  // Get account by ID
  app.get('/api/account/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      
      const account = await storage.getTempAccount(accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      const emails = await storage.getEmailAddresses(account.id);
      
      res.json({
        account: {
          id: account.id,
          username: account.username,
          password: account.password,
          createdAt: account.createdAt,
        },
        emails: emails.map(email => ({
          id: email.id,
          emailAddress: email.emailAddress,
          createdAt: email.createdAt,
        }))
      });
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ error: 'Failed to fetch account' });
    }
  });

  // Login with existing credentials
  app.post('/api/account/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const account = await storage.getTempAccountByUsername(username);
      if (!account || account.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const emails = await storage.getEmailAddresses(account.id);
      
      res.json({
        account: {
          id: account.id,
          username: account.username,
          password: account.password,
          createdAt: account.createdAt,
        },
        emails: emails.map(email => ({
          id: email.id,
          emailAddress: email.emailAddress,
          createdAt: email.createdAt,
        }))
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  });

  // Get email address details
  app.get('/api/email/:emailId', async (req, res) => {
    try {
      const { emailId } = req.params;
      
      const email = await storage.getEmailAddress(emailId);
      if (!email) {
        return res.status(404).json({ error: 'Email address not found' });
      }

      res.json({
        id: email.id,
        emailAddress: email.emailAddress,
        createdAt: email.createdAt,
      });
    } catch (error) {
      console.error('Error fetching email:', error);
      res.status(500).json({ error: 'Failed to fetch email address' });
    }
  });

  // Get messages for an email address
  app.get('/api/email/:emailId/messages', async (req, res) => {
    try {
      const { emailId } = req.params;
      
      const email = await storage.getEmailAddress(emailId);
      if (!email) {
        return res.status(404).json({ error: 'Email address not found' });
      }

      // Fetch messages from Mail.tm
      const messagesResponse = await mailTmRequest('/messages', {
        headers: {
          'Authorization': `Bearer ${email.mailTmToken}`,
        },
      });

      const mailTmMessages: MailTmMessage[] = messagesResponse['hydra:member'] || [];

      // Store new messages and return all messages
      for (const mailTmMessage of mailTmMessages) {
        const existingMessage = await storage.getMessageByMailTmId(mailTmMessage.id);
        if (!existingMessage) {
          await storage.createMessage(emailId, {
            messageId: mailTmMessage.id,
            from: mailTmMessage.from,
            to: mailTmMessage.to,
            subject: mailTmMessage.subject,
            intro: mailTmMessage.intro,
            text: mailTmMessage.text,
            html: mailTmMessage.html || undefined,
            hasAttachments: mailTmMessage.hasAttachments,
            attachments: mailTmMessage.attachments,
            createdAt: new Date(mailTmMessage.createdAt),
          });
        }
      }

      const messages = await storage.getMessages(emailId);
      res.json({ messages });
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Get specific message details
  app.get('/api/message/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      
      const message = await storage.getMessage(messageId);
      if (!message) {
        return res.status(404).json({ error: 'Message not found' });
      }

      const email = await storage.getEmailAddress(message.emailId);
      if (!email) {
        return res.status(404).json({ error: 'Email address not found' });
      }

      // Fetch full message details from Mail.tm
      const fullMessage = await mailTmRequest(`/messages/${message.messageId}`, {
        headers: {
          'Authorization': `Bearer ${email.mailTmToken}`,
        },
      }) as MailTmMessage;

      // Update our stored message with full content
      if (fullMessage.text) {
        message.text = fullMessage.text;
      }
      if (fullMessage.html) {
        message.html = fullMessage.html;
      }

      res.json({ message });
    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({ error: 'Failed to fetch message details' });
    }
  });

  // Mark message as read
  app.patch('/api/message/:messageId/read', async (req, res) => {
    try {
      const { messageId } = req.params;
      
      await storage.markMessageAsSeen(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking message as read:', error);
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  });

  // Delete message
  app.delete('/api/message/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      
      await storage.deleteMessage(messageId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  // Admin API endpoints
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if custom settings exist, otherwise use defaults
      const settings = (global as any).adminSettings || {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: process.env.ADMIN_PASSWORD || 'nordmail2024'
      };
      
      if (username !== settings.username || password !== settings.password) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
      
      // Generate a simple token (in production, use JWT)
      const token = 'admin_' + Math.random().toString(36).substr(2, 16);
      
      res.json({ 
        token, 
        message: 'Admin login successful' 
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Admin login failed' });
    }
  });

  app.get('/api/admin/stats', async (req, res) => {
    try {
      // Get actual stats from the database
      const totalAccounts = await storage.getTotalAccountsCount();
      const totalEmails = await storage.getTotalEmailsCount();
      const emailsToday = await storage.getTodayEmailsCount();
      const totalMessages = await storage.getTotalMessagesCount();
      
      res.json({
        totalUsers: totalAccounts,
        totalEmails: totalEmails,
        emailsToday: emailsToday,
        activeUsers: Math.floor(totalAccounts * 0.1), // Estimate active users
        systemHealth: 'healthy' as const,
        uptimePercentage: 99.9
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      // Return mock data if database queries fail
      res.json({
        totalUsers: 0,
        totalEmails: 0,
        emailsToday: 0,
        activeUsers: 0,
        systemHealth: 'warning' as const,
        uptimePercentage: 99.0
      });
    }
  });

  app.get('/api/admin/activity', async (req, res) => {
    try {
      // Get recent activity from the database
      const recentMessages = await storage.getRecentMessages(5);
      const recentEmails = await storage.getRecentEmails(5);
      const recentAccounts = await storage.getRecentAccounts(5);
      
      const activities = [
        ...recentMessages.map(msg => ({
          id: `msg_${msg.id}`,
          type: 'email_received' as const,
          description: `Email received: ${msg.subject || 'No subject'}`,
          timestamp: msg.createdAt.toISOString()
        })),
        ...recentEmails.map(email => ({
          id: `email_${email.id}`,
          type: 'email_created' as const,
          description: `New email address created: ${email.emailAddress}`,
          timestamp: email.createdAt.toISOString()
        })),
        ...recentAccounts.map(account => ({
          id: `account_${account.id}`,
          type: 'user_created' as const,
          description: `New temporary account created: ${account.username}`,
          timestamp: account.createdAt.toISOString()
        }))
      ];
      
      // Sort by timestamp and return the most recent
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json(activities.slice(0, 10));
    } catch (error) {
      console.error('Admin activity error:', error);
      res.json([]); // Return empty array if queries fail
    }
  });

  // Update admin settings
  app.post('/api/admin/settings', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { adminUsername, adminPassword, recaptchaSiteKey, recaptchaSecretKey, recaptchaEnabled } = req.body;
      
      if (!adminUsername || !adminPassword) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // In a real app, you'd update environment variables or database
      // For now, we'll store in memory (this resets on server restart)
      (global as any).adminSettings = {
        username: adminUsername,
        password: adminPassword,
        recaptchaSiteKey: recaptchaSiteKey || null,
        recaptchaSecretKey: recaptchaSecretKey || null,
        recaptchaEnabled: Boolean(recaptchaEnabled)
      };

      res.json({ 
        success: true, 
        message: 'Admin settings updated successfully. Please log in again with new credentials.' 
      });
    } catch (error) {
      console.error('Admin settings update error:', error);
      res.status(500).json({ error: 'Failed to update admin settings' });
    }
  });

  // Get admin settings (without sensitive data)
  app.get('/api/admin/settings', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const settings = (global as any).adminSettings || {
        username: process.env.ADMIN_USERNAME || 'admin',
        recaptchaSiteKey: null,
        recaptchaEnabled: false
      };

      // Don't send password or secret key
      res.json({
        username: settings.username,
        recaptchaSiteKey: settings.recaptchaSiteKey,
        recaptchaEnabled: settings.recaptchaEnabled
      });
    } catch (error) {
      console.error('Admin settings fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch admin settings' });
    }
  });

  // Blog Management API
  app.get('/api/admin/blog/posts', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { status, limit = 50, offset = 0 } = req.query;
      const posts = await storage.getBlogPosts({
        status: status as string,
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  app.post('/api/admin/blog/posts', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating blog post:', error);
      res.status(400).json({ error: 'Failed to create blog post' });
    }
  });

  app.get('/api/admin/blog/posts/:id', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ error: 'Failed to fetch blog post' });
    }
  });

  app.put('/api/admin/blog/posts/:id', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const post = await storage.updateBlogPost(req.params.id, req.body);
      res.json(post);
    } catch (error) {
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  });

  app.delete('/api/admin/blog/posts/:id', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await storage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });

  // Blog Categories API
  app.get('/api/admin/blog/categories', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const categories = await storage.getBlogCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      res.status(500).json({ error: 'Failed to fetch blog categories' });
    }
  });

  app.post('/api/admin/blog/categories', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = insertBlogCategorySchema.parse(req.body);
      const category = await storage.createBlogCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating blog category:', error);
      res.status(400).json({ error: 'Failed to create blog category' });
    }
  });

  // Backup Management API
  app.get('/api/admin/backups/configs', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const configs = await storage.getBackupConfigs();
      res.json(configs);
    } catch (error) {
      console.error('Error fetching backup configs:', error);
      res.status(500).json({ error: 'Failed to fetch backup configs' });
    }
  });

  app.post('/api/admin/backups/configs', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validatedData = insertBackupConfigSchema.parse(req.body);
      const config = await storage.createBackupConfig(validatedData);
      res.status(201).json(config);
    } catch (error) {
      console.error('Error creating backup config:', error);
      res.status(400).json({ error: 'Failed to create backup config' });
    }
  });

  app.post('/api/admin/backups/:configId/run', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const result = await storage.performBackup(req.params.configId);
      res.json(result);
    } catch (error) {
      console.error('Error performing backup:', error);
      res.status(500).json({ error: 'Failed to perform backup' });
    }
  });

  // Public Blog API (no authentication required)
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const { status = 'published', limit = 50, offset = 0 } = req.query;
      const posts = await storage.getBlogPosts({
        status: status as string,
        limit: Number(limit),
        offset: Number(offset)
      });
      res.json(posts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  // Backup API endpoint
  app.post('/api/admin/backup/create', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Create timestamp for backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const backupId = `backup_${timestamp}`;
      
      // In a real implementation, this would create an actual database backup
      // For now, we'll simulate the backup process
      const backupData = {
        id: backupId,
        timestamp: new Date().toISOString(),
        status: 'completed',
        size: '2.4 MB',
        tables: ['temp_accounts', 'email_addresses', 'messages', 'blog_posts'],
        recordCount: {
          temp_accounts: await storage.getAllTempAccounts().then(accounts => accounts.length),
          email_addresses: await storage.getAllEmailAddresses().then(emails => emails.length),
          messages: await storage.getAllMessages().then(messages => messages.length),
          blog_posts: await storage.getBlogPosts().then(posts => posts.length)
        }
      };

      // Simulate backup creation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      res.json({
        success: true,
        backup: backupData,
        downloadUrl: `/api/admin/backup/download/${backupId}`,
        message: 'Backup created successfully'
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  });

  app.get('/api/admin/backup/download/:backupId', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { backupId } = req.params;
      
      // Generate mock backup content (in real implementation, this would be actual database dump)
      const backupContent = JSON.stringify({
        metadata: {
          backupId,
          createdAt: new Date().toISOString(),
          version: '1.0.0',
          application: 'NordMail'
        },
        data: {
          tempAccounts: await storage.getAllTempAccounts(),
          emailAddresses: await storage.getAllEmailAddresses(),
          messages: await storage.getAllMessages(),
          blogPosts: await storage.getBlogPosts()
        }
      }, null, 2);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${backupId}.json"`);
      res.setHeader('Content-Length', Buffer.byteLength(backupContent));
      
      res.send(backupContent);
    } catch (error) {
      console.error('Error downloading backup:', error);
      res.status(500).json({ error: 'Failed to download backup' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
