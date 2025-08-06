import { Button } from "@/components/Button";
import { CenterModal } from "@/components/CenterModal";
import { Checklist } from "@/components/Checklist";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { ChecklistProvider, useChecklist } from "@/context/ChecklistContext";
import { ChoreProvider, useGlobalChores } from "@/context/ChoreContext";
import {
  Chore,
  TodoItem,
  getChoreByIdAPI,
  getCurrentUserEmail,
} from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { getTimeRemaining } from "@/utils/timeUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

function ChoreViewContent({ chore }: { chore: Chore }) {
  const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);
  const { isAllCompleted, resetCompleted } = useChecklist();
  const { claimChore, approveChore } = useGlobalChores();
  const router = useRouter();
  const currentUserEmail = getCurrentUserEmail();
  const [isClaimingChore, setIsClaimingChore] = useState(false);
  const [isApprovingChore, setIsApprovingChore] = useState(false);
  const [isNavigatingToValidation, setIsNavigatingToValidation] =
    useState(false);

  useEffect(() => {
    resetCompleted();
  }, [resetCompleted]);

  const IconComponent = getLucideIcon(chore.icon);
  const timeRemaining = getTimeRemaining(chore.time);
  const allTasksCompleted = isAllCompleted(chore.todos.length);

  const handleClaimChore = async () => {
    try {
      setIsClaimingChore(true);
      await claimChore(chore.uuid);
    } catch (error) {
      console.error("Failed to claim chore:", error);
    } finally {
      setIsClaimingChore(false);
    }
  };

  const handleVerifyChore = async () => {
    if (chore && chore.status === "claimed") {
      try {
        setIsNavigatingToValidation(true);
        // Navigate to validation screen
        router.push(`/chore-validate?uuid=${chore.uuid}`);
      } finally {
        setIsNavigatingToValidation(false);
      }
    }
  };

  const handleApproveChore = async () => {
    try {
      setIsApprovingChore(true);
      await approveChore(chore.uuid);
      // Navigate back to home after approval
      router.push("/");
    } catch (error) {
      console.error("Failed to approve chore:", error);
    } finally {
      setIsApprovingChore(false);
    }
  };

  // Determine what to render based on chore ownership and status
  const getButtonContent = () => {
    // If chore is unapproved - show approve button
    if (chore.status === "unapproved") {
      return (
        <Button
          title="Approve"
          backgroundColor={Colors.metro.green}
          loadingBackgroundColor={Colors.metro.teal}
          isLoading={isApprovingChore}
          onPress={handleApproveChore}
          size="medium"
        />
      );
    }

    // If chore is claimed and owned by current user - show validate button (only if tasks completed)
    if (chore.status === "claimed" && chore.user_email === currentUserEmail) {
      if (!allTasksCompleted) {
        return (
          <ThemedView style={styles.infoContainer}>
            <ThemedText style={styles.infoText}>
              Complete All Tasks First
            </ThemedText>
          </ThemedView>
        );
      }
      return (
        <Button
          title="Verify"
          backgroundColor={Colors.metro.blue}
          isLoading={isNavigatingToValidation}
          onPress={handleVerifyChore}
          size="medium"
        />
      );
    }

    // If chore is unclaimed (approved but not claimed) - show claim button
    if (chore.status === "unclaimed" && chore.user_email === null) {
      return (
        <Button
          title="Claim"
          backgroundColor={Colors.metro.gray}
          loadingBackgroundColor={Colors.metro.green}
          isLoading={isClaimingChore}
          onPress={handleClaimChore}
          size="medium"
        />
      );
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

    // Default case - show info message
    return (
      <ThemedView style={styles.infoContainer}>
        <ThemedText style={styles.infoText}>Chore Not Available</ThemedText>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <IconComponent size={64} color="#666" />
      <ThemedText style={styles.title}>{chore.name}</ThemedText>
      <View style={styles.timeDisplay}>
        <Clock size={18} color={timeRemaining.color} />
        <ThemedText style={[styles.timeText, { color: timeRemaining.color }]}>
          {timeRemaining.text}
        </ThemedText>
      </View>
      <Checklist
        items={chore.todos}
        onItemPress={setSelectedItem}
        disabled={
          chore.status !== "claimed" || chore.user_email !== currentUserEmail
        }
      />
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
    marginBottom: 10,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timeText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
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
  infoContainer: {
    backgroundColor: "#E3F2FD",
    borderColor: "#BBDEFB",
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  infoText: {
    color: "#1565C0",
    fontWeight: "600",
    textAlign: "center",
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
