<script lang="ts">
  const CLIENT_ID = "ae7bb19fe4ae439f85994652dc206122";
  const REDIRECT_URL = "https://playlist.thomasmaclean.be";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPE = "playlist-modify-public";
  let loginLink: string = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;
</script>

<a href={loginLink}> Login </a>
