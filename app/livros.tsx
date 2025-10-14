import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.menu}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
          <Text style={styles.icon}>🏠</Text>
        </TouchableOpacity>
        <Text style={styles.menuTitle}>Biblioteca</Text>
      </View>
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
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BFB493',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#BFB493',
    paddingTop: 40,
    paddingBottom: 16,
  },
  iconButton: {
    padding: 16,
    borderRadius: 32,
  },
  icon: {
    fontSize: 32,
    color: '#A67051',
    textAlign: 'center',
  },
  menuTitle: {
    fontSize: 30,
    color: '#593520',
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
    borderColor: '#A67051',
  },
});
