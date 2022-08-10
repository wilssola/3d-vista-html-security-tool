import { render } from '@testing-library/react';

import { Main } from './index';

test('Greetings should renders', () => {
  const { getByText, getByAltText } = render(<Main />);

  expect(
    getByText('3D VISTA HTML SECURITY TOOL')
  ).toBeTruthy();
})
