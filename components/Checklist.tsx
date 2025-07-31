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
}

export function Checklist({ items, onItemPress }: ChecklistProps) {
  return (
    <View style={styles.container}>
      <ScrollView>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemContainer}
            onPress={() => onItemPress(item)}
          >
            <View style={styles.checkbox} />
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
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
  },
  itemText: {
    fontSize: 16,
  },
});
