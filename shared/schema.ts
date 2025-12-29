import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

export const envelopes = pgTable("envelopes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  budgetAmount: decimal("budget_amount", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  isStrict: boolean("is_strict").notNull().default(false),
  category: text("category").notNull().default("general"),
  color: text("color").notNull().default("#22c55e"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const virtualAccounts = pgTable("virtual_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const debts = pgTable("debts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal("current_balance", { precision: 10, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  minimumPayment: decimal("minimum_payment", { precision: 10, scale: 2 }).notNull(),
  dueDay: integer("due_day").notNull(),
  biweeklyPayment: boolean("biweekly_payment").notNull().default(false),
  category: text("category").notNull().default("other"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  envelopeId: integer("envelope_id"),
  accountId: integer("account_id"),
  isWriteOff: boolean("is_write_off").notNull().default(false),
  writeOffCategory: text("write_off_category"),
  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDay: integer("due_day").notNull(),
  mustHaveByDay: integer("must_have_by_day"),
  isAutoPay: boolean("is_auto_pay").notNull().default(false),
  autoFundFromPaycheck: boolean("auto_fund_from_paycheck").notNull().default(true),
  envelopeId: integer("envelope_id"),
  isPaid: boolean("is_paid").notNull().default(false),
  paidDate: timestamp("paid_date"),
  category: text("category").notNull().default("utilities"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employeePayments = pgTable("employee_payments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  employeeName: text("employee_name").notNull(),
  basePayment: decimal("base_payment", { precision: 10, scale: 2 }).notNull(),
  perTaskPayment: decimal("per_task_payment", { precision: 10, scale: 2 }).notNull().default("0"),
  taskDescription: text("task_description"),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  lastPaidDate: timestamp("last_paid_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  source: text("source").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default("monthly"),
  isTaxed: boolean("is_taxed").notNull().default(false),
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }),
  lastReceivedDate: timestamp("last_received_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paySchedules = pgTable("pay_schedules", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: text("frequency").notNull(),
  nextPayday: timestamp("next_payday").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  debtAttackMode: text("debt_attack_mode").notNull().default("avalanche"),
  safeToSpendWarning: boolean("safe_to_spend_warning").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnvelopeSchema = createInsertSchema(envelopes).omit({
  id: true,
  createdAt: true,
});

export const insertVirtualAccountSchema = createInsertSchema(virtualAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertDebtSchema = createInsertSchema(debts).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeePaymentSchema = createInsertSchema(employeePayments).omit({
  id: true,
  createdAt: true,
});

export const insertIncomeSchema = createInsertSchema(incomes).omit({
  id: true,
  createdAt: true,
});

export const insertPayScheduleSchema = createInsertSchema(paySchedules).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
});

export type Envelope = typeof envelopes.$inferSelect;
export type InsertEnvelope = z.infer<typeof insertEnvelopeSchema>;
export type VirtualAccount = typeof virtualAccounts.$inferSelect;
export type InsertVirtualAccount = z.infer<typeof insertVirtualAccountSchema>;
export type Debt = typeof debts.$inferSelect;
export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type EmployeePayment = typeof employeePayments.$inferSelect;
export type InsertEmployeePayment = z.infer<typeof insertEmployeePaymentSchema>;
export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type PaySchedule = typeof paySchedules.$inferSelect;
export type InsertPaySchedule = z.infer<typeof insertPayScheduleSchema>;
export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
