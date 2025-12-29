import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { Envelope, VirtualAccount, Debt } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestedQuestions = [
  "Can I buy lunch for $15?",
  "What's my budget status?",
  "Can I afford a $200 purchase?",
  "How much debt do I have left?",
  "Is this expense tax deductible?",
];

export default function Advisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: envelopes = [] } = useQuery<Envelope[]>({
    queryKey: ["/api/envelopes"],
  });

  const { data: accounts = [] } = useQuery<VirtualAccount[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: debts = [] } = useQuery<Debt[]>({
    queryKey: ["/api/debts"],
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    const spendingAccount = accounts.find(a => a.type === "spending");
    const safeToSpend = spendingAccount ? parseFloat(spendingAccount.balance) : 0;
    const totalDebt = debts.reduce((sum, d) => sum + parseFloat(d.currentBalance), 0);
    const strictEnvelopes = envelopes.filter(e => e.isStrict);

    const context = `
You are a strict but supportive financial advisor for the Fiscal Fortress app. Your job is to help the user stay on budget and get out of debt.

CURRENT FINANCIAL STATUS:
- Safe to Spend: $${safeToSpend.toFixed(2)}
- Total Debt: $${totalDebt.toFixed(2)}
- Strict Envelopes: ${strictEnvelopes.length} (non-negotiable expenses)
- Budget Envelopes: ${envelopes.map(e => `${e.name}: $${parseFloat(e.currentBalance).toFixed(2)} remaining`).join(", ") || "None set up"}
- Virtual Accounts: ${accounts.map(a => `${a.name}: $${parseFloat(a.balance).toFixed(2)}`).join(", ") || "None set up"}
- Debts: ${debts.map(d => `${d.name}: $${parseFloat(d.currentBalance).toFixed(2)}`).join(", ") || "No debts tracked"}

RULES:
1. If asked "Can I buy X?", check if the amount fits within the Safe to Spend amount
2. Be honest but encouraging - help them make good decisions
3. If something isn't in the budget, suggest alternatives or ways to afford it
4. Always consider their debt situation when advising on spending
5. Suggest marking business expenses as tax write-offs when appropriate
6. Keep responses concise and actionable
7. Never shame them - be supportive but firm about budget limits
    `.trim();

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, context }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastMessage = updated[updated.length - 1];
                    if (lastMessage.role === "assistant") {
                      lastMessage.content += data.content;
                    }
                    return updated;
                  });
                }
              } catch {
              }
            }
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm sorry, I couldn't process your request. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-advisor-title">Financial Advisor</h1>
        <p className="text-muted-foreground">
          Ask me about your budget, spending decisions, or financial goals
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold" data-testid="text-advisor-welcome">
                  Your AI Financial Advisor
                </h3>
                <p className="mb-6 max-w-md text-muted-foreground">
                  I can help you make smart spending decisions based on your actual budget. 
                  Ask me anything about your finances!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(question)}
                      disabled={isStreaming}
                      data-testid={`button-suggested-${index}`}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                data-testid={`message-${message.role}-${message.id}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className={message.role === "assistant" ? "bg-primary text-primary-foreground" : ""}>
                    {message.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <CardContent className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a purchase or your budget..."
              className="min-h-[44px] max-h-32 resize-none"
              disabled={isStreaming}
              data-testid="input-advisor-message"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isStreaming}
              data-testid="button-send-message"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 3).map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover-elevate"
                onClick={() => !isStreaming && sendMessage(question)}
                data-testid={`badge-quick-question-${index}`}
              >
                {question}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
