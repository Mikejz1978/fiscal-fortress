import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, DollarSign, Plus, Trash2, TrendingDown, Zap, Clock } from "lucide-react";
import { useState } from "react";
import type { UserSettings, PaySchedule } from "@shared/schema";
import { format } from "date-fns";

export default function Settings() {
  const { toast } = useToast();
  const [newScheduleName, setNewScheduleName] = useState("");
  const [newScheduleAmount, setNewScheduleAmount] = useState("");
  const [newScheduleFrequency, setNewScheduleFrequency] = useState("biweekly");
  const [newScheduleNextPayday, setNewScheduleNextPayday] = useState("");

  const { data: settings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: paySchedules = [], isLoading: schedulesLoading } = useQuery<PaySchedule[]>({
    queryKey: ["/api/pay-schedules"],
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      return apiRequest("PATCH", "/api/settings", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings updated" });
    },
  });

  const createPaySchedule = useMutation({
    mutationFn: async (schedule: { name: string; amount: string; frequency: string; nextPayday: string }) => {
      return apiRequest("POST", "/api/pay-schedules", schedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pay-schedules"] });
      setNewScheduleName("");
      setNewScheduleAmount("");
      setNewScheduleNextPayday("");
      toast({ title: "Pay schedule added" });
    },
  });

  const deletePaySchedule = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/pay-schedules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pay-schedules"] });
      toast({ title: "Pay schedule removed" });
    },
  });

  const getNextPaydayText = (schedule: PaySchedule) => {
    const next = new Date(schedule.nextPayday);
    const today = new Date();
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return "Overdue";
    if (daysUntil === 0) return "Today";
    if (daysUntil === 1) return "Tomorrow";
    return `In ${daysUntil} days`;
  };

  if (settingsLoading || schedulesLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">Configure your financial fortress</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Pay Schedules
          </CardTitle>
          <CardDescription>
            Track when your paychecks arrive so bills can be auto-funded
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paySchedules.length > 0 && (
            <div className="space-y-3">
              {paySchedules.map((schedule) => (
                <div 
                  key={schedule.id} 
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50"
                  data-testid={`pay-schedule-${schedule.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${parseFloat(schedule.amount).toLocaleString()} - {schedule.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{getNextPaydayText(schedule)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(schedule.nextPayday), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePaySchedule.mutate(schedule.id)}
                      data-testid={`button-delete-schedule-${schedule.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Add Pay Schedule</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Source (e.g., Main Job)"
                value={newScheduleName}
                onChange={(e) => setNewScheduleName(e.target.value)}
                data-testid="input-schedule-name"
              />
              <Input
                placeholder="Amount"
                type="number"
                value={newScheduleAmount}
                onChange={(e) => setNewScheduleAmount(e.target.value)}
                data-testid="input-schedule-amount"
              />
              <Select value={newScheduleFrequency} onValueChange={setNewScheduleFrequency}>
                <SelectTrigger data-testid="select-schedule-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="semimonthly">Semi-monthly (1st & 15th)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Next Payday"
                value={newScheduleNextPayday}
                onChange={(e) => setNewScheduleNextPayday(e.target.value)}
                data-testid="input-schedule-payday"
              />
            </div>
            <Button
              onClick={() => {
                if (newScheduleName && newScheduleAmount && newScheduleNextPayday) {
                  createPaySchedule.mutate({
                    name: newScheduleName,
                    amount: newScheduleAmount,
                    frequency: newScheduleFrequency,
                    nextPayday: new Date(newScheduleNextPayday).toISOString(),
                  });
                }
              }}
              disabled={!newScheduleName || !newScheduleAmount || !newScheduleNextPayday}
              className="w-full"
              data-testid="button-add-schedule"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pay Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Debt Attack Strategy
          </CardTitle>
          <CardDescription>
            Choose how to prioritize paying off your debts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={settings?.debtAttackMode || "avalanche"}
            onValueChange={(value) => updateSettings.mutate({ debtAttackMode: value })}
          >
            <div className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50" data-testid="radio-avalanche">
              <RadioGroupItem value="avalanche" id="avalanche" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="avalanche" className="cursor-pointer font-medium">
                  Avalanche Method
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pay highest interest rate first. Saves the most money over time.
                </p>
              </div>
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50" data-testid="radio-snowball">
              <RadioGroupItem value="snowball" id="snowball" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="snowball" className="cursor-pointer font-medium">
                  Snowball Method
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pay smallest balance first. Quick wins for motivation.
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-blue-500" />
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Safe-to-Spend Protection
          </CardTitle>
          <CardDescription>
            Get warnings before making purchases that could hurt your budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable purchase warnings</p>
              <p className="text-sm text-muted-foreground">
                Show alerts when purchases exceed your Safe-to-Spend amount
              </p>
            </div>
            <Switch
              checked={settings?.safeToSpendWarning ?? true}
              onCheckedChange={(checked) => updateSettings.mutate({ safeToSpendWarning: checked })}
              data-testid="switch-safe-to-spend"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
