import $ from 'jquery';
import * as s from './struct';
import request from 'superagent';

const struct = s.struct;
const structPost = s.postStruct;

export class ExoticsAPI {
    constructor(errHandler, debug) {
        this.debug = debug || false;
        this.cache = {};
        this.errHandler = errHandler;
        document.cookie = "ioSport=Hufton123";
    }

    httpGet = function (url, handler) {
        var key = url;
        if (this.cache[key] == undefined) {
            if (this.debug) {
                console.log("Fetching " + key);
            }
            this.cache[key]=struct;
            handler(struct);
            /*$.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                xhrFields: {withCredentials: true},
                success: function (struct) {
                    this.cache[key] = struct;
                    handler(struct);
                }.bind(this),
                error: this.errHandler
            });*/
        } else {
            if (this.debug) {
                console.log("Serving " + key + " from cache");
            }
            handler(this.cache[key]);
        }
    };

    httpGetForList = function (url, handler) {
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            xhrFields: {withCredentials: true},
            success: function (struct) {
                handler(struct);
            }.bind(this),
            error: this.errHandler
        })
    };

    httpPost = function (url, payload, handler) {
        var key = url + " " + JSON.stringify(payload)
        if (this.cache[key] == undefined) {
            if (this.debug) {
                console.log("Fetching " + key);
            }
            var that = this;
            that.cache[key]=structPost;
                   handler(structPost);

             /*request
               .post(url)
               .send(JSON.stringify(payload))
               .set('Accept', 'application/json')
               .end(function(err, res){
                   that.cache[key]=struct;
                   handler(res.body);
               });*/

        } else {
            if (this.debug) {
                console.log("Serving " + key + " from cache");
            }
            handler(this.cache[key]);
        }
    };

    httpPostForCreate = function (url, payload, handler) {
        var key = url + " " + JSON.stringify(payload)
        if (this.debug) {
            console.log("Fetching " + key);
        }
        request
            .post(url)
            .send(JSON.stringify(payload))
            .set('Accept', 'application/json')
            .withCredentials()
            .end(function (err, res) {
                if (res.body !== null && res.body.status === 'ok') {
                    handler(res.body);
                } else {
                    alert(res.text)
                }
            });
    };

    fetchMatches = function (handler) {
        var url = "/api/fixtures";
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/fixtures";
        }
        this.httpGet(url, handler);
    };

    fetchBets = function (status, handler) {
        var url = "/api/exotic_accas/list?status=" + status;
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/exotic_accas/list?status=" + status;
        }
        this.httpGetForList(url, handler);
    };

    fetchPrice = function (body, handler) {
        var url = "/api/exotic_accas/price";
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/exotic_accas/price";
        }
        this.httpPost(url, body, handler);
    };

    placeBet = function (body, handler) {
        var url = "/api/exotic_accas/create";
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/exotic_accas/create";
        }
        this.httpPostForCreate(url, body, handler);
    };
}

