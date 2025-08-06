import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AvailableChoreList } from "@/components/AvailableChoreList";
import { ChoreApprovalList } from "@/components/ChoreApprovalList";
import { Header } from "@/components/Header";
import { MyChoreList } from "@/components/MyChoreList";
import { PointsDashboard } from "@/components/PointsDashboard";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { error, clearError, refreshAllData, isRefreshing } = useGlobalChores();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={clearError}
            style={styles.errorCloseButton}
          >
            <Text style={styles.errorCloseText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <Header />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80, // Safe area + tab bar height
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshAllData}
          />
        }
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
  errorBanner: {
    backgroundColor: "#ff6b6b",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  errorCloseButton: {
    padding: 4,
  },
  errorCloseText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
