import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cores } from './config';


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
    {}
    <Text style={styles.text}>Meus Favoritos</Text>

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
        <Ionicons name="home-outline" size={32} color={cores.iconHighlight} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/pesquisa')} style={styles.iconButton}>
        <Ionicons name="search-outline" size={32} color={cores.iconHighlight} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/bibliotecas')} style={styles.iconButton}>
        <Ionicons name="location-outline" size={32} color={cores.iconHighlight} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/favoritos')} style={styles.iconButton}>
        <Ionicons name="heart-outline" size={32} color={cores.iconHighlight} />
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
    fontSize: 28,
    marginBottom: 16,
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  livroItem: {
    marginBottom: 16,
    paddingHorizontal: 16,
    width: '100%',
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
mensagem: {
  color: cores.secondaryText,
  fontSize: 16,
  marginTop: 20,
  textAlign: 'center',
  fontFamily: 'sans-serif-condensed',
},
});
