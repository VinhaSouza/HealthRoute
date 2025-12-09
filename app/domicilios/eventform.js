import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from "react-native";

export default function AgendarVisitaForm({ adicionarVisita, onCancel, onSubmit, domicilio  }) {
  const [hora, setHora] = useState("");
  const [data, setData] = useState("");

  const handleDataChange = (text) => {
    let numericText = text.replace(/\D/g, "");
    if (numericText.length > 8) numericText = numericText.slice(0, 8);

    if (numericText.length > 4) {
      numericText = numericText.replace(/(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
    } else if (numericText.length > 2) {
      numericText = numericText.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }

    setData(numericText);
  };

  const handleHoraChange = (text) => {
    let numericText = text.replace(/\D/g, "");
    if (numericText.length > 4) numericText = numericText.slice(0, 4);

    if (numericText.length > 2) {
      numericText = numericText.replace(/(\d{2})(\d{1,2})/, "$1:$2");
    }

    setHora(numericText);
  };

  const salvarVisita = () => {
    if ( !hora  || data.length !== 10 || hora.length !== 5) {
      alert("Preencha todos os campos corretamente!");
      return;
    }

    const partesData = data.split("/");
    const dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`; // YYYY-MM-DD

    adicionarVisita({
      nome: domicilio.nome,
      endereco: domicilio.endereco,
      hora,
      data: dataFormatada,
    });

    // Limpa o formulário
    setHora("");
    setData("");
  };

  return (
    <View style={styles.container}>
        <Text style={{ marginBottom: 8 }}>
        Agendando visita para: {domicilio.nome} ({domicilio.endereco})
      </Text>

      <Text>Hora:</Text>
      <TextInput
        style={styles.input}
        value={hora}
        onChangeText={handleHoraChange}
        placeholder="Ex: 14:30"
        keyboardType="numeric"
      />

      <Text>Data:</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={handleDataChange}
        placeholder="08/12/2025"
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.saveButton} 
        onPress={salvarVisita}>
        <Text style={styles.ButtonText}>Agendar</Text>

      </TouchableOpacity>
      
      <TouchableOpacity
            style={styles.buttonCancelar}
            onPress={onCancel}>
        <Text style={styles.ButtonText}>Cancelar</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    width: "90%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 10,
  },
   ButtonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  overlay: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#64a002",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonCancelar: {
    backgroundColor: "#fe5658",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 14,
    alignItems: "center",
  },
});
