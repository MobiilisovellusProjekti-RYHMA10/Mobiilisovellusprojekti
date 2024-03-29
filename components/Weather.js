import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, FlatList, StyleSheet, Dimensions } from 'react-native';

const api = {
    url: process.env.EXPO_PUBLIC_API_URL,
    key: process.env.EXPO_PUBLIC_API_KEY,
    icons: process.env.EXPO_PUBLIC_ICONS_URL,
};

export default function Weather(props) {
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [hourlyForecast, setHourlyForecast] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const url = `${api.url}lat=${props.latitude}&lon=${props.longitude}&exclude=minutely&units=metric&appid=${api.key}&lang=fi`;

        fetch(url)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Weather data could not be fetched');
                }
                return res.json();
            })
            .then((json) => {
                console.log("API Response:", json);
                setCurrentWeather(json.current);
                setForecast(json.daily.slice(1, 8));
                setHourlyForecast(json.hourly.slice(0, 24));
            })
            .catch((error) => {
                setError(error.message);
                console.error(error);
            });
    }, []);

    const renderHourlyHeader = () => (
    <View style={styles.forecastHeaderTextContainer}>
        <Text style={styles.forecastHeaderText}>Tunnittaiset Säätiedot</Text>
    </View>
);

const renderDailyHeader = () => (
    <View style={styles.forecastHeaderTextContainer}>
        <Text style={styles.forecastHeaderText}>Päivittäiset Säätiedot</Text>
    </View>
);

    const renderHourlyItem = ({ item }) => (
        <View style={styles.hourlyForecastItem}>
            <Text>{new Date(item.dt * 1000).toLocaleTimeString('fi-FI', {weekday: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
            <Image
                source={{ uri: `${api.icons}${item.weather[0].icon}@2x.png` }}
                style={{ width: 50, height: 50 }}
            />
            <Text>{item.weather[0].description}</Text>
            <Text>{`Lämpötila: ${item.temp}°C`}</Text>
            <Text>{`Tuntuu kuin: ${item.feels_like}°C`}</Text>
        </View>
    );

    const renderDailyItem = ({ item }) => {
        const date = new Date(item.dt * 1000);
        const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
        const formattedDate = date.toLocaleDateString('fi-FI', options);
        return (
            <View style={styles.dailyForecastItem}>
                <Text>{formattedDate}</Text>
                <Image
                    source={{ uri: `${api.icons}${item.weather[0].icon}@2x.png` }}
                    style={{ width: 50, height: 50 }}
                />
                <Text>{item.weather[0].description}</Text>
                <Text>{`Lämpötila: ${item.temp.day}°C`}</Text>
                <Text>{`Tuntuu kuin: ${item.feels_like.day}°C`}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {currentWeather && (
                <View style={styles.currentWeather}>
                    <Text>Tämänhetkiset Säätiedot</Text>
                    <Image
                        source={{ uri: `${api.icons}${currentWeather.weather[0].icon}@2x.png` }}
                        style={{ width: 100, height: 100 }}
                    />
                    <Text>{currentWeather.weather[0].description}</Text>
                    <Text>{`Lämpötila: ${currentWeather.temp}°C`}</Text>
                    <Text>{`Tuntuu kuin: ${currentWeather.feels_like}°C`}</Text>
                </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyForecastContainer}>
                {hourlyForecast.map((item) => renderHourlyItem({ item }))}
            </ScrollView>
            <ScrollView style={styles.dailyForecastContainer}>
                <FlatList
                    data={forecast}
                    renderItem={renderDailyItem}
                    keyExtractor={(item) => item.dt.toString()}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 330,
        backgroundColor: 'ABDCAA',
        color: 'ABDCAA',
    },
    currentWeather: {
        alignItems: 'center', // Center items horizontally
        paddingBottom: 10, // Add padding at the bottom of the current weather container
        borderBottomWidth: 1, // Add a border at the bottom of the current weather container
    },
    hourlyForecastContainer: {
        minHeight: 150, // Set minimum height to ensure scrollability
    },
    dailyForecastContainer: {
        maxHeight: 300, // Limit the height of the daily forecast container
    },
    hourlyForecastItem: {
        alignItems: 'center', // Center items horizontally
        paddingVertical: 10, // Vertical padding to separate items
        paddingHorizontal: 5, // Horizontal padding to separate items
        borderBottomWidth: 1, // Add a border at the bottom of each hourly forecast item
    },
    dailyForecastItem: {
        alignItems: 'center', // Center items horizontally
        borderBottomWidth: 1, // Add a border at the bottom of each daily forecast item
        paddingVertical: 10, // Vertical padding to separate items
        paddingHorizontal: 5, // Horizontal padding to separate items
    },
});
