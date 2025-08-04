import { Chore } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface ApprovalListItemProps {
  chore: Chore;
  children: React.ReactNode;
}

export const ApprovalListItem: React.FC<ApprovalListItemProps> = ({
  chore,
  children,
}) => {
  const Icon = getLucideIcon(chore.icon);

  return (
    <View style={styles.container}>
      <View style={styles.choreInfo}>
        <View style={styles.iconContainer}>{Icon && <Icon />}</View>
        <View>
          <ThemedText type="defaultSemiBold">{chore.name}</ThemedText>
          <ThemedText type="default">{chore.time}</ThemedText>
        </View>
      </View>
      <View style={styles.buttonContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
    borderColor: "#E0E0E0",
    borderWidth: 2,
  },
  choreInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    width: "100%",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 10,
    width: "100%",
  },
});
