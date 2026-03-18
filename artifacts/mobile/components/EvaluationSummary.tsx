import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BENEFIT_CRITERIA, COST_CRITERIA, FILTER_QUESTIONS } from "@/constants/questions";
import { FilterState } from "@/lib/storage";
import Colors from "@/constants/colors";

interface Props {
  description: string;
  benefitRatings: Record<string, number>;
  costRatings: Record<string, number>;
  benefitScore: number;
  costScore: number;
  quadrantLabel: string;
  quadrantColor: string;
  filterUsed: boolean;
  filterState: FilterState;
  filterYesCount: number;
  onSave: () => void;
  onShare: () => void;
  saving: boolean;
  saved: boolean;
}

export default function EvaluationSummary({
  description,
  benefitRatings,
  costRatings,
  benefitScore,
  costScore,
  quadrantLabel,
  quadrantColor,
  filterUsed,
  filterState,
  filterYesCount,
  onSave,
  onShare,
  saving,
  saved,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Evaluation Summary</Text>

      {description ? (
        <Text style={styles.actionLabel}>"{description}"</Text>
      ) : (
        <Text style={styles.actionPlaceholder}>No action description entered</Text>
      )}

      <View style={styles.scoreRow}>
        <View style={[styles.scorePill, { borderColor: Colors.benefit }]}>
          <Text style={[styles.scoreNumber, { color: Colors.benefit }]}>{benefitScore}</Text>
          <Text style={styles.scoreUnit}>/10 Benefit</Text>
        </View>
        <View style={[styles.scorePill, { borderColor: Colors.cost }]}>
          <Text style={[styles.scoreNumber, { color: Colors.cost }]}>{costScore}</Text>
          <Text style={styles.scoreUnit}>/10 Cost</Text>
        </View>
        <View style={[styles.quadrantPill, { backgroundColor: quadrantColor + "33", borderColor: quadrantColor }]}>
          <Text style={[styles.quadrantText, { color: quadrantColor }]}>{quadrantLabel}</Text>
        </View>
      </View>

      <View style={styles.criteriaSection}>
        <Text style={styles.criteriaHeading}>Benefit Breakdown</Text>
        {BENEFIT_CRITERIA.map((c) => (
          <View key={c.key} style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel} numberOfLines={1}>{c.label}</Text>
            <View style={styles.ratingBar}>
              <View
                style={[
                  styles.ratingFill,
                  { width: `${(benefitRatings[c.key] / 10) * 100}%`, backgroundColor: Colors.benefit },
                ]}
              />
            </View>
            <Text style={[styles.ratingValue, { color: Colors.benefit }]}>{benefitRatings[c.key]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.criteriaSection}>
        <Text style={styles.criteriaHeading}>Cost Breakdown</Text>
        {COST_CRITERIA.map((c) => (
          <View key={c.key} style={styles.criteriaRow}>
            <Text style={styles.criteriaLabel} numberOfLines={1}>{c.label}</Text>
            <View style={styles.ratingBar}>
              <View
                style={[
                  styles.ratingFill,
                  { width: `${(costRatings[c.key] / 10) * 100}%`, backgroundColor: Colors.cost },
                ]}
              />
            </View>
            <Text style={[styles.ratingValue, { color: Colors.cost }]}>{costRatings[c.key]}</Text>
          </View>
        ))}
      </View>

      {filterUsed && (
        <View style={styles.criteriaSection}>
          <Text style={styles.criteriaHeading}>
            Conditional Adoption Filter — {filterYesCount}/5 Yes
          </Text>
          {FILTER_QUESTIONS.map((q, i) => (
            <View key={i} style={styles.filterRow}>
              <View style={[styles.filterBadge, { backgroundColor: filterState.checks[i] ? "#22c55e22" : "#ef444422" }]}>
                <Text style={[styles.filterBadgeText, { color: filterState.checks[i] ? "#22c55e" : "#ef4444" }]}>
                  {filterState.checks[i] ? "YES" : "NO"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterQuestion} numberOfLines={2}>{q}</Text>
                {filterState.notes[i]?.trim() ? (
                  <Text style={styles.filterNote}>Note: {filterState.notes[i]}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.saveBtn, saved && styles.savedBtn]}
          onPress={onSave}
          disabled={saving || saved}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>{saved ? "✓ Saved" : "Save Evaluation"}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.shareBtn]} onPress={onShare} activeOpacity={0.8}>
          <Text style={[styles.btnText, { color: Colors.primary }]}>Share Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  actionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  actionPlaceholder: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "baseline",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 2,
  },
  scoreNumber: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  scoreUnit: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: "Inter_400Regular",
  },
  quadrantPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  quadrantText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  criteriaSection: {
    gap: 6,
  },
  criteriaHeading: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  criteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  criteriaLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    width: 120,
  },
  ratingBar: {
    flex: 1,
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingFill: {
    height: "100%",
    borderRadius: 3,
  },
  ratingValue: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    width: 20,
    textAlign: "right",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  filterBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 1,
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  filterQuestion: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 15,
  },
  filterNote: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: Colors.primary,
  },
  savedBtn: {
    backgroundColor: "#22c55e",
  },
  shareBtn: {
    backgroundColor: Colors.primary + "1A",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
