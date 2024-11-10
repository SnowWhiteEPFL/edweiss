/**
 * @file create.tsx
 * @description Screen component for creating a new to do item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { ApplicationRoute } from '@/constants/Component';
import { AbstractTodoEditor } from '../../../components/todo/abstractTodoEditor';

// ------------------------------------------------------------
// -----------------   To do Creation Screen   ----------------
// ------------------------------------------------------------

const CreateTodoScreen: ApplicationRoute =
    () => { return (<AbstractTodoEditor />); };

export default CreateTodoScreen;

