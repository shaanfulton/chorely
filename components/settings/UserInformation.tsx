import { ThemedText } from "@/components/ThemedText";
import { useGlobalChores } from "@/context/ChoreContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function UserInformation() {
  const { currentUser, currentHome } = useGlobalChores();

  return (
    <View style={styles.section}>
      <ThemedText style={styles.greeting}>
        Hi {currentUser?.name || "Guest"},
      </ThemedText>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>
            {currentUser?.email || "Not logged in"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Current Home:</Text>
          <Text style={styles.infoValue}>
            {currentHome?.name || "None selected"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
});
