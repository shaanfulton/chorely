import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BadgeCheck } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

export default function ChoreValidate() {
  const router = useRouter();
  const { uuid } = useLocalSearchParams();
  const { completeChore } = useGlobalChores();
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkTranslateY = useRef(new Animated.Value(50)).current;

  const handleTakePhoto = async () => {
    if (uuid && !isAnimating) {
      setIsAnimating(true);

      try {
        await completeChore(uuid as string);

        // Start animation sequence
        Animated.sequence([
          // 1. Fade in the white backdrop
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // 2. Animate checkmark in (slide up and fade in)
          Animated.parallel([
            Animated.timing(checkOpacity, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.spring(checkTranslateY, {
              toValue: 0,
              bounciness: 15,
              useNativeDriver: true,
            }),
          ]),
          // 3. Wait a moment
          Animated.delay(800),
          // 4. Animate checkmark out (slide down and fade out)
          Animated.parallel([
            Animated.timing(checkOpacity, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(checkTranslateY, {
              toValue: 50,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // Navigate to main view after animation completes
          router.push("/");
        });
      } catch (error) {
        console.error("Failed to complete chore:", error);
        setIsAnimating(false);
        // Could show an error toast here
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: "center", marginBottom: 20 }}>
          We need your permission to show the camera
        </ThemedText>
        <Button
          onPress={requestPermission}
          title="Grant Permission"
          size="medium"
        />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Take a photo to verify</ThemedText>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} />
      </View>
      <Button
        title="Take Photo"
        onPress={handleTakePhoto}
        disabled={isAnimating}
        isLoading={isAnimating}
        size="large"
      />

      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="none"
      />

      {/* Check mark */}
      <Animated.View
        style={[
          styles.checkContainer,
          {
            opacity: checkOpacity,
            transform: [{ translateY: checkTranslateY }],
          },
        ]}
        pointerEvents="none"
      >
        <BadgeCheck size={100} color="#4CAF50" strokeWidth={2} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cameraContainer: {
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  checkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});
