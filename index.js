import RequestHandler from './src/Requests';

const VueTrapPack = {

    install(Vue, options = {}) {

        if (options.hasOwnProperty('dataStore')) {

            Vue.prototype.$dataStore = options['dataStore']

        }

        if (options.hasOwnProperty('vueEar')) {

            Vue.prototype.$ear = options['vueEar']

        }


        // End with a Notification if development
        if(process.env.NODE_ENV === 'development'){
            console.log('Using Vue Trap Pack!');
        }
    }

};

/**
 * Use VTP
 * @function
 *
 * @param $component
 * @param [$options]
 * @return {*}
 */
const useVTP = function ($component, $options = {}) {
    /*
    * Use $component['vtp'] as $options if exists
    *
    * Enables shorthand {vtp: {}, ....componentData}
    * */
    if ($component.hasOwnProperty('vtp')) {
        $options = $component['vtp'];
        delete $component['vtp'];
    }

    /*
    * Set mixins as Array if mixins does not exists.
     */
    if (!$component.hasOwnProperty('mixins')) {
        $component.mixins = [];
    }

    /*
    * If $options has `fetch` key, it's data will be sent
    * To the RequestHandler.
     */
    if (typeof $options['fetch'] !== "undefined") {
        $component.mixins.push(new RequestHandler($options.fetch))
    }

    return $component;
};

export {VueTrapPack, useVTP};