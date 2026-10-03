import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LogoMark } from './LogoMark';

describe('LogoMark', () => {
	it('renders decorative svg', () => {
		const { container } = render(<LogoMark />);
		expect(container.querySelector('svg')).toBeTruthy();
	});
});
