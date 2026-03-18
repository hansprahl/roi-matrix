import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import Colors from "@/constants/colors";
import { FILTER_QUESTIONS } from "@/constants/questions";
import { FilterState } from "@/lib/storage";

export type { FilterState };

const { THEME, QUADRANT } = Colors;

interface Props {
  state: FilterState;
  onChange: (index: number, checked: boolean, note: string) => void;
}

function CheckRow({
  label,
  number,
  checked,
  note,
  index,
  onChange,
}: {
  label: string;
  number: number;
  checked: boolean;
  note: string;
  index: number;
  onChange: (i: number, c: boolean, n: string) => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(index, !checked, note);
  }, [checked, note, index, onChange]);

  return (
    <View style={styles.checkBlock}>
      <Pressable onPress={handleToggle} style={styles.checkRow}>
        <Animated.View
          style={[
            styles.checkbox,
            checked
              ? { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint }
              : { backgroundColor: THEME.bgInput, borderColor: THEME.border },
            animStyle,
          ]}
        >
          {checked && <Feather name="check" size={12} color="#fff" />}
        </Animated.View>
        <View style={styles.checkLabelWrap}>
          <Text style={styles.checkNum}>{number}.</Text>
          <Text style={[styles.checkLabel, checked && styles.checkLabelActive]}>
            {label}
          </Text>
        </View>
      </Pressable>

      {checked && (
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={(t) => onChange(index, checked, t)}
          placeholder="Brief evidence / note…"
          placeholderTextColor={THEME.textMuted}
          multiline
        />
      )}
    </View>
  );
}

export default function ViabilityCheck({ state, onChange }: Props) {
  const yesCount = state.checks.filter(Boolean).length;

  let result: {
    label: string;
    sublabel: string;
    color: string;
    icon: "check-circle" | "alert-circle" | "x-circle";
  };

  if (yesCount >= 4) {
    result = {
      label: "Adopt Immediately",
      sublabel: "Ethical/strategic imperative met.",
      color: QUADRANT.required,
      icon: "check-circle",
    };
  } else if (yesCount === 3) {
    result = {
      label: "Conditional Adoption",
      sublabel: "Proceed only after addressing the missing condition(s).",
      color: QUADRANT.discouraged,
      icon: "alert-circle",
    };
  } else {
    result = {
      label: "Defer or Reject",
      sublabel: "Viability risk too high — revise or do not proceed.",
      color: QUADRANT.prohibited,
      icon: "x-circle",
    };
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: Colors.light.tint }]} />
        <Text style={styles.sectionLabel}>Conditional Adoption Filter</Text>
        <Text style={[styles.countBadge, { color: Colors.light.tint }]}>
          {yesCount}/5
        </Text>
      </View>

      <Text style={styles.caption}>
        Apply only to ENCOURAGED actions (or high-cost REQUIRED). This filter ensures bold ethical choices remain viable and pragmatic — as modeled by Costco's phased benefit expansions and In-N-Out's disciplined integrity practices.
      </Text>

      <View style={[styles.infoBox, { borderColor: Colors.light.tint + "30", backgroundColor: Colors.light.tint + "0D" }]}>
        <Feather name="info" size={13} color={Colors.light.tint} />
        <Text style={[styles.infoText, { color: Colors.light.tint }]}>
          Answer Yes/No below. Provide a brief note explaining your reasoning for each checked item.
        </Text>
      </View>

      {/* Questions */}
      {FILTER_QUESTIONS.map((q, i) => (
        <CheckRow
          key={i}
          label={q}
          number={i + 1}
          checked={state.checks[i]}
          note={state.notes[i]}
          index={i}
          onChange={onChange}
        />
      ))}

      {/* Result Banner */}
      <View
        style={[
          styles.result,
          { backgroundColor: result.color + "15", borderColor: result.color + "50" },
        ]}
      >
        <View style={styles.resultTop}>
          <Feather name={result.icon} size={20} color={result.color} />
          <View style={styles.resultText}>
            <Text style={[styles.resultLabel, { color: result.color }]}>
              {result.label}
            </Text>
            <Text style={styles.resultSublabel}>{result.sublabel}</Text>
          </View>
          <View style={[styles.countPill, { backgroundColor: result.color + "22", borderColor: result.color + "44" }]}>
            <Text style={[styles.countPillText, { color: result.color }]}>{yesCount}/5</Text>
          </View>
        </View>
      </View>

      {/* Principle tie-in */}
      <Text style={styles.principleNote}>
        <Text style={styles.principleNoteLabel}>Principle tie-in: </Text>
        High yes-count strengthens Viability, Accountability, Transparency, Fairness, and Respect while preserving long-term free-market sustainability.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  countBadge: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  checkBlock: {
    gap: 8,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkLabelWrap: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  checkNum: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 1,
  },
  checkLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 20,
    flex: 1,
  },
  checkLabelActive: {
    color: THEME.text,
  },
  noteInput: {
    backgroundColor: THEME.bgInput,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: THEME.text,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    marginLeft: 32,
    textAlignVertical: "top",
  },
  result: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  resultText: {
    flex: 1,
    gap: 2,
  },
  resultLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  resultSublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: THEME.textSecondary,
    lineHeight: 17,
  },
  countPill: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countPillText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  principleNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: THEME.textMuted,
    lineHeight: 18,
  },
  principleNoteLabel: {
    fontFamily: "Inter_600SemiBold",
    color: THEME.textSecondary,
  },
});
