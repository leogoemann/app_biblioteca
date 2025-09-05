import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

type Livro = {
  Título: string;
  Autor: string;
  ISBN?: string;
  Ano?: number;
};

export default function App() {
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/seu-usuario/seu-repo/main/livros.csv'); // substitua pela URL real
        const csvText = await response.text();

        Papa.parse<Livro>(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setLivros(results.data);
          },
        });
      } catch (error) {
        console.error('Erro ao carregar CSV:', error);
      }
    };

    loadCSV();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Favoritos</Text>

      <FlatList
        data={livros}
        keyExtractor={(item, index) => `${item.ISBN}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.livroItem}>
            <Text style={styles.livroTitulo}>{item.Título}</Text>
            <Text style={styles.livroAutor}>{item.Autor}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
          <Ionicons name="home-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/pesquisa')} style={styles.iconButton}>
          <Ionicons name="search-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/bibliotecas')} style={styles.iconButton}>
          <Ionicons name="location-outline" size={32} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/favoritos')} style={styles.iconButton}>
          <Ionicons name="heart-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
    alignItems: 'center',
    paddingTop: 40,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 16,
  },
  livroItem: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  livroTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  livroAutor: {
    color: '#ccc',
    fontSize: 16,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 12,
  },
  iconButton: {
    padding: 16,
    borderRadius: 32,
    marginBottom: 24,
  },
});