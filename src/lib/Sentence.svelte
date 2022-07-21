<script lang="ts">
  import { getAccesTokenFromHash } from "../utils";

  let playlistUrl: string = "";
  let playlistId: string = "";

  let playlistTitle: string = "";
  let externalUrl: string = "";
  let isReady: boolean = false;
  let loading: boolean = false;
  let sentence: string = "";

  const removeNonAlphabeticalCharacters = (str: string) =>
    str.replace(/[^a-zA-Z]/g, "");

  const searchAPI = "https://api.spotify.com/v1/search";
  const generatePlaylist = async () => {
    loading = true;
    const token = getAccesTokenFromHash(document.location.hash);
    const words = sentence.split(" ");
    if (token) {
      //https://api.spotify.com/v1/me
      const me = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const meJSON = await me.json();

      const userId = meJSON.id;
      const headers = new Headers();
      headers.append("Authorization", `Bearer ${token}`);
      const params = new URLSearchParams();
      params.append("type", "track");
      params.append("limit", "50");

      const requests = words.map((word) => {
        return new Request(
          `${searchAPI}?${params}&q=track:${encodeURI(
            removeNonAlphabeticalCharacters(word)
          )}`,
          {
            method: "GET",
            headers,
          }
        );
      });

      const responses = await Promise.all(
        requests.map((request) => fetch(request))
      );
      const data = await Promise.all(
        responses.map((response) => response.json())
      );
      const ids = data.map(
        (d, i) =>
          d.tracks.items.find(
            (t) =>
              removeNonAlphabeticalCharacters(t.name)
                .toLowerCase()
                .slice(
                  0,
                  Math.min(removeNonAlphabeticalCharacters(words[i]).length, 5)
                ) ===
              removeNonAlphabeticalCharacters(words[i])
                .toLowerCase()
                .slice(
                  0,
                  Math.min(removeNonAlphabeticalCharacters(words[i]).length, 5)
                )
          )?.uri ||
          d.tracks.items[0]?.uri ||
          "spotify:track:1VypWHiTxUHNJKYNY6pY9n"
      );

      // create playlist;
      const newPlaylist = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistTitle,
            description: "A playlist created with Vite + Svelte",
            public: true,
          }),
        }
      );
      const newPlaylistJSON = await newPlaylist.json();
      playlistId = newPlaylistJSON.id;
      const playlistURI = newPlaylistJSON.uri;
      playlistUrl = playlistURI;
      externalUrl = newPlaylistJSON.external_urls.spotify;
      const addToPlaylist = await fetch(
        `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: ids,
          }),
        }
      );
      const addToPlaylistJSON = await addToPlaylist.json();
      setTimeout(() => {
        loading = false;
        isReady = true;
      }, 3000);
    }
  };
</script>

<section>
  {#if loading}
    <div class="loading">
      <h2>Generating your playlist</h2>
      <div class="lds-ring">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  {/if}

  {#if isReady}
    <a href={playlistUrl} target="_blank"> Open playlist </a>

    <br /> <br />
    <button
      on:click={() => {
        //reload the page
        location.reload();
      }}>Or redo</button
    >
    <br />
    <br />

    <iframe
      title="playlist"
      style="border-radius:12px"
      src="https://open.spotify.com/embed/playlist/{playlistId}?utm_source=generator"
      width="100%"
      height="380"
      frameBorder="0"
      allowfullscreen={true}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    />
  {:else}
    <form
      on:submit={(e) => {
        e.preventDefault();
        generatePlaylist();
      }}
    >
      <div class="wrap">
        <label for="title">Title of your playlist</label>
        <input bind:value={playlistTitle} type="text" id="title" name="title" />
      </div>
      <div class="wrap">
        <label for="sentence">Secret message</label>
        <input
          bind:value={sentence}
          type="text"
          id="sentence"
          name="sentence"
        />
      </div>
      <button disabled={!sentence || !playlistTitle}>Generate</button>
    </form>
  {/if}
</section>

<style>
  form {
    width: 90%;
    margin: auto;
    max-width: 400px;
  }
  @media screen and (max-width: 600px) {
    form {
      max-width: initial;
    }
  }
  .wrap {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1.2rem;
  }
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    height: 100vh;
    position: absolute;
    background: #1db954;
    inset: 0;
  }
  .loading h2 {
    margin-right: 2rem;
  }
  .lds-ring {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
  }
  .lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 51px;
    height: 51px;
    margin: 6px;
    border: 6px solid #fff;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #fff transparent transparent transparent;
  }
  .lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
  }
  .lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
  }
  .lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
  }
  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
