const calcAverage = (array) => (array.reduce((a, b) => a + b) / array.length).toFixed(3);

export default calcAverage;