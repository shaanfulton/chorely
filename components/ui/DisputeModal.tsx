import { Chore, createDisputeAPI, getUserByEmailAPI } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { CameraView, useCameraPermissions } from "expo-camera";
import { AlertTriangle, Camera as CameraIcon, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
 Alert,
 Animated,
 Easing,
 Image,
 KeyboardAvoidingView,
 Modal,
 Platform,
 ScrollView,
 StyleSheet,
 TextInput,
 TouchableOpacity,
 TouchableWithoutFeedback,
 View,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";


interface DisputeModalProps {
 visible: boolean;
 activity: Chore | null;
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
 const [showCamera, setShowCamera] = useState(false);
 const [permission, requestPermission] = useCameraPermissions();
 const textInputRef = useRef<TextInput>(null);


 const takePhoto = async () => {
   if (!permission?.granted) {
     const permissionResult = await requestPermission();
     if (!permissionResult.granted) {
       Alert.alert("Permission Required", "Camera permission is needed to take photos");
       return;
     }
   }
   setShowCamera(true);
 };


 const handlePhotoTaken = async () => {
   try {
     if (cameraRef.current) {
       // Take a photo using the camera
       const photo = await cameraRef.current.takePictureAsync({
         quality: 0.8,
         base64: false,
       });
      
       setPhoto(photo.uri);
       setShowCamera(false);
     } else {
       // Fallback to placeholder if camera ref is not available
       setPhoto("https://picsum.photos/300/200?random=" + Date.now());
       setShowCamera(false);
     }


     // Start animation sequence
     Animated.sequence([
       // 1. Fade in the red backdrop
       Animated.timing(backdropOpacity, {
         toValue: 1,
         duration: 300,
         useNativeDriver: true,
       }),
       // 2. Animate alert triangle in (slide up and fade in)
       Animated.parallel([
         Animated.timing(alertOpacity, {
           toValue: 1,
           duration: 400,
           easing: Easing.out(Easing.ease),
           useNativeDriver: true,
         }),
         Animated.spring(alertTranslateY, {
           toValue: 0,
           bounciness: 15,
           useNativeDriver: true,
         }),
       ]),
       // 3. Wait a moment
       Animated.delay(800),
       // 4. Animate alert triangle out (slide down and fade out)
       Animated.parallel([
         Animated.timing(alertOpacity, {
           toValue: 0,
           duration: 300,
           easing: Easing.in(Easing.ease),
           useNativeDriver: true,
         }),
         Animated.timing(alertTranslateY, {
           toValue: 50,
           duration: 300,
           easing: Easing.in(Easing.ease),
           useNativeDriver: true,
         }),
       ]),
     ]).start();
   } catch (error) {
     console.error('Error capturing photo:', error);
     Alert.alert('Error', 'Failed to capture photo');
   }
 };


 const [showSuccess, setShowSuccess] = useState(false);
 const cameraRef = useRef<any>(null);


 // Animation values
 const backdropOpacity = useRef(new Animated.Value(0)).current;
 const alertOpacity = useRef(new Animated.Value(0)).current;
 const alertTranslateY = useRef(new Animated.Value(50)).current;


 const handleSubmit = () => {
   if (!activity) {
     Alert.alert("Error", "No activity selected");
     return;
   }


   if (!reason.trim()) {
     Alert.alert(
       "No Reason Provided",
       "There is no reason for this dispute. Would you like to submit without a reason?",
       [
         { text: "Cancel", style: "cancel" },
         {
           text: "Submit Anyway",
           onPress: () => {
             console.log("Creating dispute without reason, photo:", photo);
             createDisputeAPI(activity.uuid, "", photo);
             setShowSuccess(true);
           }
         }
       ]
     );
     return;
   }


   // Create dispute with reason and photo if available
   console.log("Creating dispute with reason and photo:", reason.trim(), photo);
   createDisputeAPI(activity.uuid, reason.trim(), photo);
    // Show success page
   setShowSuccess(true);
 };


 const dismissKeyboard = () => {
   textInputRef.current?.blur();
 };


 // Auto-close success page after 1 second
 useEffect(() => {
   if (showSuccess) {
     const timer = setTimeout(() => {
       setShowSuccess(false);
       setReason("");
       setPhoto(null);
       onClose();
       onDisputeCreated();
     }, 1000);


     return () => clearTimeout(timer);
   }
 }, [showSuccess, onClose, onDisputeCreated]);


 if (!activity) return null;


 const IconComponent = getLucideIcon(activity.icon);
 const userName = getUserByEmailAPI(activity.user_email || "")?.name || "Unknown";


 {/* success page - shows confirmation that dispute was created successfully */}
 {/* example: user sees red page with "dispute successfully created" message after submitting */}
 if (showSuccess) {
   return (
     <Modal
       visible={visible}
       animationType="slide"
       presentationStyle="pageSheet"
       onRequestClose={onClose}
     >
       <TouchableOpacity
         style={styles.successContainer}
         onPress={() => {
           setShowSuccess(false);
           setReason("");
           setPhoto(null);
           onClose();
           onDisputeCreated();
         }}
         activeOpacity={1}
       >
         <ThemedText style={styles.successTitle}>Dispute Successfully Created</ThemedText>
       </TouchableOpacity>
     </Modal>
   );
 }


 {/* camera page - allows users to take a photo as evidence for their dispute */}
 if (showCamera) {
   return (
     <Modal
       visible={visible}
       animationType="slide"
       presentationStyle="pageSheet"
       onRequestClose={() => setShowCamera(false)}
     >
       <View style={styles.cameraContainer}>
         <ThemedText style={styles.cameraTitle}>Take a photo to dispute</ThemedText>
         <View style={styles.cameraViewContainer}>
           <CameraView
             ref={cameraRef}
             style={styles.camera}
           />
         </View>
         <TouchableOpacity
           style={styles.cameraButton}
           onPress={handlePhotoTaken}
         >
           <ThemedText style={styles.cameraButtonText}>Take Photo</ThemedText>
         </TouchableOpacity>


         {/* Backdrop */}
         <Animated.View
           style={[styles.backdrop, { opacity: backdropOpacity }]}
           pointerEvents="none"
         />


         {/*dispute created animation*/}
         <Animated.View
           style={[
             styles.alertContainer,
             {
               opacity: alertOpacity,
               transform: [{ translateY: alertTranslateY }],
             },
           ]}
           pointerEvents="none"
         >
           <AlertTriangle size={100} color="#E53E3E" strokeWidth={2} />
           <ThemedText style={styles.disputeCreatedText}>
             Dispute Created
           </ThemedText>
         </Animated.View>
       </View>
     </Modal>
   );
 }


 return (
   <Modal
     visible={visible}
     animationType="slide"
     presentationStyle="pageSheet"
     onRequestClose={onClose}
   >
     <KeyboardAvoidingView
       style={styles.keyboardAvoidingView}
       behavior={Platform.OS === "ios" ? "padding" : "height"}
     >
       <TouchableWithoutFeedback onPress={dismissKeyboard}>
         <ThemedView style={styles.container}>
           <View style={styles.header}>
             <ThemedText type="title">Dispute Chore</ThemedText>
             <TouchableOpacity onPress={onClose} style={styles.closeButton}>
               <X size={24} color="#687076" />
             </TouchableOpacity>
           </View>


           <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
             {/* chore info section - shows details about the chore being disputed */}
             {/* example: user disputes "vacuum living room" chore that was marked complete by john */}
             <View style={styles.choreInfo}>
               <View style={styles.iconContainer}>
                 <IconComponent size={32} color="#687076" />
               </View>
               <View style={styles.choreDetails}>
                 <ThemedText type="defaultSemiBold">{activity.name}</ThemedText>
                 <ThemedText style={styles.choreDescription}>
                   {activity.description}
                 </ThemedText>
                 <ThemedText style={styles.completedBy}>
                   Completed by {userName}
                 </ThemedText>
               </View>
             </View>


             {/* reason section - user explains why they're disputing the chore */}
             <View style={styles.formSection}>
               <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                 Reason for Dispute
               </ThemedText>
               <TextInput
                 ref={textInputRef}
                 style={styles.textInput}
                 value={reason}
                 onChangeText={setReason}
                 placeholder="Explain why you're disputing this chore..."
                 placeholderTextColor="#687076"
                 multiline
                 numberOfLines={4}
                 textAlignVertical="top"
               />
             </View>


             {/* photo evidence section - optional photo to support the dispute */}
             <View style={styles.photoSection}>
               <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                 Photo Evidene
               </ThemedText>
               <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                 <CameraIcon size={24} color="#687076" />
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
           </ScrollView>


           {/* action buttons section - user can cancel or submit the dispute */}
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
       </TouchableWithoutFeedback>
     </KeyboardAvoidingView>
   </Modal>
 );
}


const styles = StyleSheet.create({
 keyboardAvoidingView: {
   flex: 1,
 },
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
 scrollView: {
   flex: 1,
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
   color: "#687076",
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
   height: 200,
   borderRadius: 8,
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
   marginTop: 20,
 },
 cancelButton: {
   flex: 1,
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   borderWidth: 1,
   borderColor: "#e0e0e0",
   alignItems: "center",
   backgroundColor: "#718096",
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
   backgroundColor: "#38A169",
   paddingVertical: 12,
   paddingHorizontal: 16,
   borderRadius: 8,
   gap: 8,
 },
 submitButtonText: {
   color: "#fff",
   fontWeight: "600",
 },
 cameraContainer: {
   flex: 1,
   alignItems: "center",
   justifyContent: "center",
   padding: 20,
 },
 cameraTitle: {
   fontSize: 20,
   fontWeight: "bold",
   marginBottom: 20,
   color: "#fff",
 },
 cameraViewContainer: {
   width: "100%",
   aspectRatio: 1,
   backgroundColor: "black",
   marginBottom: 20,
   borderRadius: 10,
   overflow: "hidden",
 },
 camera: {
   flex: 1,
 },
 cameraButton: {
   backgroundColor: "#38A169",
   paddingVertical: 12,
   paddingHorizontal: 24,
   borderRadius: 8,
 },
 cameraButtonText: {
   color: "#fff",
   fontWeight: "600",
   fontSize: 16,
 },
 backdrop: {
   ...StyleSheet.absoluteFillObject,
   backgroundColor: "#E53E3E",
 },
 alertContainer: {
   ...StyleSheet.absoluteFillObject,
   justifyContent: "center",
   alignItems: "center",
 },
 disputeCreatedText: {
   fontSize: 24,
   fontWeight: "bold",
   color: "#E53E3E",
   marginTop: 10,
   textAlign: "center",
 },
 successContainer: {
   flex: 1,
   backgroundColor: "#E53E3E",
   justifyContent: "center",
   alignItems: "center",
   padding: 40,
   paddingTop: 80, // extra top padding to prevent text cutoff lol
 },
 successTitle: {
   color: "#fff",
   fontSize: 28,
   fontWeight: "bold",
   textAlign: "center",
   marginBottom: 40,
   lineHeight: 36, // Add line height to make sure  text is fully visible
 },


});

