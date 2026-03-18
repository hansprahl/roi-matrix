import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import Colors from "@/constants/colors";

const { THEME, QUADRANT } = Colors;

const PRINCIPLES = [
  { name: "Integrity", icon: "shield" as const, desc: "Act with honesty and consistency regardless of consequences." },
  { name: "Trust", icon: "users" as const, desc: "Build confidence through reliable, transparent behavior." },
  { name: "Accountability", icon: "check-square" as const, desc: "Accept responsibility for decisions and outcomes." },
  { name: "Transparency", icon: "eye" as const, desc: "Operate openly — share relevant information with stakeholders." },
  { name: "Fairness", icon: "sliders" as const, desc: "Treat all parties equitably and without bias." },
  { name: "Respect", icon: "heart" as const, desc: "Honor the dignity and rights of every stakeholder." },
  { name: "Rule of Law", icon: "book" as const, desc: "Operate within legal and regulatory frameworks." },
  { name: "Viability", icon: "trending-up" as const, desc: "Sustain ethical standards while maintaining financial health." },
];

const EXEMPLARS = [
  {
    company: "In-N-Out Burger",
    color: QUADRANT.required,
    note: "Consistent wages above industry average and quality standards — REQUIRED quadrant behavior.",
  },
  {
    company: "AriZona Tea",
    color: QUADRANT.encouraged,
    note: "Maintained $0.99 price for 30+ years despite cost pressure — balancing stakeholder trust and viability.",
  },
  {
    company: "Costco Wholesale",
    color: QUADRANT.encouraged,
    note: "Living wages + generous benefits drive record retention and loyalty — ENCOURAGED strategic investment.",
  },
];

const QUADRANT_INFO = [
  { label: "REQUIRED", color: QUADRANT.required, corner: "Top-Left", desc: "High benefit, low cost — the ethical baseline every organization must meet." },
  { label: "ENCOURAGED", color: QUADRANT.encouraged, corner: "Top-Right", desc: "High benefit, higher cost — strategic investments that build long-term trust and viability." },
  { label: "DISCOURAGED", color: QUADRANT.discouraged, corner: "Bottom-Left", desc: "Low benefit, low cost — marginally useful actions. Revise or limit scope." },
  { label: "PROHIBITED", color: QUADRANT.prohibited, corner: "Bottom-Right", desc: "Low benefit, high cost — harmful trade-offs that violate integrity and fairness." },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: THEME.bg }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>About the Matrix</Text>
        <Text style={styles.subtitle}>Inspired by Daniels Principles</Text>
        <Text style={styles.intro}>
          The Return on Integrity framework evaluates business decisions by weighing ethical benefit
          against implementation cost. Rooted in 8 core principles, it helps leaders make choices
          that are both morally sound and commercially sustainable.
        </Text>

        {/* Quadrant Guide */}
        <Text style={styles.sectionTitle}>Quadrant Guide</Text>
        <View style={styles.card}>
          {QUADRANT_INFO.map((q, i) => (
            <View key={q.label} style={[styles.quadrantRow, i < QUADRANT_INFO.length - 1 && styles.rowBorder]}>
              <View style={[styles.quadrantPill, { backgroundColor: q.color + "22", borderColor: q.color + "55" }]}>
                <Text style={[styles.quadrantLabel, { color: q.color }]}>{q.label}</Text>
              </View>
              <View style={styles.quadrantMeta}>
                <Text style={styles.quadrantCorner}>{q.corner}</Text>
                <Text style={styles.quadrantDesc}>{q.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Daniels Principles */}
        <Text style={styles.sectionTitle}>Daniels Principles</Text>
        <View style={styles.card}>
          {PRINCIPLES.map((p, i) => (
            <View key={p.name} style={[styles.principleRow, i < PRINCIPLES.length - 1 && styles.rowBorder]}>
              <View style={styles.principleIcon}>
                <Feather name={p.icon} size={16} color={Colors.light.tint} />
              </View>
              <View style={styles.principleText}>
                <Text style={styles.principleName}>{p.name}</Text>
                <Text style={styles.principleDesc}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Exemplars */}
        <Text style={styles.sectionTitle}>Real-World Exemplars</Text>
        {EXEMPLARS.map((e) => (
          <View key={e.company} style={[styles.exemplarCard, { borderLeftColor: e.color }]}>
            <Text style={[styles.exemplarName, { color: e.color }]}>{e.company}</Text>
            <Text style={styles.exemplarNote}>{e.note}</Text>
          </View>
        ))}

        {/* Methodology */}
        <Text style={styles.sectionTitle}>Methodology</Text>
        <View style={styles.card}>
          <Text style={styles.methodText}>
            Each dimension is rated 1–10. Averages are computed independently for Benefit (5 criteria)
            and Cost (5 criteria). The threshold of 5.5 separates high from low on each axis,
            placing every action into one of four decision quadrants.
          </Text>
          <View style={styles.divider} />
          <Text style={styles.methodText}>
            The matrix is compatible with free-market principles — it does not oppose profit,
            but argues that sustainable profit and ethical conduct are mutually reinforcing,
            not mutually exclusive.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    gap: 0,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.light.tint,
    marginTop: 2,
    marginBottom: 12,
  },
  intro: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: THEME.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.separator,
  },
  quadrantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
  },
  quadrantPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
  },
  quadrantLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  quadrantMeta: {
    flex: 1,
    gap: 2,
  },
  quadrantCorner: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: THEME.textSecondary,
  },
  quadrantDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  principleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
  },
  principleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.light.tint + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  principleText: { flex: 1, gap: 2 },
  principleName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: THEME.text,
  },
  principleDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  exemplarCard: {
    backgroundColor: THEME.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    borderLeftWidth: 3,
    marginBottom: 10,
    gap: 4,
  },
  exemplarName: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  exemplarNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 18,
  },
  methodText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: THEME.textSecondary,
    lineHeight: 22,
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.separator,
    marginHorizontal: 16,
  },
});
