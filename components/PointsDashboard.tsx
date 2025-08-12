import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { CompletedChoresModal } from "./CompletedChoresModal";

export function PointsDashboard() {
  const { userPoints, currentHome } = useGlobalChores();
  const [modalVisible, setModalVisible] = useState(false);

  // Use the current home's weekly point quota as the denominator
  const totalPoints = currentHome?.weeklyPointQuota || 100;
  const points = userPoints;
  const percentage = Math.min((points / totalPoints) * 100, 100); // Cap at 100%
  const strokeDashoffset = 251.2 - (251.2 * percentage) / 100; // 2 * PI * 40

  // Determine color based on progress
  const getProgressColor = () => {
    if (percentage >= 100) {
      return Colors.metro.green; // Green for 100%
    } else if (percentage >= 33.33) {
      return Colors.metro.yellow; // Yellow for 33%-99%
    } else {
      return Colors.metro.red; // Red for under 33%
    }
  };

  const progressColor = getProgressColor();

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
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
              stroke={progressColor}
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
          <ThemedText style={styles.tapHint} type="subtitle">
            Tap for completed chores
          </ThemedText>
        </View>
      </TouchableOpacity>

      <CompletedChoresModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
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
    marginRight: 10,
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
  tapHint: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
});
