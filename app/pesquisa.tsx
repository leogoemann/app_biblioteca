import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cores } from './config';

type Livro = {
  titulo: string;
  autor: string;
  isbn: string;
  paginas: string;
  ano: string;
};

export default function Pesquisa() {
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState<Livro[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>([]);

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

    const loadFavoritos = async () => {
      const favJSON = await AsyncStorage.getItem('favoritos');
      const favList = favJSON ? JSON.parse(favJSON) : [];
      setFavoritos(favList);
    };

    loadCSV();
    loadFavoritos();
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

  const handleSearch = (text: string) => {
    setTermoBusca(text);
    if (text.length === 0) {
      setLivrosFiltrados([]);
      return;
    }

    const termo = text.toLowerCase();
    const filtrados = livros.filter(livro =>
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo)
    );
    setLivrosFiltrados(filtrados);
  };

  const toggleFavorito = async (livro: Livro) => {
    let novosFavoritos;
    if (favoritos.includes(livro.isbn)) {
      novosFavoritos = favoritos.filter(isbn => isbn !== livro.isbn);
    } else {
      novosFavoritos = [...favoritos, livro.isbn];
    }
    setFavoritos(novosFavoritos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
  };

  const isFavorito = (isbn: string) => favoritos.includes(isbn);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Pesquisar..."
          placeholderTextColor="#fff"
          value={termoBusca}
          onChangeText={handleSearch}
        />
      </View>

      {termoBusca.length === 0 ? (
        <Text style={styles.mensagemBusca}>Digite algo para buscar um livro...</Text>
      ) : livrosFiltrados.length === 0 ? (
        <Text style={styles.mensagemBusca}>Nenhum livro encontrado.</Text>
      ) : (
        <FlatList
          data={livrosFiltrados}
          keyExtractor={(item, index) => `${item.isbn}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.livroItem}>
              <View style={styles.livroRow}>
                <View style={styles.livroInfoContainer}>
                  <Text style={styles.livroTitulo} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.livroAutor} numberOfLines={1}>{item.autor}</Text>
                  <Text style={styles.livroInfo}>ISBN: {item.isbn}</Text>
                  <Text style={styles.livroInfo}>Páginas: {item.paginas} | Ano: {item.ano}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.favoritoButton}>
                  <Ionicons
                    name={isFavorito(item.isbn) ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#ff4d4d"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}



      <View style={styles.menu}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
          <Ionicons name="home-outline" size={32} color={cores.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/pesquisa')} style={styles.iconButton}>
          <Ionicons name="search-outline" size={32} color={cores.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/bibliotecas')} style={styles.iconButton}>
          <Ionicons name="location-outline" size={32} color={cores.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/favoritos')} style={styles.iconButton}>
          <Ionicons name="heart-outline" size={32} color={cores.accent} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.menuBackground,
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 16,
    marginTop: 35,
    width: '90%',
  },
  input: {
    flex: 1,
    color: cores.primaryText,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mensagemBusca: {
    color: cores.secondaryText,
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  livroItem: {
    marginBottom: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  livroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  livroInfoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  favoritoButton: {
    padding: 8,
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

