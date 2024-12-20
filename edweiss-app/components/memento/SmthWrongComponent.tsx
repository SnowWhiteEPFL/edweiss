import ReactComponent from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import { router } from 'expo-router';
import FancyButton from '../input/FancyButton';

/**
 * SmthWrongComponent
 * 
 * @param {string} message - Message to display
 * 
 * @returns {ReactComponent} SmthWrongComponent
 */
const SmthWrongComponent: ReactComponent<{
    message: string;
}> = ({ message }) => {
    return (
        <TView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TText mb={20}>{message}</TText>
            <FancyButton
                testID='smth_wrong_back_button'
                onPress={() => router.back()}
                style={{
                    width: '20%', // Adjust to desired button width
                    height: 'auto', // Adjust to desired button height
                    justifyContent: 'center', // Centers content vertically
                    alignItems: 'center', // Centers content horizontally
                    borderRadius: 10, // Optional rounded corners
                }}
            >
                Back
            </FancyButton>
        </TView>
    );
};

export default SmthWrongComponent;
