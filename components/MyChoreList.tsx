import { ChoreCompletionButton } from "@/components/ChoreCompletionButton";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import { Chore, getMyChores } from "@/data/mock";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

export function MyChoreList() {
  const [chores, setChores] = useState<Chore[]>([]);

  useEffect(() => {
    setChores(getMyChores());
  }, []);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">My Chores</ThemedText>
      {chores.map((chore) => (
        <ChoreListItem key={chore.uuid} chore={chore}>
          <ChoreCompletionButton />
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
