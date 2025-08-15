import React, { useState, useEffect, useCallback, useRef } from "react";
import { ScrollView, StyleSheet, Alert, RefreshControl, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

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
  const { openDisputeId, navNonce } =
    useLocalSearchParams<{ openDisputeId?: string; navNonce?: string }>();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [recentActivities, setRecentActivities] = useState<Chore[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Chore | null>(null);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedDisputeId, setExpandedDisputeId] = useState<string | null>(null);
  const [userVotedDisputes, setUserVotedDisputes] = useState<Set<string>>(new Set());
  const [disputeTargetPositions, setDisputeTargetPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [activityAnimations, setActivityAnimations] = useState<Map<string, Animated.Value>>(new Map());
  const [pendingBounceActivityId, setPendingBounceActivityId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);


  const loadData = useCallback(async () => {
    if (!currentHome?.id || loading) return;

    setLoading(true);
    try {
      const disputesData = await getActiveDisputesAPI();
      const activitiesData = await getRecentActivitiesAPI({
        homeId: currentHome.id,
        timeFrame: "3d"
      });

      // Filter out activities that have active disputes
      const disputedChoreIds = disputesData.map(dispute => dispute.choreId);
      const filteredActivities = activitiesData.filter(activity =>
        !disputedChoreIds.includes(activity.uuid)
      );

      setDisputes(disputesData);
      setRecentActivities(filteredActivities);

      // Calculate target positions for overruled disputes
      const targetPositions = new Map<string, { x: number; y: number }>();

      disputesData.forEach((dispute) => {
        // Calculate where this dispute would appear in recent activities if overruled
        const overruledChore: Chore = {
          uuid: dispute.choreId,
          name: dispute.choreName,
          description: dispute.choreDescription,
          time: new Date().toISOString(),
          icon: dispute.choreIcon,
          user_email: dispute.claimedByEmail,
          status: "complete",
          todos: [],
          homeID: currentHome?.id || "",
          points: 0,
          approvalList: [],
          completed_at: new Date().toISOString(),
          claimed_at: null,
        };

        // Find the correct position in recent activities
        let insertIndex = 0;
        for (let i = 0; i < filteredActivities.length; i++) {
          const activityTime = new Date(filteredActivities[i].completed_at || 0);
          const overruledTime = new Date(overruledChore.completed_at || 0);
          if (activityTime < overruledTime) {
            insertIndex = i;
            break;
          }
          insertIndex = i + 1;
        }

        // Calculate Y position: disputes section height + target position in activities
        const disputeCardHeight = 120; // Approximate height of collapsed dispute card
        const activityItemHeight = 80; // Approximate height of activity item
        const sectionTitleHeight = 50; // Height of section titles
        const padding = 20; // Container padding

        // When this dispute is resolved, there will be one fewer dispute in the list
        const remainingDisputes = disputesData.length - 1;
        const disputesSectionHeight = (remainingDisputes * disputeCardHeight) + sectionTitleHeight + padding;

        // Calculate the target position more precisely
        // The dispute card should end up exactly where the new activity item will appear
        const targetY = disputesSectionHeight + (insertIndex * activityItemHeight) + sectionTitleHeight;

        targetPositions.set(dispute.uuid, { x: 0, y: targetY });
      });

      setDisputeTargetPositions(targetPositions);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Show a simple error message if the backend is down
      if (error instanceof Error && error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Please try again later.',
          [{ text: 'OK' }]
        );
      } else if (error instanceof Error && error.message.includes('Home') && error.message.includes('does not exist')) {
        // Home ID has changed, need to refresh user data
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log out and log back in.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  }, [currentHome?.id, loading]);

  useEffect(() => {
    if (currentHome?.id) {
      loadData();
    }
  }, [currentHome?.id]);

  // Auto-expand dispute if openDisputeId is provided
  useEffect(() => {
    if (openDisputeId && disputes.length > 0) {
      const disputeExists = disputes.some(d => d.uuid === openDisputeId);
      if (disputeExists) {
        // Always expand when openDisputeId is provided (from "Your Points" click)
        setExpandedDisputeId(openDisputeId);

        setTimeout(() => {
          if (scrollViewRef.current) {
            const disputeIndex = disputes.findIndex(d => d.uuid === openDisputeId);
            if (disputeIndex !== -1) {
              const disputeCardHeight = 120;
              const sectionTitleHeight = 50;
              const padding = 20;
              const targetY = sectionTitleHeight + padding + (disputeIndex * disputeCardHeight);
              scrollViewRef.current.scrollTo({ y: Math.max(0, targetY - 100), animated: true });
            }
          }
        }, 300);
      }
    }
    // depend on navNonce so this runs even when the id is the same
  }, [openDisputeId, navNonce, disputes]);


  // Clear expanded dispute when no openDisputeId
  useEffect(() => {
    if (!openDisputeId) {
      setExpandedDisputeId(null);
    }
  }, [openDisputeId]);





  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleDisputeResolved = useCallback((resolvedDisputeId: string, resolutionType: "sustained" | "overruled") => {
    // Find the resolved dispute to get its chore info
    const resolvedDispute = disputes.find(d => d.uuid === resolvedDisputeId);

    // Use setTimeout to defer state updates and avoid React render phase issues
    setTimeout(() => {
      // Immediately remove the resolved dispute from local state
      setDisputes(prevDisputes => prevDisputes.filter(d => d.uuid !== resolvedDisputeId));

      // Reset expanded dispute if it was the one that was resolved
      if (expandedDisputeId === resolvedDisputeId) {
        setExpandedDisputeId(null);
      }

      // Remove from voted disputes set
      setUserVotedDisputes(prev => {
        const newSet = new Set(prev);
        newSet.delete(resolvedDisputeId);
        return newSet;
      });
      
      if (resolutionType === "overruled" && resolvedDispute) {
        setPendingBounceActivityId(resolvedDispute.choreId);
      }
    }, 0);

    // Let the DisputeCard animate as an overlay. After its animation completes,
    // refresh from backend to swap to the authoritative list and avoid overlaps/gaps.
    setTimeout(() => {
      loadData();
    }, 700); // match card slide duration + small buffer
  }, [loadData, expandedDisputeId, disputes, currentHome?.id]);

  useEffect(() => {
    if (!pendingBounceActivityId) return;
    const appeared = recentActivities.find(a => a.uuid === pendingBounceActivityId);
    if (!appeared) return;

    const animMap = new Map(activityAnimations);
    const anim = animMap.get(pendingBounceActivityId) || new Animated.Value(-16);
    anim.setValue(-16);
    animMap.set(pendingBounceActivityId, anim);
    setActivityAnimations(animMap);

    Animated.spring(anim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 14,
      speed: 10,
    }).start(() => {
      setPendingBounceActivityId(null);
    });
  }, [pendingBounceActivityId, recentActivities]);

  const handleDisputeVoted = useCallback((disputeId: string) => {
    // Add dispute to voted set
    setUserVotedDisputes(prev => new Set(prev).add(disputeId));
  }, []);

  const handleDisputeExpanded = useCallback((disputeId: string) => {
    const nextId = expandedDisputeId === disputeId ? null : disputeId;
    setExpandedDisputeId(nextId);
  }, [expandedDisputeId]);



  const handleDisputeActivity = useCallback((activity: Chore) => {
    setSelectedActivity(activity);
    setDisputeModalVisible(true);
  }, []);

  const handleDisputeCreated = useCallback(() => {
    // Add a small delay to prevent rapid API calls
    setTimeout(() => {
      loadData();
    }, 500);
  }, [loadData]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollViewRef}
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
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Active Disputes ({disputes.length})
        </ThemedText>
        {disputes.length > 0 ? (
          disputes
            .sort((a, b) => {
              const aVoted = userVotedDisputes.has(a.uuid);
              const bVoted = userVotedDisputes.has(b.uuid);
              // Put non-voted disputes first
              if (aVoted && !bVoted) return 1;
              if (!aVoted && bVoted) return -1;
              return 0;
            })
            .map((dispute) => (
              <DisputeCard
                key={`${dispute.uuid}-${navNonce ?? 0}`}
                dispute={dispute}
                onDisputeResolved={handleDisputeResolved}
                onDisputeExpanded={handleDisputeExpanded}
                onDisputeVoted={handleDisputeVoted}
                expanded={expandedDisputeId === dispute.uuid}
                targetPosition={disputeTargetPositions.get(dispute.uuid)}
              />
            ))
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>No active disputes</ThemedText>
          </ThemedView>
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
              slideAnimation={activityAnimations.get(activity.uuid)}
            />
          ))
        ) : (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No recent activities yet
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
