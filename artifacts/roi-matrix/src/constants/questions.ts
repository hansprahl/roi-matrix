export const BENEFIT_CRITERIA = [
  {
    key: "socialImpact",
    label: "Social Impact / Harm Reduction",
    tooltip: "How much does this action reduce harm or improve wellbeing for employees, customers, and communities? Rate 1 (harmful/negligible) to 10 (transformative positive impact).",
  },
  {
    key: "stakeholderTrust",
    label: "Stakeholder Trust",
    tooltip: "Does this action strengthen trust with all stakeholders — employees, customers, investors, regulators, and the public? Rate 1 (erodes trust) to 10 (significantly builds trust).",
  },
  {
    key: "workforceWellbeing",
    label: "Workforce Stability & Well-being",
    tooltip: "How much does this improve workforce retention, morale, safety, and long-term stability? Rate 1 (destabilizes workforce) to 10 (major wellbeing improvement).",
  },
  {
    key: "productQuality",
    label: "Product / Service Quality",
    tooltip: "Does this enhance the quality, safety, or consistency of products/services? Rate 1 (degrades quality) to 10 (significant quality improvement).",
  },
  {
    key: "longTermViability",
    label: "Long-term Viability & Fairness",
    tooltip: "Does this strengthen long-term sustainability, fairness, and resilience? Rate 1 (undermines viability) to 10 (greatly strengthens long-term position).",
  },
];

export const COST_CRITERIA = [
  {
    key: "marginImpact",
    label: "Margin Impact",
    tooltip: "How severely does this reduce profit margins or financial returns? Rate 1 (negligible) to 10 (critically threatens profitability).",
  },
  {
    key: "laborTime",
    label: "Labor Time",
    tooltip: "How much additional labor time or management bandwidth does this consume? Rate 1 (minimal demand) to 10 (massive resource drain).",
  },
  {
    key: "operationalComplexity",
    label: "Operational Complexity",
    tooltip: "How much complexity does this add to processes, systems, or compliance? Rate 1 (no complexity) to 10 (major systemic overhaul required).",
  },
  {
    key: "supplyChainRisk",
    label: "Supply Chain Risk",
    tooltip: "Does this introduce risk to suppliers or partners? Rate 1 (no supply chain impact) to 10 (severe supply disruption risk).",
  },
  {
    key: "opportunityCost",
    label: "Opportunity Cost",
    tooltip: "What other investments or initiatives are foregone? Rate 1 (negligible tradeoff) to 10 (forecloses major strategic opportunities).",
  },
];

export const FILTER_QUESTIONS = [
  "Protects long-term success? (safeguards like phased rollout, reserves, or ROI tracking?)",
  "Includes clear oversight? (monitoring, stakeholder reporting, course-correction steps?)",
  "Supports the four key areas? (strengthens ≥3 of: Community Investment, Healthy Workforce, Quality of Products/Services, Employee Culture & Retention — without severely harming the fourth?)",
  "Fits free-market values? (preserves voluntary exchange, informed consent, and competition on genuine value?)",
  "Can we test it first? (low-risk pilot with clear success metrics and exit plan?)",
];

export const QUADRANT_COLORS = {
  REQUIRED: "var(--color-required)",
  ENCOURAGED: "var(--color-encouraged)",
  DISCOURAGED: "var(--color-discouraged)",
  PROHIBITED: "var(--color-prohibited)",
};
