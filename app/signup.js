import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, TextInput, ScrollView, Alert, ImageBackground } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router, Stack } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

SplashScreen.preventAutoHideAsync();

export default function Signup() {

  const [getImage, setImage] = useState(null);

  const [getMobile, setMobile] = useState("");
  const [getFirstName, setFirstName] = useState("");
  const [getLastName, setLastName] = useState("");
  const [getPassword, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loaded, error] = useFonts(
    {

      "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
      "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
      "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),

    }
  );

  useEffect(
    () => {
      if (loaded || error) {
        SplashScreen.hideAsync();
      }
    }, [loaded, error]
  );

  if (!loaded && !error) {
    return null;
  }

  const backgroundImage = require('../assets/linechatbg.png');

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
      <StatusBar

        hidden={true}
      // animated={true}
      // translucent={true}
      // backgroundColor="transparent"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>

          <Pressable onPress={

            async () => {
              let result = await ImagePicker.launchImageLibraryAsync(
                {}
              );

              if (!result.canceled) {
                setImage(result.assets[0].uri);
              }

            }
          } style={styles.avatarContainer}>
            <Image source={getImage} style={styles.avatar} contentFit="cover" />
          </Pressable>

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            maxLength={10}
            placeholder="Enter Mobile number"
            onChangeText={
              (text) => {
                setMobile(text);
              }
            }
          />

          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter First Name"
            inputMode={"text"}
            onChangeText={
              (text) => {
                setFirstName(text);
              }
            }
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Last Name"
            inputMode={"text"}
            onChangeText={
              (text) => {
                setLastName(text);
              }
            }
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword} 
              placeholder="Enter a Password"
              inputMode={"text"}
              maxLength={20}
              onChangeText={(text) => setPassword(text)}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Text>
              <FontAwesome6 name={showPassword ? "eye" : "eye-slash"} size={20} color="#7B3F00" />
              </Text>  
            </Pressable>
          </View>

          <Pressable style={styles.signupButton} onPress={
            async () => {

              let formData = new FormData(); //khomth for multipart
              formData.append("mobile", getMobile);
              formData.append("firstName", getFirstName);
              formData.append("lastName", getLastName);
              formData.append("password", getPassword);

              if (getImage != null) {//avatar img ek thibboth witri append wenne

                formData.append("avatarImage",
                  {
                    name: "avatar.png",
                    type: "image/png",
                    uri: getImage
                  }
                );
              }

              let response = await fetch(
                process.env.EXPO_PUBLIC_URL + "/LineChat/ChatSignUp",
                {
                  method: "POST",
                  body: formData, 
                }
              );

              if (response.ok) {
                let json = await response.json();
                //Alert.alert("Response", json.message);

                if (json.success) {//aye ena response ek anuwa
                  Alert.alert("Success", json.message);
                  router.replace("/");//index-signin ekt

                } else {
                  Alert.alert("Error", json.message);

                }
              }

            }
          }>
            <Text style={styles.signupText}>Create LineChat Account</Text>
          </Pressable>

          <Pressable
            style={styles.signInButton}
            onPress={
              () => {
                //Alert.alert("Message", "Go to Sign In");
                router.replace("/");
              }
            }
          >
            <Text style={styles.signInText}>Already Registered? Go to Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    contentFit: 'cover',
    justifyContent: 'center',
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#1E1A15',
    borderRadius: 25,
    padding: 20,
    width: '100%',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    borderWidth:5,
    borderColor: "black",
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation:10,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth:5,
    borderColor: "black",
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
    alignSelf: 'flex-start',
    marginVertical: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F1F1F1',
    borderRadius: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  signupButton: {
    backgroundColor: '#7B3F00',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginTop: 20,
    shadowColor: 'white',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  signupText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: 'white',
  },
  signInButton: {
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#7B3F00',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#F1F1F1',
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },

});
