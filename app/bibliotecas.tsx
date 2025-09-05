import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export default function App() {
  const router = useRouter();
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {locationGranted && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -25.5315,
            longitude: -49.2036,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}                                                                                                            
        >
          <Marker
            coordinate={{ latitude: -25.5315, longitude: -49.2036 }}
            title="Você está aqui"
            description="São José dos Pinhais"
          />
        </MapView>
      )}

      {!locationGranted && (
        <View style={styles.permissionWarning}>
          <Ionicons name="alert-circle-outline" size={48} color="#fff" />
        </View>
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
          <Ionicons name="heart-outline" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    backgroundColor: '#000',
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
  },
});