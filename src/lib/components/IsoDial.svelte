<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	export let isoValues: (number | 'PROGRAM')[] = [100, 200, 400, 800, 1600, 'PROGRAM'];
	export let value: number | 'PROGRAM' = isoValues[0];

	let rotation = 0;
	let active = false;
	let dialElement: HTMLElement;
	let startAngle = 0;
	let currentAngle = 0;

	const dispatch = createEventDispatcher();

	const angles = isoValues.map((_, i) => (i / isoValues.length) * 360);

	function getAngle(event: MouseEvent | TouchEvent) {
		const dialRect = dialElement.getBoundingClientRect();
		const centerX = dialRect.left + dialRect.width / 2;
		const centerY = dialRect.top + dialRect.height / 2;
		const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
		const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
		const radians = Math.atan2(clientY - centerY, clientX - centerX);
		return (radians * 180) / Math.PI + 90; // offset by 90 to make top 0 deg
	}

	function handleInteractionStart(event: MouseEvent | TouchEvent) {
		event.preventDefault();
		active = true;
		startAngle = getAngle(event) - currentAngle;
		window.addEventListener('mousemove', handleInteractionMove);
		window.addEventListener('touchmove', handleInteractionMove);
		window.addEventListener('mouseup', handleInteractionEnd);
		window.addEventListener('touchend', handleInteractionEnd);
	}

	function handleInteractionMove(event: MouseEvent | TouchEvent) {
		if (!active) return;
		event.preventDefault();
		const angle = getAngle(event);
		currentAngle = angle - startAngle;
		rotation = currentAngle;

        // Snap to closes angle
        const closestAngle = angles.reduce((prev, curr) => {
			return (Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev);
		});

        const snappedRotation = (closestAngle + 360) % 360;
        rotation = snappedRotation;

		const selectedIndex = angles.indexOf(closestAngle);
		if (selectedIndex !== -1) {
			value = isoValues[selectedIndex];
			dispatch('change', { value: value, index: selectedIndex });
		}
	}

	function handleInteractionEnd() {
		active = false;
		window.removeEventListener('mousemove', handleInteractionMove);
		window.removeEventListener('touchmove', handleInteractionMove);
		window.removeEventListener('mouseup', handleInteractionEnd);
		window.removeEventListener('touchend', handleInteractionEnd);

        const closestAngle = angles.reduce((prev, curr) => {
			return (Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev);
		});

        const snappedRotation = (closestAngle + 360) % 360;
        rotation = snappedRotation;

		const selectedIndex = angles.indexOf(closestAngle);
		if (selectedIndex !== -1) {
			value = isoValues[selectedIndex];
			dispatch('change', { value: value, index: selectedIndex });
		}
	}

	onDestroy(() => {
		if (active) {
			window.removeEventListener('mousemove', handleInteractionMove);
			window.removeEventListener('touchmove', handleInteractionMove);
			window.removeEventListener('mouseup', handleInteractionEnd);
			window.removeEventListener('touchend', handleInteractionEnd);
		}
	});

	function handleKeyDown(event: KeyboardEvent) {
		const currentIndex = isoValues.indexOf(value);
		let nextIndex = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
			nextIndex = (currentIndex + 1) % isoValues.length;
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
			nextIndex = (currentIndex - 1 + isoValues.length) % isoValues.length;
		}

		if (nextIndex !== -1) {
			value = isoValues[nextIndex];
			rotation = angles[nextIndex];
			dispatch('change', { value: value, index: nextIndex });
		}
	}

	$: numericIsoValues = isoValues.filter((v) => typeof v === 'number') as number[];
	$: minIso = Math.min(...numericIsoValues);
	$: maxIso = Math.max(...numericIsoValues);
</script>

<div
	class="iso-dial-container"
	bind:this={dialElement}
	on:mousedown={handleInteractionStart}
	on:touchstart={handleInteractionStart}
	on:keydown={handleKeyDown}
	role="slider"
	aria-valuenow={typeof value === 'number' ? value : undefined}
	aria-valuetext={value === 'PROGRAM' ? 'Program Mode' : undefined}
	aria-valuemin={minIso}
	aria-valuemax={maxIso}
	tabindex="0"
>
	<div class="dial" style="transform: rotate({rotation}deg);">
		<svg viewBox="0 0 200 200" width="200" height="200" class="dial-svg">
			<!-- Knurled edge -->
			<defs>
				<radialGradient id="metal" cx="50%" cy="50%" r="50%">
					<stop offset="0%" stop-color="#444" />
					<stop offset="100%" stop-color="#111" />
				</radialGradient>
			</defs>
			<circle cx="100" cy="100" r="98" fill="url(#metal)" stroke="#888" stroke-width="2" />
			<!-- Knurl effect -->
			<g class="knurl">
				{#each Array(60) as _, i}
					<rect
						x="98.5"
						y="0"
						width="3"
						height="10"
						rx="1.5"
						fill="#bbb"
						stroke="#222"
						stroke-width="0.5"
						transform="rotate({i * 6} 100 100)"
					/>
				{/each}
			</g>
			<!-- Dial face -->
			<circle cx="100" cy="100" r="85" fill="#181818" stroke="#444" stroke-width="2" />

			<!-- Ticks -->
			{#each isoValues as _, i}
				<line
					x1="100"
					y1="15"
					x2="100"
					y2="25"
					stroke="#fff"
					stroke-width="2"
					transform="rotate({(i / isoValues.length) * 360} 100 100)"
				/>
			{/each}
            <!-- Pointer -->
			<polygon points="95,15 105,15 100,25" fill="#ffd700" />

		</svg>
	</div>
    <div class="dial-center vintage">
        <span class="current-value">{value}</span>
    </div>
    <div class="fixed-labels">
        {#each isoValues as iso, i}
            <div class="label" style="transform: rotate({(i/isoValues.length) * 360}deg) translate(0, -110px) rotate({-(i/isoValues.length) * 360}deg)">
                {#if typeof iso === 'string'}
                    <span class="program-label">{iso}</span>
                {:else}
                    <span>{iso}</span>
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
	.iso-dial-container {
		position: relative;
		width: 250px;
		height: 250px;
		margin: 2rem auto;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: grab;
		border-radius: 50%;
	}
	.iso-dial-container:active {
		cursor: grabbing;
	}
	.iso-dial-container:focus {
		outline: 2px solid #ffd700;
	}
	.dial {
		position: absolute;
		width: 200px;
		height: 200px;
		transition: transform 0.2s ease-out;
		border-radius: 50%;
	}
	.dial-svg {
		width: 100%;
		height: 100%;
	}
	.dial-center {
		position: absolute;
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, #a0522d 0%, #8b4513 100%);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-size: 1.8rem;
		font-weight: bold;
		font-family: 'Oswald', 'Courier New', monospace;
		border: 4px solid #4a2a0d;
		box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
		z-index: 10;
        pointer-events: none;
	}
    .fixed-labels {
        position: absolute;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
    .label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: 0 0;
        font-family: 'Oswald', 'Courier New', monospace;
        font-size: 1rem;
        color: #ccc;
    }
    .program-label {
        color: #00ff7f;
        font-size: 0.9rem;
    }
</style> 