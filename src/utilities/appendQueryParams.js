export const appendQueryParams = (url, params = "") => {
  if (!params) return url;
  return url + (url.includes("?") ? "&" : "?") + params;
};
