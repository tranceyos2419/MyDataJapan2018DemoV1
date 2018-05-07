//Authentication
var cellUrl = "https://demo.personium.io/u-aizu-99/",
    engineEndPoint = "__/html/Engine/getAppAuthToken",
    appUrl = "https://demo.personium.io/app-aizu-health-store/",
    friendUrl = 'https://demo.personium.io/u-aizu-99/',
    id = "me",
    password = "wakamatsu",
    refresh_token, //getUerAuthToken
    access_token, //getAppAuthToken
    box_access_token, //getProtectedBoxAccessToken
    box_refresh_token, //getProtectedBoxAccessToken
    box100_location = "https://demo.personium.io/u-aizu-100/io_personium_demo_aizu-health-store",
    friend_access_token, //friendGetApp
    trancell_access_token, //getTranscellToken
    friend_get_protected_access_token, //friendGetProtectedBoxAccessToken
    box99_location = "	https://demo.personium.io/u-aizu-99/io_personium_demo_aizu-health-store";

//data
dataSet = [
    'BasalEnergyBurned',
    'ActiveEnergyBurned',
    'DistanceWalkingRunning',
    'StepCount',
    'HeartRate'
];
// filterSet = [
//         "type eq 'HKQuantityTypeIdentifier'"+dataSet[0],
//         "type eq 'HKQuantityTypeIdentifierActiveEnergyBurned'",
//         "type eq 'HKQuantityTypeIdentifierDistanceWalkingRunning'",
//         "type eq 'HKQuantityTypeIdentifierStepCount'",
//         // "type eq 'HKQuantityTypeIdentifierHeartRate'"
//     ]
filterSet = [
    "type eq 'HKQuantityTypeIdentifierBasalEnergyBurned'",
    "type eq 'HKQuantityTypeIdentifierActiveEnergyBurned'",
    "type eq 'HKQuantityTypeIdentifierDistanceWalkingRunning'",
    "type eq 'HKQuantityTypeIdentifierStepCount'",
    "type eq 'HKQuantityTypeIdentifierHeartRate'"
]
// filterSet = [
//   "startDate ge datetimeoffset'2018-02-26T00:00:00+09:00' and endDate le datetimeoffset'2018-03-06T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierBasalEnergyBurned'",
//   "startDate ge datetimeoffset'2018-02-26T00:00:00+09:00' and endDate le datetimeoffset'2018-03-06T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierActiveEnergyBurned'",
//   "startDate ge datetimeoffset'2018-02-26T00:00:00+09:00' and endDate le datetimeoffset'2018-03-06T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierDistanceWalkingRunning'",
//   "startDate ge datetimeoffset'2018-02-26T00:00:00+09:00' and endDate le datetimeoffset'2018-03-06T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierStepCount'",
//   "startDate ge datetimeoffset'2018-02-26T00:00:00+09:00' and endDate le datetimeoffset'2018-03-06T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierHeartRate'"
//   ]
// filterSet = [
//   "endDate ge datetimeoffset'2017-01-01T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierBasalEnergyBurned'",
//   "endDate ge datetimeoffset'2017-01-01T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierActiveEnergyBurned'",
//   "endDate ge datetimeoffset'2017-01-01T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierDistanceWalkingRunning'",
//   "endDate ge datetimeoffset'2017-01-01T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierStepCount'",
//   "endDate ge datetimeoffset'2017-01-01T00:00:00+09:00' and type eq 'HKQuantityTypeIdentifierHeartRate'"
// ]
var valueSet = []; //[all health data]
var hourlySum = []; // [dataSet][Sum]
var dailySum = [];
var n = 0;
var startTimeArray = [];
var endTimeArray = [];
var chartDailyTime = [];

//Health info //linked with i
var endDate = [];
var startDate = [];
var endDateArray = []; // MM DD YYYY HH mm ss'  [health data][time] (2 dimantional) need initialization per data
var startDateArray = []; // MM DD YYYY HH mm ss' this array has all health data (2 dimantional)
var unitArray = []; // get Unit

//For making a graph
var numberOfData = 0; // for sum
var d = new Date();
var h; // to get data until now in daily graph
var today;
var weekBefore;
var timeSpan = [];
var hours = []; // [0] == 1
var weeks = [];
var weekForLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// var timeZone = []; // [Kind][Time]
var graph = null;


initializationPerGraph = function () {
    initializeData()
}

initializetionOfGraph = function () {
    if (graph !== null) {
        graph.destroy();
        console.log('Graph is destroyed');
    }
}

initializeData = function () {
    console.log("initialize data")
    for (var q in numberOfData) {
        endDateArray[q] = 0;
        startDateArray[q] = 0;
    }
    numberOfData = 0;
}

initializeHourlySum = function () {
    console.log("initializeHourlySum")
    for (var i in dataSet) {
        if (!hourlySum[i]) hourlySum[i] = [] //lazy initilization
        for (var j in hours) {
            hourlySum[i][j] = 0;
        }
    }
}

initializeDailySum = function () {
    console.log("initializeDailySum")
    for (var i in dataSet) {
        if (!dailySum[i]) dailySum[i] = [] //lazy initilization
        for (var j in timeSpan) {
            dailySum[i][j] = 0;
        }
    }
}

initializeHeartRateDate = function () {

}

createChartArray = function (array) {
    // if(array[0] == 1 && array[23] == 24) return array; //for hourly
    var chartArray = [];
    for (i in array) {
        chartArray[i] = array[i][0] + "/" + array[i][1]
    }
    return chartArray;
}

createArray = function (array) {
    for (i in array) {
        array[i] = array[i].replace(/^0+/, '');
        array[i] = Number(array[i]);
        // console.log("array["+i+ "] " + array[i]);
    }
    return array;
}

createTimeSpan = function (start, end) {
    //By myself
    var span = [];
    var q = 0;
    if (start[2] != end[2]) { //yearly
    } else if (start[0] != end[0]) { //daily. different month(the output is days)
        var startMonth = start[0];
        var endMonth = end[0];
        var d;
        for (; startMonth != endMonth; startMonth++) {
            for (i = start[1]; i <= getLastDate(startMonth); i++) {
                if (!span[q]) span[q] = [] //lazy initilization
                span[q][0] = startMonth; //Month
                span[q][1] = i; //Day
                q++;
            }
        }
        for (i = 1; i <= end[1]; i++) {
            if (!span[q]) span[q] = [] //lazy initilization
            span[q][0] = startMonth;
            span[q][1] = i;
            q++;
        }
    } else if (start[0] == end[0]) { //daily. same month(the output is days)
        for (i = start[1]; i <= end[1]; i++) {
            if (!span[q]) span[q] = [] //lazy initilization
            span[q][0] = start[0];
            span[q][1] = i;
            q++;
        }
    } else if (start[0] == end[0] && start[1] == end[1]) { // hourly
        for (i = 0; i < 24; i++) {
            span[i] = i + 1;
        }
    }
    return span;
}

getLastDate = function (month) {
    var d = new Date(2018, month, 0);
    d = d.getDate()
    d = Number(d)
    return d;
}

getDailySum = function (n, span) {
    for (i = 0; i < numberOfData; i++) {
        // console.log("endDateArray " + endDateArray[i])
        //    console.log("startDateArray " + startDateArray[i])
        if (endDateArray[i][0] == startDateArray[i][0] && endDateArray[i][1] == startDateArray[i][1]) {
            for (j in span) {
                // console.log("span " + span[j])
                if (span[j][0] == endDateArray[i][0] && span[j][1] == endDateArray[i][1]) {
                    dailySum[n][j] += valueSet[n][i]
                    // console.log("Value" + valueSet[n][i])
                }
            }
        }
    }
}

getDailyAverage = function (n, span) {
    var ave = [];

    for (i = 0; i < numberOfData; i++) {
        if (endDateArray[i][0] == startDateArray[i][0] && endDateArray[i][1] == startDateArray[i][1]) {
            for (j in span) {
                if (span[j][0] == endDateArray[i][0] && span[j][1] == endDateArray[i][1]) {
                    dailySum[n][j] += valueSet[n][i];

                    if (!ave[j]) ave[j] = []; //lazy initilization
                    ave[j]++;
                }
            }
        }
    }
    //division
    for (q in ave) {
        dailySum[n][q] /= ave[q];
    }
}

getHourlySum = function (n) {
    for (i = 0; i < numberOfData; i++) {
        // if(d.getDate() == endDateArray[i][1]){ // filter of getting today's data
        if (startDateArray[i][3] !== "00" && endDateArray[i][3] !== "23") {
            for (var j in hours) {
                if (hours[j] == endDateArray[i][3]) {
                    hourlySum[n][j] += valueSet[n][i];
                }
            }
        } else {}
        // }
    }
    console.log("Show houly sum" + hourlySum[n])
}

getHourlyAverageSum = function (n) {
    var dividerArray = [];
    for (var k in hours) {
        dividerArray[k] = 0;
    }
    for (i = 0; i < numberOfData; i++) {
        // if(d.getDate() == endDateArray[i][1]){ // filter of getting today's data
        if (startDateArray[i][3] !== "00" && endDateArray[i][3] !== "23") {
            for (var j in hours) {
                if (hours[j] == endDateArray[i][3]) {
                    hourlySum[n][j] += valueSet[n][i];
                    dividerArray[j]++;
                }
            }
        } else {}
        // }
    }
    //Divide
    for (var q in hours) {
        hourlySum[n][q] = hourlySum[n][q] / dividerArray[q]
    }
    console.log("Show houly average sum" + hourlySum[n])
}

getStartDateArray = function (startDate, i) {
    if (!startDateArray[i]) startDateArray[i] = [] //lazy initilization
    a = startDate.split(" ")
    for (var j = 0; j < a.length; j++) {
        startDateArray[i][j] = a[j];
    }
    console.log("Start Date Array " + startDateArray[i])
}

getDateArray = function (dateArray, date, i) {
    if (!dateArray[i]) dateArray[i] = [] //lazy initilization
    a = date.split(" ")
    a = createArray(a)
    for (var j = 0; j < a.length; j++) {
        dateArray[i][j] = a[j];
    }
    return dateArray
}

createHours = function () {
    for (i = 0; i < 24; i++) {
        hours[i] = i + 1;
    }
}

createWeek = function () {
    // var startOfWeek = moment().startOf('week');
    // var endOfWeek = moment().endOf('week');
    //
    // var days = [];
    // var day = startOfWeek;
    //
    // while (day <= endOfWeek) {
    //     days.push(day.toDate());
    //     day = day.clone().add(1, 'd');
    // }
    // console.log()
    // console.log(days);
}

getHour = function () {
    h = d.getHours();
    console.log("Hour" + h)
}

getToday = function () {
    var dd = d.getDate();
    var mm = d.getMonth() + 1; //January is 0!
    var yy = d.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yy;
}

getWeekBefore = function () {
    let d = new Date();
    d.setDate(d.getDate() - 7);
    d7 = d.getDate();
    m7 = d.getMonth() + 1;
    y7 = d.getFullYear();

    if (d7 < 10) {
        d7 = '0' + d7;
    }
    if (m7 < 10) {
        m7 = '0' + m7
    }
    weekBefore = m7 + '/' + d7 + '/' + y7;
    console.log('weekBefore ' + weekBefore);

}

getUerAuthToken = function () {
    return $.ajax({
        type: "POST",
        url: cellUrl + '__token',
        processData: true,
        dataType: 'json',
        data: {
            grant_type: "password",
            username: "me",
            password: "wakamatsu"
        },
        headers: {
            'Accept': 'application/json',
        }
    });
}

getAppAuthToken = function () {
    var url = appUrl + engineEndPoint;
    return $.ajax({
        type: "POST",
        url: url,
        data: {
            p_target: cellUrl
        },
        headers: {
            'Accept': 'application/json',
            'x-personium-cors': 'true'
        }
    });
};

getProtectedBoxAccessToken = function () {
    return $.ajax({
        type: "POST",
        url: cellUrl + '__token',
        processData: true,
        dataType: 'json',
        data: {
            grant_type: "refresh_token",
            refresh_token: refresh_token,
            client_id: appUrl,
            client_secret: access_token
        },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        }
    });
};

getBox = function () {
    return $.ajax({
        type: "GET",
        url: cellUrl + '__box',
        processData: true,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + box_access_token,
            'Accept': 'application/json',
        }
    });
}

aizuGetListOfHealthRecords = function (n) {
    /*
    // var filterStepsTest = "substringof('StepCount', type)";
    // var filterStartWith = " startswith(type, 'HK')	";
    // var filterPartialMatch = " substringof('StepCount', type)"
    // let queryUrl = urlOData + '?' + filterStr;
    // var url = box99_location + '/OData/HealthRecord?$top=' + top + '&$filter=' + filterBasal;
    // var url = box99_location + '/OData/HealthRecord?$top=' + top + '&$orderby=' + orderby;
    // "$filter": "endDate ge datetimeoffset'2018-01-01T00:00:00+09:00'",
    */
    let filterStr = $.param({
        "$top": 3000,
        "$filter": filterSet[n]
        // "$orderby": "endDate desc"
    });
    var url = box99_location + '/OData/HealthRecord?' + filterStr;
    return $.ajax({
        type: "GET",
        url: url,
        processData: true,
        dataType: 'json',
        headers: {
            'Authorization': 'Bearer ' + box_access_token,
            'Accept': 'application/json',
        }
    });
}


setHealthRecordsToLocalArrays = function (data, n) {
    // console.log("N of After setHealthRecordsToLocalArrays1 " + n)
    console.log("setHealthRecordsToLocalArrays");
    //Making arrays for graph
    unitArray[n] = data.d.results[0].unit; //get label of graph
    for (var i in data.d.results) {
        console.log(data.d.results[i]);
        if (!valueSet[n]) valueSet[n] = [] //lazy initilization
        valueSet[n][i] = Number(data.d.results[i].value);
        endDate[i] = moment(data.d.results[i].endDate).format('MM DD YYYY HH mm ss');
        startDate[i] = moment(data.d.results[i].startDate).format('MM DD YYYY HH mm ss');
        console.log(dataSet[n])
        console.log("End Date:" + endDate[i])
        console.log("Start Date:" + startDate[i])
        console.log("valueSet:" + valueSet[n][i])
        endDateArray = getDateArray(endDateArray, endDate[i], i)
        console.log("End Date Array " + endDateArray[i])
        startDateArray = getDateArray(startDateArray, startDate[i], i)
        console.log("Start Date Array " + startDateArray[i])
        numberOfData++;
    }
}

//Input
inputToArray = function (str) {
    var a = []
    a = str.split("/")
    return a;
}

//Chart
chart = function (position, n) {
    var myChart = document.getElementById(position).getContext("2d");
    graph = new Chart(myChart, {
        type: 'bar',
        data: {
            labels: chartDailyTime,
            datasets: [{
                label: unitArray[n],
                data: dailySum[n],
                fill: true,
                backgroundColor: "rgb(33, 255, 14)",
                fillColor: "rgb(33, 255, 14)",
                borderColor: "rgb(33, 255, 14)",
                lineTension: 0.1
            }]
        },
        "options": {
            title: {
                display: true,
                text: dataSet[n],
                fontSize: 22
            },
            legend: {
                display: true,
                position: "right",
            },
            layout: {
                padding: 50
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
}

//HeartRate
HeartRateLineChart = function (position, n) {
    var myChart = document.getElementById(position).getContext("2d");
    graph = new Chart(myChart, {
        type: 'line',
        data: {
            labels: chartDailyTime,
            datasets: [{
                label: unitArray[n],
                data: dailySum[n],
                fill: false,
                backgroundColor: "rgb(33, 255, 14)",
                fillColor: "rgb(33, 255, 14)",
                borderColor: "rgb(33, 255, 14)",
                lineTension: 0.1
            }]
        },
        "options": {
            title: {
                display: true,
                text: dataSet[n],
                fontSize: 22
            },
            legend: {
                display: true,
                position: "right",
            },
            layout: {
                padding: 50
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 8
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max:100
                    }
                }]
            }
        }
    })
}

//setting time data to make a gprah
setTime = function () {
    console.log("Set Time")
    getToday();
    getWeekBefore();
    getHour();
    createHours();
    initializeHourlySum()
}

//Imprementation 03
// $('button').click(function(){
$(document).ready(function () {
    //Prepareration
    setTime();
    $("h3").append("Today" + today);
    //Authentication
    getUerAuthToken()
        .done(function (userAuthoDdata) {
            console.log("getUerAuthToken");
            console.log(userAuthoDdata)
            refresh_token = userAuthoDdata.refresh_token;
            getAppAuthToken()
                .done(function (appAuthoData) {
                    console.log("getAppAuthToken");
                    console.log(appAuthoData)
                    access_token = appAuthoData.access_token;
                    getProtectedBoxAccessToken()
                        .done(function (protectedBoxData) {
                            console.log("getProtectedBoxAccessToken");
                            console.log(protectedBoxData)
                            box_access_token = protectedBoxData.access_token;
                            box_refresh_token = protectedBoxData.refresh_token;
                            getBox()
                            console.log("getBoxData");
                            ShowGraph();
                        })
                });
        })

})

ShowGraph = function () {
    // var userStartDate = inputToArray($("#startDate").val())
    // var userEndDate = inputToArray($("#endDate").val())
    var userStartDate = inputToArray('02/25/2018') //today
    var userEndDate = inputToArray('03/03/2018') //weekdayBefore
    // var userStartDate = inputToArray(weekBefore)
    // var userEndDate = inputToArray(today) //weekdayBefore
    console.log("userStartDate" + userStartDate)
    console.log("userEndDate" + userEndDate)
    startTimeArray = createArray(userStartDate);
    endTimeArray = createArray(userEndDate)
    timeSpan = createTimeSpan(startTimeArray, endTimeArray)
    initializeDailySum();
    console.log("timeSpan " + timeSpan)
    chartDailyTime = createChartArray(timeSpan);
    console.log("chartDailyTime" + chartDailyTime)
    // Implementation()
};

document.getElementById('getData').addEventListener('click', function () { //getting data from checklist
    var dataPosition = [];
    $('.form-check input:checked').each(function () {
        dataPosition.push($(this).val());
    });
    for (let i in dataPosition) {
        dataPosition[i] = Number(dataPosition[i])
        console.log('dataPosition ' + dataPosition[i]);
    }
    Implementation(dataPosition)
})

ClearGraph = function () {
    $('.col-xs-6').remove();
    console.log('Removed');
}

AddGraph = function (array) {
    for (j in array) {
        console.log('J ' + j);
        let template = `<div class="col-xs-6">
        <canvas id="${j}" width="550" height="465"></canvas>
    </div>`
        $(".row").append(template)
    }
}

Implementation = function (array) {
    initializetionOfGraph(graph)
    //clear appends

    ClearGraph()
    // add appends
    AddGraph(array)
    console.log("Implementation")
    for (let i in array) {
        aizuGetListOfHealthRecords(array[i])
            .done(function (aizuGetListOfHealthRecordsData) {
                initializationPerGraph();
                console.log("aizuGetListOfHealthRecords")
                // console.log(aizuGetListOfHealthRecordsData);
                setHealthRecordsToLocalArrays(aizuGetListOfHealthRecordsData, array[i])
                // getHourlySum(array[i]);

                console.log("dailySum " + dailySum[array[i]])
                if (array[i] == 4) {
                    getDailyAverage(array[i], timeSpan)
                    // HeartRateData(array[i],timeSpan)
                    HeartRateLineChart(i, array[i])
                } else {
                    getDailySum(array[i], timeSpan)
                    chart(i, array[i]);
                }
            })
    }
}


// convertUnixToDate = function(u){
//   //remove unnecessary numbers from fetched data
//   var s = u.replace(/\D/g,'');
//   // converting string to number
//   var x = Number(s)
//   console.log("UNIX timestamp: " + x);
//   //covnerting unix timestamp to datetime
//   var d = moment.unix(x).format("YYYY MMM Do");
//   console.log("Date: " + d);
//   return d;
// }

//HeartRateDate for Bubble Chart
// let heartRate = [];
// HeartRateData = function(n,span){
//     let num = 0;

//     for (i = 0; i < numberOfData; i++) {
//         if (endDateArray[i][0] == startDateArray[i][0] && endDateArray[i][1] == startDateArray[i][1]) {
//             for (j in span) {
//                 if (span[j][0] == endDateArray[i][0] && span[j][1] == endDateArray[i][1]) {
//                     let test = {
//                         x: null,
//                         y: null,
//                         r: 5
//                     }
//                     // test.x = endDateArray[i][1]
//                     test.x = span[j][0] + "/" + span[j][1]
//                     test.y = valueSet[n][i];
//                     // console.log('HeartRateData ' + test);
//                     heartRate[num] = test;
//                     num++;
//                     // console.log('test.x '+ test.x);
//                 }
//             }
//         }
//     }
// }


//Bubble Chart
// HeartRateBubbleChart = function(position,n){
//     var myChart = document.getElementById(position).getContext("2d");
//     var routin = -1;
//     graph = new Chart(myChart, {
//         type: 'bubble',
//         data: {
//             labels: chartDailyTime,
//             datasets: [{
//                 label: 'HeartRate',
//                 data: heartRate,//HeartRateDate()
//                 backgroundColor: "rgb(33, 255, 14)",
//                 fillColor: "rgb(33, 255, 14)",
//                 borderColor: "rgb(33, 255, 14)",
//             }]
//         },
//         options: {
//             title: {
//                 display: true,
//                 text: dataSet[n],
//                 fontSize: 22
//             },
//             legend: {
//                 display: true,
//                 position: "right",
//             },
//             layout: {
//                 padding: 50
//             },
//             scales: {
//                 xAxes: [{
//                     ticks: {
//                         stepSize: 0.5,
//                         callback: function (value, index, values) {
//                             // if (index < chartDailyTime.length) {
//                             //     return chartDailyTime[index];
//                             // }
//                             console.log('value'+ value);
//                             console.log('index'+ index);
//                             console.log('values'+ values);
//                             routin++;
//                             console.log("chartDailyTime"+chartDailyTime[routin]);
//                             return chartDailyTime[routin];
//                         },
//                         // min: chartDailyTime[0],
//                         // max: chartDailyTime[chartDailyTime.length - 1]
//                     },
//                     position: 'bottom'
//                 }],
//                 yAxes: [{
//                 }]
//             }
//         }
//     })
// }
