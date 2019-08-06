import axios from 'axios';

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";


let func = function () {
};

class HttpRequest {
    constructor(baseUrl = '') {
        if (baseUrl === false) {
            this.baseUrl = '';
        } else if (baseUrl.length) {
            if (baseUrl.substr(-1) !== '/') {
                baseUrl = baseUrl + '/';
            }
            this.baseUrl = baseUrl;
        } else {
            this.baseUrl = window.location.protocol + '//' + window.location.host
        }
    }

    on(event, callback) {
        this.events[event] = callback;
        return this;
    }

    routeHandler(route) {
        return route
    }

    route(...args) {
        return this.routeHandler(...args);
    }

    // -------------  START HTTP SECTION -----------------
    getFrom(url, data = {}, jobs = {}) {
        return this.sendVia('GET', url, data, jobs);
    }

    postTo(url, data = {}, jobs = {}) {
        return this.sendVia('POST', url, data, jobs);
    }

    deleteFrom(url, data = {}, jobs = {}) {
        return this.sendVia('DELETE', url, data, jobs);
    }

    putIn(url, data = {}, jobs = {}) {
        return this.sendVia('PUT', url, data, jobs);
    }

    getFromRoute(route, data = {}, jobs = {}) {
        return this.getFrom(this.route(route), data, jobs);
    }

    postToRoute(route, data = {}, jobs = {}) {
        return this.postTo(this.route(route), data, jobs);
    }

    deleteFromRoute(route, data = {}, jobs = {}) {
        return this.deleteFrom(this.route(route), data, jobs);
    }

    putInRoute(route, data = {}, jobs = {}) {
        return this.putIn(this.route(route), data, jobs);
    }

    sendVia(method, url, data = {}, jobs = {}) {
        if (url.substr(0, 1) === '/') {
            url = url.substr(1)
        }

        if (this.baseUrl.substr(-1) !== '/') {
            this.baseUrl += '/'
        }

        url = this.baseUrl + url;

        let request = axios({
            method,
            url,
            data,
        });

        let vm = this;

        const processRequest = function (response, error = false) {
            if (typeof response === 'object' && typeof response.data === "object") {
                let api = response.data;
                if (error) {
                    if (jobs.hasOwnProperty('noOrError')) {
                        jobs.noOrError(api, response);
                    }

                    if (jobs.hasOwnProperty('error')) {
                        jobs.error(api, response);
                    }
                } else {
                    if (api.hasOwnProperty('proceed') && api['proceed'] === true) {
                        if (jobs.hasOwnProperty('yes')) {
                            jobs.yes(api['data'], response);
                        }
                    } else {
                        if (jobs.hasOwnProperty('no')) {
                            jobs.no(api, response);
                        }
                        if (jobs.hasOwnProperty('noOrError')) {
                            jobs.noOrError(api, response);
                        }
                    }

                    if (jobs.hasOwnProperty('yesOrNo')) {
                        jobs.yesOrNo(api, response);
                    }
                }

                if (jobs.hasOwnProperty('any')) {
                    jobs.any(api, response);
                }

                if (typeof api.__say !== 'undefined' && typeof vm.events.say === 'function') {
                    vm.events['say'](api.__say, api['proceed']);
                }
            } else {
                if (error) {
                    if (jobs.hasOwnProperty('noOrError'))
                        jobs.noOrError(response);
                } else {
                    jobs.yes(response);
                }

                if (jobs.hasOwnProperty('any')) {
                    jobs.any(response);
                }
            }
        };

        request.then(processRequest).catch(function (error) {
            processRequest(error.response, true);
        });
    }
}

HttpRequest.prototype.baseUrl = '';
HttpRequest.prototype.events = {say: func};

export default HttpRequest;
