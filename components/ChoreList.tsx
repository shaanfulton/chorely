import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";

const MY_CHORES = [
  { name: "Sweeping", time: "12h 10m" },
  { name: "Sweeping", time: "12h 10m" },
  { name: "Sweeping", time: "12h 10m" },
];

export function ChoreList() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">My Chores</ThemedText>
      {MY_CHORES.map((chore, index) => (
        <ChoreListItem key={index} chore={chore} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
