import { StyleSheet, View, Text, TextInput, ScrollView, Pressable, ImageBackground } from 'react-native';
import { useFonts } from 'expo-font';
import { FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState, useRef } from "react";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function chat() {

    const item = useLocalSearchParams();
    //console.log(item.other_user_id);

    const [getChatArray, setChatArray] = useState([]);

    const [getChatText, setChatText] = useState([]);

    const flashListRef = useRef(null);

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

    useEffect(
        () => {

            let intervalId;

            async function fetchChatArray() {

                try {

                    let userJson = await AsyncStorage.getItem("user");
                    let user = JSON.parse(userJson); //json krpu ek js obj ekk krgnnw
                    //console.log(user.id);

                    if (user) {

                        let response = await fetch(process.env.EXPO_PUBLIC_URL + "/LineChat/LoadChat?logged_user_id=" + user.id + "&other_user_id=" + item.other_user_id);
                        if (response.ok) {
                            let chatArray = await response.json();//respnse ek json krl chatArray ek arn setter method ek call krnw
                            console.log(chatArray);
                            setChatArray(chatArray);
                        }

                    } else {

                        clearInterval(intervalId);

                    }

                } catch (error) {

                    console.log("Error fetching chat array", error)

                }

            }
            fetchChatArray();

            intervalId = setInterval(() => {
                fetchChatArray();
            }, 5000);

            return () => {
                clearInterval(intervalId);
            }

        }, []
    );

    useEffect(() => { //last msg ekt scroll wenna
        if (flashListRef.current && getChatArray.length > 0) {
            flashListRef.current.scrollToEnd({ animated: true });
        }
    }, [getChatArray]);


    return (
        <ImageBackground source={require('../assets/linechatbg.png')} style={styles.backgroundImage}>
            <StatusBar hidden={true} />

            <View style={styles.header}>
                <View style={styles.profileSection}>

                    <View style={styles.profileContainer}>
                        {
                            item.avatar_image_found == "true"//true - string wdyt

                                ? <Image style={styles.profileImage}
                                    source={process.env.EXPO_PUBLIC_URL + "/LineChat/AvatarImages/" + item.other_user_mobile + ".png"}

                                    contentFit="contain" />
                                : <Text style={styles.text6}>{item.other_user_avatar_letters}</Text>

                        }

                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.other_user_name}</Text>
                        <Text style={styles.userStatus}>{item.other_user_status == 1 ? "Online" : "Offline"}</Text>
                    </View>
                </View>
                <View style={styles.iconsSection}>
                    <Pressable style={styles.iconButton}>
                        <FontAwesome6 name="phone" size={24} color="white" />
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <FontAwesome6 name="video" size={24} color="white" />
                    </Pressable>
                </View>
            </View>


            <View style={styles.chatContainer}>

                <FlashList

                    ref={flashListRef}//last msg scroll ekt
                    data={getChatArray}//attributes gnne
                    renderItem={
                        ({ item }) =>

                            <View style={item.side == "right" ? styles.fromMe : styles.fromThem}>
                                <Text >{item.message}</Text>
                                <Text style={styles.messageTime}>{item.datetime}</Text>
                                {
                                    item.side == "right" ?
                                        <FontAwesome6 name={"check"} color={item.status == 1 ? "green" : "gray"} size={18} />
                                        :
                                        null
                                }
                            </View>

                    }
                    estimatedItemSize={200}

                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type Your Message Here"
                    placeholderTextColor="#C0A079"
                    value={getChatText}
                    onChangeText={
                        (text) => {
                            setChatText(text);
                        }
                    }
                />

                <Pressable
                    style={styles.sendButton}
                    onPress={
                        async () => {

                            if (getChatText.length == 0) {
                                Alert.alert("Error", "Please Enter Your Message");
                            } else {

                                let userJson = await AsyncStorage.getItem("user");
                                let user = JSON.parse(userJson);

                                //console.log(getChatText);

                                let response = await fetch(process.env.EXPO_PUBLIC_URL + "/LineChat/SendChat?logged_user_id=" + user.id + "&other_user_id=" + item.other_user_id + "&message=" + getChatText);

                                if (response.ok) {
                                    let json = await response.json();//json content ek arn

                                    if (json.success) {
                                        console.log("Message Sent");
                                        setChatText("");//sentnn field ek empty kra
                                    }
                                }


                            }

                        }
                    }
                >
                    <FontAwesome6 name="paper-plane" size={20} color="white" />
                </Pressable>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        contentFit: 'cover',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2C2C2C',
        borderBottomWidth: 1,
        borderBottomColor: '#4A4A4A',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    userInfo: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 18,
        fontFamily: 'Montserrat-Bold',
        color: '#F0D1A0',
    },
    userStatus: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: '#4CAF50',
    },
    iconsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 15,
    },
    chatContainer: {
        flex: 1,
        padding: 20,
    },
    messageContainer: {
        marginBottom: 15,
    },
    fromMe: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        position: 'relative',
        backgroundColor: 'grey',
        alignSelf: 'flex-end',
        borderTopRightRadius: 0,
    },
    fromThem: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        position: 'relative',
        backgroundColor: '#A5792C',
        alignSelf: 'flex-start',
        borderTopLeftRadius: 0,
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        color: '#F0E4C0',
    },
    messageTime: {
        fontSize: 12,
        color: '#C8A78E',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#E8E8E8',
        backgroundColor: '#2C2C2C',
    },
    input: {
        flex: 1,
        padding: 10,
        paddingLeft: 15,
        fontSize: 16,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#4A4A4A',
        color: '#F0E4C0',
        fontFamily: 'Montserrat-Regular',
    },
    sendButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#7B3F00',
        borderRadius: 20,
    },
    text6: {
        fontSize: 25,
        fontFamily: 'Montserrat-Bold',
        color: '#7B3F00',
        textAlign: 'center',
        lineHeight: 50,
    },

    profileContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D2B48C',
        marginRight: 10,

    },

    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        contentFit: 'cover',
    }

});
