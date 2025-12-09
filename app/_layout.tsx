import { Stack } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#16463f", 
        },
        headerTintColor: "#fff",
        headerTitle: "HealthRoute",
        headerTitleAlign: "center",

        // botão voltar personalizado
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={{ fontSize: 30, color: "#fff", marginLeft: 14 }}>←</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
}
