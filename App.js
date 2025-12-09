import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./src/screens/Home";
import RouteMap from "./src/screens/RouteMap";
import Login from "./app/auth/login";
import Signup from "./app/auth/signup";
import "nativewind/tailwind.css";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./src/services/firebase";
import React, { useEffect, useState } from "react";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userLogged) => {
      setUser(userLogged);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Mapa" component={RouteMap} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Cadastro" component={Signup}  />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
