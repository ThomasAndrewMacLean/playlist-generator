<script lang="ts">
  import Login from "./lib/Login.svelte";
  import Sentence from "./lib/Sentence.svelte";
  import { getAccesTokenFromHash } from "./utils";

  let token: string = getAccesTokenFromHash(document.location.hash);
</script>

<main>
  <h1>Generate your Playlist with a secret message</h1>

  <div class="card">
    {#if token}
      <Sentence />
    {:else}
      <Login />
    {/if}
  </div>
</main>

<style>
  @media screen and (max-width: 600px) {
    h1 {
      font-size: 36px;
    }
  }
</style>
