import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface UrgencySelectorProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  colors?: {
    low: string;
    medium: string;
    high: string;
  };
}

export default function UrgencySelector({
  options,
  selectedIndex,
  onSelect,
  colors = {
    low: "#4CAF50",
    medium: "#FFC107",
    high: "#F44336",
  },
}: UrgencySelectorProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  const getBackgroundColor = (index: number) => {
    if (options.length === 1) return colors.low;
    if (options.length === 2) {
      return index === 0 ? colors.low : colors.high;
    }

    // For 3 or more options
    if (index === 0) return colors.low;
    if (index === options.length - 1) return colors.high;
    return colors.medium;
  };

  const getCurrentBackgroundColor = () => {
    return getBackgroundColor(selectedIndex);
  };

  useEffect(() => {
    if (containerWidth > 0) {
      const optionWidth = containerWidth / options.length;

      Animated.spring(translateX, {
        toValue: selectedIndex * optionWidth,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
    }
  }, [selectedIndex, options.length, containerWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const selectorWidth = 100 / options.length;

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer} onLayout={handleLayout}>
        {/* Moving background rectangle */}
        <Animated.View
          style={[
            styles.backgroundRect,
            {
              backgroundColor: getCurrentBackgroundColor(),
              width: `${selectorWidth}%`,
              transform: [{ translateX }],
            },
          ]}
        />

        {/* Option buttons */}
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.option, { width: `${selectorWidth}%` }]}
            onPress={() => onSelect(index)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.optionText,
                selectedIndex === index && styles.selectedText,
              ]}
            >
              {option}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    position: "relative",
    overflow: "hidden",
    height: 50,
  },
  backgroundRect: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    borderRadius: 25,
    zIndex: 1,
  },
  option: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    zIndex: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  selectedText: {
    color: "#FFFFFF",
  },
});
