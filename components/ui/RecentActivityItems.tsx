import { Chore, getUserByEmailAPI } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";




interface RecentActivityItemProps {
activity: Chore;
onDispute: (activity: Chore) => void;
}




export function RecentActivityItem({ activity, onDispute }: RecentActivityItemProps) {
const IconComponent = getLucideIcon(activity.icon);
const userName = getUserByEmailAPI(activity.user_email || "")?.name || "Unknown";




return (
  <ThemedView style={styles.container}>
    {/* header section - shows the completed chore details */}
    {/* example: shows "vacuum living room" chore completed by sarah with description */}
    <View style={styles.header}>
      <View style={styles.iconContainer}>
        <IconComponent size={20} color="#687076" />
      </View>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold">{activity.name}</ThemedText>
        <ThemedText style={styles.description}>
          {activity.description}
        </ThemedText>
        <ThemedText style={styles.userName}>
          Completed by {userName}
        </ThemedText>
      </View>
    </View>




    {/* dispute button - allows users to dispute a completed chore if they think it wasn't done properly */}
    {/* example: user clicks dispute on "vacuum living room" because they see crumbs still on the carpet */}
    <TouchableOpacity
      style={styles.disputeButton}
      onPress={() => onDispute(activity)}
    >
      <AlertTriangle size={16} color="#fff" />
      <ThemedText style={styles.disputeButtonText}>Dispute</ThemedText>
    </TouchableOpacity>
  </ThemedView>
);
}




const styles = StyleSheet.create({
container: {
  backgroundColor: "#fff",
  borderRadius: 12,
  padding: 16,
  marginHorizontal: 20,
  marginVertical: 8,
  flexDirection: "row",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
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
disputeButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#E53E3E",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#E53E3E",
  gap: 4,
},
disputeButtonText: {
  color: "#fff",
  fontSize: 12,
  fontWeight: "600",
},
});





