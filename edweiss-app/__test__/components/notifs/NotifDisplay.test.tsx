/**
 * @file NotifDisplay.test.tsx
 * @description Tests for the NotifDisplay component
 * @author Florian Dinant
 */

import NotifDisplay from '@/components/notifs/NotifDisplay';
import { default as NotifList } from '@/model/notifs';
import { fireEvent, render } from "@testing-library/react-native";
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


// ------------------------------------------------------------------------------------------
// --------------------------------------  Mocks  -------------------------------------------
// ------------------------------------------------------------------------------------------

// Mock Firebase Firestore
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

// Mock View components
jest.mock('../../../components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

// Mock Text components
jest.mock('../../../components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

// Mock TouchableOpacity components
jest.mock('../../../components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

// Mock Icon components
jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

// Mock Swipeable components
jest.mock('react-native-gesture-handler', () => {
    return {
        Swipeable: jest.fn().mockImplementation(({ children, testID, renderLeftActions, renderRightActions, onSwipeableOpen }) => {
            const { View } = require('react-native');
            return (
                <View testID={testID}>
                    {renderLeftActions && renderLeftActions()}
                    {renderRightActions && renderRightActions()}
                    {children}
                </View>
            );
        }),
    };
});

// Mock i18config language configuration
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'notifications:no_notifs_yet') return 'No notifications, yet!';
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

// Mock CollectionOf from Firebase Firestore
jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(() => 'mocked-collection'),
}));

// Mock callFunction & getFunction from Expo Router
jest.mock('../../../config/firebase', () => ({
    callFunction: jest.fn().mockResolvedValue({ status: 0, data: 'someData' }), //callFunction: jest.fn(),
    getFunction: jest.fn(),
}));

// Mock Firbase functions from Notifs
jest.mock('@/model/notifs', () => ({
    Functions: {
        markAsUnread: jest.fn().mockResolvedValue({ status: 0 }), // Simule une réponse réussie
        markAsRead: jest.fn().mockResolvedValue({ status: 0 }), // Simule une réponse réussie
        pushNotif: jest.fn().mockResolvedValue({ status: 0 }), // Simule une réponse réussie
        deleteNotif: jest.fn().mockResolvedValue({ status: 0 }), // Simule une réponse réussie
    },
}));

// Mock httpsCallable from Firebase Functions
jest.mock('@react-native-firebase/functions', () => ({
    httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
}));

// Mock Firebase Storage
jest.mock('@react-native-firebase/storage', () => ({
    ref: jest.fn(() => ({
        putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
        getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
    })),
}));


// ------------------------------------------------------------------------------------------
// --------------------------------------- Tests --------------------------------------------
// ------------------------------------------------------------------------------------------

describe('NotifDisplay', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders correctly today notif information", async () => {

        const today = new Date('2025-01-01T00:00:00Z'); // January 1st, 2025
        const seconds = Math.floor(today.getTime() / 1000); // get the seconds

        // notif mock
        const notif: NotifList.Notif = {
            type: 'submission',
            title: 'MS2',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 1st, 2025
            read: false,
            courseID: 'Swent'
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_1'
                dateSection='today'
                index={0}
                key={notif.title}
            />
        );

        //Date formatting
        const hours = today.getHours();
        const minutes = today.getMinutes().toString().padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
        const formattedTime = `${formattedHours}:${minutes} ${period}`;

        //Text presence check
        const textTitle = screen.getByText('MS2');
        expect(textTitle).toBeTruthy();
        expect(textTitle.props.bold).toBe(true);
        const textDate = screen.getByText(formattedTime);
        expect(textDate).toBeTruthy();
        expect(textDate.props.bold).toBe(true);
        const textMessage = screen.getByText('This is a notification message');
        expect(textMessage).toBeTruthy();
        expect(textMessage.props.bold).toBe(true);

        expect(screen.getByText('Read')).toBeTruthy();
        expect(screen.getByText('Delete')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('Unread')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('swipe-left-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-text')).toBeTruthy();

        expect(screen.getByTestId('swipe-right-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-text')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('notif-touchable')).toBeTruthy();
        expect(screen.getByTestId('icon-view')).toBeTruthy();
        expect(screen.getByTestId('notif-icon')).toBeTruthy();
        expect(screen.getByTestId('notif-global-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title-date-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title')).toBeTruthy();
        expect(screen.getByTestId('notif-date')).toBeTruthy();
        expect(screen.getByTestId('notif-message')).toBeTruthy();
    });

    test("renders correctly week notif information", async () => {

        const today = new Date('2025-01-01T00:00:00Z'); //  January 1st, 2025
        const seconds = Math.floor(today.getTime() / 1000); // get the seconds

        // notif mock
        const notif: NotifList.Notif = {
            type: 'quiz',
            title: 'MS2',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 1st, 2025
            read: true,
            courseID: 'Swent'
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_2'
                dateSection='thisWeek'
                index={0}
                key={notif.title}
            />
        );

        //Text presence check
        //Text presence check
        const textTitle = screen.getByText('MS2');
        expect(textTitle).toBeTruthy();
        expect(textTitle.props.bold).toBe(false);
        const textDate = screen.getByText('Wednesday');
        expect(textDate).toBeTruthy();
        expect(textDate.props.bold).toBe(false);
        const textMessage = screen.getByText('This is a notification message');
        expect(textMessage).toBeTruthy();
        expect(textMessage.props.bold).toBe(false);

        expect(screen.getByText('Unread')).toBeTruthy();
        expect(screen.getByText('Delete')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('Read')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('swipe-left-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-text')).toBeTruthy();

        expect(screen.getByTestId('swipe-right-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-text')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('notif-touchable')).toBeTruthy();
        expect(screen.getByTestId('icon-view')).toBeTruthy();
        expect(screen.getByTestId('notif-icon')).toBeTruthy();
        expect(screen.getByTestId('notif-global-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title-date-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title')).toBeTruthy();
        expect(screen.getByTestId('notif-date')).toBeTruthy();
        expect(screen.getByTestId('notif-message')).toBeTruthy();
    });

    test("renders correctly month notif information", async () => {

        const today = new Date('2025-01-02T00:00:00Z'); // January 2nd, 2025
        const seconds = Math.floor(today.getTime() / 1000); // get the seconds

        // notif mock
        const notif: NotifList.Notif = {
            type: 'announcement',
            title: 'Welcome!',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 2nd, 2025
            read: true,
            courseID: null
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_3'
                dateSection='thisMonth'
                index={0}
                key={notif.title}
            />
        );

        //Text presence check
        const textTitle = screen.getByText('Welcome!');
        expect(textTitle).toBeTruthy();
        expect(textTitle.props.bold).toBe(false);
        const textDate = screen.getByText('Thursday the 2nd');
        expect(textDate).toBeTruthy();
        expect(textDate.props.bold).toBe(false);
        const textMessage = screen.getByText('This is a notification message');
        expect(textMessage).toBeTruthy();
        expect(textMessage.props.bold).toBe(false);

        expect(screen.getByText('Unread')).toBeTruthy();
        expect(screen.getByText('Delete')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('Read')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('swipe-left-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-text')).toBeTruthy();

        expect(screen.getByTestId('swipe-right-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-text')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('notif-touchable')).toBeTruthy();
        expect(screen.getByTestId('icon-view')).toBeTruthy();
        expect(screen.getByTestId('notif-icon')).toBeTruthy();
        expect(screen.getByTestId('notif-global-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title-date-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title')).toBeTruthy();
        expect(screen.getByTestId('notif-date')).toBeTruthy();
        expect(screen.getByTestId('notif-message')).toBeTruthy();
    });

    test("renders correctly year notif information", async () => {

        const today = new Date('2025-01-02T00:00:00Z'); // January 2nd, 2025
        const seconds = Math.floor(today.getTime() / 1000);

        // notif mock
        const notif: NotifList.Notif = {
            type: 'group',
            title: 'You have been added to a group!',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 2nd, 2025
            read: false,
            courseID: null
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_4'
                dateSection='thisYear'
                index={0}
                key={notif.title}
            />
        );

        //Text presence check
        const textTitle = screen.getByText('You have been added to a group!');
        expect(textTitle).toBeTruthy();
        expect(textTitle.props.bold).toBe(true);
        const textDate = screen.getByText('Thursday, January 2nd');
        expect(textDate).toBeTruthy();
        expect(textDate.props.bold).toBe(true);
        const textMessage = screen.getByText('This is a notification message');
        expect(textMessage).toBeTruthy();
        expect(textMessage.props.bold).toBe(true);

        expect(screen.getByText('Read')).toBeTruthy();
        expect(screen.getByText('Delete')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('Unread')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('swipe-left-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-text')).toBeTruthy();

        expect(screen.getByTestId('swipe-right-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-text')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('notif-touchable')).toBeTruthy();
        expect(screen.getByTestId('icon-view')).toBeTruthy();
        expect(screen.getByTestId('notif-icon')).toBeTruthy();
        expect(screen.getByTestId('notif-global-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title-date-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title')).toBeTruthy();
        expect(screen.getByTestId('notif-date')).toBeTruthy();
        expect(screen.getByTestId('notif-message')).toBeTruthy();
    });

    test("renders correctly old notif information", async () => {

        const today = new Date('2025-01-02T00:00:00Z'); // January 2nd, 2025
        const seconds = Math.floor(today.getTime() / 1000);

        // notif mock
        const notif: NotifList.Notif = {
            type: 'grade',
            title: 'New Grade Available',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 2nd, 2025
            read: true,
            courseID: 'AnalysisIII'
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_5'
                dateSection='older'
                index={0}
                key={notif.title}
            />
        );

        //Text presence check
        const textTitle = screen.getByText('New Grade Available');
        expect(textTitle).toBeTruthy();
        expect(textTitle.props.bold).toBe(false);
        const textDate = screen.getByText('January 2, 2025');
        expect(textDate).toBeTruthy();
        expect(textDate.props.bold).toBe(false);
        const textMessage = screen.getByText('This is a notification message');
        expect(textMessage).toBeTruthy();
        expect(textMessage.props.bold).toBe(false);

        expect(screen.getByText('Unread')).toBeTruthy();
        expect(screen.getByText('Delete')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('Read')).toBeNull();

        //TestIDs presence check
        expect(screen.getByTestId('swipe-left-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-left-text')).toBeTruthy();

        expect(screen.getByTestId('swipe-right-touchable')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-view')).toBeTruthy();
        expect(screen.getByTestId('swipe-right-text')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('notif-touchable')).toBeTruthy();
        expect(screen.getByTestId('icon-view')).toBeTruthy();
        expect(screen.getByTestId('notif-icon')).toBeTruthy();
        expect(screen.getByTestId('notif-global-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title-date-view')).toBeTruthy();
        expect(screen.getByTestId('notif-title')).toBeTruthy();
        expect(screen.getByTestId('notif-date')).toBeTruthy();
        expect(screen.getByTestId('notif-message')).toBeTruthy();
    });

    test("clic on delete button", async () => {

        // Spy on console.log
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        const today = new Date('2025-01-03T00:00:00Z'); // January 3rd, 2025
        const seconds = Math.floor(today.getTime() / 1000);

        // notif mock
        const notif: NotifList.Notif = {
            type: 'post',
            title: 'New Association Post',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 3rd, 2025
            read: true,
            courseID: null
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_6'
                dateSection='today'
                index={0}
                key={notif.title}
            />
        );

        // Clic sur le TouchableOpacity
        fireEvent.press(screen.getByTestId('swipe-right-touchable'));

        // Check if the console.log has been called correctly
        expect(consoleLogSpy).toHaveBeenCalledWith('Delete Button pressed');
        consoleLogSpy.mockRestore();

        //expect(NotifList.deleteNotif).toHaveBeenCalledTimes(1)
        //expect(NotifList.Functions.deleteNotif).toHaveBeenCalled();
    });

    test("clic on Read/Unread button", async () => {

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        // Mock de la référence swipeable
        const swipeableRefs = { current: [{ close: jest.fn() }] };

        const today = new Date('2025-01-03T00:00:00Z'); // January 3rd, 2025
        const seconds = Math.floor(today.getTime() / 1000);

        // notif mock
        const notif: NotifList.Notif = {
            type: 'post',
            title: 'New Association Post',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 3rd, 2025
            read: true,
            courseID: null
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_6'
                dateSection='today'
                index={0}
                key={notif.title}
            />
        );

        // Clic sur le TouchableOpacity
        fireEvent.press(screen.getByTestId('swipe-left-touchable'));

        expect(consoleLogSpy).toHaveBeenCalledWith('Read/Unread Button pressed');
        consoleLogSpy.mockRestore();

        //expect(NotifList.markAsUnread).toHaveBeenCalledTimes(1)
        //expect(NotifList.Functions.markAsUnread).toHaveBeenCalled();
    });

    test("clic on Notif view", async () => {

        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        const today = new Date('2025-01-03T00:00:00Z'); // January 3rd, 2025
        const seconds = Math.floor(today.getTime() / 1000);

        const notif: NotifList.Notif = {
            type: 'post',
            title: 'New Association Post',
            message: 'This is a notification message',
            date: { seconds, nanoseconds: 0 }, // January 3rd, 2025
            read: true,
            courseID: null
        };

        const screen = render(
            <NotifDisplay
                item={notif}
                id='id_6'
                dateSection='today'
                index={0}
                key={notif.title}
            />
        );

        // Clic on the TouchableOpacity
        fireEvent.press(screen.getByTestId('notif-touchable'));

        // Check if the console.log has been called correctly
        expect(consoleLogSpy).toHaveBeenCalledWith('Notif "New Association Post" has been clicked');
        consoleLogSpy.mockRestore();

        //expect(NotifList.markAsUnread).toHaveBeenCalledTimes(1)
        //expect(NotifList.Functions.markAsUnread).toHaveBeenCalled();
    });
});