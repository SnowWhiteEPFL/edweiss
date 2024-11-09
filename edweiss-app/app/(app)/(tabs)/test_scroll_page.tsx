import React, { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Swiper from 'react-native-swiper';


export default function App() {
    const index = useRef(0);
    const previousIndexRef = useRef(0); // Utilisez useRef pour stocker l'index précédent
    const newIndex = useRef(0); // Utilisez useRef pour stocker le nouvel index
    const [currentIndex, setCurrentIndex] = useState("0");




    const Page = () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Page {currentIndex}</Text>
        </View>
    );
    // Fonction pour gérer le changement de page et la direction
    const handleIndexChanged = (newIndex: number) => {
        let direction = ((newIndex == 2 && previousIndexRef.current == 1) || (newIndex == 1 && previousIndexRef.current == 0) || (newIndex == 0 && previousIndexRef.current == 2)) ? 'droite' : 'gauche';

        console.log(`Défilement vers la ${direction}`);
        console.log(`Index précédent : ${previousIndexRef.current}`);
        console.log(`Index actuel : ${newIndex}`);
        previousIndexRef.current = newIndex; // Met à jour l'index précédent sans déclencher de re-rendu
        direction == 'droite' ? (index.current = index.current + 1) : (index.current = index.current - 1);
        console.log(`Index : ${index.current}`);

    };

    return (
        <Swiper
            showsPagination={true}       // Active la pagination (les points en bas)
            loop={true}                  // Active la boucle infinie
            autoplay={false}
            onIndexChanged={handleIndexChanged}
        >
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Page {currentIndex}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Page {currentIndex}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Page {currentIndex}</Text>
            </View>

        </Swiper>
    );
}
