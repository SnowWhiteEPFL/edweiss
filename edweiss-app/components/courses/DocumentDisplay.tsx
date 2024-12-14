import { iconSizes } from '@/constants/Sizes';
import { MaterialDocument } from '@/model/school/courses';
import { getIconName, getIconTestID, getTestID, getTextTestID } from '@/utils/courses/materialDisplay';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import Icon from '../core/Icon';
import TText from '../core/TText';

interface DocumentDisplayPropsBase {
    doc: MaterialDocument;
    onPress?: () => void;
}

type DocumentDisplayProps =
    (DocumentDisplayPropsBase & {
        isTeacher: boolean;
        onDelete: ((doc: MaterialDocument) => void) | undefined;
    })
    | (DocumentDisplayPropsBase & {
        isTeacher?: false;
        onDelete?: never;
    });


/**
 * DocumentDisplay Component
 * 
 * This component is responsible for displaying a document in the course page.
 * 
 * @param doc - The document data to be displayed.
 * @param isTeacher - Whether the user is a teacher or not.
 * @param onPress - The function to call when the document is pressed.
 * @param onDelete - The function to call when the document is deleted.
 *  
 * @returns JSX.Element - The rendered component for the document display.
 *  
 * @example
 * <DocumentDisplay doc={doc} isTeacher={true} onPress={onPress} onDelete={onDelete} />
 * <DocumentDisplay doc={doc} isTeacher={false} onPress={onPress} />
 */
const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ doc, isTeacher = false, onPress, onDelete }) => {


    return (
        <TView flexDirection="row" alignItems="center" bb={1} borderColor="crust">
            <TTouchableOpacity
                key={doc.uri}
                testID={getTestID(doc.type)}
                py={10}
                mb={10}
                flex={1}
                flexDirection="row"
                alignItems="center"
                onPress={onPress}
            >
                <Icon
                    testID={getIconTestID(doc.type)}
                    name={getIconName(doc.type)}
                    size={iconSizes.md}
                />
                <TText
                    testID={getTextTestID(doc.type)}
                    numberOfLines={1}
                    size={16}
                    ml={10}
                >
                    {doc.title}
                </TText>

            </TTouchableOpacity>
            {isTeacher && onDelete && <TTouchableOpacity onPress={() => onDelete(doc)}>
                <Icon name='trash' size={iconSizes.md} color='red' />
            </TTouchableOpacity>}
        </TView>

    );

};

export default DocumentDisplay;