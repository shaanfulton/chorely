import React, { ReactNode, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface CenterModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.8;
const TOP_POSITION = (screenHeight - MODAL_HEIGHT) / 2;

export function CenterModal({ visible, onClose, children }: CenterModalProps) {
  const translateY = useSharedValue(screenHeight);
  const context = useSharedValue({ y: 0 });

  const closeModal = () => {
    "worklet";
    translateY.value = withTiming(screenHeight, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      translateY.value = Math.min(Math.max(newY, TOP_POSITION), screenHeight);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 800) {
        closeModal();
      } else {
        translateY.value = withSpring(TOP_POSITION, {
          damping: 15,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(TOP_POSITION, {
        damping: 15,
      });
    } else {
      translateY.value = withTiming(screenHeight, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [TOP_POSITION, screenHeight],
      [1, 0]
    );
    return {
      transform: [{ translateY: translateY.value }],
      opacity,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [TOP_POSITION, screenHeight],
      [0.5, 0]
    );
    return {
      opacity,
    };
  });

  if (!visible) {
    return null;
  }

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchEnd={closeModal}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <View style={styles.container}>
            <View style={styles.handle} />
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 1)",
  },
  modalContainer: {
    position: "absolute",
    height: "auto",
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 12,
    borderRadius: 2,
  },
});
