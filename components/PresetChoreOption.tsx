import { ThemedText } from "@/components/ThemedText";
import { getLucideIcon } from "@/utils/iconUtils";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ChoreOption {
  name: string;
  icon: string;
  description?: string;
}

interface PresetChoreOptionProps {
  chore?: ChoreOption;
  onPress: () => void;
  isCustom?: boolean;
}

export function PresetChoreOption({
  chore,
  onPress,
  isCustom = false,
}: PresetChoreOptionProps) {
  const renderIcon = () => {
    if (isCustom) {
      return <Text style={styles.plusIcon}>+</Text>;
    }

    if (chore?.icon) {
      const IconComponent = getLucideIcon(chore.icon);
      return <IconComponent size={24} color="#666" />;
    }

    return null;
  };

  const title = isCustom ? "Custom Chore" : chore?.name || "";
  const description = isCustom
    ? "Create your own custom chore"
    : chore?.description || "";

  return (
    <TouchableOpacity style={styles.choreOption} onPress={onPress}>
      <View style={styles.iconContainer}>{renderIcon()}</View>
      <View style={styles.textContainer}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  choreOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  urgencyText: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#666",
  },
});
