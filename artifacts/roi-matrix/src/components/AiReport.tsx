import React, { useState } from "react";
import { Sparkles, Loader2, Printer, Copy, Check } from "lucide-react";
import { BENEFIT_CRITERIA, COST_CRITERIA, FILTER_QUESTIONS } from "../constants/questions";
import { cn } from "@/lib/utils";

interface AiReportProps {
  backgroundInfo: string;
  stakeholders: string;
  description: string;
  benefitRatings: Record<string, number>;
  costRatings: Record<string, number>;
  benefitWeights: Record<string, number>;
  costWeights: Record<string, number>;
  benefitNotes: Record<string, string>;
  costNotes: Record<string, string>;
  customBenefitLabels: Record<string, string>;
  customCostLabels: Record<string, string>;
  benefitScore: number;
  costScore: number;
  quadrantLabel: string;
  quadrantDescription: string;
  filterUsed: boolean;
  filterChecks: boolean[];
  filterNotes: string[];
  filterYesCount: number;
}

export function AiReport(props: AiReportProps) {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setReport("");
    setError("");
    try {
      const apiUrl = import.meta.env.PROD
        ? "/api-server/api/generate-report"
        : "/proxy-api/api/generate-report";
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...props,
          benefitCriteria: BENEFIT_CRITERIA,
          costCriteria: COST_CRITERIA,
          filterQuestions: FILTER_QUESTIONS,
        }),
      });

      if (!response.ok) throw new Error("Server error");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) setReport((prev) => prev + data.content);
              if (data.error) setError(data.error);
              if (data.done) setLoading(false);
            } catch {}
          }
        }
      }
    } catch {
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(108,142,255,0.6)]" />
        <h2 className="text-xl font-bold flex-1">AI Narrative Report</h2>
        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-input text-muted-foreground hover:text-foreground border border-border rounded-lg text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-required" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
          <button
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Writing…" : report ? "Regenerate" : "Generate"}
          </button>
        </div>
      </div>

      {!report && !loading && !error && (
        <div className="text-center py-10 text-muted-foreground">
          <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-25" />
          <p className="text-sm max-w-sm mx-auto leading-relaxed">
            Generate a professional AI-written narrative analysis based on your background context, ratings, weights, and notes.
          </p>
        </div>
      )}

      {loading && !report && (
        <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analyzing evaluation data…</span>
        </div>
      )}

      {report && (
        <div className="text-[15px] text-foreground leading-[1.75] whitespace-pre-wrap">
          {report}
          {loading && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 rounded align-text-bottom" />
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
