import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Link, router } from "expo-router";
import { signOut } from "firebase/auth";
import { auth, db } from "../src/services/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";


export default function Home() {
  const [pendentes, setPendentes] = useState(0);
  const [concluidos, setConcluidos] = useState(0);
  const nomeUsuario = auth?.currentUser?.email?.split("@")[0] || "ACS";

  const [visitas, setVisitas] = useState<Visita[]>([]); 

  function handleLogout() {
    signOut(auth).then(() => {
      router.replace("/auth/login");
    });
  }

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
    collection(db, "visitas"),
    where("userId", "==", auth.currentUser.uid)
  );

    const qDomicilios = query(
      collection(db, "domicilios"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubDomicilios = onSnapshot(qDomicilios, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })); 
      setPendentes(lista.filter((d) => !d.visitado).length);
      setConcluidos(lista.filter((d) => d.visitado).length);
    });
    
    

    const unsubscribe = onSnapshot(q, (snapshot) => {
    const lista = snapshot.docs.map((doc) => {
      const dataRaw = doc.data().data; 
      const dataFormatada = typeof dataRaw?.toDate === "function"
        ? dataRaw.toDate().toISOString().split("T")[0]
        : dataRaw; 
      return { id: doc.id, ...doc.data(), data: dataFormatada };
    });

    lista.sort((a, b) => {
      if (a.data === b.data) return a.hora.localeCompare(b.hora);
      return a.data.localeCompare(b.data);
    });

    setVisitas(lista);
  });

    return () => {
        unsubDomicilios();
        unsubscribe();
    }
  }, []);


  return (
    <FlatList

      ListHeaderComponent={
      <View style={styles.container}>
        <Text style={styles.title}>Olá, {nomeUsuario} 👋</Text>
        <Text style={styles.subtitle}>Bem-vindo ao HealthRoute</Text>
        <Text style={styles.cardTextAlert}>
            Abra o mapa para carregar os seus Dados!
          </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visitas Agendadas</Text>
          {visitas.length === 0 ? (
            <Text style={{ marginTop: 10 }}>Nenhuma visita agendada.</Text>
          ) : (
            <FlatList
              data={visitas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
        <View style={styles.itemVisitaContainer}>
          <View style={styles.itemVisitaTexto}>
            <Text style={styles.visitaData}>{item.data} - {item.hora}</Text>
            <Text style={styles.visitaInfo}>{item.nome} ({item.endereco})</Text>
          </View>

          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={async () => {
              // Remove do estado local
              setVisitas(prev => prev.filter(v => v.id !== item.id));
              // Opcional: remover do Firestore
              try {
                await deleteDoc(doc(db, "visitas", item.id));
              } catch (err) {
                console.log("Erro ao excluir visita:", err);
              }
            }}
          >
            <Text style={styles.buttonSecondaryText}>Concluir Visita</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  )}
</View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seu trabalho importa 💚</Text>
          <Text style={styles.cardText}>
            Continue acompanhando os atendimentos na sua área.
          </Text>

          {/* Dashboard */}
          <View style={styles.dashboard}>
            <View style={[styles.infoBox, { backgroundColor: "#FFEBEB" }]}>
              <Text style={[styles.infoNumber, { color: "#fe5658" }]}>{pendentes}</Text>
              <Text style={styles.infoLabel}>Pendentes</Text>
            </View>

            <View style={[styles.infoBox, { backgroundColor: "#E8F5E9" }]}>
              <Text style={[styles.infoNumber, { color: "#64a002" }]}>{concluidos}</Text>
              <Text style={styles.infoLabel}>Concluídos</Text>
            </View>
          </View>

          {/* BOTÕES */}
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => router.replace("/map")}
          >
            <Text style={styles.buttonPrimaryText}>📍 Ir para o Mapa</Text>
          </TouchableOpacity>

          <Link href="/domicilios/add" asChild>
            <TouchableOpacity style={styles.buttonSecondary}>
              <Text style={styles.buttonSecondaryText}>＋ Cadastrar Domicílio</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity
            style={styles.buttonLogout}
            onPress={handleLogout}
          >
            <Text style={styles.buttonLogoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View> 
      }
  />
  );}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e7e1d5",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 50,
  },
  title: {
    marginTop: 80,
    fontSize: 26,
    fontWeight: "bold",
    color: "#16463f",
  },
  subtitle: {
    fontSize: 16,
    color: "#16463f",
    marginBottom: 35,
  },
  card: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 20,
    padding: 22,
    elevation: 6,
    alignItems: "center",
    marginTop: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 6,
  },
  cardText: {
    textAlign: "center",
    color: "#6d7179",
    marginBottom: 20,
  },
  cardTextAlert: {
    color: "#6d7179",
  },

  dashboard: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  infoBox: {
    flex: 1,
    paddingVertical: 14,
    marginHorizontal: 5,
    borderRadius: 14,
    alignItems: "center",
  },
  infoNumber: {
    fontSize: 22,
    fontWeight: "800",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginTop: 4,
  },

  modalFormulario: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalVisitas: {
    margin: 20,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  buttonPrimary: {
    backgroundColor: "#ff8d8f",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },

  buttonPrimaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonSecondary: {
    backgroundColor: "#64a002",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonSecondaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  buttonLogout: {
    backgroundColor: "#C62828",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  buttonLogoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  itemVisitaContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // para Android
  },
  itemVisitaHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 6,
    paddingBottom: 4,
  },
  visitaData: {
    fontSize: 14,
    color: "#666",
    fontWeight: "bold",
  },
  visitaInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
});