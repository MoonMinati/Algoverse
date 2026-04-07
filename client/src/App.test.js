import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('d3', () => ({
  scaleLinear: () => ({
    domain: () => ({
      range: () => (value) => value
    })
  })
}));

test('renders algoverse heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1, name: /algoverse/i })).toBeInTheDocument();
});
