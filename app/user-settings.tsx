import { Button } from "@/components/Button";
import { ThemedView } from "@/components/ThemedView";
import {
  HomeManagement,
  HomeSwitcher,
  UserInformation,
} from "@/components/settings";
import { useGlobalChores } from "@/context/ChoreContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

export default function UserSettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { logoutUser } = useGlobalChores();

  const handleLogout = () => {
    logoutUser();
    router.replace("/login");
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <UserInformation />
        <HomeSwitcher isLoading={isLoading} setIsLoading={setIsLoading} />
        <HomeManagement isLoading={isLoading} setIsLoading={setIsLoading} />
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            backgroundColor="#dc3545"
            size="large"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
});
