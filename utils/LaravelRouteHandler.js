import ConfigManager from "../ConfigManager";

function removeLastChar(str, char, depth = 1) {
    str = str.trim();
    if (str.substring(str.length - depth) === char) {
        str = str.substring(0, str.length - depth);
    }
    return str;
}


export default function ($key = '--routes', $baseUrl = '') {
    let $routes = ConfigManager.loadAndDecodeData($key);


    return function (name, data = [], $customRoutes = undefined) {

        if ($customRoutes !== undefined) {
            $routes = $customRoutes
        }

        if ($routes === undefined) {
            console.error('No routes provided for LaravelRouteHandler');
            return name;
        }

        let index, item, key, l, len, link, linkQuery, linkSplit;

        if (Array.isArray(name)) {
            key = name[0];
            if (typeof name[1] !== "undefined" && Array.isArray(name[1])) {
                data = name[1];
            }
        } else {
            key = name;
        }

        link = key;

        if ($routes.hasOwnProperty(key)) {
            link = $routes[key];
            link = link.replace(/[{]+\w+[}]/g, '{?}');
            link = link.replace(/[{]+\w+[?][}]/g, '{?}');

            if (link.indexOf('{?}') > -1 && link.split('{?}').length > 1 && data.length > 0) {
                index = 0;
                linkSplit = link.split('{?}');
                for (l = 0, len = linkSplit.length; l < len; l++) {
                    item = linkSplit[l];
                    if (linkSplit.hasOwnProperty(index) && data.hasOwnProperty(index)) {
                        linkSplit[index] = item + data[index];
                    }
                    index++;
                }
                link = linkSplit.join('');
            }

            if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
                linkQuery = '?';
                _.each(data, function (val, key) {
                    return linkQuery += key + '=' + val + '&';
                });
                linkQuery = ng.removeLastChar(linkQuery, '&');
                link += linkQuery;
            }
        }

        link = $baseUrl + '/' + link;
        return link;
    }
}
