import $ from 'jquery'
import * as s from './struct'
import request from 'superagent'

export class ExoticsAPI {
    constructor(errHandler, debug) {
        this.debug = debug || false
        this.cache = {}
        this.errHandler = errHandler
        document.cookie = "ioSport=Hufton123"
    }

    httpGet = function (url, handler) {
        let key = url
        if (this.cache[key] == undefined) {
            if (this.debug) {
                console.log("Fetching " + key);
            }
            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                xhrFields: {withCredentials: true},
                success: function (struct) {
                    this.cache[key] = struct
                    handler(struct)
                }.bind(this),
                error: this.errHandler
            })
        } else {
            if (this.debug) {
                console.log("Serving " + key + " from cache");
            }
            handler(this.cache[key]);
        }
    }

    httpPost = function (url, payload, handler) {
        let key = url + " " + JSON.stringify(payload)
        if (this.cache[key] == undefined) {
            if (this.debug) {
                console.log("Fetching " + key);
            }
            let that = this;
            request
                .post(url)
                .send(JSON.stringify(payload))
                .set('Accept', 'application/json')
                .withCredentials()
                .end(function (err, res) {
                    that.cache[key] = res.body
                    handler(res.body)
                });
        } else {
            if (this.debug) {
                console.log("Serving " + key + " from cache");
            }
            console.log(this.cache[key])
            handler(this.cache[key])
        }
    }

    fetchMatches = function (handler) {
        var url = "/api/single_match/legs";
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/single_match/legs";
        }
        this.httpGet(url, handler);
    };

    fetchPrice = function (body, handler) {
        var url = "/api/single_match/bets/price";
        if (process.env.NODE_ENV == 'development') {
            url = "http://localhost:8080/api/single_match/bets/price";
        }
        this.httpPost(url, body, handler);
    }
}

