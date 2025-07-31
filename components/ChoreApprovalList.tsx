import { Chore, getUnapprovedChores } from "@/data/mock";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ApprovalListItem } from "./ApprovalListItem";
import { ChoreApproveButton } from "./ChoreApproveButton";
import { ThemedText } from "./ThemedText";

export function ChoreApprovalList() {
  const [chores, setChores] = useState<Chore[]>([]);

  const fetchUnapprovedChores = () => {
    setChores(getUnapprovedChores());
  };

  useEffect(() => {
    setChores(getUnapprovedChores());
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Approve New Chores</ThemedText>
      {chores.map((chore) => (
        <ApprovalListItem key={chore.uuid} chore={chore}>
          <ChoreApproveButton
            choreId={chore.uuid}
            onChoreApproved={fetchUnapprovedChores}
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
});
