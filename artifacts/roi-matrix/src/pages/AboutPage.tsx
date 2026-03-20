import React, { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft, BookOpen, Target, CheckCircle2, TrendingUp,
  Scale, Sparkles, History, BarChart2, Printer, MessageSquare,
  Info, Pencil, Users, Download, SlidersHorizontal, ChevronDown, ChevronUp,
  Save, Share2
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUADRANTS = [
  {
    label: "REQUIRED",
    color: "text-required",
    bg: "bg-required/10",
    border: "border-required/30",
    dot: "bg-required shadow-[0_0_8px_rgba(76,175,80,0.5)]",
    title: "High Benefit · Low Cost",
    desc: "The ethical baseline. These actions demonstrate integrity and stakeholder trust without prohibitive costs. Failure to act here is itself an ethical breach.",
    action: "Implement without delay. The cost of inaction — in trust, culture, and long-term viability — far exceeds the investment.",
  },
  {
    label: "ENCOURAGED",
    color: "text-encouraged",
    bg: "bg-encouraged/10",
    border: "border-encouraged/30",
    dot: "bg-encouraged shadow-[0_0_8px_rgba(33,150,243,0.5)]",
    title: "High Benefit · High Cost",
    desc: "Strategic long-term investments. The benefits to stakeholders and organizational health are clear, but the costs demand courageous, careful implementation.",
    action: "Proceed with the Conditional Adoption Filter. Build safeguards, phased rollouts, and oversight before committing.",
  },
  {
    label: "DISCOURAGED",
    color: "text-discouraged",
    bg: "bg-discouraged/10",
    border: "border-discouraged/30",
    dot: "bg-discouraged shadow-[0_0_8px_rgba(255,152,0,0.5)]",
    title: "Low Benefit · Low Cost",
    desc: "Low-integrity, low-effort actions that signal poor stewardship. Cheap does not mean good. These can erode accountability and rule-of-law norms.",
    action: "Revise or reject. Identify which benefit dimensions are weak and explore redesigns that strengthen them.",
  },
  {
    label: "PROHIBITED",
    color: "text-prohibited",
    bg: "bg-prohibited/10",
    border: "border-prohibited/30",
    dot: "bg-prohibited shadow-[0_0_8px_rgba(244,67,54,0.5)]",
    title: "Low Benefit · High Cost",
    desc: "Actions that harm stakeholders while draining resources. These threaten long-term viability and violate foundational ethical norms.",
    action: "Do not proceed. Escalate for leadership review and explore alternative paths that restore stakeholder value.",
  },
];

const BENEFIT_CRITERIA = [
  { label: "Social Impact / Harm Reduction", desc: "Measures reduction in harm and improvement in wellbeing for employees, customers, and communities. High scores reflect tangible, measurable positive impact.", tip: "Ask: Who benefits? How broadly? How measurably?" },
  { label: "Stakeholder Trust", desc: "Evaluates whether the action strengthens trust across all stakeholder groups: employees, customers, investors, regulators, and the broader public.", tip: "Ask: Does this make all stakeholders more willing to work with us?" },
  { label: "Workforce Stability & Well-being", desc: "Rates improvements to employee retention, morale, psychological safety, physical safety, and long-term stability of the workforce.", tip: "Ask: Will employees feel safer, more valued, and more committed after this?" },
  { label: "Product / Service Quality", desc: "Assesses whether the action enhances quality, safety, consistency, and reliability of what is delivered to customers.", tip: "Ask: Will customers receive something demonstrably better or safer?" },
  { label: "Long-term Viability & Fairness", desc: "Examines whether the action strengthens the organization's long-term sustainability, competitive fairness, and resilience across market cycles.", tip: "Ask: Does this make the organization stronger in 5–10 years?" },
];

const COST_CRITERIA = [
  { label: "Margin Impact", desc: "Quantifies the reduction in profit margins, revenue, or financial returns. Consider both direct and indirect margin effects across the full P&L.", tip: "Ask: What is the realistic worst-case impact on net margin?" },
  { label: "Labor Time", desc: "Measures the additional labor hours, management bandwidth, HR capacity, and training resources required to implement and sustain the action.", tip: "Ask: How many people-hours, for how long, across which functions?" },
  { label: "Operational Complexity", desc: "Assesses added complexity to processes, systems, compliance obligations, supplier management, and organizational coordination.", tip: "Ask: Does this create new failure points or compliance risks?" },
  { label: "Supply Chain Risk", desc: "Evaluates risk introduced to supplier relationships, procurement pipelines, inventory, logistics, and upstream/downstream partners.", tip: "Ask: Could this disrupt delivery, sourcing, or partner relationships?" },
  { label: "Opportunity Cost", desc: "Captures what must be foregone — other investments, projects, or strategic initiatives that cannot be pursued if resources are committed here.", tip: "Ask: What is the most valuable thing we are giving up?" },
];

const FILTER_QUESTIONS = [
  { q: "Protects long-term success?", detail: "Does the action include safeguards — phased rollout, financial reserves, or ROI tracking — to protect organizational viability?" },
  { q: "Includes clear oversight?", detail: "Is there a monitoring plan, stakeholder reporting structure, and a defined course-correction process if results deviate?" },
  { q: "Supports the four key areas?", detail: "Does it strengthen at least 3 of: Community Investment, Healthy Workforce, Quality of Products/Services, Employee Culture & Retention — without severely harming the fourth?" },
  { q: "Fits free-market values?", detail: "Does it preserve voluntary exchange, informed consent, and competition on genuine value rather than coercion or artificial advantage?" },
  { q: "Can we test it first?", detail: "Is there a low-risk pilot program available, with clear success metrics and a defined exit plan if it underperforms?" },
];

const DANIELS = [
  { name: "Honesty", desc: "Truthful communication with all stakeholders, even when uncomfortable." },
  { name: "Integrity", desc: "Alignment between stated values and actual decisions — no gap between talk and action." },
  { name: "Promise-Keeping", desc: "Honoring commitments to employees, customers, investors, and communities." },
  { name: "Fidelity", desc: "Loyalty to those who have placed trust in the organization." },
  { name: "Fairness", desc: "Equitable treatment and distribution of burdens and benefits across all parties." },
  { name: "Caring for Others", desc: "Genuine concern for the wellbeing of employees, communities, and society." },
  { name: "Respect for Others", desc: "Treating all stakeholders as ends in themselves, not merely as means." },
  { name: "Responsible Citizenship", desc: "Operating within legal, ethical, and social norms; contributing positively to the commons." },
];

const EXEMPLARS = [
  {
    name: "Costco Wholesale",
    quadrant: "REQUIRED",
    color: "text-required",
    border: "border-required/30",
    bg: "bg-required/5",
    summary: "Prioritizes industry-leading wages and benefits, viewing employees as the primary driver of customer loyalty and retention. Costco's above-market wages correlate with turnover rates 5× lower than competitors — a case study in high-benefit, manageable-cost investment.",
    metrics: ["$25–26/hr avg wage (2024)", "~90% full-time retention rate", "#1 US employer NPS among warehouse retailers"],
  },
  {
    name: "In-N-Out Burger",
    quadrant: "REQUIRED",
    color: "text-required",
    border: "border-required/30",
    bg: "bg-required/5",
    summary: "Maintains strict commitment to quality and private ownership, refusing to franchise or compromise their supply chain for rapid expansion. They pay above-market and keep menus small — choosing integrity over scale.",
    metrics: ["100% private, family-owned", "Limited menu unchanged since 1948", "Starting pay $22+/hr in most markets"],
  },
  {
    name: "AriZona Tea",
    quadrant: "ENCOURAGED",
    color: "text-encouraged",
    border: "border-encouraged/30",
    bg: "bg-encouraged/5",
    summary: "Famous for price integrity — holding their $0.99 price point for over three decades by relentlessly optimizing operations and eliminating marketing waste to absorb margin pressure while keeping faith with customers.",
    metrics: ["$0.99 can price maintained since 1992", "Zero traditional advertising budget", "Top 3 US RTD tea brand by volume"],
  },
  {
    name: "Patagonia",
    quadrant: "ENCOURAGED",
    color: "text-encouraged",
    border: "border-encouraged/30",
    bg: "bg-encouraged/5",
    summary: "Runs 'Don't Buy This Jacket' campaigns and donates 1% of sales to environmental causes — high cost, but maximum stakeholder trust and brand loyalty. A textbook Encouraged decision that required courageous leadership.",
    metrics: ["1% for the Planet founding member", "100% of profits to climate fight (2022)", "Among highest employee retention in retail"],
  },
];

interface AccordionProps { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; }

function Accordion({ title, icon, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-5 sm:p-6 text-left hover:bg-input/30 transition-colors focus:outline-none"
      >
        <span className="text-primary shrink-0">{icon}</span>
        <h2 className="text-lg font-bold flex-1">{title}</h2>
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
      </button>
      {open && <div className="px-5 sm:px-6 pb-6 border-t border-border/50">{children}</div>}
    </div>
  );
}

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
            <p className="text-xs text-muted-foreground">Methodology, Features & Daniels Principles</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-8 pb-24 space-y-6">

        {/* Hero */}
        <div className="bg-card rounded-2xl border border-border p-7 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 border border-primary/20">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-3">What is the ROI Matrix?</h2>
          <p className="text-muted-foreground leading-relaxed text-base mb-3">
            The <strong className="text-foreground">Return on Integrity: Benefit-Cost Matrix</strong> is a principled business decision tool. It evaluates proposed actions not just on financial return, but on ethical integrity, workforce well-being, and long-term viability — embedding the Daniels Principles directly into operational thinking.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Unlike traditional models that treat ethics as a pure cost center, this tool categorizes high-integrity actions as strategic investments, placing them in a visual matrix that reveals the full consequence of both acting <em>and</em> not acting.
          </p>
        </div>

        {/* How to Use */}
        <Accordion title="How to Use This Tool" icon={<SlidersHorizontal className="w-5 h-5" />} defaultOpen>
          <div className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">Work through the right-hand panel top-to-bottom. Each section feeds into the next.</p>

            <div className="space-y-3">
              {[
                { step: "1", icon: <Info className="w-4 h-4" />, title: "Background Information", detail: "Paste any relevant context — company overview, industry benchmarks, stakeholder concerns, prior decisions, financial constraints. This context informs the AI Narrative Report and ensures your ratings are grounded in evidence." },
                { step: "2", icon: <Users className="w-4 h-4" />, title: "Stakeholders Consulted", detail: "Document who was involved in this evaluation: board members, employees, customers, external advisors. Accountability begins with transparency about who shaped the analysis." },
                { step: "3", icon: <Target className="w-4 h-4" />, title: "Proposed Action", detail: "Describe the specific business decision being evaluated. Be precise — vague inputs produce vague insights. Use the Example button to load a fully-populated Costco wage-increase case study." },
                { step: "4", icon: <Scale className="w-4 h-4" />, title: "Rate Benefit & Cost Criteria", detail: "Rate each of the 5 benefit and 5 cost criteria on a 1–10 scale. Set the priority weight (L/M/H) to reflect how much each criterion matters for this specific decision. Add rationale notes to document your evidence." },
                { step: "5", icon: <CheckCircle2 className="w-4 h-4" />, title: "Conditional Adoption Filter", detail: "Automatically shown for ENCOURAGED and high-cost REQUIRED decisions. Answer 5 yes/no questions with notes to determine if implementation safeguards are in place." },
                { step: "6", icon: <Sparkles className="w-4 h-4" />, title: "Generate AI Report", detail: "Click Generate to produce a professional 400–600 word narrative analysis, synthesizing all your inputs, weights, notes, and filter results into board-ready prose." },
                { step: "7", icon: <Save className="w-4 h-4" />, title: "Save, Share & Print", detail: "Save the evaluation to local history, share a full text report to clipboard or system share sheet, or print a clean formatted report for physical records or PDF export." },
              ].map(({ step, icon, title, detail }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{step}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary">{icon}</span>
                      <span className="text-sm font-bold text-foreground">{title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

        {/* The 4 Quadrants */}
        <Accordion title="The Four Quadrants" icon={<Scale className="w-5 h-5" />} defaultOpen>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Scores above 5.5 are considered "high" for each axis. The threshold is intentional: true neutrality doesn't exist — a 5.5 forces a deliberate commitment above the midpoint.
            </p>
            {QUADRANTS.map(q => (
              <div key={q.label} className={cn("p-5 rounded-2xl border", q.bg, q.border)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-3 h-3 rounded-full shrink-0", q.dot)} />
                  <span className={cn("text-xs font-bold tracking-widest uppercase", q.color)}>{q.label}</span>
                  <span className="text-xs text-muted-foreground ml-1">— {q.title}</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-2">{q.desc}</p>
                <div className={cn("text-xs font-semibold rounded-lg px-3 py-2 border inline-block", q.bg, q.border, q.color)}>
                  → {q.action}
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Rating & Weighting */}
        <Accordion title="Ratings, Weights & Notes" icon={<SlidersHorizontal className="w-5 h-5" />}>
          <div className="mt-5 space-y-6">

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Scale className="w-4 h-4 text-primary" /> 1–10 Rating Scale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Each criterion is rated from 1 to 10. A 1 represents the worst-case outcome (severe harm or negligible benefit); a 10 represents a transformative positive result. Hover the ⓘ icon beside any criterion label to see specific guidance for that rating.</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded border bg-required/20 text-required border-required/40">L</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded border bg-required/20 text-required border-required/40">M</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded border bg-required/20 text-required border-required/40">H</span>
                </span>
                Priority Weights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">Every criterion has a priority weight that affects the weighted average score displayed on the matrix. Not all criteria matter equally for every decision.</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { w: "L", name: "Low (1×)", desc: "Minor factor for this decision. Rated but contributes least to final score." },
                  { w: "M", name: "Medium (2×)", desc: "Standard importance. Default for all criteria. Balanced contribution." },
                  { w: "H", name: "High (3×)", desc: "Critical factor. This criterion should heavily influence the final decision." },
                ].map(({ w, name, desc }) => (
                  <div key={w} className="bg-input/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-sm font-bold text-primary mb-1">{w} — {name}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 bg-input/30 border border-border rounded-lg p-3">
                <strong className="text-foreground">Formula:</strong> Weighted Score = Σ(rating × weight) ÷ Σ(weights). A criterion weighted H=3 contributes three times as much to the average as one weighted L=1.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Rationale Notes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Click the speech-bubble icon on any criterion to expand a note field. Record the specific evidence, data, or reasoning behind your rating. Notes are saved with the evaluation, shown in History, printed in the report, and sent to the AI narrative engine.</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Pencil className="w-4 h-4 text-primary" /> Editable Criterion Labels</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">The "Labels" button at the top of each rating section puts all criterion names into edit mode. Rename any label to match your industry, organization, or decision context — for example, renaming "Margin Impact" to "EBITDA Risk" or "Stakeholder Trust" to "Regulatory Relationship." Click Done to confirm. Use "Reset to default labels" to restore originals.</p>
            </div>

          </div>
        </Accordion>

        {/* Benefit Criteria */}
        <Accordion title="Benefit Criteria" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">Rate each on 1 (harmful or negligible) to 10 (transformative benefit). All five are averaged with priority weights to produce the Y-axis benefit score.</p>
            {BENEFIT_CRITERIA.map((c, i) => (
              <div key={i} className="bg-input/30 rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-required/20 border border-required/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-required">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-1">{c.label}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{c.desc}</p>
                    <p className="text-xs text-primary/80 italic">{c.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Cost Criteria */}
        <Accordion title="Cost Criteria" icon={<Scale className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">Rate each on 1 (minimal impact) to 10 (critically threatening). All five are averaged with priority weights to produce the X-axis cost score.</p>
            {COST_CRITERIA.map((c, i) => (
              <div key={i} className="bg-input/30 rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-prohibited/20 border border-prohibited/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-prohibited">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-1">{c.label}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{c.desc}</p>
                    <p className="text-xs text-primary/80 italic">{c.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Conditional Adoption Filter */}
        <Accordion title="Conditional Adoption Filter" icon={<CheckCircle2 className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Automatically shown when a decision lands in the <strong className="text-encouraged">ENCOURAGED</strong> quadrant, or when it is <strong className="text-required">REQUIRED</strong> but carries a cost score above 7.0. These are high-stakes decisions that warrant structured scrutiny before commitment.
            </p>
            <div className="bg-input/20 rounded-xl border border-border p-4 mb-4">
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                {[
                  { range: "5/5 YES", label: "Adopt Immediately", color: "text-required" },
                  { range: "3–4 YES", label: "Conditional Adoption", color: "text-encouraged" },
                  { range: "0–2 YES", label: "Defer or Reject", color: "text-prohibited" },
                ].map(r => (
                  <div key={r.label} className="bg-input/40 rounded-lg p-3 border border-border">
                    <div className={cn("font-bold text-xs mb-1", r.color)}>{r.range}</div>
                    <div className="text-muted-foreground text-[11px] leading-tight">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {FILTER_QUESTIONS.map((fq, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-0.5">{fq.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{fq.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* AI Report */}
        <Accordion title="AI Narrative Report" icon={<Sparkles className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The AI Narrative Report generates a 400–600 word professional analysis of your evaluation — synthesizing your background information, ratings, priority weights, rationale notes, and conditional filter results into board-ready prose.
            </p>
            <div className="space-y-3">
              {[
                { title: "Executive Summary", desc: "Opens with a 1–2 sentence recommendation statement based on the matrix quadrant." },
                { title: "Benefit Analysis", desc: "Examines each benefit driver in the context of your weights and rationale notes, explaining what they mean for this decision." },
                { title: "Cost & Risk Discussion", desc: "Analyses cost concerns with priority weighting — high-weighted cost criteria receive greater narrative emphasis." },
                { title: "Daniels Principles Integration", desc: "References integrity, trust, respect, accountability, rule of law, viability, and fairness naturally throughout the narrative." },
                { title: "Filter Results", desc: "If the Conditional Adoption Filter was completed, incorporates YES/NO results and their implications." },
                { title: "Actionable Next Steps", desc: "Closes with 2–3 specific, concrete next steps derived from the quadrant result and filter outcomes." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 bg-input/30 rounded-xl border border-border p-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-semibold text-foreground">{item.title} — </span>
                    <span className="text-sm text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-sm text-primary/80 leading-relaxed">
              The report streams in real-time. Use the <strong>Copy</strong> button to copy the text, or <strong>Regenerate</strong> to produce a fresh version if you update any ratings or notes.
            </div>
          </div>
        </Accordion>

        {/* History, Load & Compare */}
        <Accordion title="History, Load & Comparison Mode" icon={<History className="w-5 h-5" />}>
          <div className="mt-5 space-y-5">

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Save className="w-4 h-4 text-primary" /> Save to History</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Click "Save Evaluation" in the Evaluation Summary to record the full evaluation — including all ratings, weights, notes, stakeholders, background information, and filter results — to local storage. History is available via the History tab in the navigation.</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Download className="w-4 h-4 text-primary" /> Load from History</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Expand any saved evaluation in History and click <strong className="text-foreground">Load</strong> to restore the full evaluation back into the matrix form — including all ratings, weights, notes, custom labels, and stakeholders. This lets you edit and re-run prior evaluations, or update them with new data.</p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" /> Comparison Mode</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">Compare any two evaluations visually on the matrix chart. Expand a saved evaluation in History and click <strong className="text-foreground">Compare</strong> to pin it as the reference evaluation.</p>
              <div className="space-y-2">
                {[
                  "A second dashed grey dot appears on the matrix chart showing the pinned evaluation's position",
                  "A comparison card appears below the quadrant badge showing the title and scores",
                  "A 'Comparison active' badge in the History header makes the active comparison visible",
                  "Click the X or 'Remove Compare' to clear the comparison at any time",
                ].map((item, i) => (
                  <div key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary shrink-0 mt-0.5">›</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2"><Share2 className="w-4 h-4 text-primary" /> Share from History</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">The Share button on any history card generates a full formatted text report with all criteria, weights, notes, filter results, and stakeholders — and copies it to clipboard or uses the native system share sheet.</p>
            </div>
          </div>
        </Accordion>

        {/* Print/Export */}
        <Accordion title="Print & PDF Export" icon={<Printer className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the <strong className="text-foreground">Printer icon</strong> in the Evaluation Summary to print the current evaluation or save it as a PDF. The print layout is optimized for A4 paper in portrait orientation.
            </p>
            <div className="space-y-2">
              {[
                "White background with black text — fully readable in print",
                "All background information, stakeholders, and proposed action",
                "Benefit and cost ratings with priority weight labels (L/M/H) and color-coded progress bars",
                "All rationale notes shown inline under each criterion",
                "Conditional adoption filter results if applicable",
                "Navigation, chart, and controls are hidden — only the evaluation data is printed",
              ].map((item, i) => (
                <div key={i} className="flex gap-2 text-sm text-muted-foreground items-start">
                  <CheckCircle2 className="w-4 h-4 text-required shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground bg-input/30 border border-border rounded-lg p-3">
              To save as PDF: In the print dialog, select "Save as PDF" as the destination (Chrome, Edge, Firefox) or use "PDF" in the printer dropdown on macOS.
            </p>
          </div>
        </Accordion>

        {/* Daniels Principles */}
        <Accordion title="Daniels Principles of Business Ethics" icon={<BookOpen className="w-5 h-5" />}>
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              The evaluation criteria embed the eight Daniels Principles into operational decision-making. Each principle manifests in one or more of the benefit or cost dimensions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DANIELS.map((p, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground mb-1">{p.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

        {/* Real-World Exemplars */}
        <Accordion title="Real-World Exemplars" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="mt-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">These companies demonstrate how Daniels-aligned decisions play out at scale — validating that integrity and long-term viability are more complementary than competing.</p>
            {EXEMPLARS.map((ex, i) => (
              <div key={i} className={cn("rounded-2xl border p-5", ex.bg, ex.border)}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-base font-bold text-foreground">{ex.name}</h3>
                  <span className={cn("text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border", ex.color, ex.bg, ex.border)}>{ex.quadrant}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ex.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {ex.metrics.map((m, j) => (
                    <span key={j} className="text-xs font-medium bg-input border border-border px-2.5 py-1 rounded-full text-foreground/70">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Accordion>

        {/* Methodology Note */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-foreground mb-2">Methodology Note</h3>
              <p className="text-sm text-primary/80 leading-relaxed">
                Ratings are <strong>user-entered</strong> based on your research, internal models, and stakeholder input. This tool does not calculate ROI automatically — it provides a structured visual framework so ethical, workforce, and community factors are weighed on equal footing with financial costs. The quality of the output depends entirely on the quality and honesty of the inputs.
              </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
