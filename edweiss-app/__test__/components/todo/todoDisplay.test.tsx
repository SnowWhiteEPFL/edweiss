/**
 * @file todoDisplay.test.tsx
 * @description Test suite for todoDisplay and it sub modals 
 *              that are being used in the TodoListScreen
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { StatusChanger, TodoDisplay, TodoStatusDisplay } from '@/components/todo/todoDisplay';
import t from '@/config/i18config';
import { default as Todolist } from '@/model/todo';
import { Time } from '@/utils/time';
import { statusNextAction, toogleArchivityOfTodo } from '@/utils/todo/utilsFunctions';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated } from 'react-native';
import { State } from 'react-native-gesture-handler';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Custum time utils function to return default values
jest.mock('@/utils/time', () => ({
    Time: {
        toDate: jest.fn(() => new Date('2021-10-29T12:00:00Z')),
        isToday: jest.fn(() => false),
        wasYesterday: jest.fn(() => false),
        isTomorrow: jest.fn(() => false),
    },
}));

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

// Simple router mock
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

// Minimalist BottomSheet mocks for modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(),
    BottomSheetView: jest.fn(({ children }) => <div>{children}</div>),
}));

// Utils function for todo handling
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
        done: 'yet',
        archived: 'yet',
    },
}));

// Router.push mocked to check displacement to different screens
const mockRouter = {
    push: jest.fn(),
};

// Global, the modalRef context for this test suite
const modalRef = React.createRef<BottomSheetModalMethods>();


// ------------------------------------------------------------
// -----------     To do Display Screen  Test suite     -------
// ------------------------------------------------------------

describe('TodoDisplay Tests Suite', () => {
    const todo: Todolist.Todo = {
        name: 'Test Todo',
        status: 'yet',
        dueDate: undefined,
    };

    const todoToday: Todolist.Todo = {
        name: 'Test Todo Today',
        status: 'yet',
        dueDate: { seconds: 0, nanoseconds: 0 }
    };

    // Clean all mocks before any test start
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('renders the TodoDisplay component correctly', () => {
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
    });

    it('handles press event to display modal', () => {
        const setTodoToDisplay = jest.fn();
        const { getByText } = render(
            <TodoDisplay
                key="1"
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
                key="1"
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
        expect(getByText('todo:status.done')).toBeTruthy();
    });



    it('displays "Today" status if dueDate is tomorrow', () => {
        (Time.isToday as jest.Mock).mockImplementationOnce(() => true);
        const { getByText } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todoToday}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText(t('todo:today_status'))).toBeTruthy();
    });


    it('displays "Yesterday" status if dueDate is tomorrow', () => {
        (Time.wasYesterday as jest.Mock).mockImplementationOnce(() => true);
        const { getByText } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todoToday}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText(t('todo:yesterday_status'))).toBeTruthy();
    });


    it('displays "Tomorrow" status if dueDate is tomorrow', () => {
        (Time.isTomorrow as jest.Mock).mockImplementationOnce(() => true);
        const { getByText } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todoToday}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText(t('todo:tomorrow_status'))).toBeTruthy();
    });

    it('displays stored date status if not today, tomorrow, yesterday', () => {
        const { getByText } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todoToday}
                setTodoToDisplay={jest.fn()}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText('10/29/2021')).toBeTruthy();
    });
});



// ------------------------------------------------------------
// ---    To do Display Screen  Test suite for gestures     ---
// ------------------------------------------------------------

describe('TodoDisplay gesture handling', () => {
    const todo: Todolist.Todo = {
        name: 'Test Todo',
        status: 'yet',
        dueDate: undefined,
    };
    const setTodoToDisplay = jest.fn();

    // Clean all mocks before any test start 
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('do not calls toogleArchivityOfTodo on swipe smaller threshold', () => {
        const { getByTestId } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        const swipeArea = getByTestId('todo-swipe-area');

        // Simulate swipe past the threshold
        fireEvent(swipeArea, 'onGestureEvent', { nativeEvent: { translationX: 100 } });
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.END, translationX: 100 } });

        // Confirm toggle archive was not called
        expect(toogleArchivityOfTodo).not.toHaveBeenCalledWith(
            "1",
            expect.objectContaining({
                name: 'Test Todo',
                status: 'yet',
                dueDate: undefined,
            })
        );

    });

    it('snaps back to original position on swipe below threshold', () => {
        const { getByTestId } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        const swipeArea = getByTestId('todo-swipe-area');
        const animatedTimingSpy = jest.spyOn(Animated, 'timing');
        const animatedSpringSpy = jest.spyOn(Animated, 'spring');

        // Simulate a small swipe (below threshold)
        fireEvent(swipeArea, 'onGestureEvent', { nativeEvent: { translationX: 100 } });
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.END, translationX: 100 } });

        // Confirm snap-back animation (spring) is triggered instead of timing
        expect(animatedSpringSpy).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ toValue: 0 }));
        expect(animatedTimingSpy).not.toHaveBeenCalled();
    });

    it('records starting position when gesture begins', () => {
        const { getByTestId } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        const swipeArea = getByTestId('todo-swipe-area');

        // Simulate gesture start
        fireEvent(swipeArea, 'onHandlerStateChange', {
            nativeEvent: {
                state: State.BEGAN,
                x: 50,
                y: 100,
            },
        });

    });

    it('updates translateX for horizontal swipes in edge swipe zone', () => {
        const { getByTestId } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        const swipeArea = getByTestId('todo-swipe-area');
        const setValueSpy = jest.spyOn(Animated.Value.prototype, 'setValue');

        // Simulate gesture in active state with more horizontal movement
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.BEGAN, x: 20 } });
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.ACTIVE, translationX: 50, translationY: 10 } });

        // Check that translateX was updated since swipe is horizontal and within edge zone
        expect(setValueSpy).toHaveBeenCalledWith(50);
    });

    it('does not update translateX for vertical swipes', () => {
        const { getByTestId } = render(
            <TodoDisplay
                key="1"
                id="1"
                todo={todo}
                setTodoToDisplay={setTodoToDisplay}
                modalRef={modalRef}
                light="light"
                dark="dark"
            />
        );

        const swipeArea = getByTestId('todo-swipe-area');
        const setValueSpy = jest.spyOn(Animated.Value.prototype, 'setValue');

        // Simulate vertical gesture that shouldn't trigger horizontal movement
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.BEGAN, x: 20 } });
        fireEvent(swipeArea, 'onHandlerStateChange', { nativeEvent: { state: State.ACTIVE, translationX: 10, translationY: 50 } });

        // Expect no translateX update
        expect(setValueSpy).not.toHaveBeenCalled();
    });
});


// ------------------------------------------------------------
// ---  To do Status Display Modal Test suite for gestures  ---
// ------------------------------------------------------------

describe('TodoStatusDisplay Modal Tests Suites', () => {
    const id = '1';
    const todo: Todolist.Todo = { name: 'Test Todo', status: 'yet' };

    it('calls statusNextAction on press', () => {
        const { getByTestId } = render(
            <TodoStatusDisplay id={id} todo={todo} status="yet" />
        );

        const touchable = getByTestId('status-touchable');
        fireEvent.press(touchable);

        expect(statusNextAction).toHaveBeenCalledWith(id, todo);
    });
});



// ------------------------------------------------------------
// ------   Status Changer Modal Test suite for gestures  -----
// ------------------------------------------------------------

describe('StatusChanger', () => {
    const setStatusMock = jest.fn();

    it('calls setStatus with next status on press', () => {
        const { getByTestId } = render(
            <StatusChanger status="yet" setStatus={setStatusMock} />
        );

        const button = getByTestId('fancy-button-status-changer');
        fireEvent.press(button);

        expect(setStatusMock).toHaveBeenCalledWith('in_progress');
    });
});