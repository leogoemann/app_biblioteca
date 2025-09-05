import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Livro = {
  titulo: string;
  autor: string;
  isbn: string;
  paginas: string;
  ano: string;
};

export default function Favoritos() {
  const [todosLivros, setTodosLivros] = useState<Livro[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState<Livro[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const response = await fetch(
          'https://raw.githubusercontent.com/leogoemann/app_biblioteca/main/assets/data/livros.csv'
        );
        const csvText = await response.text();
        const livros = parseCSV(csvText);
        setTodosLivros(livros);

        const favJSON = await AsyncStorage.getItem('favoritos');
        const favList: string[] = favJSON ? JSON.parse(favJSON) : [];
        setFavoritos(favList);

        const filtrados = livros.filter(l => favList.includes(l.isbn));
        setLivrosFiltrados(filtrados);
      } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const termo = termoBusca.toLowerCase();
    const filtrados = todosLivros
      .filter(l => favoritos.includes(l.isbn))
      .filter(l =>
        l.titulo.toLowerCase().includes(termo) ||
        l.autor.toLowerCase().includes(termo)
      );
    setLivrosFiltrados(filtrados);
  }, [termoBusca, favoritos]);

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

  const removerFavorito = async (isbn: string) => {
    const novosFavoritos = favoritos.filter(f => f !== isbn);
    setFavoritos(novosFavoritos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Favoritos</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar nos favoritos..."
          placeholderTextColor="#fff"
          value={termoBusca}
          onChangeText={setTermoBusca}
        />
      </View>

      {livrosFiltrados.length === 0 ? (
        <Text style={styles.mensagem}>Nenhum favorito encontrado.</Text>
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
                <TouchableOpacity onPress={() => removerFavorito(item.isbn)} style={styles.favoritoButton}>
                  <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

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
          <Ionicons name="heart" size={32} color="#ff4d4d" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  titulo: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  mensagem: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  livroItem: {
    marginBottom: 16,
  },
  livroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livroInfoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  favoritoButton: {
    padding: 8,
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
  livroInfo: {
    color: '#aaa',
    fontSize: 14,
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