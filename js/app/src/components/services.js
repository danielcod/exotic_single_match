import $ from 'jquery'
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
        if (this.cache[key] === undefined) {
            if (this.debug) {
                console.log("Fetching " + key)
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
                console.log("Serving " + key + " from cache")
            }
            handler(this.cache[key])
        }
    }

    httpPost = function (url, payload, handler) {
        let key = url + " " + JSON.stringify(payload)
        if (this.cache[key] === undefined) {
            if (this.debug) {
                console.log("Fetching " + key)
            }
            let that = this
            request
                .post(url)
                .send(JSON.stringify(payload))
                .set('Accept', 'application/json')
                .withCredentials()
                .end(function (err, res) {
                    that.cache[key] = res.body
                    handler(res.body)
                })
        } else {
            if (this.debug) {
                console.log("Serving " + key + " from cache")
            }
            handler(this.cache[key])
        }
    }

    httpPostNoCache = function (url, payload, handler) {
        request
            .post(url)
            .send(JSON.stringify(payload))
            .set('Accept', 'application/json')
            .withCredentials()
            .end(function (err, res) {
                if (res.body !== null && res.status === 200) {
                    handler(res.body)
                } else {
                    console.log(res.text)
                }
            })
    }

    httpPostForPlace = function (url, payload, handler) {
        request
            .post(url)
            .send(JSON.stringify(payload))
            .set('Accept', 'application/json')
            .withCredentials()
            .end(function (err, res) {
                 console.log(err)
                if (res.body !== null && res.status === 200) {
                    handler(res.body)
                } else {
                    console.log(res.text)
                }
            })
    }

    fetchMatches = function (handler) {
        //let url = "/api/single_match/legs"
        let url = "/api/single_match/legsv2"
        if (process.env.NODE_ENV === 'development') {
            //url = "http://localhost:8080/api/single_match/legs"
            url = "http://localhost:8080/api/single_match/legsv2"
        }
        this.httpGet(url, handler)
    }

    fetchCurates = function (handler) {
        let url = "/api/single_match/curates"
        if (process.env.NODE_ENV === 'development') {
            url = "http://localhost:8080/api/single_match/curates"
        }
        this.httpGet(url, handler)
    }

    fetchPrice = function (body, handler) {
        let url = "/api/single_match/bets/price"
        if (process.env.NODE_ENV === 'development') {
            url = "http://localhost:8080/api/single_match/bets/price"
        }
        this.httpPost(url, body, handler)
    }

    placeBet = function (body, handler) {
        let url = "/api/single_match/place"
        if (process.env.NODE_ENV === 'development') {
            url = "http://localhost:8080/api/single_match/place"
        }
        this.httpPostForPlace(url, body, handler)
    }

    fetchBets = function (body, handler) {
        let url = "/api/single_match/settle"
        if (process.env.NODE_ENV === 'development') {
            url = "http://localhost:8080/api/single_match/settle"
        }
        this.httpPostNoCache(url, body, handler)
    }
}

