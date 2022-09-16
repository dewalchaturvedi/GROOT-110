import { uniquePsiDummyString } from "../constants/universal";

const removeTempPsiIdFromUrl = (url) => {
  if (url.includes(`?${uniquePsiDummyString}`)) {
    return url.split(`?${uniquePsiDummyString}`)[0];
  } else if (url.includes(`&${uniquePsiDummyString}`)) {
    return url.split(`&${uniquePsiDummyString}`)[0];
  }
  return url;
}

export default removeTempPsiIdFromUrl;