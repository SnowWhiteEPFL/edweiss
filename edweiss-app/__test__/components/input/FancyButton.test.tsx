import FancyButton from '@/components/input/FancyButton';
import { fireEvent, render } from "@testing-library/react-native";

describe("FancyButton", () => {
	test("calls onPress function when pressed", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).toHaveBeenCalled();
	});

	test("does not call onPress function when disabled", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton disabled onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).not.toHaveBeenCalled();
	});

	test("does not call onPress function when loading", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton loading onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).not.toHaveBeenCalled();
	});
});
