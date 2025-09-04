import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {useRouter} from 'expo-router'

export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>
        <View style={styles.menu}>
            <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
            <Text style={styles.icon}>🏠</Text>
            </TouchableOpacity>
            <Text style={{fontSize:30, color:'#fff'}}>TEXT</Text>
        </View>
        <View style={styles.row}>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
        </View>
        <View style={styles.row}>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
        </View>
        <View style={styles.row}>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
            <Image source={require('../assets/cabalo.jpg')} style={styles.img}></Image>
        </View>
    </View>
  );

}

type CustomButtonProps = {
  text: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000ff',
    alignItems: 'center',
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 20,
    },
    
  menu:{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  iconButton: {
    padding: 16,
    borderRadius: 32,
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  img: {
    backgroundColor: '#eceff3ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginHorizontal: 8,
    elevation: 2,
    height: 200,
    width: 160,
  }
});
