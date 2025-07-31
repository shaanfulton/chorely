import { Tabs, router } from "expo-router";
import React, { useState } from "react";
import { Platform } from "react-native";

import { ChoreSelectionModal } from "@/components/ChoreSelectionModal";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { House, Plus } from "lucide-react-native";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateChore = (choreData: any) => {
    if (choreData) {
      // Navigate to create chore page with pre-filled data
      router.push({
        pathname: "/create-chore",
        params: {
          choreData: JSON.stringify(choreData),
        },
      });
    } else {
      // Navigate to create chore page with empty form
      router.push("/create-chore");
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.light.tint,
          headerShown: false,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <House size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="create-chore-tab"
          options={{
            title: "Create Chore",
            tabBarIcon: ({ color }) => <Plus size={28} color={color} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setModalVisible(true);
            },
          }}
        />
      </Tabs>
      <ChoreSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectChore={handleCreateChore}
      />
    </>
  );
}
