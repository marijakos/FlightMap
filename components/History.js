import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableWithoutFeedback, Alert } from 'react-native';

export default function History(props) {

    const [flightList, setFlightList] = useState([]);

    useEffect (() => {
        loadHistory();
    });

    // load History for login user
    const loadHistory = async () => {
        let list = [];
        props.db.transaction(tx => {
            tx.executeSql(
                "select * from history where userid=?;",
                [props.userId],
                (_, { rows }) => {
                    if (rows != null && rows._array != null && flightList.length != rows._array.length) {
                        i = 0;
                        rows._array.forEach(element => {
                            list.push({ 'key':  element.id.toString(),
                                        'value': element.saveddate + "\n" + element.info
                            });
                            i++;
                        });
                        setFlightList(list);
                    }
                },
                (_, error) => console.log("History can not load data, error " + error)
            );
        });
    }

    // alert for deleting history
    const createThreeButtonAlert = (item) =>
        Alert.alert(
            "Delete history items",
            "What do you want to delete?",
            [
                {
                    text: "Selected item",
                    onPress: () => deleteSelectedPressed(item),
                    style: "ok"
                },
                {
                    text: "All items",
                    onPress: () => deleteAllPressed(),
                    style: "ok"
                },
                {
                    text: "Cancel",
                    onPress: () => console.log("OK Pressed"),
                    style: "cancel"
                }
            ],
            {
                cancelable: true
            }
        );

    const deleteAllPressed = async () => {
        try {
            console.log("Delete all items from history");

            let list = flightList;
            await props.db.transaction(tx => {
                tx.executeSql(
                    "delete from history where userid=?;",
                    [props.userId],
                    () => {
                        console.log("History deleted for user: " + props.userId);
                        loadHistory();
                    },
                    (_, error) => console.log("History can not be deleted, error: " + error)
                );
            });
        } catch (e) {}
    }

    const deleteSelectedPressed = async (item) => {
        try {
            console.log("Delete all items from history");

            await props.db.transaction(tx => {
                tx.executeSql(
                    "delete from history where id=?;",
                    [parseInt(item.key)],
                    () => {
                        console.log("History item deleted for user: " + props.userId);
                        loadHistory();
                    },
                    (_, error) => console.log("History item can not be deleted, error: " + error)
                );
            });
        } catch (e) {}
    }

    const itemSelected = (item) => {
        createThreeButtonAlert(item);
    }

    let i = 0;

    const renderItem = (item, index) => {
        // change color for every second item
        let colors = ['lightblue', 'white'];
        return (
            <TouchableWithoutFeedback onLongPress={() => itemSelected(item)}>
                <View>
                    <Text style={{ backgroundColor: colors[index % 2], fontSize: 15 }}>{item.value}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    return (
        <View>
            <FlatList
                style={{ marginTop: 50 }}
                data={flightList}
                renderItem={({item, index}) => renderItem(item, index)}>
            </FlatList>
        </View>
    );
}
