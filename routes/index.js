module.exports = function (app, addon) {

    // Root route. This route will serve the `atlassian-connect.json` unless the
    // documentation url inside `atlassian-connect.json` is set
    app.get('/', function (req, res) {
        res.format({
            // If the request content-type is text-html, it will decide which to serve up
            'text/html': function () {
                res.redirect('/atlassian-connect.json');
            },
            // This logic is here to make sure that the `atlassian-connect.json` is always
            // served up when requested by the host
            'application/json': function () {
                res.redirect('/atlassian-connect.json');
            }
        });
    });

    // This is an example route that's used by the default "generalPage" module.
    // Verify that the incoming request is authenticated with Atlassian Connect
    app.get('/hello-world', addon.authenticate(), function (req, res) {
            // Rendering a template is easy; the `render()` method takes two params: name of template
            // and a json object to pass the context in
            res.render('hello-world', {
                title: 'Atlassian Connect'
                //issueId: req.query['issueId']
            });
        }
    );

    // Approval Form Route
    app.get('/GetApproval', addon.authenticate(), function (req, res) {
            // Rendering a template is easy; the `render()` method takes two params: name of template
            // and a json object to pass the context in
            res.render('approval', {
                title: 'Approval',
                project: req.query['projectKey'],
                issue: req.query['issueKey']
            });
        }
    );


    // Approval Service Call
    app.post('/api/v1/approval/', function (req, res) {
        console.log('Approval requested: ' + req.body.id);
        var args = {
            data: req.body,
            headers: {"Content-Type": "application/json"},
            requestConfig: {
                timeout: 1000,
                noDelay: true,
                keepAlive: true,
                keepAliveDelay: 1000
            },
            responseConfig: {
                timeout: 1000
            }
        };

        var Client = require('node-rest-client').Client;
        var client = new Client();

        client.post("https://secureauth.bsci.com/esigdeploy/authenticate", args, function (data, response) {
            console.log(data);
            console.log(data.EmployeeId);
            if(data.EmployeeId !== "Error") {
                res.send("Authenticated");
            } else {
                res.send("Authentication Failed");
            }

        }).on('error', function (err){
            console.log('Something went wrong on the reuqest', err.request.options);
            res.send("Error while processing request")
        });


        req.on('requestTimeout', function (req){
            console.log('response has expired');
            req.abort();
        });

        req.on('responseTimeout', function(res){
            console.log('response as expired');
            res.abort();
        });

        req.on('error', function (err) {
            console.log('request error', err);
        });
    });

        //     if (data.contains("EmployeeId") && !data.contains("Error")){
        //         res.send({ status: "OK", data: "Authenticated"});
        //     } else {
        //         res.send({ status: "OK", data: "Authentication Failed"});
        //     }
        // });

        //res.send({ status: "test" });
    // });

    // Add any additional route handlers you need for views or REST resources here...





// low level REST API attempt here
//     app.post('/api/v1/approval/', function (req, res){
//         console.log('Approval requested: ' + req.body.id);
//         var options = {
//             host: 'https://secureauth.bsci.com',
//             port: 443,
//             path: '/esigdeploy/authenticate',
//             method: 'POST',
//             data: req.body
//         };
//
//         getJSON(options, function (err, result){
//             if(err){
//                 return console.log('Error while trying to connect to Rest API ', err);
//             }
//
//             console.log(result);
//         });
//
//         var http = require('http');
//
//         function getJSON(options,cb) {
//             http.request(options, function (res) {
//                 var body = '';
//
//                 res.on('data', function (chunk) {
//                     body += chunk;
//                 });
//
//                 res.on('end', function () {
//                     var result = JSON.parse(body);
//                     cb(null, result);
//                 });
//                 res.on('error', cb);
//             })
//                 .on('error', cb)
//                 .end();
//         }
//     });







    // load any additional files you have in routes and apply those to the app
    {
        var fs = require('fs');
        var path = require('path');
        var files = fs.readdirSync("routes");
        for(var index in files) {
            var file = files[index];
            if (file === "index.js") continue;
            // skip non-javascript files
            if (path.extname(file) != ".js") continue;

            var routes = require("./" + path.basename(file));

            if (typeof routes === "function") {
                routes(app, addon);
            }
        }
    }
};
