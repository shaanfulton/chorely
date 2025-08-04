import { Colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  backgroundColor?: string;
  loadingBackgroundColor?: string;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
}

export function Button({
  title,
  backgroundColor = Colors.metro.blue,
  loadingBackgroundColor,
  isLoading = false,
  size = "small",
  disabled,
  style,
  ...props
}: ButtonProps) {
  const currentBackgroundColor =
    isLoading && loadingBackgroundColor
      ? loadingBackgroundColor
      : backgroundColor;

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  const textSizeStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles[size],
        { backgroundColor: currentBackgroundColor },
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <Text style={[styles.buttonText, textSizeStyles[size]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 120,
  },
  // Text size variants
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
});
