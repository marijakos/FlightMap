import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SearchFlight from '../components/SearchFlight';
import FlightMap from '../components/FlightMap';
import History from '../components/History';

const Tab = createBottomTabNavigator();

export default function NavigationBar(props) {

    const [flightSaved, setFlightSaved] = useState(0);

    // call when user save flight, so History prop flightSaved will be changed and
    // component will render again
    const callToFlightSaved = (id) => {
        setFlightSaved(id);
    }

    // childer prop is used for tab render, not component as in course examples, because
    // need to pass props userId and apiKey and navParam which are comming from
    // SearchFligh itemSelected function to change to FlightMap tab with
    // parameters about selected flight from the list
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={ ({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Search Flight') {
                            iconName = 'airplane-outline';
                        } else if (route.name === 'Flight map') {
                            iconName = 'map-outline';
                        } else {
                            iconName = 'file-tray-stacked-outline'
                        }
                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    }
                )}
            >
                <Tab.Screen name="Search Flight"
                    children={(navParam) => <SearchFlight userId={props.userId} apiKey={props.apiKey} navParam={navParam} db={props.db}/>}
                    // component={SearchFlight}
                />
                <Tab.Screen name="Flight map"
                    children={(navParam) => <FlightMap userId={props.userId} apiKey={props.apiKey} navParam={navParam} db={props.db} flightSaved={(id) => callToFlightSaved(id)}/>}
                    // component={FlightMap}
                />
                <Tab.Screen name="History"
                    children={(navParam) => <History userId={props.userId} apiKey={props.apiKey} navParam={navParam} db={props.db} flightSaved={flightSaved}/>}
                    // component={History}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
