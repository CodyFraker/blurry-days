import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ViewfinderFrame } from './ViewfinderFrame';

describe('ViewfinderFrame', () => {
	it('renders children inside the frame', () => {
		const { container } = render(
			<ViewfinderFrame frameNumber="01">
				<img src="/test.jpg" alt="Preview" />
			</ViewfinderFrame>
		);

		expect(container.querySelector('img[alt="Preview"]')).toBeInTheDocument();
	});
});
