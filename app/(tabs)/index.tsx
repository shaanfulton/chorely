import React from "react";
import { ScrollView, StyleSheet } from "react-native";

import { ChoreList } from "@/components/ChoreList";
import { PointsDashboard } from "@/components/PointsDashboard";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <PointsDashboard />
        <ChoreList />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
