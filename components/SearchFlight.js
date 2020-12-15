import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, FlatList, TouchableWithoutFeedback, LogBox } from 'react-native';
import { SearchBar, CheckBox  } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-material-dropdown-v2';

const DEFAULT_AIRPORT_LIST_LABEL = 'Choose airport (0 exist)';

export default function SearchFlight(props) {

    const navigation = useNavigation();

    const [search, setSearch] = useState('');
    const [arrive, setArrive] = useState(false);
    const [depart, setDepart] = useState(true);
    const [cityCode, setCityCode] = useState('');
    const [flightList, setFlightList] = useState([]);
    const [errorCity, setErrorCity] = useState(false);
    const [cityList, setCityList] = useState([]);
    const [airportsDropDownLabel, setAirportsDropDownLabel] = useState(DEFAULT_AIRPORT_LIST_LABEL);

    const [cityDropDownValue, setCityDropDownValue] = useState('');

    // disable log message about some errors in dropdownbox
    useEffect(() => {
        LogBox.ignoreAllLogs();
    }, [])

    const searchBarTextChanged = (value) => {
        setErrorCity(false);
        setSearch(value);
    }

    const searchCityPressed = () => {
        setCityDropDownValue('');
        if (search.trim().length == 0) {
            setFlightList([]);
            setCityList([]);
            setAirportsDropDownLabel(DEFAULT_AIRPORT_LIST_LABEL);
            return;
        }
        let city = search.trim();
        setErrorCity(false);
        fetch('https://aviation-edge.com/v2/public/autocomplete?key=' + props.apiKey + '&city=' + city)
        .then(response => response.json())
        .then(responseJson => {
            if (responseJson != null && responseJson.airportsByCities != null && responseJson.airportsByCities.length > 0) {
                let cityList = [];
                responseJson.airportsByCities.forEach(element => {
                    cityList.push({value: element.codeIataAirport, label: element.nameAirport + ', ' + element.nameCountry});
                });
                setCityList(cityList);
                setAirportsDropDownLabel('Choose airport (' + cityList.length + ' exist)');
            } else {
                setErrorCity(true);
                setCityList([]);
                setAirportsDropDownLabel(DEFAULT_AIRPORT_LIST_LABEL);
            }
            console.log(responseJson);
        })
        .catch(error => {
          console.log(error);
        });
    }

    const searchForFlights = (code) => {
        let list = [];
        setFlightList([]);

        // departure
        if (depart) {
            fetch('https://aviation-edge.com/v2/public/flights?key=' + props.apiKey + '&limit=30000&depIata=' + code)
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson != null && responseJson.length > 0) {
                    let i = 0;
                    responseJson.forEach(element => {
                        list.push({ 'key':  element.flight.iataNumber + "-" + i,
                                    'value': element.departure.iataCode + "-" + element.arrival.iataCode + " \tflight No: " +
                                            element.flight.iataNumber + "    \tstatus: " + element.status,
                                    'latitude': element.geography.latitude,
                                    'longitude': element.geography.longitude,
                                    'cityIataCode': code,
                                    'type': 'departure',
                                    'flightIataNumber': element.flight.iataNumber,
                                    'flightIcaoNumber': element.flight.icaoNumber,
                                    'flightNumber': element.flight.number
                        });
                        i++;
                    });
                    console.log("Departure");
                    console.log(responseJson);
                    if (!arrive) {
                        setFlightList(list);
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
        }

        // arrival
        if (arrive) {
            fetch('https://aviation-edge.com/v2/public/flights?key=' + props.apiKey + '&limit=30000&arrIata=' + code)
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson != null && responseJson.length > 0) {
                    let i = 0;
                    responseJson.forEach(element => {
                        list.push({ 'key': element.flight.iataNumber + "-" + i,
                                    'value': element.departure.iataCode + "-" + element.arrival.iataCode + " \tflight No: " +
                                            element.flight.iataNumber + "    \tstatus: " + element.status,
                                    'latitude': element.geography.latitude,
                                    'longitude': element.geography.longitude,
                                    'cityIataCode': code,
                                    'type': 'arrival',
                                    'flightIataNumber': element.flight.iataNumber,
                                    'flightIcaoNumber': element.flight.icaoNumber,
                                    'flightNumber': element.flight.number
                        });
                        i++;
                    });
                    console.log("Arrival");
                    console.log(responseJson);
                }
                setFlightList(list);
            })
            .catch(error => {
                console.log(error);
            });
        }
    }

    const itemSelected = (item) => {
        console.log("Selected item " + item.key);
        navigation.navigate('Flight map', {flight: item});
    }

    const renderItem = (item, index) => {
        // change color for every second item
        let colors = ['lightblue', 'white'];
        return (
            <TouchableWithoutFeedback onPress={(event) => itemSelected(item)}>
                <View>
                    <Text style={{ fontSize: 15, margin: 8, backgroundColor: colors[index % 2]} }>{item.value}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    const dropDownSelected = (value, index, data) => {
        setCityDropDownValue(data[index].label);
        if (cityCode != value) {
            setCityCode(value);
        }
        searchForFlights(value);
    }

    return (
        <View style={styles.container}>
            <CheckBox
                style={styles.checkbox}
                title='Departure'
                checked={depart}
                onPress={() => setDepart(!depart)}

            />
            <CheckBox
                style={styles.checkbox}
                title='Arrival'
                checked={arrive}
                onPress={() => setArrive(!arrive)}
            />

            <View style={styles.buttonContainer}>
                <SearchBar
                    placeholder="City..."
                    onChangeText={(search) => searchBarTextChanged(search)}
                    value={search}
                    onClear={() => searchBarTextChanged("")}
                    onCancel={() => searchBarTextChanged("")}
                />

                <Button
                    onPress={searchCityPressed}
                    title='Search...'
                />
                {errorCity && <Text style={styles.error}>City not found</Text>}

                <Dropdown
                    label={airportsDropDownLabel}
                    data={cityList}
                    value={cityDropDownValue}
                    onChangeText={ (value, index, data) => dropDownSelected(value, index, data) }
                />
            </View>

            <FlatList
                data={flightList}
                renderItem={({item, index}) => renderItem(item, index)}>
            </FlatList>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
    },
    checkbox: {
        margin: 5,
    },
    buttonContainer: {
        flexDirection: 'column',
        marginTop: 5
    },
    error: {
        color: 'red',
        fontSize: 12,
        alignItems: 'center'
    }
});