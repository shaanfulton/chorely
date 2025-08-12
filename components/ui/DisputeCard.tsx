import { Dispute, DisputeVoteStatus, VoteType, voteOnDisputeAPI, removeDisputeVoteAPI, getDisputeVoteStatusAPI, getUserDisputeVoteAPI, getDisputeByIdAPI } from "@/data/api";
import { useGlobalChores } from "@/context/ChoreContext";
import { getLucideIcon } from "@/utils/iconUtils";
import { Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Alert, Animated, Easing } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface DisputeCardProps {
  dispute: Dispute;
  onDisputeResolved: (disputeId: string, resolutionType: "approved" | "rejected") => void;
  onDisputeExpanded: (disputeId: string) => void;
  onDisputeVoted: (disputeId: string) => void;
  expanded: boolean;
  targetPosition?: { x: number; y: number }; // Target position for rejected disputes
}

export function DisputeCard({ dispute, onDisputeResolved, onDisputeExpanded, onDisputeVoted, expanded, targetPosition }: DisputeCardProps) {
  const { currentUser } = useGlobalChores();
  const [voteStatus, setVoteStatus] = useState<DisputeVoteStatus | null>(null);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [canVote, setCanVote] = useState(() => {
    // Initialize canVote based on whether current user is the one who claimed the chore
    return currentUser?.email ? dispute.claimedByEmail !== currentUser.email : false;
  });
  const [isResolved, setIsResolved] = useState(false);
  
  // Reset resolved state when dispute changes
  useEffect(() => {
    setIsResolved(false);
  }, [dispute.uuid]);
  const [showVoteFeedback, setShowVoteFeedback] = useState(false);
  const [voteFeedbackMessage, setVoteFeedbackMessage] = useState("");
  const [resolutionType, setResolutionType] = useState<"approved" | "rejected" | null>(null);
  const [userVoteDisplay, setUserVoteDisplay] = useState<VoteType | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Fallback: when status API 404s, fetch dispute directly and animate/remove accordingly
  const resolveFromBackendRow = async () => {
    try {
      const row = await getDisputeByIdAPI(dispute.uuid);
      if (!row) {
        // Stale card (likely after reseed) – remove without animation
        onDisputeResolved(dispute.uuid, "approved");
        return;
      }
      if (row.status === "approved" || row.status === "rejected") {
        const isApproved = row.status === "approved";
        setResolutionType(isApproved ? "approved" : "rejected");
        setVoteFeedbackMessage(`Dispute ${isApproved ? "approved" : "rejected"}!`);
        setShowVoteFeedback(true);
        // Ensure it is collapsed while animating out
        onDisputeExpanded(dispute.uuid);
        setIsResolved(true);
        Animated.timing(slideAnim, {
          toValue: isApproved ? -1 : 2,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => {
          onDisputeResolved(dispute.uuid, isApproved ? "approved" : "rejected");
        });
      }
    } catch (e) {
      // If even this fails, just drop the card to avoid a broken visual state
      onDisputeResolved(dispute.uuid, "approved");
    }
  };

  // Load vote status and user's vote
  useEffect(() => {
    const loadVoteData = async () => {
      if (!dispute.uuid || !currentUser?.email) return;
      
      try {
        const [status, vote] = await Promise.all([
          getDisputeVoteStatusAPI(dispute.uuid),
          getUserDisputeVoteAPI(dispute.uuid, currentUser.email)
        ]);
        setVoteStatus(status);
        setUserVote(vote);
        setUserVoteDisplay(vote); // Set the display vote
        
        // Check if current user can vote (not the one who claimed the chore)
        const canUserVote = dispute.claimedByEmail !== currentUser.email;
        setCanVote(canUserVote);
        
        // Reset resolved state if dispute is still pending
        if (status && !status.is_approved && !status.is_rejected) {
          setIsResolved(false);
        }
      } catch (error) {
        // If dispute status 404s, fetch final dispute row and animate accordingly
        if (error instanceof Error && error.message.includes("Dispute not found")) {
          await resolveFromBackendRow();
        } else if (error instanceof Error && error.message.includes("Network request failed")) {
          // Network error - don't clear the vote status, just continue
          // Don't clear voteStatus, userVote, or userVoteDisplay on network errors
          // The canVote state should already be set correctly from initialization
        } else {
          // Keep current UI instead of neutering the card
        }
      }
    };

    loadVoteData();
  }, [dispute.uuid, currentUser?.email, dispute.claimedByEmail]);

  const handleVote = async (vote: VoteType) => {
    if (!currentUser?.email || isVoting) return;

    try {
      setIsVoting(true);
      const prevVote = userVote;
      const prevStatus = voteStatus;

      // Optimistic local counters so the UI reflects immediately
      const applyOptimistic = (from: VoteType | null, to: VoteType | null) => {
        if (!prevStatus) return; // require known counts
        setVoteStatus((s) => {
          if (!s) return s;
          let approve = s.approve_votes;
          let reject = s.reject_votes;
          let total = s.total_votes;
          // remove previous
          if (from === "approve") { approve = Math.max(0, approve - 1); total = Math.max(0, total - 1); }
          if (from === "reject")  { reject  = Math.max(0, reject  - 1); total = Math.max(0, total - 1); }
          // add new
          if (to === "approve")   { approve += 1; total += 1; }
          if (to === "reject")    { reject  += 1; total += 1; }
          return { ...s, approve_votes: approve, reject_votes: reject, total_votes: total };
        });
      };
      
      if (userVote === vote) {
        // Remove vote if clicking the same button
        applyOptimistic(prevVote, null);
        await removeDisputeVoteAPI(dispute.uuid, currentUser.email);
        setUserVote(null);
        setUserVoteDisplay(null);
        setVoteFeedbackMessage("Vote removed");
        setShowVoteFeedback(true);
        // Unexpand the dispute when voting
        onDisputeExpanded(dispute.uuid);
        // Notify parent that user voted
        onDisputeVoted(dispute.uuid);
      } else {
        // Vote for a different option (either new vote or change vote)
        applyOptimistic(prevVote, vote);
        await voteOnDisputeAPI(dispute.uuid, currentUser.email, vote);
        setUserVote(vote);
        setUserVoteDisplay(vote);
        setVoteFeedbackMessage(`Voted to ${vote} dispute`);
        setShowVoteFeedback(true);
        // Unexpand the dispute when voting
        onDisputeExpanded(dispute.uuid);
        // Notify parent that user voted
        onDisputeVoted(dispute.uuid);
      }

      // Always reload vote status to update counters
      let newStatus: DisputeVoteStatus | null = null;
      try {
        newStatus = await getDisputeVoteStatusAPI(dispute.uuid);
        setVoteStatus(newStatus);
      } catch (error) {
        // If dispute vanished here, resolve using final backend row
        if (error instanceof Error && error.message.includes("Dispute not found")) {
          await resolveFromBackendRow();
          return;
        } else if (error instanceof Error && error.message.includes("Network request failed")) {
          // Network error - don't update status, just continue
          return;
        } else {
          return;
        }
      }

      // Check if dispute was resolved
      if (newStatus && (newStatus.is_approved || newStatus.is_rejected)) {
        const isApproved = newStatus.is_approved;
        setResolutionType(isApproved ? "approved" : "rejected");
        
        // Show resolution feedback
        setVoteFeedbackMessage(`Dispute ${isApproved ? 'approved' : 'rejected'}!`);
        setShowVoteFeedback(true);
        
          // Slide animation after a short delay
        setTimeout(() => {
          setIsResolved(true);
            if (isApproved) {
              // Left slide with a subtle bounce
              Animated.spring(slideAnim, {
                toValue: -1,
                useNativeDriver: true,
                bounciness: 12,
                speed: 9,
              }).start(() => {
                onDisputeResolved(dispute.uuid, "approved");
              });
            } else {
              // Downward transfer: ease out and fade near the end so it doesn't look stuck at the boundary
              Animated.parallel([
                Animated.timing(slideAnim, {
                  toValue: 2,
                  duration: 600,
                  useNativeDriver: true,
                  easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 250,
                  delay: 400, // fade during the last ~40% of the travel
                  useNativeDriver: true,
                }),
              ]).start(() => {
                onDisputeResolved(dispute.uuid, "rejected");
              });
            }
        }, 1500); // Show feedback for 1.5 seconds before sliding
        return; // Don't hide feedback immediately
      }
    } catch (error) {
      // Roll back optimistic counts on error
      if (voteStatus) {
        setVoteStatus(prevStatus || null);
      }
      if (error instanceof Error && error.message.includes("Network request failed")) {
        Alert.alert("Network Error", "Please check your connection and try again.");
      } else {
        Alert.alert("Error", "Failed to vote on dispute. Please try again.");
      }
    } finally {
      setIsVoting(false);
      // Hide feedback after 2 seconds (only if dispute wasn't resolved)
      setTimeout(() => {
        setShowVoteFeedback(false);
      }, 2000);
    }
  };

  const IconComponent = getLucideIcon(dispute.choreIcon);

  // Helper function to get user name from email
  const getUserName = (email: string) => {
    if (!email) return "Unknown User";
    return email.split('@')[0];
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        opacity: fadeAnim,
        backgroundColor: slideAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['#E8F5E8', '#fff', '#FFEBEE'], // Green tint for approved, red tint for rejected
        }),
                      transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [-1, 0, 1, 2],
                    outputRange: [-400, 0, 0, 0], // Only slide left for approved, no horizontal movement for rejected
                  })
                },
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [-1, 0, 1, 2],
                    outputRange: [0, 0, 0, targetPosition?.y || 600], // Use target position or default
                  })
                }
              ]
      }
    ]}>
      {/* Vote Feedback Toast */}
      {showVoteFeedback && (
        <View style={[
          styles.feedbackToast, 
          voteFeedbackMessage.includes('approved') || voteFeedbackMessage.includes('rejected') 
            ? styles.resolutionToast 
            : null
        ]}>
          <ThemedText style={styles.feedbackText}>{voteFeedbackMessage}</ThemedText>
        </View>
      )}
      
      {/* Collapsed State - Always Visible */}
      <TouchableOpacity 
        style={styles.collapsedContent}
        onPress={() => onDisputeExpanded(dispute.uuid)}
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
           
                       {/* Vote Signifier */}
            {dispute.claimedByEmail === currentUser?.email ? (
              // Show neutral indicator for user's own disputed chore
              <View style={[styles.voteSignifier, styles.ownChoreSignifier]}>
                <ThemedText style={styles.voteSignifierText}>!</ThemedText>
              </View>
            ) : userVoteDisplay ? (
              // Show vote indicator for other users' disputes
              <View style={[
                styles.voteSignifier,
                userVoteDisplay === "approve" ? styles.approveSignifier : styles.rejectSignifier
              ]}>
                <ThemedText style={styles.voteSignifierText}>
                  {userVoteDisplay === "approve" ? "✓" : "✗"}
                </ThemedText>
              </View>
            ) : null}
           
           <TouchableOpacity 
             style={styles.expandButton}
             onPress={() => onDisputeExpanded(dispute.uuid)}
             activeOpacity={0.7}
           >
            {expanded ? (
              <ChevronUp size={20} color="#666" />
            ) : (
              <ChevronDown size={20} color="#666" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded State - Only visible when expanded */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Dispute Details */}
          <View style={styles.disputeDetails}>
            <ThemedText style={styles.reason}>Reason: {dispute.reason}</ThemedText>
            <ThemedText style={styles.descriptionSmall}>{dispute.choreDescription}</ThemedText>
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

          {/* Voting Buttons - Only show if user can vote and dispute is not resolved */}
          {canVote && !isResolved ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton, 
                  styles.rejectButton,
                  userVote === "reject" && styles.selectedButton,
                  isVoting && styles.disabledButton
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
                  userVote === "approve" && styles.selectedButton,
                  isVoting && styles.disabledButton
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
          ) : !canVote ? (
            <View style={styles.cannotVoteMessage}>
              <ThemedText style={styles.cannotVoteText}>
                You cannot vote on this dispute because you claimed the chore
              </ThemedText>
            </View>
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e9ecef",
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
  descriptionSmall: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 6,
  },
  disputerName: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  reason: {
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.9,
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
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbdefb",
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
    backgroundColor: "#2196F3",
  },
  approveButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  selectedButton: {
    opacity: 1,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.4,
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
  feedbackToast: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1000,
  },
  resolutionToast: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  feedbackText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  voteSignifier: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  approveSignifier: {
    backgroundColor: "#F44336",
  },
  rejectSignifier: {
    backgroundColor: "#2196F3",
  },
  ownChoreSignifier: {
    backgroundColor: "#FF9800",
  },
  voteSignifierText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

