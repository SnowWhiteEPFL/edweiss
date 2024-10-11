import FancyButton from '@/components/input/FancyButton';
import { fireEvent, render } from "@testing-library/react-native";

describe("FancyButton", () => {
	it("calls onPress function when pressed", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).toHaveBeenCalled();
	});

	it("does not call onPress function when disabled", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton disabled onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).not.toHaveBeenCalled();
	});

	it("does not call onPress function when loading", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton loading onPress={mockFunction} testID='btn'>Press me</FancyButton>);

		fireEvent.press(getByTestId("btn"));

		expect(mockFunction).not.toHaveBeenCalled();
	});
});
