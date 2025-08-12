import { RecentActivity, createDisputeAPI } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { Camera, Send, X } from "lucide-react-native";
import React, { useState } from "react";
import {
 Alert,
 Image,
 Modal,
 StyleSheet,
 TextInput,
 TouchableOpacity,
 View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";


interface DisputeModalProps {
 visible: boolean;
 activity: RecentActivity | null;
 onClose: () => void;
 onDisputeCreated: () => void;
}


export function DisputeModal({
 visible,
 activity,
 onClose,
 onDisputeCreated,
}: DisputeModalProps) {
 const [reason, setReason] = useState("");
 const [photo, setPhoto] = useState<string | null>(null);


 const takePhoto = () => {
   // Simulate taking a photo - in a real app, this would use expo-image-picker
   // For now, its jsst a placeholder image
   Alert.alert(
     "Photo Taken",
     "Photo functionality would be implemented with expo-image-picker. For now, using a placeholder.",
     [
       {
         text: "OK",
         onPress: () => {
           // Simulate a photo being taken
           setPhoto("https://via.placeholder.com/300x200/cccccc/666666?text=Photo+Evidence");
         },
       },
     ]
   );
 };


 const handleSubmit = () => {
   if (!reason.trim()) {
     Alert.alert("Error", "Please provide a reason for the dispute");
     return;
   }


   if (!activity) {
     Alert.alert("Error", "No activity selected");
     return;
   }


   // Create dispute with photo if available
   createDisputeAPI(activity.choreId, reason.trim(), photo);
  
   Alert.alert(
     "Dispute Created",
     "Your dispute has been submitted and is pending review.",
     [
       {
         text: "OK",
         onPress: () => {
           setReason("");
           setPhoto(null);
           onClose();
           onDisputeCreated();
         },
       },
     ]
   );
 };


 if (!activity) return null;


 const IconComponent = getLucideIcon(activity.choreIcon);


 return (
   <Modal
     visible={visible}
     animationType="slide"
     presentationStyle="pageSheet"
     onRequestClose={onClose}
   >
     <ThemedView style={styles.container}>
       <View style={styles.header}>
         <ThemedText type="title">Dispute Chore</ThemedText>
         <TouchableOpacity onPress={onClose} style={styles.closeButton}>
           <X size={24} color="#666" />
         </TouchableOpacity>
       </View>


       <View style={styles.choreInfo}>
         <View style={styles.iconContainer}>
           <IconComponent size={32} color="#666" />
         </View>
         <View style={styles.choreDetails}>
           <ThemedText type="defaultSemiBold">{activity.choreName}</ThemedText>
           <ThemedText style={styles.choreDescription}>
             {activity.choreDescription}
           </ThemedText>
           <ThemedText style={styles.completedBy}>
             Completed by {activity.userName}
           </ThemedText>
         </View>
       </View>


       <View style={styles.formSection}>
         <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
           Reason for Dispute
         </ThemedText>
         <TextInput
           style={styles.textInput}
           value={reason}
           onChangeText={setReason}
           placeholder="Explain why you're disputing this chore..."
           placeholderTextColor="#999"
           multiline
           numberOfLines={4}
           textAlignVertical="top"
         />
       </View>


       <View style={styles.photoSection}>
         <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
           Photo Evidence (Optional)
         </ThemedText>
         <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
           <Camera size={24} color="#666" />
           <ThemedText style={styles.photoButtonText}>
             {photo ? 'Retake Photo' : 'Take Photo'}
           </ThemedText>
         </TouchableOpacity>
         {photo && (
           <View style={styles.photoPreview}>
             <Image source={{ uri: photo }} style={styles.photoImage} />
             <TouchableOpacity
               style={styles.removePhotoButton}
               onPress={() => setPhoto(null)}
             >
               <X size={16} color="#fff" />
             </TouchableOpacity>
           </View>
         )}
       </View>


       <View style={styles.actions}>
         <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
           <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
         </TouchableOpacity>
        
         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
           <Send size={16} color="#fff" />
           <ThemedText style={styles.submitButtonText}>Submit Dispute</ThemedText>
         </TouchableOpacity>
       </View>
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
 choreInfo: {
   flexDirection: "row",
   backgroundColor: "#f8f9fa",
   borderRadius: 12,
   padding: 16,
   marginBottom: 24,
 },
 iconContainer: {
   width: 48,
   height: 48,
   borderRadius: 24,
   backgroundColor: "#fff",
   justifyContent: "center",
   alignItems: "center",
   marginRight: 12,
 },
 choreDetails: {
   flex: 1,
 },
 choreDescription: {
   fontSize: 14,
   opacity: 0.7,
   marginTop: 2,
   marginBottom: 4,
 },
 completedBy: {
   fontSize: 12,
   opacity: 0.6,
 },
 formSection: {
   marginBottom: 24,
 },
 sectionTitle: {
   marginBottom: 12,
 },
 textInput: {
   borderWidth: 1,
   borderColor: "#e0e0e0",
   borderRadius: 8,
   padding: 12,
   fontSize: 16,
   minHeight: 100,
   backgroundColor: "#fff",
 },
 photoSection: {
   marginBottom: 24,
 },
 photoButton: {
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "center",
   backgroundColor: "#f0f0f0",
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   gap: 8,
 },
 photoButtonText: {
   color: "#666",
   fontWeight: "600",
 },
 photoPreview: {
   position: "relative",
   marginTop: 12,
   borderRadius: 8,
   overflow: "hidden",
 },
 photoImage: {
   width: "100%",
   height: 150,
 },
 removePhotoButton: {
   position: "absolute",
   top: 5,
   right: 5,
   backgroundColor: "rgba(0,0,0,0.5)",
   borderRadius: 10,
   width: 20,
   height: 20,
   justifyContent: "center",
   alignItems: "center",
 },


 actions: {
   flexDirection: "row",
   gap: 12,
   marginTop: "auto",
 },
 cancelButton: {
   flex: 1,
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   borderWidth: 1,
   borderColor: "#e0e0e0",
   alignItems: "center",
   backgroundColor: "#9E9E9E",
 },
 cancelButtonText: {
   color: "#fff",
   fontWeight: "600",
 },
 submitButton: {
   flex: 1,
   flexDirection: "row",
   alignItems: "center",
   justifyContent: "center",
   backgroundColor: "#4CAF50",
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   gap: 8,
 },
 submitButtonText: {
   color: "#fff",
   fontWeight: "600",
 },
});

