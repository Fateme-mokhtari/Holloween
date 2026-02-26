import { render, screen } from '@testing-library/react';
import TopMenu from './TopMenu';



describe('TopMenu', () => {
  test('renders without crashing', () => {
    const { container } = render(<TopMenu />);
    expect(container).toBeInTheDocument();
  });

  test('renders Scare zones logo', () => {
    render(<TopMenu />);
    expect(screen.getByText(/Scare zones/i)).toBeInTheDocument();
  });

  test('renders logo text exactly once', () => {
    render(<TopMenu />);
    expect(screen.getAllByText(/Scare zones/i)).toHaveLength(1);
  });

  test('logo text is visible to users', () => {
    render(<TopMenu />);
    expect(screen.getByText(/Scare zones/i)).toBeVisible();
  });
});