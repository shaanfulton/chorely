import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";

interface PointTagProps {
  points: number;
  size?: "small" | "medium" | "large";
  variant?: "default" | "light" | "dark";
}

export function PointTag({
  points,
  size = "small",
  variant = "default",
}: PointTagProps) {
  const containerStyle = [
    styles.container,
    styles[`${size}Container`],
    styles[`${variant}Container`],
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    styles[`${variant}Text`],
  ];

  return (
    <View style={containerStyle}>
      <ThemedText style={textStyle}>
        {points} {size === "large" ? "points" : "pts"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    justifyContent: "center",
    alignItems: "center",
  },

  // Size variants
  smallContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  mediumContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  largeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },

  // Color variants
  defaultContainer: {
    backgroundColor: "#f0f8ff",
    borderColor: "#4a90e2",
  },
  lightContainer: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
  },
  darkContainer: {
    backgroundColor: "#374151",
    borderColor: "#4b5563",
  },

  // Base text styles
  text: {
    fontWeight: "600",
  },

  // Size text variants
  smallText: {
    fontSize: 11,
  },
  mediumText: {
    fontSize: 13,
  },
  largeText: {
    fontSize: 15,
  },

  // Color text variants
  defaultText: {
    color: "#4a90e2",
  },
  lightText: {
    color: "#666",
  },
  darkText: {
    color: "#f9fafb",
  },
});
