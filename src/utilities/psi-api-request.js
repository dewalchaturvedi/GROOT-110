import axios from "axios";
import { ENDPOINT, uniquePsiDummyString } from "../constants/universal";

let tempPsiId = 0;
const addtempPsiIdToUrl = (url) => {
  if (url.includes('?')) {
    return `${url}&${uniquePsiDummyString}=${tempPsiId}`;
  }
  return `${url}?${uniquePsiDummyString}=${tempPsiId}`;
}

// Custom function to request PageSpeed API
export const apiRequest = async (url, device, key='') => {
  tempPsiId += 1;
  const { data } = await axios(`${ENDPOINT}?url=${encodeURIComponent(addtempPsiIdToUrl(url))}&strategy=${device}&key=${key}`);
  return data;
};
