import { Colors } from "@/constants/Colors";
import { useGlobalChores } from "@/context/ChoreContext";
import React, { useState } from "react";
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
      const approvalStatus = getChoreApprovalStatus(choreId);

      if (approvalStatus?.hasVoted[currentUser.email]) {
        // User has already voted, remove their vote
        await removeVoteForChore(choreId);
      } else {
        // User hasn't voted yet, add their vote
        await voteForChore(choreId);
      }
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
        const approvalStatus = getChoreApprovalStatus(chore.uuid);
        const hasUserVoted = currentUser
          ? approvalStatus?.hasVoted[currentUser.email] || false
          : false;
        const votesText = approvalStatus
          ? `${approvalStatus.currentVotes}/${approvalStatus.votesNeeded} votes`
          : "";

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
