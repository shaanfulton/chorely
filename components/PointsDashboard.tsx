import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const exampleData = {
  points: 55,
  totalPoints: 100,
};

export function PointsDashboard() {
  const { points, totalPoints } = exampleData;
  const percentage = (points / totalPoints) * 100;
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100; // 2 * PI * 40

  return (
    <ThemedView style={styles.container}>
      <View style={styles.progressContainer}>
        <Svg width="100" height="100" viewBox="0 0 100 100">
          <Circle
            cx="50"
            cy="50"
            r="40"
            stroke="#e6e6e6"
            strokeWidth="10"
            fill="transparent"
          />
          <Circle
            cx="50"
            cy="50"
            r="40"
            stroke="#FDBF50"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </Svg>
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="title">{`${points}/${totalPoints}`}</ThemedText>
        <ThemedText type="subtitle">Weekly Points</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  progressContainer: {
    width: 100,
    height: 100,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
  },
});
