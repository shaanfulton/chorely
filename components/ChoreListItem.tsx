import { PointTag } from "@/components/PointTag";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ChoreProvider } from "@/context/ChoreContext";
import { Chore } from "@/data/api";
import { getLucideIcon } from "@/utils/iconUtils";
import { getTimeRemaining } from "@/utils/timeUtils";
import { Link } from "expo-router";
import { Clock, Camera } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View, TouchableOpacity } from "react-native";
import { VerificationImageModal } from "./ui/VerificationImageModal";

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
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <ThemedView style={styles.container}>
        <Link
          href={{
            pathname: "/chore-view",
            params: { uuid: chore.uuid },
          }}
          asChild
        >
          <Pressable style={styles.leftContent}>
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
          </Pressable>
        </Link>
        <View style={styles.rightContent} pointerEvents="box-none">
          <ChoreProvider chore={chore}>{children}</ChoreProvider>
          {/* Show photo button for completed chores */}
          {chore.status === "complete" && chore.photo_url && (
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => setShowImageModal(true)}
            >
              <Camera size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

      <VerificationImageModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={chore.photo_url}
        choreName={chore.name}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginVertical: 5,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rightContent: {
    marginLeft: 12,
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
  photoButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
});
