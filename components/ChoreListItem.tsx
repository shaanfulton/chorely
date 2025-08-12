import { PointTag } from "@/components/PointTag";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChoreProvider } from "@/context/ChoreContext";
import { Chore } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { getTimeRemaining } from "@/utils/timeUtils";
import { Link } from "expo-router";
import { Clock } from "lucide-react-native";
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
  const timeRemaining = getTimeRemaining(chore.time);

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
            {chore.status !== "unclaimed" && (
              <View style={styles.timeContainer}>
                <Clock size={14} color={timeRemaining.color} />
                <ThemedText
                  type="default"
                  style={[styles.timeText, { color: timeRemaining.color }]}
                >
                  {timeRemaining.text}
                </ThemedText>
              </View>
            )}
            {chore.status !== "claimed" && (
              <View style={styles.pointsContainer}>
                <PointTag points={chore.points} size="small" />
              </View>
            )}
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
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  pointsContainer: {
    marginTop: 6,
  },
});
