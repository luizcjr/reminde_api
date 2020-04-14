const expresss = require('express');
const bodyParser = require('body-parser');

const app = expresss();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

require('dotenv').config();

require('./app/controllers/index')(app);
require('./app/job/notificationJob');

app.listen(3000);