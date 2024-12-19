import SmthWrongComponent from '@/components/memento/SmthWrongComponent';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
    router: { push: jest.fn(), back: jest.fn() },
}));

describe('SmthWrongComponent', () => {
    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<SmthWrongComponent message='This is awkward ... It seems like you have no chosen cards to play' />);
        expect(getByText('This is awkward ... It seems like you have no chosen cards to play')).toBeTruthy();

        expect(getByTestId('smth_wrong_back_button')).toBeTruthy();

        fireEvent.press(getByTestId('smth_wrong_back_button'));
    });
});