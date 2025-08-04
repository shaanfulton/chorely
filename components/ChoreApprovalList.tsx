import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ApprovalListItem } from "./ApprovalListItem";
import { Button } from "./Button";
import { ThemedText } from "./ThemedText";

export function ChoreApprovalList() {
  const { pendingApprovalChores, isLoading, approveChore } = useGlobalChores();
  const [approvingChoreId, setApprovingChoreId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (pendingApprovalChores.length === 0) {
    return null;
  }

  const handleApproveChore = async (choreId: string) => {
    try {
      setApprovingChoreId(choreId);
      await approveChore(choreId);
    } catch (error) {
      console.error("Failed to approve chore:", error);
    } finally {
      setApprovingChoreId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Approve New Chores</ThemedText>
      {pendingApprovalChores.map((chore) => (
        <ApprovalListItem key={chore.uuid} chore={chore}>
          <Button
            title="Approve"
            backgroundColor={Colors.metro.green}
            loadingBackgroundColor={Colors.metro.teal}
            isLoading={approvingChoreId === chore.uuid}
            onPress={() => handleApproveChore(chore.uuid)}
            size="small"
          />
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
