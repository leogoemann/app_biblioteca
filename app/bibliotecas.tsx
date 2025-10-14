import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { cores } from './config';

type Biblioteca = {
  id: string;
  nome?: string;
  lat: number;
  lon: number;
  endereco?: string;
  distanceMeters?: number;
};

export default function App() {
  const router = useRouter();
  const [locationGranted, setLocationGranted] = useState(false);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [libraries, setLibraries] = useState<Biblioteca[]>([]);
  const [loadingLibraries, setLoadingLibraries] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationGranted(granted);
      if (granted) {
        const pos = await Location.getCurrentPositionAsync({});
        setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }
    })();
  }, []);

  useEffect(() => {
    if (position) {
      fetchNearbyLibraries(position.latitude, position.longitude, 5000);
    }
  }, [position]);

  const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchNearbyLibraries = async (lat: number, lon: number, radius = 5000) => {
    setLoadingLibraries(true);
    setError(null);
    try {
      const query = `[out:json][timeout:25];(node["amenity"="library"](around:${radius},${lat},${lon});way["amenity"="library"](around:${radius},${lat},${lon});relation["amenity"="library"](around:${radius},${lat},${lon}););out center;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      if (!res.ok) throw new Error(`Overpass retornou ${res.status}`);
      const json = await res.json();
      const elements = json.elements || [];
      const libs: Biblioteca[] = elements.map((el: any) => {
        const latEl = el.lat ?? el.center?.lat;
        const lonEl = el.lon ?? el.center?.lon;
        const name = (el.tags && (el.tags.name || el.tags['name:pt'])) ?? undefined;
        const addr = el.tags ? [el.tags['addr:street'], el.tags['addr:housenumber'], el.tags['addr:city']].filter(Boolean).join(', ') : undefined;
        const dist = (latEl && lonEl && position) ? Math.round(haversine(position.latitude, position.longitude, latEl, lonEl)) : undefined;
        return {
          id: String(el.id),
          nome: name ?? 'Biblioteca',
          lat: latEl,
          lon: lonEl,
          endereco: addr,
          distanceMeters: dist,
        } as Biblioteca;
      }).filter((b: Biblioteca) => b.lat && b.lon);
      // sort by distance
      libs.sort((a,b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
      setLibraries(libs);
    } catch (e: any) {
      console.error('Erro fetching libraries', e);
      setError(String(e));
    } finally {
      setLoadingLibraries(false);
    }
  };

  const refreshLocation = async () => {
    try {
      const pos = await Location.getCurrentPositionAsync({});
      setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      fetchNearbyLibraries(pos.coords.latitude, pos.coords.longitude, 5000);
    } catch (e: any) {
      setError('Não foi possível obter localização');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {locationGranted && position && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          region={{
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker
            coordinate={{ latitude: position.latitude, longitude: position.longitude }}
            title="Você está aqui"
          />
          {libraries.map(lib => (
            <Marker
              key={lib.id}
              coordinate={{ latitude: lib.lat, longitude: lib.lon }}
              title={lib.nome}
              description={lib.endereco}
            />
          ))}
        </MapView>
      )}

      {!locationGranted && (
        <View style={styles.permissionWarning}>
          <Ionicons name="alert-circle-outline" size={48} color={cores.secondaryText} />
          <Text style={{ color: cores.secondaryText, marginTop: 8 }}>Permissão de localização necessária para mostrar bibliotecas próximas.</Text>
        </View>
      )}

      <View style={{ position: 'absolute', top: 75, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 }}>
        <TouchableOpacity onPress={() => refreshLocation()} style={{ backgroundColor: cores.menuBackground, padding: 8, borderRadius: 8 }}>
          <Text style={{ color: cores.primaryText }}>Atualizar localização</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLibraries([])} style={{ backgroundColor: cores.menuBackground, padding: 8, borderRadius: 8 }}>
          <Text style={{ color: cores.primaryText }}>Limpar marcadores</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {loadingLibraries && <ActivityIndicator color={cores.primaryText} />}
        {error && <Text style={{ color: 'red' }}>{error}</Text>}
        <FlatList
          data={libraries}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.libTitle}>{item.nome}</Text>
              <Text style={styles.libAddr}>{item.endereco}</Text>
              <Text style={styles.libDist}>{item.distanceMeters ? `${item.distanceMeters} m` : ''}</Text>
            </View>
          )}
        />
      </View>

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

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  permissionWarning: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cores.background,
  },
  listContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    maxHeight: '40%',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  listItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 8,
    marginVertical: 6,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  libTitle: {
    color: cores.primaryText,
    fontWeight: '700',
  },
  libAddr: {
    color: cores.secondaryText,
  },
  libDist: {
    color: cores.infoText,
    marginTop: 4,
  },
});
