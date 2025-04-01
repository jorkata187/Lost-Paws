(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
    typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError'; 
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError'; 
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError'; 
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError'; 
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError'; 
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError'; 
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v.replace(/\+/g, " ")) }), {});

        let body;
        // If req stream has ended body has been parsed
        if (req.readableEnded) {
            body = req.body;
        } else {
            body = await parseBody(req);
        }

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }
    		
    		if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {
                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k,v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
         function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
    	users: {
    		"35c62d76-8152-4626-8712-eeb96381bea8": {
    			email: "peter@abv.bg",
    			username: "Peter",
    			hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
    		},
    		"847ec027-f659-4086-8032-5173e2f9c93a": {
    			email: "george@abv.bg",
    			username: "George",
    			hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
    		},
    		"60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
    			email: "admin@abv.bg",
    			username: "Admin",
    			hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
    		}
    	},
    	sessions: {
    	}
    };
    var seedData = {
    	recipes: {
    		"3987279d-0ad4-4afb-8ca9-5b256ae3b298": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			name: "Easy Lasagna",
    			img: "assets/lasagna.jpg",
    			ingredients: [
    				"1 tbsp Ingredient 1",
    				"2 cups Ingredient 2",
    				"500 g  Ingredient 3",
    				"25 g Ingredient 4"
    			],
    			steps: [
    				"Prepare ingredients",
    				"Mix ingredients",
    				"Cook until done"
    			],
    			_createdOn: 1613551279012
    		},
    		"8f414b4f-ab39-4d36-bedb-2ad69da9c830": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			name: "Grilled Duck Fillet",
    			img: "assets/roast.jpg",
    			ingredients: [
    				"500 g  Ingredient 1",
    				"3 tbsp Ingredient 2",
    				"2 cups Ingredient 3"
    			],
    			steps: [
    				"Prepare ingredients",
    				"Mix ingredients",
    				"Cook until done"
    			],
    			_createdOn: 1613551344360
    		},
    		"985d9eab-ad2e-4622-a5c8-116261fb1fd2": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			name: "Roast Trout",
    			img: "assets/fish.jpg",
    			ingredients: [
    				"4 cups Ingredient 1",
    				"1 tbsp Ingredient 2",
    				"1 tbsp Ingredient 3",
    				"750 g  Ingredient 4",
    				"25 g Ingredient 5"
    			],
    			steps: [
    				"Prepare ingredients",
    				"Mix ingredients",
    				"Cook until done"
    			],
    			_createdOn: 1613551388703
    		}
    	},
    	comments: {
    		"0a272c58-b7ea-4e09-a000-7ec988248f66": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			content: "Great recipe!",
    			recipeId: "8f414b4f-ab39-4d36-bedb-2ad69da9c830",
    			_createdOn: 1614260681375,
    			_id: "0a272c58-b7ea-4e09-a000-7ec988248f66"
    		}
    	},
    	records: {
    		i01: {
    			name: "John1",
    			val: 1,
    			_createdOn: 1613551388703
    		},
    		i02: {
    			name: "John2",
    			val: 1,
    			_createdOn: 1613551388713
    		},
    		i03: {
    			name: "John3",
    			val: 2,
    			_createdOn: 1613551388723
    		},
    		i04: {
    			name: "John4",
    			val: 2,
    			_createdOn: 1613551388733
    		},
    		i05: {
    			name: "John5",
    			val: 2,
    			_createdOn: 1613551388743
    		},
    		i06: {
    			name: "John6",
    			val: 3,
    			_createdOn: 1613551388753
    		},
    		i07: {
    			name: "John7",
    			val: 3,
    			_createdOn: 1613551388763
    		},
    		i08: {
    			name: "John8",
    			val: 2,
    			_createdOn: 1613551388773
    		},
    		i09: {
    			name: "John9",
    			val: 3,
    			_createdOn: 1613551388783
    		},
    		i10: {
    			name: "John10",
    			val: 1,
    			_createdOn: 1613551388793
    		}
    	},
    	catches: {
    		"07f260f4-466c-4607-9a33-f7273b24f1b4": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			angler: "Paulo Admorim",
    			weight: 636,
    			species: "Atlantic Blue Marlin",
    			location: "Vitoria, Brazil",
    			bait: "trolled pink",
    			captureTime: 80,
    			_createdOn: 1614760714812,
    			_id: "07f260f4-466c-4607-9a33-f7273b24f1b4"
    		},
    		"bdabf5e9-23be-40a1-9f14-9117b6702a9d": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			angler: "John Does",
    			weight: 554,
    			species: "Atlantic Blue Marlin",
    			location: "Buenos Aires, Argentina",
    			bait: "trolled pink",
    			captureTime: 120,
    			_createdOn: 1614760782277,
    			_id: "bdabf5e9-23be-40a1-9f14-9117b6702a9d"
    		}
    	},
    	furniture: {
    	},
    	orders: {
    	},
    	movies: {
    		"1240549d-f0e0-497e-ab99-eb8f703713d7": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			title: "Black Widow",
    			description: "Natasha Romanoff aka Black Widow confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Comes on the screens 2020.",
    			img: "https://miro.medium.com/max/735/1*akkAa2CcbKqHsvqVusF3-w.jpeg",
    			_createdOn: 1614935055353,
    			_id: "1240549d-f0e0-497e-ab99-eb8f703713d7"
    		},
    		"143e5265-333e-4150-80e4-16b61de31aa0": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			title: "Wonder Woman 1984",
    			description: "Diana must contend with a work colleague and businessman, whose desire for extreme wealth sends the world down a path of destruction, after an ancient artifact that grants wishes goes missing.",
    			img: "https://pbs.twimg.com/media/ETINgKwWAAAyA4r.jpg",
    			_createdOn: 1614935181470,
    			_id: "143e5265-333e-4150-80e4-16b61de31aa0"
    		},
    		"a9bae6d8-793e-46c4-a9db-deb9e3484909": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			title: "Top Gun 2",
    			description: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground him.",
    			img: "https://i.pinimg.com/originals/f2/a4/58/f2a458048757bc6914d559c9e4dc962a.jpg",
    			_createdOn: 1614935268135,
    			_id: "a9bae6d8-793e-46c4-a9db-deb9e3484909"
    		}
    	},
    	likes: {
    	},
    	ideas: {
    		"833e0e57-71dc-42c0-b387-0ce0caf5225e": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			title: "Best Pilates Workout To Do At Home",
    			description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima possimus eveniet ullam aspernatur corporis tempore quia nesciunt nostrum mollitia consequatur. At ducimus amet aliquid magnam nulla sed totam blanditiis ullam atque facilis corrupti quidem nisi iusto saepe, consectetur culpa possimus quos? Repellendus, dicta pariatur! Delectus, placeat debitis error dignissimos nesciunt magni possimus quo nulla, fuga corporis maxime minus nihil doloremque aliquam quia recusandae harum. Molestias dolorum recusandae commodi velit cum sapiente placeat alias rerum illum repudiandae? Suscipit tempore dolore autem, neque debitis quisquam molestias officia hic nesciunt? Obcaecati optio fugit blanditiis, explicabo odio at dicta asperiores distinctio expedita dolor est aperiam earum! Molestias sequi aliquid molestiae, voluptatum doloremque saepe dignissimos quidem quas harum quo. Eum nemo voluptatem hic corrupti officiis eaque et temporibus error totam numquam sequi nostrum assumenda eius voluptatibus quia sed vel, rerum, excepturi maxime? Pariatur, provident hic? Soluta corrupti aspernatur exercitationem vitae accusantium ut ullam dolor quod!",
    			img: "./images/best-pilates-youtube-workouts-2__medium_4x3.jpg",
    			_createdOn: 1615033373504,
    			_id: "833e0e57-71dc-42c0-b387-0ce0caf5225e"
    		},
    		"247efaa7-8a3e-48a7-813f-b5bfdad0f46c": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			title: "4 Eady DIY Idea To Try!",
    			description: "Similique rem culpa nemo hic recusandae perspiciatis quidem, quia expedita, sapiente est itaque optio enim placeat voluptates sit, fugit dignissimos tenetur temporibus exercitationem in quis magni sunt vel. Corporis officiis ut sapiente exercitationem consectetur debitis suscipit laborum quo enim iusto, labore, quod quam libero aliquid accusantium! Voluptatum quos porro fugit soluta tempore praesentium ratione dolorum impedit sunt dolores quod labore laudantium beatae architecto perspiciatis natus cupiditate, iure quia aliquid, iusto modi esse!",
    			img: "./images/brightideacropped.jpg",
    			_createdOn: 1615033452480,
    			_id: "247efaa7-8a3e-48a7-813f-b5bfdad0f46c"
    		},
    		"b8608c22-dd57-4b24-948e-b358f536b958": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			title: "Dinner Recipe",
    			description: "Consectetur labore et corporis nihil, officiis tempora, hic ex commodi sit aspernatur ad minima? Voluptas nesciunt, blanditiis ex nulla incidunt facere tempora laborum ut aliquid beatae obcaecati quidem reprehenderit consequatur quis iure natus quia totam vel. Amet explicabo quidem repellat unde tempore et totam minima mollitia, adipisci vel autem, enim voluptatem quasi exercitationem dolor cum repudiandae dolores nostrum sit ullam atque dicta, tempora iusto eaque! Rerum debitis voluptate impedit corrupti quibusdam consequatur minima, earum asperiores soluta. A provident reiciendis voluptates et numquam totam eveniet! Dolorum corporis libero dicta laborum illum accusamus ullam?",
    			img: "./images/dinner.jpg",
    			_createdOn: 1615033491967,
    			_id: "b8608c22-dd57-4b24-948e-b358f536b958"
    		}
    	},
    	catalog: {
    		"53d4dbf5-7f41-47ba-b485-43eccb91cb95": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			make: "Table",
    			model: "Swedish",
    			year: 2015,
    			description: "Medium table",
    			price: 235,
    			img: "./images/table.png",
    			material: "Hardwood",
    			_createdOn: 1615545143015,
    			_id: "53d4dbf5-7f41-47ba-b485-43eccb91cb95"
    		},
    		"f5929b5c-bca4-4026-8e6e-c09e73908f77": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			make: "Sofa",
    			model: "ES-549-M",
    			year: 2018,
    			description: "Three-person sofa, blue",
    			price: 1200,
    			img: "./images/sofa.jpg",
    			material: "Frame - steel, plastic; Upholstery - fabric",
    			_createdOn: 1615545572296,
    			_id: "f5929b5c-bca4-4026-8e6e-c09e73908f77"
    		},
    		"c7f51805-242b-45ed-ae3e-80b68605141b": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			make: "Chair",
    			model: "Bright Dining Collection",
    			year: 2017,
    			description: "Dining chair",
    			price: 180,
    			img: "./images/chair.jpg",
    			material: "Wood laminate; leather",
    			_createdOn: 1615546332126,
    			_id: "c7f51805-242b-45ed-ae3e-80b68605141b"
    		}
    	},
    	teams: {
    		"34a1cab1-81f1-47e5-aec3-ab6c9810efe1": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			name: "Storm Troopers",
    			logoUrl: "/assets/atat.png",
    			description: "These ARE the droids we're looking for",
    			_createdOn: 1615737591748,
    			_id: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1"
    		},
    		"dc888b1a-400f-47f3-9619-07607966feb8": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			name: "Team Rocket",
    			logoUrl: "/assets/rocket.png",
    			description: "Gotta catch 'em all!",
    			_createdOn: 1615737655083,
    			_id: "dc888b1a-400f-47f3-9619-07607966feb8"
    		},
    		"733fa9a1-26b6-490d-b299-21f120b2f53a": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			name: "Minions",
    			logoUrl: "/assets/hydrant.png",
    			description: "Friendly neighbourhood jelly beans, helping evil-doers succeed.",
    			_createdOn: 1615737688036,
    			_id: "733fa9a1-26b6-490d-b299-21f120b2f53a"
    		}
    	},




        paws: [
            {
                "_ownerId": "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "name": "Charley",
                "breed": "cavapoo",
                "age": "3",
                "imageUrl": "data:image/jpeg;base64,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",
                "summary": "Charley, a brawn Cavapoo, went missing on 21 December near Middle Road. He is 3 years old, friendly, and may be wearing a black collar. If found, please contact  me on 07534739087.",
                "_createdOn": 1743547796068,
                "_id": "7654fbf9-d80f-4932-a3b1-bfa17ea6e53c"
            },
            {
                "_ownerId": "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "name": "Max",
                "breed": "German Shepherd",
                "age": "5",
                "imageUrl": "data:image/jpeg;base64,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",
                "summary": "Help Find Our Lost German Shepherd: Max, a brawn-gold German Shepherd, disappeared on 2th January around London Road. He is 5 and could be wearing a tag. Any information is greatly appreciated – please contact 07583658646.\n\n\n\n",
                "_createdOn": 1743548657828,
                "_id": "bd680f65-7fc4-4d94-9d60-0c2d14fb3d7c"
            },
            {
                "_ownerId": "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "name": "Tom",
                "breed": "Golden Retriever",
                "age": "4",
                "imageUrl": "data:image/jpeg;base64,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",
                "summary": "Our German Shepherd, Tom, went missing on 5 May near Chesington. He is 4 years old. Please contact me on 07534343345 if you spot him.",
                "_createdOn": 1743549253212,
                "_id": "ef983ccb-5ae3-4a1e-a2ae-9cddb8dffe05"
            },
            {
                "_ownerId": "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "name": "Dexter",
                "breed": "Cocker Spaniel",
                "age": "6",
                "imageUrl": "data:image/jpeg;base64,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",
                "summary": "Dexter, a brawn cocker spaniel, was last seen on 8 Jun at Route 66. He is 6 years old. If you have any information, please reach out to 07437553377.",
                "_createdOn": 1743550008165,
                "_id": "d689adac-d8d7-44b1-9404-b7916eee57a3"
            },
        ],



        
    	members: {
    		"cc9b0a0f-655d-45d7-9857-0a61c6bb2c4d": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
    			status: "member",
    			_createdOn: 1616236790262,
    			_updatedOn: 1616236792930
    		},
    		"61a19986-3b86-4347-8ca4-8c074ed87591": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
    			status: "member",
    			_createdOn: 1616237188183,
    			_updatedOn: 1616237189016
    		},
    		"8a03aa56-7a82-4a6b-9821-91349fbc552f": {
    			_ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
    			teamId: "733fa9a1-26b6-490d-b299-21f120b2f53a",
    			status: "member",
    			_createdOn: 1616237193355,
    			_updatedOn: 1616237195145
    		},
    		"9be3ac7d-2c6e-4d74-b187-04105ab7e3d6": {
    			_ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
    			teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
    			status: "member",
    			_createdOn: 1616237231299,
    			_updatedOn: 1616237235713
    		},
    		"280b4a1a-d0f3-4639-aa54-6d9158365152": {
    			_ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
    			teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
    			status: "member",
    			_createdOn: 1616237257265,
    			_updatedOn: 1616237278248
    		},
    		"e797fa57-bf0a-4749-8028-72dba715e5f8": {
    			_ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
    			teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
    			status: "member",
    			_createdOn: 1616237272948,
    			_updatedOn: 1616237293676
    		}
    	}
    };
    var rules$1 = {
    	users: {
    		".create": false,
    		".read": [
    			"Owner"
    		],
    		".update": false,
    		".delete": false
    	},
    	members: {
    		".update": "isOwner(user, get('teams', data.teamId))",
    		".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
    		"*": {
    			teamId: {
    				".update": "newData.teamId = data.teamId"
    			},
    			status: {
    				".create": "newData.status = 'pending'"
    			}
    		}
    	}
    };
    var settings = {
    	identity: identity,
    	protectedData: protectedData,
    	seedData: seedData,
    	rules: rules$1
    };

    const plugins = [
        storage(settings),
        auth(settings),
        util$2(),
        rules(settings)
    ];

    const server = http__default['default'].createServer(requestHandler(plugins, services));

    const port = 3030;

    server.listen(port);

    console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
    console.log(`Admin panel located at http://localhost:${port}/admin`);

    var softuniPracticeServer = server;

    return softuniPracticeServer;

})));
