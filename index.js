const VueTrapPack = {

    install(Vue, options = {}) {

        if (options.hasOwnProperty('dataStore')) {

            Vue.prototype.$dataStore = options['dataStore']

        }

        if (options.hasOwnProperty('ear')) {

            Vue.prototype.$ear = options['ear']

        }


        // End with a Notification if development
        if(process.env.NODE_ENV === 'development'){
            console.log('Using Vue Trap Pack!');
        }
    }

};



export default VueTrapPack;