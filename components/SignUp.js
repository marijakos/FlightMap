import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { FloatingLabelInput } from 'react-native-floating-label-input';
import * as SQLite from 'expo-sqlite';

export default function SignUp(props) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [apikey, setApikey] = useState('');
    const [userExist, setUserExist] = useState(false);
    const [disableSignUp, setDisableSignUp] = useState(true);

    // disable SignUp button if username or password is empty
    if (disableSignUp != (username.length == 0 || password.length == 0)) {
        setDisableSignUp(username.length == 0 || password.length == 0);
    }

    // save user on button press, first check if user exist, if not save it, otherwise error message
    const signUpPressed = () => {
        props.database.transaction(tx => {
            // check if username already exist
            tx.executeSql(
                "select * from users where username = ?;",
                [username],
                (_, { rows }) => {
                    if (rows == null || rows.length == 0) {
                        // user does not exist, so insert new user in database
                        let key = apikey;
                        // if apikey is empty use default apikey
                        if (key.length == 0) {
                            key = props.defaultKey;
                        }

                        // save new user
                        console.log("SignUp try to save the customer");
                        props.database.transaction(tx => {
                            tx.executeSql(
                                "insert into users (username, password, apikey) values (?, ?, ?);",
                                [username, password, key],
                                (_, results) => props.handleSignUpDone(results.insertId, username, key),
                                (_, error) => console.log("SignUp insert user failed, error " + error)
                            );}
                        );
                     } else {
                        console.log("SignUp error user already exist");
                        setUserExist(true);
                     }
                },
                (_, error) => console.log("SignUp select failed with error " + error)
            );
        });
    }

    const usernameChanged = (name) => {
        setUsername(name);
        setUserExist(false);
    }

    return (
        <View style={styles.container}>
            <FloatingLabelInput
                label='Username:'
                onChangeText={username => usernameChanged(username)}
                value={username}
                containerStyles={styles.floatinglabelstyle}
                inputStyles={styles.floatinglabelinputstyle}
            />

            {userExist && <Text style={styles.error}>Username already exist</Text>}
            {!userExist && <Text style={styles.error}> </Text>}

            <FloatingLabelInput
                label='Password:'
                onChangeText={password => setPassword(password)}
                value={password}
                isPassword={true}
                containerStyles={styles.floatinglabelstylepassword}
                customShowPasswordComponent={<Text>Show</Text>}
                customHidePasswordComponent={<Text>Hide</Text>}
                inputStyles={styles.floatinglabelinputstyle}
            />

            <Text style={styles.error}> </Text>

            <FloatingLabelInput
                label='Api Key:'
                onChangeText={apikey => setApikey(apikey)}
                value={apikey}
                containerStyles={styles.floatinglabelstyleapikey}
                inputStyles={styles.floatinglabelinputstyle}
            />

            <Text style={styles.error}> </Text>

            <View style={styles.buttonContainer}>
                <View style={styles.buttoncancel}>
                    <Button
                        color="blue"
                        onPress = {() => props.handleSignUpCanceled()}
                        title="Cancel"
                    />
                </View>

                <View>
                    <Button
                        color="blue"
                        onPress = {signUpPressed}
                        title="SIGN UP"
                        disabled={disableSignUp}
                    />
                </View>
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
        alignItems: 'center'
    },
    title: {
      color: 'blue',
      fontWeight: 'bold'
    },
    floatinglabelstyle: {
        borderWidth: 2,
        paddingHorizontal: 10,
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
    floatinglabelstyleapikey: {
        borderWidth: 2,
        paddingHorizontal: 10,
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
    buttoncancel: {
        marginRight: 50
    },
});
