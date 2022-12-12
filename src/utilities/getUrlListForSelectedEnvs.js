import { appendQueryParams } from "./appendQueryParams";

export const getUrlListForSelectedEnvs = (urlListCsv, performanceEnvs) => {
  if (!urlListCsv.length) return "";
  const urlListArray = urlListCsv.split(",");

  let finalUrlList = [];
  Object.keys(performanceEnvs).forEach((env) => {
    const envState = performanceEnvs[env];
    if (envState.selected) {
      finalUrlList = [
        ...finalUrlList,
        ...urlListArray.map((url) =>
          appendQueryParams(url, envState.queryString)
        ),
      ];
    }
  });

  let finalUrlListCsv = finalUrlList.join(",");
  return finalUrlListCsv;
};
