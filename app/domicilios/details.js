import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { useLocalSearchParams, router } from "expo-router";
import { auth, db } from "../../src/services/firebase";
import uuid from "react-native-uuid";
import AgendarVisitaForm from "./eventform";


export default function DomicilioDetails() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [dom, setDom] = useState(null);
  const [modalMoradorVisible, setModalMoradorVisible] = useState(false);
  const [modalVisitaVisible, setModalVisitaVisible] = useState(false);
  const [moradorEditando, setMoradorEditando] = useState(null);
  const [nomeMorador, setNomeMorador] = useState("");
  const [idadeMorador, setIdadeMorador] = useState("");
  const [funcaoMorador, setFuncaoMorador] = useState("");
  const [obsMorador, setObsMorador] = useState("");

  async function carregarDados() {
    try {
      const ref = doc(db, "domicilios", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        Alert.alert("Erro", "Este domicílio não existe mais.");
        router.back();
        return;
      }
      const data = snap.data();
      const moradoresComId = (data.moradores || []).map((m) => ({
        ...m,
        id: m.id ?? uuid.v4(),
      }));
      setDom({ id: snap.id, ...data, moradores: moradoresComId });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarAtualizacoes() {
    try {
      await updateDoc(doc(db, "domicilios", dom.id), {
        observacao: dom.observacao ?? null,
        moradores: dom.moradores,
        visitado: dom.visitado,
        dataConclusao: dom.visitado ? new Date() : null,
      });
      Alert.alert("Sucesso", "Informações atualizadas!");
      carregarDados();
    } catch (error) {
      console.log("Erro ao salvar alterações:", error);
      Alert.alert("Erro", "Não foi possível salvar. Veja o console.");
    }
  }

  function abrirModalMorador(m) {
    setMoradorEditando(m);
    setNomeMorador(m.nome);
    setIdadeMorador(m.idade);
    setFuncaoMorador(m.funcao);
    setObsMorador(m.observacao);
    setModalMoradorVisible(true);
  }

  function salvarMoradorEditado() {
    if (!nomeMorador.trim()) return Alert.alert("Erro", "Nome obrigatório!");
    const moradorAtualizado = {
      ...moradorEditando,
      nome: nomeMorador,
      idade: idadeMorador,
      funcao: funcaoMorador,
      observacao: obsMorador ?? null,
      id: moradorEditando.id ?? uuid.v4(),
    };
    setDom((prev) => ({
      ...prev,
      moradores: prev.moradores.map((m) =>
        m.id === moradorEditando.id ? moradorAtualizado : m
      ),
    }));
    setModalMoradorVisible(false);
  }

    function adicionarMorador() {
    const novoMorador = {
      id: uuid.v4(),
      nome: "",
      idade: "",
      funcao: "",
      observacao: "",
    };
    setDom((prev) => ({
      ...prev,
      moradores: [...prev.moradores, novoMorador],
    }));

    // Abrir modal para preencher o morador
    setMoradorEditando(novoMorador);
    setNomeMorador("");
    setIdadeMorador("");
    setFuncaoMorador("");
    setObsMorador("");
    setModalMoradorVisible(true);
    }

  function removerMorador(idMorador) {
  setDom((prev) => ({
    ...prev,
    moradores: prev.moradores.filter((m) => m.id !== idMorador),
  }));
}

  async function agendarVisita(visita) {
    try {
      const visitaComDom = {
        ...visita,
        userId: auth.currentUser.uid,
        domicilioId: dom.id,
        endereco: dom.endereco,
        nomeDomicilio: dom.nome,
      };
      await addDoc(collection(db, "visitas"), visitaComDom);
      Alert.alert("Sucesso", "Visita agendada!");
      setModalVisitaVisible(false);
    } catch (error) {
      console.log("Erro ao agendar visita:", error);
      Alert.alert("Erro", "Não foi possível agendar visita.");
    }
  }

  if (loading || !dom) {
    return (
      <View style={styles.center}>
        <Text>Carregando...</Text>
      </View>
    );
  }



  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>
        {dom.nome || "Sem nome"} ({dom.moradores?.length || 0} moradores)
      </Text>

      {/* STATUS */}
      <Text style={[styles.status, { color: dom.visitado ? "green" : "red" }]}>
        {dom.visitado ? "✔ Concluído" : "⏳ Pendente"}
      </Text>

      <TouchableOpacity
        style={[styles.statusButton, { backgroundColor: dom.visitado ? "#d32f2f" : "#2E7D32" }]}
        onPress={() => setDom((p) => ({ ...p, visitado: !p.visitado }))}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          {dom.visitado ? "Marcar como pendente" : "Marcar como concluído"}
        </Text>
      </TouchableOpacity>

      {/* ENDEREÇO */}
      <Text style={styles.section}>Endereço</Text>
      <Text style={styles.text}>{dom.endereco || "Sem endereço informado"}</Text>

      

      {/* MORADORES */}
      <Text style={styles.section}>Moradores</Text>
      {dom.moradores.map((m) => (
        <View key={m.id} style={styles.card}>
          <Text style={styles.cardTitle}>{m.nome}</Text>
          {m.funcao && <Text>Função: {m.funcao}</Text>}
          {m.idade && <Text>Idade: {m.idade}</Text>}
          {m.observacao && <Text numberOfLines={1}>Obs: {m.observacao}</Text>}

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#ff8d8f" }]}
              onPress={() => abrirModalMorador(m)}
            >
              <Text style={{ color: "#fff" }}>✏ Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#16463f" }]}
              onPress={() => removerMorador(m.id)}
            >
              <Text style={{ color: "#fff" }}>🗑 Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
        )
      )}
      {/* BOTÃO ADICIONAR MORADOR */}
      <TouchableOpacity onPress={adicionarMorador} style={styles.addButton}>
        <Text style={styles.saveButtonText}>+ Adicionar morador</Text>
      </TouchableOpacity>

      {/* OBSERVAÇÕES */}
      <Text style={styles.section}>Observações</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={dom.observacao}
        onChangeText={(v) => setDom((p) => ({ ...p, observacao: v }))}
      />

      {/* BOTÃO AGENDAR VISITA */}
      <TouchableOpacity
        style={styles.eventButton}
        onPress={() => setModalVisitaVisible(true)}
      >
        <Text style={styles.saveButtonText}>Agendar Visita</Text>
      </TouchableOpacity>

      {/* SALVAR ALTERAÇÕES */}
      <TouchableOpacity style={styles.saveButton} onPress={salvarAtualizacoes}>
        <Text style={styles.saveButtonText}>Salvar alterações</Text>
      </TouchableOpacity>

      {/* MODAL AGENDAR VISITA */}
      <Modal visible={modalVisitaVisible} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modalBody}>
            <AgendarVisitaForm
              domicilio={dom}
              //onSubmit={agendarVisita}
              onCancel={() => setModalVisitaVisible(false)}
           adicionarVisita={async (novaVisita) => {
    if (!auth.currentUser) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }

    try {
      const visitaComUser = {
        ...novaVisita,
        userId: auth.currentUser.uid,
        timestamp: new Date(),
      };

      await addDoc(collection(db, "visitas"), visitaComUser);
      Alert.alert("Sucesso", "Visita agendada!");
      setModalVisitaVisible(false);
    } catch (err) {
      console.log("Erro ao adicionar visita:", err);
      Alert.alert("Erro", "Não foi possível agendar a visita.");
    }
  }}
/>
    </View>
  </View>
</Modal>

      {/* MODAL EDITAR MORADOR */}
      <Modal visible={modalMoradorVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBody}>
            <Text style={styles.modalTitle}>Editar Morador</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome *"
              value={nomeMorador}
              onChangeText={setNomeMorador}
            />

            <TextInput
              style={styles.input}
              placeholder="Idade"
              keyboardType="numeric"
              value={idadeMorador}
              onChangeText={setIdadeMorador}
            />

            <TextInput
              style={styles.input}
              placeholder="Função"
              value={funcaoMorador}
              onChangeText={setFuncaoMorador}
            />

            <TextInput
              style={[styles.input, { height: 60 }]}
              placeholder="Observações"
              value={obsMorador}
              multiline
              onChangeText={setObsMorador}
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#000" }]}
                onPress={salvarMoradorEditado}
              >
                <Text style={{ color: "#fff" }}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ddd" }]}
                onPress={() => setModalMoradorVisible(false)}
              >
                <Text>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#e7e1d5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6, color: "#16463f" },
  status: { fontSize: 15, marginBottom: 14 },
  section: { fontSize: 18, fontWeight: "bold", marginTop: 20, color: "#16463f" },
  text: { fontSize: 15, marginTop: 4 },
  card: {
    backgroundColor: "#efefef",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderColor: "#6d7179",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", gap: 10, marginTop: 10 },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
  },
  statusButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#64a002",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 90,
  },
  saveButtonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },

  eventButton: {
    backgroundColor: "#16463f",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#fe5668",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
  },

  modalBody: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
})
