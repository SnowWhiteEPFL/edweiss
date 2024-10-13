import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import t from '@/config/i18config';
import ReactComponent from '@/constants/Component';
import Todolist from '@/model/todo';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { statusColorMap, statusIconMap } from './utilsFunctions';
import Todo = Todolist.Todo;
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;



// ------------------------------------------------------------
// ------------------- Modal Filter Display  ------------------
// ------------------------------------------------------------

export const FilterModalDisplay: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    selectedStatus: { [key in TodoStatus]: boolean };
    setSelectedStatus: React.Dispatch<React.SetStateAction<{ [key in TodoStatus]: boolean }>>;
    onClose: () => void;
}> = ({ modalRef, selectedStatus, setSelectedStatus, onClose }) => {

    const toggleCheckbox = (status: TodoStatus) => {
        setSelectedStatus((prevState) => ({
            ...prevState,
            [status]: !prevState[status],
        }));
    };

    return (

        <ModalContainer modalRef={modalRef}>
            <>

                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t(`todo:filter_modal_title`)}</TText>
                </TView>

                <TView justifyContent='center' alignItems='baseline' mb='md' ml='lg'>
                    <TView>
                        {(['yet', 'in_progress', 'done', 'archived'] as TodoStatus[]).map((status) => (

                            <TView key={status} flexDirection='row' alignItems='center' mb='sm' >

                                <TTouchableOpacity onPress={() => toggleCheckbox(status)} ml='sm' mr='md'>
                                    <Icon
                                        name={selectedStatus[status] ? 'checkbox-outline' : 'square-outline'}
                                        color={selectedStatus[status] ? 'green' : 'text'}
                                        size={25}
                                    />
                                </TTouchableOpacity>


                                <TText ml='md' color={selectedStatus[status] ? 'text' : 'surface0'}>
                                    {t(`todo:name.${status}`)}
                                </TText>
                            </TView>
                        ))}
                    </TView>
                </TView>

                <FancyButton backgroundColor='subtext0' mb='md' onPress={() => onClose()} outlined>
                    {t(`todo:close_btn`)}
                </FancyButton>
            </>
        </ModalContainer>
    );
};




// ------------------------------------------------------------
// ------------------- Modal Filter Displays ------------------
// ------------------------------------------------------------


export const TodoModalDisplay: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    todo?: Todo; onClose: () => void;
}> = ({ modalRef, todo, onClose }) => {

    return (

        <ModalContainer modalRef={modalRef}>
            {todo && <>

                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{todo.name}</TText>
                </TView>


                <TView justifyContent='center' alignItems='baseline' mb='md' ml='lg'>
                    {todo.description && (
                        <TView>
                            {todo.description.split('\n').map((line, index) => (
                                <TText key={index} color='subtext0' size='md' mb='sm'>
                                    {`• ${line}`}
                                </TText>
                            ))}
                        </TView>
                    )}
                </TView>

                <TView mb='lg' pl={'md'} pr={'md'} flexDirection='row' alignItems='center'>
                    <Icon name={statusIconMap[todo.status]} color={statusColorMap[todo.status]} size={'xl'} />
                    <TText size='sm' color={statusColorMap[todo.status]} ml='md'>
                        {t(`todo:status.${todo.status}`)}
                    </TText>
                </TView>

                <TView mb={20}></TView>

                <FancyButton backgroundColor='subtext0' mb='md' onPress={() => onClose()} outlined>
                    {t(`todo:close_btn`)}
                </FancyButton>
            </>
            }
        </ModalContainer>
    );
};