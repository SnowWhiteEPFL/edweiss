import TText from '@/components/core/TText';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import ReactComponent from '@/constants/Component';
import { fireEvent, render } from "@testing-library/react-native";
import { useState } from 'react';

const Checkbox: ReactComponent<{}> = (_) => {
	const [checked, setChecked] = useState(false);

	return (
		<TTouchableOpacity onPress={_ => setChecked(c => !c)} testID='checkbox'>
			<TText>
				{checked ? "Checked" : "Not checked"}
			</TText>
		</TTouchableOpacity>
	);
};

describe("Checkbox", () => {
	test("calls onPress function when pressed", async () => {
		const screen = render(<Checkbox />);

		expect(screen.getByText("Not checked")).toBeTruthy();

		fireEvent.press(screen.getByTestId("checkbox"));

		expect(screen.getByText("Checked"));
	});
});
