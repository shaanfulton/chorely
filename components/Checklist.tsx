import { Colors } from "@/constants/Colors";
import { useChecklist } from "@/context/ChecklistContext";
import { TodoItem } from "@/data/mock";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ChecklistProps {
  items: TodoItem[];
  onItemPress: (item: TodoItem) => void;
  disabled?: boolean;
}

export function Checklist({
  items,
  onItemPress,
  disabled = false,
}: ChecklistProps) {
  const { completedItems, toggleItem } = useChecklist();

  return (
    <View style={styles.container}>
      <ScrollView>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                completedItems.has(item.name) && styles.checked,
                disabled && styles.disabled,
              ]}
              onPress={disabled ? undefined : () => toggleItem(item.name)}
              disabled={disabled}
            >
              {completedItems.has(item.name) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onItemPress(item)}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checked: {
    backgroundColor: Colors.metro.blue,
    borderColor: Colors.metro.blue,
  },
  checkmark: {
    color: "white",
    fontSize: 12,
  },
  disabled: {
    opacity: 0.5,
    borderColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
});
