import { Button } from "@/components/Button";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function AvailableChoreList() {
  const { availableChores, isLoading, claimChore } = useGlobalChores();
  const [claimingChoreId, setClaimingChoreId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (availableChores.length === 0) {
    return null;
  }

  const handleClaimChore = async (choreId: string) => {
    try {
      setClaimingChoreId(choreId);
      await claimChore(choreId);
    } catch (error) {
      console.error("Failed to claim chore:", error);
    } finally {
      setClaimingChoreId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Available Chores</ThemedText>
      {availableChores.map((chore) => (
        <ChoreListItem key={chore.uuid} chore={chore}>
          <Button
            title="Claim"
            backgroundColor={Colors.metro.gray}
            loadingBackgroundColor={Colors.metro.green}
            isLoading={claimingChoreId === chore.uuid}
            onPress={() => handleClaimChore(chore.uuid)}
            size="small"
          />
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
