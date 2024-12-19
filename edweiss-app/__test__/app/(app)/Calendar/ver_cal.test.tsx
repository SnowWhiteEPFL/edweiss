import EventsPerDayScreen, { EventsByDate, getNavigationDetails, renderPortraitView } from '@/app/(app)/calendar';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import '@testing-library/jest-native/extend-expect';
import { render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useWindowDimensions } from 'react-native';

// Mock Firebase Functions
jest.mock('@react-native-firebase/functions', () => ({
  httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
}));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    width: 600,
    height: 800,
  })),
}));

const MockTText = (props: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{props.children}</span>
);

jest.mock('@/app/(app)/calendar/VerticalCalendar', () => () => <MockTText>VerticalCalendar</MockTText>);
jest.mock('@/app/(app)/calendar/HorizontalCalendar', () => () => <MockTText >HorizontalCalendar</MockTText>);

jest.mock('@/app/(app)/calendar/VerticalCalendar', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text testID='isPortrait'>VerticalCalendar</Text>;
});

jest.mock('@/app/(app)/calendar/HorizontalCalendar', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => <Text>HorizontalCalendar</Text>;
});



// Mock de Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
  const mockGetDocs = jest.fn();
  return {
    getDocs: mockGetDocs,
    Timestamp: {
      now: jest.fn(() => ({
        toDate: jest.fn(() => new Date()),
      })),
    },
  };
});

// Mock d'autres dépendances Firebase si nécessaire
jest.mock('@react-native-firebase/auth', () => ({
  currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    isSignedIn: jest.fn(() => Promise.resolve(true)),
    getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
  },
}));


// Mock Firebase Storage
jest.mock('@react-native-firebase/storage', () => ({
  ref: jest.fn(() => ({
    putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
  })),
}));
jest.mock('@react-native-firebase/firestore', () => {
  const collectionMock = jest.fn(() => ({
    doc: jest.fn(() => ({
      set: jest.fn(() => Promise.resolve()),
      get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
    })),
    get: jest.fn(() => Promise.resolve({ docs: [] })),
  }));

  const firestoreMock = jest.fn(() => ({
    collection: collectionMock,
  }));

  return {
    __esModule: true,
    default: firestoreMock,
    firestore: firestoreMock, // Also export the mock to match the expected structure
    Timestamp: {
      now: jest.fn(() => ({
        toDate: jest.fn(() => new Date()),
      })),
    },
  };
});


describe('EventsPerDayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly set orientation based on window dimensions', async () => {
    (useWindowDimensions as jest.Mock).mockReturnValue({ width: 500, height: 1000 });

    const { getByTestId } = render(<EventsPerDayScreen />);
    await waitFor(() => {
      expect(getByTestId('isPortrait')).toHaveTextContent('VerticalCalendar');
    });
  });



  it('renders VerticalCalendar in landscape mode', async () => {
    // Simuler le mode paysage
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, jest.fn()]);
    render(<EventsPerDayScreen />);
    expect(screen.getByText('VerticalCalendar')).toBeTruthy();
  });



  it('renders VerticalCalendar in landscape mode', async () => {
    // Simuler le mode paysage
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, jest.fn()]);
    render(<EventsPerDayScreen />);
    expect(screen.getByText('VerticalCalendar')).toBeTruthy();
  });


});

describe('getNavigationDetails', () => {
  const mockCourseItem = {
    id: 'course123',
    data: { name: 'Introduction to Programming', description: 'A beginner course in programming' } as Course,
  };

  const mockPeriod = {
    activityId: 'activity456',
    start: 540, // 9:00 AM
    end: 600, // 10:00 AM
    dayIndex: 1,
  } as CourseTimePeriod;

  it('should return correct navigation details for a professor', () => {
    const mockUser = { data: { type: 'professor' } };
    const index = 0;

    const result = getNavigationDetails(mockUser, mockCourseItem, mockPeriod, index);

    expect(result).toEqual({
      pathname: '/(app)/startCourseScreen',
      params: {
        courseID: 'course123',
        course: JSON.stringify(mockCourseItem.data),
        period: JSON.stringify(mockPeriod),
        index: 0,
      },
    });
  });

  it('should return correct navigation details for a student', () => {
    const mockUser = { data: { type: 'student' } };
    const index = 0;

    const result = getNavigationDetails(mockUser, mockCourseItem, mockPeriod, index);

    expect(result).toEqual({
      pathname: '/(app)/lectures/slides',
      params: {
        courseNameString: 'Introduction to Programming',
        lectureIdString: 'activity456',
      },
    });
  });

  it('should handle missing user type gracefully (default to student)', () => {
    const mockUser = {}; // No `data` or `type` property
    const index = 0;

    const result = getNavigationDetails(mockUser, mockCourseItem, mockPeriod, index);

    expect(result).toEqual({
      pathname: '/(app)/lectures/slides',
      params: {
        courseNameString: 'Introduction to Programming',
        lectureIdString: 'activity456',
      },
    });
  });

  it('should handle missing course name gracefully', () => {
    const mockUser = { data: { type: 'student' } };
    const mockCourseItemWithoutName = {
      id: 'course123',
      data: { description: 'A beginner course in programming' } as Course, // No `name` property
    };
    const index = 0;

    const result = getNavigationDetails(mockUser, mockCourseItemWithoutName, mockPeriod, index);

    expect(result).toEqual({
      pathname: '/(app)/lectures/slides',
      params: {
        courseNameString: undefined, // Because `name` is missing
        lectureIdString: 'activity456',
      },
    });
  });
});


describe('renderPortraitView', () => {
  it('should display "Loading..." when loading is true', () => {
    // Arrange
    const eventsByDate: EventsByDate = {};  // Exemple d'objet vide pour eventsByDate
    const { getByText } = render(renderPortraitView(true, eventsByDate));

    // Assert
    expect(getByText('Loading...')).toBeTruthy();  // Vérifie si le texte "Loading..." est affiché
  });

  it('should render VerticalCalendar when loading is false', () => {
    // Arrange
    const eventsByDate: EventsByDate = {
      '2024-12-19': [{ name: 'Event 1', startTime: 60, type: 'Todo' }],
    };  // Exemple d'événements fictifs

    const { getByText } = render(renderPortraitView(false, eventsByDate));

    // Assert
    expect(getByText('VerticalCalendar')).toBeTruthy();  // Vérifie si le composant mocké VerticalCalendar est affiché
  });
});