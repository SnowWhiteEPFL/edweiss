import CalendarDayDisplay from '@/components/calendar/CalendarDayDisplay';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
	router: {
		push: jest.fn(),
	},
}));

const mockCourse: Course = {
	name: 'Test Course',
	description: 'A course for testing purposes.',
	professors: ['prof1'],
	assistants: ['student1'],
	periods: [],
	section: 'IN',
	credits: 3,
};

const mockPeriod: CourseTimePeriod = {
	start: 480,
	end: 540,
	type: "lecture",
	activityId: 'activity1',
	dayIndex: 1,
	rooms: [],
};

const mockUserProfessor = {
	data: {
		type: 'professor',
	},
};

const mockUserStudent = {
	data: {
		type: 'student',
	},
};

describe('Day Component', () => {
	it('renders correctly for a professor and navigates on press', () => {
		const { getByText } = render(
			<CalendarDayDisplay
				period={mockPeriod}
				course={{ id: 'course1', data: mockCourse }}
				user={mockUserProfessor}
				filteredPeriods={[mockPeriod]}
				index={0}
			/>
		);

		expect(getByText('Test Course')).toBeTruthy();

		fireEvent.press(getByText('Test Course'));

		expect(router.push).toHaveBeenCalledWith({
			pathname: '/(app)/startCourseScreen',
			params: {
				courseID: 'course1',
				course: JSON.stringify(mockCourse),
				period: JSON.stringify(mockPeriod),
				index: 0,
			},
		});
	});

	it('renders correctly for a student and navigates on press', () => {
		const { getByText } = render(
			<Day
				period={mockPeriod}
				course={{ id: 'course1', data: mockCourse }}
				user={mockUserStudent}
				filteredPeriods={[mockPeriod]}
				index={0}
			/>
		);

		expect(getByText('Test Course')).toBeTruthy();


		fireEvent.press(getByText('Test Course'));


		expect(router.push).toHaveBeenCalledWith({
			pathname: '/(app)/lectures/slides',
			params: {
				courseNameString: 'Test Course',
				lectureIdString: 'activity1',
			},
		});
	});

	it('handles the case when period does not have an end time', () => {
		const periodWithoutEnd = { ...mockPeriod, end: mockPeriod.end ?? 0 };

		const { getByText } = render(
			<Day
				period={periodWithoutEnd}
				course={{ id: 'course1', data: mockCourse }}
				user={mockUserProfessor}
				filteredPeriods={[periodWithoutEnd]}
				index={0}
			/>
		);
		expect(getByText('Test Course')).toBeTruthy();
	});
});
