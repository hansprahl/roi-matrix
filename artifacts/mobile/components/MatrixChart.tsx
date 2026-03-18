import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Rect,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";

import Colors from "@/constants/colors";

const { THEME, QUADRANT } = Colors;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  benefitScore: number;
  costScore: number;
}

const SIZE = 280;
const PAD = 36;
const CHART = SIZE - PAD * 2;

function scoreToX(cost: number) {
  return PAD + (cost / 10) * CHART;
}

function scoreToY(benefit: number) {
  return PAD + ((10 - benefit) / 10) * CHART;
}

export default function MatrixChart({ benefitScore, costScore }: Props) {
  const cx = useSharedValue(scoreToX(costScore));
  const cy = useSharedValue(scoreToY(benefitScore));

  useEffect(() => {
    cx.value = withSpring(scoreToX(costScore), { damping: 18, stiffness: 200 });
    cy.value = withSpring(scoreToY(benefitScore), { damping: 18, stiffness: 200 });
  }, [costScore, benefitScore]);

  const animatedProps = useAnimatedProps(() => ({
    cx: cx.value,
    cy: cy.value,
  }));

  const threshX = PAD + (5.5 / 10) * CHART;
  const threshY = PAD + ((10 - 5.5) / 10) * CHART;

  const LABEL_STYLE = { fontSize: 9, fontWeight: "bold" as const, letterSpacing: 0.4 };

  return (
    <View style={styles.wrapper}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Defs>
          <LinearGradient id="reqGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={QUADRANT.required} stopOpacity="0.25" />
            <Stop offset="1" stopColor={QUADRANT.required} stopOpacity="0.08" />
          </LinearGradient>
          <LinearGradient id="encGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={QUADRANT.encouraged} stopOpacity="0.2" />
            <Stop offset="1" stopColor={QUADRANT.encouraged} stopOpacity="0.06" />
          </LinearGradient>
          <LinearGradient id="disGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={QUADRANT.discouraged} stopOpacity="0.2" />
            <Stop offset="1" stopColor={QUADRANT.discouraged} stopOpacity="0.06" />
          </LinearGradient>
          <LinearGradient id="proGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={QUADRANT.prohibited} stopOpacity="0.25" />
            <Stop offset="1" stopColor={QUADRANT.prohibited} stopOpacity="0.08" />
          </LinearGradient>
        </Defs>

        {/* Background quadrant fills */}
        {/* Top-Left: REQUIRED (green) */}
        <Rect x={PAD} y={PAD} width={threshX - PAD} height={threshY - PAD} fill="url(#reqGrad)" rx={4} />
        {/* Top-Right: ENCOURAGED (blue) */}
        <Rect x={threshX} y={PAD} width={SIZE - PAD - threshX} height={threshY - PAD} fill="url(#encGrad)" rx={4} />
        {/* Bottom-Left: DISCOURAGED (orange) */}
        <Rect x={PAD} y={threshY} width={threshX - PAD} height={SIZE - PAD - threshY} fill="url(#disGrad)" rx={4} />
        {/* Bottom-Right: PROHIBITED (red) */}
        <Rect x={threshX} y={threshY} width={SIZE - PAD - threshX} height={SIZE - PAD - threshY} fill="url(#proGrad)" rx={4} />

        {/* Border */}
        <Rect
          x={PAD} y={PAD}
          width={CHART} height={CHART}
          fill="none"
          stroke={THEME.border}
          strokeWidth={1}
          rx={4}
        />

        {/* Threshold dashed lines */}
        <Line
          x1={threshX} y1={PAD}
          x2={threshX} y2={PAD + CHART}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeDasharray="4,3"
          strokeOpacity={0.2}
        />
        <Line
          x1={PAD} y1={threshY}
          x2={PAD + CHART} y2={threshY}
          stroke="#FFFFFF"
          strokeWidth={1}
          strokeDasharray="4,3"
          strokeOpacity={0.2}
        />

        {/* Quadrant labels */}
        <G opacity={0.65}>
          <SvgText x={PAD + 6} y={PAD + 13} fill={QUADRANT.required} {...LABEL_STYLE}>REQUIRED</SvgText>
          <SvgText x={threshX + 6} y={PAD + 13} fill={QUADRANT.encouraged} {...LABEL_STYLE}>ENCOURAGED</SvgText>
          <SvgText x={PAD + 6} y={SIZE - PAD - 6} fill={QUADRANT.discouraged} {...LABEL_STYLE}>DISCOURAGED</SvgText>
          <SvgText x={threshX + 6} y={SIZE - PAD - 6} fill={QUADRANT.prohibited} {...LABEL_STYLE}>PROHIBITED</SvgText>
        </G>

        {/* Axis tick marks */}
        {[0, 2, 4, 6, 8, 10].map((val) => {
          const x = PAD + (val / 10) * CHART;
          const y = PAD + ((10 - val) / 10) * CHART;
          return (
            <G key={val}>
              <Line x1={x} y1={PAD + CHART} x2={x} y2={PAD + CHART + 4} stroke={THEME.textMuted} strokeWidth={1} />
              <SvgText x={x} y={SIZE - 6} textAnchor="middle" fill={THEME.textMuted} fontSize={8}>{val}</SvgText>
              <Line x1={PAD - 4} y1={y} x2={PAD} y2={y} stroke={THEME.textMuted} strokeWidth={1} />
              <SvgText x={PAD - 8} y={y + 3} textAnchor="end" fill={THEME.textMuted} fontSize={8}>{val}</SvgText>
            </G>
          );
        })}

        {/* Axis labels */}
        <SvgText
          x={PAD + CHART / 2}
          y={SIZE - 1}
          textAnchor="middle"
          fill={THEME.textSecondary}
          fontSize={9}
          fontWeight="600"
        >
          COST
        </SvgText>
        <SvgText
          x={10}
          y={PAD + CHART / 2}
          textAnchor="middle"
          fill={THEME.textSecondary}
          fontSize={9}
          fontWeight="600"
          rotation={-90}
          originX={10}
          originY={PAD + CHART / 2}
        >
          BENEFIT
        </SvgText>

        {/* Animated dot shadow */}
        <AnimatedCircle
          animatedProps={animatedProps}
          r={14}
          fill={Colors.light.tint}
          opacity={0.15}
        />

        {/* Animated dot */}
        <AnimatedCircle
          animatedProps={animatedProps}
          r={8}
          fill={Colors.light.tint}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      </Svg>

      <View style={styles.scores}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreVal, { color: QUADRANT.required }]}>{benefitScore}</Text>
          <Text style={styles.scoreKey}>Benefit</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreVal, { color: QUADRANT.prohibited }]}>{costScore}</Text>
          <Text style={styles.scoreKey}>Cost</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: THEME.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 12,
    marginTop: 16,
  },
  svg: {},
  scores: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 4,
    paddingBottom: 4,
  },
  scoreItem: {
    alignItems: "center",
  },
  scoreVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    lineHeight: 26,
  },
  scoreKey: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: THEME.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.border,
  },
});
