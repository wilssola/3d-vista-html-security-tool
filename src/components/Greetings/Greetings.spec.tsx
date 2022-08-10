import { render } from '@testing-library/react';

import { Greetings } from './index';

test('Greetings should renders', () => {
  const { getByText, getByAltText } = render(<Greetings />);

  expect(
    getByText('3D VISTA HTML SECURITY TOOL')
  ).toBeTruthy();
})
