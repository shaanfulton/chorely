import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, Alert, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DisputeCard } from "@/components/ui/DisputeCard";
import { DisputeModal } from "@/components/ui/DisputeModal";
import { RecentActivityItem } from "@/components/ui/RecentActivityItems";
import { 
  getActiveDisputesAPI, 
  getRecentActivitiesAPI,
  createDisputeAPI,
  type Dispute,
  type Chore
} from "@/data/api";
import { useGlobalChores } from "@/context/ChoreContext";

export default function DisputeChoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentHome } = useGlobalChores();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [recentActivities, setRecentActivities] = useState<Chore[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Chore | null>(null);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const disputesData = await getActiveDisputesAPI();
    const activitiesData = await getRecentActivitiesAPI({ 
      homeId: currentHome?.id,
      timeFrame: "3d" 
    });
    
    // Filter out activities that have active disputes
    const disputedChoreIds = disputesData.map(dispute => dispute.choreId);
    const filteredActivities = activitiesData.filter(activity => 
      !disputedChoreIds.includes(activity.uuid)
    );
    
    setDisputes(disputesData);
    setRecentActivities(filteredActivities);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const handleDisputeResolved = () => {
    // Reload data when a dispute is resolved
    loadData();
  };

  const handleDisputeActivity = (activity: Chore) => {
    setSelectedActivity(activity);
    setDisputeModalVisible(true);
  };

  const handleDisputeCreated = () => {
    loadData();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          padding: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedText type="title" style={styles.title}>
          Disputes & Activity
        </ThemedText>

        {/* Active Disputes Section */}
        {disputes.length > 0 && (
          <>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Active Disputes ({disputes.length})
            </ThemedText>
            {disputes.map((dispute) => (
              <DisputeCard
                key={dispute.uuid}
                dispute={dispute}
                onDisputeResolved={handleDisputeResolved}
              />
            ))}
          </>
        )}

        {/* Recent Activities Section */}
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recent Activities ({recentActivities.length})
        </ThemedText>
        
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <RecentActivityItem
              key={activity.uuid}
              activity={activity}
              onDispute={handleDisputeActivity}
            />
          ))
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No recent activities found.
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Dispute Modal */}
      <DisputeModal
        visible={disputeModalVisible}
        activity={selectedActivity}
        onClose={() => {
          setDisputeModalVisible(false);
          setSelectedActivity(null);
        }}
        onDisputeCreated={handleDisputeCreated}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 30,
    marginBottom: 15,
    opacity: 0.8,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    alignItems: "center",
  },
  emptyStateText: {
    opacity: 0.6,
    textAlign: "center",
  },
});
