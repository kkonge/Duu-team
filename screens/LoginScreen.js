import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Apple Sign Up Button */}
      <TouchableOpacity style={styles.appleButttonOutline}>
        <FontAwesome name="apple" size={18} color="black" />
        <Text style={styles.appleText}>Sign Up with Apple</Text>
      </TouchableOpacity>

      {/* Apple Continue */}
      <TouchableOpacity style={styles.appleButttonOutline}>
        <FontAwesome name="apple" size={18} color="black" />
        <Text style={styles.appleText}>Continue with Apple</Text>
      </TouchableOpacity>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={styles.blackButton}
        onPress={() => navigation.navigate('SignUp')} 
      >
        <Text style={styles.blackButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.blackButton}
        onPress={() => navigation.navigate('Log')}  
      >
        <Text style={styles.blackButtonText}>Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop:300,
        
    },
    appleButttonOutline: {
        width: '80%',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        marginTop: 10,

    },
    appleText:{
        fontSize:16, 
        marginLeft: 8,
        color: 'black',
        fontWeight: '500'
    },
    icon:{
        marginRight: 4,
    },
    blackButton:{
        width: '80%',
        paddingVertical: 14,
        backgroundColor: 'black',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        flexDirection: 'row',
    },
    blackButtonText:{
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});