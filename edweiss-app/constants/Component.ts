
import React from 'react';

type ReactComponent<P> = React.FC<Readonly<P>>

export type ReactPage = React.FC<{}>

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>

export default ReactComponent
