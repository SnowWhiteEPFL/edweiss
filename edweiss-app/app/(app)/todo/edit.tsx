import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import { useLocalSearchParams } from 'expo-router';
import { AbstractTodoEditor } from './utils/abstractTodoEditor';
import TodoStatus = Todolist.TodoStatus;
import Todo = Todolist.Todo;
import Functions = Todolist.Functions;


// const EditTodoScreen: ApplicationRoute = () => {
//     const { idString, todoJSON } = useLocalSearchParams();
//     const id = idString as string;
//     const todo = JSON.parse(todoJSON as string) as Todo;

//     const [name, setName] = useState(todo.name);
//     const [description, setDescription] = useState(todo.description || "");
//     const [status, setStatus] = useState<TodoStatus>(todo.status);
//     const newTodo: Todo = { name, description: (description == "") ? undefined : description, status, dueDate: todo.dueDate };
//     const isValid: boolean = sameTodos(todo, newTodo);

//     async function editTodoAction() {
//         const res = await callFunction(Functions.updateTodo, { id, newTodo });

//         if (res.status) {
//             // Toast
//             console.log("Succefully todo modified the todo");
//             router.back();
//         } else {
//             console.log(res.error);
//         }
//     }

//     async function deleteTodoAction() {
//         const res = await callFunction(Functions.deleteTodo, { id });

//         if (res.status) {
//             // Toast
//             console.log("Successfully deleted the todo");
//             router.back();
//         } else {
//             console.log(res.error);
//         }
//     }

//     return (
//         <>
//             <RouteHeader title={t(`todo:edit_header`)} />

//             <TScrollView>

//                 <TView>
//                     <FancyTextInput
//                         value={name}
//                         onChangeText={n => setName(n)}
//                         placeholder={t(`todo:name_placeholder`)}
//                         icon='people'
//                         label='Name'
//                     />
//                     <FancyTextInput
//                         value={description}
//                         onChangeText={n => setDescription(n)}
//                         placeholder={t(`todo:description_placeholder`)}
//                         icon='list'
//                         label='Description'
//                         multiline
//                         numberOfLines={4}
//                         mt={'sm'}
//                     />
//                 </TView>

//                 <StatusChanger status={status} setStatus={setStatus}></StatusChanger>

//                 <FancyButton icon='trash' textColor='red' backgroundColor='red' activeOpacity={0.2} outlined onPress={deleteTodoAction}>
//                     {t(`todo:delete_btn_title`)}
//                 </FancyButton>

//             </TScrollView>



//             <TTouchableOpacity backgroundColor={(isValid) ? 'text' : 'blue'} disabled={isValid} onPress={editTodoAction} ml={100} mr={100} p={12} radius={'xl'}
//                 style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100 }}>
//                 <TView flexDirection='row' justifyContent='center' alignItems='center'>
//                     <Icon name="create" color='base' size={'md'} />
//                     <TText color='base' ml={10}>{t(`todo:edit_button`)}</TText>
//                 </TView>
//             </TTouchableOpacity >

//         </>
//     );
// };

// export default EditTodoScreen;


const EditTodoScreen: ApplicationRoute = () => {
    const { idString, todoJSON } = useLocalSearchParams();
    const id = idString as string;
    const todo = JSON.parse(todoJSON as string) as Todo;
    console.log(todoJSON);

    if (todo?.dueDate == undefined) {
        console.log('dueDate is undefined');
    } else {
        console.log('dueDate is defined');
        if (todo?.dueDate.seconds == undefined) {
            console.log('seconds is undefined');
        }
        if (todo?.dueDate.nanoseconds == undefined) {
            console.log('nanoseconds is undefined');
        }
        console.log('Everythng si defined');
        console.log('> Due date s:' + todo.dueDate.seconds + ' nanoseconds: ' + todo.dueDate.nanoseconds);

    }

    console.log(Time.now());


    return (
        <>
            <AbstractTodoEditor editable={true} todo={todo} id={id} />
        </>
    );
};

export default EditTodoScreen;

