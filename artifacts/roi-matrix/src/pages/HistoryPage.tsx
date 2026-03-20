import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Trash2, Share2, ChevronDown, ChevronUp, FileX, Download, BarChart2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadEvaluations, deleteEvaluation, Evaluation, buildShareText, getComparison, setComparison } from "../lib/storage";
import { BENEFIT_CRITERIA, COST_CRITERIA } from "../constants/questions";
import { cn } from "@/lib/utils";

const WEIGHT_LABEL: Record<number, string> = { 1: "L", 2: "M", 3: "H" };

export function HistoryPage() {
  const [, navigate] = useLocation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comparisonId, setComparisonId] = useState<string | null>(() => getComparison()?.id ?? null);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  useEffect(() => {
    setEvaluations(loadEvaluations());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this evaluation?")) {
      const updated = deleteEvaluation(id);
      setEvaluations(updated);
      if (expandedId === id) setExpandedId(null);
      if (comparisonId === id) {
        setComparison(null);
        setComparisonId(null);
        window.dispatchEvent(new CustomEvent("roi:comparison-changed"));
      }
    }
  };

  const handleShare = async (e: Evaluation) => {
    const text = buildShareText(e);
    try {
      if (navigator.share) {
        await navigator.share({ title: "ROI Evaluation", text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Report copied to clipboard!");
      }
    } catch {}
  };

  const handleLoad = (e: Evaluation) => {
    setLoadedId(e.id);
    localStorage.setItem("roi_pending_load", JSON.stringify(e));
    setTimeout(() => navigate("/"), 150);
  };

  const handleCompare = (e: Evaluation) => {
    if (comparisonId === e.id) {
      setComparison(null);
      setComparisonId(null);
    } else {
      setComparison(e);
      setComparisonId(e.id);
    }
    window.dispatchEvent(new CustomEvent("roi:comparison-changed"));
  };

  const formatDate = (ts: number) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(ts));

  const colorClassMap: Record<string, string> = {
    REQUIRED: "text-required border-required/30 bg-required/10",
    ENCOURAGED: "text-encouraged border-encouraged/30 bg-encouraged/10",
    DISCOURAGED: "text-discouraged border-discouraged/30 bg-discouraged/10",
    PROHIBITED: "text-prohibited border-prohibited/30 bg-prohibited/10",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border px-4 py-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="p-2 -ml-2 rounded-lg hover:bg-input text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">Evaluation History</h1>
            <p className="text-xs text-muted-foreground">Saved records of your matrix analyses</p>
          </div>
          {comparisonId && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
              <BarChart2 className="w-3.5 h-3.5" />
              Comparison active
              <button
                onClick={() => { setComparison(null); setComparisonId(null); window.dispatchEvent(new CustomEvent("roi:comparison-changed")); }}
                className="text-primary/70 hover:text-primary ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 pb-24">
        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-card/30 rounded-3xl border border-border/50 border-dashed mt-8">
            <div className="w-16 h-16 bg-input rounded-2xl flex items-center justify-center mb-4 border border-border shadow-inner">
              <FileX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No saved evaluations yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Complete a matrix evaluation and tap "Save Evaluation" to record it here.
            </p>
            <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
              Go to Matrix
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((item) => {
              const isExpanded = expandedId === item.id;
              const isComparison = comparisonId === item.id;
              const theme = colorClassMap[item.quadrantLabel] || "";

              return (
                <div
                  key={item.id}
                  className={cn(
                    "bg-card rounded-2xl border shadow-sm overflow-hidden transition-all",
                    isComparison ? "border-primary/40 shadow-primary/10" : "border-border hover:border-border/80"
                  )}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-input/30 transition-colors focus:outline-none"
                  >
                    <div className="flex-1 min-w-0">
                      {isComparison && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded mb-1.5">
                          <BarChart2 className="w-2.5 h-2.5" /> Comparison
                        </span>
                      )}
                      <h3 className="text-base font-bold text-foreground truncate leading-tight mb-1.5">
                        {item.description || "Untitled Evaluation"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">{formatDate(item.createdAt)}</p>
                      {item.stakeholders && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">Stakeholders: {item.stakeholders}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-input px-2 py-1 rounded">
                          B: <span className="text-required">{item.benefitScore.toFixed(1)}</span>
                        </span>
                        <span className="text-xs font-mono font-bold bg-input px-2 py-1 rounded">
                          C: <span className="text-prohibited">{item.costScore.toFixed(1)}</span>
                        </span>
                      </div>
                      <span className={cn("px-2.5 py-1 text-[10px] font-bold tracking-widest rounded border shrink-0", theme)}>
                        {item.quadrantLabel}
                      </span>
                      <div className="text-muted-foreground">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-border/50 bg-input/10"
                      >
                        <div className="p-5 sm:p-6 space-y-8">

                          {item.backgroundInfo && (
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Background</h4>
                              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.backgroundInfo}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Benefit Details</h4>
                              <div className="space-y-3">
                                {BENEFIT_CRITERIA.map(c => {
                                  const label = item.customBenefitLabels?.[c.key] || c.label;
                                  const note = item.benefitNotes?.[c.key];
                                  const w = item.benefitWeights?.[c.key] ?? 2;
                                  return (
                                    <div key={c.key}>
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-foreground/80 flex-1 min-w-0 truncate" title={label}>{label}</span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[9px] text-muted-foreground font-bold">{WEIGHT_LABEL[w]}</span>
                                          <span className="font-mono font-bold text-required bg-required/10 px-1.5 py-0.5 rounded">{item.benefitRatings[c.key]}</span>
                                        </div>
                                      </div>
                                      {note?.trim() && (
                                        <p className="text-xs text-muted-foreground italic mt-1 pl-1">{note.trim()}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Cost Details</h4>
                              <div className="space-y-3">
                                {COST_CRITERIA.map(c => {
                                  const label = item.customCostLabels?.[c.key] || c.label;
                                  const note = item.costNotes?.[c.key];
                                  const w = item.costWeights?.[c.key] ?? 2;
                                  return (
                                    <div key={c.key}>
                                      <div className="flex justify-between items-center text-sm gap-2">
                                        <span className="text-foreground/80 flex-1 min-w-0 truncate" title={label}>{label}</span>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[9px] text-muted-foreground font-bold">{WEIGHT_LABEL[w]}</span>
                                          <span className="font-mono font-bold text-prohibited bg-prohibited/10 px-1.5 py-0.5 rounded">{item.costRatings[c.key]}</span>
                                        </div>
                                      </div>
                                      {note?.trim() && (
                                        <p className="text-xs text-muted-foreground italic mt-1 pl-1">{note.trim()}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {item.filterUsed && (
                            <div className="pt-6 border-t border-border/50">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                Conditional Filter ({item.filterYesCount}/5 YES)
                              </h4>
                              <div className="space-y-3">
                                {item.filterNotes.map((note, i) => {
                                  if (!note?.trim() && !item.filterChecks[i]) return null;
                                  return (
                                    <div key={i} className="text-sm bg-background p-3 rounded-lg border border-border/50">
                                      <div className="flex gap-2 items-start mb-1.5">
                                        <span className={cn(
                                          "text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0",
                                          item.filterChecks[i] ? "bg-required/20 text-required" : "bg-prohibited/20 text-prohibited"
                                        )}>
                                          {item.filterChecks[i] ? "YES" : "NO"}
                                        </span>
                                        <span className="text-muted-foreground">Condition {i + 1}</span>
                                      </div>
                                      <p className="text-foreground italic">{note || "No notes provided."}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-border/50">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-4 py-2 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            <button
                              onClick={() => handleShare(item)}
                              className="px-4 py-2 rounded-xl text-sm font-bold bg-input text-foreground border border-border hover:bg-input/80 transition-colors flex items-center gap-2"
                            >
                              <Share2 className="w-4 h-4" /> Share
                            </button>
                            <button
                              onClick={() => handleCompare(item)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2",
                                isComparison
                                  ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                                  : "bg-input text-foreground border border-border hover:bg-input/80"
                              )}
                            >
                              <BarChart2 className="w-4 h-4" />
                              {isComparison ? "Remove Compare" : "Compare"}
                            </button>
                            <button
                              onClick={() => handleLoad(item)}
                              disabled={loadedId === item.id}
                              className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2 disabled:opacity-70"
                            >
                              <Download className="w-4 h-4" />
                              {loadedId === item.id ? "Loading…" : "Load"}
                            </button>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
