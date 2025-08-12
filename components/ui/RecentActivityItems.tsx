import { useGlobalChores } from "@/context/ChoreContext";
import { Chore } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { AlertTriangle } from "lucide-react-native";
import React, { useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { VerificationImageModal } from "./VerificationImageModal";

interface RecentActivityItemProps {
  activity: Chore;
  onDispute: (activity: Chore) => void;
  slideAnimation?: Animated.Value;
}

export function RecentActivityItem({
  activity,
  onDispute,
  slideAnimation,
}: RecentActivityItemProps) {
  const { currentUser } = useGlobalChores();
  const IconComponent = getLucideIcon(activity.icon);
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper function to get user name from email
  const getUserName = (email: string | null) => {
    if (!email) return "Unknown User";
    return email.split("@")[0];
  };

  const containerStyle = slideAnimation
    ? {
        transform: [
          {
            translateY: slideAnimation,
          },
        ],
      }
    : {};

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (activity.photo_url) {
            setShowImageModal(true);
          }
        }}
        disabled={!activity.photo_url}
      >
        <Animated.View style={[styles.container, containerStyle]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <IconComponent size={20} color="#666" />
            </View>
            <View style={styles.content}>
              <ThemedText type="defaultSemiBold">{activity.name}</ThemedText>
              <ThemedText style={styles.description}>
                {activity.description}
              </ThemedText>
              <ThemedText style={styles.userName}>
                Completed by{" "}
                {activity.user_email === currentUser?.email
                  ? "you"
                  : getUserName(activity.user_email)}
              </ThemedText>
              {activity.photo_url && (
                <ThemedText style={styles.tapHint}>
                  Tap for verification photo
                </ThemedText>
              )}
            </View>
          </View>

          {/* Only show dispute button for completed chores that the current user didn't complete */}
          {activity.status === "complete" &&
            activity.user_email !== currentUser?.email && (
              <TouchableOpacity
                style={styles.disputeButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDispute(activity);
                }}
              >
                <AlertTriangle size={16} color="#fff" />
                <ThemedText style={styles.disputeButtonText}>
                  Dispute
                </ThemedText>
              </TouchableOpacity>
            )}
        </Animated.View>
      </TouchableOpacity>

      <VerificationImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={activity.photo_url}
        choreName={activity.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignSelf: "stretch",
    marginHorizontal: 0,
    marginVertical: 8,
    flexDirection: "column",
    alignItems: "stretch",
    // Remove drop shadow
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
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
  content: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
    marginBottom: 4,
  },
  userName: {
    fontSize: 12,
    opacity: 0.6,
  },
  tapHint: {
    fontSize: 11,
    opacity: 0.5,
    fontStyle: "italic",
    marginTop: 2,
  },
  disputeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    gap: 4,
    marginTop: 12,
  },
  disputeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
