import {FontAwesome} from '@expo/vector-icons';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default function LoginSignupScreen({navigation}){
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>Doggy</Text>
            </View>
        
        <View style={styles.bottomContainer}>
            
            {/*Start Button*/}
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('UserProfile')}>
                <Text style={styles.startButtonText}>시작하기</Text>
            </TouchableOpacity>

            {/*Login Button*/}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>이미 회원이신가요?</Text>
            </TouchableOpacity>

     
          </View>
        </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingHorizontal: 34,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'flex-start',
  },
  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  startButton: {
   width: '80%',
    paddingVertical: 14,
    backgroundColor: 'black',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  startButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 24,
  },
  loginText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },

});