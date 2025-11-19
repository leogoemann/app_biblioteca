import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { cores } from './config';
import { normalizeThumbnail, openLibraryCover, getCurrentUser, logoutUser, sendLocalNotification } from './utils';

type Livro = {
  id?: string;
  titulo: string;
  autor?: string;
  isbn?: string;
  paginas?: string;
  ano?: string;
  thumbnail?: string;
  categories?: string[];
};

export default function App() {
  // Solicita permissão para notificações ao iniciar
  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [groups, setGroups] = useState<{ genre: string; data: Livro[] }[]>([]);
  const [rawCategories, setRawCategories] = useState<string[]>([]);
  const [showRawCategories, setShowRawCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = await getCurrentUser();
    if (!user) {
      router.replace('/login');
    } else {
      setUserName(user.name);
      await loadDefault();
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    sendLocalNotification('Logout realizado', 'Você saiu da sua conta com sucesso.');
    router.replace('/login');
  };

  const loadDefault = async () => {
    setLoading(true);
    try {
      const subjects = ['fiction', 'romance', 'fantasy', 'history', 'science'];
      const pages = await Promise.all(subjects.map(s => googleBooksSearch(`subject:${s}`, 20)));
      const combined: Livro[] = [];
      const seen = new Set<string>();
      const rawSet = new Set<string>();
      pages.flat().forEach(b => {
        const key = b.id ?? b.isbn ?? JSON.stringify(b);
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(b);
          (b.categories || []).forEach(c => rawSet.add(String(c)));
        }
      });
      setRawCategories(Array.from(rawSet).sort());
      setLivros(combined);
      setGroups(groupByGenre(combined));
    } catch (e: any) {
      console.error('Erro ao carregar livros:', e);
      setError(String(e));
      // Notificação local de erro
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Erro ao carregar livros',
          body: String(e),
        },
        trigger: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const googleBooksSearch = async (q: string, maxResults = 20): Promise<Livro[]> => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=${maxResults}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro na API Google Books: status ${res.status}`);
    const json = await res.json();
    const items = json.items ?? [];
    return items.map((item: any) => {
      const info = item.volumeInfo ?? {};
      const isbnId = (info.industryIdentifiers || []).find((i: any) => i.type && i.identifier && i.type.toLowerCase().includes('isbn'));
      return {
        id: item.id,
        titulo: info.title ?? 'Sem título',
        autor: (info.authors || []).join(', '),
        isbn: isbnId ? isbnId.identifier : undefined,
        paginas: info.pageCount ? String(info.pageCount) : undefined,
        ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
        thumbnail: info.imageLinks?.thumbnail,
        categories: info.categories ?? [],
      } as Livro;
    });
  };

  const groupByGenre = (books: Livro[]) => {
    // map common English categories to Portuguese (pt-BR)
    const translate: Record<string, string> = {
      'fiction': 'Ficção',
      'romance': 'Romance',
      'fantasy': 'Fantasia',
      'history': 'História',
      'science': 'Ciência',
      'juvenile fiction': 'Infantojuvenil',
      'juvenile fiction / fiction': 'Infantojuvenil',
      'young adult': 'Jovem adulto',
      'children': 'Infantil',
      'childrenâ\u0092s': 'Infantil',
      'biography': 'Biografia',
      'mystery': 'Mistério',
      'nonfiction': 'Não-ficção',
      'non-fiction': 'Não-ficção',
      'science fiction': 'Ficção científica',
    };

    const normalizeKey = (raw?: string) => {
      if (!raw) return 'Outros';
      // basic cleanup
      let k = raw.toLowerCase().trim();
      k = k.replace(/\s*\/\s*/g, ' / ');
      // replace multiple spaces
      k = k.replace(/\s+/g, ' ');
      // try direct translation
      if (translate[k]) return translate[k];
      // try stripping punctuation for matching
      const stripped = k.replace(/[^a-z0-9 ]/g, '').trim();
      if (translate[stripped]) return translate[stripped];
      // title-case fallback
      return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const map = new Map<string, Livro[]>();
    books.forEach(b => {
      const cats = (b.categories && b.categories.length) ? b.categories : ['Outros'];
      const used = new Set<string>();
      cats.forEach(cat => {
        const key = normalizeKey(cat);
        if (!used.has(key)) {
          used.add(key);
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push(b);
        }
      });
    });
    return Array.from(map.entries()).map(([genre, data]) => ({ genre, data }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>Todos os livros</Text>
        {userName && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Olá, {userName}</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={24} color={cores.primaryText} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && <Text style={{ color: cores.secondaryText, marginTop: 20 }}>Carregando livros...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <TouchableOpacity onPress={() => setShowRawCategories(s => !s)} style={{ marginBottom: 8 }}>
        <Text style={{ color: cores.primaryText }}>{showRawCategories ? 'Ocultar categorias originais' : 'Mostrar categorias originais'}</Text>
      </TouchableOpacity>
      {showRawCategories && rawCategories.length > 0 && (
        <View style={{ width: '100%', paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={{ color: cores.secondaryText, marginBottom: 8 }}>Categorias recebidas da API (originais):</Text>
          {rawCategories.map((c) => (
            <Text key={c} style={{ color: cores.primaryText }}>{c}</Text>
          ))}
        </View>
      )}
      <FlatList
        data={groups}
        keyExtractor={(g) => g.genre}
        renderItem={({ item: group }) => (
          <View style={{ width: '100%' }}>
            <Text style={styles.genreTitle}>{group.genre}</Text>
            <FlatList
              data={group.data}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(b, idx) => `${b.id ?? b.isbn ?? idx}`}
              renderItem={({ item: b }) => (
                <TouchableOpacity
                  onPress={() => router.push(`/detalhes/${encodeURIComponent(String(b.id ?? b.isbn ?? ''))}`)}
                  style={styles.bookCard}
                >
                  {b.thumbnail ? (
                    <Image source={{ uri: normalizeThumbnail(b.thumbnail) }} style={styles.bookThumb} />
                  ) : b.isbn ? (
                    <Image source={{ uri: openLibraryCover(b.isbn, 'M') }} style={styles.bookThumb} />
                  ) : (
                    <View style={[styles.bookThumb, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="book-outline" size={28} color={cores.secondaryText} />
                    </View>
                  )}
                  <Text style={styles.bookTitle} numberOfLines={2}>{b.titulo}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
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
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  text: {
    color: cores.primaryText,
    fontSize: 35,
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userName: {
    color: cores.primaryText,
    fontSize: 16,
    marginRight: 8,
  },
  logoutButton: {
    padding: 8,
  },
  livroItem: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  genreTitle: {
    color: cores.primaryText,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
    marginVertical: 8,
  },
  bookCard: {
    width: 120,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  bookThumb: {
    width: 100,
    height: 150,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: '#e6eef2',
  },
  bookTitle: {
    color: cores.primaryText,
    fontSize: 14,
    textAlign: 'center',
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
