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
  approveDisputeAPI, 
  rejectDisputeAPI,
  getRecentActivitiesAPI,
  createDisputeAPI,
  type Dispute,
  type RecentActivity
} from "@/data/api";

export default function DisputeChoreScreen() {
  const insets = useSafeAreaInsets();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<RecentActivity | null>(null);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    setDisputes(getActiveDisputesAPI());
    setRecentActivities(getRecentActivitiesAPI());
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    setRefreshing(false);
  };

  const handleApproveDispute = (uuid: string) => {
    Alert.alert(
      "Approve Dispute",
      "Are you sure you want to approve this dispute?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "destructive",
          onPress: () => {
            approveDisputeAPI(uuid);
            loadData();
            Alert.alert("Success", "Dispute approved successfully");
          },
        },
      ]
    );
  };

  const handleRejectDispute = (uuid: string) => {
    Alert.alert(
      "Reject Dispute",
      "Are you sure you want to reject this dispute?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => {
            rejectDisputeAPI(uuid);
            loadData();
            Alert.alert("Success", "Dispute rejected successfully");
          },
        },
      ]
    );
  };

  const handleDisputeActivity = (activity: RecentActivity) => {
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
                onApprove={handleApproveDispute}
                onReject={handleRejectDispute}
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
