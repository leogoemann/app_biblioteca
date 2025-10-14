import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cores } from './config';
import { normalizeThumbnail, openLibraryCover } from './utils';

type Livro = {
  id?: string; // google volume id
  titulo: string;
  autor?: string;
  isbn?: string;
  paginas?: string;
  ano?: string;
  thumbnail?: string;
};

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [livros, setLivros] = useState<Livro[]>([]);
  const [termoBusca, setTermoBusca] = useState('');
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const favJSON = await AsyncStorage.getItem('favoritos');
      const favList: string[] = favJSON ? JSON.parse(favJSON) : [];
      setFavoritos(favList);
      const detalhes = await Promise.all(favList.map(resolveFavorite));
      setLivros(detalhes.filter(Boolean) as Livro[]);
    };
    load();
  }, []);

  // resolve um favorito que pode ser um volume id (preferido) ou um ISBN antigo
  const resolveFavorite = async (fav: string) => {
    try {
      // tentar tratar como volume id
      const byId = await fetch(`https://www.googleapis.com/books/v1/volumes/${fav}`);
      if (byId.ok) {
        const json = await byId.json();
        const info = json.volumeInfo ?? {};
        return {
          id: json.id,
          titulo: info.title ?? 'Sem título',
          autor: (info.authors || []).join(', '),
          isbn: (info.industryIdentifiers || []).find((i: any) => i.type && i.identifier && i.type.toLowerCase().includes('isbn'))?.identifier,
          paginas: info.pageCount ? String(info.pageCount) : undefined,
          ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
          thumbnail: info.imageLinks?.thumbnail,
        } as Livro;
      }
    } catch (e) {
      // não é volume id
    }

    // fallback: tratar como ISBN e pesquisar pela API
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(fav)}`);
      if (!res.ok) return null;
      const json = await res.json();
      const item = (json.items || [])[0];
      if (!item) return null;
      const info = item.volumeInfo ?? {};
      return {
        id: item.id,
        titulo: info.title ?? 'Sem título',
        autor: (info.authors || []).join(', '),
        isbn: fav,
        paginas: info.pageCount ? String(info.pageCount) : undefined,
        ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
        thumbnail: info.imageLinks?.thumbnail,
      } as Livro;
    } catch (e) {
      console.error('Erro resolvendo favorito', fav, e);
      return null;
    }
  };

  useEffect(() => {
    // filtrar por termo localmente
    const termo = termoBusca.toLowerCase();
    if (!termo) return;
    const filtrados = livros.filter(l =>
      (l.titulo || '').toLowerCase().includes(termo) ||
      (l.autor || '').toLowerCase().includes(termo)
    );
    setLivros(filtrados);
  }, [termoBusca]);

  const removerFavorito = async (key?: string) => {
    if (!key) return;
    const novos = favoritos.filter(f => f !== key);
    setFavoritos(novos);
    await AsyncStorage.setItem('favoritos', JSON.stringify(novos));
    setLivros(prev => prev.filter(l => l.id !== key && l.isbn !== key));
  };

  return (
    <View style={styles.container}>
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

      {livros.length === 0 ? (
        <Text style={styles.mensagem}>Nenhum favorito encontrado.</Text>
      ) : (
        <FlatList
          data={livros}
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
                  <TouchableOpacity onPress={() => removerFavorito(item.id ?? item.isbn)} style={styles.favoritoButton}>
                    <Ionicons name="trash-outline" size={24} color="#ff4d4d" />
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
mensagem: {
  color: cores.secondaryText,
  fontSize: 16,
  marginTop: 20,
  textAlign: 'center',
  fontFamily: 'sans-serif-condensed',
},
});
