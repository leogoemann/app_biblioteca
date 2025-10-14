import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../config';
import { normalizeThumbnail, openLibraryCover } from '../utils';

type Detalhes = {
  id?: string;
  titulo?: string;
  autor?: string;
  descricao?: string;
  isbn?: string;
  paginas?: string;
  ano?: string;
  thumbnail?: string;
};

export default function Detalhes() {
  const params = useLocalSearchParams();
  const idParam = params.id as string | undefined;
  const [detalhes, setDetalhes] = useState<Detalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!idParam) {
        setError('ID inválido');
        setLoading(false);
        return;
      }

      // tentar buscar por volume id primeiro
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(idParam)}`);
        if (res.ok) {
          const json = await res.json();
          const info = json.volumeInfo ?? {};
          setDetalhes({
            id: json.id,
            titulo: info.title,
            autor: (info.authors || []).join(', '),
            descricao: cleanDescription(info.description),
            isbn: (info.industryIdentifiers || []).find((i: any) => i.type && i.identifier && i.type.toLowerCase().includes('isbn'))?.identifier,
            paginas: info.pageCount ? String(info.pageCount) : undefined,
            ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
            thumbnail: normalizeThumbnail(info.imageLinks?.large ?? info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail) ?? undefined,
          });
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore and try isbn fallback
      }

      // fallback: buscar por ISBN
      try {
        const res2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(idParam)}`);
        if (res2.ok) {
          const json = await res2.json();
          const item = (json.items || [])[0];
          if (item) {
            const info = item.volumeInfo ?? {};
            setDetalhes({
              id: item.id,
              titulo: info.title,
              autor: (info.authors || []).join(', '),
              descricao: cleanDescription(info.description),
              isbn: idParam,
              paginas: info.pageCount ? String(info.pageCount) : undefined,
              ano: info.publishedDate ? String(info.publishedDate).split('-')[0] : undefined,
              thumbnail: normalizeThumbnail(info.imageLinks?.large ?? info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail) ?? undefined,
            });
            setLoading(false);
            return;
          }
        }
        setError('Livro não encontrado');
      } catch (e) {
        setError('Erro ao buscar detalhes');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [idParam]);

  // remove HTML tags, convert <br> and <p> to newlines and decode simple HTML entities
  const cleanDescription = (html?: string) => {
    if (!html) return undefined;
    let s = String(html);
    // replace <br> and <p> with newlines
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/?p[^>]*>/gi, '\n');
    // strip remaining tags
    s = s.replace(/<[^>]+>/g, '');
    // decode basic entities
    s = s.replace(/&(#?\w+);/g, (_m, g1) => {
      if (!g1) return '';
      if (g1.startsWith('#x') || g1.startsWith('#X')) {
        try { return String.fromCharCode(parseInt(g1.slice(2), 16)); } catch { return '' }
      }
      if (g1.startsWith('#')) {
        try { return String.fromCharCode(parseInt(g1.slice(1), 10)); } catch { return '' }
      }
      switch (g1) {
        case 'amp': return '&';
        case 'lt': return '<';
        case 'gt': return '>';
        case 'quot': return '"';
        case 'apos': return "'";
        default: return '';
      }
    });
    // collapse multiple newlines
    s = s.replace(/\n{3,}/g, '\n\n');
    return s.trim();
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={cores.primaryText} /></View>;
  if (error) return <View style={styles.center}><Text style={{ color: 'red' }}>{error}</Text></View>;
  if (!detalhes) return <View style={styles.center}><Text style={{ color: cores.secondaryText }}>Sem detalhes</Text></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {detalhes.thumbnail ? (
        <Image source={{ uri: detalhes.thumbnail }} style={styles.capa} />
      ) : detalhes.isbn ? (
        <Image source={{ uri: openLibraryCover(detalhes.isbn, 'L') }} style={styles.capa} />
      ) : (
        <View style={[styles.capa, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="book-outline" size={64} color={cores.secondaryText} />
        </View>
      )}

      <Text style={styles.titulo}>{detalhes.titulo}</Text>
      <Text style={styles.autor}>{detalhes.autor}</Text>
      <Text style={styles.info}>ISBN: {detalhes.isbn}</Text>
      <Text style={styles.info}>Páginas: {detalhes.paginas} | Ano: {detalhes.ano}</Text>

      <Text style={styles.sectionTitle}>Sinopse</Text>
      <Text style={styles.descricao}>{detalhes.descricao ?? 'Sem sinopse disponível.'}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  capa: { width: '100%', height: 420, resizeMode: 'contain', marginBottom: 16 },
  titulo: { color: cores.primaryText, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  autor: { color: cores.secondaryText, fontSize: 16, marginBottom: 8 },
  info: { color: cores.infoText, fontSize: 14, marginBottom: 8 },
  sectionTitle: { color: cores.primaryText, fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  descricao: { color: cores.secondaryText, fontSize: 14, lineHeight: 20 },
});
