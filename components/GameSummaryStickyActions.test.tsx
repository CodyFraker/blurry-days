import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { GameSummaryStickyActions } from './GameSummaryStickyActions';

describe('GameSummaryStickyActions', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders sticky generate button with safe-area padding', () => {
		const { container } = render(
			<GameSummaryStickyActions isGenerating={false} onGenerate={vi.fn()} />
		);

		const wrapper = container.firstChild as HTMLElement;
		expect(wrapper.className).toMatch(/fixed/);
		expect(wrapper.className).toMatch(/sm:hidden/);
		expect(wrapper.className).toMatch(/safe-area-inset-bottom/);

		expect(screen.getByRole('button')).toBeEnabled();
	});

	it('disables button while generating', () => {
		const { container } = render(<GameSummaryStickyActions isGenerating={true} onGenerate={vi.fn()} />);

		expect(container.querySelector('button[disabled]')).toBeTruthy();
	});
});
