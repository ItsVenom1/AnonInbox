import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTempAccountSchema, insertEmailAddressSchema, insertMessageSchema, type MailTmDomain, type MailTmAccount, type MailTmToken, type MailTmMessage } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
