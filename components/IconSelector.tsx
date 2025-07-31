import { ThemedText } from "@/components/ThemedText";
import { getLucideIcon } from "@/utils/iconUtils";
import React, { useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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

interface IconSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  selectedIcon?: string;
}

// Comprehensive list of chore-related lucide icons
const choreIcons = [
  // Cleaning & Maintenance
  "brush-cleaning",
  "trash",
  "bubbles",
  "spray-can",
  "hammer",
  "wrench",
  "paintbrush",
  "droplets",
  "wind",

  // Kitchen & Cooking
  "chef-hat",
  "utensils",
  "cup-soda",
  "refrigerator",
  "microwave",
  "cooking-pot",

  // Laundry & Clothing
  "shirt",
  "washing-machine",

  // Organizing & Storage
  "box",
  "package",
  "container",

  // Outdoor & Garden
  "flower",
  "leaf",
  "scissors",

  // Trash & Recycling
  "trash-2",
  "recycle",
  "delete",

  // Household & General
  "home",
  "bed",
  "bath",
  "car",
  "gift",
  "heart",

  // Electronics & Appliances
  "tv",
  "laptop",
  "smartphone",

  // Miscellaneous
  "key",
  "mail",
  "phone",
  "camera",
  "music",
];

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.7;
const CLOSED_POSITION = screenHeight;
const OPEN_POSITION = screenHeight - MODAL_HEIGHT;

export default function IconSelector({
  visible,
  onClose,
  onSelectIcon,
  selectedIcon,
}: IconSelectorProps) {
  const translateY = useSharedValue(CLOSED_POSITION);
  const context = useSharedValue({ y: 0 });

  const closeModal = () => {
    "worklet";
    translateY.value = withTiming(CLOSED_POSITION, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      translateY.value = Math.min(
        Math.max(newY, OPEN_POSITION),
        CLOSED_POSITION
      );
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 800) {
        closeModal();
      } else {
        translateY.value = withSpring(OPEN_POSITION, {
          damping: 15,
        });
      }
    });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(OPEN_POSITION, {
        damping: 15,
      });
    } else {
      translateY.value = withTiming(CLOSED_POSITION, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [OPEN_POSITION, CLOSED_POSITION],
      [0.5, 0]
    );
    return {
      opacity,
    };
  });

  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    closeModal();
  };

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
          <View style={styles.handle} />

          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Choose an Icon
            </ThemedText>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.iconGrid}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {choreIcons.map((iconName) => {
              const IconComponent = getLucideIcon(iconName);
              const isSelected = iconName === selectedIcon;

              return (
                <TouchableOpacity
                  key={iconName}
                  style={[
                    styles.iconButton,
                    isSelected && styles.selectedIconButton,
                  ]}
                  onPress={() => handleIconSelect(iconName)}
                >
                  {IconComponent ? (
                    <IconComponent
                      size={24}
                      color={isSelected ? "#007AFF" : "#666"}
                    />
                  ) : (
                    <ThemedText style={{ color: "red" }}>
                      Missing: {iconName}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
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
    height: MODAL_HEIGHT,
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iconGrid: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingBottom: 120,
  },
  iconButton: {
    width: 60,
    height: 60,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  selectedIconButton: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
});
