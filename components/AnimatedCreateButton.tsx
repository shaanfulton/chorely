import { Plus } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

interface AnimatedCreateButtonProps {
  color: string;
  modalVisible: boolean;
  onPress: () => void;
}

export function AnimatedCreateButton({
  color,
  modalVisible,
  onPress,
}: AnimatedCreateButtonProps) {
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const backgroundScaleAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Animate icon rotation, background, and position when modal visibility changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotationAnim, {
        toValue: modalVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundScaleAnim, {
        toValue: modalVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: modalVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalVisible, rotationAnim, backgroundScaleAnim, translateYAnim]);

  // Create animated styles for the container and icon
  const containerAnimatedStyle = {
    transform: [
      {
        translateY: translateYAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10], // Move down 10px when modal opens
        }),
      },
    ],
  };

  const iconAnimatedStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "45deg"],
        }),
      },
    ],
  };

  const backgroundAnimatedStyle = {
    transform: [
      {
        scale: backgroundScaleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[
        {
          position: "relative",
          width: 28,
          height: 28,
          alignItems: "center",
          justifyContent: "center",
        },
        containerAnimatedStyle,
      ]}
    >
      {/* Animated background circle */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#000",
            top: -4,
            left: -4,
            zIndex: 0,
          },
          backgroundAnimatedStyle,
        ]}
      />
      {/* Animated icon */}
      <Animated.View style={iconAnimatedStyle}>
        <Plus size={28} color={modalVisible ? "#fff" : color} />
      </Animated.View>
    </Animated.View>
  );
}
