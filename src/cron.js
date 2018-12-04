var request = require('request');
var cron = require('node-cron');
var watch = require('node-watch');
var path = require('path');
var cfg_path = path.join( __dirname, '../cfg/rester.ini' );
var tasks = [];

var openJobs = function(filename)
{
    var fs = require('fs');
    var ini = require('ini');
    var confiure = ini.parse(fs.readFileSync(filename, 'utf-8'));

    var timezone = 'Asia/Seoul';
    if (confiure.hasOwnProperty('default') && confiure['default'].hasOwnProperty('timezone'))
        timezone = confiure['default']['timezone'];

    for(var key in tasks)
    {
        console.log("[del job] " + key);  
        tasks[key].destroy();
    }
    tasks = [];

    console.log("timezone: " + timezone);
    for(var key in confiure)
    {
        if (key == 'default')
            continue;

        if (!confiure.hasOwnProperty(key))
        {
            console.log("this element is not defined: " + key);
            continue;
        }

        if (!confiure[key].hasOwnProperty('url'))
        {
            console.log("url element is not defined: " + key);
            continue;
        }
        if (!confiure[key].hasOwnProperty('time'))
        {
            console.log("time element is not defined: " + key);
            continue;
        }

        var task = scheduleJob(confiure[key]['time'], confiure[key]['url'], timezone);
        if(task !== undefined)
            tasks[key] = task;
    }
}

var scheduleJob = function(time, url, timezone)
{
    if (!cron.validate(time))
    {
        console.log("invalid time string - " + time);
        return;
    }

    console.log("[add job] time: " + time + " url: " + url);  
    return cron.schedule(time, () => {
        console.log("[request] url: " + url);  
        request(url, function (err, res, body) {
            if (err)
                console.log(err);
            console.log(res && res.statusCode + " Path:" + url);
            console.log(body);
        });
    }, {
         scheduled: true,
         timezone: timezone
    });
}

console.log("welcome to rester-cron");
watch(cfg_path, function(event, filename) {
    console.log("confiure file changed");
    openJobs(filename);
})

openJobs(cfg_path);
