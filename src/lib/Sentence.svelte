<script lang="ts">
  import { getAccesTokenFromHash } from "../utils";

  let playlistUrl: string = "";
  let sentence: string =
    "Hi, I would like to ask you: how are you doing today?";

  const removeNonAlphabeticalCharacters = (str: string) =>
    str.replace(/[^a-zA-Z]/g, "");

  const searchAPI = "https://api.spotify.com/v1/search";
  const generatePlaylist = async () => {
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
          )?.uri || d.tracks.items[0].uri
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
            name: "Vite + Svelte",
            description: "A playlist created with Vite + Svelte",
            public: true,
          }),
        }
      );
      const newPlaylistJSON = await newPlaylist.json();
      console.log(newPlaylistJSON);
      const playlistId = newPlaylistJSON.id;
      const playlistURI = newPlaylistJSON.uri;
      playlistUrl = playlistURI;

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
    }
  };
</script>

<section>
  <form
    on:submit={(e) => {
      e.preventDefault();
      generatePlaylist();
    }}
  >
    <input bind:value={sentence} type="text" />
    <button>Generate</button>

    {#if playlistUrl}
      <a href={playlistUrl} target="_blank"> Open playlist </a>
    {/if}
  </form>
</section>
