import AssignmentDisplay, { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { render } from "@testing-library/react-native";
import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';

// Mocking the external dependencies
jest.mock('react-native-gesture-handler', () => {
    const originalModule = jest.requireActual('react-native-gesture-handler');
    return {
        ...originalModule,
        Swipeable: jest.fn().mockImplementation(({ children, renderRightActions }) => (
            <>{children}{renderRightActions && renderRightActions()}</>
        )),
    };
});

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('@/components/core/containers/TView', () => {
    const { View } = require('react-native');
    return jest.fn(({ children }) => <View>{children}</View>);
});
jest.mock('@/components/core/TText', () => {
    const { Text } = require('react-native');
    return jest.fn(({ children }) => <Text>{children}</Text>);
});
jest.mock('@/components/core/containers/TTouchableOpacity', () => {
    const { TouchableOpacity } = require('react-native');
    return jest.fn(({ children }) => <TouchableOpacity>{children}</TouchableOpacity>);
});

// Mock the i18n translation function and locale
jest.mock('@/config/i18config', () => jest.fn(() => 'en-US'));

describe('AssignmentDisplay', () => {
    test("renders assignment information and handles swipe", async () => {
        const assignment: AssignmentWithColor = {
            name: "Assignment 1",
            type: "quiz",
            dueDate: { seconds: 2000, nanoseconds: 0 },
            color: "red"
        };

        // Manually mock swipeableRefs as a MutableRefObject
        const swipeableRefs = { current: [null] as (Swipeable | null)[] };

        const dateFormats = { year: 'numeric', month: 'long', day: 'numeric' };

        const { getByText, getByTestId } = render(
            <AssignmentDisplay
                item={assignment}
                index={0}
                backgroundColor='mantle'
                swipeBackgroundColor='clearGreen'
                defaultColor='darkNight'
                swipeableRefs={swipeableRefs} // Pass mock array directly
            />
        );

        // Check if the assignment name and date are rendered
        expect(getByText('Assignment 1')).toBeTruthy();
        expect(getByText('Thursday, January 1')).toBeTruthy();

        // // Mock console.log to check if the swipe is detected
        // const consoleLogSpy = jest.spyOn(console, 'log');

        // // Simulate swipe by firing event on the swipe action container
        // fireEvent.press(getByTestId(testIDs.swipeView));

        // // Check if Toast was shown
        // expect(Toast.show).toHaveBeenCalledWith({
        //     type: 'success',
        //     text1: 'course:toast_added_to_to_do_text1',
        //     text2: 'course:toast_added_to_to_do_text2',
        // });

        // // Check if the console log was called with the correct message
        // expect(consoleLogSpy).toHaveBeenCalledWith('Swipe detected on assignment: Assignment 1');

        // // Ensure the swipeable component was closed
        // expect(swipeableRefs.current[0]?.close).toHaveBeenCalled();
    });
});



// import AssignmentDisplay from '@/components/courses/AssignmentDisplay';
// import { Assignment } from '@/model/school/courses';
// import { render } from "@testing-library/react-native";
// import React from 'react';
// import { Swipeable } from 'react-native-gesture-handler';

// // Mocking the external dependencies
// jest.mock('react-native-gesture-handler', () => {
//     return {
//         Swipeable: jest.fn().mockImplementation(({ children }) => children),
//     };
// });

// jest.mock('react-native-toast-message', () => ({
//     show: jest.fn(),
// }));

// jest.mock('@/components/core/containers/TView', () => {
//     const { View } = require('react-native');
//     return jest.fn(({ children }) => <View>{children}</View>);
// });
// jest.mock('@/components/core/TText', () => {
//     const { Text } = require('react-native');
//     return jest.fn(({ children }) => <Text>{children}</Text>);
// });
// jest.mock('@/components/core/containers/TTouchableOpacity', () => {
//     const { TouchableOpacity } = require('react-native');
//     return jest.fn(({ children }) => <TouchableOpacity>{children}</TouchableOpacity>);
// });

// // Mock the i18n translation function and locale
// jest.mock('@/config/i18config', () => jest.fn(() => 'en-US'));

// describe('AssignmentDisplay', () => {
//     test("renders assignment information and handles swipe", async () => {
//         const assignement: Assignment = {
//             name: "Assignment 1",
//             type: "quiz",
//             dueDate: { seconds: 2000, nanoseconds: 0 },
//             color: "red"
//         };

//         // Manually mock swipeableRefs as a MutableRefObject
//         const swipeableRefs = { current: [null] as (Swipeable | null)[] };

//         const dateFormats = { year: 'numeric', month: 'long', day: 'numeric' };

//         const screen = render(
//             <AssignmentDisplay
//                 item={assignement}
//                 index={0}
//                 backgroundColor='mantle'
//                 swipeBackgroundColor='clearGreen'
//                 defaultColor='darkNight'
//                 swipeableRefs={swipeableRefs} // Pass mock array directly
//             />
//         );

//         // Checking if the translations and assignment name are rendered
//         expect(screen.getByText('Assignment 1')).toBeTruthy();
//         //expect(screen.getByTestId(testIDs.assignmentDate)).toBeTruthy();
//     });
// });

// import AssignmentDisplay, { testIDs } from '@/components/courses/AssignmentDisplay';
// import { Assignment } from '@/model/school/courses';
// import { render } from "@testing-library/react-native";
// import React, { useRef } from 'react';
// import { Swipeable } from 'react-native-gesture-handler';
// import t from '/Users/flo/Desktop/edweiss/edweiss-app/config/i18config';

// describe('CoursePage', () => {

//     test("calls onPress function when pressed", async () => {

//         const assignement: Assignment = { name: "Assignment 1", type: "quiz", dueDate: { seconds: 2000, nanoseconds: 0 }, color: "red" };
//         const swipeableRefs = useRef<(Swipeable | null)[]>([]);

//         const screen = render(<AssignmentDisplay item={assignement} index={0} backgroundColor='mantle' swipeBackgroundColor='clearGreen' defaultColor='darkNight' swipeableRefs={swipeableRefs} />);

//         expect(screen.getByText(t(`course:add_to_to_do`))).toBeTruthy();
//         expect(screen.getByText(assignement.name)).toBeTruthy();

//         //fireEvent.press(screen.getByTestId("checkbox"));

//         expect(screen.getByText(testIDs.swipeView));
//         expect(screen.getByText(testIDs.assignmentIcon));
//         expect(screen.getByText(testIDs.assignmentTitle));
//         expect(screen.getByText(testIDs.assignmentDate));
//     });
// });
