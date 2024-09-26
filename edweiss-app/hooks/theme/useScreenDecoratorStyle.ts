import { Theme } from '@/constants/Colors';
import { useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import * as StatusBar from 'expo-status-bar';
import { useEffect } from 'react';
import { ColorValue } from 'react-native';

export default function useNavigationBar(color: Theme) {
	const isFocused = useIsFocused();

	useEffect(() => {
		if (isFocused) {
			if (color == 'light') {
				NavigationBar.setBackgroundColorAsync('white');
				NavigationBar.setButtonStyleAsync('dark');
			} else if (color == 'dark') {
				NavigationBar.setBackgroundColorAsync('black');
				NavigationBar.setButtonStyleAsync('light');
			}
		}
	}, [isFocused]);
}

export function useNavigationBarCustom(color: ColorValue, buttonColor: Theme) {
	const isFocused = useIsFocused();

	useEffect(() => {
		if (isFocused) {
			NavigationBar.setBackgroundColorAsync(color);
			NavigationBar.setButtonStyleAsync(buttonColor);
		}
	}, [isFocused]);
}

export function useStatusBar(color: Theme) {
	useEffect(() => {
		if (color == 'light') {
			StatusBar.setStatusBarStyle('dark');
			StatusBar.setStatusBarBackgroundColor('#fff', false);
		} else if (color == 'dark') {
			StatusBar.setStatusBarStyle('light');
			StatusBar.setStatusBarBackgroundColor('#000', false);
		}
	}, []);
}
