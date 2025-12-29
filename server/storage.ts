import { 
  envelopes, virtualAccounts, debts, transactions, bills, employeePayments, incomes,
  type Envelope, type InsertEnvelope,
  type VirtualAccount, type InsertVirtualAccount,
  type Debt, type InsertDebt,
  type Transaction, type InsertTransaction,
  type Bill, type InsertBill,
  type EmployeePayment, type InsertEmployeePayment,
  type Income, type InsertIncome
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getEnvelopesByUser(userId: string): Promise<Envelope[]>;
  getEnvelope(id: number): Promise<Envelope | undefined>;
  createEnvelope(envelope: InsertEnvelope): Promise<Envelope>;
  updateEnvelope(id: number, envelope: Partial<InsertEnvelope>): Promise<Envelope | undefined>;
  deleteEnvelope(id: number): Promise<void>;

  getAccountsByUser(userId: string): Promise<VirtualAccount[]>;
  getAccount(id: number): Promise<VirtualAccount | undefined>;
  createAccount(account: InsertVirtualAccount): Promise<VirtualAccount>;
  updateAccount(id: number, account: Partial<InsertVirtualAccount>): Promise<VirtualAccount | undefined>;

  getDebtsByUser(userId: string): Promise<Debt[]>;
  getDebt(id: number): Promise<Debt | undefined>;
  createDebt(debt: InsertDebt): Promise<Debt>;
  updateDebt(id: number, debt: Partial<InsertDebt>): Promise<Debt | undefined>;
  deleteDebt(id: number): Promise<void>;

  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;

  getBillsByUser(userId: string): Promise<Bill[]>;
  getBill(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  deleteBill(id: number): Promise<void>;

  getEmployeePaymentsByUser(userId: string): Promise<EmployeePayment[]>;
  createEmployeePayment(payment: InsertEmployeePayment): Promise<EmployeePayment>;
  updateEmployeePayment(id: number, payment: Partial<InsertEmployeePayment>): Promise<EmployeePayment | undefined>;

  getIncomesByUser(userId: string): Promise<Income[]>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<void>;

  seedUserData(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getEnvelopesByUser(userId: string): Promise<Envelope[]> {
    return db.select().from(envelopes).where(eq(envelopes.userId, userId)).orderBy(desc(envelopes.createdAt));
  }

  async getEnvelope(id: number): Promise<Envelope | undefined> {
    const [envelope] = await db.select().from(envelopes).where(eq(envelopes.id, id));
    return envelope;
  }

  async createEnvelope(envelope: InsertEnvelope): Promise<Envelope> {
    const [created] = await db.insert(envelopes).values({
      ...envelope,
      currentBalance: envelope.budgetAmount,
    }).returning();
    return created;
  }

  async updateEnvelope(id: number, envelope: Partial<InsertEnvelope>): Promise<Envelope | undefined> {
    const [updated] = await db.update(envelopes).set(envelope).where(eq(envelopes.id, id)).returning();
    return updated;
  }

  async deleteEnvelope(id: number): Promise<void> {
    await db.delete(envelopes).where(eq(envelopes.id, id));
  }

  async getAccountsByUser(userId: string): Promise<VirtualAccount[]> {
    return db.select().from(virtualAccounts).where(eq(virtualAccounts.userId, userId));
  }

  async getAccount(id: number): Promise<VirtualAccount | undefined> {
    const [account] = await db.select().from(virtualAccounts).where(eq(virtualAccounts.id, id));
    return account;
  }

  async createAccount(account: InsertVirtualAccount): Promise<VirtualAccount> {
    const [created] = await db.insert(virtualAccounts).values(account).returning();
    return created;
  }

  async updateAccount(id: number, account: Partial<InsertVirtualAccount>): Promise<VirtualAccount | undefined> {
    const [updated] = await db.update(virtualAccounts).set(account).where(eq(virtualAccounts.id, id)).returning();
    return updated;
  }

  async getDebtsByUser(userId: string): Promise<Debt[]> {
    return db.select().from(debts).where(eq(debts.userId, userId)).orderBy(desc(debts.createdAt));
  }

  async getDebt(id: number): Promise<Debt | undefined> {
    const [debt] = await db.select().from(debts).where(eq(debts.id, id));
    return debt;
  }

  async createDebt(debt: InsertDebt): Promise<Debt> {
    const [created] = await db.insert(debts).values(debt).returning();
    return created;
  }

  async updateDebt(id: number, debt: Partial<InsertDebt>): Promise<Debt | undefined> {
    const [updated] = await db.update(debts).set(debt).where(eq(debts.id, id)).returning();
    return updated;
  }

  async deleteDebt(id: number): Promise<void> {
    await db.delete(debts).where(eq(debts.id, id));
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(transaction).returning();
    return created;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions).set(transaction).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async getBillsByUser(userId: string): Promise<Bill[]> {
    return db.select().from(bills).where(eq(bills.userId, userId)).orderBy(bills.dueDay);
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [created] = await db.insert(bills).values(bill).returning();
    return created;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const [updated] = await db.update(bills).set(bill).where(eq(bills.id, id)).returning();
    return updated;
  }

  async deleteBill(id: number): Promise<void> {
    await db.delete(bills).where(eq(bills.id, id));
  }

  async getEmployeePaymentsByUser(userId: string): Promise<EmployeePayment[]> {
    return db.select().from(employeePayments).where(eq(employeePayments.userId, userId));
  }

  async createEmployeePayment(payment: InsertEmployeePayment): Promise<EmployeePayment> {
    const [created] = await db.insert(employeePayments).values(payment).returning();
    return created;
  }

  async updateEmployeePayment(id: number, payment: Partial<InsertEmployeePayment>): Promise<EmployeePayment | undefined> {
    const [updated] = await db.update(employeePayments).set(payment).where(eq(employeePayments.id, id)).returning();
    return updated;
  }

  async getIncomesByUser(userId: string): Promise<Income[]> {
    return db.select().from(incomes).where(eq(incomes.userId, userId));
  }

  async createIncome(income: InsertIncome): Promise<Income> {
    const [created] = await db.insert(incomes).values(income).returning();
    return created;
  }

  async updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined> {
    const [updated] = await db.update(incomes).set(income).where(eq(incomes.id, id)).returning();
    return updated;
  }

  async deleteIncome(id: number): Promise<void> {
    await db.delete(incomes).where(eq(incomes.id, id));
  }

  async seedUserData(userId: string): Promise<void> {
    const existingAccounts = await this.getAccountsByUser(userId);
    if (existingAccounts.length > 0) return;

    await Promise.all([
      this.createAccount({ userId, name: "Bills Account", type: "bills", balance: "2500.00" }),
      this.createAccount({ userId, name: "Spending Account", type: "spending", balance: "850.00" }),
      this.createAccount({ userId, name: "Savings Account", type: "savings", balance: "1200.00" }),
    ]);

    await Promise.all([
      this.createEnvelope({ userId, name: "Rent/Mortgage", budgetAmount: "1500.00", isStrict: true, category: "housing", color: "#ef4444" }),
      this.createEnvelope({ userId, name: "Car Payment", budgetAmount: "450.00", isStrict: true, category: "transportation", color: "#f59e0b" }),
      this.createEnvelope({ userId, name: "Insurance", budgetAmount: "200.00", isStrict: true, category: "insurance", color: "#3b82f6" }),
      this.createEnvelope({ userId, name: "Utilities", budgetAmount: "250.00", isStrict: true, category: "utilities", color: "#8b5cf6" }),
      this.createEnvelope({ userId, name: "Brady (Employee)", budgetAmount: "300.00", isStrict: true, category: "employee", color: "#22c55e" }),
      this.createEnvelope({ userId, name: "Groceries", budgetAmount: "500.00", isStrict: false, category: "groceries", color: "#06b6d4" }),
      this.createEnvelope({ userId, name: "Entertainment", budgetAmount: "150.00", isStrict: false, category: "entertainment", color: "#ec4899" }),
    ]);

    await Promise.all([
      this.createDebt({ userId, name: "IRS Tax Debt", totalAmount: "17000.00", currentBalance: "17000.00", interestRate: "0", minimumPayment: "500.00", dueDay: 15, biweeklyPayment: false, category: "tax" }),
      this.createDebt({ userId, name: "Credit Card", totalAmount: "5000.00", currentBalance: "3200.00", interestRate: "19.99", minimumPayment: "100.00", dueDay: 20, biweeklyPayment: false, category: "credit_card" }),
      this.createDebt({ userId, name: "Car Loan", totalAmount: "25000.00", currentBalance: "18500.00", interestRate: "6.5", minimumPayment: "450.00", dueDay: 5, biweeklyPayment: true, category: "car_loan" }),
    ]);

    await Promise.all([
      this.createBill({ userId, name: "Rent", amount: "1500.00", dueDay: 1, isAutoPay: false, category: "housing" }),
      this.createBill({ userId, name: "Electric", amount: "120.00", dueDay: 15, isAutoPay: true, category: "utilities" }),
      this.createBill({ userId, name: "Internet", amount: "80.00", dueDay: 10, isAutoPay: true, category: "utilities" }),
      this.createBill({ userId, name: "Car Insurance", amount: "150.00", dueDay: 20, isAutoPay: true, category: "insurance" }),
    ]);
  }
}

export const storage = new DatabaseStorage();
