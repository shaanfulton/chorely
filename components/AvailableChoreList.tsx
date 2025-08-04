import { ChoreClaimButton } from "@/components/ChoreClaimButton";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import { useGlobalChores } from "@/context/ChoreContext";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function AvailableChoreList() {
  const { availableChores, isLoading } = useGlobalChores();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Available Chores</ThemedText>
      {availableChores.map((chore) => (
        <ChoreListItem key={chore.uuid} chore={chore}>
          <ChoreClaimButton />
        </ChoreListItem>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
