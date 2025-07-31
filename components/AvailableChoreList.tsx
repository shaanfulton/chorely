import { ChoreClaimButton } from "@/components/ChoreClaimButton";
import { ChoreListItem } from "@/components/ChoreListItem";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { StyleSheet, View } from "react-native";

const AVAILABLE_CHORES = [
  { name: "Organizing", time: "1h 15m", icon: "package" },
  { name: "Dusting", time: "25m", icon: "feather" },
  { name: "Mopping", time: "35m", icon: "droplets" },
  { name: "Taking out trash", time: "10m", icon: "trash-2" },
];

export function AvailableChoreList() {
  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Available Chores</ThemedText>
      {AVAILABLE_CHORES.map((chore, index) => (
        <ChoreListItem key={index} chore={chore}>
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
