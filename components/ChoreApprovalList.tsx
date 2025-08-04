import { useGlobalChores } from "@/context/ChoreContext";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ApprovalListItem } from "./ApprovalListItem";
import { ChoreApproveButton } from "./ChoreApproveButton";
import { ThemedText } from "./ThemedText";

export function ChoreApprovalList() {
  const { pendingApprovalChores, isLoading } = useGlobalChores();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Approve New Chores</ThemedText>
      {pendingApprovalChores.map((chore) => (
        <ApprovalListItem key={chore.uuid} chore={chore}>
          <ChoreApproveButton choreId={chore.uuid} />
        </ApprovalListItem>
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
