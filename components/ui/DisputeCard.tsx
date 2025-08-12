import { Dispute } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { Check, X } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";


interface DisputeCardProps {
 dispute: Dispute;
 onApprove: (uuid: string) => void;
 onReject: (uuid: string) => void;
}


export function DisputeCard({ dispute, onApprove, onReject }: DisputeCardProps) {
 const IconComponent = getLucideIcon(dispute.choreIcon);


 return (
   <ThemedView style={styles.container}>
     <View style={styles.header}>
       <View style={styles.iconContainer}>
         <IconComponent size={24} color="#666" />
       </View>
       <View style={styles.content}>
         <ThemedText type="defaultSemiBold">{dispute.choreName}</ThemedText>
         <ThemedText style={styles.description}>{dispute.choreDescription}</ThemedText>
         <ThemedText style={styles.disputerName}>
           Disputed by {dispute.disputerName}
         </ThemedText>
         <ThemedText style={styles.reason}>Reason: {dispute.reason}</ThemedText>
       </View>
     </View>


     {dispute.imageUrl && (
       <View style={styles.photoSection}>
         <Image source={{ uri: dispute.imageUrl }} style={styles.photoImage} />
       </View>
     )}


     <View style={styles.actionButtons}>
       <TouchableOpacity
         style={[styles.actionButton, styles.rejectButton]}
         onPress={() => onReject(dispute.uuid)}
       >
         <X size={16} color="#fff" />
         <ThemedText style={styles.buttonText}>Reject</ThemedText>
       </TouchableOpacity>


       <TouchableOpacity
         style={[styles.actionButton, styles.approveButton]}
         onPress={() => onApprove(dispute.uuid)}
       >
         <Check size={16} color="#fff" />
         <ThemedText style={styles.buttonText}>Approve</ThemedText>
       </TouchableOpacity>
     </View>
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
   flexDirection: "row",
   marginBottom: 16,
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
 disputerName: {
   fontSize: 12,
   opacity: 0.6,
   marginBottom: 2,
 },
 reason: {
   fontSize: 12,
   opacity: 0.8,
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
   backgroundColor: "#9E9E9E",
 },
 approveButton: {
   backgroundColor: "#4CAF50",
 },
 buttonText: {
   color: "#fff",
   fontSize: 12,
   fontWeight: "600",
 },
 photoSection: {
   marginTop: 16,
   marginBottom: 16,
   alignItems: "center",
 },
 photoImage: {
   width: "100%",
   height: 150,
   borderRadius: 8,
   resizeMode: "cover",
 },
});

