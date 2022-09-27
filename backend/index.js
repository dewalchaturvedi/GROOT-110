const express = require('express');
const path = require('path');


// Init app
const app = express();
path.join(__dirname, '..', 'test', 'karma.conf.js')


app.use(express.static(__dirname + '../build'));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

// Define port
const port=Number(process.env.PORT || 3000);

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
