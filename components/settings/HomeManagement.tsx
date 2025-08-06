import { ThemedText } from "@/components/ThemedText";
import { CreateHomeForm } from "@/components/settings/CreateHomeForm";
import { JoinHomeForm } from "@/components/settings/JoinHomeForm";
import React from "react";
import { StyleSheet, View } from "react-native";

interface HomeManagementProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function HomeManagement({
  isLoading,
  setIsLoading,
}: HomeManagementProps) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Home Management</ThemedText>

      <JoinHomeForm isLoading={isLoading} setIsLoading={setIsLoading} />
      <CreateHomeForm isLoading={isLoading} setIsLoading={setIsLoading} />
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
    marginBottom: 8,
  },
});
