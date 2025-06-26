<script lang="ts">
  import FilmFrame from './FilmFrame.svelte';
  export let rules: string[] = [];
  export let onReroll: (idx: number) => void = (idx) => {};
</script>

<div class="film-strip" tabindex="0" aria-label="Film strip of rules">
  {#each rules as rule, i}
    <FilmFrame {rule} onReroll={() => onReroll(i)} />
  {/each}
</div>

<style>
.film-strip {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 24px 0;
  background: #222;
  border-radius: 12px;
  scrollbar-width: thin;
  scrollbar-color: #d4af37 #222;
}
.film-strip:focus {
  outline: 2px solid #d4af37;
}
</style> 