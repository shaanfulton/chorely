import { TodoItem } from "@/data/mock";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CenterModal } from "./CenterModal";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ChecklistProps {
  items: TodoItem[];
}

export function Checklist({ items }: ChecklistProps) {
  const [selectedItem, setSelectedItem] = useState<TodoItem | null>(null);

  const handleItemPress = (item: TodoItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.itemContainer}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.checkbox} />
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedItem && (
        <CenterModal visible={!!selectedItem} onClose={handleCloseModal}>
          <ThemedView style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {selectedItem.name}
            </ThemedText>
            <ThemedText>{selectedItem.description}</ThemedText>
          </ThemedView>
        </CenterModal>
      )}
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
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
