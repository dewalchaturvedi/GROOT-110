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
export const apiRequest = async (url, device, key='', signal) => {
  tempPsiId += 1;
  // let apiUrl = 'http://localhost:5000/api/pageVitals/generateLocalLighHouse/';
 let apiUrl = 'http://172.16.3.49:32724/api/pageVitals/generateLocalLighHouse/';
  const { data } = await axios(`${apiUrl}?url=${encodeURIComponent(addtempPsiIdToUrl(url))}&strategy=${device}&key=${key}&category=performance`);
  return data;
};
