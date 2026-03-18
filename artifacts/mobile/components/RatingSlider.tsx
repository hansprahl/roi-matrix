import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";

const { THEME } = Colors;

interface Props {
  label: string;
  value: number;
  color: string;
  onChange: (value: number) => void;
}

const STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function RatingSlider({ label, value, color, onChange }: Props) {
  const handlePress = useCallback(
    (v: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(v);
    },
    [onChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <Text style={[styles.valueText, { color }]}>{value}</Text>
      </View>
      <View style={styles.track}>
        {STEPS.map((step) => {
          const active = step <= value;
          return (
            <Pressable
              key={step}
              style={({ pressed }) => [
                styles.pip,
                active
                  ? { backgroundColor: color, opacity: pressed ? 0.7 : 1 }
                  : { backgroundColor: THEME.bgInput, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => handlePress(step)}
              hitSlop={4}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  valueText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    minWidth: 18,
    textAlign: "right",
  },
  track: {
    flexDirection: "row",
    gap: 4,
  },
  pip: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
});
