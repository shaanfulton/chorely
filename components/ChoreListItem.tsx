import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getLucideIcon } from "@/utils/iconUtils";
import React from "react";
import { StyleSheet, View } from "react-native";

export function ChoreListItem({
  chore,
}: {
  chore: { name: string; time: string; icon: string };
}) {
  // Get the lucide icon component using utility function
  const IconComponent = getLucideIcon(chore.icon);
  return (
    <ThemedView style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent size={24} color="#666" />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold">{chore.name}</ThemedText>
        <ThemedText type="default">{chore.time}</ThemedText>
      </View>
      <View style={styles.checkmarkContainer}>
        {/* Placeholder for checkmark */}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: "#F5F5F5", // Example color
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0E0E0", // Example color
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  checkmarkContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "green", // Example color
  },
});
