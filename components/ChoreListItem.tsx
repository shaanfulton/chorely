import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChoreProvider } from "@/context/ChoreContext";
import { Chore } from "@/data/mock";
import { getLucideIcon } from "@/utils/iconUtils";
import { Link } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export function ChoreListItem({
  chore,
  children,
}: {
  chore: Chore;
  children?: React.ReactNode;
}) {
  // Get the lucide icon component using utility function
  const IconComponent = getLucideIcon(chore.icon);
  return (
    <Link
      href={{
        pathname: "/chore-view",
        params: { uuid: chore.uuid },
      }}
      asChild
    >
      <Pressable>
        <ThemedView style={styles.container}>
          <View style={styles.iconContainer}>
            <IconComponent size={24} color="#666" />
          </View>
          <View style={styles.textContainer}>
            <ThemedText type="defaultSemiBold">{chore.name}</ThemedText>
            <ThemedText type="default">{chore.time}</ThemedText>
          </View>
          <View>
            <ChoreProvider chore={chore}>{children}</ChoreProvider>
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 5,
    backgroundColor: "#E0E0E0", // Example color
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
});
