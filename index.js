const express = require('express')

// Create the express app
const app = express()

// For more readable numbers!
var formatNum = require('comma-number')

// Allow all Cross-Origin requests
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// This function returns the count of how many prime numbers
// exist between 1 --> n
var countPrimeNums = (n) => {
    var result = 0;
    for (var i = 1; i < n; i++) {
        var isPrime = true;
        for (var j = 2; j < i; j++) {
            if (i % j == 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) result++;
    }
    return result;
}

// root path
app.get('/', (req, res) => {
    var n = parseInt(req.query.n);
    if (isNaN(n))
        return res.status(400).send('Missing Params');
    res.status(200).send('Found ' + formatNum(countPrimeNums(n)) + ' prime numbers under ' + formatNum(n) + '\n');
});

// this path deliberately crashes the server so we could test the
// auto heal capabilities of cloud foundry
app.get('/crash', (req, res) => {
    setTimeout(function () {
        throw new Error('The app has crashed');
    }, 10);
    res.status(500).send();
})

// Error handlers
app.use(function fourOhFourHandler(req, res) {
    res.status(404).send();
})
app.use(function fiveHundredHandler(err, req, res, next) {
    console.error(err)
    res.status(500).send()
})

// Start server
app.listen(8080, function (err) {
    if (err) {
        return console.error(err)
    }
    console.log('Started at http://localhost:8080')
})