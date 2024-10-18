/**
 * @file edit.tsx
 * @description Screen component for editing a todo item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { useLocalSearchParams } from 'expo-router';
import { AbstractTodoEditor } from '../../../components/todo/abstractTodoEditor';

// Types
type Todo = Todolist.Todo;


// ------------------------------------------------------------
// -------------------   Todo Edit Screen   -------------------
// ------------------------------------------------------------

const EditTodoScreen: ApplicationRoute = () => {
    const { idString, todoJSON } = useLocalSearchParams();
    const id = idString as string;
    const todo = JSON.parse(todoJSON as string) as Todo;

    return (<AbstractTodoEditor editable={true} todo={todo} id={id} />);
};

export default EditTodoScreen;

