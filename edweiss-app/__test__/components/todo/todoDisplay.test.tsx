import { TodoDisplay } from '@/components/todo/todoDisplay';
import { default as Todolist } from '@/model/todo';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

// Mocks
jest.mock('@/utils/time', () => ({
    Time: {
        toDate: jest.fn(() => new Date('2021-10-29T12:00:00Z')),
        isToday: jest.fn(() => true),
        wasYesterday: jest.fn(() => false),
        isTomorrow: jest.fn(() => false),
    },
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));


jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(),
    BottomSheetView: jest.fn(({ children }) => <div>{children}</div>),
}));

// Mock the utility functions
jest.mock('../../../utils/todo/utilsFunctions', () => ({
    toogleArchivityOfTodo: jest.fn(),
    statusNextAction: jest.fn(),
    statusColorMap: {
        yet: 'gray',
        in_progress: 'blue',
        done: 'green',
        archived: 'red',
    },
    statusIconMap: {
        yet: 'arrow-forward',
        in_progress: 'spinner',
        done: 'checkmark',
        archived: 'archive',
    },
    statusNextMap: {
        yet: 'in_progress',
        in_progress: 'done',
        done: 'archived',
        archived: 'yet',
    },
}));

const mockRouter = {
    push: jest.fn(),
};

const modalRef = React.createRef<BottomSheetModalMethods>();

describe('TodoDisplay', () => {
    const todo: Todolist.Todo = {
        name: 'Test Todo',
        status: 'yet',
        dueDate: undefined,
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('renders the TodoDisplay component correctly', () => {
        const { getByText } = render(
            <TodoDisplay
                key="1" // Add key prop here
                id="1"
                todo={todo}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText('Test Todo')).toBeTruthy();
    });

    it('handles press event to display modal', () => {
        const setTodoToDisplay = jest.fn();
        const { getByText } = render(
            <TodoDisplay
                key="1" // Add key prop here
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        fireEvent.press(getByText('Test Todo'));
        expect(setTodoToDisplay).toHaveBeenCalledWith(todo);
    });

    it('handles long press event to navigate to edit screen', () => {
        const { getByText } = render(
            <TodoDisplay
                key="1" // Add key prop here
                id="1"
                todo={todo}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        fireEvent(getByText('Test Todo'), 'longPress');
        expect(mockRouter.push).toHaveBeenCalledWith({
            pathname: "/(app)/todo/edit",
            params: { idString: "1", todoJSON: JSON.stringify(todo) }
        });
    });

    it('renders the correct status', () => {
        todo.status = 'done';
        const { getByText } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText('Test Todo')).toBeTruthy();
        // Assuming you have some element that shows the status, check it here.
        expect(getByText('todo:status.done')).toBeTruthy();
    });

});


// // import { Timestamp } from '@/model/time';
// // import Todolist from '@/model/todo';
// // import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
// // import { fireEvent, render } from '@testing-library/react-native';
// // import { useRouter } from 'expo-router';
// // import React from 'react';
// // import { Animated } from 'react-native';
// // import { TodoDisplay } from '../../components/todo/todoDisplay';



// // // Mock Firebase functions and firestore
// // jest.mock('@/config/firebase', () => ({
// //     callFunction: jest.fn(),
// //     Collections: { deck: 'decks' }
// // }));

// // jest.mock('@/hooks/firebase/firestore', () => ({
// //     useDynamicDocs: jest.fn(() => [
// //         { id: '1', data: { name: 'Deck 1', cards: [] } }
// //     ])
// // }));

// // // // Mock expo-router Stack and Screen
// // // jest.mock('expo-router', () => ({
// // //     router: { push: jest.fn() },
// // //     Stack: {
// // //         Screen: jest.fn(({ options }) => (
// // //             <>{options.title}</> // Simulate rendering the title for the test
// // //         )),
// // //     },
// // // }));

// // jest.mock('expo-router', () => ({
// //     useRouter: jest.fn(), // Mock useRouter
// // }));

// // jest.mock('@/hooks/theme/useThemeColor', () => jest.fn(() => 'backgroundColorMock'));

// // jest.mock('@/utils/time', () => ({
// //     Time: {
// //         toDate: jest.fn(),
// //         isToday: jest.fn(),
// //         wasYesterday: jest.fn(),
// //         isTomorrow: jest.fn(),
// //     },
// // }));

// // jest.mock('@/config/i18config', () => ({
// //     t: jest.fn((key: string) => key),
// // }));

// // jest.mock('@/components/core/Icon', () => 'Icon');
// // jest.mock('@/components/core/TText', () => 'TText');
// // jest.mock('@/components/core/containers/TTouchableOpacity', () => 'TTouchableOpacity');
// // jest.mock('@/components/core/containers/TView', () => 'TView');

// // describe('TodoDisplay', () => {
// //     const mockTodoId: string = '123';
// //     const mockTodo: Todolist.Todo = {
// //         name: 'Test Todo',
// //         description: 'This is a test todo description.',
// //         dueDate: 0 as Timestamp,
// //         status: 'yet',
// //     };

// //     const mockSetTodoToDisplay = jest.fn();
// //     const mockModalRef = React.createRef<BottomSheetModalMethods>();
// //     const mockRouterPush = jest.fn();

// //     // beforeEach(() => {
// //     //     (useRouter as jest.Mock).mockReturnValue({
// //     //         push: mockRouterPush,
// //     //     });
// //     //     jest.clearAllMocks();
// //     // });

// //     // it('should render todo name and status', () => {
// //     //     const { getByText } = render(
// //     //         <TodoDisplay
// //     //             key={mockTodoId}
// //     //             id={mockTodoId}
// //     //             todo={mockTodo}
// //     //             setTodoToDisplay={mockSetTodoToDisplay}
// //     //             modalRef={mockModalRef}
// //     //             light="light"
// //     //             dark="dark"
// //     //         />
// //     //     );

// //     //     expect(getByText('Test Todo')).toBeTruthy();
// //     beforeEach(() => {
// //         // Mock useRouter to return an object with the push method
// //         (useRouter as jest.Mock).mockReturnValue({
// //             push: mockRouterPush,
// //         });

// //         // Clear any previous mocks
// //         jest.clearAllMocks();
// //     });

// //     it('should render todo name and status', () => {
// //         // Your test here
// //         const { getByText } = render(
// //             <TodoDisplay
// //                 key={mockTodoId}
// //                 id={mockTodoId}
// //                 todo={mockTodo}
// //                 setTodoToDisplay={mockSetTodoToDisplay}
// //                 modalRef={mockModalRef}
// //                 light="light"
// //                 dark="dark"
// //             />);

// //         expect(getByText('Test Todo')).toBeTruthy();
// //         expect(getByText('todo:status.yet')).toBeTruthy();
// //     });

// //     it('should open modal when todo is pressed', () => {
// //         const { getByText } = render(
// //             <TodoDisplay
// //                 key={mockTodoId}
// //                 id={mockTodoId}
// //                 todo={mockTodo}
// //                 setTodoToDisplay={mockSetTodoToDisplay}
// //                 modalRef={mockModalRef}
// //                 light="light"
// //                 dark="dark"
// //             />
// //         );

// //         fireEvent.press(getByText('Test Todo'));
// //         expect(mockSetTodoToDisplay).toHaveBeenCalledWith(mockTodo);
// //         expect(mockModalRef.current?.present).toBeTruthy();
// //     });

// //     it('should navigate to edit screen on long press', () => {
// //         const { getByText } = render(
// //             <TodoDisplay
// //                 key={mockTodoId}
// //                 id={mockTodoId}
// //                 todo={mockTodo}
// //                 setTodoToDisplay={mockSetTodoToDisplay}
// //                 modalRef={mockModalRef}
// //                 light="light"
// //                 dark="dark"
// //             />
// //         );

// //         fireEvent(getByText('Test Todo'), 'onLongPress');
// //         expect(mockRouterPush).toHaveBeenCalledWith({
// //             pathname: '/(app)/todo/edit',
// //             params: { idString: mockTodoId, todoJSON: JSON.stringify(mockTodo) },
// //         });
// //     });

// //     it('should trigger swipe gesture and archive todo', () => {
// //         const { getByText, getByTestId } = render(
// //             <TodoDisplay
// //                 key={mockTodoId}
// //                 id={mockTodoId}
// //                 todo={mockTodo}
// //                 setTodoToDisplay={mockSetTodoToDisplay}
// //                 modalRef={mockModalRef}
// //                 light="light"
// //                 dark="dark"
// //             />
// //         );

// //         const todoElement = getByTestId('todo-card');
// //         fireEvent(todoElement, 'onGestureEvent', { nativeEvent: { translationX: 300 } });

// //         expect(Animated.spring).toHaveBeenCalled();
// //     });
// // });




// import { TodoDisplay } from '@/components/todo/todoDisplay';
// import Todolist from '@/model/todo';
// import { act, fireEvent, render } from '@testing-library/react-native';
// import jest from 'jest';
// import React from 'react';

// // Mock necessary functions and libraries
// jest.mock('@/hooks/theme/useThemeColor', () => jest.fn().mockReturnValue('lightThemeColor'));
// jest.mock('expo-router', () => ({
//     useRouter: jest.fn(() => ({ push: jest.fn() }))
// }));
// jest.mock('../../utils/todo/utilsFunctions', () => ({
//     toogleArchivityOfTodo: jest.fn(),
//     statusIconMap: { yet: 'icon-yet', in_progress: 'icon-in-progress', done: 'icon-done', archived: 'icon-archived' },
//     statusColorMap: { yet: 'red', in_progress: 'yellow', done: 'green', archived: 'grey' },
//     statusNextAction: jest.fn(),
//     statusNextMap: { yet: 'in_progress', in_progress: 'done', done: 'archived', archived: 'yet' },
// }));
// jest.mock('@/utils/time', () => ({
//     toDate: jest.fn((timestamp) => new Date(timestamp)),
//     isToday: jest.fn((date) => date.toDateString() === new Date().toDateString()),
//     wasYesterday: jest.fn((date) => date.toDateString() === new Date(Date.now() - 86400000).toDateString()),
//     isTomorrow: jest.fn((date) => date.toDateString() === new Date(Date.now() + 86400000).toDateString()),
// }));
// jest.mock('@/config/i18config', () => ({
//     t: jest.fn((key) => key),
// }));

// const mockTodo: Todolist.Todo = {
//     name: 'Test Todo',
//     description: 'A sample todo item',
//     status: 'yet',
//     dueDate: 1627880400000, // Example timestamp
// };

// import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

// const modalRef: React.RefObject<BottomSheetModalMethods> = {
//     current: {
//         present: jest.fn(),
//         dismiss: jest.fn(),
//         snapToIndex: jest.fn(),
//         snapToPosition: jest.fn(),
//         expand: jest.fn(),
//         // Add other properties from BottomSheetModalMethods as needed
//     } as BottomSheetModalMethods,
// };

// describe('TodoDisplay Component', () => {
//     it('renders the todo item correctly', () => {
//         const { getByText } = render(
//             <TodoDisplay
//                 key="1"
//                 id="1"
//                 todo={mockTodo}
//                 setTodoToDisplay={jest.fn()}
//                 modalRef={modalRef}
//             />
//         );

//         // Check if todo name is rendered
//         expect(getByText('Test Todo')).toBeTruthy();

//         // Check if the due date is displayed
//         expect(getByText('todo:today_status')).toBeTruthy(); // Adjust according to the mock date
//     });

//     it('handles swipe gestures to archive todo', async () => {
//         const { getByTestId } = render(
//             <TodoDisplay
//                 key="1"
//                 id="1"
//                 todo={mockTodo}
//                 setTodoToDisplay={jest.fn()}
//                 modalRef={{ current: { present: jest.fn() } }}
//             />
//         );

//         const animatedView = getByTestId('todo-card');

//         // Simulate swipe gesture
//         await act(async () => {
//             fireEvent(animatedView, 'onGestureEvent', {
//                 nativeEvent: { translationX: 300 }, // Exceed the threshold
//             });
//             fireEvent(animatedView, 'onHandlerStateChange', {
//                 nativeEvent: { state: 'END', translationX: 300 }, // Complete the swipe
//             });
//         });

//         // Ensure the archiving action is triggered
//         expect(require('../../utils/todo/utilsFunctions').toogleArchivityOfTodo).toHaveBeenCalledWith('1', mockTodo);
//     });

//     it('navigates to edit screen on long press', async () => {
//         const mockPush = jest.fn();
//         require('expo-router').useRouter.mockReturnValueOnce({ push: mockPush });

//         const { getByText } = render(
//             <TodoDisplay
//                 key="1"
//                 id="1"
//                 todo={mockTodo}
//                 setTodoToDisplay={jest.fn()}
//                 modalRef={{ current: { present: jest.fn() } }}
//             />
//         );

//         const todoItem = getByText('Test Todo');

//         // Simulate long press
//         await act(async () => {
//             fireEvent(todoItem, 'onLongPress');
//         });

//         // Verify the push to edit screen with the correct parameters
//         expect(mockPush).toHaveBeenCalledWith({
//             pathname: '/(app)/todo/edit',
//             params: { idString: '1', todoJSON: JSON.stringify(mockTodo) }
//         });
//     });

//     it('opens the modal on short press', () => {
//         const mockPresent = jest.fn();
//         const { getByText } = render(
//             <TodoDisplay
//                 key="1"
//                 id="1"
//                 todo={mockTodo}
//                 setTodoToDisplay={jest.fn()}
//                 modalRef={{ current: { present: mockPresent } }}
//             />
//         );

//         const todoItem = getByText('Test Todo');

//         // Simulate short press
//         fireEvent.press(todoItem);

//         // Verify that modal is presented
//         expect(mockPresent).toHaveBeenCalled();
//     });
// });
