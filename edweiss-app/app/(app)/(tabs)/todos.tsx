import { ApplicationRoute } from '@/constants/Component';
import React, { useEffect, useRef, useState } from 'react';

import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import HeaderButtons from '@/components/core/header/HeaderButtons';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { default as Todolist } from '@/model/todo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import { GestureHandlerRootView, NativeViewGestureHandler, ScrollView } from 'react-native-gesture-handler';
import { FilterModalDisplay, TodoModalDisplay } from '../../../components/todo/modal';
import { TodoDisplay } from '../../../components/todo/todoDisplay';

// Types
type Todo = Todolist.Todo;
type TodoStatus = Todolist.TodoStatus;

const TodoListScreen: ApplicationRoute = () => {
	const { todo } = useLocalSearchParams(); // Accéder aux paramètres passés
	const parsedTodo = todo ? JSON.parse(todo as string) : null;
	const optionalTodoToRender = parsedTodo || 'Default Todo';
	const shouldDisplayModal = Boolean(parsedTodo);
	const auth = useAuth();
	const todosData = useDynamicDocs(CollectionOf<Todo>(`users/${auth.authUser.uid}/todos`));
	const todos = todosData ? todosData.map(doc => ({ id: doc.id, data: doc.data })) : [];
	const [todoToDisplay, setTodoToDisplay] = React.useState<Todo | undefined>(optionalTodoToRender.data);
	const modalRefTodoInfo = useRef<BottomSheetModal>(null);
	const modalRefFilter = useRef<BottomSheetModal>(null);
	const [selectedStatus, setSelectedStatus] = useState<{ [key in TodoStatus]: boolean }>({
		yet: true,
		in_progress: true,
		done: false,
		archived: false,
	});
	const todos_filtered = todos.filter(todo => selectedStatus[todo.data.status]);

	useEffect(() => {
		if (shouldDisplayModal) {
			modalRefTodoInfo.current?.present();
		}
	}, [shouldDisplayModal]);

	return (
		<>

			<RouteHeader
				title={t(`todo:todolist_header`)}
				right={
					<HeaderButtons>
						<HeaderButton icon="options-outline" testID='filter-button' onPress={() => modalRefFilter.current?.present()} />
					</HeaderButtons>
				}
			/>

			{todos_filtered.length > 0 ? (<GestureHandlerRootView style={{ flex: 1 }}><NativeViewGestureHandler><ScrollView>{todos_filtered.map((todo) => (<TodoDisplay key={todo.id} id={todo.id} todo={todo.data} setTodoToDisplay={setTodoToDisplay} modalRef={modalRefTodoInfo} />))}</ScrollView></NativeViewGestureHandler></GestureHandlerRootView>)
				:
				(
					<TView
						justifyContent="center"
						alignItems="center"
						flex={1}>
						<TText>
							{t('todo:list_empty')}
						</TText>
					</TView>
				)
			}


			<TTouchableOpacity
				onPress={() => router.push('/(app)/todo/create')}
				p={6} radius={'lg'}
				backgroundColor='base'
				m='md' mt={'sm'} mb={'sm'}
				b={'sm'} borderColor='overlay0'
				style={{
					position: 'absolute',
					bottom: 30,
					right: 10,
					zIndex: 100
				}}
				testID='add-todo-button'
			>
				<Icon name="duplicate" color='blue' size={50}></Icon>
			</TTouchableOpacity >


			<TodoModalDisplay modalRef={modalRefTodoInfo} todo={todoToDisplay} onClose={() => { setTodoToDisplay(undefined); modalRefTodoInfo.current?.close(); }} />

			<FilterModalDisplay modalRef={modalRefFilter} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} onClose={() => modalRefFilter.current?.close()} />

		</>
	);

};

export default TodoListScreen;
