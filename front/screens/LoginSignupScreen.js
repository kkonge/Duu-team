import {FontAwesome} from '@expo/vector-icons';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export default function LoginSignupScreen({navigation}){
    return(
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>DOGGY</Text>   
              <Text style={styles.infoText}>Daily Care for your Best Friend</Text>
            </View>
        
        <View style={styles.bottomContainer}>
            
            {/*Start Button*/}
            <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('UserName')}>
                <Text style={styles.startButtonText}>GET STARTED</Text>
            </TouchableOpacity>

            {/*Login Button*/}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Already have an account? Log in</Text>
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
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {
    fontFamily: 'Pretendard-ExtraBold',
    fontWeight: 'bold',
    fontSize: 45,
    color: '#69DA00',
  },
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  startButton: {
   width: '90%',
    paddingVertical: 14,
    backgroundColor: 'black',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  startButtonText: {
    fontWeight: '600',
    color: '#fff',
    fontSize: 20,
  },
  loginText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
 
  infoText: {
    fontFamily: 'Futura',
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 5,
  },

});