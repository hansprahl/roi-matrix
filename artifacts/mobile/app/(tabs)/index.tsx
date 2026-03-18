import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import Colors from "@/constants/colors";
import MatrixChart from "@/components/MatrixChart";
import RatingSlider from "@/components/RatingSlider";
import QuadrantBadge from "@/components/QuadrantBadge";
import ViabilityCheck from "@/components/ViabilityCheck";
import { FilterState } from "@/lib/storage";
import EvaluationSummary from "@/components/EvaluationSummary";
import { BENEFIT_CRITERIA, COST_CRITERIA } from "@/constants/questions";
import {
  saveEvaluation,
  shareEvaluation,
  generateId,
  Evaluation,
} from "@/lib/storage";

const { THEME, QUADRANT } = Colors;

const EXAMPLE = {
  description:
    "Costco Wholesale company-wide wage increase to $25/hr minimum across all locations",
  benefit: { socialImpact: 9, stakeholderTrust: 8, workforceWellbeing: 9, productQuality: 8, longTermViability: 8 },
  cost: { marginImpact: 7, laborTime: 6, operationalComplexity: 7, supplyChainRisk: 6, opportunityCost: 8 },
};

type Ratings = Record<string, number>;

function getQuadrant(benefit: number, cost: number) {
  const isHighBenefit = benefit >= 5.5;
  const isHighCost = cost >= 5.5;
  if (isHighBenefit && !isHighCost) {
    return {
      label: "REQUIRED",
      subtitle: "Ethical baseline — must implement",
      color: QUADRANT.required,
      description: "Ethical baseline – must implement (Integrity, Trust, Respect)",
    };
  } else if (isHighBenefit && isHighCost) {
    return {
      label: "ENCOURAGED",
      subtitle: "Strategic long-term investment",
      color: QUADRANT.encouraged,
      description:
        "Strategic long-term investment (Viability + Fairness) – proceed with Conditional Adoption review",
    };
  } else if (!isHighBenefit && !isHighCost) {
    return {
      label: "DISCOURAGED",
      subtitle: "Revise, limit, or reject",
      color: QUADRANT.discouraged,
      description: "Revise, limit, or reject (protect Accountability & Rule of Law)",
    };
  } else {
    return {
      label: "PROHIBITED",
      subtitle: "Do not proceed",
      color: QUADRANT.prohibited,
      description: "Do not proceed (preserve long-term Viability)",
    };
  }
}

function avg(ratings: Ratings): number {
  const vals = Object.values(ratings);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function MatrixScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [description, setDescription] = useState("");
  const emptyFilter: FilterState = {
    checks: [false, false, false, false, false],
    notes: ["", "", "", "", ""],
  };
  const [filterState, setFilterState] = useState<FilterState>(emptyFilter);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilterChange = useCallback(
    (index: number, checked: boolean, note: string) => {
      setFilterState((prev) => {
        const checks = [...prev.checks];
        const notes = [...prev.notes];
        checks[index] = checked;
        notes[index] = note;
        return { checks, notes };
      });
      setSaved(false);
    },
    []
  );

  const [benefitRatings, setBenefitRatings] = useState<Ratings>({
    socialImpact: 8,
    stakeholderTrust: 8,
    workforceWellbeing: 9,
    productQuality: 8,
    longTermViability: 8,
  });
  const [costRatings, setCostRatings] = useState<Ratings>({
    marginImpact: 7,
    laborTime: 6,
    operationalComplexity: 7,
    supplyChainRisk: 6,
    opportunityCost: 8,
  });

  const benefitScore = parseFloat(avg(benefitRatings).toFixed(1));
  const costScore = parseFloat(avg(costRatings).toFixed(1));
  const quadrant = getQuadrant(benefitScore, costScore);

  const showFilter =
    quadrant.label === "ENCOURAGED" ||
    (quadrant.label === "REQUIRED" && costScore > 7.0);

  const filterYesCount = filterState.checks.filter(Boolean).length;

  const buildEvaluation = useCallback((): Evaluation => {
    return {
      id: generateId(),
      createdAt: Date.now(),
      description,
      benefitRatings,
      costRatings,
      benefitScore,
      costScore,
      quadrantLabel: quadrant.label,
      quadrantColor: quadrant.color,
      quadrantDescription: quadrant.description,
      filterUsed: showFilter,
      filterChecks: filterState.checks,
      filterNotes: filterState.notes,
      filterYesCount,
    };
  }, [description, benefitRatings, costRatings, benefitScore, costScore, quadrant, showFilter, filterState, filterYesCount]);

  const handleSave = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await saveEvaluation(buildEvaluation());
    setSaving(false);
    setSaved(true);
    if (savedResetTimer.current) clearTimeout(savedResetTimer.current);
    savedResetTimer.current = setTimeout(() => setSaved(false), 3000);
  }, [buildEvaluation]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await shareEvaluation(buildEvaluation());
  }, [buildEvaluation]);

  const handleLoadExample = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDescription(EXAMPLE.description);
    setBenefitRatings({ ...EXAMPLE.benefit });
    setCostRatings({ ...EXAMPLE.cost });
    setFilterState({
      checks: [true, true, true, true, false],
      notes: [
        "Phased rollout across 3 regions in Q1",
        "Quarterly stakeholder reporting committed",
        "Improves workforce + customer retention scores",
        "Voluntary employment; market-driven pricing retained",
        "",
      ],
    });
    setSaved(false);
  }, []);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDescription("");
    setBenefitRatings({
      socialImpact: 5, stakeholderTrust: 5, workforceWellbeing: 5,
      productQuality: 5, longTermViability: 5,
    });
    setCostRatings({
      marginImpact: 5, laborTime: 5, operationalComplexity: 5,
      supplyChainRisk: 5, opportunityCost: 5,
    });
    setFilterState({ checks: [false, false, false, false, false], notes: ["", "", "", "", ""] });
    setSaved(false);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: THEME.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Return on Integrity: Benefit-Cost Matrix</Text>
          <Text style={styles.headerCaption}>
            A principled decision tool inspired by Daniels Principles and exemplars (In-N-Out, AriZona Tea, Costco). High-benefit actions are evaluated for courageous yet pragmatic implementation.
          </Text>
          <View style={styles.fourDomainBox}>
            <Text style={styles.fourDomainText}>
              <Text style={styles.fourDomainBold}>Four-domain guiding questions</Text>
              {" "}are embedded in the scoring factors to ensure balanced impact across Community Investment, Healthy Workforce, Quality of Products/Services, and Employee Culture & Retention.
            </Text>
          </View>
        </View>

        {/* Matrix Chart */}
        <MatrixChart benefitScore={benefitScore} costScore={costScore} />

        {/* Quadrant Result */}
        <QuadrantBadge quadrant={quadrant} benefitScore={benefitScore} costScore={costScore} />

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Proposed Action</Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={(t) => { setDescription(t); setSaved(false); }}
            placeholder="Describe the action being evaluated…"
            placeholderTextColor={THEME.textMuted}
            multiline
            numberOfLines={3}
          />
          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.pill, { opacity: pressed ? 0.7 : 1 }]}
              onPress={handleLoadExample}
            >
              <Feather name="download" size={13} color={Colors.light.tint} />
              <Text style={styles.pillText}>Load Example</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.pill, styles.pillGhost, { opacity: pressed ? 0.7 : 1 }]}
              onPress={handleReset}
            >
              <Feather name="rotate-ccw" size={13} color={THEME.textSecondary} />
              <Text style={[styles.pillText, { color: THEME.textSecondary }]}>Reset</Text>
            </Pressable>
          </View>
        </View>

        {/* Benefit Ratings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: QUADRANT.required }]} />
            <Text style={styles.sectionLabel}>Benefit Ratings</Text>
            <View style={styles.sectionScore}>
              <Text style={[styles.sectionScoreText, { color: QUADRANT.required }]}>
                {benefitScore}
              </Text>
              <Text style={styles.sectionScoreUnit}>/10 avg</Text>
            </View>
          </View>
          {BENEFIT_CRITERIA.map((c) => (
            <RatingSlider
              key={c.key}
              label={c.label}
              value={benefitRatings[c.key]}
              color={QUADRANT.required}
              onChange={(v) => { setBenefitRatings((prev) => ({ ...prev, [c.key]: v })); setSaved(false); }}
            />
          ))}
        </View>

        {/* Cost Ratings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: QUADRANT.prohibited }]} />
            <Text style={styles.sectionLabel}>Cost Ratings</Text>
            <View style={styles.sectionScore}>
              <Text style={[styles.sectionScoreText, { color: QUADRANT.prohibited }]}>
                {costScore}
              </Text>
              <Text style={styles.sectionScoreUnit}>/10 avg</Text>
            </View>
          </View>
          {COST_CRITERIA.map((c) => (
            <RatingSlider
              key={c.key}
              label={c.label}
              value={costRatings[c.key]}
              color={QUADRANT.prohibited}
              onChange={(v) => { setCostRatings((prev) => ({ ...prev, [c.key]: v })); setSaved(false); }}
            />
          ))}
        </View>

        {/* Conditional Adoption Filter */}
        {showFilter && (
          <ViabilityCheck state={filterState} onChange={handleFilterChange} />
        )}

        {/* Evaluation Summary + Save/Share */}
        <EvaluationSummary
          description={description}
          benefitRatings={benefitRatings}
          costRatings={costRatings}
          benefitScore={benefitScore}
          costScore={costScore}
          quadrantLabel={quadrant.label}
          quadrantColor={quadrant.color}
          filterUsed={showFilter}
          filterState={filterState}
          filterYesCount={filterYesCount}
          onSave={handleSave}
          onShare={handleShare}
          saving={saving}
          saved={saved}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 4,
  },
  header: {
    marginBottom: 4,
    gap: 10,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: "#FFFFFF",
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  headerCaption: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.THEME.textSecondary,
    lineHeight: 20,
  },
  fourDomainBox: {
    backgroundColor: Colors.light.tint + "12",
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  fourDomainText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.THEME.textSecondary,
    lineHeight: 18,
  },
  fourDomainBold: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.tint,
  },
  section: {
    marginTop: 20,
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: THEME.text,
    flex: 1,
  },
  sectionScore: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  sectionScoreText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  sectionScoreUnit: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: THEME.textMuted,
  },
  textArea: {
    backgroundColor: THEME.bgInput,
    borderRadius: 10,
    padding: 12,
    color: THEME.text,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    minHeight: 72,
    borderWidth: 1,
    borderColor: THEME.border,
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.tint + "22",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.tint + "44",
  },
  pillGhost: {
    backgroundColor: THEME.bgInput,
    borderColor: THEME.border,
  },
  pillText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.light.tint,
  },
});
