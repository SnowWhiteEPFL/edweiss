import ReactComponent from '@/constants/Component';
import React, { useMemo, useState } from 'react';
import { ViewStyle } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { WebViewProps } from 'react-native-webview';

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
		${props.disableMathJax ? `
			<div id="jax-content">${props.source}</div>

			<script type="text/javascript">
				// window.addEventListener('load', (event) => {
					// console.log('page is fully loaded');
				// 	setTimeout(() => {
				// 		window.ReactNativeWebView.postMessage(String(document.getElementById("jax-content").scrollHeight));
				// 	}, 16);
				// });

				
				// element.scrollHeight
				// window.ReactNativeWebView.postMessage(String(document.documentElement.scrollHeight));
				// setTimeout(() => {
					// window.ReactNativeWebView.postMessage(String(document.documentElement.scrollHeight));
				// }, 48);
			</script>
		` : `
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

	// const onProductDetailsWebViewMessage = event => {
	// 	setWebviewHeight(Number(event.nativeEvent.data) / PixelRatio.get())
	// }

	return (
		// <View style={[{}, props.style]}>
		<AutoHeightWebView
			style={props.style}
			textInteractionEnabled={false}
			scrollEnabled={false}
			overScrollMode='never'
			showsVerticalScrollIndicator={false}
			source={{ html }}
			onContentSizeChange={event => {
				console.log("Content size change :", event);
			}}
			onSizeUpdated={size => console.log("Size height: ", size.height)}
			// onMessage={message => {
			// 	setHeight(Number(message.nativeEvent.data))
			// const newHeight = Number(message.nativeEvent.data);
			// setHeight(Number(message.nativeEvent.data) / PixelRatio.get())
			// setHeight(newHeight);
			// console.log(newHeight);
			// }}
			// cacheEnabled
			// scalesPageToFit={true}
			// injectedJavaScript='window.ReactNativeWebView.postMessage(document.body.scrollHeight)'
			// viewportContent={'width=device-width, user-scalable=no'}
			// cacheMode='LOAD_CACHE_ELSE_NETWORK'
			{...props.webview}
		/>
		// </View>
	);
};

export default WebViewMathJaxWrapper;
