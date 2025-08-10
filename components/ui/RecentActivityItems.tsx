import { RecentActivity } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";


interface RecentActivityItemProps {
 activity: RecentActivity;
 onDispute: (activity: RecentActivity) => void;
}


export function RecentActivityItem({ activity, onDispute }: RecentActivityItemProps) {
 const IconComponent = getLucideIcon(activity.choreIcon);


 return (
   <ThemedView style={styles.container}>
     <View style={styles.header}>
       <View style={styles.iconContainer}>
         <IconComponent size={20} color="#666" />
       </View>
       <View style={styles.content}>
         <ThemedText type="defaultSemiBold">{activity.choreName}</ThemedText>
         <ThemedText style={styles.description}>
           {activity.choreDescription}
         </ThemedText>
         <ThemedText style={styles.userName}>
           Completed by {activity.userName}
         </ThemedText>
       </View>
     </View>


     {activity.canDispute && (
       <TouchableOpacity
         style={styles.disputeButton}
         onPress={() => onDispute(activity)}
       >
         <AlertTriangle size={16} color="#fff" />
         <ThemedText style={styles.disputeButtonText}>Dispute</ThemedText>
       </TouchableOpacity>
     )}
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
   backgroundColor: "#FF6B6B",
   paddingHorizontal: 12,
   paddingVertical: 8,
   borderRadius: 8,
   borderWidth: 1,
   borderColor: "#FF6B6B",
   gap: 4,
 },
 disputeButtonText: {
   color: "#fff",
   fontSize: 12,
   fontWeight: "600",
 },
});

