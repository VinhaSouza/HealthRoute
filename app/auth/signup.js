import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../src/services/firebase";
import { Link, router } from "expo-router";
import logo from "../../assets/images/logo_hr.png";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    if (!email || !password) {
      return Alert.alert("Ops!", "Preencha todos os campos!");
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Conta criada!", "Agora faça login 😊");
      router.replace("/auth/login");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro ao cadastrar", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain"/>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>
        Criar Conta
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
        onPress={handleSignup}
        style={styles.btnEntrar}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Cadastrar</Text>
      </TouchableOpacity>

      <Link href="/auth/login" asChild>
        <TouchableOpacity style={{ alignItems: "center", marginTop: 10 }}>
          <Text>Já tem conta? Entrar</Text>
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
    width: 150, // largura
    height: 150, // altura
    
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