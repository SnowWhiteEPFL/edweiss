import { ExpoConfig } from 'expo/config';
import 'ts-node/register'; // Add this to import TypeScript files

const config: ExpoConfig = {
	"name": "EdWeiss",
	"slug": "edweiss",
	"version": "1.0.0",
	"orientation": "portrait",
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
		"entitlements": {
			"aps-environment": "production"
		},
		"googleServicesFile": "./GoogleService-Info.plist"
	},
	"android": {
		"adaptiveIcon": {
			"foregroundImage": "./assets/images/adaptive-icon.png",
			"backgroundColor": "#ffffff"
		},
		"package": "com.edweiss",
		"permissions": [
			"android.permission.ACCESS_COARSE_LOCATION",
			"android.permission.ACCESS_FINE_LOCATION",
			"android.permission.RECORD_AUDIO"
		],
		"googleServicesFile": "./google-services.json"
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
		"@react-native-google-signin/google-signin",
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
