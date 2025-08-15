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
  targetPosition?: { x: number; y: number };
}

export function DisputeCard({ dispute, onDisputeResolved, onDisputeExpanded, onDisputeVoted, expanded, targetPosition }: DisputeCardProps) {
  const { currentUser } = useGlobalChores();
  const [voteStatus, setVoteStatus] = useState<DisputeVoteStatus | null>(null);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [canVote, setCanVote] = useState(() => {
    return currentUser?.email ? dispute.claimedByEmail !== currentUser.email : false;
  });
  const [isResolved, setIsResolved] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;
  
  const [showVoteFeedback, setShowVoteFeedback] = useState(false);
  const [voteFeedbackMessage, setVoteFeedbackMessage] = useState("");
  const [resolutionType, setResolutionType] = useState<"approved" | "rejected" | null>(null);
  const [userVoteDisplay, setUserVoteDisplay] = useState<VoteType | null>(null);

  // Reset resolved state when dispute changes
  useEffect(() => {
    setIsResolved(false);
  }, [dispute.uuid]);

  // Handle initial expansion state when component mounts
  useEffect(() => {
    if (expanded) {
      expandAnim.setValue(1);
    }
  }, [expanded]); // Include expanded in dependencies

  // Animate expansion/collapse
  useEffect(() => {
    if (expanded) {
      Animated.spring(expandAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(expandAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [expanded, expandAnim]);

  // Fallback: when status API 404s, fetch dispute directly and animate/remove accordingly
  const resolveFromBackendRow = async () => {
    try {
      const row = await getDisputeByIdAPI(dispute.uuid);
      if (!row) {
        onDisputeResolved(dispute.uuid, "approved");
        return;
      }
      if (row.status === "approved" || row.status === "rejected") {
        const isApproved = row.status === "approved";
        setResolutionType(isApproved ? "approved" : "rejected");
        setVoteFeedbackMessage(`Dispute ${isApproved ? "approved" : "rejected"}!`);
        setShowVoteFeedback(true);
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
        setUserVoteDisplay(vote);
        
        const canUserVote = dispute.claimedByEmail !== currentUser.email;
        setCanVote(canUserVote);
        
        if (status && !status.is_approved && !status.is_rejected) {
          setIsResolved(false);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("Dispute not found")) {
          await resolveFromBackendRow();
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

      const applyOptimistic = (from: VoteType | null, to: VoteType | null) => {
        if (!prevStatus) return;
        setVoteStatus((s) => {
          if (!s) return s;
          let approve = s.approve_votes;
          let reject = s.reject_votes;
          let total = s.total_votes;
          if (from === "approve") { approve = Math.max(0, approve - 1); total = Math.max(0, total - 1); }
          if (from === "reject")  { reject  = Math.max(0, reject  - 1); total = Math.max(0, total - 1); }
          if (to === "approve")   { approve += 1; total += 1; }
          if (to === "reject")    { reject  += 1; total += 1; }
          return { ...s, approve_votes: approve, reject_votes: reject, total_votes: total };
        });
      };
      
      if (userVote === vote) {
        applyOptimistic(prevVote, null);
        await removeDisputeVoteAPI(dispute.uuid, currentUser.email);
        setUserVote(null);
        setUserVoteDisplay(null);
        setVoteFeedbackMessage("Vote removed");
        setShowVoteFeedback(true);
        onDisputeExpanded(dispute.uuid);
        onDisputeVoted(dispute.uuid);
      } else {
        applyOptimistic(prevVote, vote);
        await voteOnDisputeAPI(dispute.uuid, currentUser.email, vote);
        setUserVote(vote);
        setUserVoteDisplay(vote);
        setVoteFeedbackMessage(`Voted to ${vote} dispute`);
        setShowVoteFeedback(true);
        onDisputeExpanded(dispute.uuid);
        onDisputeVoted(dispute.uuid);
      }

      // Refresh vote status
      let newStatus: DisputeVoteStatus | null = null;
      try {
        newStatus = await getDisputeVoteStatusAPI(dispute.uuid);
        setVoteStatus(newStatus);
      } catch (error) {
        await resolveFromBackendRow();
        return;
      }

      // Check if dispute is resolved
      if (newStatus && (newStatus.is_approved || newStatus.is_rejected)) {
        const isApproved = newStatus.is_approved;
        setResolutionType(isApproved ? "approved" : "rejected");
        setVoteFeedbackMessage(`Dispute ${isApproved ? 'approved' : 'rejected'}!`);
        setShowVoteFeedback(true);
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
    } catch (error) {
      setVoteStatus(null);
      if (error instanceof Error && error.message.includes("Network request failed")) {
        Alert.alert("Network Error", "Please check your connection and try again.");
      } else {
        Alert.alert("Error", "Failed to vote on dispute. Please try again.");
      }
    } finally {
      setIsVoting(false);
      setTimeout(() => {
        setShowVoteFeedback(false);
      }, 2000);
    }
  };

  const getUserName = (email: string) => {
    return email.split('@')[0];
  };

  const IconComponent = getLucideIcon(dispute.choreIcon);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          backgroundColor: slideAnim.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['#E8F5E8', '#fff', '#FFEBEE'],
          }),
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [-1, 0, 1, 2],
                outputRange: [-400, 0, 0, 0],
              })
            },
            {
              translateY: slideAnim.interpolate({
                inputRange: [-1, 0, 1, 2],
                outputRange: [0, 0, 0, targetPosition?.y || 600],
              })
            }
          ]
        }
      ]}
    >
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
          
          {dispute.claimedByEmail === currentUser?.email ? (
            <View style={[styles.voteSignifier, styles.ownChoreSignifier]}>
              <ThemedText style={styles.voteSignifierText}>!</ThemedText>
            </View>
          ) : userVoteDisplay ? (
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

      {expanded && (
        <Animated.View 
          style={[
            styles.expandedContent,
            {
              opacity: expandAnim,
            }
          ]}
        >
          <View style={styles.disputeDetails}>
            <ThemedText style={styles.description}>
              {dispute.choreDescription}
            </ThemedText>
            <ThemedText style={styles.disputerName}>
              Disputed by {getUserName(dispute.disputerEmail)}
            </ThemedText>
            <ThemedText style={styles.reason}>
              "{dispute.reason}"
            </ThemedText>
          </View>

          {dispute.imageUrl && (
            <View style={styles.photoSection}>
              <ExpoImage 
                source={{ uri: dispute.imageUrl }} 
                style={styles.photoImage} 
                contentFit="cover" 
              />
            </View>
          )}

          {voteStatus && (
            <View style={styles.voteStatus}>
              <View style={styles.voteCounts}>
                <View style={styles.voteCount}>
                  <Check size={16} color="#4CAF50" />
                  <ThemedText style={styles.voteCountText}>
                    {voteStatus.approve_votes} Approve
                  </ThemedText>
                </View>
                <View style={styles.voteCount}>
                  <X size={16} color="#F44336" />
                  <ThemedText style={styles.voteCountText}>
                    {voteStatus.reject_votes} Reject
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.voteInfo}>
                {voteStatus.total_votes} total votes • {voteStatus.required_votes} needed to resolve
              </ThemedText>
            </View>
          )}

          {canVote && !isResolved && (
            <View style={styles.actionButtons}>
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
                <ThemedText style={styles.buttonText}>Approve</ThemedText>
              </TouchableOpacity>
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
                <ThemedText style={styles.buttonText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {!canVote && (
            <View style={styles.cannotVoteMessage}>
              <ThemedText style={styles.cannotVoteText}>
                You cannot vote on your own disputed chore
              </ThemedText>
            </View>
          )}
        </Animated.View>
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

