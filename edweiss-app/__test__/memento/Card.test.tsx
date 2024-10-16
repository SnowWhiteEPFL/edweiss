import { render } from '@testing-library/react-native';
import React from 'react';
import CardScreen from '../../components/memento/CardScreen';

describe('CardScreen', () => {
    it('renders the CardScreen text', () => {
        const { getByText } = render(<CardScreen />);
        const textElement = getByText(/CardScreen/i);
        expect(textElement).toBeTruthy();
    });
});
