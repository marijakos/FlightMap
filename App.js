import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text } from 'react-native-elements';
import * as SQLite from 'expo-sqlite';

import Login from './components/Login'
import SignUp from './components/SignUp'
import NavigationBar from './components/NavigationBar'

const db = SQLite.openDatabase('FlightMapDb.db');
const DEFAULT_API_KEY = "bad214-510753";

export default function App() {

    const [isSignUp, setIsSignUp] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [apiKey, setApikey] = useState('');
    const [userId, setUserId] = useState(0);

    // check database on start
    useEffect (() => {
        console.log("Application useEffect on start");

        // create table user
        db.transaction(tx => {
            tx.executeSql("create table if not exists users (id integer primary key not null, username text unique, password text, apikey text);",
                [],
                () => console.log("OK create table if not exists users;"), // ok callback
                (_, error) => console.log("create table if not exists users failed, error " + error) // error callback
            );
        });
        // create table history with foreign key
        db.transaction(tx => {
            tx.executeSql("create table if not exists history (id integer primary key not null, userid integer, info text, saveddate text, foreign key (userid) references users(id));",
                [],
                () => console.log("OK create table if not exists history;"),
                (_, error) => console.log("create table if not exists history failed, error " + error)
            );
        });

        // code run at the end, closing database
        return () => { if (db != null && db._db != null) { db._db.close(); } }
    }, []);


    const saveUser = (id, username, apikey) => {
        console.log("User logged, userId=" + id + " username: " + username);

        setUserId(id);
        setApikey(apikey);
    }

    // will be called from Login component when user is successfylly loged
    const handleLogin = ((id, username, apikey) => {
        console.log("App handleLogin");

        setIsLogin(true);
        setIsSignUp(false);
        saveUser(id, username, apikey);
    });

    // called when SignUp is choosen
    const handleSignUpRequest = (() => {
        setIsSignUp(true);
    });

    // will be called from SignUp when Cancel is pressed
    const handleSignUpCanceled = (() => {
        setIsSignUp(false);
    });

    // will be called from SignUp when it user is registered successfully
    const handleSignUpDone = ((id, username, apikey) => {
        console.log("App SignUp done OK");

        saveUser(id, username, apikey);
        setIsSignUp(false);
        setIsLogin(true);
    });

    // if user is login, go to tab pages
    if (isLogin) {
        return <NavigationBar userId={userId} apiKey={apiKey} db={db}/>;
    }

    // if not login, show login and signup component
    return (
        <View style={styles.container}>
            <View style={styles.logo}>
                <Image style={styles.image} source={require('./assets/flights.jpg')}/>
            </View>

            <Text h1>FLIGHT MAP</Text>
            <Text h4>Your flight real-time information</Text>

            {isSignUp && <SignUp database={db} handleSignUpDone={handleSignUpDone} handleSignUpCanceled={handleSignUpCanceled} defaultKey={DEFAULT_API_KEY} style={{ flex: 2 }}/>}

            {!isSignUp && <Login database={db} handleLogin={handleLogin} handleSignUpRequest={handleSignUpRequest} defaultKey={DEFAULT_API_KEY} style={{ flex: 2 }}/>}
        </View>
    );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#607B8E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 420,
    height: 230
  },
  image: {
    resizeMode: 'cover',
  }
});
