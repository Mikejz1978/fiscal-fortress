import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  CreditCard,
  PiggyBank,
  Lock,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Envelope, VirtualAccount, Debt, Bill } from "@shared/schema";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function SafeToSpendCard({ accounts, envelopes }: { accounts: VirtualAccount[], envelopes: Envelope[] }) {
  const spendingAccount = accounts.find(a => a.type === "spending");
  const spendingBalance = spendingAccount ? parseFloat(spendingAccount.balance) : 0;
  
  const strictEnvelopeTotal = envelopes
    .filter(e => e.isStrict)
    .reduce((sum, e) => sum + parseFloat(e.budgetAmount), 0);
  
  const safeToSpend = Math.max(0, spendingBalance);

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Safe to Spend</p>
            <p className="text-4xl font-bold tracking-tight md:text-5xl" data-testid="text-safe-to-spend">
              {formatCurrency(safeToSpend)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              After {envelopes.filter(e => e.isStrict).length} strict envelopes are funded
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button asChild data-testid="button-ask-advisor">
              <Link href="/advisor">
                Ask Advisor About a Purchase
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AccountsOverview({ accounts }: { accounts: VirtualAccount[] }) {
  const accountIcons: Record<string, typeof Wallet> = {
    bills: CreditCard,
    spending: Wallet,
    savings: PiggyBank,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {accounts.map((account) => {
        const Icon = accountIcons[account.type] || Wallet;
        return (
          <Card key={account.id} data-testid={`card-account-${account.type}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{account.name}</p>
                  <p className="text-xl font-bold" data-testid={`text-account-balance-${account.type}`}>
                    {formatCurrency(account.balance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EnvelopesPreview({ envelopes }: { envelopes: Envelope[] }) {
  const topEnvelopes = envelopes.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Budget Envelopes</CardTitle>
        <Button variant="ghost" size="sm" asChild data-testid="link-view-all-envelopes">
          <Link href="/envelopes">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {topEnvelopes.map((envelope) => {
          const spent = parseFloat(envelope.budgetAmount) - parseFloat(envelope.currentBalance);
          const progress = (spent / parseFloat(envelope.budgetAmount)) * 100;
          
          return (
            <div key={envelope.id} className="space-y-2" data-testid={`envelope-preview-${envelope.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{envelope.name}</span>
                  {envelope.isStrict && (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Strict
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(envelope.currentBalance)} left
                </span>
              </div>
              <Progress value={Math.min(100, progress)} className="h-2" />
            </div>
          );
        })}
        {envelopes.length === 0 && (
          <p className="py-4 text-center text-muted-foreground">No envelopes set up yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function DebtsPreview({ debts }: { debts: Debt[] }) {
  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.currentBalance), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Debt Tracker</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </div>
        <Button variant="ghost" size="sm" asChild data-testid="link-view-all-debts">
          <Link href="/debts">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Total Debt</p>
          <p className="text-2xl font-bold text-destructive" data-testid="text-total-debt">
            {formatCurrency(totalDebt)}
          </p>
        </div>
        <div className="space-y-3">
          {debts.slice(0, 3).map((debt) => (
            <div key={debt.id} className="flex items-center justify-between" data-testid={`debt-preview-${debt.id}`}>
              <div>
                <p className="font-medium">{debt.name}</p>
                <p className="text-xs text-muted-foreground">
                  {debt.biweeklyPayment ? "Bi-weekly" : "Monthly"} payment: {formatCurrency(debt.minimumPayment)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(debt.currentBalance)}</p>
            </div>
          ))}
          {debts.length === 0 && (
            <p className="py-2 text-center text-muted-foreground">No debts tracked</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingBills({ bills }: { bills: Bill[] }) {
  const today = new Date().getDate();
  const upcoming = bills
    .filter(b => !b.isPaid)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Upcoming Bills</CardTitle>
        <Badge variant="outline">{upcoming.length} due</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.map((bill) => {
          const daysUntil = bill.dueDay >= today ? bill.dueDay - today : 30 - today + bill.dueDay;
          const isUrgent = daysUntil <= 3;
          
          return (
            <div key={bill.id} className="flex items-center justify-between" data-testid={`bill-preview-${bill.id}`}>
              <div className="flex items-center gap-2">
                {isUrgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Due on the {bill.dueDay}{bill.dueDay === 1 ? "st" : bill.dueDay === 2 ? "nd" : bill.dueDay === 3 ? "rd" : "th"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                <p className={`text-xs ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
                  {daysUntil === 0 ? "Due today!" : `${daysUntil} days`}
                </p>
              </div>
            </div>
          );
        })}
        {upcoming.length === 0 && (
          <p className="py-2 text-center text-muted-foreground">All bills paid!</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: accounts = [], isLoading: accountsLoading } = useQuery<VirtualAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: envelopes = [], isLoading: envelopesLoading } = useQuery<Envelope[]>({
    queryKey: ["/api/envelopes"],
  });

  const { data: debts = [], isLoading: debtsLoading } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const { data: bills = [], isLoading: billsLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  const isLoading = accountsLoading || envelopesLoading || debtsLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">Your financial command center</p>
      </div>

      <SafeToSpendCard accounts={accounts} envelopes={envelopes} />
      
      <AccountsOverview accounts={accounts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EnvelopesPreview envelopes={envelopes} />
        <DebtsPreview debts={debts} />
      </div>

      <UpcomingBills bills={bills} />
    </div>
  );
}
