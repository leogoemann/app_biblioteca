import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {useRouter} from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const router = useRouter();
  return (
    <View style={styles.container}>
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
      <View style={styles.menu}>
          <TouchableOpacity onPress={() => router.push('/')} style={styles.iconButton}>
              <Ionicons name="home-outline" size={32} color="#fff"></Ionicons>
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
        
    menu: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: '#000', // garante contraste
      paddingVertical: 12,
    },

    iconButton: {
        padding: 16,
        borderRadius: 32,
        marginBottom: 24,
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
    },
});
