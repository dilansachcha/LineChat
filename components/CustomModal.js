import React from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

const CustomModal = ({ modalVisible, setModalVisible, title, inputs, onSave, onCancel }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={onCancel}>
            <View style={stylesheet.centeredView}>
                <View style={stylesheet.modalView}>
                    <Text style={stylesheet.modalText}>{title}</Text>

                    {inputs.map((input, index) => (
                        <TextInput
                            key={index}
                            style={stylesheet.input1}
                            placeholder={input.placeholder}
                            value={input.value}
                            onChangeText={input.onChangeText} // Pass the change handler
                        />
                    ))}

                    <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
                        <Pressable
                            style={[stylesheet.button, stylesheet.buttonClose]}
                            onPress={onCancel}>
                            <Text style={stylesheet.textStyle}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[stylesheet.button, stylesheet.buttonClose]}
                            onPress={() => {
                                onSave(); // Call the onSave function passed as a prop
                            }}>
                            <Text style={stylesheet.textStyle}>Save</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomModal;

const stylesheet = StyleSheet.create({
    input1: {
        width: "100%",
        height: 50,
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "#FAF9F6",
        borderRadius: 15,
        paddingStart: 10,
        marginBottom: 20,
        color: "#FAF9F6",
        backgroundColor: '#7B3F00', // Change background color to brown theme
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Slightly dark background for modal
    },
    modalView: {
        width: "80%",
        margin: 20,
        backgroundColor: '#1E1A15', // Darker brown color for modal
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        borderRadius: 20,
        padding: 10,
    },
    buttonOpen: {
        backgroundColor: 'transparent',
    },
    buttonClose: {
        backgroundColor: '#7B3F00', // Brown color for buttons
        marginHorizontal: 5, // Space between buttons
    },
    textStyle: {
        color: '#FAF9F6',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        color: "#FAF9F6",
        fontWeight: 'bold',
        fontSize: 20, // Slightly larger text for better visibility
    }
});
