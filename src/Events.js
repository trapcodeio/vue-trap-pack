vueEar = window.vueEar;


class ComponentEventsEngine {
    constructor(events) {
        this.events = events;
    }

    getMixin() {
        const vm = this;
        return {
            created() {
                Object.keys(vm.events).forEach((event) => {
                    return this.$ear.listenFor(event, (data = {}) => {
                        return vm.events[event](this, data);
                    });
                });
            },
            beforeDestroy() {
                Object.keys(vm.events).forEach(function (event) {
                    return this.$ear.stopListeningFor(event);
                });
            }
        };
    }

}

ComponentEventsEngine.prototype.events = {};
export default ComponentEventsEngine;

