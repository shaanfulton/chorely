import { PresetChoreOption } from "@/components/PresetChoreOption";
import { ThemedView } from "@/components/ThemedView";
import React, { useEffect } from "react";
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

interface ChoreOption {
  name: string;
  icon: string;
  description?: string;
}

interface ChoreSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectChore: (chore: ChoreOption | null) => void;
}

const COMMON_CHORES: ChoreOption[] = [
  {
    name: "Trash",
    icon: "trash-2",
    description: "Take out trash and recycling",
  },
  {
    name: "Sweeping",
    icon: "brush",
    description: "Sweep floors throughout the house",
  },
  {
    name: "Dishes",
    icon: "droplets",
    description: "Wash and dry dishes",
  },
  {
    name: "Vacuum",
    icon: "wind",
    description: "Vacuum carpets and rugs",
  },
];

const { height: screenHeight } = Dimensions.get("window");
const MODAL_HEIGHT = screenHeight * 0.8;
const TOP_POSITION = (screenHeight - MODAL_HEIGHT) / 2;

export function ChoreSelectionModal({
  visible,
  onClose,
  onSelectChore,
}: ChoreSelectionModalProps) {
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

  const handleSelectChore = (chore: ChoreOption | null) => {
    onSelectChore(chore);
    closeModal();
  };

  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchEnd={closeModal}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.modalContainer, animatedStyle]}>
          <ThemedView style={styles.container}>
            <View style={styles.handle} />
            <View style={styles.header}></View>
            <View style={styles.content}>
              {COMMON_CHORES.map((chore, index) => (
                <PresetChoreOption
                  key={index}
                  chore={chore}
                  onPress={() => handleSelectChore(chore)}
                />
              ))}

              <PresetChoreOption
                isCustom
                onPress={() => handleSelectChore(null)}
              />
            </View>
          </ThemedView>
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
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    marginTop: 20,
  },
});
