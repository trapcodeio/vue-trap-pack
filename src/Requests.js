import StorageHelper from '../StorageHelper'
import Lodash from '../lodash';

class HttpRequestMixin {
    getFrom() {
        return {
            route: '',
            data: {},
            jobs: {}
        };
    }

    constructor(getFrom) {
        if (typeof getFrom === 'function') {
            this.getFrom = getFrom;
        } else {
            this.getFrom = () => {
                return getFrom;
            };
        }
        return this.getMixin();
    }

    getMixin() {
        let vm = this;

        return {
            data() {
                return {
                    vtpRequest: {
                        data: null,
                        count: 0,
                        completed: 0,
                        countBeforeClear: 0,
                        dataBeforeClear: null
                    },
                };
            },
            mounted() {
                return this.fetchData();
            },

            computed: {
                hasServerData() {
                    return this.vtpRequest.count === this.vtpRequest.completed;
                }
            },

            methods: {
                clearFetchedData() {
                    this.vtpRequest.countBeforeClear = this.vtpRequest.count;
                    this.vtpRequest.completed = 0;

                    this.$forceUpdate();
                },

                restoreFetchedData() {
                    this.vtpRequest.completed = this.vtpRequest.countBeforeClear;
                    this.$forceUpdate();
                },

                reloadFetchedData(fromServer = null) {
                    this.fetchData(true, fromServer);
                },

                fetchData(clear = false, getFrom = null) {
                    /**
                     * @type {*}
                     */
                    let r;
                    let component = this;

                    if (clear) {
                        this.clearFetchedData();
                    }

                    if (!getFrom) {
                        r = vm.getFrom(component);
                    } else {
                        if (typeof getFrom === 'function') {
                            r = getFrom(component);
                        } else {
                            r = getFrom;
                        }
                    }

                    /** Get number of request */
                    let length = -1;
                    if (r) {
                        if (Array.isArray(r)) {
                            length = r.length
                        } else if (typeof getFrom == 'object') {
                            length = 1
                        }
                    }

                    component.vtpRequest.count = length;

                    if (Array.isArray(r) && r.length) {
                        r.forEach((request) => {
                            const ownJob = {
                                yes: (data) => {
                                    component.vtpRequest.completed++;
                                    if (typeof component['mountFromServer'] === 'function') {
                                        component['mountFromServer'](data, request);
                                    }
                                }
                            };

                            // Set jobs to empty object if not defined.
                            if (!request.hasOwnProperty('jobs')) {
                                request.jobs = {};
                            }

                            // Merge defined jobs with internal jobs
                            request.jobs = Lodash.extend(ownJob, request.jobs);

                            if (!request.hasOwnProperty('data')) {
                                request.data = {};
                            }

                            vm.doServerGet(request, request.jobs, component);
                        });
                    } else {
                        let jobs = {
                            yes: (data) => {
                                component.vtpRequest.completed++;
                                if (typeof component['mountFromServer'] === 'function') {
                                    component.mountFromServer(data, r);
                                }
                            }
                        };

                        if (typeof r === 'object' && Object.keys(r).length) {
                            jobs = Lodash.extend(jobs, r.jobs);
                            if (!r.hasOwnProperty('data')) {
                                r.data = {};
                            }
                            vm.doServerGet(r, jobs, component);
                        }
                    }
                }
            }
        };
    }

    doServerGet(request, jobs, component) {
        let cacheKey, data, newJob, thisCacheGetter, thisCacheKey;
        cacheKey = 'componentCache:';
        if (request.hasOwnProperty('cache')) {
            if (Array.isArray(request.cache)) {
                thisCacheKey = request.cache[0];
                thisCacheGetter = request.cache[1];
            } else {
                thisCacheKey = request.cache;
                thisCacheGetter = null;
            }
            cacheKey = cacheKey + thisCacheKey;
            if (StorageHelper.hasData(cacheKey)) {
                data = StorageHelper.getData(cacheKey);
                return jobs.yes(data);
            } else {
                newJob = {
                    yes: (data) => {
                        if (thisCacheGetter !== null) {
                            data = thisCacheGetter(data);
                        }
                        StorageHelper.setData(cacheKey, data);
                        return jobs.yes(data);
                    }
                };
                return component.$api.getFromRoute(request.route, request.data, newJob);
            }
        } else {
            return component.$api.getFromRoute(request.route, request.data, jobs);
        }
    }

}

HttpRequestMixin.prototype.route = '#';
HttpRequestMixin.prototype.data = {};
HttpRequestMixin.prototype.jobs = {};

export default HttpRequestMixin;
