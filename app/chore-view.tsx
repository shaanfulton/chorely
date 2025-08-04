import { CenterModal } from "@/components/CenterModal";
import { Checklist } from "@/components/Checklist";
import { ChoreClaimButton } from "@/components/ChoreClaimButton";
import { ChoreCompletionButton } from "@/components/ChoreCompletionButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChecklistProvider, useChecklist } from "@/context/ChecklistContext";
import { ChoreProvider } from "@/context/ChoreContext";
import {
  Chore,
  TodoItem,
  getChoreByIdAPI,
  getCurrentUserEmail,
} from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

function ChoreViewContent({ chore }: { chore: Chore }) {
  const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);
  const { isAllCompleted, resetCompleted } = useChecklist();
  const currentUserEmail = getCurrentUserEmail();

  useEffect(() => {
    resetCompleted();
  }, [resetCompleted]);

  const IconComponent = getLucideIcon(chore.icon);
  const allTasksCompleted = isAllCompleted(chore.todos.length);

  // Determine what to render based on chore ownership and status
  const getButtonContent = () => {
    // If chore is claimed and owned by current user - show validate button (only if tasks completed)
    if (chore.status === "claimed" && chore.user_email === currentUserEmail) {
      if (!allTasksCompleted) {
        return (
          <TouchableOpacity
            style={[styles.button, styles.disabledButton]}
            disabled
          >
            <ThemedText style={styles.buttonText}>
              Complete All Tasks First
            </ThemedText>
          </TouchableOpacity>
        );
      }
      return <ChoreCompletionButton />;
    }

    // If chore is unclaimed (approved but not claimed) - show claim button
    if (chore.status === "unclaimed" && chore.user_email === null) {
      return <ChoreClaimButton />;
    }

    // If chore is owned by a different user - show warning
    if (chore.user_email !== null && chore.user_email !== currentUserEmail) {
      return (
        <ThemedView style={styles.warningContainer}>
          <ThemedText style={styles.warningText}>
            This chore is claimed by another user
          </ThemedText>
        </ThemedView>
      );
    }

    // Default case - show disabled validate button (for unapproved chores, etc.)
    return (
      <TouchableOpacity style={[styles.button, styles.disabledButton]} disabled>
        <ThemedText style={styles.buttonText}>Chore Not Available</ThemedText>
      </TouchableOpacity>
    );
  };

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
      <View style={styles.buttonContainer}>{getButtonContent()}</View>
    </ThemedView>
  );
}

export default function ChoreView() {
  const { uuid } = useLocalSearchParams();
  const [chore, setChore] = useState<Chore | null>(null);

  useEffect(() => {
    if (uuid) {
      const foundChore = getChoreByIdAPI(uuid as string);
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

  return (
    <ChoreProvider chore={chore}>
      <ChecklistProvider>
        <ChoreViewContent chore={chore} />
      </ChecklistProvider>
    </ChoreProvider>
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
  warningContainer: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFEAA7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  warningText: {
    color: "#856404",
    fontWeight: "600",
    textAlign: "center",
  },
});
