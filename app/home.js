import { Alert, Button, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect, useState } from "react";
import { FontAwesome6, FontAwesome, Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import defaultAvatar from '../assets/linechat.png';

SplashScreen.preventAutoHideAsync();

export default function home() {

    const [getMobile, setMobile] = useState();

    const [getChatArray, setChatArray] = useState([]);
    const [getSearchQuery, setSearchQuery] = useState('');
    const [getFilteredChatArray, setFilteredChatArray] = useState([]);

    const [loaded, error] = useFonts(
        {

            "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
            "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
            "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),

        }
    );

    const [imageExists, setImageExists] = useState(true);

    const parseDateTime = (dateTimeString) => {
        const [year, month, day, time, period] = dateTimeString.split(/[ ,]+/);

        let [hours, minutes] = time.split(':');

        if (period === 'PM' && hours !== '12') {
            hours = parseInt(hours, 10) + 12;
        } else if (period === 'AM' && hours === '12') {
            hours = '00';
        }

        return new Date(year, month - 1, day, hours, minutes);
    };


    useEffect(
        () => {
            async function fetchData() {

                let userJson = await AsyncStorage.getItem("user");//log wela inn userw
                let user = JSON.parse(userJson);

                setMobile(user.mobile);

                let response = await fetch(process.env.EXPO_PUBLIC_URL + "/LineChat/ChatLoadHomeData?id=" + user.id);

                if (response.ok) {
                    let json = await response.json();
                    //console.log(json);

                    if (json.success) {

                        let chatArray = json.jsonChatArray;
                        //console.log(chatArray);
                        setChatArray(chatArray);//

                    }

                }

            }

            fetchData();
        }, []
    );

    useEffect(() => {
        const avatarUrl = `${process.env.EXPO_PUBLIC_URL}/LineChat/AvatarImages/${getMobile}.png`;
        const checkImageExists = async () => {
            try {
                const response = await fetch(avatarUrl);
                setImageExists(response.ok);
            } catch (error) {
                setImageExists(false);
            }
        };

        if (getMobile) {
            checkImageExists();
        } else {
            setImageExists(false);
        }
    }, [getMobile]);

    useEffect(() => {

        console.log(getChatArray);
        const filtered = getChatArray.filter(item =>
            item.other_user_name.toLowerCase().includes(getSearchQuery.toLowerCase())
        );

        filtered.sort((a, b) => parseDateTime(b.dateTime) - parseDateTime(a.dateTime));

        setFilteredChatArray(filtered);
    }, [getSearchQuery, getChatArray]);

    //filter krl chatArray ekn gnnw search query ek anuwa - Search handler 
    // useEffect(() => {
    //     const filtered = getChatArray.filter(item =>
    //         item.other_user_name.toLowerCase().includes(getSearchQuery.toLowerCase())
    //     );
    //     setFilteredChatArray(filtered);
    // }, [getSearchQuery, getChatArray]);


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

    return (

        <LinearGradient colors={['#8B5E3C', '#6F4E37', '#8B5E3C']} style={styles.container}>

            <StatusBar
                hidden={true}
            // animated={true}
            // translucent={true}
            // backgroundColor="transparent"
            />
            <View style={styles.topBar}>

                <Pressable style={styles.profileButton} onPress={() => router.push("/profile")}>
                    {
                        getMobile && imageExists ? (
                            <Image
                                style={styles.userAvatar}
                                contentFit="fit"
                                source={{ uri: `${process.env.EXPO_PUBLIC_URL}/LineChat/AvatarImages/${getMobile}.png?timestamp=${new Date().getTime()}` }}
                            />
                        ) : (
                            <Image
                                style={styles.userAvatar}
                                source={defaultAvatar}
                            />
                        )
                    }
                </Pressable>


                <View style={styles.searchContainer}>

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search through Users"
                        placeholderTextColor="#7A7A7A"
                        value={getSearchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Ionicons name="search" size={20} color="#7A7A7A" style={styles.searchIcon} onPress={
                        () => { }
                    } />
                </View>
            </View>

            <View style={styles.header}>
                <Text style={styles.headerTitle}>LINECHAT <FontAwesome name="comments" size={40} /></Text>
            </View>




            <FlashList
                data={getFilteredChatArray}
                renderItem={
                    ({ item }) =>

                        <Pressable style={styles.chatItem} onPress={
                            () => {
                                //Alert.alert("View Chat", "User:" + item.other_user_id);
                                //router.push("/chat?other_user_id="+item.other_user_id);

                                router.push(
                                    {
                                        pathname: "/chat",
                                        params: item
                                    }
                                );
                            }
                        }>

                            <View style={styles.avatarContainer}>

                                {
                                    item.avatar_image_found ?

                                        <Image
                                            style={styles.avatar}
                                            contentFit="contain"
                                            source={process.env.EXPO_PUBLIC_URL + "/LineChat/AvatarImages/" + item.other_user_mobile + ".png"} />
                                        :
                                        <Text style={styles.text6}>{item.other_user_avatar_letters}</Text>
                                }

                                <View style={item.other_user_status == 1 ? styles.onlineDot : styles.offlineDot}></View>

                            </View>

                            <View style={styles.chatDetails}>
                                <Text style={styles.chatName}>{item.other_user_name}</Text>
                                <Text style={styles.chatMessage} numberOfLines={1}>{item.message}</Text>

                                <View style={styles.chatTimeContainer}>
                                    <Text style={styles.chatTime}>{item.dateTime}</Text>
                                    <FontAwesome6 name={"check"} color={item.chat_status_id == 1 ? "green" : "#D3D3D3"} size={20} />

                                </View>
                            </View>
                        </Pressable>
                }

                estimatedItemSize={200}
            />

            <View style={styles.footer}>
                <Pressable onPress={() => router.push("/profile")}>
                    <FontAwesome name="user" size={28} color="white" />
                </Pressable>
                <Pressable onPress={() => router.push("")}>
                    <FontAwesome name="comments" size={28} color="white" />
                </Pressable>
                <Pressable onPress={() => router.push("/testing4")}>
                    <FontAwesome name="cog" size={28} color="white" />
                </Pressable>
            </View>

        </LinearGradient>


    );
}


const styles = StyleSheet.create(
    {
        container: {
            flex: 1,
            paddingHorizontal: 15,
            paddingVertical: 40,
        },
        topBar: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        profileButton: {
            marginRight: 15,
        },
        userAvatar: {
            width: 45,
            height: 45,
            borderRadius: 22.5,
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "white",

        },
        text5: {
            fontFamily: "Montserrat-Regular",
            fontSize: 14,
            alignSelf: "flex-end",
        },
        searchContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF',
            borderRadius: 25,
            paddingHorizontal: 10,
            height: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            fontFamily: 'Montserrat-Regular',
            color: '#333',
        },
        header: {
            marginBottom: 20,
        },
        headerTitle: {
            fontSize: 35,
            fontFamily: 'Montserrat-Bold',
            color: '#333',
            alignSelf: 'center'
        },
        chatList: {
            flex: 1,

        },
        chatItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#E6E6E6',
            paddingEnd: 18,
        },
        avatarContainer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            borderWidth: 2,
            borderColor: '#FFF',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#D2B48C',

        },
        avatar: {
            width: '100%',
            height: '100%',
            borderRadius: 25,
            contentFit: 'cover',
        },
        onlineDot: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            backgroundColor: '#008000',
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#FFF',
        },
        offlineDot: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 12,
            height: 12,
            backgroundColor: 'red',
            borderRadius: 6,
            borderWidth: 2,
            borderColor: '#FFF',
        },
        chatDetails: {
            flex: 1,
            paddingHorizontal: 15,
        },
        chatName: {
            fontSize: 16,
            fontFamily: 'Montserrat-Bold',
            color: '#333',
        },
        chatMessage: {
            fontSize: 14,
            fontFamily: 'Montserrat-Regular',
            color: 'white',
        },
        chatTimeContainer: {
            alignItems: 'flex-end',
        },
        chatTime: {
            fontSize: 12,
            fontFamily: 'Montserrat-Regular',
            color: '#B0B0B0',
        },
        notificationDot: {
            marginTop: 5,
        },

        text6: {
            fontSize: 22,
            fontFamily: 'Montserrat-Bold',
            color: '#7B3F00',
            textAlign: 'center',
            lineHeight: 50,
            
        },


        signupButton: {
            backgroundColor: '#7B3F00',
            width: '100%',
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            marginTop: 5,
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

        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            backgroundColor: '#333',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            paddingVertical: 10,
        },
        

    }
);
