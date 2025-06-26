<script>
  export let rule;
  export let onReroll = () => {};
  let animating = false;

  function reroll() {
    animating = true;
    setTimeout(() => {
      animating = false;
      onReroll();
    }, 500); // Animation duration
  }
</script>

<button class="film-frame" aria-label="Reroll rule" on:click={reroll} disabled={animating}>
  <svg viewBox="0 0 220 320" width="220" height="320" class="frame-svg">
    <!-- Film border -->
    <rect x="0" y="0" width="220" height="320" rx="8" fill="#222" stroke="#d4af37" stroke-width="3"/>
    <!-- Perforations (top and bottom) -->
    {#each Array(8) as _, i}
      <rect x={10 + i*26} y="6" width="14" height="16" rx="2" fill="#fff"/>
      <rect x={10 + i*26} y="298" width="14" height="16" rx="2" fill="#fff"/>
    {/each}
    <!-- Frame area -->
    <rect x="18" y="28" width="184" height="264" rx="4" fill="#bbb"/>
  </svg>
  <span class="rule-text">{rule}</span>
  {#if animating}
    <span class="shutter"></span>
  {/if}
</button>

<style>
.film-frame {
  position: relative;
  width: 220px;
  height: 320px;
  background: none;
  border: none;
  padding: 0;
  margin: 0 8px;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.frame-svg {
  position: absolute;
  top: 0; left: 0;
  z-index: 1;
}
.rule-text {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 160px;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #222;
  font-size: 1.1rem;
  text-align: center;
  font-family: 'Courier New', Courier, monospace;
  pointer-events: none;
}
.shutter {
  position: absolute;
  top: 28px;
  left: 18px;
  width: 184px;
  height: 264px;
  background: #111;
  opacity: 0.92;
  z-index: 3;
  animation: shutter 0.5s linear;
  border-radius: 4px;
}
@keyframes shutter {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}
</style> 