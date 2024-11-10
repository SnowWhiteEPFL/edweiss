import NotificationsTab from '@/app/(app)/(tabs)/notifications';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
import { TextProps, TouchableOpacityProps, useWindowDimensions, ViewProps } from 'react-native';

jest.mock('../../components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('../../components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('../../components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

// Mock t() function
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'notifications:notifications') return 'Notifications';
        else if (str === 'notifications:no_notifs_yet') return 'No notifications, yet!';
        else if (str === 'notifications:no_notifs_text') return 'It looks like the notification bell is taking a nap. Let’s not disturb it! We’ll wake it up when there’s something worth knowing.';
        else if (str === 'notifications:today') return 'Today';
        else if (str === 'notifications:this_week') return 'This Week';
        else if (str === 'notifications:this_month') return 'This Month';
        else if (str === 'notifications:this_year') return 'This Year';
        else if (str === 'notifications:all_time') return 'Older';
        else if (str === 'notifications:unread') return 'Unread';
        else if (str === 'notifications:read') return 'Read';
        else if (str === 'notifications:delete') return 'Delete';
        else return str;
    })
);

jest.mock('../../hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(() => 'mocked-collection'),
}));

jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(() => ({ id: 'default-id' })),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('../../components/core/header/RouteHeader', () => {
    const { Text, View } = require('react-native');
    return ({ title, right }: { title: string; right?: React.ReactNode }) => (
        <View>
            <Text>{title}</Text>
            {right && <View>{right}</View>}
        </View>
    );
});

jest.mock('@react-native-firebase/firestore', () => { // this one does not work yet.
    const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
        })),
    }));

    return {
        firestore: jest.fn(() => ({
            collection: mockCollection,  // Mock collection method
        })),
        collection: mockCollection,  // Also expose it directly for other uses
    };
});

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    SettingsManager: {
        settings: {},
    },
}));

jest.mock('react-native-reanimated/mock'); // Mock de reanimated

jest.mock('react-native', () => {
    const originalModule = jest.requireActual('react-native');
    return {
        ...originalModule,
        useWindowDimensions: jest.fn(),
    };
});


describe('NotificationsPage', () => {

    const fixedDate = new Date('2025-02-04T12:00:00Z');

    const date1 = new Date('2025-02-04T00:01:00Z'); // 4th of February 2025, midnight UTC
    const seconds1 = Math.floor(date1.getTime() / 1000);

    const date2 = new Date('2025-02-03T00:01:00Z'); // 3rd of February 2025, midnight UTC
    const seconds2 = Math.floor(date2.getTime() / 1000);

    const date3 = new Date('2025-02-01T00:01:00Z'); // 1st of February 2025, midnight UTC
    const seconds3 = Math.floor(date3.getTime() / 1000);

    const date4 = new Date('2025-01-01T00:01:00Z'); // 1st January 2025, midnight UTC
    const seconds4 = Math.floor(date4.getTime() / 1000);

    const date5 = new Date('2024-01-01T00:01:00Z'); // 1st January 2024, midnight UTC
    const seconds5 = Math.floor(date5.getTime() / 1000);

    beforeEach(() => {
        // Mock `useWindowDimensions`
        const mockWidth = 375;
        const mockHeight = 812;
        (useWindowDimensions as jest.Mock).mockReturnValue({ width: mockWidth, height: mockHeight });

        // Mock `useAuth`
        (useAuth as jest.Mock).mockReturnValue({
            authUser: { uid: 'test-user-id' },
        });

        jest.spyOn(console, 'log').mockImplementation(() => { }); // Transforme `console.log` en une fonction mock
        (useDynamicDocs as jest.Mock).mockImplementation(() => [
            {
                id: 'notif1',
                data: {
                    type: 'post',
                    title: 'Test Post',
                    message: 'This is a test notification message',
                    date: { seconds: seconds1, nanoseconds: 0 }, // 4th Feb 2025
                    read: false,
                    courseID: null,
                },
            },
            {
                id: 'notif2',
                data: {
                    type: 'comment',
                    title: 'Test Comment',
                    message: 'This is a second test notification message',
                    date: { seconds: seconds2, nanoseconds: 0 }, // 3rd Feb 2025
                    read: false,
                    courseID: null,
                },
            },
            {
                id: 'notif3',
                data: {
                    type: 'submission',
                    title: 'Test Submission',
                    message: 'This is a third test notification message',
                    date: { seconds: seconds3, nanoseconds: 0 }, // 1st Feb 2025
                    read: true,
                    courseID: 'Swent',
                },
            },
            {
                id: 'notif4',
                data: {
                    type: 'quiz',
                    title: 'Test Quiz',
                    message: 'This is a fourth test notification message',
                    date: { seconds: seconds4, nanoseconds: 0 }, // 1st Jan 2025
                    read: true,
                    courseID: 'Swent',
                },
            },
            {
                id: 'notif5',
                data: {
                    type: 'group',
                    title: 'Test Group',
                    message: 'This is a fifth test notification message',
                    date: { seconds: seconds5, nanoseconds: 0 }, // 1st Jan 2024
                    read: true,
                    courseID: null,
                },
            },
        ]);

        // On sauvegarde le constructeur d'origine de Date
        const RealDate = Date;

        // Mock de Date
        jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
            if (args.length === 0) {
                return fixedDate; // retourne la date fixée par défaut si aucun argument n'est passé
            }
            // Utilise le constructeur d'origine pour créer une nouvelle instance de Date
            return new RealDate(args[0]);
        });
    });

    // Mock `console.log`
    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });

    test('should render notifs', () => {

        const screen = render(<NotificationsTab />);

        // Checks
        expect(screen.getByText('Notifications')).toBeTruthy();
        expect(screen.getByText('Today')).toBeTruthy();
        expect(screen.getByText('This Week')).toBeTruthy();
        expect(screen.getByText('This Month')).toBeTruthy();
        expect(screen.getByText('This Year')).toBeTruthy();
        expect(screen.getByText('Older')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('No notifications, yet!')).toBeNull();
        expect(screen.queryByText('It looks like the notification bell is taking a nap. Let’s not disturb it! We’ll wake it up when there’s something worth knowing.')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('parameters-touchable')).toBeTruthy();
        expect(screen.getByTestId('parameters_icon')).toBeTruthy();

        expect(screen.getByTestId('divider')).toBeTruthy();

        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('notifs-view')).toBeTruthy();

        expect(screen.getByTestId('today-view')).toBeTruthy();
        expect(screen.getByTestId('today-text')).toBeTruthy();
        expect(screen.getByTestId('this-week-view')).toBeTruthy();
        expect(screen.getByTestId('this-week-text')).toBeTruthy();
        expect(screen.getByTestId('this-month-view')).toBeTruthy();
        expect(screen.getByTestId('this-month-text')).toBeTruthy();
        expect(screen.getByTestId('this-year-view')).toBeTruthy();
        expect(screen.getByTestId('this-year-text')).toBeTruthy();
        expect(screen.getByTestId('older-view')).toBeTruthy();
        expect(screen.getByTestId('all-time-text')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('no-notif-view')).toBeNull();
        expect(screen.queryByTestId('no-notif-image')).toBeNull();
        expect(screen.queryByTestId('no-notif-title')).toBeNull();
        expect(screen.queryByTestId('no-notif-text')).toBeNull();
    });
});

describe('NotificationsPage - No Notifications', () => {

    const fixedDate = new Date('2025-02-04T12:00:00Z');

    beforeEach(() => {
        // Mock `useWindowDimensions`
        const mockWidth = 375;
        const mockHeight = 812;
        (useWindowDimensions as jest.Mock).mockReturnValue({ width: mockWidth, height: mockHeight });

        // Mock `useAuth`
        (useAuth as jest.Mock).mockReturnValue({
            authUser: { uid: 'test-user-id' },
        });

        jest.spyOn(console, 'log').mockImplementation(() => { }); // Transforme `console.log` en une fonction mock
        (useDynamicDocs as jest.Mock).mockImplementation(() => []);

        // On sauvegarde le constructeur d'origine de Date
        const RealDate = Date;

        // Mock de Date
        jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
            if (args.length === 0) {
                return fixedDate; // retourne la date fixée par défaut si aucun argument n'est passé
            }
            // Utilise le constructeur d'origine pour créer une nouvelle instance de Date
            return new RealDate(args[0]);
        });
    });

    // Mock `console.log`
    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });

    test('should render no notifications', () => {

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        const screen = render(<NotificationsTab />);

        // Checks

        //Texts presence check
        expect(screen.getByText('Notifications')).toBeTruthy();
        expect(screen.getByText('No notifications, yet!')).toBeTruthy();
        expect(screen.getByText('It looks like the notification bell is taking a nap. Let’s not disturb it! We’ll wake it up when there’s something worth knowing.')).toBeTruthy();

        //TestIDs presence check
        expect(screen.getByTestId('parameters-touchable')).toBeTruthy();
        expect(screen.getByTestId('parameters_icon')).toBeTruthy();

        expect(screen.getByTestId('divider')).toBeTruthy();

        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('no-notif-view')).toBeTruthy();
        expect(screen.getByTestId('no-notif-image')).toBeTruthy();
        expect(screen.getByTestId('no-notif-title')).toBeTruthy();
        expect(screen.getByTestId('no-notif-text')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('notifs-view')).toBeNull();
        expect(screen.queryByTestId('today-view')).toBeNull();
        expect(screen.queryByTestId('today-text')).toBeNull();
        expect(screen.queryByTestId('this-week-view')).toBeNull();
        expect(screen.queryByTestId('this-week-text')).toBeNull();
        expect(screen.queryByTestId('this-month-view')).toBeNull();
        expect(screen.queryByTestId('this-month-text')).toBeNull();
        expect(screen.queryByTestId('this-year-view')).toBeNull();
        expect(screen.queryByTestId('this-year-text')).toBeNull();
        expect(screen.queryByTestId('older-view')).toBeNull();
        expect(screen.queryByTestId('all-time-text')).toBeNull();


        // Fire Events
        fireEvent.press(screen.getByTestId('parameters-touchable'));

        expect(consoleLogSpy).toHaveBeenCalledWith('press parameters icon');
        consoleLogSpy.mockRestore();
    });
});
