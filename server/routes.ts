import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { 
  insertEnvelopeSchema, 
  insertDebtSchema, 
  insertTransactionSchema, 
  insertBillSchema,
  insertPayScheduleSchema,
  insertUserSettingsSchema
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

  app.get("/api/pay-schedules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schedules = await storage.getPaySchedulesByUser(userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching pay schedules:", error);
      res.status(500).json({ error: "Failed to fetch pay schedules" });
    }
  });

  app.post("/api/pay-schedules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertPayScheduleSchema.safeParse({ ...req.body, userId });
      if (!validation.success) {
        return res.status(400).json({ error: fromError(validation.error).toString() });
      }
      const schedule = await storage.createPaySchedule(validation.data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating pay schedule:", error);
      res.status(500).json({ error: "Failed to create pay schedule" });
    }
  });

  app.patch("/api/pay-schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updatePaySchedule(id, req.body);
      if (!schedule) {
        return res.status(404).json({ error: "Pay schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error updating pay schedule:", error);
      res.status(500).json({ error: "Failed to update pay schedule" });
    }
  });

  app.delete("/api/pay-schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaySchedule(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pay schedule:", error);
      res.status(500).json({ error: "Failed to delete pay schedule" });
    }
  });

  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let settings = await storage.getUserSettings(userId);
      if (!settings) {
        settings = await storage.upsertUserSettings({ userId, debtAttackMode: "avalanche", safeToSpendWarning: true });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.upsertUserSettings({ ...req.body, userId });
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  app.post("/api/safe-to-spend-check", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount } = req.body;
      
      const [accounts, envelopes, debts, bills, settings] = await Promise.all([
        storage.getAccountsByUser(userId),
        storage.getEnvelopesByUser(userId),
        storage.getDebtsByUser(userId),
        storage.getBillsByUser(userId),
        storage.getUserSettings(userId),
      ]);

      const spendingAccount = accounts.find(a => a.type === "spending");
      const billsAccount = accounts.find(a => a.type === "bills");
      const spendingBalance = parseFloat(spendingAccount?.balance || "0");
      const billsBalance = parseFloat(billsAccount?.balance || "0");
      
      const strictEnvelopes = envelopes.filter(e => e.isStrict);
      const strictTotal = strictEnvelopes.reduce((sum, e) => sum + parseFloat(e.budgetAmount), 0);
      
      const unpaidBills = bills.filter(b => !b.isPaid);
      const unpaidBillsTotal = unpaidBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);
      
      const debtPayments = debts.reduce((sum, d) => sum + parseFloat(d.minimumPayment), 0);
      
      const purchaseAmount = parseFloat(amount);
      const newBalance = spendingBalance - purchaseAmount;
      
      const warnings: string[] = [];
      let status: "yes" | "warning" | "no" = "yes";
      
      if (purchaseAmount > spendingBalance) {
        status = "no";
        warnings.push(`This purchase exceeds your Spending Account ($${spendingBalance.toFixed(2)} available)`);
      } else if (newBalance < 100 && settings?.safeToSpendWarning) {
        status = "warning";
        warnings.push(`You'll only have $${newBalance.toFixed(2)} left in Spending`);
      }
      
      const nonStrictEnvelopes = envelopes.filter(e => !e.isStrict);
      const affectedEnvelopes = nonStrictEnvelopes.filter(e => {
        const balance = parseFloat(e.currentBalance);
        return purchaseAmount > balance && balance > 0;
      });
      
      if (affectedEnvelopes.length > 0 && status !== "no") {
        status = "warning";
        warnings.push(`This may short ${affectedEnvelopes.map(e => e.name).join(", ")} envelope(s)`);
      }
      
      const billsAccountWouldBeShort = billsBalance < unpaidBillsTotal && purchaseAmount > newBalance;
      if (billsAccountWouldBeShort && purchaseAmount > spendingBalance * 0.5) {
        if (status === "yes") status = "warning";
        warnings.push("Bills account may need this money");
      }
      
      let recommendation: string;
      if (status === "yes") {
        recommendation = `Yes, you can afford this. You'll have $${newBalance.toFixed(2)} remaining.`;
      } else if (status === "warning") {
        recommendation = `Proceed with caution. ${warnings.length > 0 ? warnings[0] : "Consider your budget carefully."}`;
      } else {
        recommendation = `Not recommended. ${warnings.length > 0 ? warnings[0] : "Insufficient funds."}`;
      }
      
      res.json({
        canBuy: status !== "no",
        status,
        safeToSpend: spendingBalance,
        purchaseAmount,
        remainingAfter: newBalance,
        warnings,
        recommendation,
        strictObligations: strictTotal,
        upcomingBills: unpaidBillsTotal,
        debtPayments,
      });
    } catch (error) {
      console.error("Error checking safe to spend:", error);
      res.status(500).json({ error: "Failed to check safe to spend" });
    }
  });

  app.get("/api/payday-funding-plan", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [accounts, bills, debts, paySchedules, settings] = await Promise.all([
        storage.getAccountsByUser(userId),
        storage.getBillsByUser(userId),
        storage.getDebtsByUser(userId),
        storage.getPaySchedulesByUser(userId),
        storage.getUserSettings(userId),
      ]);

      const today = new Date();
      const currentDay = today.getDate();

      const unpaidBills = bills.filter(b => !b.isPaid);
      const billsTotal = unpaidBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

      const debtPaymentsTotal = debts.reduce((sum, d) => sum + parseFloat(d.minimumPayment), 0);

      const savingsTarget = 200;
      const taxReserve = 0;

      const totalObligations = billsTotal + debtPaymentsTotal + savingsTarget + taxReserve;

      const nextPayday = paySchedules.length > 0 
        ? new Date(paySchedules[0].nextPayday)
        : null;
      
      const expectedIncome = paySchedules.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      const safeToSpend = Math.max(0, expectedIncome - totalObligations);

      const fundingPlan = {
        billsFunding: billsTotal,
        debtFunding: debtPaymentsTotal,
        savingsFunding: savingsTarget,
        taxesFunding: taxReserve,
        safeToSpend,
        totalObligations,
        expectedIncome,
        nextPayday,
        bills: unpaidBills.map(b => ({
          id: b.id,
          name: b.name,
          amount: parseFloat(b.amount),
          dueDay: b.dueDay,
          mustHaveByDay: b.mustHaveByDay,
          fundingRule: b.fundingRule || "full_on_payday",
          isUrgent: b.dueDay <= currentDay + 3 || (b.mustHaveByDay && b.mustHaveByDay <= currentDay),
        })),
        debts: debts.map(d => ({
          id: d.id,
          name: d.name,
          minimumPayment: parseFloat(d.minimumPayment),
          dueDay: d.dueDay,
          isUrgent: d.dueDay <= currentDay + 3,
        })),
      };

      res.json(fundingPlan);
    } catch (error) {
      console.error("Error getting payday funding plan:", error);
      res.status(500).json({ error: "Failed to get funding plan" });
    }
  });

  app.get("/api/urgent-actions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [bills, debts] = await Promise.all([
        storage.getBillsByUser(userId),
        storage.getDebtsByUser(userId),
      ]);

      const today = new Date();
      const currentDay = today.getDate();
      const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      
      const urgentActions: Array<{
        type: "bill" | "debt";
        urgency: "today" | "urgent" | "warning";
        title: string;
        description: string;
        amount: number;
        daysUntil: number;
        id: number;
      }> = [];

      const calcDaysUntil = (dueDay: number) => {
        if (dueDay >= currentDay) {
          return dueDay - currentDay;
        }
        return daysInCurrentMonth - currentDay + dueDay;
      };

      bills.filter(b => !b.isPaid).forEach(bill => {
        const dueDay = bill.dueDay;
        const mustHaveByDay = bill.mustHaveByDay || dueDay;
        let daysUntil = calcDaysUntil(dueDay);
        let mustHaveDaysUntil = calcDaysUntil(mustHaveByDay);

        if (daysUntil === 0 || mustHaveDaysUntil === 0) {
          urgentActions.push({
            type: "bill",
            urgency: "today",
            title: `PAY ${bill.name.toUpperCase()} TODAY`,
            description: `Due today - must be paid immediately`,
            amount: parseFloat(bill.amount),
            daysUntil: 0,
            id: bill.id,
          });
        } else if (daysUntil <= 3 || mustHaveDaysUntil <= 2) {
          urgentActions.push({
            type: "bill",
            urgency: "urgent",
            title: `${bill.name} due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            description: mustHaveDaysUntil < daysUntil 
              ? `Must have funds by day ${mustHaveByDay}` 
              : `Due on the ${dueDay}${dueDay === 1 ? 'st' : dueDay === 2 ? 'nd' : dueDay === 3 ? 'rd' : 'th'}`,
            amount: parseFloat(bill.amount),
            daysUntil,
            id: bill.id,
          });
        } else if (daysUntil <= 7) {
          urgentActions.push({
            type: "bill",
            urgency: "warning",
            title: `${bill.name} coming up`,
            description: `Due in ${daysUntil} days`,
            amount: parseFloat(bill.amount),
            daysUntil,
            id: bill.id,
          });
        }
      });

      debts.forEach(debt => {
        const dueDay = debt.dueDay;
        let daysUntil = calcDaysUntil(dueDay);

        if (daysUntil === 0) {
          urgentActions.push({
            type: "debt",
            urgency: "today",
            title: `PAY ${debt.name.toUpperCase()} TODAY`,
            description: `Minimum payment due today`,
            amount: parseFloat(debt.minimumPayment),
            daysUntil: 0,
            id: debt.id,
          });
        } else if (daysUntil <= 3) {
          urgentActions.push({
            type: "debt",
            urgency: "urgent",
            title: `${debt.name} payment due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
            description: `Minimum payment: $${parseFloat(debt.minimumPayment).toFixed(2)}`,
            amount: parseFloat(debt.minimumPayment),
            daysUntil,
            id: debt.id,
          });
        }
      });

      urgentActions.sort((a, b) => {
        const urgencyOrder = { today: 0, urgent: 1, warning: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || a.daysUntil - b.daysUntil;
      });

      res.json(urgentActions);
    } catch (error) {
      console.error("Error getting urgent actions:", error);
      res.status(500).json({ error: "Failed to get urgent actions" });
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
