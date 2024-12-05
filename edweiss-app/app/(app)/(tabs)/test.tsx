
import { useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";

const CalendarScreen = (p0: string, p1: () => void) => {
    // Liste des événements (simulée pour l'exemple)
    const [events, setEvents] = useState([
        { id: "1", title: "Cours de math", time: "10:00 AM" },
        { id: "2", title: "Réunion de groupe", time: "2:00 PM" },
    ]);

    // Détermine si l'ajout est activé (désactivé ici)
    const canAddEvent = false;

    // Fonction pour ajouter un événement (désactivée)
    const handleAddEvent = () => {
        if (!canAddEvent) {
            Alert.alert("Action interdite", "L'ajout d'événements est désactivé.");
            return;
        }
        // Logique d'ajout (non atteinte ici)
        const newEvent = { id: Date.now().toString(), title: "Nouvel événement", time: "4:00 PM" };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mon Calendrier</Text>

            {/* Liste des événements */}
            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.eventItem}>
                        <Text style={styles.eventText}>
                            {item.title} - {item.time}
                        </Text>
                    </View>
                )}
            />

            {/* Bouton désactivé ou caché */}
            {canAddEvent ? (
                <Button title="Ajouter un événement" onPress={handleAddEvent} />
            ) : (
                <Text style={styles.disabledText}>Ajout d'événements désactivé</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    eventItem: {
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    eventText: {
        fontSize: 16,
    },
    disabledText: {
        textAlign: "center",
        color: "gray",
        marginTop: 16,
        fontStyle: "italic",
    },
});

export default CalendarScreen;
