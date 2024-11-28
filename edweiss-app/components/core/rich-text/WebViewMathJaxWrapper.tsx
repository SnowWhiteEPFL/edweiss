import ReactComponent from '@/constants/Component';
import React, { useMemo, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { WebView, WebViewProps } from 'react-native-webview';

const mathjaxConfigPayload = JSON.stringify({
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
});

interface WebViewJaxWrapperProps {
	source: string,
	style?: ViewStyle,
	webview?: WebViewProps,
	disableMathJax?: boolean
}

const WebViewMathJaxWrapper: ReactComponent<WebViewJaxWrapperProps> = (props) => {
	const [height, setHeight] = useState(0);

	const html = useMemo(() => `
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
		${props.disableMathJax ? props.source : `
			<script type="text/x-mathjax-config">
				MathJax.Hub.Config(${mathjaxConfigPayload});
				MathJax.Hub.Queue(() => {
					window.ReactNativeWebView.postMessage(String(document.documentElement.scrollHeight));
					document.getElementById("jax-content").style.visibility = 'visible';
				});
			</script>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js"></script>
			<div id="jax-content" style="visibility: hidden;">${props.source}</div>
		`}
	`, [props.source]);

	return (
		<View style={[{ height }, props.style]}>
			<WebView
				source={{ html }}
				onMessage={message => setHeight(Number(message.nativeEvent.data))}
				cacheEnabled
				cacheMode='LOAD_CACHE_ELSE_NETWORK'
				{...props.webview}
			/>
		</View>
	);
};

export default WebViewMathJaxWrapper;

// const [mathJax, setMathJax] = useState<string | undefined>(cachedMathJax);

// useEffect(() => {
// 	if (!mathJax) {
// 		(async () => {
// 			const res = await fetch("https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js");
// 			const content = await res.text();
// 			setMathJax(content);
// 			cachedMathJax = content;
// 		})();
// 	}
// }, []);

// <script type="text/javascript">${mathJax}</script>
