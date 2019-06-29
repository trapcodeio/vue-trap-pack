import ConfigManager from "../ConfigManager";

export default ($key = '--routes') => {
    let jsRoutes = $key;

    if (typeof $key === "string") {
        jsRoutes = ConfigManager.loadAndDecodeData($key);
    }

    return (route, $keys = [], $routes = undefined) => {
        if (Array.isArray(route)) {
            $keys = route[1];
            route = route[0];
        }

        if (typeof $keys === 'string') {
            $keys = [$keys];
        }

        if ($routes === undefined) {
            $routes = jsRoutes;
        }

        if ($routes === undefined) {
            console.error('No routes provided for XjsRouteHandler');
            return route;
        }

        if (typeof $routes[route] !== "undefined") {
            let routeUrl = $routes[route];

            if (routeUrl.substr(-1) === '*' && !$keys.length) {
                return routeUrl.substr(0, routeUrl.length - 1)
            }

            const hasParamsRule = new RegExp("[*]|(_[?][?]_)", 'g');
            const hasParam = routeUrl.match(hasParamsRule);

            if (Array.isArray(hasParam) && hasParam.length) {
                let counter = 0;
                const replacer = () => {
                    const key = $keys[counter] || '?';
                    counter++;
                    return key;
                };

                routeUrl = routeUrl.replace(hasParamsRule, replacer);
                return routeUrl;
            }

            return routeUrl;
        }

        return route;
    };
}
