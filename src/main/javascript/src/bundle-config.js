
let $ = require("jquery");
let moment = require("moment");
let webstomp = require("webstomp-client");
let Chart = require("chart.js");

let moduleType = "bundle";
module.exports = { moduleType, $, moment, webstomp, Chart }
