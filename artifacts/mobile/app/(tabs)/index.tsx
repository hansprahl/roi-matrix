import React, { useState, useCallback } from "react";
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
import ViabilityCheck, { FilterState } from "@/components/ViabilityCheck";

const { THEME, QUADRANT } = Colors;

const BENEFIT_CRITERIA = [
  { key: "socialImpact", label: "Social Impact / Harm Reduction" },
  { key: "stakeholderTrust", label: "Stakeholder Trust" },
  { key: "workforceWellbeing", label: "Workforce Stability & Well-being" },
  { key: "productQuality", label: "Product / Service Quality" },
  { key: "longTermViability", label: "Long-term Viability & Fairness" },
];

const COST_CRITERIA = [
  { key: "marginImpact", label: "Margin Impact" },
  { key: "laborTime", label: "Labor Time" },
  { key: "operationalComplexity", label: "Operational Complexity" },
  { key: "supplyChainRisk", label: "Supply Chain Risk" },
  { key: "opportunityCost", label: "Opportunity Cost" },
];

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
      description:
        "Ethical baseline – must implement (Integrity, Trust, Respect)",
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
      description:
        "Revise, limit, or reject (protect Accountability & Rule of Law)",
    };
  } else {
    return {
      label: "PROHIBITED",
      subtitle: "Do not proceed",
      color: QUADRANT.prohibited,
      description:
        "Do not proceed (preserve long-term Viability)",
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

  const handleFilterChange = useCallback((index: number, checked: boolean, note: string) => {
    setFilterState((prev) => {
      const checks = [...prev.checks];
      const notes = [...prev.notes];
      checks[index] = checked;
      notes[index] = note;
      return { checks, notes };
    });
  }, []);

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
          <Text style={styles.headerTitle}>Return on Integrity</Text>
          <Text style={styles.headerSubtitle}>Benefit-Cost Matrix</Text>
          <Text style={styles.headerHint}>
            Evaluate proposed actions against Daniels Principles
          </Text>
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
            onChangeText={setDescription}
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
              onChange={(v) => setBenefitRatings((prev) => ({ ...prev, [c.key]: v }))}
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
              onChange={(v) => setCostRatings((prev) => ({ ...prev, [c.key]: v }))}
            />
          ))}
        </View>

        {/* Conditional Adoption Filter — only for ENCOURAGED or high-cost REQUIRED */}
        {(quadrant.label === "ENCOURAGED" ||
          (quadrant.label === "REQUIRED" && costScore > 7.0)) && (
          <ViabilityCheck state={filterState} onChange={handleFilterChange} />
        )}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.light.tint,
    marginTop: 2,
  },
  headerHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.THEME.textMuted,
    marginTop: 6,
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
