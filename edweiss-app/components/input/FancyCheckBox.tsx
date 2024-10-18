import ReactComponent, { Setter } from '@/constants/Component';

import { ReactNode } from 'react';
import Icon from '../core/Icon';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';

type FancyCheckBoxProps = {
    children?: ReactNode;
    value: boolean;
    onChange: Setter<boolean>;
};

const FancyCheckBox: ReactComponent<FancyCheckBoxProps> = (props) => {

    const toggleCheckbox = () => {
        props.onChange(!props.value); // Changes checkbox value
    };

    return (

        <TTouchableOpacity onPress={toggleCheckbox} ml='sm' mr='md'>

            <TView flexDirection='row' alignItems='center' mb='sm' >
                <Icon
                    name={props.value ? 'checkbox-outline' : 'square-outline'}
                    color={props.value ? 'green' : 'text'}
                    size={25}
                />
                {props.children}
            </TView>
        </TTouchableOpacity>
    );
};

export default FancyCheckBox;
