import $ from 'jquery';
import * as s from  './struct';
import request from 'superagent';
const struct = s.struct;
const structPost = s.postStruct;

export class ExoticsAPI {
    constructor(errHandler, debug){
        this.debug=debug || false;
        this.cache={};
        this.errHandler = errHandler;
    }

    httpGet=function(url, handler) {
        var key=url;
        if (this.cache[key]==undefined) {
            if (this.debug) {
                console.log("Fetching "+key);
            }

            $.ajax({
                url: url,
                type: "GET",
                dataType: "json",
                success: function(struct) {
                    this.cache[key]=struct;
                    handler(struct);
                }.bind(this),
                error: this.errHandler
            });
        } else {
            if (this.debug) {
                console.log("Serving "+key+" from cache");
            }
            handler(this.cache[key]);
        }
    };

    httpPost=function(url, payload, handler) {
        var key=url+" "+JSON.stringify(payload)
        if (this.cache[key]==undefined) {
            if (this.debug) {
                console.log("Fetching "+key);
            }

            var that = this;

             request
               .post(url)
               .send(JSON.stringify(payload))
               .set('Accept', 'application/json')
               .end(function(err, res){
                   that.cache[key]=struct;
                   handler(res.body);
               });

        } else {
            if (this.debug) {
                console.log("Serving "+key+" from cache");
            }
            handler(this.cache[key]);
        }
    };
    fetchMatches=function(handler) {
        var url="/app/matches";
        if( process.env.NODE_ENV == 'development') {
            url="http://127.0.0.1:8080/app/matches";
        }
	    this.httpGet(url, handler);
    };
    fetchPrice=function(body, handler) {
	    var url="/app/bets/price";
        if( process.env.NODE_ENV == 'development') {
            url="http://127.0.0.1:8080/app/bets/price";
        }
	    this.httpPost(url, body, handler);
    }
};

