import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DrinkLegend } from './DrinkLegend';

describe('DrinkLegend', () => {
	it('lists drink levels', () => {
		render(<DrinkLegend />);
		expect(screen.getByText('Sip')).toBeInTheDocument();
		expect(screen.getByText('Shot')).toBeInTheDocument();
	});
});
