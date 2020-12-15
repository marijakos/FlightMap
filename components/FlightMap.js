import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import moment from "moment";

export default function FlightMap(props) {

    const [mapLoc, setMapLoc] = useState({longitude: 24.9580, latitude: 60.3170});
    const [flightInfo, setFlightInfo] = useState('');
    const [refresh, setRefresh] = useState(false);
    const [flightKey, setFlighKey] = useState('');

    let route = props.navParam.route;

    const isParamValid = () => {
        return route != null && route.params != null && route.params.flight != null;
    }

    useEffect (() => {
        if (refresh || (isParamValid() && flightKey != route.params.flight.key)) {
            if (isParamValid()) {
                setFlighKey(route.params.flight.key);
                setFlightInfo("\n" + route.params.flight.value);
            }
            // change position of marker for new plane position
            if (isParamValid() &&
                route.params.flight.latitude != null && route.params.flight.longitude != null) {
                let lat = parseFloat(route.params.flight.latitude);
                let long =  parseFloat(route.params.flight.longitude);
                if (lat != mapLoc.latitude || long != mapLoc.longitude) {
                    setMapLoc({longitude: parseFloat(route.params.flight.longitude), latitude: parseFloat(route.params.flight.latitude)});
                    setFlightInfo("\n" + route.params.flight.value);
                }
            }
            getFlightInfo();
            setRefresh(false);
        }
    });

    const getFlightInfo = () => {
        if (!isParamValid() ) {
            return;
        }
        let iataCode = route.params.flight.cityIataCode;
        let type = route.params.flight.type;
        let queryUrl =
            'https://aviation-edge.com/v2/public/timetable?key=' + props.apiKey + '&iataCode=' + iataCode + '&type=' + type +
            '&flight_iata=' + route.params.flight.flightIataNumber;
        fetch(queryUrl)
        .then(response => response.json())
        .then(responseJson => {
            if (responseJson != null && responseJson.length > 0) {
                let info = "\n" + route.params.flight.value;
                let depart = responseJson[responseJson.length-1].departure;
                let arrival = responseJson[responseJson.length-1].arrival;

                // times are not always correct, find one which is not empty for departure and arrival
                let departTime = depart.actualTime;
                if ( departTime == null ) {
                    departTime = depart.estimatedTime;
                }
                if ( departTime == null ) {
                    departTime = depart.scheduledTime;
                }
                let arriveTime = arrival.actualTime;
                if ( arriveTime == null ) {
                    arriveTime = arrival.estimatedTime;
                }
                if ( arriveTime == null ) {
                    arriveTime = arrival.scheduledTime;
                }
                // set info message for showing
                info = info + "\n" + "Departure time:\t " + departTime + "\n" + "Arrival time:  \t " + arriveTime;
                setFlightInfo(info);
            }
        })
        .catch(error => {
            console.log(error);
        });
    }

    const refreshInfo = () => {
        if (!isParamValid()) {
            return;
        }
        setRefresh(true);
        let queryUrl = 'https://aviation-edge.com/v2/public/flights?key=' + props.apiKey +
            (route.params.flight.type == 'departure' ? '&depIata=' : '&arrIata=') + route.params.flight.cityIataCode +
            '&flightIata=' + route.params.flight.flightIataNumber;
        fetch(queryUrl)
        .then(response => response.json())
        .then(responseJson => {
            if (responseJson != null && responseJson.length > 0) {
                setMapLoc({longitude: parseFloat(responseJson[responseJson.length-1].geography.longitude), latitude: parseFloat(responseJson[0].geography.latitude)});
            }
        })
        .catch(error => {
            console.log(error);
        });
    }

    const saveCurrentFlight = () => {
        console.log("Save data about current flight");
        props.db.transaction(tx => {
            tx.executeSql(
                "insert into history (userid, info, saveddate) values (?, ?, ?);",
                [props.userId, flightInfo, moment().format('DD-MM-YYYY hh:mm:ss')],
                (tx, results) => {
                    console.log("History saved id: + " + results.insertId);
                    props.flightSaved(results.insertId);
                },
                (_, error) => console.log("History insert failed, error " + error)
            );
        });
    }

    return (
        <View style={styles.container}>

            <View style={styles.menuView}>
                <Text style={styles.flightInfo}>Flight Info: {flightInfo}</Text>

                <View style={styles.separator}/>

                <TouchableOpacity style={styles.buttons} onPress={() => saveCurrentFlight()}>
                    <Text style={styles.buttontitle}>
                        Save flight information
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttons} onPress={() => refreshInfo()}>
                    <Text style={styles.buttontitle}>
                        Refresh information
                    </Text>
                </TouchableOpacity>
            </View>

            <MapView
                style={styles.mapview}
                region={{
                    latitude: mapLoc.latitude,
                    longitude: mapLoc.longitude,
                    latitudeDelta: 15.5,
                    longitudeDelta: 15.5
                }}
            >
                <Marker
                    coordinate={{
                        latitude: mapLoc.latitude,
                        longitude: mapLoc.longitude
                    }}
                    title='Current plane position'
                />
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    menuView: {
        justifyContent:'space-around',
        marginTop: 30
    },
    flightInfo: {
        height:80,
        alignSelf:'stretch',
        margin:5
    },
    separator: {
        borderTopColor: 'black',
        borderTopWidth: 1,
        marginBottom: 5,
    },
    buttons: {
        height:30,
        alignSelf:'stretch',
        margin: 5
    },
    buttontitle: {
        color: 'blue',
        fontWeight: 'bold',
        marginLeft: 20,
        fontSize: 16,
    },
    mapview: {
        flex: 1,
        alignSelf:'stretch'
    }
});