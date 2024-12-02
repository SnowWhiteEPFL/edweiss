import AddAssignment, { testIDs } from '@/components/courses/AddAssignment';
import { fireEvent, render } from '@testing-library/react-native';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
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
        if (str === 'course:add_assignment') return 'Add Assignment';
        else if (str === 'course:add_assignment_title') return 'Enter the details for the new assignment';
        else if (str === 'course:name_label') return 'Name';
        else if (str === 'course:name_placeholder') return 'Weekly Assignment';
        else if (str === 'course:type_label') return 'Type';
        else if (str === 'course:type_placeholder') return 'Quiz';
        else if (str === 'course:due_date_label') return 'Due Date';
        else if (str === 'course:due_time_label') return 'Due Time';
        else if (str === 'course:upload_assignment') return 'Upload Assignment';
        else return str;
    })
);


let mockEventType = 'set';
let mockDate = new Date(2012, 3, 4, 12, 34, 56);

jest.mock('@react-native-community/datetimepicker', () => ({
    __esModule: true,
    default: ({ onChange }: any) => {
        return onChange(
            { type: mockEventType },
            mockDate
        );
    },
}));

const setMockEventType = (type: string) => {
    mockEventType = type;
};

const setMockDate = (date: Date) => {
    mockDate = date;
};


describe('Add Assignment', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    function hasTextInChildren(children: any, text: string): boolean {
        if (typeof children === 'string' || typeof children === 'number') {
            return children === text;
        }
        if (Array.isArray(children)) {
            return children.some((child) => hasTextInChildren(child, text));
        }
        if (children && typeof children === 'object' && children.props) {
            return hasTextInChildren(children.props.children, text);
        }
        return false;
    }

    const mockOnSubmit = jest.fn();

    it('should render the component', () => {
        const screen = render(<AddAssignment onSubmit={mockOnSubmit} />);

        expect(screen.getByTestId(testIDs.addAssignmentTitle).props.children).toBe('Add Assignment');
        expect(screen.getByTestId(testIDs.addAssignmentDescription).props.children).toBe('Enter the details for the new assignment');
        expect(screen.getByTestId(testIDs.scrollView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.nameAndTypeView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.nameInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.typeInput)).toBeTruthy();

        expect(screen.getByTestId(testIDs.dueDateView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.dateInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.dateTitle).props.children).toBe('Due Date');
        expect(screen.getByTestId(testIDs.dateTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.dateIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.dateText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.timeInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.timeTitle).props.children).toBe('Due Time');
        expect(screen.getByTestId(testIDs.timeTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.timeIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.timeText)).toBeTruthy();

        expect(screen.queryByTestId(testIDs.datePicker)).toBeNull();
        expect(screen.queryByTestId(testIDs.timePicker)).toBeNull();

        expect(screen.getByTestId(testIDs.finishTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishText).props.children).toBe('Upload Assignment');
    });

    it('should NOT call onSubmit when the finishTouchableOpacity is pressed but fields not filled', () => {
        const screen = render(<AddAssignment onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(0);
    });

    it('should call onSubmit when the finishTouchableOpacity is pressed', () => {

        setMockEventType('set');
        const defaultDate1 = new Date(2012, 3, 4, 12, 34, 56);
        const expectedTime1 = defaultDate1.toTimeString().split(':').slice(0, 2).join(':');

        const screen = render(<AddAssignment onSubmit={mockOnSubmit} />);

        fireEvent.changeText(screen.getByTestId(testIDs.nameInput), 'Assignment 5');

        const typeInput = screen.getByTestId(testIDs.typeInput);
        expect(hasTextInChildren(typeInput.props.children, 'quiz')).toBe(true);
        fireEvent.press(screen.getByTestId(testIDs.typeInput));
        expect(hasTextInChildren(typeInput.props.children, 'submission')).toBe(true);

        setMockDate(defaultDate1);
        fireEvent.press(screen.getByTestId(testIDs.dateTouchableOpacity));
        expect(screen.getByTestId(testIDs.dateText).props.children).toBe(defaultDate1.toDateString());
        fireEvent.press(screen.getByTestId(testIDs.timeTouchableOpacity));
        expect(screen.getByTestId(testIDs.timeText).props.children).toBe(expectedTime1);

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    test('handles dismissed event for DateTimePicker', async () => {
        // Mock the dismissed event
        setMockEventType('dismissed');

        const screen = render(<AddAssignment onSubmit={mockOnSubmit} />);

        fireEvent.press(screen.getByTestId(testIDs.dateTouchableOpacity));
        fireEvent.press(screen.getByTestId(testIDs.timeTouchableOpacity));
    });
});