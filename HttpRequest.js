import axios from 'axios';
import buildUrl from 'build-url';


const func = function () {
};

const processRequest = function (response, error = false, jobs, vm = {}) {
    const jobsHasAnyFn = jobs.hasOwnProperty('any');
    const jobsHasErrorFn = jobs.hasOwnProperty('error');
    const jobsHasNoOrErrorFn = jobs.hasOwnProperty('noOrError');

    if (typeof response === 'object' && typeof response.data === "object") {
        const api = response.data;
        if (error) {
            if (jobsHasNoOrErrorFn) jobs.noOrError(api, response);

            if (jobsHasErrorFn) jobs.error(api, response);
        } else {
            if (api.hasOwnProperty('proceed') && api['proceed'] === true) {
                if (jobs.hasOwnProperty('yes')) {
                    jobs.yes(api['data'], response);
                }
            } else {
                if (jobs.hasOwnProperty('no')) {
                    jobs.no(api['data'], response);
                }
                if (jobsHasNoOrErrorFn) {
                    jobs.noOrError(api, response);
                }
            }

            if (jobs.hasOwnProperty('yesOrNo')) {
                jobs.yesOrNo(api['data'], response);
            }
        }

        if (jobsHasAnyFn) {
            jobs.any(api, response);
        }

        if (typeof api.__say !== 'undefined' && typeof vm.events.say === 'function') {
            vm.events['say'](api.__say, api['proceed']);
        }
    } else {
        if (error) {
            if (jobsHasNoOrErrorFn) jobs.noOrError(response);

            if (jobsHasErrorFn) jobs.error(response);
        } else {
            jobs.yes(response);
        }

        if (jobsHasAnyFn) {
            jobs.any(response);
        }
    }
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

        this.axios = new axios.create({
            baseURL: this.baseUrl,
        })
    }

    hasNprogress(progress) {
        if (progress.start && progress.done) {
            this.axios.interceptors.request.use(config => {
                progress.start();
                return config
            });

            this.axios.interceptors.response.use(response => {
                progress.done();
                return response
            });
        }

    }

    isXmlRequest() {
        this.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
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
    getFrom(url, data = {}, jobs = {}, config = {}) {
        return this.sendVia('GET', url, data, jobs, config);
    }

    postTo(url, data = {}, jobs = {}, config = {}) {
        return this.sendVia('POST', url, data, jobs, config);
    }

    deleteFrom(url, data = {}, jobs = {}, config = {}) {
        return this.sendVia('DELETE', url, data, jobs, config);
    }

    putIn(url, data = {}, jobs = {}, config = {}) {
        return this.sendVia('PUT', url, data, jobs, config);
    }

    getFromRoute(route, data = {}, jobs = {}, config = {}) {
        return this.getFrom(this.route(route), data, jobs, config);
    }

    postToRoute(route, data = {}, jobs = {}, config = {}) {
        return this.postTo(this.route(route), data, jobs, config);
    }

    deleteFromRoute(route, data = {}, jobs = {}, config = {}) {
        return this.deleteFrom(this.route(route), data, jobs, config);
    }

    putInRoute(route, data = {}, jobs = {}, config = {}) {
        return this.putIn(this.route(route), data, jobs, config);
    }

    sendVia(method, url, data = {}, jobs = {}, config = {}) {
        if (url.substr(0, 1) === '/') {
            url = url.substr(1)
        }

        if (this.baseUrl.substr(-1) !== '/') {
            this.baseUrl += '/'
        }

        url = this.baseUrl + url;

        if (method.toLowerCase() === 'get' && Object.keys(data).length) {
            url = buildUrl(url, {
                queryParams: data
            });
        }

        const request = this.axios({
            ...{
                method,
                url,
                data,
            },
            ...config
        });

        return request
            .then((response) => processRequest(response, false, jobs, this))
            .catch((error) => processRequest(error.response, true, jobs, this));
    }
}

HttpRequest.prototype.baseUrl = '';
HttpRequest.prototype.axios = null;
HttpRequest.prototype.events = {say: func};

export default HttpRequest;
