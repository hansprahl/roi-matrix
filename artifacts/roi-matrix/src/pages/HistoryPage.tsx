import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trash2, Share2, ChevronDown, ChevronUp, FileX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadEvaluations, deleteEvaluation, Evaluation, buildShareText } from "../lib/storage";
import { BENEFIT_CRITERIA, COST_CRITERIA } from "../constants/questions";
import { cn } from "@/lib/utils";

export function HistoryPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setEvaluations(loadEvaluations());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this evaluation?")) {
      const updated = deleteEvaluation(id);
      setEvaluations(updated);
      if (expandedId === id) setExpandedId(null);
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
    } catch (err) {
      console.log("Error sharing", err);
    }
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(new Date(ts));
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
              Complete a matrix evaluation on the main screen and tap "Save Evaluation" to record it here for future review.
            </p>
            <Link href="/" className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
              Go to Matrix
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations.map((item) => {
              const isExpanded = expandedId === item.id;
              
              const colorClassMap: Record<string, string> = {
                REQUIRED: "text-required border-required/30 bg-required/10",
                ENCOURAGED: "text-encouraged border-encouraged/30 bg-encouraged/10",
                DISCOURAGED: "text-discouraged border-discouraged/30 bg-discouraged/10",
                PROHIBITED: "text-prohibited border-prohibited/30 bg-prohibited/10",
              };
              const theme = colorClassMap[item.quadrantLabel] || "";

              return (
                <div key={item.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:border-border/80">
                  <button 
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full text-left p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-input/30 transition-colors focus:outline-none focus:bg-input/40"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate leading-tight mb-1.5">
                        {item.description || "Untitled Evaluation"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center gap-3">
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Benefit Details</h4>
                              <div className="space-y-2.5">
                                {BENEFIT_CRITERIA.map(c => (
                                  <div key={c.key} className="flex justify-between items-center text-sm">
                                    <span className="text-foreground/80">{c.label}</span>
                                    <span className="font-mono font-bold text-required bg-required/10 px-1.5 py-0.5 rounded">{item.benefitRatings[c.key]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Cost Details</h4>
                              <div className="space-y-2.5">
                                {COST_CRITERIA.map(c => (
                                  <div key={c.key} className="flex justify-between items-center text-sm">
                                    <span className="text-foreground/80">{c.label}</span>
                                    <span className="font-mono font-bold text-prohibited bg-prohibited/10 px-1.5 py-0.5 rounded">{item.costRatings[c.key]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {item.filterUsed && (
                            <div className="pt-6 border-t border-border/50">
                              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                                Conditional Filter Notes ({item.filterYesCount}/5 YES)
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

                          <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="px-4 py-2 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            <button 
                              onClick={() => handleShare(item)}
                              className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2"
                            >
                              <Share2 className="w-4 h-4" /> Share Report
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
