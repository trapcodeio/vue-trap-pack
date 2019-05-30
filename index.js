import Request from './HttpRequest';
import XjsRouteHandler from './utils/XjsRouteToUrl'
import LaravelRouteHandler from './utils/LaravelRouteHandler'

let api = new Request();

const VueTrapPack = {

    /**
     *
     * @param Vue
     * @param {*} [options]
     * @return {{query, name: *, params}}
     */
    install(Vue, options = {}) {

        if (options.hasOwnProperty('api')) {
            api = options.api;
        }

        if (options.hasOwnProperty('framework')) {
            if (options.framework === 'xjs') {
                api.routeHandler = XjsRouteHandler();
            } else if (options.framework === 'laravel') {
                api.routeHandler = LaravelRouteHandler();
            }
        }

        Vue.prototype.$api = api;


        if (options.hasOwnProperty('store')) {

            Vue.prototype.$store = options['store']

        }

        if (options.hasOwnProperty('ear')) {

            Vue.prototype.$ear = options['ear']

        }

        let data = function () {
        };

        if (options.hasOwnProperty('autoload') && Object.keys(options.autoload).length) {
            data = function () {
                return options.autoload
            }
        }

        Vue.mixin({
            data,

            methods: {

                rl($name, $params = {}, $query = {}) {
                    return {
                        name: $name,
                        params: $params,
                        query: $query
                    };
                },

            }
        });

        // End with a Notification if development
        if (process.env.NODE_ENV === 'development') {
            console.log('Using Vue Trap Pack!');
        }
    }

};


export default VueTrapPack;