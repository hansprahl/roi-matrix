import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import Colors from "@/constants/colors";

const { THEME, QUADRANT } = Colors;

export const VIABILITY_QUESTIONS = [
  "Does this action align with our stated values and integrity commitments?",
  "Will key stakeholders (employees, customers, community) view this as fair and respectful?",
  "Is this action legally compliant and consistent with the Rule of Law?",
  "Does this support long-term financial and operational viability?",
  "Can we be fully transparent about this decision without reputational risk?",
];

interface Props {
  checks: boolean[];
  onChange: (index: number, value: boolean) => void;
}

function CheckRow({
  label,
  checked,
  index,
  onChange,
}: {
  label: string;
  checked: boolean;
  index: number;
  onChange: (i: number, v: boolean) => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(index, !checked);
  }, [checked, index, onChange]);

  return (
    <Pressable onPress={handlePress} style={styles.checkRow}>
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
      <Text style={[styles.checkLabel, checked && styles.checkLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ViabilityCheck({ checks, onChange }: Props) {
  const yesCount = checks.filter(Boolean).length;

  let result: {
    label: string;
    sublabel: string;
    color: string;
    icon: "check-circle" | "alert-circle" | "x-circle";
  };

  if (yesCount >= 4) {
    result = {
      label: "Adopt Immediately",
      sublabel: `${yesCount}/5 criteria met`,
      color: QUADRANT.required,
      icon: "check-circle",
    };
  } else if (yesCount === 3) {
    result = {
      label: "Conditional Adoption",
      sublabel: `${yesCount}/5 — address the missing item(s)`,
      color: QUADRANT.discouraged,
      icon: "alert-circle",
    };
  } else {
    result = {
      label: "Defer or Reject",
      sublabel: `${yesCount}/5 — viability risk too high`,
      color: QUADRANT.prohibited,
      icon: "x-circle",
    };
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: Colors.light.tint }]} />
        <Text style={styles.sectionLabel}>Viability Checks</Text>
        <Text style={[styles.countBadge, { color: Colors.light.tint }]}>
          {yesCount}/5
        </Text>
      </View>

      {VIABILITY_QUESTIONS.map((q, i) => (
        <CheckRow
          key={i}
          label={q}
          checked={checks[i]}
          index={i}
          onChange={onChange}
        />
      ))}

      {/* Result Banner */}
      <View
        style={[
          styles.result,
          {
            backgroundColor: result.color + "15",
            borderColor: result.color + "50",
          },
        ]}
      >
        <Feather name={result.icon} size={20} color={result.color} />
        <View style={styles.resultText}>
          <Text style={[styles.resultLabel, { color: result.color }]}>
            {result.label}
          </Text>
          <Text style={styles.resultSublabel}>{result.sublabel}</Text>
        </View>
      </View>
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
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  result: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
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
    color: THEME.textMuted,
  },
});
