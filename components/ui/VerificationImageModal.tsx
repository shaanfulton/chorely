import { X } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface VerificationImageModalProps {
  visible: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  choreName: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export function VerificationImageModal({
  visible,
  onClose,
  imageUrl,
  choreName,
}: VerificationImageModalProps) {
  if (!imageUrl) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <ThemedText
              type="defaultSemiBold"
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {choreName} - Verification
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <ThemedText style={styles.caption}>
            Verification photo for completed chore
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: screenWidth * 0.8,
    height: 350,
    borderRadius: 8,
  },
  caption: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
  },
});
