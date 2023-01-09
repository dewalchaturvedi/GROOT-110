const sleep = (ms) => {
  console.log('sleeping =================== for', ms);
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default sleep;