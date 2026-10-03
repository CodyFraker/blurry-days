import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ViewfinderFrame } from './ViewfinderFrame';

describe('ViewfinderFrame', () => {
	it('renders children and optional frame number', () => {
		render(
			<ViewfinderFrame frameNumber="01">
				<img src="/test.jpg" alt="Preview" />
			</ViewfinderFrame>
		);

		expect(screen.getByAltText('Preview')).toBeInTheDocument();
		expect(screen.getByText('01')).toBeInTheDocument();
	});
});
