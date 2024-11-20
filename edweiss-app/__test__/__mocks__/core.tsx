
export namespace CoreMock {

	export function mockTView() {
		return jest.mock('@/components/core/containers/TView.tsx', () => {
			const { View } = require('react-native');
			return (props: any) => <View {...props} />;
		});
	}

	export function mockTTouchableOpacity() {
		return jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
			const { TouchableOpacity, View } = require('react-native');
			return (props: React.PropsWithChildren<any>) => (
				<TouchableOpacity {...props}>
					<View>{props.children}</View>
				</TouchableOpacity>
			);
		});
	}

	export function mockTScrollView() {
		return jest.mock('@/components/core/containers/TScrollView.tsx', () => {
			const { ScrollView } = require('react-native');
			return (props: any) => (
				<ScrollView {...props} />
			)
		});
	}

	export function mockRouteHeader() {
		return jest.mock('@/components/core/header/RouteHeader', () => {
			const { Text } = require('react-native');
			return ({ title }: { title: string }) => <Text>{title}</Text>;
		});
	}

}
