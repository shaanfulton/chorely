import { CenterModal } from "@/components/CenterModal";
import { PresetChoreOption } from "@/components/PresetChoreOption";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet, View } from "react-native";

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

export function ChoreSelectionModal({
  visible,
  onClose,
  onSelectChore,
}: ChoreSelectionModalProps) {
  const handleSelectChore = (chore: ChoreOption | null) => {
    onSelectChore(chore);
    onClose();
  };

  return (
    <CenterModal visible={visible} onClose={onClose}>
      <ThemedView style={styles.container}>
        <View style={styles.header}></View>
        <View style={styles.content}>
          {COMMON_CHORES.map((chore, index) => (
            <PresetChoreOption
              key={index}
              chore={chore}
              onPress={() => handleSelectChore(chore)}
            />
          ))}

          <PresetChoreOption isCustom onPress={() => handleSelectChore(null)} />
        </View>
      </ThemedView>
    </CenterModal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
});
