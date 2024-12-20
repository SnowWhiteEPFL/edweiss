
import { Color } from '@/constants/Colors'
import React from 'react'
import TText from '../core/TText'
import TTouchableOpacity from '../core/containers/TTouchableOpacity'
import TView from '../core/containers/TView'

export interface RadioSelectable<ValueType> {
	readonly value: ValueType,
	readonly label: string
	readonly description?: string
	readonly inlineDescription?: string
	readonly color?: Color
}

interface SelectablesProps<ValueType> {
	readonly value: ValueType | undefined,
	readonly data: RadioSelectable<ValueType>[],
	readonly onSelection: (value: ValueType) => void,
	readonly hasInlineDescription?: boolean,
	readonly disabled?: boolean,
}

function RadioSelectables<ValueType>(props: SelectablesProps<ValueType>) {
	return (
		<TView style={{ width: '100%' }}>
			{
				props.data.map(v =>
					<Element key={v.value as React.Key} disabled={props.disabled} hasInlineDescription={props.hasInlineDescription} selectable={v} selectedValue={props.value} setSelected={props.onSelection} color={v.color} />
				)
			}
		</TView>
	)
}

function Element<ValueType>({ color = "blue", ...props }: { disabled?: boolean, hasInlineDescription?: boolean, selectable: RadioSelectable<ValueType>, selectedValue: ValueType | undefined, setSelected: (s: ValueType) => void, color?: Color }) {
	const selected = props.selectedValue != undefined && props.selectedValue === props.selectable.value;

	const disabled = props.disabled;

	return (
		<TTouchableOpacity
			activeOpacity={0.8}
			style={{ width: '100%' }}
			onPress={_ => {
				if (!disabled && !selected)
					props.setSelected(props.selectable.value)
			}}
		>
			<TView alignItems='center' style={{ display: 'flex', flexDirection: 'row', margin: 12 }}>

				<TView borderColor={color} style={{ borderWidth: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 999, width: 18, height: 18 }}>
					<TView backgroundColor={selected ? color : 'transparent'} style={{ borderRadius: 999, width: 9, height: 9 }}>

					</TView>
				</TView>

				<TView style={{ marginLeft: 12 }}>
					<TText color='text' style={{ fontSize: 16, lineHeight: 24, fontWeight: props.hasInlineDescription ? 'normal' : 'normal' }}>
						{props.selectable.label} <TText style={{ fontWeight: 'normal', color: "#777" }}>    {props.selectable.inlineDescription}</TText>
					</TText>

					{
						props.selectable.description ?
							<TText style={{ marginTop: 2, color: '#888' }}>
								{props.selectable.description}
							</TText>
							:
							<></>
					}
				</TView>
			</TView>
		</TTouchableOpacity>
	)
}

export default RadioSelectables
