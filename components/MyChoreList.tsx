import { ChoreCompletionButton } from "@/components/ChoreCompletionButton";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";

const MY_CHORES = [
  { name: "Sweeping", time: "12h 10m", icon: "brush" },
  { name: "Washing Dishes", time: "30m", icon: "droplets" },
  { name: "Vacuum", time: "45m", icon: "wind" },
  { name: "Laundry", time: "2h", icon: "shirt" },
];

export function MyChoreList() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">My Chores</ThemedText>
      {MY_CHORES.map((chore, index) => (
        <ChoreListItem key={index} chore={chore}>
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
