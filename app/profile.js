import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ScrollView, Alert, ImageBackground } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from 'expo-status-bar';
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

SplashScreen.preventAutoHideAsync();

export default function Profile() {

    const avatarImage = require("../assets/linechat.png");
    const [isEditable, setEditable] = useState({
        firstName: false,
        lastName: false,
        password: false,
    });

    const [getFirstName, setFirstName] = useState('');
    const [getLastName, setLastName] = useState('');
    const [getMobile, setMobile] = useState('');
    const [getPassword, setPassword] = useState('');
    const [getUserId, setUserId] = useState(null);

    const [getSecureText, setSecureText] = useState(true);
    const [getImage, setImage] = useState(null);
    const [imageExists, setImageExists] = useState(true);

    const defaultImageUrl = `${process.env.EXPO_PUBLIC_URL}/LineChat/AvatarImages/${getMobile}.png`;

    const [loaded, error] = useFonts({
        "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
        "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
        "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    });

    useEffect(() => {
        const checkImageExists = async () => {
            try {
                const response = await fetch(defaultImageUrl);
                setImageExists(response.ok);
            } catch (error) {
                setImageExists(false);
            }
        };

        checkImageExists();
    }, [getMobile]);

    useEffect(() => {
        async function fetchData() {
            let user = JSON.parse(await AsyncStorage.getItem("user"));
            if (user) { 
                setUserId(user.id);
                setFirstName(user.first_name);
                setLastName(user.last_name);
                setMobile(user.mobile);
                setPassword(user.password);
            } else {
                console.log("No user data found in AsyncStorage.");
            }
        }
        fetchData();
    }, []);

    useEffect(
        () => {
            if (loaded || error) {
                SplashScreen.hideAsync();
            }
        }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    async function updateProfile() {

        //Alert.alert("Update");

        try {

            let formData = new FormData();
            formData.append("mobile", getMobile);
            formData.append("firstName", getFirstName);
            formData.append("lastName", getLastName);
            formData.append("password", getPassword);

            if (getImage != null) {
                formData.append("avatarImage",
                    {
                        name: "avatar.png",
                        type: "image/png",
                        uri: getImage
                    }
                );
            }

            console.log(formData)

            let response = await fetch(
                process.env.EXPO_PUBLIC_URL + "/LineChat/UpdateUserDetails",

                {
                    method: "POST",
                    body: formData
                }
            );

            if (response.ok) {
                let json = await response.json();

                if (json.success) {

                    Alert.alert("Success", json.message);

                    let updatedUser = {
                        id: getUserId,
                        first_name: getFirstName,
                        last_name: getLastName,
                        mobile: getMobile,
                        password: getPassword,
                    };
                    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

                    const updatedImageUrl = `${process.env.EXPO_PUBLIC_URL}/LineChat/AvatarImages/${getMobile}.png?timestamp=${new Date().getTime()}`;
                    setImage(updatedImageUrl);

                    // router.replace("/home");
                } else {

                    Alert.alert("Error", json.message);
                    // setResponse(json.message);

                }

            }



        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to Update profile. Please try again later")
        }

    }

    useEffect(() =>{
        async function checkUser() {

            let userJson = await AsyncStorage.getItem("user");
            let user = JSON.parse(userJson);

            if(!user){
                router.replace("/");
            }
            
        }

        checkUser();
    },[]);

    const handleSignOut = async () => {

        try {

                let response =  await fetch( 

                    process.env.EXPO_PUBLIC_URL + "/LineChat/SignOut?id=" + getUserId 
                );

                if (response.ok) {

                    await AsyncStorage.removeItem("user");
                    router.replace("/signup");
                    Alert.alert("Signed Out", "You have signed out of your profile successfully.");
 
                } else {
                    
                    Alert.alert("Error","Failed to Sign Out!"); 
                }

            
        } catch (error) {

            console.log(error);
            
        }
        // await AsyncStorage.removeItem("user");
        // router.replace("/signup");
        // Alert.alert("Signed Out", "You have signed out of your profile successfully.");
        
    };

    const backgroundImage = require('../assets/linechatbg.png');

    return (
        <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
            <StatusBar hidden={true} />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>

                    <Pressable style={styles.avatarContainer} onPress={handleImagePick}>
                        {

                            getImage ? (
                                <Image contentFit="cover" style={styles.avatar} source={{ uri: getImage }} />
                            ) : imageExists ? (
                                <Image contentFit="cover" style={styles.avatar} source={{ uri: `${defaultImageUrl}?timestamp=${new Date().getTime()}` }} />
                            ) : (
                                <Image source={avatarImage} style={styles.avatar} />

                            )

                        }
                        <View style={styles.cameraIcon}>
                            <FontAwesome6 name={"camera"} color={"#FFF"} size={15} />
                        </View>
                    </Pressable>

                    <Text style={styles.nameText}>{getFirstName} {getLastName}</Text>

                    <View style={styles.infoContainer}>
                        <FontAwesome6 name={"phone"} color={"#7B3F00"} size={25} />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Mobile</Text>
                            <View style={styles.inputBox}>
                                <TextInput style={styles.inputText} value={getMobile} editable={false} maxLength={10}
                                    onChangeText={
                                        (text) => {
                                            setMobile(text);
                                        }
                                    } />
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <FontAwesome6 name="user" color="#7B3F00" size={25} />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>First Name</Text>
                            <View style={styles.inputBox}>
                                <TextInput
                                    style={[styles.inputField, styles.inputText]}
                                    editable={isEditable.firstName}
                                    value={getFirstName}
                                    onChangeText={
                                        (text) => {
                                            setFirstName(text);
                                        }
                                    }
                                />
                                <FontAwesome6
                                    name="pen"
                                    color="#FFF"
                                    size={15}
                                    style={styles.iconStyle}
                                    onPress={() => setEditable({ ...isEditable, firstName: true })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <FontAwesome6 name="user" color="#7B3F00" size={25} />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Last Name</Text>
                            <View style={styles.inputBox}>
                                <TextInput
                                    style={[styles.inputField, styles.inputText]}
                                    editable={isEditable.lastName}
                                    value={getLastName}
                                    onChangeText={
                                        (text) => {
                                            setLastName(text);
                                        }
                                    }
                                />
                                <FontAwesome6
                                    name="pen"
                                    color="#FFF"
                                    size={15}
                                    style={styles.iconStyle}
                                    onPress={() => setEditable({ ...isEditable, lastName: true })}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoContainer}>
                        <FontAwesome6 name={"lock"} color="#7B3F00" size={25} />
                        <View style={styles.infoText}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputBox}>
                                <TextInput
                                    style={[styles.inputField, styles.inputText]}
                                    secureTextEntry={getSecureText}
                                    editable={isEditable.password}
                                    value={getPassword}
                                    onChangeText={
                                        (text) => {
                                            setPassword(text);
                                        }
                                    }
                                />
                                <View style={styles.iconContainer}>
                                    <FontAwesome6
                                        name={"eye"}
                                        color="#FFF"
                                        size={15}
                                        style={styles.iconStyle}
                                        onPress={() => setSecureText(!getSecureText)}
                                    />
                                    <FontAwesome6
                                        name={"pen"}
                                        color="#FFF"
                                        size={15}
                                        style={[styles.iconStyle, { marginLeft: 10 }]}
                                        onPress={() => setEditable({ ...isEditable, password: true })}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.updateButton} onPress={updateProfile}>
                            <FontAwesome6 name="pen-to-square" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Update Profile</Text>
                        </Pressable>
                        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
                            <FontAwesome6 name="right-from-bracket" size={20} color="#FFF" />
                            <Text style={styles.buttonText}>Sign Out</Text>
                        </Pressable>
                    </View>
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
        width: '90%',
        alignItems: 'center',
    },
    avatarContainer: {
        backgroundColor: '#f0f0f0',
        borderRadius: 50,
        borderWidth: 2,
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#7B3F00",
        borderRadius: 15,
        padding: 10,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    nameText: {
        fontSize: 24,
        fontFamily: "Montserrat-Bold",
        color: "#FFF",
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontFamily: "Montserrat-Light",
        color: "#FFF",
        marginBottom: 5,
    },
    inputBox: {
        backgroundColor: "#2A2A2A",
        borderColor: "#7B3F00",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center', // Vertically center icons
        justifyContent: 'space-between', // Align icons at the end
    },
    iconContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconStyle: {
        marginLeft: 10, // Add space between the icons
    },
    inputText: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "#FFF",
        flex: 1,
    },
    inputField: {
        color: "#FFF",
    },
    infoContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
        width: "100%",
    },
    infoText: {
        flex: 1,
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 30,
    },
    updateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#7B3F00",
        padding: 12,
        borderRadius: 10,
        width: '45%',
        justifyContent: 'center',
    },
    signOutButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#C44C51",
        padding: 12,
        borderRadius: 10,
        width: '45%',
        justifyContent: 'center',
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        marginLeft: 8,
    },
});



