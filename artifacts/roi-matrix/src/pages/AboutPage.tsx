import React from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, Target, CheckCircle2, TrendingUp } from "lucide-react";

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-4 py-4 md:px-8">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">About the Matrix</h1>
            <p className="text-xs text-muted-foreground">Methodology & Principles</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 md:p-10 space-y-12 pb-24">
        
        <section className="space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">What is the ROI Matrix?</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            The "Return on Integrity: Benefit-Cost Matrix" is a principled business decision tool. It evaluates proposed actions not just on financial return, but on ethical integrity, workforce well-being, and long-term viability.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike traditional models that view ethics as a pure cost center, this tool categorizes high-integrity actions as strategic investments, challenging leaders to implement them courageously yet pragmatically.
          </p>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Inspired by Daniels Principles</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            The evaluation criteria embed the eight Daniels Principles of business ethics into operational thinking:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Honesty", "Integrity", "Promise-Keeping", "Fidelity", "Fairness", "Caring for Others", "Respect for Others", "Responsible Citizenship"].map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-semibold text-foreground/90">{p}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Real-World Exemplars</h2>
          </div>
          <div className="space-y-4">
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">Costco Wholesale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Prioritizes industry-leading wages and benefits, viewing employees as an investment rather than an expense. Result: exceptional retention and customer loyalty.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">In-N-Out Burger</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Maintains a strict commitment to quality and private ownership, refusing to franchise or compromise their supply chain for rapid expansion.
              </p>
            </div>
            <div className="bg-card p-6 rounded-2xl border border-border">
              <h3 className="text-lg font-bold text-foreground mb-2">AriZona Tea</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Famous for price integrity—holding their $0.99 price point for decades by optimizing operations and drastically reducing marketing costs to absorb margin pressure.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Methodology Note</h2>
          </div>
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
            <p className="text-primary/90 leading-relaxed text-sm">
              The ratings in this application are <strong>user-entered</strong> based on your own research, internal financial models, and stakeholder input. The matrix does not automatically calculate ROI; rather, it provides a structured, visual framework to ensure ethical factors are weighed on equal footing with operational costs.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
