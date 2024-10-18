
import React from 'react';

type ReactComponent<P> = React.FC<Readonly<P>>;

export type ApplicationRoute = React.FC<{}>;

export type ApplicationLayout = React.FC<{}>;

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export type ClassName = React.HTMLAttributes<HTMLDivElement>["className"];

export default ReactComponent;
