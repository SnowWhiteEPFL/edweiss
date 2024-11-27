import TView from '@/components/core/containers/TView';
import ReactComponent from '@/constants/Component';
import React from 'react';
import { WebView } from 'react-native-webview';
// import MathJax from 'react-native-mathjax';

interface RichTextProps {
	children: string
}

const RichText: ReactComponent<RichTextProps> = (props) => {
	// const test = usePromise(async () => {
	// 	return await tex2svg(props.children, {
	// 		showConsole: true
	// 	});
	// });

	// console.log(test);

	return (
		<TView>
			<WebView
				style={{
					width: '100%',
					height: 400
				}}
				source={{ uri: 'https://expo.dev' }}
			/>
			{/* <MathJax
				// HTML content with MathJax support
				html={'$\sum_{i=0}^n i^2 = \frac{(n^2+n)(2n+1)}{6}$<br><p>This is an equation</p>'}
				// MathJax config option
				mathJaxOptions={{
					messageStyle: 'none',
					extensions: ['tex2jax.js'],
					jax: ['input/TeX', 'output/HTML-CSS'],
					tex2jax: {
						inlineMath: [['$', '$'], ['\\(', '\\)']],
						displayMath: [['$$', '$$'], ['\\[', '\\]']],
						processEscapes: true,
					},
					TeX: {
						extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
					}
				}}
			// {...WebView props}
			/> */}
			{/* <MathText
				content={`
            $$E = mc^2$$
            $2^{1+2}$
            Here is an inline equation: $a^2 + b^2 = c^2$
            <p>Additional HTML content can go here.</p>
          `}
				textSize={20}
				textColor={"#333"}
				style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
			/> */}
		</TView>
	);
};

export default RichText;
