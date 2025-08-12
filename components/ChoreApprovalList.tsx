import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ApprovalListItem } from "./ApprovalListItem";
import { Button } from "./Button";
import { ThemedText } from "./ThemedText";

export function ChoreApprovalList() {
  const {
    pendingApprovalChores,
    isLoading,
    voteForChore,
    removeVoteForChore,
    getChoreApprovalStatus,
    currentUser,
  } = useGlobalChores();
  const [votingChoreId, setVotingChoreId] = useState<string | null>(null);
  const [approvalStatuses, setApprovalStatuses] = useState<{[key: string]: any}>({});

  // Load approval status from backend for minimal but accurate data
  const loadStatuses = async () => {
    const entries = await Promise.all(
      pendingApprovalChores.map(async (chore) => {
        try {
          const status = await getChoreApprovalStatus(chore.uuid);
          return [chore.uuid, status] as const;
        } catch (e) {
          return [chore.uuid, null] as const;
        }
      })
    );
    const next: {[k: string]: any} = {};
    entries.forEach(([id, st]) => { next[id] = st; });
    setApprovalStatuses(next);
  };

  // Update approval statuses whenever pendingApprovalChores changes
  useEffect(() => {
    if (pendingApprovalChores.length > 0) {
      loadStatuses();
    } else {
      setApprovalStatuses({});
    }
  }, [pendingApprovalChores]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (pendingApprovalChores.length === 0) {
    return null;
  }

  const handleVoteToggle = async (choreId: string) => {
    if (!currentUser) return;

    try {
      setVotingChoreId(choreId);
      const approvalStatus = approvalStatuses[choreId];
      const userHasVoted = approvalStatus?.hasVoted?.[currentUser.email] === true;

      console.log("handleVoteToggle:", {
        choreId,
        approvalStatus,
        currentUserEmail: currentUser.email,
        userHasVoted,
      });

      if (userHasVoted) {
        // User has already voted, remove their vote
        await removeVoteForChore(choreId);
      } else {
        // User hasn't voted yet, add their vote
        await voteForChore(choreId);
      }

      // After action, refresh status for this chore only
      const refreshed = await getChoreApprovalStatus(choreId);
      setApprovalStatuses((prev) => ({ ...prev, [choreId]: refreshed }));
    } catch (error) {
      console.error("Failed to toggle vote:", error);
    } finally {
      setVotingChoreId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">Vote on New Chores</ThemedText>
      {pendingApprovalChores.map((chore) => {
        const approvalStatus = approvalStatuses[chore.uuid];
        const hasUserVoted = approvalStatus?.hasVoted?.[currentUser?.email || ""] === true;
        const votesText = approvalStatus
          ? `${approvalStatus.currentVotes}/${approvalStatus.totalEligibleVoters} votes`
          : "";

        console.log("ChoreApprovalList render:", {
          choreUuid: chore.uuid,
          approvalStatus,
          currentUserEmail: currentUser?.email,
          hasUserVoted,
          hasVoted: approvalStatus?.hasVoted,
        });

        return (
          <ApprovalListItem key={chore.uuid} chore={chore}>
            <View style={{ alignItems: "center" }}>
              <ThemedText style={{ fontSize: 12, marginBottom: 4 }}>
                {votesText}
              </ThemedText>
              <Button
                title={hasUserVoted ? "Remove Vote" : "Vote"}
                backgroundColor={
                  hasUserVoted ? Colors.metro.orange : Colors.metro.green
                }
                loadingBackgroundColor={Colors.metro.teal}
                isLoading={votingChoreId === chore.uuid}
                onPress={() => handleVoteToggle(chore.uuid)}
                size="small"
              />
            </View>
          </ApprovalListItem>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});
