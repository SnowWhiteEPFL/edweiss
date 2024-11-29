import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import RichText from '@/components/core/rich-text/RichText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { ApplicationRoute } from '@/constants/Component';
import { router } from 'expo-router';
import { useState } from 'react';

const CommunityTab: ApplicationRoute = () => {
	/**
	 * This is only a demo editor, don't use this as an example of
	 * how to render rich texts.
	 */
	const [richText, setRichText] = useState(`# Intro to Rich Text
### Titles
As you can see in the editor above, use # to define titles.
### Math expressions
The most beautiful formula: $e^{i\\pi} + 1 = 0$
The actual most beautiful formula: $$\\int\\limits f(t)g(t) dt = \\int\\limits f(t) dt \\cdot \\int\\limits g(t) dt$$
### Code
${"```typescript"}
const a: number = 15;
const str = "Hello, world!";
console.log(a + b);

/*
Multi line comments! Amazing
*/
function add(a, b) {
	return a + b;
}
${"```"}
${"```python"}
# Comments with LaTeX,
# $S = \\sum x_i$
def sum(array):
	return array.sum(type='fast')
${"```"}
${"```java"}
package fox.holo;

public class Main {
	public static void main(String[] args) {
		System.out.println("Hello, world!");
	}
}
${"```"}
${"```rust"}
fn add(a: i32, b: i32) -> i32 {
	a + b
}
${"```"}
I think you can see now how powerful it is
to be able to represent all of this using
only text. It can be fetched from Firebase,
genrated by AI etc.
`);

	return (
		<>
			<RouteHeader title={"Community"} />

			<TScrollView>
				<TView>
					<TText>
						Explore and experiment in community.tsx !
					</TText>
				</TView>

				<FancyButton mt={10} mb={10} onPress={() => router.push("/deck")} backgroundColor='pink'>
					Memento App
				</FancyButton>

				<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo`)}>
					My Todos
				</FancyButton>
        
        
        <FancyButton mt={10} mb={10} onPress={() => {
          router.push({
            pathname: '/(app)/lectures/remotecontrol' as any,
            params: {
              courseNameString: "edweiss-demo",
              lectureIdString: "xgy30FeIOHAnKtSfPjAe"
            }
          });
        }} >
          <TText> Go to STRC</TText>
        </FancyButton>

        <FancyButton mt={10} mb={10} onPress={() => {
          router.push({
            pathname: '/(app)/lectures/slides' as any,
            params: {
              courseNameString: "edweiss-demo",
              lectureIdString: "xgy30FeIOHAnKtSfPjAe"
            }
          });
        }} >
          <TText> Go to ShowTime</TText>
        </FancyButton>
        

				<FancyTextInput value={richText} onChangeText={setRichText} placeholder='Use Markdown and LaTeX' icon='document-text' label='Rich text' multiline />

				<RichText px={'sm'}>
					{richText}
				</RichText>

        </TScrollView>
		</>
	);
};

export default CommunityTab;
