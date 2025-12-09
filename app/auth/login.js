import { useState } from "react";
import { Image, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/services/firebase";
import { Link, router } from "expo-router";
import logo from "../../assets/images/logo_hr.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao logar", "Verifique e-mail e senha");
    }
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain"/>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Login
      </Text>

      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.inputBox}
      />

      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.inputBox}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.btnEntrar}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Entrar</Text>
      </TouchableOpacity>

      <Link href="/auth/signup" asChild>
        <TouchableOpacity style={{ alignItems: "center", marginTop: 10 }}>
          <Text>Criar uma conta</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#e7e1d5",
    gap: 16,
  },
  logo: {
    width: 150, 
    height: 150, 
  
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16463f",
  },

  inputBox: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    width: 300,
  },
  btnEntrar: {
    backgroundColor: "#16463f",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    width: 200,
  },
});

