import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { AbstractTodoEditor } from './utils/abstractTodoEditor';
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


// const CreateTodoScreen: ApplicationRoute = () => {

//     const [name, setName] = useState("");
//     const [description, setDescription] = useState("");
//     const [status, setStatus] = useState<TodoStatus>("yet");
//     const [date, setDate] = useState(new Date());
//     const [dateChanged, setDateChanged] = useState(false);
//     const [timeChanged, setTimeChanged] = useState(false);
//     const [showPickerDate, setShowPickerDate] = useState(false);
//     const [showPickerTime, setShowPickerTime] = useState(false);

//     // Toogle the save button only when valid
//     const isInvalid = name === "";

//     const onChangeDate = (event: any, selectedDate: Date | undefined) => {
//         if (selectedDate) {
//             setDateChanged(true);
//             setDate(selectedDate);
//             setShowPickerDate(false);
//             setShowPickerTime(false);
//         }
//     };

//     const onChangeTime = (event: any, selectedDate: Date | undefined) => {
//         if (selectedDate) {
//             setTimeChanged(true);
//             setDate(selectedDate);
//             setShowPickerDate(false);
//             setShowPickerTime(false);
//         }
//     };



//     async function saveAction() {
//         const res = await callFunction(Functions.createTodo, {
//             todo: { name, description: (description == "") ? undefined : description, status, dueDate: (dateChanged || timeChanged) ? Time.fromDate(date) : undefined }
//         }
//         );

//         if (res.status) {
//             // Toast
//             console.log("Succefully todo added");
//             router.back();
//         } else {
//             console.log(res.error);
//         }


//     }

//     return (
//         <>
//             <RouteHeader title={t(`todo:create_header`)} />


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
//                         mt={'md'}
//                         mb={'sm'}
//                     />
//                 </TView>


//                 <TView flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>


//                     <TView backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>

//                         <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`todo:date_btn_title`)}</TText>

//                         <TTouchableOpacity onPress={() => { setShowPickerDate(true); setShowPickerTime(false); }}

//                             pr={'sm'} pl={'md'} pb={'sm'}
//                             flexDirection='row' justifyContent='flex-start' alignItems='center'>

//                             <Icon name='calendar' size='md' color='overlay0' />
//                             <TText ml={14} color={dateChanged ? 'text' : 'overlay0'}>{date.toDateString()}</TText>
//                         </TTouchableOpacity>
//                     </TView>


//                     <TView backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>

//                         <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`todo:time_btn_title`)}</TText>

//                         <TTouchableOpacity onPress={() => { setShowPickerDate(false); setShowPickerTime(true); }}

//                             pr={'sm'} pl={'md'} pb={'sm'}
//                             flexDirection='row' justifyContent='flex-start' alignItems='center'>

//                             <Icon name='alarm' size='md' color='overlay0' />
//                             <TText ml={10} color={timeChanged ? 'text' : 'overlay0'}>{date.toTimeString().split(':').slice(0, 2).join(':')}</TText>
//                         </TTouchableOpacity>
//                     </TView>

//                 </TView>


//                 {showPickerDate && (
//                     <DateTimePicker
//                         testID="dateTimePicker"
//                         value={date}
//                         mode='date'
//                         is24Hour={true}
//                         display="default"
//                         onChange={(event, selectedDate) => {
//                             if (event.type === "dismissed") {
//                                 setShowPickerDate(false);
//                                 setShowPickerTime(false);
//                             } else {
//                                 onChangeDate(event, selectedDate);
//                             }
//                         }}
//                     />
//                 )}

//                 {showPickerTime && (
//                     <DateTimePicker
//                         testID="dateTimePicker"
//                         value={date}
//                         mode='time'
//                         is24Hour={true}
//                         display="default"
//                         onChange={(event, selectedDate) => {
//                             if (event.type === "dismissed") {
//                                 setShowPickerDate(false);
//                                 setShowPickerTime(false);
//                             } else {
//                                 onChangeTime(event, selectedDate);
//                             }
//                         }}
//                     />
//                 )}

//             </TScrollView >

//             <TTouchableOpacity backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={saveAction} ml={100} mr={100} p={12} radius={'xl'}
//                 style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
//                 <TView flexDirection='row' justifyContent='center' alignItems='center'>
//                     <Icon name="save" color='base' size={'md'} />
//                     <TText color='base' ml={10}>{t(`todo:save_button`)}</TText>
//                 </TView>
//             </TTouchableOpacity >

//         </>
//     );
// };

// export default CreateTodoScreen;


const CreateTodoScreen: ApplicationRoute =
    () => { return (<AbstractTodoEditor />); };

export default CreateTodoScreen;

