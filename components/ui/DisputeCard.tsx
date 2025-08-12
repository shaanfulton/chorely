import { Dispute, DisputeVoteStatus, VoteType, voteOnDisputeAPI, removeDisputeVoteAPI, getDisputeVoteStatusAPI, getUserDisputeVoteAPI } from "@/data/api";
import { useGlobalChores } from "@/context/ChoreContext";
import { getLucideIcon } from "@/utils/iconUtils";
import { Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface DisputeCardProps {
  dispute: Dispute;
  onDisputeResolved: () => void;
}

export function DisputeCard({ dispute, onDisputeResolved }: DisputeCardProps) {
  const { currentUser } = useGlobalChores();
  const [voteStatus, setVoteStatus] = useState<DisputeVoteStatus | null>(null);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load vote status and user's vote
  useEffect(() => {
    const loadVoteData = async () => {
      try {
        const [status, vote] = await Promise.all([
          getDisputeVoteStatusAPI(dispute.uuid),
          getUserDisputeVoteAPI(dispute.uuid, currentUser?.email || "")
        ]);
        setVoteStatus(status);
        setUserVote(vote);
        
        // Check if current user can vote (not the one who claimed the chore)
        setCanVote(dispute.claimedByEmail !== currentUser?.email);
      } catch (error) {
        console.error("Failed to load dispute vote data:", error);
        // If there's an error, assume user can't vote
        setCanVote(false);
      }
    };

    if (dispute.uuid && currentUser?.email) {
      loadVoteData();
    }
  }, [dispute.uuid, currentUser?.email, dispute.claimedByEmail]);

  const handleVote = async (vote: VoteType) => {
    if (!currentUser?.email || isVoting) return;

    try {
      setIsVoting(true);
      
      if (userVote === vote) {
        // Remove vote if clicking the same button
        await removeDisputeVoteAPI(dispute.uuid, currentUser.email);
        setUserVote(null);
      } else {
        // Vote or change vote
        await voteOnDisputeAPI(dispute.uuid, currentUser.email, vote);
        setUserVote(vote);
      }

      // Reload vote status
      const newStatus = await getDisputeVoteStatusAPI(dispute.uuid);
      setVoteStatus(newStatus);

      // Check if dispute was resolved
      if (newStatus.is_approved || newStatus.is_rejected) {
        onDisputeResolved();
      }
    } catch (error) {
      console.error("Failed to vote on dispute:", error);
      Alert.alert("Error", "Failed to vote on dispute. Please try again.");
    } finally {
      setIsVoting(false);
    }
  };

  const IconComponent = getLucideIcon(dispute.choreIcon);

  // Helper function to get user name from email
  const getUserName = (email: string) => {
    if (!email) return "Unknown User";
    return email.split('@')[0];
  };

  return (
    <ThemedView style={styles.container}>
      {/* Collapsed State - Always Visible */}
      <TouchableOpacity 
        style={styles.collapsedContent}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedHeader}>
          <View style={styles.iconContainer}>
            <IconComponent size={20} color="#666" />
          </View>
                     <View style={styles.collapsedInfo}>
             <ThemedText type="defaultSemiBold" style={styles.choreName}>
               {dispute.choreName}
             </ThemedText>
             <ThemedText style={styles.completerInfo}>
               Completed by {getUserName(dispute.claimedByEmail)}
             </ThemedText>
                          <ThemedText style={styles.disputerInfo}>
               Disputed by {dispute.disputerName}
             </ThemedText>
           </View>
           {dispute.imageUrl && (
             <View style={styles.thumbnailContainer}>
               <ExpoImage 
                 source={{ uri: dispute.imageUrl }} 
                 style={styles.thumbnail} 
                 contentFit="cover" 
               />
             </View>
           )}
           <TouchableOpacity style={styles.expandButton}>
            {isExpanded ? (
              <ChevronUp size={20} color="#666" />
            ) : (
              <ChevronDown size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded State - Only visible when expanded */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Dispute Details */}
          <View style={styles.disputeDetails}>
            <ThemedText style={styles.description}>{dispute.choreDescription}</ThemedText>
            <ThemedText style={styles.disputerName}>
              Disputed by {dispute.disputerName}
            </ThemedText>
            <ThemedText style={styles.reason}>Reason: {dispute.reason}</ThemedText>
          </View>

          {/* Full Size Image */}
          {dispute.imageUrl && (
            <View style={styles.photoSection}>
              <ExpoImage 
                source={{ uri: dispute.imageUrl }} 
                style={styles.photoImage} 
                contentFit="cover" 
              />
            </View>
          )}

          {/* Vote Status Display */}
          {voteStatus && (
            <View style={styles.voteStatus}>
              <View style={styles.voteCounts}>
                <View style={styles.voteCount}>
                  <Check size={16} color="#4CAF50" />
                  <ThemedText style={styles.voteCountText}>
                    {voteStatus.approve_votes} approve
                  </ThemedText>
                </View>
                <View style={styles.voteCount}>
                  <X size={16} color="#9E9E9E" />
                  <ThemedText style={styles.voteCountText}>
                    {voteStatus.reject_votes} reject
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.voteInfo}>
                {voteStatus.total_votes}/{voteStatus.total_eligible_voters} votes • {voteStatus.required_votes} needed
              </ThemedText>
              {voteStatus.is_24_hours_passed && (
                <View style={styles.timeoutWarning}>
                  <Clock size={14} color="#FF9800" />
                  <ThemedText style={styles.timeoutText}>
                    Auto-rejected after 24 hours
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Voting Buttons - Only show if user can vote */}
          {canVote ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.rejectButton,
                  userVote === "reject" && styles.selectedButton
                ]}
                onPress={() => handleVote("reject")}
                disabled={isVoting}
              >
                <X size={16} color="#fff" />
                <ThemedText style={styles.buttonText}>
                  {userVote === "reject" ? "Remove Vote" : "Vote Reject"}
                </ThemedText>
              </TouchableOpacity>
    
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.approveButton,
                  userVote === "approve" && styles.selectedButton
                ]}
                onPress={() => handleVote("approve")}
                disabled={isVoting}
              >
                <Check size={16} color="#fff" />
                <ThemedText style={styles.buttonText}>
                  {userVote === "approve" ? "Remove Vote" : "Vote Approve"}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cannotVoteMessage}>
              <ThemedText style={styles.cannotVoteText}>
                You cannot vote on this dispute because you claimed the chore
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  collapsedContent: {
    padding: 16,
  },
  collapsedHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  collapsedInfo: {
    flex: 1,
  },
  choreName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  completerInfo: {
    fontSize: 14,
    opacity: 0.7,
  },
  disputerInfo: {
    fontSize: 12,
    opacity: 0.6,
  },
  thumbnailContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  expandButton: {
    padding: 4,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    padding: 16,
  },
  disputeDetails: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  disputerName: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  reason: {
    fontSize: 12,
    opacity: 0.8,
  },
  photoSection: {
    marginBottom: 16,
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: 350,
    borderRadius: 8,
  },
  voteStatus: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  voteCounts: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  voteCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  voteCountText: {
    fontSize: 12,
    fontWeight: "600",
  },
  voteInfo: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 4,
  },
  timeoutWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  timeoutText: {
    fontSize: 11,
    color: "#FF9800",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  rejectButton: {
    backgroundColor: "#9E9E9E",
  },
  approveButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedButton: {
    opacity: 0.7,
  },
  cannotVoteMessage: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    alignItems: "center",
  },
  cannotVoteText: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
    fontStyle: "italic",
  },
});

