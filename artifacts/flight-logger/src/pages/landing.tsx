import { Link } from "wouter";
import { Plane, BarChart2, Leaf, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">SkyLog</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" data-testid="link-signin">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" data-testid="link-signup">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Plane className="w-3.5 h-3.5" />
          Your personal flight logbook
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-3xl">
          Every flight you've taken,{" "}
          <span className="text-primary">beautifully logged.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mb-10">
          SkyLog is a personal aviation logbook for enthusiasts. Track your flights,
          visualize your carbon footprint, and explore your aviation history — all in one place.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2" data-testid="button-get-started">
              Start logging
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" data-testid="button-sign-in">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything an aviation enthusiast needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="Flight Logbook"
              description="Log every flight with airline, aircraft, route, seat class, and personal notes."
            />
            <FeatureCard
              icon={BarChart2}
              title="Deep Statistics"
              description="Yearly breakdowns, top destinations, most-flown airlines, and distance analytics."
            />
            <FeatureCard
              icon={Leaf}
              title="Carbon Tracking"
              description="Understand your aviation carbon footprint with per-flight and cumulative emissions."
            />
            <FeatureCard
              icon={Plane}
              title="Personal Dashboard"
              description="A cockpit view of your aviation life — total flights, distance flown, and more."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-border text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start logging?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Create your free account and log your first flight in under a minute.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="gap-2" data-testid="button-cta-signup">
            Create your logbook
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>

      <footer className="px-6 py-6 border-t border-border text-center text-sm text-muted-foreground">
        SkyLog — Personal Aviation Flight Logger
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
