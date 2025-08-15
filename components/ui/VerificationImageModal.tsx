import { X } from "lucide-react-native";
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
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

// Custom Loading Component
function CustomLoadingSpinner() {
  const spinValue = new Animated.Value(0);
  const scaleValue = new Animated.Value(0.8);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    scaleAnimation.start();

    return () => {
      spinAnimation.stop();
      scaleAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingSpinnerContainer}>
      <Animated.View
        style={[
          styles.loadingSpinner,
          {
            transform: [
              { rotate: spin },
              { scale: scaleValue },
            ],
          },
        ]}
      >
        <View style={[styles.spinnerDot, { top: 2, left: 17 }]} />
        <View style={[styles.spinnerDot, { top: 6, left: 28 }]} />
        <View style={[styles.spinnerDot, { top: 17, left: 32 }]} />
        <View style={[styles.spinnerDot, { top: 28, left: 28 }]} />
        <View style={[styles.spinnerDot, { top: 32, left: 17 }]} />
        <View style={[styles.spinnerDot, { top: 28, left: 6 }]} />
        <View style={[styles.spinnerDot, { top: 17, left: 2 }]} />
        <View style={[styles.spinnerDot, { top: 6, left: 6 }]} />
      </Animated.View>
    </View>
  );
}

export function VerificationImageModal({
  visible,
  onClose,
  imageUrl,
  choreName,
}: VerificationImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imageRef = useRef<Image>(null);
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Reset loading state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      if (imageLoaded) {
        // Image was already loaded, show it immediately
        setIsLoading(false);
        setHasError(false);
      } else {
        // Start loading
        setIsLoading(true);
        setHasError(false);
        
        // Set a timeout to handle cached images that don't fire onLoad
        loadTimeoutRef.current = setTimeout(() => {
          if (isLoading) {
            // If still loading after 100ms, assume it's cached and show it
            setIsLoading(false);
            setImageLoaded(true);
          }
        }, 100);
      }
    }
  }, [visible, imageLoaded, isLoading]);

  // Reset imageLoaded state when imageUrl changes
  React.useEffect(() => {
    setImageLoaded(false);
    setIsLoading(true);
    setHasError(false);
  }, [imageUrl]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  if (!imageUrl) {
    return null;
  }

  const handleImageLoad = () => {
    // Clear the timeout since image loaded successfully
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = undefined;
    }
    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

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
            {isLoading && (
              <View style={styles.loadingContainer}>
                <CustomLoadingSpinner />
                <ThemedText style={styles.loadingText}>Loading image...</ThemedText>
              </View>
            )}
            
            {hasError && (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>Failed to load image</ThemedText>
              </View>
            )}

            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, (isLoading || hasError) && styles.hiddenImage]}
              resizeMode="contain"
              onLoad={handleImageLoad}
              onError={handleImageError}
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
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
  },
  hiddenImage: {
    opacity: 0,
  },
  loadingSpinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    position: "relative",
  },
  spinnerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
  },
});
