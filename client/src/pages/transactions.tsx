import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Plus, 
  Receipt, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  Filter,
  Edit2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction, Envelope, VirtualAccount } from "@shared/schema";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(num));
}

function formatDate(date: string | Date | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const writeOffCategories = [
  { value: "office", label: "Office Supplies" },
  { value: "travel", label: "Business Travel" },
  { value: "meals", label: "Business Meals" },
  { value: "equipment", label: "Equipment" },
  { value: "software", label: "Software/Subscriptions" },
  { value: "professional", label: "Professional Services" },
  { value: "marketing", label: "Marketing/Advertising" },
  { value: "utilities", label: "Business Utilities" },
  { value: "other", label: "Other Business Expense" },
];

interface TransactionFormProps {
  transaction?: Transaction;
  envelopes: Envelope[];
  accounts: VirtualAccount[];
  onClose: () => void;
}

function TransactionForm({ transaction, envelopes, accounts, onClose }: TransactionFormProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState(transaction?.description || "");
  const [amount, setAmount] = useState(transaction?.amount || "");
  const [type, setType] = useState(transaction?.type || "expense");
  const [envelopeId, setEnvelopeId] = useState(transaction?.envelopeId?.toString() || "");
  const [accountId, setAccountId] = useState(transaction?.accountId?.toString() || "");
  const [isWriteOff, setIsWriteOff] = useState(transaction?.isWriteOff || false);
  const [writeOffCategory, setWriteOffCategory] = useState(transaction?.writeOffCategory || "");

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      return apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/envelopes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({ title: "Transaction added" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to add transaction", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Transaction>) => {
      return apiRequest("PATCH", `/api/transactions/${transaction?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Transaction updated" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update transaction", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      description,
      amount,
      type,
      envelopeId: envelopeId ? parseInt(envelopeId) : null,
      accountId: accountId ? parseInt(accountId) : null,
      isWriteOff,
      writeOffCategory: isWriteOff ? writeOffCategory : null,
    };
    if (transaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Grocery shopping, Gas station"
          required
          data-testid="input-transaction-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            data-testid="input-transaction-amount"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="select-transaction-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="envelope">Envelope (optional)</Label>
          <Select value={envelopeId} onValueChange={setEnvelopeId}>
            <SelectTrigger data-testid="select-transaction-envelope">
              <SelectValue placeholder="Select envelope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {envelopes.map((env) => (
                <SelectItem key={env.id} value={env.id.toString()}>
                  {env.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="account">Account (optional)</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger data-testid="select-transaction-account">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id.toString()}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="writeoff">Tax Write-Off</Label>
          <p className="text-sm text-muted-foreground">
            Mark this as a business expense for tax purposes
          </p>
        </div>
        <Switch
          id="writeoff"
          checked={isWriteOff}
          onCheckedChange={setIsWriteOff}
          data-testid="switch-transaction-writeoff"
        />
      </div>

      {isWriteOff && (
        <div className="space-y-2">
          <Label htmlFor="writeoffCategory">Write-Off Category</Label>
          <Select value={writeOffCategory} onValueChange={setWriteOffCategory}>
            <SelectTrigger data-testid="select-writeoff-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {writeOffCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-save-transaction">
          {isPending ? "Saving..." : transaction ? "Update" : "Add Transaction"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Transactions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterWriteOff, setFilterWriteOff] = useState<boolean | null>(null);
  const { toast } = useToast();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: envelopes = [] } = useQuery<Envelope[]>({
    queryKey: ["/api/envelopes"],
  });

  const { data: accounts = [] } = useQuery<VirtualAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Transaction deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete transaction", variant: "destructive" });
    },
  });

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingTransaction(undefined);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterWriteOff !== null && t.isWriteOff !== filterWriteOff) return false;
    return true;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalWriteOffs = transactions
    .filter((t) => t.isWriteOff)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  if (transactionsLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-transactions-title">Transactions</h1>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTransaction(undefined)} data-testid="button-add-transaction">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              <DialogDescription>
                {editingTransaction
                  ? "Update transaction details"
                  : "Record a new income or expense"}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              transaction={editingTransaction}
              envelopes={envelopes}
              accounts={accounts}
              onClose={handleClose}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card data-testid="card-total-income">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-expenses">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-writeoffs">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Write-Offs</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalWriteOffs)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32" data-testid="select-filter-type">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={filterWriteOff === true ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterWriteOff(filterWriteOff === true ? null : true)}
              data-testid="button-filter-writeoffs"
            >
              <FileText className="mr-2 h-4 w-4" />
              Write-Offs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const envelope = envelopes.find((e) => e.id === transaction.envelopeId);
                  return (
                    <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                      <TableCell className="text-muted-foreground">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.description}
                          {transaction.isWriteOff && (
                            <Badge variant="secondary" className="gap-1">
                              <FileText className="h-3 w-3" />
                              Write-Off
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === "income" ? "default" : "outline"}
                        >
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {envelope?.name || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : transaction.type === "expense"
                            ? "text-red-600 dark:text-red-400"
                            : ""
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(transaction)}
                            data-testid={`button-edit-transaction-${transaction.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(transaction.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-transaction-${transaction.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <Receipt className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Transactions</h3>
              <p className="text-muted-foreground">
                {filterType !== "all" || filterWriteOff !== null
                  ? "No transactions match your filters"
                  : "Add your first transaction to start tracking"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
