import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as Location from "expo-location";
import { auth, db } from "../../src/services/firebase";
import { collection, addDoc } from "firebase/firestore";
import { router } from "expo-router";

export default function AddDomicilio() {
  const [nomeDomicilio, setNomeDomicilio] = useState("");
  const [endereco, setEndereco] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [moradorNome, setMoradorNome] = useState("");
  const [moradores, setMoradores] = useState([
    { nome: "", idade: "", funcao: "", notas: "" },
  ]);
  const [observacao, setObservacao] = useState("");

  useEffect(() => {
  (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão", "Permita o uso da localização nas configurações para utilizar geocodificação.");
      }
    } catch (err) {
      console.log("Erro permissão location:", err);
    }
  })();
}, []);


  async function obterEnderecoAtual() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Erro", "Habilite a localização.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({});
      setLatitude(pos.coords.latitude.toString());
      setLongitude(pos.coords.longitude.toString());

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      const enderecoFormatado =
        `${geo.street || ""} ${geo.name || ""}, ${geo.district || ""}, ${geo.city || ""}`.trim();

      setEndereco(enderecoFormatado);

      Alert.alert("Localização Detectada", enderecoFormatado);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível identificar a localização.");
    }
  }

  function adicionarMorador() {
    setMoradores([...moradores, { nome: "", idade: "", funcao: "", notas: "" }]);
    setMoradorNome("");
  }

  function removerMorador(i) {
    if (moradores.length === 1) return;
    const lista = moradores.filter((_, index) => index !== i);
    setMoradores(lista);
  }

   async function salvarDomicilio() {
    if (!nomeDomicilio.trim()) {
      Alert.alert("Erro", "Informe o nome do domicílio!");
      return;
    }

    if (!endereco.trim() && (!latitude || !longitude)) {
      Alert.alert("Erro", "Informe o endereço ou use a localização atual!");
      return;
    }

    const moradoresValidos = moradores.filter((m) => (m.nome || "").trim() !== "");
    if (moradoresValidos.length === 0) {
      Alert.alert("Erro", "Adicione ao menos um morador com nome preenchido!");
      return;
    }

    let lat = latitude ? Number(latitude) : null;
    let lon = longitude ? Number(longitude) : null;

    try {
      if ((!lat || !lon) && endereco && endereco.trim()) {
        const geo = await Location.geocodeAsync(endereco.trim());
        if (Array.isArray(geo) && geo.length > 0) {
          lat = geo[0].latitude;
          lon = geo[0].longitude;
        } else {
          Alert.alert("Erro", "Endereço não encontrado. Verifique e tente novamente.");
          return;
        }
      }

      if (typeof lat !== "number" || typeof lon !== "number" || isNaN(lat) || isNaN(lon)) {
        Alert.alert("Erro", "Não foi possível obter coordenadas válidas.");
        return;
      }

      await addDoc(collection(db, "domicilios"), {
        nome: nomeDomicilio.trim(),
        endereco: endereco.trim() || "Sem endereço informado",
        latitude: lat,
        longitude: lon,
        moradores: moradoresValidos,
        observacao,
        visitado: false,
        userId: auth.currentUser.uid,
        dataCadastro: new Date(),
      });

      Alert.alert("Sucesso", "Domicílio cadastrado!");
      router.push("/map");
    } catch (e) {
      console.log("Falha ao salvar domicilio:", e);
      Alert.alert("Erro", "Falha ao salvar! Veja o console para mais detalhes.");
    }
  }
  
  
  return (
    <ScrollView  contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastrar Domicílio</Text>

      <Text style={styles.label}>Nome do Domicílio *</Text>
      <TextInput
        placeholder="Casa Silva, Casa da Maria..."
        style={styles.input}
        value={nomeDomicilio}
        onChangeText={setNomeDomicilio}
      />

      {/* ENDEREÇO */}
      <Text style={styles.label}>Endereço *</Text>
      <TextInput
        style={styles.input}
        value={endereco}
        onChangeText={setEndereco}
        placeholder="Digite o endereço"
      />

      <TouchableOpacity onPress={obterEnderecoAtual} style={styles.botaoSec}>
        <Text style={styles.botaoSecText}>Usar localização atual</Text>
      </TouchableOpacity>


      {/* MORADORES */}
      <Text style={styles.subtitulo}>Moradores</Text>

      {moradores.map((m, i) => (
        <View key={i} style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Nome do morador *"
            value={m.nome}
            onChangeText={(txt) => {
              const clone = [...moradores];
              clone[i].nome = txt;
              setMoradores(clone);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Idade *"
            keyboardType="numeric"
            value={m.idade}
            onChangeText={(txt) => {
              const clone = [...moradores];
              clone[i].idade = txt;
              setMoradores(clone);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Função/Ocupação (opcional)"
            value={m.funcao}
            onChangeText={(txt) => {
              const clone = [...moradores];
              clone[i].funcao = txt;
              setMoradores(clone);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Observações do morador (opcional)"
            value={m.notas}
            onChangeText={(txt) => {
              const clone = [...moradores];
              clone[i].notas = txt;
              setMoradores(clone);
            }}
          />

          {moradores.length > 1 && (
            <TouchableOpacity
              onPress={() => removerMorador(i)}
              style={styles.btnRemover}
            >
              <Text style={{ color: "#fff" }}>Remover</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <TouchableOpacity onPress={adicionarMorador} style={styles.btnAdd}>
        <Text style={styles.botaoSecText}>+ Adicionar morador</Text>
      </TouchableOpacity>

      {/* OBSERVAÇÃO */}
      <Text style={styles.label}>Observação do domicílio (opcional)</Text>
      <TextInput
        style={[styles.input, { height: 70 }]}
        textAlignVertical="top"
        multiline
        value={observacao}
        onChangeText={setObservacao}
        placeholder="Informações adicionais"
      />

      <TouchableOpacity onPress={salvarDomicilio} style={styles.botaoSalvar}>
        <Text style={styles.botaoSalvarText}>Salvar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#e7e1d5",  },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 14, color: "#16463f", },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "600", color: "#16463f", },
  subtitulo: { fontSize: 18, fontWeight: "600", marginTop: 20, color: "#16463f", },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  botaoSec: {
    backgroundColor: "#fe5658",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
    alignItems: "center",
  },
  botaoSecText: { color: "#fff", fontWeight: "bold" },
  row: { flexDirection: "row", gap: 10 },
  card: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  btnRemover: {
    backgroundColor: "#A00000",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 6,
  },
  btnAdd: {
    backgroundColor: "#2E7D32",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoSalvar: {
    backgroundColor: "#64a002",
    marginTop: 20,
    marginBottom: 70,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoSalvarText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
