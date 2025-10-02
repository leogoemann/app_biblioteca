import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { cores } from './config';

type Livro = {
  titulo: string;
  autor: string;
  isbn: string;
  paginas: string;
  ano: string;
};

export default function App() {
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/leogoemann/app_biblioteca/main/assets/data/livros.csv'
        );
        const csvText = await response.text();
        const data = parseCSV(csvText);
        setLivros(data);
      } catch (error) {
        console.error('Erro ao carregar CSV:', error);
      }
    };

    loadCSV();
  }, []);

  const parseCSV = (csv: string): Livro[] => {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(';').map(v => v.trim());
      const livro: any = {};
      headers.forEach((header, index) => {
        livro[header] = values[index];
      });
      return livro as Livro;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Todos os livros</Text>

      <FlatList
        data={livros}
        keyExtractor={(item, index) => `${item.isbn}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.livroItem}>
            <Text style={styles.livroTitulo}>{item.titulo}</Text>
            <Text style={styles.livroAutor}>{item.autor}</Text>
            <Text style={styles.livroInfo}>ISBN: {item.isbn}</Text>
            <Text style={styles.livroInfo}>Páginas: {item.paginas} | Ano: {item.ano}</Text>
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
    backgroundColor: cores.background,
    alignItems: 'center',
    paddingTop: 40,
  },
  text: {
    color: cores.primaryText,
    fontSize: 35,
    marginBottom: 25,
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  livroItem: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  livroTitulo: {
    color: cores.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
  },
  livroAutor: {
    color: cores.secondaryText,
    fontSize: 16,
  },
  livroInfo: {
    color: cores.infoText,
    fontSize: 14,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: cores.menuBackground,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 16,
    borderRadius: 32,
    marginBottom: 24,
  },
});
