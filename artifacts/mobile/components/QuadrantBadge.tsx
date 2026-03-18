import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import Colors from "@/constants/colors";

const { THEME } = Colors;

interface Quadrant {
  label: string;
  subtitle: string;
  color: string;
  description: string;
}

interface Props {
  quadrant: Quadrant;
  benefitScore: number;
  costScore: number;
}

export default function QuadrantBadge({ quadrant, benefitScore, costScore }: Props) {
  const scale = useSharedValue(0.96);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 280 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [quadrant.label]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderColor: quadrant.color + "55",
          backgroundColor: quadrant.color + "12",
        },
        animStyle,
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.labelBadge, { backgroundColor: quadrant.color + "22", borderColor: quadrant.color + "44" }]}>
          <Text style={[styles.label, { color: quadrant.color }]}>{quadrant.label}</Text>
        </View>
        <Text style={[styles.subtitle, { color: quadrant.color }]}>{quadrant.subtitle}</Text>
      </View>
      <Text style={styles.description}>{quadrant.description}</Text>
      <View style={styles.scores}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreVal, { color: quadrant.color }]}>{benefitScore}</Text>
          <Text style={styles.scoreLabel}>Benefit Score</Text>
        </View>
        <View style={[styles.scoreDivider, { backgroundColor: quadrant.color + "33" }]} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreVal, { color: quadrant.color }]}>{costScore}</Text>
          <Text style={styles.scoreLabel}>Cost Score</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  labelBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: THEME.textSecondary,
    lineHeight: 20,
  },
  scores: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
  },
  scoreVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 30,
  },
  scoreLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: THEME.textMuted,
    letterSpacing: 0.3,
  },
  scoreDivider: {
    width: 1,
    height: 36,
  },
});
