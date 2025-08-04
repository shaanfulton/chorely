import { CenterModal } from "@/components/CenterModal";
import { Checklist } from "@/components/Checklist";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChecklistProvider, useChecklist } from "@/context/ChecklistContext";
import { Chore, TodoItem, getChoreByIdAPI } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

function ChoreViewContent() {
  const router = useRouter();
  const { uuid } = useLocalSearchParams();
  const [chore, setChore] = useState<Chore | null>(null);
  const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);
  const { isAllCompleted, resetCompleted } = useChecklist();

  useEffect(() => {
    if (uuid) {
      const foundChore = getChoreByIdAPI(uuid as string);
      setChore(foundChore ?? null);
      resetCompleted();
    }
  }, [uuid, resetCompleted]);

  if (!chore) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chore not found</ThemedText>
      </ThemedView>
    );
  }

  const allTasksCompleted = isAllCompleted(chore.todos.length);
  const IconComponent = getLucideIcon(chore.icon);

  return (
    <ThemedView style={styles.container}>
      <IconComponent size={64} color="#666" />
      <ThemedText style={styles.title}>{chore.name}</ThemedText>
      <Checklist items={chore.todos} onItemPress={setSelectedItem} />
      {selectedItem && (
        <CenterModal
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        >
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {selectedItem.name}
            </ThemedText>
            <ThemedText>{selectedItem.description}</ThemedText>
          </ThemedView>
        </CenterModal>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, !allTasksCompleted && styles.disabledButton]}
          disabled={!allTasksCompleted}
          onPress={() => router.push(`/chore-validate?uuid=${uuid}`)}
        >
          <ThemedText style={styles.buttonText}>Validate Chore</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

export default function ChoreView() {
  return (
    <ChecklistProvider>
      <ChoreViewContent />
    </ChecklistProvider>
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
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    width: "100%",
    padding: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
