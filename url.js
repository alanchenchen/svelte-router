/**
 * parse url string to url object
 * 
 * @param {string} url
 * @returns {object}
 */
export const parse = (url) => {
    if (typeof url === "object") {
        url = stringify(url);
    }
    const list = url.split("?");
    const path = list[0].split("#")[0];
    const hash = list[0].split("#")[1] || "";
    const queryList = list[1];
    let query = queryList && queryList.split("&").map(item => {
        const key = item.split("=")[0];
        const val = item.split("=")[1];
        return {
            key,
            val
        }
    }) || [];
    query = query.reduce((total, item) => {
        return {
            ...total,
            [item.key]: item.val
        }
    }, {});
    return {
        path,
        url,
        query,
        hash
    }
}

/**
 * format url object to url string
 * 
 * @param {object} obj
 * @returns {string}
 */
export const stringify = (obj) => {
    if (typeof obj === "string") {
        return obj;
    }
    const querylist = Object.keys(obj.query).map(item => {
        return `${item}=${obj.query[item]}`
    }).join("&");
    const queryStr = querylist ? `?${querylist}` : ""
    const hashStr = obj.hash ? `#${obj.hash}` : "";
    return `${obj.path}${hashStr}${queryStr}`;
}

/**
 * parse dynamic rule route, if parse failed, return false, otherwise return an object.
 * 
 * @param {string} url 
 * @param {string} rule 
 * @returns {any}
 */
export const parseDynamicRoute = (url, rule) => {
    const urlList = url.split("/").filter(item => Boolean(item));
    const ruleList = rule.split("/").filter(item => Boolean(item));
    let params = {};
    if (urlList.length < ruleList.length) {
        return false;
    }
    for (let i = 0; i<= urlList.length -1; i++) {
        if (ruleList[i] === undefined) {
            break;
        }
        if (urlList[i] !== ruleList[i]) {
            if (ruleList[i].startsWith(":")) {
                params[ruleList[i].substring(1)] = urlList[i];
            } else {
                params = false;
                break;
            }
        }
    }
    return params;
}