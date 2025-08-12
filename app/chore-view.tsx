import { Button } from "@/components/Button";
import { CenterModal } from "@/components/CenterModal";
import { Checklist } from "@/components/Checklist";
import { PointTag } from "@/components/PointTag";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { ChecklistProvider, useChecklist } from "@/context/ChecklistContext";
import { ChoreProvider, useGlobalChores } from "@/context/ChoreContext";
import {
  Chore,
  TodoItem,
  getChoreByIdAPI,
} from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { getTimeRemaining } from "@/utils/timeUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text } from "react-native";

function ChoreViewContent({ chore }: { chore: Chore | null }) {
  // Early return if chore is not available
  if (!chore) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Chore not found or loading...</Text>
      </View>
    );
  }

  const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);
  const { isAllCompleted, resetCompleted } = useChecklist();
  const {
    claimChore,
    voteForChore,
    removeVoteForChore,
    getChoreApprovalStatus,
    currentUser,
    pendingApprovalChores,
  } = useGlobalChores();

  console.log("ChoreViewContent render:", {
    choreUuid: chore.uuid,
    choreStatus: chore.status,
    pendingApprovalChoresCount: pendingApprovalChores.length,
    pendingApprovalChores: pendingApprovalChores.map(c => ({
      uuid: c.uuid,
      approvalList: c.approvalList
    }))
  });
  const router = useRouter();
  const currentUserEmail = currentUser?.email;
  const [isClaimingChore, setIsClaimingChore] = useState(false);
  const [isVotingChore, setIsVotingChore] = useState(false);
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
    if (isNavigatingToValidation) return; // guard against double taps
    if (chore && chore.status === "claimed") {
      try {
        setIsNavigatingToValidation(true);
        // Navigate to validation screen
        router.push(`/chore-validate?uuid=${chore.uuid}`);
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        setIsNavigatingToValidation(false);
      }
    } else {
      // no-op if not claimable
    }
  };

  const handleVoteToggle = async () => {
    if (!currentUser) return;

    try {
      setIsVotingChore(true);
      
      // Calculate current vote status from local state
      const choreInPending = pendingApprovalChores.find(c => c.uuid === chore.uuid);
      const hasVoted = choreInPending?.approvalList?.includes(currentUser.email) || false;

      console.log("handleVoteToggle called:", {
        choreUuid: chore.uuid,
        choreInPending: !!choreInPending,
        approvalList: choreInPending?.approvalList,
        currentUserEmail: currentUser.email,
        hasVoted
      });

      if (hasVoted) {
        // User has already voted, remove their vote
        console.log("Removing vote for chore:", chore.uuid);
        await removeVoteForChore(chore.uuid);
      } else {
        // User hasn't voted yet, add their vote
        console.log("Adding vote for chore:", chore.uuid);
        const success = await voteForChore(chore.uuid);
        // If the chore got approved (status changed), navigate back to home
        if (success) {
          // Check if chore was moved to available (approved)
          const choreStillPending = pendingApprovalChores.find(c => c.uuid === chore.uuid);
          if (!choreStillPending) {
            router.push("/");
          }
        }
      }
    } catch (error) {
      console.error("Failed to toggle vote:", error);
    } finally {
      setIsVotingChore(false);
    }
  };

  // Determine what to render based on chore ownership and status
  const getButtonContent = () => {
    // If chore is unapproved - show voting button
    if (chore.status === "unapproved") {
      // Check if user has voted from local state
      const choreInPending = pendingApprovalChores.find(c => c.uuid === chore.uuid);
      const hasVoted = choreInPending?.approvalList?.includes(currentUser?.email || "") || false;
      
      console.log("Button state for chore:", chore.uuid, {
        choreInPending: !!choreInPending,
        approvalList: choreInPending?.approvalList,
        currentUserEmail: currentUser?.email,
        hasVoted,
        buttonTitle: hasVoted ? "Remove Vote" : "Vote to Approve",
        buttonColor: hasVoted ? "orange" : "green"
      });
      
      return (
        <View style={{ alignItems: "center" }}>
          <Button
            title={hasVoted ? "Remove Vote" : "Vote to Approve"}
            backgroundColor={hasVoted ? Colors.metro.orange : Colors.metro.green}
            loadingBackgroundColor={Colors.metro.teal}
            isLoading={isVotingChore}
            onPress={handleVoteToggle}
            size="medium"
          />
        </View>
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
      {chore.status !== "unapproved" && (
        <View style={styles.timeDisplay}>
          <Clock size={18} color={timeRemaining.color} />
          <ThemedText style={[styles.timeText, { color: timeRemaining.color }]}>
            {timeRemaining.text}
          </ThemedText>
        </View>
      )}
      {chore.status !== "unapproved" && (
        <View style={styles.pointsDisplay}>
          <PointTag points={chore.points} size="medium" />
        </View>
      )}
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
    const fetchChore = async () => {
      if (uuid) {
        try {
          const foundChore = await getChoreByIdAPI(uuid as string);
          setChore(foundChore ?? null);
        } catch (error) {
          console.error("Failed to fetch chore:", error);
          setChore(null);
        }
      }
    };
    
    fetchChore();
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
    marginBottom: 10,
  },
  timeText: {
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
  pointsDisplay: {
    alignItems: "center",
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
  errorText: {
    color: "#D32F2F",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
