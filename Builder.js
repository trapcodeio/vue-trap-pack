import RequestHandler from './src/Requests';
import EventsHandler from './src/Events';

/**
 * Use VTP Builder
 * @function
 *
 * @param $component
 * @param [$options]
 * @return {*}
 */
const vtpBuilder = function ($component, $options = {}) {
    /*
    * Use $component['vtp'] as $options if exists
    *
    * Enables shorthand {vtp: {}, ...componentData}
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

    /*
    * If $options has `events` key, it's data will be sent
    * To the EventsHandler.
     */
    if (typeof $options['events'] !== "undefined") {
        const EventHandler = new EventsHandler($options.events);
        $component.mixins.push(EventHandler.getMixin())
    }

    return $component;
};

export default vtpBuilder;
