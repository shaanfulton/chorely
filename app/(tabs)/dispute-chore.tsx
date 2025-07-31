import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function DisputeChoreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80, // Safe area + tab bar height
          padding: 20,
        }}
      >
        <ThemedText type="title" style={styles.title}>
          Dispute Chore
        </ThemedText>

        <ThemedText type="subtitle" style={styles.subtitle}>
          Report an issue with a chore
        </ThemedText>

        <ThemedView style={styles.placeholderContent}>
          <ThemedText style={styles.placeholderText}>
            This is a placeholder for the dispute chore functionality.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
    opacity: 0.7,
  },
  placeholderContent: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  placeholderText: {
    marginBottom: 15,
    lineHeight: 24,
  },
  bulletPoint: {
    marginBottom: 8,
    marginLeft: 10,
    lineHeight: 20,
  },
});
