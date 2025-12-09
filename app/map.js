import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../src/services/firebase";
import { router } from "expo-router";


export default function RouteMap() {
  const [location, setLocation] = useState(null);
  const [domicilios, setDomicilios] = useState([]); // lista de domicílios
  const [selected, setSelected] = useState(null); // dom selecionado
  const [filter, setFilter] = useState("pendentes");


  // pegar localização do usuário
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão negada",
            "Permita o acesso à localização nas configurações."
          );
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);
        console.log("Localização obtida:", loc.coords);
      } catch (err) {
        console.log("Erro ao obter localização:", err);
        Alert.alert("Erro", "Não foi possível obter a localização.");
      }
    })();
  }, []);

  // ouvir domicilios do Firestore do usuário logado
  useEffect(() => {
    if (!auth || !auth.currentUser) {
      console.log("auth.currentUser não disponível ainda.");
      return;
    }

    console.log("Iniciando snapshot dos domicilios para usuário:", auth.currentUser.uid);

    const q = query(
      collection(db, "domicilios"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("Snapshot domicilios:", lista);
        setDomicilios(lista);
      },
      (err) => {
        console.log("Erro onSnapshot domicilios:", err);
      }
    );

    return () => unsub();
  },[auth?.currentUser]);

  // função que atualiza firestore e estado local
  async function marcarConcluida(visita) {
     try {
    await updateDoc(doc(db, "visitas", visita.id), {
      concluida: true,
      dataConclusao: new Date(),
    });
    Alert.alert("Sucesso", "Visita marcada como concluída!");
  } catch (err) {
    console.log("Erro ao concluir visita:", err);
    Alert.alert("Erro", "Não foi possível concluir a visita.");
  }
}

  // debug: mostra domicilios no console (útil)
  useEffect(() => {
    console.log("Estado domicilios mudou:", domicilios.length);
  }, [domicilios]);

  if (!location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Obtendo localização...</Text>
      </View>
    );
  }

    
  return (
    <View style={{ flex: 1 }}>
      
      <View style={styles.topMenu}>
        <TouchableOpacity
        style={[
          styles.menuButton,
          filter === "pendentes" && styles.menuSelected
        ]}
    onPress={() => setFilter("pendentes")}
  >
    <Text style={styles.menuText}>Pendentes
        ({domicilios.filter((d) => !d.visitado).length})
    </Text>
  </TouchableOpacity>



  <TouchableOpacity
    style={[
      styles.menuButton,
      filter === "concluidos" && styles.menuSelected
    ]}
    onPress={() => setFilter("concluidos")}
  >
    <Text style={styles.menuText}>Concluídos
      ({domicilios.filter((d) => d.visitado).length})
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
  style={styles.backButton}
  onPress={() => router.replace("/")}
>
  <Text style={styles.backText}>←</Text>
</TouchableOpacity>
</View>

      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        // evitar que outros elementos capturem o toque
        pointerEvents="auto"
      >
        {domicilios
        .filter((dom) => dom)
        .filter((dom) =>
    filter === "pendentes" ? !dom.visitado : dom.visitado
  )
  .map((dom) => (
    <Marker
      key={dom.id}
      coordinate={{ latitude: Number(dom.latitude), longitude: Number(dom.longitude) }}
      pinColor={dom.visitado ? "green" : "red"}
      onPress={() => setSelected(dom)}
    />
  ))}

      </MapView>

      {/* LISTA DE DOMICÍLIOS FILTRADOS */}
{selected === null && (
  <View style={styles.listContainer}>
    <FlatList
      data={domicilios.filter((d) =>
        filter === "pendentes" ? !d.visitado : d.visitado
      )}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={() => {
            setSelected(item);
          }}
        >
          <Text style={styles.listName}>{item.nome}</Text>
          <Text style={{ color: item.visitado ? "green" : "red" }}>
            {item.visitado ? "✔ Concluído" : "⏳ Pendente"}
          </Text>
        </TouchableOpacity>
      )}
    />
  </View>
)}

      {/* CARTÃO INFERIOR */}
      {selected && (
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>{selected.nome || "Sem nome"}</Text>

          <Text style={[styles.statusText, { color: selected.visitado ? "green" : "red" }]}>
            {selected.visitado ? "✔ Visita concluída" : "⏳ Visita pendente"}
          </Text>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: "#fe5668", marginTop: 12 }]}
            onPress={() =>
            router.push({
            pathname: "/domicilios/details",
            params: {
              id: selected.id,
              nome: selected.nome || "",
              visitado: selected.visitado ? "true" : "false",
              nomeMorador: selected.nomeMorador || "",
              idade: selected.idade || "",
              cpf: selected.cpf || "",
              funcao: selected.funcao || "",
              observacao: selected.observacao ?? null,
            },
            })
            }
          >
            <Text style={styles.confirmButtonText}>Ver detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>

        </View>
        )}
    </View>
  
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
 
  // MENU SUPERIOR
  topMenu: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 9999,
  },
  menuButton: {
    flex: 1,
    backgroundColor: "#e5e5e5",
    paddingVertical: 8,
    marginHorizontal: 4,
    marginTop: 10,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  menuSelected: {
    backgroundColor: "#fe5668",
    borderColor: "#6d7179",
    
  },
  menuText: {
    fontWeight: "bold",
    color: "#000",
    
  },

  // LISTA
  listContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    maxHeight: "40%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 14,
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listName: {
    fontWeight: "600",
    fontSize: 15,
    color: "#333",
  },

  // CARTÃO INFERIOR
  cardContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 30,
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 20,
    zIndex: 99999,
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222",
    textAlign: "center",
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center",
  },

  // BOTÕES DO CARTÃO
  confirmButton: {
    marginTop: 18,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#64a002",
  },
  confirmButtonText: {
    fontWeight: "bold",
    color: "#ffffff",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
});

