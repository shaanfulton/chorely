import { GlobalChoreProvider, useGlobalChores } from "@/context/ChoreContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Authentication wrapper component
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { currentUser, userHomes } = useGlobalChores();

  useEffect(() => {
    const inAuthGroup =
      (segments as string[]).includes("login") ||
      (segments as string[]).includes("signup") ||
      (segments as string[]).includes("signup-home-selection");

    if (!currentUser && !inAuthGroup) {
      // User is not authenticated and not on auth pages, redirect to login
      router.replace("/login" as any);
    } else if (currentUser && !inAuthGroup && userHomes.length === 0) {
      // User is authenticated but has no homes, redirect to home selection
      router.replace("/signup-home-selection");
    } else if (currentUser && inAuthGroup && userHomes.length > 0) {
      // User is authenticated with homes but on auth pages, redirect to main app
      router.replace("/(tabs)");
    }
  }, [currentUser, userHomes, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <GlobalChoreProvider>
        <AuthWrapper>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="signup" options={{ headerShown: false }} />
              <Stack.Screen
                name="signup-home-selection"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="create-chore"
                options={{
                  title: "Create Chore",
                  headerBackTitle: "Back",
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "600",
                  },
                }}
              />
              <Stack.Screen
                name="chore-view"
                options={{
                  title: "",
                  headerBackTitle: "Back",
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "600",
                  },
                }}
              />
              <Stack.Screen
                name="chore-validate"
                options={{
                  title: "",
                  headerBackTitle: "Back",
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "600",
                  },
                }}
              />
              <Stack.Screen
                name="user-settings"
                options={{
                  title: "User Settings",
                  headerBackTitle: "Back",
                  headerBackButtonDisplayMode: "minimal",
                  headerTitleStyle: {
                    fontSize: 20,
                    fontWeight: "600",
                  },
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </AuthWrapper>
      </GlobalChoreProvider>
    </SafeAreaProvider>
  );
}
