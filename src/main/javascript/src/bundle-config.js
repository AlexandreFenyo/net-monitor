
let $ = require("jquery/dist/jquery.min.js");
let moment = require("moment/moment.js");
let webstomp = require("webstomp-client/dist/webstomp.min.js");
let Chart = require("chart.js/dist/Chart.bundle.min.js");

let moduleType = "bundle";
module.exports = { moduleType, $, moment, webstomp, Chart }
