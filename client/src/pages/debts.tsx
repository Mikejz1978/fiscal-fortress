import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, TrendingDown, Edit2, Trash2, Calendar, Percent, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Debt } from "@shared/schema";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

const debtCategories = [
  { value: "credit_card", label: "Credit Card" },
  { value: "car_loan", label: "Car Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "student_loan", label: "Student Loan" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "medical", label: "Medical Debt" },
  { value: "tax", label: "Tax Debt" },
  { value: "camper", label: "Camper/RV Loan" },
  { value: "other", label: "Other" },
];

interface DebtFormProps {
  debt?: Debt;
  onClose: () => void;
}

function DebtForm({ debt, onClose }: DebtFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(debt?.name || "");
  const [totalAmount, setTotalAmount] = useState(debt?.totalAmount || "");
  const [currentBalance, setCurrentBalance] = useState(debt?.currentBalance || "");
  const [interestRate, setInterestRate] = useState(debt?.interestRate || "0");
  const [minimumPayment, setMinimumPayment] = useState(debt?.minimumPayment || "");
  const [dueDay, setDueDay] = useState(debt?.dueDay?.toString() || "1");
  const [biweeklyPayment, setBiweeklyPayment] = useState(debt?.biweeklyPayment || false);
  const [category, setCategory] = useState(debt?.category || "other");

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Debt>) => {
      return apiRequest("POST", "/api/debts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      toast({ title: "Debt added successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to add debt", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Debt>) => {
      return apiRequest("PATCH", `/api/debts/${debt?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      toast({ title: "Debt updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update debt", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      totalAmount,
      currentBalance,
      interestRate,
      minimumPayment,
      dueDay: parseInt(dueDay),
      biweeklyPayment,
      category,
    };
    if (debt) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Debt Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Chase Credit Card, Car Loan"
          required
          data-testid="input-debt-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="total">Original Amount</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.00"
            required
            data-testid="input-debt-total"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="current">Current Balance</Label>
          <Input
            id="current"
            type="number"
            step="0.01"
            min="0"
            value={currentBalance}
            onChange={(e) => setCurrentBalance(e.target.value)}
            placeholder="0.00"
            required
            data-testid="input-debt-current"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="interest">Interest Rate (%)</Label>
          <Input
            id="interest"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="0.00"
            data-testid="input-debt-interest"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment">Minimum Payment</Label>
          <Input
            id="payment"
            type="number"
            step="0.01"
            min="0"
            value={minimumPayment}
            onChange={(e) => setMinimumPayment(e.target.value)}
            placeholder="0.00"
            required
            data-testid="input-debt-payment"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDay">Due Day of Month</Label>
          <Input
            id="dueDay"
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            required
            data-testid="input-debt-dueday"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-debt-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {debtCategories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="biweekly">Bi-Weekly Payments</Label>
          <p className="text-sm text-muted-foreground">
            Pay every 2 weeks instead of monthly (pays off faster!)
          </p>
        </div>
        <Switch
          id="biweekly"
          checked={biweeklyPayment}
          onCheckedChange={setBiweeklyPayment}
          data-testid="switch-debt-biweekly"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-save-debt">
          {isPending ? "Saving..." : debt ? "Update" : "Add Debt"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function DebtCard({ debt, onEdit }: { debt: Debt; onEdit: () => void }) {
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/debts/${debt.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/debts"] });
      toast({ title: "Debt removed" });
    },
    onError: () => {
      toast({ title: "Failed to remove debt", variant: "destructive" });
    },
  });

  const paidOff = parseFloat(debt.totalAmount) - parseFloat(debt.currentBalance);
  const progress = (paidOff / parseFloat(debt.totalAmount)) * 100;

  const estimatePayoffMonths = () => {
    const balance = parseFloat(debt.currentBalance);
    const payment = parseFloat(debt.minimumPayment);
    if (payment <= 0) return "N/A";
    
    const rate = parseFloat(debt.interestRate) / 100 / 12;
    if (rate === 0) {
      return Math.ceil(balance / payment);
    }
    
    const months = Math.log(payment / (payment - balance * rate)) / Math.log(1 + rate);
    return Math.ceil(months);
  };

  return (
    <Card className="group" data-testid={`card-debt-${debt.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{debt.name}</CardTitle>
            <Badge variant="outline" className="mt-1">
              {debtCategories.find(c => c.value === debt.category)?.label || debt.category}
            </Badge>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`button-edit-debt-${debt.id}`}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-debt-${debt.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Remaining Balance</p>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(debt.currentBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Original</p>
            <p className="font-medium">{formatCurrency(debt.totalAmount)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(paidOff)} paid</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Percent className="h-3 w-3" />
              <span>Rate</span>
            </div>
            <p className="font-semibold">{debt.interestRate}%</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due</span>
            </div>
            <p className="font-semibold">{debt.dueDay}th</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Months</span>
            </div>
            <p className="font-semibold">{estimatePayoffMonths()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {debt.biweeklyPayment ? "Bi-weekly" : "Monthly"} payment:
          </span>
          <span className="font-semibold">{formatCurrency(debt.minimumPayment)}</span>
        </div>

        {debt.biweeklyPayment && (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Bi-weekly payments enabled
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

export default function Debts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | undefined>();

  const { data: debts = [], isLoading } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.currentBalance), 0);
  const totalOriginal = debts.reduce((sum, d) => sum + parseFloat(d.totalAmount), 0);
  const totalPaid = totalOriginal - totalDebt;
  const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingDebt(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-debts-title">Debt Tracker</h1>
          <p className="text-muted-foreground">
            Track and eliminate your debts
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDebt(undefined)} data-testid="button-add-debt">
              <Plus className="mr-2 h-4 w-4" />
              Add Debt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDebt ? "Edit Debt" : "Add Debt"}</DialogTitle>
              <DialogDescription>
                {editingDebt 
                  ? "Update your debt details"
                  : "Add a debt to track your payoff progress"}
              </DialogDescription>
            </DialogHeader>
            <DebtForm debt={editingDebt} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {debts.length > 0 && (
        <Card className="border-2 border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Debt Remaining</p>
                <p className="text-4xl font-bold text-destructive" data-testid="text-total-debt-remaining">
                  {formatCurrency(totalDebt)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatCurrency(totalPaid)} paid off so far
                </p>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={overallProgress} className="h-3" />
                <p className="text-center text-sm font-medium">
                  {Math.round(overallProgress)}% debt-free
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {debts.map((debt) => (
          <DebtCard 
            key={debt.id} 
            debt={debt}
            onEdit={() => handleEdit(debt)}
          />
        ))}
      </div>

      {debts.length === 0 && (
        <Card className="p-12 text-center">
          <TrendingDown className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Debts Tracked</h3>
          <p className="mb-4 text-muted-foreground">
            Add your debts to track your payoff progress and stay motivated
          </p>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-add-first-debt">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Debt
          </Button>
        </Card>
      )}
    </div>
  );
}
