import { Checklist } from "@/components/Checklist";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Chore, getChoreById } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";

export default function ChoreView() {
  const { uuid } = useLocalSearchParams();
  const [chore, setChore] = useState<Chore | null>(null);

  useEffect(() => {
    if (uuid) {
      const foundChore = getChoreById(uuid as string);
      setChore(foundChore ?? null);
    }
  }, [uuid]);

  if (!chore) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chore not found</ThemedText>
      </ThemedView>
    );
  }

  const IconComponent = getLucideIcon(chore.icon);

  return (
    <ThemedView style={styles.container}>
      <IconComponent size={64} color="#666" />
      <ThemedText style={styles.title}>{chore.name}</ThemedText>
      <Checklist items={chore.todos} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
});
