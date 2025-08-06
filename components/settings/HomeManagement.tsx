import { ThemedText } from "@/components/ThemedText";
import { router } from "expo-router";
import { Plus, Users } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface HomeManagementProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function HomeManagement({
  isLoading,
  setIsLoading,
}: HomeManagementProps) {
  const handleCreateHome = () => {
    router.push("/create-home");
  };

  const handleJoinHome = () => {
    router.push("/join-home");
  };

  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Add a Home</ThemedText>

      <View style={styles.linkContainer}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleJoinHome}
          disabled={isLoading}
        >
          <Users size={20} color="#007AFF" style={styles.linkIcon} />
          <ThemedText style={styles.linkText}>Join Existing Home</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={handleCreateHome}
          disabled={isLoading}
        >
          <Plus size={20} color="#007AFF" style={styles.linkIcon} />
          <ThemedText style={styles.linkText}>Create New Home</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  linkContainer: {
    gap: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  linkIcon: {
    marginRight: 12,
  },
  linkText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
