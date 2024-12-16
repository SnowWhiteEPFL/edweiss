
const config = {
	"name": "EdWeiss",
	"slug": "edweiss",
	"version": "1.0.0",
	"icon": "./assets/images/icon.png",
	"scheme": "edweiss",
	"userInterfaceStyle": "automatic",
	"splash": {
		"image": "./assets/images/splash.png",
		"resizeMode": "contain",
		"backgroundColor": "#ffffff",
	},
	"ios": {
		"supportsTablet": true,
		"bundleIdentifier": "com.edweiss",
		"usesAppleSignIn": false,
		"googleServicesFile": process.env.GOOGLE_SERVICES_IOS,// "./GoogleService-Info.plist",
		"entitlements": {
			"aps-environment": "production"
		}
	},
	"android": {
		"adaptiveIcon": {
			"foregroundImage": "./assets/images/adaptive-icon.png",
			"backgroundColor": "#ffffff"
		},
		"package": "com.edweiss",
		"googleServicesFile": process.env.GOOGLE_SERVICES_ANDROID,
		"permissions": [
			"android.permission.ACCESS_COARSE_LOCATION",
			"android.permission.ACCESS_FINE_LOCATION",
			"android.permission.RECORD_AUDIO"
		],
	},
	"web": {
		"bundler": "metro",
		"output": "static",
		"favicon": "./assets/images/favicon.png"
	},
	"plugins": [
		"expo-router",
		"@react-native-firebase/app",
		"@react-native-firebase/app-check",
		"@config-plugins/react-native-blob-util",
		"@config-plugins/react-native-pdf",
		"@react-native-google-signin/google-signin",
		"@react-native-voice/voice",
		[
			"expo-build-properties",
			{
				"ios": {
					"useFrameworks": "static"
				}
			}
		],
		[
			"expo-location",
			{
				"locationAlwaysAndWhenInUsePermission": "Allow EdWeiss to use your location."
			}
		],
		[
			"expo-image-picker",
			{
				"photosPermission": "EdWeiss accesses your photos to let you share them with your friends.",
				"cameraPermission": "Allow EdWeiss to use your location."
			}
		],
		[
			"expo-contacts",
			{
				"contactsPermission": "Allow EdWeiss to access your contacts."
			}
		],
		[
			"expo-calendar",
			{
				"calendarPermission": "EdWeiss needs to access your calendar."
			}
		],
		[
			"expo-font",
			{
				"fonts": [
					"./assets/fonts/Inter-Bold.ttf",
					"./assets/fonts/Inter-ExtraLight.ttf",
					"./assets/fonts/Inter-Light.ttf",
					"./assets/fonts/Inter-Medium.ttf",
					"./assets/fonts/Inter-Regular.ttf",
					"./assets/fonts/Inter-SemiBold.ttf",
					"./assets/fonts/Inter-Thin.ttf"
				]
			}
		],
		[
			"expo-screen-orientation",
			{
				"initialOrientation": "DEFAULT"
			}
		],
		[
			"expo-document-picker",
			{
				"iCloudContainerEnvironment": "Production"
			}
		]
	],
	"experiments": {
		"typedRoutes": true
	},
	"extra": {
		"router": {
			"origin": false
		},
		"eas": {
			"projectId": "280737b3-0a7c-42fd-98de-8dbc058e51c5"
		}
	},
	"owner": "snowwhiteepfl"
};

export default config;
