import FancyButton from '@/components/input/FancyButton';
import { fireEvent, render } from "@testing-library/react-native";

describe("FancyButton", () => {
	test("calls onPress function when pressed", async () => {
		const mockFunction = jest.fn();
		const { getByTestId } = render(<FancyButton onPress={mockFunction}>Click me</FancyButton>);

		// await act(async () => {
		// });

		fireEvent.press(getByTestId("pressable"));

		expect(mockFunction).toHaveBeenCalled();
	});
});
