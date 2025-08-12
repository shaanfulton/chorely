import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useGlobalChores } from "@/context/ChoreContext";
import { Chore, getChoreByIdAPI } from "@/data/api";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BadgeCheck, Camera } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Image as RNImage } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";
import { GestureHandlerRootView, PanGestureHandler, PinchGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandlerGestureEvent } from "react-native-gesture-handler";

export default function ChoreValidate() {
  const router = useRouter();
  const { uuid } = useLocalSearchParams();
  const { completeChore } = useGlobalChores();
  const [isAnimating, setIsAnimating] = useState(false);
  const [chore, setChore] = useState<Chore | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(
    null
  );
  const [canAskCameraPermissionAgain, setCanAskCameraPermissionAgain] =
    useState<boolean>(true);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [editedUri, setEditedUri] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [pinchScale, setPinchScale] = useState(1);
  const [baseTranslate, setBaseTranslate] = useState({ x: 0, y: 0 });
  const [gestureTranslate, setGestureTranslate] = useState({ x: 0, y: 0 });
  const minScaleRef = useRef(1);

  // Animation values
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkTranslateY = useRef(new Animated.Value(50)).current;

  // Get chore data when component mounts or UUID changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (uuid) {
        const foundChore = await getChoreByIdAPI(uuid as string);
        if (isMounted) {
          setChore(foundChore ?? null);
        }
      }
      // Load existing camera permission status
      const currentPerm = await ImagePicker.getCameraPermissionsAsync();
      if (isMounted) {
        setHasCameraPermission(currentPerm.granted);
        setCanAskCameraPermissionAgain(currentPerm.canAskAgain ?? true);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [uuid]);

  const handleTakePhoto = async () => {
    if (uuid && !isAnimating) {
      setIsAnimating(true);

      try {
        // Ensure camera permission
        let granted = hasCameraPermission === true;
        if (!granted) {
          const req = await ImagePicker.requestCameraPermissionsAsync();
          granted = req.granted;
        }
        if (!granted) {
          setIsAnimating(false);
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

        if (result.canceled) {
          setIsAnimating(false);
          return;
        }

        const asset = result.assets?.[0];
        if (asset?.uri) {
          setCapturedUri(asset.uri);
          setEditedUri(asset.uri);
          setIsConfirming(true);
          // measure image
          RNImage.getSize(asset.uri, (w: number, h: number) => {
            setNaturalSize({ width: w, height: h });
          }, () => {});
          setIsAnimating(false);
          return; // Wait for user to confirm
        }

        // No asset, just stop
        setIsAnimating(false);
        return;

        // Start animation sequence (moved to confirm)
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

  const handleConfirm = async () => {
    if (!uuid || !editedUri) return;
    setIsAnimating(true);
    try {
      await completeChore(uuid as string);

      Animated.sequence([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
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
        Animated.delay(800),
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
        router.push("/");
      });
    } catch (error) {
      console.error("Failed to complete chore:", error);
      setIsAnimating(false);
    }
  };


  if (hasCameraPermission !== true) {
    // Camera permissions are not granted yet or unknown
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={{ textAlign: "center", marginBottom: 20 }}>
          We need your permission to use the camera
        </ThemedText>
        <Button
          onPress={async () => {
            if (canAskCameraPermissionAgain) {
              const req = await ImagePicker.requestCameraPermissionsAsync();
              setHasCameraPermission(req.granted);
              setCanAskCameraPermissionAgain(req.canAskAgain ?? false);
            } else {
              // Permanently denied; open system settings via expo-linking
              Linking.openSettings();
            }
          }}
          title={canAskCameraPermissionAgain ? "Grant Permission" : "Open Settings"}
          size="medium"
        />
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Take a photo to verify</ThemedText>

      <>
          <View style={styles.cameraContainer}>
            {editedUri ? (
              <ExpoImage source={{ uri: editedUri }} style={styles.camera} contentFit="cover" />
            ) : (
              <View style={[styles.camera, styles.placeholder]}>
                <Camera color="#9CA3AF" size={36} />
                <ThemedText style={styles.placeholderText}>No photo yet</ThemedText>
              </View>
            )}
          </View>

          {!isConfirming ? (
            <Button
              title="Take Photo"
              onPress={handleTakePhoto}
              disabled={isAnimating}
              isLoading={isAnimating}
              size="large"
            />
          ) : (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                title="Retake"
                backgroundColor="#6B7280"
                onPress={handleTakePhoto}
                size="medium"
              />
              
              <Button
                title="Confirm"
                backgroundColor="#2563EB"
                onPress={handleConfirm}
                size="medium"
                isLoading={isAnimating}
              />
            </View>
          )}
      </>

      

      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropOpacity }]}
        pointerEvents="none"
      />

      {/* Check mark and points */}
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
        {chore && (
          <ThemedText style={styles.pointsText}>+{chore.points} points</ThemedText>
        )}
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "white",
  },
  checkContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 10,
    textAlign: "center",
  },
});
