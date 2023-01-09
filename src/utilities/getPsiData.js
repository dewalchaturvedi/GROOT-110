import moment from "moment/moment";
import { MAX_PARALLEL_REQ_COUNT } from "../constants/universal";
import { chunkArray } from "./chunkArray";
import { median } from "./medianMath";
import calcAverage from './calcAverage';
import { apiRequest } from "./psi-api-request";
import removeTempPsiIdFromUrl from "./removeTempPsiIdFromUrl";
import sleep from "./sleep";
import { addRow } from "./firebaseUtils";
import { collection, getFirestore } from 'firebase/firestore';
const sampleResponse = require("../constants/sample-response.json");
const useSampleResponse = false;

// Reduce labDataRes array to calcualte median/average for the same URLs in array
function reduceResults(calculatorFn, resArray, iterationNum) {
  // Collect analysed URLs in set
  const seen = new Set();
  
  const calculatedMetrices = resArray.reduce((acc, cur, index, labArray) => {
    if (!seen.has(cur.testUrl)) {
      // Add URL to seen list
      seen.add(cur.testUrl);

      // Filter same URLs from results
      const sameUrl = labArray.filter((obj) => obj.testUrl === cur.testUrl);
      const sameUrlRoundChunks = chunkArray(sameUrl, iterationNum);

      sameUrlRoundChunks.forEach((sameUrlRoundChunk) => {
        // Create object with the same properties but calculating the median/average value per url per round
        const calculatedObj = {
          testUrl: cur.testUrl,
          PerformanceScore: calculatorFn(
            sameUrlRoundChunk.map(({ PerformanceScore }) => PerformanceScore)
          ),
          TTFB: calculatorFn(sameUrlRoundChunk.map(({ TTFB }) => TTFB)),
          labFCP: calculatorFn(sameUrlRoundChunk.map(({ labFCP }) => labFCP)),
          labLCP: calculatorFn(sameUrlRoundChunk.map(({ labLCP }) => labLCP)),
          labCLS: calculatorFn(sameUrlRoundChunk.map(({ labCLS }) => labCLS)),
          TTI: calculatorFn(sameUrlRoundChunk.map(({ TTI }) => TTI)),
          speedIndex: calculatorFn(sameUrlRoundChunk.map(({ speedIndex }) => speedIndex)),
          TBT: calculatorFn(sameUrlRoundChunk.map(({ TBT }) => TBT)),
          // thirdPartySummary: calculatorFn(sameUrlRoundChunk.map(({ thirdPartySummary }) => thirdPartySummary)),
          labMaxFID: calculatorFn(sameUrlRoundChunk.map(({ labMaxFID }) => labMaxFID)),
          // mainThread: calculatorFn(sameUrlRoundChunk.map(({ mainThread }) => mainThread)),
          // scriptEvaluation: calculatorFn(sameUrlRoundChunk.map(({ scriptEvaluation }) => scriptEvaluation)),
          // paintCompositeRender: calculatorFn(sameUrlRoundChunk.map(({ paintCompositeRender }) => paintCompositeRender)),
          // styleLayout: calculatorFn(sameUrlRoundChunk.map(({ styleLayout }) => styleLayout)),
          // other: calculatorFn(sameUrlRoundChunk.map(({ other }) => other)),
          // parseHTML: calculatorFn(sameUrlRoundChunk.map(({ parseHTML }) => parseHTML)),
          // scriptParseCompile: calculatorFn(sameUrlRoundChunk.map(({ scriptParseCompile }) => scriptParseCompile)),
          // garbageCollection: calculatorFn(sameUrlRoundChunk.map(({ garbageCollection }) => garbageCollection)),
          pageSize: calculatorFn(sameUrlRoundChunk.map(({ pageSize }) => pageSize)),
          
          firstPartyJSTransfer: calculatorFn(sameUrlRoundChunk.map(({ firstPartyJSTransfer }) => firstPartyJSTransfer)),
          firstPartyJSResource: calculatorFn(sameUrlRoundChunk.map(({ firstPartyJSResource }) => firstPartyJSResource)),
          thirdPartyJSTransfer: calculatorFn(sameUrlRoundChunk.map(({ thirdPartyJSTransfer }) => thirdPartyJSTransfer)),
          thirdPartyJSResource: calculatorFn(sameUrlRoundChunk.map(({ thirdPartyJSResource }) => thirdPartyJSResource)),
          date: moment().format("YYYY-MM-DD HH:mm"),
          benchmarkIndex: calculatorFn(sameUrlRoundChunk.map(({ benchmarkIndex }) => benchmarkIndex)),
        };
        
        // Push to accumulator
        acc.push(calculatedObj);
      });
    }

    // Return accumulator
    return acc;
  }, []);
  return calculatedMetrices;
}

function objListFieldSum(objList, field) {
  // results in Mb
  return objList.reduce((accum, currentValue) => accum + currentValue[field], 0)/1000;
}

function getJSDetails(networkRequestsItems) {
  const jsItemsSuccessful = networkRequestsItems.filter(item => item.statusCode === 200 && item.mimeType.includes('javascript'));
  const firstPartyJS = jsItemsSuccessful.filter(item => item.url.includes('universal'));
  const thirdPartyJS = jsItemsSuccessful.filter(item => !item.url.includes('universal'));

  const result = {
    firstParty: {
      transferSize: objListFieldSum(firstPartyJS, 'transferSize'),
      resourceSize: objListFieldSum(firstPartyJS, 'resourceSize'),
    },
    thirdParty: {
      transferSize: objListFieldSum(thirdPartyJS, 'transferSize'),
      resourceSize: objListFieldSum(thirdPartyJS, 'resourceSize'),
    }
  }
  return result;
}

const getSpeedData = async ({
  iterationNum,
  urlListCSV = "",
  round = "1",
  device = "mobile", // desktop
  setMobileTestScores,
  setDesktopTestScores,
  setMobileMedianScores,
  setDesktopMedianScores,
  setMobileAverageScores,
  setDesktopAverageScores,
  setMobileOriginFieldData,
  setDesktopOriginFieldData,
  setSnackBar,
  apiKey='',
  setSuccessCount,
  setErrorCount,
  setTotalUrlCount,
  setProgress,
  setQueueCount,
}) => {
  setMobileTestScores([]);
  setDesktopTestScores([]);
  setMobileMedianScores([]);
  setDesktopMedianScores([]);
  setMobileAverageScores([]);
  setDesktopAverageScores([]);
  setSuccessCount({mobile: 0, desktop: 0});
  setErrorCount({mobile: 0, desktop: 0});
  setProgress(0);
  setQueueCount({mobile: 0, desktop: 0});

  // await sleep(60000 * 15);
  // console.log(' ====== slept for 30 min ======== ');

  const startDateTime = new Date();
  const startTimeStamp = startDateTime.getTime();
  const _round = Number.parseInt(round, 10);
  const devices = device.split(",");
  const _MAX_PARALLEL_REQ_COUNT = MAX_PARALLEL_REQ_COUNT/devices.length;
  // Get URL List
  const resultObj = { mobile: {}, desktop: {} };
  const urlList = urlListCSV.split(",");
  const reqCountPerUrl = iterationNum * _round;
  let firestore = getFirestore();
  let dbCollection = collection(firestore,"/psi-99");
  const totalReqCount = urlList.length * reqCountPerUrl * devices.length;
  let totalSuccessCount = 0;
  setTotalUrlCount(totalReqCount);
  let stopExecution = false;
  // const totalSuccessReq = 0;

  // const urlReqObj = {};
  // urlList.forEach((url) => {
  //   urlReqObj[url] = { lab: reqCountPerUrl, field: 0 };
  // });
  devices.forEach(async (device,j) => {
    await new Promise((r) => setTimeout(r, j*2500));
    stopExecution = false;

    setSnackBar((snackBar) => ({...snackBar, open: true, message: `Fetching scores for ${urlList.length} URLs, ${_round} rounds of ${iterationNum} iterations for ${device}`, type: 'info'}))

    let allReqUrls = Array(reqCountPerUrl).fill(urlList).flat();

    const splitChunks = allReqUrls.length / _MAX_PARALLEL_REQ_COUNT;
    console.log(
      `The set of urls has been split up in ${Math.ceil(splitChunks)} chunk/s`
    );

    // Holding arrays for results
    const labDataRes = [];
    const labResErrors = [];
    const retryList = [];
    const fieldDataRes = [];
    const fieldOriginRes = [];
    const fieldOriginDomain = new Set();
    let retryCount = 0;
    const retryCountMax = 10;
    let queriesPerMinuteLimitReached = false;
    let queriesPerDayLimitReached = false;

    const getMainThreadDetails = (labAudit) => {
      const mainThreadDetails = {
        scriptEvaluation: 0,
        paintCompositeRender: 0,
        styleLayout: 0,
        other: 0,
        parseHTML: 0,
        scriptParseCompile: 0,
        garbageCollection: 0,
      };
      labAudit["mainthread-work-breakdown"].details.items.forEach((item) => {
        mainThreadDetails[item.group] = item.duration;
      });
      return mainThreadDetails;
    };

    const getThirdPartySummary = (labAudit) => {
      let thirdPartyBlockingTime = 0;
      labAudit["third-party-summary"].details.items.forEach(
        (item) => (thirdPartyBlockingTime += item.blockingTime)
      );
      return thirdPartyBlockingTime;
    };

    while (allReqUrls.length) {
      // console.log('debug ======= allReqUrls.length', allReqUrls.length)
      if (retryCount !== 0) {
        console.log(`Retrying ${allReqUrls.length} urls`);
        setSnackBar((snackBar) => ({...snackBar, open: true, message: `Retrying ${allReqUrls.length} urls`, type: 'info'}))
      }
      if (retryCount > retryCountMax) {
        console.log(
          "Retry count reached 10. I am tired, let me rest for a bit."
        );
        setSnackBar((snackBar) => ({...snackBar, open: true, message: `Retry count reached 10. I am tired, let me rest for a bit.`, type: 'warning'}))
        stopExecution = true;
        break;
      }
      if (stopExecution) {
        break;
      }
      retryCount += 1;
      const tempRetryList = [];
      // Break URL list into chunks to prevent API errors
      const chunks = chunkArray(allReqUrls, _MAX_PARALLEL_REQ_COUNT);
      // console.log('chunks ============== \n', chunks);
      // Loop through chunks
      for (let [i, chunk] of chunks.entries()) {
        // console.log('debug ======= for loop chunk device', device);
        // console.log('debug ======= re-setting queriesPerDayLimitReached');
        queriesPerMinuteLimitReached = false;
        queriesPerDayLimitReached = false;

        if (stopExecution) {
          break;
        }
 
        // Iterate through list of URLs within chunk
        // for (let _round = 0; _round < iterationNum; _round++) {
        // Log _round of testing
        console.log(`Testing chunk #${i + 1}`);

        // console.log('chunk ================== \n', chunk);
        // Loop trough array to create batch of promises (array)
        const promises = chunk.map(async(testUrl, i) => {
          await new Promise((r) => setTimeout(r, i*250));
          if (useSampleResponse) {
            return Promise.resolve(sampleResponse);
          }
          return  apiRequest(testUrl, device, apiKey)
         });

        // console.log('chunk ', chunk);

        // Send all requests in parallel
        // console.log(`debug ======= before rawBatchResults ${new Date()} device ${device}`);
        const rawBatchResults = await Promise.allSettled(promises);
        // console.log(`debug ======= after rawBatchResults ${new Date()} device ${device}`);

        // Iterate through API responses
        let chunkSuccessCount = 0;
        let chunkErrorCount = 0;
        const results = rawBatchResults.map((res, index) => {
          if (res.status === "fulfilled") {
            chunkSuccessCount += 1;
            totalSuccessCount += 1;
            // console.log(`debug ======= chunkSuccessCount ${ chunkSuccessCount}, device ${device}`);
            console.log("response 0 ", chunk[index], res);
            // Variables to make extractions easier
            const fieldMetrics = res.value?.originLoadingExperience?.metrics;
            const originFallback = res.value?.loadingExperience?.origin_fallback;
            const labAudit = res.value?.lighthouseResult?.audits;
            const benchmarkIndex = res.value?.lighthouseResult?.environment?.benchmarkIndex;

            // If it's the 1st _round of testing & test results have field data (CrUX)
            if (fieldMetrics &&  _round === 1) {
              // Extract Field metrics (if there are)
              const fieldFCP =
                fieldMetrics.FIRST_CONTENTFUL_PAINT_MS?.percentile ?? 'no data';
              const fieldFID =
                fieldMetrics.FIRST_INPUT_DELAY_MS?.percentile ?? 'no data';
              const fieldLCP =
                fieldMetrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile ??
                'no data';
              const fieldCLS =
                fieldMetrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ??
                'no data';
              const fieldTTI =
                fieldMetrics?.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile ??  
                'no data';


              // Construct FieldResult object
              const fieldResObj = {
                testUrl: res.value.originLoadingExperience.id,
                fieldFCP: fieldFCP,
                fieldFID: fieldFID,
                fieldLCP: fieldLCP,
                fieldCLS: fieldCLS / 100,
                TTI:fieldTTI,
                date: moment().format('YYYY-MM-DD HH:mm'),
              };
              // Push to fieldRes array
              fieldDataRes.push(fieldResObj);
            }
            if (device === "mobile") {
              setMobileOriginFieldData([...fieldDataRes])
            }
            if (device === "desktop") {
              setDesktopOriginFieldData([...fieldDataRes])
            }
            // Extract Lab metrics
            const testUrl = removeTempPsiIdFromUrl(
              res.value.lighthouseResult.finalUrl
            );
            const PerformanceScore =
              res.value.lighthouseResult.categories.performance.score * 100 ||
              "no data";
            const TTFB = labAudit["server-response-time"].numericValue;
            const TTI =
              labAudit.metrics.details?.items[0].interactive ?? "no data";
            const labFCP =
              labAudit.metrics.details?.items[0].firstContentfulPaint ??
              "no data";
            const labLCP =
              labAudit.metrics.details?.items[0].largestContentfulPaint ??
              "no data";
            const labCLS = parseFloat(
              labAudit["cumulative-layout-shift"].displayValue
            );
            const TBT =
              labAudit.metrics.details?.items[0].totalBlockingTime ?? "no data";
            const labMaxFID =
              labAudit.metrics.details?.items[0].maxPotentialFID ?? "no data";
            const speedIndex =
              labAudit.metrics.details?.items[0].speedIndex ?? "no data";
            const pageSize = parseFloat(
              (labAudit["total-byte-weight"].numericValue / 1000000).toFixed(3)
            );
            const JSDetails = getJSDetails(labAudit["network-requests"].details.items);
            // const mainThread = parseFloat(labAudit['mainthread-work-breakdown'].displayValue.slice(0,-2))
            // const thirdPartySummary = getThirdPartySummary(labAudit);
            // const mainThreadDetails = getMainThreadDetails(labAudit);
            // const scriptEvaluation = mainThreadDetails.scriptEvaluation
            // const paintCompositeRender = mainThreadDetails.paintCompositeRender;
            // const styleLayout = mainThreadDetails.styleLayout;
            // const other = mainThreadDetails.other;
            // const parseHTML = mainThreadDetails.parseHTML;
            // const scriptParseCompile = mainThreadDetails.scriptParseCompile;
            // const garbageCollection = mainThreadDetails.garbageCollection;

            const date = moment().format("YYYY-MM-DD HH:mm");

            // Construct object
            const finalObj = {
              testUrl,
              PerformanceScore,
              TTFB,
              labFCP,
              labLCP,
              labCLS,
              TTI,
              speedIndex,
              TBT,
              labMaxFID,
              pageSize,
              firstPartyJSTransfer: JSDetails.firstParty.transferSize,
              firstPartyJSResource: JSDetails.firstParty.resourceSize,
              thirdPartyJSTransfer: JSDetails.thirdParty.transferSize,
              thirdPartyJSResource: JSDetails.thirdParty.resourceSize,
              // thirdPartySummary,
              // mainThread,
              // scriptEvaluation,
              // paintCompositeRender,
              // styleLayout,
              // other,
              // parseHTML,
              // scriptParseCompile,
              // garbageCollection,
              date,
              device,
              benchmarkIndex,
            };
            return finalObj;
          } else {
            chunkErrorCount += 1;
            // console.log(`debug ======= chunkErrorCount ${ chunkErrorCount}, device ${device}`);
            if (res.reason.response?.data.error.message.includes('API key not valid. Please pass a valid API key.') ||
            res.reason.message.includes('API key not valid. Please pass a valid API key.')) {
              // console.log(`debug ======= invalid api key`);
              setSnackBar((snackBar) => ({...snackBar, open: true, message: `API key not valid. Please pass a valid API key.`, type: 'error'}));
              stopExecution = true;
            } else {
              tempRetryList.push(chunk[index]);
            }
            
            console.log("rejected 0 ", chunk[index], res);
            console.log(`Problem retrieving results for ${chunk[index]}`);
            console.log(
              res.reason.response?.data.error.message ??
                `Connection error: ${res.reason.message}`
            );

            if (
              res.reason.response?.data.error.message.includes(
                "Queries per day"
              ) ||
              res.reason.message.includes("Queries per day")
            ) {
              // console.log('debug ======= setting queriesPerDayLimitReached');
              queriesPerDayLimitReached = true;
            }
            if (
              res.reason.response?.data.error.message.includes(
                "Please wait a while and try again"
              ) ||
              res.reason.message.includes(
                "Please wait a while and try again"
              ) ||
              res.reason.response?.data.error.message.includes(
                "Queries per minute"
              ) ||
              res.reason.message.includes("Queries per minute")
            ) {
              // console.log(`debug ======= Please wait a while or Queries per minute`);
              queriesPerMinuteLimitReached = true;
            }

            labResErrors.push({
              url: chunk[index],
              reason:
                res.reason.response?.data.error.message ??
                `Connection error: ${res.reason.message}`,
            });
            console.log("Response Rejected", res);
          }
        });

        if (stopExecution) {
          break;
        }

        const filteredResults = results.filter((obj) => obj !== undefined);
        if (device === "mobile") {
          setMobileTestScores((prevMobileTestScores) => [
            ...prevMobileTestScores,
            ...filteredResults,
          ]);
          //console.log([...filteredResults]);
        }
        if (device === "desktop") {
          setDesktopTestScores((prevDesktopTestScores) => [
            ...prevDesktopTestScores,
            ...filteredResults,
          ]);
          // console.log("filter", [...filteredResults]);
        }
        // console.log(`debug ======= Successfully fetched scores for ${filteredResults.length} ${device} URLs`);
        setSnackBar((snackBar) => ({...snackBar, open: true, message: `Successfully fetched scores for ${filteredResults.length} ${device} URLs`, type: 'success'}))
        // Push spreaded results to labDataRes array
        labDataRes.push(...results);
        // }

        setSuccessCount(prevSuccessCount => ({...prevSuccessCount, [device]:prevSuccessCount[device]+chunkSuccessCount}));
        setProgress(totalSuccessCount*100/totalReqCount);
        setErrorCount(prevErrorCount => ({...prevErrorCount, [device]:prevErrorCount[device]+chunkErrorCount}));
        setQueueCount(prevQueueCount => ({...prevQueueCount, [device]:tempRetryList.length}));

        if (queriesPerMinuteLimitReached) {
          console.log("That's too much work in a minute, lets take a break.");
          setSnackBar((snackBar) => ({...snackBar, open: true, message: `Per minute limit reached, retrying after a minute`, type: 'warning'}))
          // console.log('Reached Queries per minute limit, waiting for 1 minute');
          await sleep(60000);
        }

        if (queriesPerDayLimitReached) {
          console.log(
            "That's too much work in a day, lets wrap up for the day."
          );
          setSnackBar((snackBar) => ({...snackBar, open: true, message: `Per data quota exceeded, update API key to calculate scores again`, type: 'warning'}))
          await sleep(60000 * 60 * 24);
        }
      }
      allReqUrls = tempRetryList;
    }

    if (stopExecution) {
      return;
    }
    // If there if there is field data
    if (fieldDataRes.length > 0) {
      // Write field data results into CSV
      console.log("Writing field data...");
      // writeFile(`./${folder}/results-field${deviceDateTimeStr}.csv`, parse(fieldDataRes)).catch(
      //   (err) => console.log(`Error writing field JSONfile: ${err}`)
      // );
    }
    // If there if there is field data
    if (fieldOriginRes.length > 0) {
      // Write field data results into CSV
      console.log("Writing origin field data...");
      // writeFile(
      //   `./${folder}/results-origin-field${deviceDateTimeStr}.csv`,
      //   parse(fieldOriginRes)
      // ).catch((err) => console.log(`Error writing Origin JSON file: ${err}`));
    }

    // Prevent map loop errors by filtering undefined responses (promise rejections)
    const labDataResFilter = labDataRes.filter((obj) => obj !== undefined);
    // Write lab data results into CSV
    console.log("Writing lab data...", labDataResFilter);
    // writeFile(`./${folder}/results-test${deviceDateTimeStr}.csv`, parse(labDataResFilter)).catch(
    //   (err) => console.log(`Error writing Lab JSON file:${err}`)
    // );

    resultObj[device].test = labDataResFilter;
    resultObj[device].errors = labResErrors;
    // resultObj[device].field = fieldDataRes;

    // If there are any errors
    if (labResErrors.length > 0) {
      // Write field data results into CSV
      console.log("Writing error data...", labResErrors);
      // writeFile(`./${folder}/errors${deviceDateTimeStr}.csv`, parse(labResErrors)).catch((err) =>
      //   console.log(`Error writing Origin JSON file: ${err}`)
      // );
    }

    // If running more than 1 test calculate median
    if (iterationNum > 1) {
      console.log("Calculating median...");

      const labMedian = reduceResults(median, labDataResFilter, iterationNum);
      const labAverage = reduceResults(calcAverage, labDataResFilter, iterationNum);

      // Write medians to CSV file
      // writeFile(`./${folder}/results-median${deviceDateTimeStr}.csv`, parse(labMedian)).catch((err) =>
      //   console.log(`Error writing file:${err}`)
      // );
      console.log("Median scores.......", labMedian);
      resultObj[device].median = labMedian;
      resultObj[device].average = labAverage;

      if (device === "mobile") {
        setMobileMedianScores([...labMedian]);
      }
      if (device === "desktop") {
        setDesktopMedianScores([...labMedian]);
      }

      if (device === "mobile") {
        setMobileAverageScores([...labAverage]);
      }
      if (device === "desktop") {
        setDesktopAverageScores([...labAverage]);
      }

      labMedian.map(row=>{
        row && addRow(dbCollection,row);
      });
      setSnackBar((snackBar) => ({...snackBar, open: true, message: `Successfully calculated ${device} median scores.`, type: 'success'}))
    }
  });

  // Log amount of errors
  console.log(
    `Encountered ${
      (resultObj.mobile.error?.length || 0) +
      (resultObj.desktop.error?.length || 0)
    } errors running the tests`
  );
  // console.log(`Ran ${_round} round of ${iterationNum} for a total of ${urlList.length} URL/s`);
  console.timeEnd();

  console.log("Final resultObj", resultObj);


  // const endDateTime = new Date();
  // const endTimeStamp = endDateTime.getTime();
  // const timeDelta = endTimeStamp - startTimeStamp;
  // setSnackBar((snackBar) => ({...snackBar, open: true, message: `Successfully calculated ${totalReqCount} URL scores in ${moment(timeDelta, "x").format("HH:mm:ss")}.`, type: 'success'}))

  return resultObj;
};

export default getSpeedData;
