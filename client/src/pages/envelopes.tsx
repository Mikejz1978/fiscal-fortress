import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Lock, Edit2, Trash2, Wallet } from "lucide-react";
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
import type { Envelope } from "@shared/schema";

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

const categories = [
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "transportation", label: "Transportation" },
  { value: "insurance", label: "Insurance" },
  { value: "groceries", label: "Groceries" },
  { value: "employee", label: "Employee Payment" },
  { value: "entertainment", label: "Entertainment" },
  { value: "savings", label: "Savings" },
  { value: "general", label: "General" },
];

const colors = [
  "#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", 
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
];

interface EnvelopeFormProps {
  envelope?: Envelope;
  onClose: () => void;
}

function EnvelopeForm({ envelope, onClose }: EnvelopeFormProps) {
  const { toast } = useToast();
  const [name, setName] = useState(envelope?.name || "");
  const [budgetAmount, setBudgetAmount] = useState(envelope?.budgetAmount || "");
  const [isStrict, setIsStrict] = useState(envelope?.isStrict || false);
  const [category, setCategory] = useState(envelope?.category || "general");
  const [color, setColor] = useState(envelope?.color || "#22c55e");

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Envelope>) => {
      return apiRequest("POST", "/api/envelopes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/envelopes"] });
      toast({ title: "Envelope created successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to create envelope", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Envelope>) => {
      return apiRequest("PATCH", `/api/envelopes/${envelope?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/envelopes"] });
      toast({ title: "Envelope updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update envelope", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, budgetAmount, isStrict, category, color };
    if (envelope) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Envelope Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Rent, Groceries, Car Payment"
          required
          data-testid="input-envelope-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget">Monthly Budget</Label>
        <Input
          id="budget"
          type="number"
          step="0.01"
          min="0"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          placeholder="0.00"
          required
          data-testid="input-envelope-budget"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger data-testid="select-envelope-category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`h-8 w-8 rounded-md border-2 ${color === c ? "border-foreground" : "border-transparent"}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              data-testid={`button-color-${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="strict">Strict Envelope</Label>
          <p className="text-sm text-muted-foreground">
            Non-negotiable expenses like rent, car payments, insurance
          </p>
        </div>
        <Switch
          id="strict"
          checked={isStrict}
          onCheckedChange={setIsStrict}
          data-testid="switch-envelope-strict"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} data-testid="button-save-envelope">
          {isPending ? "Saving..." : envelope ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EnvelopeCard({ envelope, onEdit }: { envelope: Envelope; onEdit: () => void }) {
  const { toast } = useToast();
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/envelopes/${envelope.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/envelopes"] });
      toast({ title: "Envelope deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete envelope", variant: "destructive" });
    },
  });

  const spent = parseFloat(envelope.budgetAmount) - parseFloat(envelope.currentBalance);
  const progress = (spent / parseFloat(envelope.budgetAmount)) * 100;
  const isOverBudget = progress > 100;

  return (
    <Card className="group relative" data-testid={`card-envelope-${envelope.id}`}>
      <div 
        className="absolute left-0 top-0 h-full w-1 rounded-l-md"
        style={{ backgroundColor: envelope.color }}
      />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{envelope.name}</CardTitle>
            {envelope.isStrict && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Strict
              </Badge>
            )}
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" onClick={onEdit} data-testid={`button-edit-envelope-${envelope.id}`}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              data-testid={`button-delete-envelope-${envelope.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className={`text-2xl font-bold ${isOverBudget ? "text-destructive" : ""}`}>
              {formatCurrency(envelope.currentBalance)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="font-medium">{formatCurrency(envelope.budgetAmount)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Progress 
            value={Math.min(100, progress)} 
            className={`h-2 ${isOverBudget ? "[&>div]:bg-destructive" : ""}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(spent)} spent</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        <Badge variant="outline" className="text-xs">
          {categories.find(c => c.value === envelope.category)?.label || envelope.category}
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function Envelopes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnvelope, setEditingEnvelope] = useState<Envelope | undefined>();

  const { data: envelopes = [], isLoading } = useQuery<Envelope[]>({
    queryKey: ["/api/envelopes"],
  });

  const strictEnvelopes = envelopes.filter(e => e.isStrict);
  const flexibleEnvelopes = envelopes.filter(e => !e.isStrict);

  const handleEdit = (envelope: Envelope) => {
    setEditingEnvelope(envelope);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingEnvelope(undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-envelopes-title">Budget Envelopes</h1>
          <p className="text-muted-foreground">
            Allocate your money into virtual envelopes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingEnvelope(undefined)} data-testid="button-add-envelope">
              <Plus className="mr-2 h-4 w-4" />
              Add Envelope
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEnvelope ? "Edit Envelope" : "Create Envelope"}</DialogTitle>
              <DialogDescription>
                {editingEnvelope 
                  ? "Update your envelope settings"
                  : "Create a new budget envelope to track spending"}
              </DialogDescription>
            </DialogHeader>
            <EnvelopeForm envelope={editingEnvelope} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      {strictEnvelopes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Strict Envelopes</h2>
            <Badge variant="secondary">{strictEnvelopes.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {strictEnvelopes.map((envelope) => (
              <EnvelopeCard 
                key={envelope.id} 
                envelope={envelope} 
                onEdit={() => handleEdit(envelope)}
              />
            ))}
          </div>
        </div>
      )}

      {flexibleEnvelopes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Flexible Envelopes</h2>
            <Badge variant="outline">{flexibleEnvelopes.length}</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flexibleEnvelopes.map((envelope) => (
              <EnvelopeCard 
                key={envelope.id} 
                envelope={envelope}
                onEdit={() => handleEdit(envelope)}
              />
            ))}
          </div>
        </div>
      )}

      {envelopes.length === 0 && (
        <Card className="p-12 text-center">
          <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Envelopes Yet</h3>
          <p className="mb-4 text-muted-foreground">
            Create your first budget envelope to start tracking your spending
          </p>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-create-first-envelope">
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Envelope
          </Button>
        </Card>
      )}
    </div>
  );
}
