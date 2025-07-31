import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AvailableChoreList } from "@/components/AvailableChoreList";
import { ChoreApprovalList } from "@/components/ChoreApprovalList";
import { MyChoreList } from "@/components/MyChoreList";
import { PointsDashboard } from "@/components/PointsDashboard";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80, // Safe area + tab bar height
        }}
      >
        <PointsDashboard />
        <ChoreApprovalList />
        <MyChoreList />
        <AvailableChoreList />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
