import * as React from 'react';
import renderer from 'react-test-renderer';

import { TText } from '../core/TText';

it(`renders correctly`, () => {
	const tree = renderer.create(<TText>Snapshot test!</TText>).toJSON();

	expect(tree).toMatchSnapshot();
});
