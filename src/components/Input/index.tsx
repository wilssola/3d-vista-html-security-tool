import { InputHTMLAttributes } from 'react';

import { Container } from './styles';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input (props: InputProps) {
  return <Container {...props} />;
}
