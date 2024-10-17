import Todolist from '@/model/todo';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { TodoDisplay } from '../../components/todo/todoDisplay';

// Mock necessary imports
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/theme/useThemeColor', () => jest.fn(() => 'backgroundColorMock'));

jest.mock('@/utils/time', () => ({
    Time: {
        toDate: jest.fn(),
        isToday: jest.fn(),
        wasYesterday: jest.fn(),
        isTomorrow: jest.fn(),
    },
}));

jest.mock('@/config/i18config', () => ({
    t: jest.fn((key: string) => key),
}));

jest.mock('@/components/core/Icon', () => 'Icon');
jest.mock('@/components/core/TText', () => 'TText');
jest.mock('@/components/core/containers/TTouchableOpacity', () => 'TTouchableOpacity');
jest.mock('@/components/core/containers/TView', () => 'TView');

describe('TodoDisplay', () => {
    const mockTodo: Todolist.Todo = {
        name: 'Test Todo',
        description: 'This is a test todo description.',
        dueDate: new Date().toISOString(),
        status: 'yet',
    };

    const mockSetTodoToDisplay = jest.fn();
    const mockModalRef = React.createRef<BottomSheetModalMethods>();
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
        jest.clearAllMocks();
    });

    it('should render todo name and status', () => {
        const { getByText } = render(
            <TodoDisplay
                key={mockTodo.id}
                id={mockTodo.id}
                todo={mockTodo}
                setTodoToDisplay={mockSetTodoToDisplay}
                modalRef={mockModalRef}
                light="light"
                dark="dark"
            />
        );

        expect(getByText('Test Todo')).toBeTruthy();
        expect(getByText('todo:status.yet')).toBeTruthy();
    });

    it('should open modal when todo is pressed', () => {
        const { getByText } = render(
            <TodoDisplay
                key={mockTodo.id}
                id={mockTodo.id}
                todo={mockTodo}
                setTodoToDisplay={mockSetTodoToDisplay}
                modalRef={mockModalRef}
                light="light"
                dark="dark"
            />
        );

        fireEvent.press(getByText('Test Todo'));
        expect(mockSetTodoToDisplay).toHaveBeenCalledWith(mockTodo);
        expect(mockModalRef.current?.present).toBeTruthy();
    });

    it('should navigate to edit screen on long press', () => {
        const { getByText } = render(
            <TodoDisplay
                key={mockTodo.id}
                id={mockTodo.id}
                todo={mockTodo}
                setTodoToDisplay={mockSetTodoToDisplay}
                modalRef={mockModalRef}
                light="light"
                dark="dark"
            />
        );

        fireEvent(getByText('Test Todo'), 'onLongPress');
        expect(mockRouterPush).toHaveBeenCalledWith({
            pathname: '/(app)/todo/edit',
            params: { idString: mockTodo.id, todoJSON: JSON.stringify(mockTodo) },
        });
    });

    it('should trigger swipe gesture and archive todo', () => {
        const { getByText, getByTestId } = render(
            <TodoDisplay
                key={mockTodo.id}
                id={mockTodo.id}
                todo={mockTodo}
                setTodoToDisplay={mockSetTodoToDisplay}
                modalRef={mockModalRef}
                light="light"
                dark="dark"
            />
        );

        const todoElement = getByTestId('todo-card');
        fireEvent(todoElement, 'onGestureEvent', { nativeEvent: { translationX: 300 } });

        expect(Animated.spring).toHaveBeenCalled();
    });
});
