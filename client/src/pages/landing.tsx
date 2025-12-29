import { Shield, Target, Wallet, MessageCircle, TrendingDown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Lock,
    title: "Strict Envelope System",
    description: "Non-negotiable bills are protected. Your rent, mortgage, car payments, and insurance are always covered first.",
  },
  {
    icon: TrendingDown,
    title: "Debt Elimination",
    description: "Track every debt and watch your progress as you pay them off. Bi-weekly payment options to pay off loans faster.",
  },
  {
    icon: MessageCircle,
    title: "AI Financial Advisor",
    description: "Ask 'Can I buy this?' before any purchase. Get instant answers based on your actual budget situation.",
  },
  {
    icon: Wallet,
    title: "Virtual Accounts",
    description: "Separate your money into Bills, Spending, and Savings accounts. Know exactly what you can spend.",
  },
  {
    icon: Target,
    title: "Tax Write-Off Tracking",
    description: "Mark business expenses as write-offs. Make tax time easier with organized records.",
  },
  {
    icon: Shield,
    title: "Complete Control",
    description: "Every penny is accounted for. Auto-reminders ensure bills are never missed.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold" data-testid="text-logo">Fiscal Fortress</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">Log In</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="container relative mx-auto px-4 text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl" data-testid="text-hero-title">
              Take Complete Control<br />
              <span className="text-primary">of Your Money</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl" data-testid="text-hero-description">
              Stop wondering where your money goes. The Financial Security App enforces strict budgets, 
              eliminates debt, and tells you instantly if a purchase fits your budget.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">Get Started Free</a>
              </Button>
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-left">
                <div className="mb-2 text-3xl font-bold text-primary" data-testid="text-stat-1">$17,000+</div>
                <p className="text-sm text-muted-foreground">Average debt tracked per user</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-left">
                <div className="mb-2 text-3xl font-bold text-primary" data-testid="text-stat-2">100%</div>
                <p className="text-sm text-muted-foreground">Bills paid on time with reminders</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-left">
                <div className="mb-2 text-3xl font-bold text-primary" data-testid="text-stat-3">24/7</div>
                <p className="text-sm text-muted-foreground">AI advisor available anytime</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl" data-testid="text-features-title">
                Everything You Need to Get Control
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Built for people who are tired of being broke despite having income. 
                This app doesn't just track - it enforces.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="border" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold" data-testid="text-cta-title">Ready to Take Control?</h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Stop letting money stress control your life. Start using Fiscal Fortress today.
            </p>
            <Button size="lg" asChild data-testid="button-cta">
              <a href="/api/login">Start Now - It's Free</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer">&copy; {new Date().getFullYear()} Fiscal Fortress. Your money, your control.</p>
        </div>
      </footer>
    </div>
  );
}
