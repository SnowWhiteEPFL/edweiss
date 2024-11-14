// Importation des dépendances nécessaires pour les tests
import MyCalendar from '@/app/(app)/calendar'; // Composant à tester
import { useAuth } from '@/contexts/auth'; // Hook d'authentification
import { useDynamicDocs } from '@/hooks/firebase/firestore'; // Hook pour interagir avec Firestore
import { render } from '@testing-library/react-native'; // Outils pour rendre le composant
import * as ScreenOrientation from 'expo-screen-orientation'; // Module pour gérer l'orientation de l'écran
import React from 'react';
import { Dimensions, ScaledSize } from 'react-native'; // Dimensions de l'écran pour simuler différentes tailles

// Mock des modules importés
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(), // Mock du hook useAuth
}));
jest.mock('@react-native-firebase/functions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        httpsCallable: jest.fn(), // Mock de Firebase Functions
    })),
}));
jest.mock('@react-native-firebase/storage', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        ref: jest.fn(), // Mock de Firebase Storage
    })),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
    __esModule: true,
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        isSignedIn: jest.fn(),
        getCurrentUser: jest.fn(),
    },
}));
// Mock du hook useDynamicDocs pour simuler la récupération des données Firestore
jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));
// Mock de Firebase Auth pour simuler un utilisateur connecté
jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' }, // Utilisateur fictif avec un ID spécifique
    })),
}));
// Mock de Firestore pour simuler la récupération de données de cours
jest.mock('@react-native-firebase/firestore', () => {
    const collectionMock = {
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            exists: true,
            data: jest.fn(() => ({
                name: 'Test Course',
                description: 'A course for testing purposes.',
                professors: ['prof1'],
                assistants: ['student1'],
                periods: [],
                section: 'IN',
                credits: 3,
                newAssignments: false,
                assignments: [],
                started: true,
            })),
        }),
    };
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: jest.fn(() => collectionMock), // Mock de la collection Firestore
        })),
    };
});
// Mock du module d'orientation d'écran
jest.mock('expo-screen-orientation', () => ({
    addOrientationChangeListener: jest.fn(), // Mock de l'écoute des changements d'orientation
    removeOrientationChangeListener: jest.fn(), // Mock de la suppression de l'écouteur
}));

// Données fictives pour les tests
const mockAuth = {
    authUser: { uid: 'test-user-id' }, // Utilisateur fictif
    data: { type: 'student' }, // Type d'utilisateur (étudiant)
};

// Cours fictifs pour simuler l'accès à Firestore
const mockCourses = [
    {
        id: 'course1',
        data: {
            name: 'Course 1',
            periods: [
                {
                    id: 'period1',
                    start: 480, // Début de la période
                    end: 540, // Fin de la période
                    type: 'lecture', // Type de la période (ex : lecture)
                    activityId: 'activity1',
                    dayIndex: 1, // Jour de la semaine
                    rooms: [], // Salle(s) où le cours se déroule
                },
            ],
            credits: 3, // Crédits du cours
            newAssignments: true, // Si de nouvelles missions sont disponibles
            assignments: [{ id: 'assignment1' }], // Liste des missions
        },
    },
];

describe('MyCalendar Component', () => {
    // Avant chaque test, on configure le mock des données et des fonctions
    beforeEach(() => {
        // Mock de useAuth pour retourner l'utilisateur fictif
        (useAuth as jest.Mock).mockReturnValue(mockAuth);
        // Mock de useDynamicDocs pour retourner les cours fictifs
        (useDynamicDocs as jest.Mock).mockImplementation((collection) => {
            if (collection === 'courses') {
                return mockCourses;
            }
            if (collection === `users/${mockAuth.authUser.uid}/courses`) {
                return mockCourses;
            }
            return [];
        });
        // Mock des dimensions de l'écran (ex : écran de taille 400x600)
        Dimensions.get = jest.fn(() => ({ width: 400, height: 600 } as ScaledSize));
    });

    // Test pour vérifier que l'orientation change correctement lors de la rotation de l'écran
    it('should change orientation when screen is rotated', async () => {
        const setOrientation = jest.fn(); // Fonction fictive pour ajuster l'orientation

        // Simuler un changement d'orientation
        render(<MyCalendar />); // Rendu du composant
        // Mock de l'ajout d'un écouteur pour les changements d'orientation
        (ScreenOrientation.addOrientationChangeListener as jest.Mock).mockImplementationOnce((listener) => {
            // Simuler un événement de changement d'orientation
            (listener as (event: { orientationInfo: { orientation: number } }) => void)({ orientationInfo: { orientation: 3 } });
            return { remove: jest.fn() }; // Retourner une fonction pour supprimer l'écouteur
        });
    });
});
