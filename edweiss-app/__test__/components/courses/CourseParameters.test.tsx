import CourseParameters, { testIDs } from '@/components/courses/CourseParameters';
import { Course } from '@/model/school/courses';
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
        if (str === 'course:course_params') return 'Course Parameters';
        else if (str === 'course:course_params_title') return 'Enter/Edit the details for the course';
        else if (str === 'course:title_label') return 'Title';
        else if (str === 'course:title_placeholder') return 'Introduction to Computer Science';
        else if (str === 'course:description_label') return 'Description';
        else if (str === 'course:description_placeholder') return 'This course is an introduction to the world of computer science';
        else if (str === 'course:credits_label') return 'Credits';
        else if (str === 'course:update_changes') return 'Update Changes';
        else return str;
    })
);


describe('Course Parameters', () => {

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

    const mockOnGiveUp = jest.fn();
    const mockOnFinish = jest.fn();

    const mockCourse: { id: string, data: Course } = {
        id: '1',
        data: {
            name: 'Intro to Computer Science',
            description: 'This course is an introduction to the world of computer science',
            professors: ['prof1', 'prof2'],
            assistants: ['asst1', 'asst2'],
            periods: [{
                type: 'project',
                dayIndex: 0, // Assign a valid WeekDay value
                start: 0, // Assign a valid Minutes value
                end: 0, // Assign a valid Minutes value
                rooms: []
            }],
            section: 'IN',
            credits: 8,
            newAssignments: true,
            assignments: [],
            started: true,
        }
    };

    it('should render the component', () => {
        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        expect(screen.getByTestId(testIDs.globalView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.goBackOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.closeIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.title).props.children).toBe('Course Parameters');
        expect(screen.getByTestId(testIDs.message).props.children).toBe('Enter/Edit the details for the course');
        expect(screen.getByTestId(testIDs.scrollView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.nameDescriptionSectionView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.nameInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.descriptionInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.sectionInput)).toBeTruthy();
        expect(screen.getByTestId(testIDs.creditsComponentView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.descreaseCreidtsButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.creditsView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.creditsTitle).props.children).toBe('Credits');
        expect(screen.getByTestId(testIDs.creditsIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(8);
        expect(screen.getByTestId(testIDs.increaseCreidtsButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishTouchableOpacity)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.finishText).props.children).toBe('Update Changes');
    });

    it('should call onGiveUp when the goBackOpacity is pressed', () => {
        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.press(screen.getByTestId(testIDs.goBackOpacity));

        expect(mockOnGiveUp).toHaveBeenCalledTimes(1);
    });

    it('should NOT call onFinish when the finishTouchableOpacity is pressed but fields not filled', () => {
        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.changeText(screen.getByTestId(testIDs.nameInput), '');
        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(0);
    });

    it('should call onFinish when the finishTouchableOpacity is pressed', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.changeText(screen.getByTestId(testIDs.nameInput), 'Introduction to Computer Science');

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should call onFinish when the finishTouchableOpacity is pressed and the course name is different', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.changeText(screen.getByTestId(testIDs.nameInput), 'Computer Science 2');

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should call onFinish when the finishTouchableOpacity is pressed and the course description is different', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.changeText(screen.getByTestId(testIDs.descriptionInput), 'This course is an introduction to the world of computer science 2');

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should call onFinish when the finishTouchableOpacity is pressed and the course section is different', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        let sectionInput = screen.getByTestId(testIDs.sectionInput);
        expect(hasTextInChildren(sectionInput.props.children, 'IN')).toBe(true);
        fireEvent.press(screen.getByTestId(testIDs.sectionInput));
        sectionInput = screen.getByTestId(testIDs.sectionInput);
        expect(hasTextInChildren(sectionInput.props.children, 'SC')).toBe(true);
        fireEvent.press(screen.getByTestId(testIDs.sectionInput));
        sectionInput = screen.getByTestId(testIDs.sectionInput);
        expect(hasTextInChildren(sectionInput.props.children, 'MA')).toBe(true);

        let counter = 11;
        while (counter > 0) {
            fireEvent.press(screen.getByTestId(testIDs.sectionInput));
            counter--;
        }

        sectionInput = screen.getByTestId(testIDs.sectionInput);
        expect(hasTextInChildren(sectionInput.props.children, 'IN')).toBe(true);

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should call onFinish when the finishTouchableOpacity is pressed and the course credits are different', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        fireEvent.press(screen.getByTestId(testIDs.descreaseCreidtsButton));
        expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(7);

        fireEvent.press(screen.getByTestId(testIDs.finishTouchableOpacity));

        expect(mockOnFinish).toHaveBeenCalledTimes(1);
    });

    it('should never give a negative credits value', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        let counter = 31;
        let credits = 7;

        while (counter > 0) {
            fireEvent.press(screen.getByTestId(testIDs.descreaseCreidtsButton));
            expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(credits);
            --counter;
            if (credits > 0) --credits;
        }

        expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(0);
    });

    it('should never give a credits value greater than 30', () => {

        const screen = render(<CourseParameters course={mockCourse} onGiveUp={mockOnGiveUp} onFinish={mockOnFinish} />);

        let counter = 31;
        let credits = 9;

        while (counter > 0) {
            fireEvent.press(screen.getByTestId(testIDs.increaseCreidtsButton));
            expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(credits);
            counter--;
            if (credits < 30) ++credits;
        }

        expect(screen.getByTestId(testIDs.creditsText).props.children).toBe(30);
    });
});