import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import * as SQLite from 'expo-sqlite';

export default function Login(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userNotExist, setUserNotExist] = useState(false);

    const loginPressed = () => {
        props.database.transaction(tx => {
            if (username.length > 0 && password.length > 0) {
                tx.executeSql(
                    // sql query
                    "select * from users where username = ? and password = ?;",
                    // parameters for sql query
                    [username, password],
                    // if everything ok, rows will return our user
                    (_, { rows }) => {
                        // if user exist call handleLogin callback, if not set error
                        if (rows != null && rows.length > 0) {
                            props.handleLogin(rows._array[0].id, username,
                                (rows._array[0].apikey != null && rows._array[0].apikey.length > 0) ? rows._array[0].apikey : props.defaultKey);
                        } else {
                            setUserNotExist(true);
                        }
                    },
                    // if error happens, just print it
                    (_, error) => console.log("Login select failed, error " + error)
                );
            }
        });
    }

    return (
        <View style={styles.container}>
            <FloatingLabelInput
                label='Username:'
                onChangeText={(username) => {setUserNotExist(false); setUsername(username);}}
                value={username}
                containerStyles={styles.floatinglabelstyle}
                inputStyles={styles.floatinglabelinputstyle}
            />

            <FloatingLabelInput
                label='Password:'
                onChangeText={password => {setUserNotExist(false); setPassword(password);}}
                value={password}
                isPassword={true}
                containerStyles={styles.floatinglabelstylepassword}
                customShowPasswordComponent={<Text>Show</Text>}
                customHidePasswordComponent={<Text>Hide</Text>}
                inputStyles={styles.floatinglabelinputstyle}
            />

            {userNotExist && <Text style={styles.error}>User does not exist</Text>}
            {!userNotExist && <Text style={styles.error}>  </Text>}

            <View style={styles.buttonContainer}>
                <Button color="blue" onPress = {loginPressed} title="Login"/>
                <TouchableOpacity onPress={() => props.handleSignUpRequest()}>
                  <Text style={styles.title}>
                    SIGN UP
                  </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#607B8E',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    title: {
      color: 'blue',
      fontWeight: 'bold',
      marginLeft: 20,
    },
    floatinglabelstyle: {
        borderWidth: 2,
        paddingHorizontal: 10,
        margin: 10,
        marginTop: 50,
        backgroundColor: '#fff',
        borderColor: 'blue',
        borderRadius: 8,
        height: 40,
        width: '90%',
    },
    floatinglabelstylepassword: {
        borderWidth: 2,
        paddingHorizontal: 10,
        margin: 10,
        backgroundColor: '#fff',
        borderColor: 'blue',
        borderRadius: 8,
        height: 40,
        width: '90%',
    },
    floatinglabelinputstyle: {
        borderWidth: 0,
    },
    error: {
        color: 'red',
        fontSize: 12,
    },
});
