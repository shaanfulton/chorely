import { useGlobalChores } from "@/context/ChoreContext";
import { Chore, createDisputeAPI } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { Camera, Send, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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
  const { currentUser } = useGlobalChores();
  const [reason, setReason] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [canAskCameraPermissionAgain, setCanAskCameraPermissionAgain] =
    useState<boolean>(true);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Animation values for the splash screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Single close handler to prevent multiple calls
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    // Reset form state
    setReason("");
    setPhoto(null);
    setIsTakingPhoto(false);
    setShowSuccess(false);

    // Call the parent's onClose
    onClose();

    // Reset closing state after a short delay
    setTimeout(() => setIsClosing(false), 300);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setReason("");
      setPhoto(null);
      setIsTakingPhoto(false);
      setShowSuccess(false);
      setIsClosing(false);
      // Reset animation values
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible, fadeAnim, scaleAnim]);

  // Auto-close success page after 1 second with animation
  useEffect(() => {
    if (showSuccess) {
      // Start animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        // Fade out animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSuccess(false);
          setReason("");
          setPhoto(null);
          onClose();
          onDisputeCreated();
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess, onClose, onDisputeCreated, fadeAnim, scaleAnim]);

  useEffect(() => {
    // Load existing camera permission status
    const loadPermissions = async () => {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      setHasCameraPermission(currentPerm.granted);
      setCanAskCameraPermissionAgain(currentPerm.canAskAgain ?? true);
    };
    loadPermissions();
  }, []);

  const takePhoto = async () => {
    if (isTakingPhoto) return;
    setIsTakingPhoto(true);

    try {
      // Ensure camera permission
      let granted = hasCameraPermission === true;
      if (!granted) {
        const req = await ImagePicker.requestCameraPermissionsAsync();
        granted = req.granted;
        setHasCameraPermission(req.granted);
        setCanAskCameraPermissionAgain(req.canAskAgain ?? false);
      }

      if (!granted) {
        if (!canAskCameraPermissionAgain) {
          Alert.alert(
            "Camera Permission Required",
            "Please enable camera access in Settings to take photos.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
        setIsTakingPhoto(false);
        return;
      }

      // Open the system camera UI
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
        exif: false,
        base64: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Error", "Please provide a reason for the dispute");
      return;
    }

    if (!activity) {
      Alert.alert("Error", "No activity selected");
      return;
    }

    if (!currentUser?.email) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {
      // Create dispute with photo if available
      await createDisputeAPI(
        activity.uuid,
        reason.trim(),
        photo,
        currentUser.email
      );

      // Show success page
      setShowSuccess(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create dispute. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  if (!activity) return null;

  const IconComponent = getLucideIcon(activity.icon);

  // Helper function to get user name from email
  const getUserName = (email: string | null) => {
    if (!email) return "Unknown User";
    return email.split("@")[0];
  };

  // Success page - shows confirmation that dispute was created successfully
  if (showSuccess) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <TouchableOpacity
          style={styles.successContainer}
          onPress={() => {
            setShowSuccess(false);
            setReason("");
            setPhoto(null);
            handleClose();
            onDisputeCreated();
          }}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              styles.successContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ThemedText style={styles.successTitle}>
              Dispute Successfully Created
            </ThemedText>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ThemedView style={styles.container}>
          <View style={styles.header}>
            <ThemedText
              type="title"
              style={styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Dispute Chore
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.choreInfo}>
              <View style={styles.iconContainer}>
                <IconComponent size={32} color="#666" />
              </View>
              <View style={styles.choreDetails}>
                <ThemedText type="defaultSemiBold" style={styles.choreName}>
                  {activity.name}
                </ThemedText>
                <ThemedText style={styles.choreDescription}>
                  {activity.description}
                </ThemedText>
                <ThemedText style={styles.completedBy}>
                  Completed by {getUserName(activity.user_email)}
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
                numberOfLines={6}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>

            <View style={styles.photoSection}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Photo Evidence (Optional)
              </ThemedText>

              <View style={styles.cameraContainer}>
                {photo ? (
                  <ExpoImage
                    source={{ uri: photo }}
                    style={styles.camera}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.camera, styles.placeholder]}>
                    <Camera color="#9CA3AF" size={36} />
                    <ThemedText style={styles.placeholderText}>
                      No photo yet
                    </ThemedText>
                  </View>
                )}

                {/* Overlay button on top of the photo */}
                <TouchableOpacity
                  style={styles.photoButtonOverlay}
                  onPress={takePhoto}
                  disabled={isTakingPhoto}
                >
                  <Camera size={24} color="#fff" />
                  <ThemedText style={styles.photoButtonTextOverlay}>
                    {isTakingPhoto
                      ? "Taking Photo..."
                      : photo
                      ? "Retake Photo"
                      : "Take Photo"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Send size={16} color="#fff" />
              <ThemedText style={styles.submitButtonText}>
                Submit Dispute
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
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
  scrollContent: {
    flex: 1,
    marginBottom: 0,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 20,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
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
  choreName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
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
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
  photoSection: {
    marginBottom: 24,
  },
  cameraContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "#F3F4F6",
    marginBottom: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#9CA3AF",
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
  photoButtonOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  photoButtonTextOverlay: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
    backgroundColor: "transparent",
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
  successContainer: {
    flex: 1,
    backgroundColor: "#E53E3E",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    paddingTop: 80, // extra top padding to prevent text cutoff
  },
  successContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 36, // Add line height to make sure text is fully visible
  },
});
