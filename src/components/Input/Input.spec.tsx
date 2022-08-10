import { render } from '@testing-library/react';
import { Input } from './index';

test('Button should renders', () => {
  const { getByText } = render(<Input>InputContent</Input>);

  expect(getByText('InputContent')).toBeTruthy();
  expect(getByText('InputContent')).toHaveAttribute('type', 'text');
})
