import { useGlobalChores } from "@/context/ChoreContext";
import { Chore, Dispute, getActiveDisputesAPI } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || "http://localhost:4000";

interface CompletedChoresModalProps {
  visible: boolean;
  onClose: () => void;
}

// Combined interface for displaying both completed chores and disputed chores
interface ChoreDisplayItem {
  uuid: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  completed_at: string | null;
  user_email: string | null;
  isDisputed: boolean;
  disputeReason?: string;
  disputeId?: string; // Add dispute ID for navigation
}

export function CompletedChoresModal({
  visible,
  onClose,
}: CompletedChoresModalProps) {
  const { currentUser, currentHome } = useGlobalChores();
  const [choreItems, setChoreItems] = useState<ChoreDisplayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible && currentUser && currentHome) {
      loadChoreItems();
    }
  }, [visible, currentUser, currentHome]);

  const loadChoreItems = async () => {
    if (!currentUser || !currentHome) return;

    setIsLoading(true);
    try {
      // Fetch both completed chores and active disputes
      const [completedChoresResponse, disputesResponse] = await Promise.all([
        fetch(`${API_BASE}/activities?homeId=${currentHome.id}&timeFrame=30d`),
        getActiveDisputesAPI()
      ]);

      const allActivities = await completedChoresResponse.json();

      // Filter for chores completed by the current user
      const userCompletedChores = allActivities.filter(
        (chore: Chore) => chore.user_email === currentUser.email
      );

      // Get disputed chore IDs to filter out from completed chores
      const disputedChoreIds = disputesResponse.map(dispute => dispute.choreId);

      // Filter out completed chores that are being disputed
      const nonDisputedCompletedChores = userCompletedChores.filter(
        (chore: Chore) => !disputedChoreIds.includes(chore.uuid)
      );

      // Convert completed chores to display items
      const completedItems: ChoreDisplayItem[] = nonDisputedCompletedChores.map((chore: Chore) => ({
        uuid: chore.uuid,
        name: chore.name,
        description: chore.description,
        icon: chore.icon,
        points: chore.points,
        completed_at: chore.completed_at,
        user_email: chore.user_email,
        isDisputed: false
      }));

      // Convert disputes to display items (only for chores claimed by current user)
      const disputedItems: ChoreDisplayItem[] = disputesResponse
        .filter(dispute => dispute.claimedByEmail === currentUser.email)
        .map((dispute: Dispute) => ({
          uuid: dispute.choreId,
          name: dispute.choreName,
          description: dispute.choreDescription,
          icon: dispute.choreIcon,
          points: dispute.chorePoints, // Use points from dispute data
          completed_at: null, // Disputed chores are not considered completed
          user_email: dispute.claimedByEmail,
          isDisputed: true,
          disputeReason: dispute.reason,
          disputeId: dispute.uuid
        }));

      // Combine and sort by completion date (disputed items go at the end)
      const allItems = [...completedItems, ...disputedItems];
      setChoreItems(allItems);
    } catch (error) {
      console.error("Failed to load chore items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format completion date
  const formatCompletionDate = (completedAt: string | null) => {
    if (!completedAt) return "Unknown date";
    const date = new Date(completedAt);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText
            type="title"
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Your Points
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading chore items...</ThemedText>
            </View>
          ) : choreItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No completed or disputed chores found for this week.
              </ThemedText>
            </View>
          ) : (
            choreItems.map((item) => {
              const IconComponent = getLucideIcon(item.icon);

              const handleItemPress = () => {
                if (item.isDisputed && item.disputeId) {
                  // Navigate to dispute page with the specific dispute open
                  onClose(); // Close the modal first
                  router.push({
                    pathname: "/(tabs)/dispute-chore",
                    // add a unique bump each time to force the target effect to run
                    params: { openDisputeId: item.disputeId, navNonce: Date.now().toString() }
                  });
                }
              };

              return (
                <TouchableOpacity
                  key={item.uuid}
                  style={styles.choreItem}
                  onPress={handleItemPress}
                  disabled={!item.isDisputed}
                  activeOpacity={item.isDisputed ? 0.7 : 1}
                >
                  <View style={styles.choreHeader}>
                    <View style={styles.iconContainer}>
                      <IconComponent size={24} color="#666" />
                    </View>
                    <View style={styles.choreInfo}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.choreName}
                      >
                        {item.name}
                      </ThemedText>
                      <ThemedText style={styles.choreDescription}>
                        {item.description}
                      </ThemedText>
                      {item.isDisputed ? (
                        <ThemedText style={styles.disputeInfo}>
                          Tap to view dispute
                        </ThemedText>
                      ) : (
                        <ThemedText style={styles.completionInfo}>
                          Completed on{" "}
                          {formatCompletionDate(item.completed_at)}
                        </ThemedText>
                      )}
                    </View>
                    {!item.isDisputed && (
                      <View style={styles.pointsContainer}>
                        <ThemedText style={styles.pointsText}>
                          +{item.points}
                        </ThemedText>
                      </View>
                    )}
                    {item.isDisputed && (
                      <View style={[styles.pointsContainer, styles.disputedContainer]}>
                        <ThemedText style={styles.disputedText}>
                          ~{item.points}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
  },
  choreItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  choreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  choreInfo: {
    flex: 1,
  },
  choreName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  choreDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  completionInfo: {
    fontSize: 12,
    opacity: 0.6,
  },
  pointsContainer: {
    backgroundColor: "#4CAF50", // Green for completed chores
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
  pointsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disputeInfo: {
    fontSize: 12,
    color: Colors.metro.orange, // Orange for disputed chores
    marginTop: 4,
  },
  disputedContainer: {
    backgroundColor: Colors.metro.orange, // Orange for disputed chores
  },
  disputedText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
