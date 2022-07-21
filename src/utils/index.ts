export const getAccesTokenFromHash = (hash: string): string => {
  // document.location.hash = '#access_token=1234567890&token_type=bearer&expires_in=3600';
  const hashParams = new URLSearchParams(hash.substr(1));
  const accessToken = hashParams.get("access_token");
  return accessToken;
};
