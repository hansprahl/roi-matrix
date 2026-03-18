import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Evaluation,
  loadEvaluations,
  deleteEvaluation,
  shareEvaluation,
} from "@/lib/storage";
import Colors from "@/constants/colors";

export default function HistoryScreen() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadEvaluations().then((data) => {
        if (active) {
          setEvaluations(data);
          setLoading(false);
        }
      });
      return () => { active = false; };
    }, [])
  );

  function confirmDelete(id: string) {
    Alert.alert(
      "Delete Evaluation",
      "This evaluation will be permanently removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updated = await deleteEvaluation(id);
            setEvaluations(updated);
            if (expanded === id) setExpanded(null);
          },
        },
      ]
    );
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (evaluations.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No saved evaluations yet</Text>
        <Text style={styles.emptyBody}>
          Complete a matrix evaluation on the Matrix tab and tap "Save
          Evaluation" to record it here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={evaluations}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.headerTitle}>Evaluation History</Text>
      }
      renderItem={({ item }) => {
        const isOpen = expanded === item.id;
        return (
          <View style={styles.card}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setExpanded(isOpen ? null : item.id)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.description || "Untitled Evaluation"}
                  </Text>
                  <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View
                  style={[
                    styles.quadrantBadge,
                    {
                      backgroundColor: item.quadrantColor + "22",
                      borderColor: item.quadrantColor,
                    },
                  ]}
                >
                  <Text
                    style={[styles.quadrantText, { color: item.quadrantColor }]}
                  >
                    {item.quadrantLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreRow}>
                <Text style={[styles.scoreChip, { color: Colors.benefit }]}>
                  B: {item.benefitScore}/10
                </Text>
                <Text style={[styles.scoreChip, { color: Colors.cost }]}>
                  C: {item.costScore}/10
                </Text>
                {item.filterUsed && (
                  <Text style={[styles.scoreChip, { color: Colors.textMuted }]}>
                    Filter: {item.filterYesCount}/5
                  </Text>
                )}
                <Text style={styles.expandHint}>{isOpen ? "▲ Less" : "▼ More"}</Text>
              </View>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.detail}>
                <View style={styles.divider} />

                <Text style={styles.detailHeading}>Benefit Ratings</Text>
                {Object.entries(item.benefitRatings).map(([key, val]) => (
                  <Text key={key} style={styles.detailRow}>
                    · {key}: <Text style={{ color: Colors.benefit }}>{val}</Text>
                  </Text>
                ))}

                <Text style={[styles.detailHeading, { marginTop: 10 }]}>Cost Ratings</Text>
                {Object.entries(item.costRatings).map(([key, val]) => (
                  <Text key={key} style={styles.detailRow}>
                    · {key}: <Text style={{ color: Colors.cost }}>{val}</Text>
                  </Text>
                ))}

                {item.filterUsed && (
                  <>
                    <Text style={[styles.detailHeading, { marginTop: 10 }]}>
                      Conditional Filter Notes
                    </Text>
                    {item.filterNotes.map((note, i) =>
                      note?.trim() ? (
                        <Text key={i} style={styles.detailRow}>
                          {i + 1}. {note}
                        </Text>
                      ) : null
                    )}
                  </>
                )}

                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => shareEvaluation(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.shareBtnText}>Share Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    padding: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  emptyBody: {
    color: Colors.textMuted,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  list: {
    backgroundColor: Colors.background,
    padding: 16,
    gap: 12,
    paddingBottom: 48,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardDate: {
    color: Colors.textMuted,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  quadrantBadge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quadrantText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  scoreChip: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  expandHint: {
    marginLeft: "auto",
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  detailHeading: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailRow: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  detailActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.primary + "22",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  shareBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: {
    backgroundColor: "#ef444422",
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  deleteBtnText: {
    color: "#ef4444",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
