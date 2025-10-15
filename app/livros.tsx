import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores } from './config';

export default function App() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
          <Ionicons name="home-outline" size={32} color={cores.iconHighlight} />
        </TouchableOpacity>
        <Text style={styles.menuTitle}>Biblioteca</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
        </View>
        <View style={styles.row}>
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
          <Image source={require('../assets/cabalo.jpg')} style={styles.img} />
        </View>
      </ScrollView>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.background,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: cores.menuBackground,
    paddingTop: 16,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 16,
    borderRadius: 32,
  },
  menuTitle: {
    fontSize: 30,
    color: cores.primaryText,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  img: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 2,
    height: 200,
    width: 160,
    borderWidth: 2,
    borderColor: cores.secondary,
  },
});
