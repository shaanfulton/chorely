import { ChoreClaimButton } from "@/components/ChoreClaimButton";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import { Chore, getAvailableChores } from "@/data/mock";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export function AvailableChoreList() {
  const [chores, setChores] = useState<Chore[]>([]);

  useEffect(() => {
    setChores(getAvailableChores());
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Available Chores</ThemedText>
      {chores.map((chore) => (
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
});
