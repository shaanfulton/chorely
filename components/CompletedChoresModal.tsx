import { Chore } from "@/data/api";
import { useGlobalChores } from "@/context/ChoreContext";
import { getLucideIcon } from "@/utils/iconUtils";
import { X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface CompletedChoresModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CompletedChoresModal({ visible, onClose }: CompletedChoresModalProps) {
  const { currentUser, currentHome } = useGlobalChores();
  const [completedChores, setCompletedChores] = useState<Chore[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible && currentUser && currentHome) {
      loadCompletedChores();
    }
  }, [visible, currentUser, currentHome]);

  const loadCompletedChores = async () => {
    if (!currentUser || !currentHome) return;
    
    setIsLoading(true);
    try {
      // Use the activities endpoint to get recent completed chores
      const response = await fetch(`http://10.0.0.14:4000/activities?homeId=${currentHome.id}&timeFrame=30d`);
      const allActivities = await response.json();
      
      // Filter for chores completed by the current user
      const userCompletedChores = allActivities.filter((chore: Chore) => 
        chore.user_email === currentUser.email
      );
      
      setCompletedChores(userCompletedChores);
    } catch (error) {
      console.error("Failed to load completed chores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user name from email
  const getUserName = (email: string | null) => {
    if (!email) return "Unknown User";
    return email.split('@')[0];
  };

  // Helper function to format completion date
  const formatCompletionDate = (completedAt: string | null) => {
    if (!completedAt) return "Unknown date";
    const date = new Date(completedAt);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <ThemedText type="title">Completed Chores</ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText>Loading completed chores...</ThemedText>
            </View>
          ) : completedChores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No completed chores found for this week.
              </ThemedText>
            </View>
          ) : (
            completedChores.map((chore) => {
              const IconComponent = getLucideIcon(chore.icon);
              
              return (
                <View key={chore.uuid} style={styles.choreItem}>
                  <View style={styles.choreHeader}>
                    <View style={styles.iconContainer}>
                      <IconComponent size={24} color="#666" />
                    </View>
                    <View style={styles.choreInfo}>
                      <ThemedText type="defaultSemiBold" style={styles.choreName}>
                        {chore.name}
                      </ThemedText>
                      <ThemedText style={styles.choreDescription}>
                        {chore.description}
                      </ThemedText>
                      <ThemedText style={styles.completionInfo}>
                        Completed on {formatCompletionDate(chore.completed_at)}
                      </ThemedText>
                    </View>
                    <View style={styles.pointsContainer}>
                      <ThemedText style={styles.pointsText}>
                        +{chore.points}
                      </ThemedText>
                    </View>
                  </View>
                </View>
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
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: "center",
  },
  pointsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
