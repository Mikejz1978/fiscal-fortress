import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { 
  insertEnvelopeSchema, 
  insertDebtSchema, 
  insertTransactionSchema, 
  insertBillSchema 
} from "@shared/schema";
import OpenAI from "openai";
import { fromError } from "zod-validation-error";

function getOpenAIClient() {
  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY || !process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  app.get("/api/envelopes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.seedUserData(userId);
      const envelopes = await storage.getEnvelopesByUser(userId);
      res.json(envelopes);
    } catch (error) {
      console.error("Error fetching envelopes:", error);
      res.status(500).json({ error: "Failed to fetch envelopes" });
    }
  });

  app.post("/api/envelopes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertEnvelopeSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: fromError(validation.error).toString() });
      }
      const envelope = await storage.createEnvelope(validation.data);
      res.status(201).json(envelope);
    } catch (error) {
      console.error("Error creating envelope:", error);
      res.status(500).json({ error: "Failed to create envelope" });
    }
  });

  app.patch("/api/envelopes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const envelope = await storage.updateEnvelope(id, req.body);
      if (!envelope) {
        return res.status(404).json({ error: "Envelope not found" });
      }
      res.json(envelope);
    } catch (error) {
      console.error("Error updating envelope:", error);
      res.status(500).json({ error: "Failed to update envelope" });
    }
  });

  app.delete("/api/envelopes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEnvelope(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting envelope:", error);
      res.status(500).json({ error: "Failed to delete envelope" });
    }
  });

  app.get("/api/accounts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.seedUserData(userId);
      const accounts = await storage.getAccountsByUser(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  app.patch("/api/accounts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updateAccount(id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error updating account:", error);
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  app.get("/api/debts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.seedUserData(userId);
      const debts = await storage.getDebtsByUser(userId);
      res.json(debts);
    } catch (error) {
      console.error("Error fetching debts:", error);
      res.status(500).json({ error: "Failed to fetch debts" });
    }
  });

  app.post("/api/debts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertDebtSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: fromError(validation.error).toString() });
      }
      const debt = await storage.createDebt(validation.data);
      res.status(201).json(debt);
    } catch (error) {
      console.error("Error creating debt:", error);
      res.status(500).json({ error: "Failed to create debt" });
    }
  });

  app.patch("/api/debts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const debt = await storage.updateDebt(id, req.body);
      if (!debt) {
        return res.status(404).json({ error: "Debt not found" });
      }
      res.json(debt);
    } catch (error) {
      console.error("Error updating debt:", error);
      res.status(500).json({ error: "Failed to update debt" });
    }
  });

  app.delete("/api/debts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDebt(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting debt:", error);
      res.status(500).json({ error: "Failed to delete debt" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertTransactionSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: fromError(validation.error).toString() });
      }
      const transaction = await storage.createTransaction(validation.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.updateTransaction(id, req.body);
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  app.get("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.seedUserData(userId);
      const bills = await storage.getBillsByUser(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ error: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBillSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: fromError(validation.error).toString() });
      }
      const bill = await storage.createBill(validation.data);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      res.status(500).json({ error: "Failed to create bill" });
    }
  });

  app.patch("/api/bills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.updateBill(id, req.body);
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json(bill);
    } catch (error) {
      console.error("Error updating bill:", error);
      res.status(500).json({ error: "Failed to update bill" });
    }
  });

  app.delete("/api/bills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBill(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bill:", error);
      res.status(500).json({ error: "Failed to delete bill" });
    }
  });

  app.post("/api/advisor", isAuthenticated, async (req: any, res) => {
    try {
      const { message, context } = req.body;
      const openai = getOpenAIClient();
      
      if (!openai) {
        return res.status(503).json({ 
          error: "AI advisor is not available. Please try again later." 
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: context },
          { role: "user", content: message },
        ],
        stream: true,
        max_completion_tokens: 1024,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error with advisor:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to get response" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to get advisor response" });
      }
    }
  });

  return httpServer;
}
