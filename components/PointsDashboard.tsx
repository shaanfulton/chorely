import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export function PointsDashboard() {
  const { userPoints, currentHome } = useGlobalChores();

  // Use the current home's weekly point quota as the denominator
  const totalPoints = currentHome?.weeklyPointQuota || 100;
  const points = userPoints;
  const percentage = (points / totalPoints) * 100;
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100; // 2 * PI * 40

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressContainer}>
        <Svg width="120" height="120" viewBox="0 0 120 120">
          <Circle
            cx="60"
            cy="60"
            r="40"
            stroke="#e6e6e6"
            strokeWidth="10"
            fill="transparent"
          />
          <Circle
            cx="60"
            cy="60"
            r="40"
            stroke="#FDBF50"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
          />
        </Svg>
      </View>
      <View style={styles.textContainer}>
        <View style={styles.pointsContainer}>
          <ThemedText style={styles.pointsText} type="title">
            {points}
          </ThemedText>
          <ThemedText style={styles.denominationText} type="title">
            {`/${totalPoints}`}
          </ThemedText>
        </View>

        <ThemedText style={styles.pointSubtitle} type="subtitle">
          Weekly Points
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  progressContainer: {
    width: 120,
    height: 120,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  textContainer: {
    alignItems: "flex-start",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 32,
    marginBottom: 5,
  },
  denominationText: {
    fontSize: 32,
    color: "#AAA",
  },
  pointSubtitle: {
    fontSize: 12,
  },
});
