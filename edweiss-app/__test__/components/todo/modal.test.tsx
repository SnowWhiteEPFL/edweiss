import { FilterModalDisplay, TodoModalDisplay } from '@/components/todo/modal';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/utils/time', () => ({
    Time: {
        toDate: jest.fn(() => new Date('2021-10-29T12:00:00Z')),
        // You can mock other functions if needed
    },
}));
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true, // This ensures it's treated as a module with a default export
    default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
}));

jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ children }) => (
        <div>{children}</div> // Simple mock
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div> // Simple mock
    )),
    BottomSheetBackdrop: jest.fn(),
}));

jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));


describe('TodoModalDisplay', () => {
    const mockOnClose = jest.fn();
    const modalRef = React.createRef<BottomSheetModal>();
    const todo: Todolist.Todo = {
        name: 'Test Todo',
        description: 'Description for test todo',
        dueDate: { seconds: 1635504000, nanoseconds: 0 },
        status: 'in_progress',
    };

    beforeEach(() => {
        (Time.toDate as jest.Mock).mockReturnValue(new Date('2021-10-29T12:00:00Z'));
        jest.clearAllMocks();
    });

    it('renders todo details correctly', () => {
        const { getByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={todo}
                onClose={mockOnClose}
            />
        );

        expect(getByText('Test Todo')).toBeTruthy();
        expect(getByText('• Description for test todo')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const { getByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={todo}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('todo:close_btn'));
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not render anything if todo is undefined', () => {
        const { queryByText } = render(
            <TodoModalDisplay
                modalRef={modalRef}
                todo={undefined}
                onClose={mockOnClose}
            />
        );

        expect(queryByText('Test Todo')).toBeNull();
    });
});

describe('FilterModalDisplay', () => {
    const mockOnClose = jest.fn();
    const modalRef = React.createRef<BottomSheetModal>();
    const selectedStatus = {
        yet: false,
        in_progress: false,
        done: false,
        archived: false,
    };
    const setSelectedStatus = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders filter options correctly', () => {
        const { getByText } = render(
            <FilterModalDisplay
                modalRef={modalRef}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onClose={mockOnClose}
            />
        );

        expect(getByText('todo:filter_modal_title')).toBeTruthy();
        expect(getByText('todo:name.yet')).toBeTruthy();
        expect(getByText('todo:name.in_progress')).toBeTruthy();
        expect(getByText('todo:name.done')).toBeTruthy();
        expect(getByText('todo:name.archived')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
        const { getByText } = render(
            <FilterModalDisplay
                modalRef={modalRef}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByText('todo:close_btn'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});
