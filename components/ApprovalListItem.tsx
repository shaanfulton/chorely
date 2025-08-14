import { Chore } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
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
      <Link
        href={{
          pathname: "/chore-view",
          params: { uuid: chore.uuid },
        }}
        asChild
      >
        <Pressable style={styles.choreInfo}>
          <View style={styles.iconContainer}>{Icon && <Icon />}</View>
          <View>
            <ThemedText type="defaultSemiBold">{chore.name}</ThemedText>
          </View>
        </Pressable>
      </Link>
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
