import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cores } from './config';
import { normalizeThumbnail, openLibraryCover } from './utils';

type Livro = {
  id?: string; // google volume id
  titulo: string;
  autor: string;
  isbn?: string;
  paginas?: string;
  ano?: string;
  thumbnail?: string;
};

export default function Pesquisa() {
  const router = useRouter();
  // livrosFiltrados <- resultados da Google Books
  const [livrosFiltrados, setLivrosFiltrados] = useState<Livro[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>([]);

  useEffect(() => {
    const loadFavoritos = async () => {
      const favJSON = await AsyncStorage.getItem('favoritos');
      const favList = favJSON ? JSON.parse(favJSON) : [];
      setFavoritos(favList);
    };

    loadFavoritos();
  }, []);
  // Busca via Google Books API. Faz chamadas apenas quando o termo tiver >= 3 caracteres.
  const handleSearch = async (text: string) => {
    setTermoBusca(text);
    if (text.trim().length < 3) {
      setLivrosFiltrados([]);
      return;
    }

    try {
      const results = await googleBooksSearch(text.trim());
      setLivrosFiltrados(results);
    } catch (err) {
      console.error('Erro ao buscar no Google Books:', err);
      setLivrosFiltrados([]);
    }
  };

  const googleBooksSearch = async (q: string): Promise<Livro[]> => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;
    const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro na API Google Books: status ${res.status}`);
    const json = await res.json();
    const items = json.items ?? [];
    return items.map((item: any) => {
      const info = item.volumeInfo ?? {};
      const isbnId = (info.industryIdentifiers || []).find((i: any) => i.type && i.identifier && i.type.toLowerCase().includes('isbn'));
      const isbn = isbnId ? isbnId.identifier : undefined;
      return {
        id: item.id,
        titulo: info.title ?? 'Sem título',
        autor: (info.authors || []).join(', '),
        isbn,
        paginas: info.pageCount ? String(info.pageCount) : undefined,
        ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
        thumbnail: info.imageLinks?.thumbnail,
      } as Livro;
    });
  };

  // Favoritos são armazenados preferencialmente pelo volume id (livro.id). Permitir compatibilidade com ISBNs antigos.
  const toggleFavorito = async (livro: Livro) => {
    const key = livro.id ?? livro.isbn ?? JSON.stringify(livro);
    let novosFavoritos: string[];
    if (favoritos.includes(key) || (livro.isbn && favoritos.includes(livro.isbn))) {
      novosFavoritos = favoritos.filter(f => f !== key && f !== (livro.isbn ?? ''));
    } else {
      novosFavoritos = [...favoritos, key];
    }
    setFavoritos(novosFavoritos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novosFavoritos));
  };

  const isFavorito = (livro: Livro) => {
    if (livro.id && favoritos.includes(livro.id)) return true;
    if (livro.isbn && favoritos.includes(livro.isbn)) return true; // compatibility
    return false;
  };

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
          keyExtractor={(item, index) => `${item.id ?? item.isbn ?? index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/detalhes/${encodeURIComponent(String(item.id ?? item.isbn ?? ''))}`)}
              style={styles.livroItem}
            >
              <View style={styles.livroRow}>
                {item.thumbnail ? (
                  <Image source={{ uri: normalizeThumbnail(item.thumbnail) }} style={{ width: 60, height: 90, marginRight: 8 }} />
                ) : item.isbn ? (
                  <Image source={{ uri: openLibraryCover(item.isbn, 'M') }} style={{ width: 60, height: 90, marginRight: 8 }} />
                ) : null}
                <View style={styles.livroInfoContainer}>
                  <Text style={styles.livroTitulo} numberOfLines={1}>{item.titulo}</Text>
                  <Text style={styles.livroAutor} numberOfLines={1}>{item.autor}</Text>
                  <Text style={styles.livroInfo}>ISBN: {item.isbn}</Text>
                  <Text style={styles.livroInfo}>Páginas: {item.paginas} | Ano: {item.ano}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorito(item)} style={styles.favoritoButton}>
                  <Ionicons
                    name={isFavorito(item) ? 'heart' : 'heart-outline'}
                    size={24}
                    color="#ff4d4d"
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
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

