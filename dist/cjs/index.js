'use strict';

var ReactDOM = require('react-dom');
var React$1 = require('react');
var require$$1 = require('util');
var stream = require('stream');
var require$$1$1 = require('path');
var require$$3 = require('http');
var require$$4 = require('https');
var require$$0$1 = require('url');
var require$$6 = require('fs');
var require$$4$1 = require('assert');
var require$$1$2 = require('tty');
var require$$0$2 = require('os');
var zlib = require('zlib');
var EventEmitter = require('events');
var jsxRuntime = require('react/jsx-runtime');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React$1);

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

var Subscribable = /*#__PURE__*/function () {
  function Subscribable() {
    this.listeners = [];
  }

  var _proto = Subscribable.prototype;

  _proto.subscribe = function subscribe(listener) {
    var _this = this;

    var callback = listener || function () {
      return undefined;
    };

    this.listeners.push(callback);
    this.onSubscribe();
    return function () {
      _this.listeners = _this.listeners.filter(function (x) {
        return x !== callback;
      });

      _this.onUnsubscribe();
    };
  };

  _proto.hasListeners = function hasListeners() {
    return this.listeners.length > 0;
  };

  _proto.onSubscribe = function onSubscribe() {// Do nothing
  };

  _proto.onUnsubscribe = function onUnsubscribe() {// Do nothing
  };

  return Subscribable;
}();

function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}

// TYPES
// UTILS
var isServer = typeof window === 'undefined';
function noop$2() {
  return undefined;
}
function functionalUpdate(updater, input) {
  return typeof updater === 'function' ? updater(input) : updater;
}
function isValidTimeout(value) {
  return typeof value === 'number' && value >= 0 && value !== Infinity;
}
function ensureQueryKeyArray(value) {
  return Array.isArray(value) ? value : [value];
}
function timeUntilStale(updatedAt, staleTime) {
  return Math.max(updatedAt + (staleTime || 0) - Date.now(), 0);
}
function parseQueryArgs(arg1, arg2, arg3) {
  if (!isQueryKey(arg1)) {
    return arg1;
  }

  if (typeof arg2 === 'function') {
    return _extends$1({}, arg3, {
      queryKey: arg1,
      queryFn: arg2
    });
  }

  return _extends$1({}, arg2, {
    queryKey: arg1
  });
}
function parseFilterArgs(arg1, arg2, arg3) {
  return isQueryKey(arg1) ? [_extends$1({}, arg2, {
    queryKey: arg1
  }), arg3] : [arg1 || {}, arg2];
}
function mapQueryStatusFilter(active, inactive) {
  if (active === true && inactive === true || active == null && inactive == null) {
    return 'all';
  } else if (active === false && inactive === false) {
    return 'none';
  } else {
    // At this point, active|inactive can only be true|false or false|true
    // so, when only one value is provided, the missing one has to be the negated value
    var isActive = active != null ? active : !inactive;
    return isActive ? 'active' : 'inactive';
  }
}
function matchQuery(filters, query) {
  var active = filters.active,
      exact = filters.exact,
      fetching = filters.fetching,
      inactive = filters.inactive,
      predicate = filters.predicate,
      queryKey = filters.queryKey,
      stale = filters.stale;

  if (isQueryKey(queryKey)) {
    if (exact) {
      if (query.queryHash !== hashQueryKeyByOptions(queryKey, query.options)) {
        return false;
      }
    } else if (!partialMatchKey(query.queryKey, queryKey)) {
      return false;
    }
  }

  var queryStatusFilter = mapQueryStatusFilter(active, inactive);

  if (queryStatusFilter === 'none') {
    return false;
  } else if (queryStatusFilter !== 'all') {
    var isActive = query.isActive();

    if (queryStatusFilter === 'active' && !isActive) {
      return false;
    }

    if (queryStatusFilter === 'inactive' && isActive) {
      return false;
    }
  }

  if (typeof stale === 'boolean' && query.isStale() !== stale) {
    return false;
  }

  if (typeof fetching === 'boolean' && query.isFetching() !== fetching) {
    return false;
  }

  if (predicate && !predicate(query)) {
    return false;
  }

  return true;
}
function matchMutation(filters, mutation) {
  var exact = filters.exact,
      fetching = filters.fetching,
      predicate = filters.predicate,
      mutationKey = filters.mutationKey;

  if (isQueryKey(mutationKey)) {
    if (!mutation.options.mutationKey) {
      return false;
    }

    if (exact) {
      if (hashQueryKey(mutation.options.mutationKey) !== hashQueryKey(mutationKey)) {
        return false;
      }
    } else if (!partialMatchKey(mutation.options.mutationKey, mutationKey)) {
      return false;
    }
  }

  if (typeof fetching === 'boolean' && mutation.state.status === 'loading' !== fetching) {
    return false;
  }

  if (predicate && !predicate(mutation)) {
    return false;
  }

  return true;
}
function hashQueryKeyByOptions(queryKey, options) {
  var hashFn = (options == null ? void 0 : options.queryKeyHashFn) || hashQueryKey;
  return hashFn(queryKey);
}
/**
 * Default query keys hash function.
 */

function hashQueryKey(queryKey) {
  var asArray = ensureQueryKeyArray(queryKey);
  return stableValueHash(asArray);
}
/**
 * Hashes the value into a stable hash.
 */

function stableValueHash(value) {
  return JSON.stringify(value, function (_, val) {
    return isPlainObject$2(val) ? Object.keys(val).sort().reduce(function (result, key) {
      result[key] = val[key];
      return result;
    }, {}) : val;
  });
}
/**
 * Checks if key `b` partially matches with key `a`.
 */

function partialMatchKey(a, b) {
  return partialDeepEqual(ensureQueryKeyArray(a), ensureQueryKeyArray(b));
}
/**
 * Checks if `b` partially matches with `a`.
 */

function partialDeepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    return !Object.keys(b).some(function (key) {
      return !partialDeepEqual(a[key], b[key]);
    });
  }

  return false;
}
/**
 * This function returns `a` if `b` is deeply equal.
 * If not, it will replace any deeply equal children of `b` with those of `a`.
 * This can be used for structural sharing between JSON values for example.
 */

function replaceEqualDeep(a, b) {
  if (a === b) {
    return a;
  }

  var array = Array.isArray(a) && Array.isArray(b);

  if (array || isPlainObject$2(a) && isPlainObject$2(b)) {
    var aSize = array ? a.length : Object.keys(a).length;
    var bItems = array ? b : Object.keys(b);
    var bSize = bItems.length;
    var copy = array ? [] : {};
    var equalItems = 0;

    for (var i = 0; i < bSize; i++) {
      var key = array ? i : bItems[i];
      copy[key] = replaceEqualDeep(a[key], b[key]);

      if (copy[key] === a[key]) {
        equalItems++;
      }
    }

    return aSize === bSize && equalItems === aSize ? a : copy;
  }

  return b;
}
/**
 * Shallow compare objects. Only works with objects that always have the same properties.
 */

function shallowEqualObjects(a, b) {
  if (a && !b || b && !a) {
    return false;
  }

  for (var key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
} // Copied from: https://github.com/jonschlinkert/is-plain-object

function isPlainObject$2(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  } // If has modified constructor


  var ctor = o.constructor;

  if (typeof ctor === 'undefined') {
    return true;
  } // If has modified prototype


  var prot = ctor.prototype;

  if (!hasObjectPrototype(prot)) {
    return false;
  } // If constructor does not have an Object-specific method


  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  } // Most likely a plain Object


  return true;
}

function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isQueryKey(value) {
  return typeof value === 'string' || Array.isArray(value);
}
function sleep$1(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}
/**
 * Schedules a microtask.
 * This can be useful to schedule state updates after rendering.
 */

function scheduleMicrotask(callback) {
  Promise.resolve().then(callback).catch(function (error) {
    return setTimeout(function () {
      throw error;
    });
  });
}
function getAbortController() {
  if (typeof AbortController === 'function') {
    return new AbortController();
  }
}

var FocusManager = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(FocusManager, _Subscribable);

  function FocusManager() {
    var _this;

    _this = _Subscribable.call(this) || this;

    _this.setup = function (onFocus) {
      var _window;

      if (!isServer && ((_window = window) == null ? void 0 : _window.addEventListener)) {
        var listener = function listener() {
          return onFocus();
        }; // Listen to visibillitychange and focus


        window.addEventListener('visibilitychange', listener, false);
        window.addEventListener('focus', listener, false);
        return function () {
          // Be sure to unsubscribe if a new handler is set
          window.removeEventListener('visibilitychange', listener);
          window.removeEventListener('focus', listener);
        };
      }
    };

    return _this;
  }

  var _proto = FocusManager.prototype;

  _proto.onSubscribe = function onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  };

  _proto.onUnsubscribe = function onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;

      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = undefined;
    }
  };

  _proto.setEventListener = function setEventListener(setup) {
    var _this$cleanup2,
        _this2 = this;

    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup(function (focused) {
      if (typeof focused === 'boolean') {
        _this2.setFocused(focused);
      } else {
        _this2.onFocus();
      }
    });
  };

  _proto.setFocused = function setFocused(focused) {
    this.focused = focused;

    if (focused) {
      this.onFocus();
    }
  };

  _proto.onFocus = function onFocus() {
    this.listeners.forEach(function (listener) {
      listener();
    });
  };

  _proto.isFocused = function isFocused() {
    if (typeof this.focused === 'boolean') {
      return this.focused;
    } // document global can be unavailable in react native


    if (typeof document === 'undefined') {
      return true;
    }

    return [undefined, 'visible', 'prerender'].includes(document.visibilityState);
  };

  return FocusManager;
}(Subscribable);
var focusManager = new FocusManager();

var OnlineManager = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(OnlineManager, _Subscribable);

  function OnlineManager() {
    var _this;

    _this = _Subscribable.call(this) || this;

    _this.setup = function (onOnline) {
      var _window;

      if (!isServer && ((_window = window) == null ? void 0 : _window.addEventListener)) {
        var listener = function listener() {
          return onOnline();
        }; // Listen to online


        window.addEventListener('online', listener, false);
        window.addEventListener('offline', listener, false);
        return function () {
          // Be sure to unsubscribe if a new handler is set
          window.removeEventListener('online', listener);
          window.removeEventListener('offline', listener);
        };
      }
    };

    return _this;
  }

  var _proto = OnlineManager.prototype;

  _proto.onSubscribe = function onSubscribe() {
    if (!this.cleanup) {
      this.setEventListener(this.setup);
    }
  };

  _proto.onUnsubscribe = function onUnsubscribe() {
    if (!this.hasListeners()) {
      var _this$cleanup;

      (_this$cleanup = this.cleanup) == null ? void 0 : _this$cleanup.call(this);
      this.cleanup = undefined;
    }
  };

  _proto.setEventListener = function setEventListener(setup) {
    var _this$cleanup2,
        _this2 = this;

    this.setup = setup;
    (_this$cleanup2 = this.cleanup) == null ? void 0 : _this$cleanup2.call(this);
    this.cleanup = setup(function (online) {
      if (typeof online === 'boolean') {
        _this2.setOnline(online);
      } else {
        _this2.onOnline();
      }
    });
  };

  _proto.setOnline = function setOnline(online) {
    this.online = online;

    if (online) {
      this.onOnline();
    }
  };

  _proto.onOnline = function onOnline() {
    this.listeners.forEach(function (listener) {
      listener();
    });
  };

  _proto.isOnline = function isOnline() {
    if (typeof this.online === 'boolean') {
      return this.online;
    }

    if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
      return true;
    }

    return navigator.onLine;
  };

  return OnlineManager;
}(Subscribable);
var onlineManager = new OnlineManager();

function defaultRetryDelay(failureCount) {
  return Math.min(1000 * Math.pow(2, failureCount), 30000);
}

function isCancelable(value) {
  return typeof (value == null ? void 0 : value.cancel) === 'function';
}
var CancelledError = function CancelledError(options) {
  this.revert = options == null ? void 0 : options.revert;
  this.silent = options == null ? void 0 : options.silent;
};
function isCancelledError(value) {
  return value instanceof CancelledError;
} // CLASS

var Retryer = function Retryer(config) {
  var _this = this;

  var cancelRetry = false;
  var cancelFn;
  var continueFn;
  var promiseResolve;
  var promiseReject;
  this.abort = config.abort;

  this.cancel = function (cancelOptions) {
    return cancelFn == null ? void 0 : cancelFn(cancelOptions);
  };

  this.cancelRetry = function () {
    cancelRetry = true;
  };

  this.continueRetry = function () {
    cancelRetry = false;
  };

  this.continue = function () {
    return continueFn == null ? void 0 : continueFn();
  };

  this.failureCount = 0;
  this.isPaused = false;
  this.isResolved = false;
  this.isTransportCancelable = false;
  this.promise = new Promise(function (outerResolve, outerReject) {
    promiseResolve = outerResolve;
    promiseReject = outerReject;
  });

  var resolve = function resolve(value) {
    if (!_this.isResolved) {
      _this.isResolved = true;
      config.onSuccess == null ? void 0 : config.onSuccess(value);
      continueFn == null ? void 0 : continueFn();
      promiseResolve(value);
    }
  };

  var reject = function reject(value) {
    if (!_this.isResolved) {
      _this.isResolved = true;
      config.onError == null ? void 0 : config.onError(value);
      continueFn == null ? void 0 : continueFn();
      promiseReject(value);
    }
  };

  var pause = function pause() {
    return new Promise(function (continueResolve) {
      continueFn = continueResolve;
      _this.isPaused = true;
      config.onPause == null ? void 0 : config.onPause();
    }).then(function () {
      continueFn = undefined;
      _this.isPaused = false;
      config.onContinue == null ? void 0 : config.onContinue();
    });
  }; // Create loop function


  var run = function run() {
    // Do nothing if already resolved
    if (_this.isResolved) {
      return;
    }

    var promiseOrValue; // Execute query

    try {
      promiseOrValue = config.fn();
    } catch (error) {
      promiseOrValue = Promise.reject(error);
    } // Create callback to cancel this fetch


    cancelFn = function cancelFn(cancelOptions) {
      if (!_this.isResolved) {
        reject(new CancelledError(cancelOptions));
        _this.abort == null ? void 0 : _this.abort(); // Cancel transport if supported

        if (isCancelable(promiseOrValue)) {
          try {
            promiseOrValue.cancel();
          } catch (_unused) {}
        }
      }
    }; // Check if the transport layer support cancellation


    _this.isTransportCancelable = isCancelable(promiseOrValue);
    Promise.resolve(promiseOrValue).then(resolve).catch(function (error) {
      var _config$retry, _config$retryDelay;

      // Stop if the fetch is already resolved
      if (_this.isResolved) {
        return;
      } // Do we need to retry the request?


      var retry = (_config$retry = config.retry) != null ? _config$retry : 3;
      var retryDelay = (_config$retryDelay = config.retryDelay) != null ? _config$retryDelay : defaultRetryDelay;
      var delay = typeof retryDelay === 'function' ? retryDelay(_this.failureCount, error) : retryDelay;
      var shouldRetry = retry === true || typeof retry === 'number' && _this.failureCount < retry || typeof retry === 'function' && retry(_this.failureCount, error);

      if (cancelRetry || !shouldRetry) {
        // We are done if the query does not need to be retried
        reject(error);
        return;
      }

      _this.failureCount++; // Notify on fail

      config.onFail == null ? void 0 : config.onFail(_this.failureCount, error); // Delay

      sleep$1(delay) // Pause if the document is not visible or when the device is offline
      .then(function () {
        if (!focusManager.isFocused() || !onlineManager.isOnline()) {
          return pause();
        }
      }).then(function () {
        if (cancelRetry) {
          reject(error);
        } else {
          run();
        }
      });
    });
  }; // Start loop


  run();
};

// CLASS
var NotifyManager = /*#__PURE__*/function () {
  function NotifyManager() {
    this.queue = [];
    this.transactions = 0;

    this.notifyFn = function (callback) {
      callback();
    };

    this.batchNotifyFn = function (callback) {
      callback();
    };
  }

  var _proto = NotifyManager.prototype;

  _proto.batch = function batch(callback) {
    var result;
    this.transactions++;

    try {
      result = callback();
    } finally {
      this.transactions--;

      if (!this.transactions) {
        this.flush();
      }
    }

    return result;
  };

  _proto.schedule = function schedule(callback) {
    var _this = this;

    if (this.transactions) {
      this.queue.push(callback);
    } else {
      scheduleMicrotask(function () {
        _this.notifyFn(callback);
      });
    }
  }
  /**
   * All calls to the wrapped function will be batched.
   */
  ;

  _proto.batchCalls = function batchCalls(callback) {
    var _this2 = this;

    return function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this2.schedule(function () {
        callback.apply(void 0, args);
      });
    };
  };

  _proto.flush = function flush() {
    var _this3 = this;

    var queue = this.queue;
    this.queue = [];

    if (queue.length) {
      scheduleMicrotask(function () {
        _this3.batchNotifyFn(function () {
          queue.forEach(function (callback) {
            _this3.notifyFn(callback);
          });
        });
      });
    }
  }
  /**
   * Use this method to set a custom notify function.
   * This can be used to for example wrap notifications with `React.act` while running tests.
   */
  ;

  _proto.setNotifyFunction = function setNotifyFunction(fn) {
    this.notifyFn = fn;
  }
  /**
   * Use this method to set a custom function to batch notifications together into a single tick.
   * By default React Query will use the batch function provided by ReactDOM or React Native.
   */
  ;

  _proto.setBatchNotifyFunction = function setBatchNotifyFunction(fn) {
    this.batchNotifyFn = fn;
  };

  return NotifyManager;
}(); // SINGLETON

var notifyManager = new NotifyManager();

// TYPES
// FUNCTIONS
var logger$1 = console;
function getLogger() {
  return logger$1;
}
function setLogger(newLogger) {
  logger$1 = newLogger;
}

// CLASS
var Query = /*#__PURE__*/function () {
  function Query(config) {
    this.abortSignalConsumed = false;
    this.hadObservers = false;
    this.defaultOptions = config.defaultOptions;
    this.setOptions(config.options);
    this.observers = [];
    this.cache = config.cache;
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
    this.initialState = config.state || this.getDefaultState(this.options);
    this.state = this.initialState;
    this.meta = config.meta;
    this.scheduleGc();
  }

  var _proto = Query.prototype;

  _proto.setOptions = function setOptions(options) {
    var _this$options$cacheTi;

    this.options = _extends$1({}, this.defaultOptions, options);
    this.meta = options == null ? void 0 : options.meta; // Default to 5 minutes if not cache time is set

    this.cacheTime = Math.max(this.cacheTime || 0, (_this$options$cacheTi = this.options.cacheTime) != null ? _this$options$cacheTi : 5 * 60 * 1000);
  };

  _proto.setDefaultOptions = function setDefaultOptions(options) {
    this.defaultOptions = options;
  };

  _proto.scheduleGc = function scheduleGc() {
    var _this = this;

    this.clearGcTimeout();

    if (isValidTimeout(this.cacheTime)) {
      this.gcTimeout = setTimeout(function () {
        _this.optionalRemove();
      }, this.cacheTime);
    }
  };

  _proto.clearGcTimeout = function clearGcTimeout() {
    if (this.gcTimeout) {
      clearTimeout(this.gcTimeout);
      this.gcTimeout = undefined;
    }
  };

  _proto.optionalRemove = function optionalRemove() {
    if (!this.observers.length) {
      if (this.state.isFetching) {
        if (this.hadObservers) {
          this.scheduleGc();
        }
      } else {
        this.cache.remove(this);
      }
    }
  };

  _proto.setData = function setData(updater, options) {
    var _this$options$isDataE, _this$options;

    var prevData = this.state.data; // Get the new data

    var data = functionalUpdate(updater, prevData); // Use prev data if an isDataEqual function is defined and returns `true`

    if ((_this$options$isDataE = (_this$options = this.options).isDataEqual) == null ? void 0 : _this$options$isDataE.call(_this$options, prevData, data)) {
      data = prevData;
    } else if (this.options.structuralSharing !== false) {
      // Structurally share data between prev and new data if needed
      data = replaceEqualDeep(prevData, data);
    } // Set data and mark it as cached


    this.dispatch({
      data: data,
      type: 'success',
      dataUpdatedAt: options == null ? void 0 : options.updatedAt
    });
    return data;
  };

  _proto.setState = function setState(state, setStateOptions) {
    this.dispatch({
      type: 'setState',
      state: state,
      setStateOptions: setStateOptions
    });
  };

  _proto.cancel = function cancel(options) {
    var _this$retryer;

    var promise = this.promise;
    (_this$retryer = this.retryer) == null ? void 0 : _this$retryer.cancel(options);
    return promise ? promise.then(noop$2).catch(noop$2) : Promise.resolve();
  };

  _proto.destroy = function destroy() {
    this.clearGcTimeout();
    this.cancel({
      silent: true
    });
  };

  _proto.reset = function reset() {
    this.destroy();
    this.setState(this.initialState);
  };

  _proto.isActive = function isActive() {
    return this.observers.some(function (observer) {
      return observer.options.enabled !== false;
    });
  };

  _proto.isFetching = function isFetching() {
    return this.state.isFetching;
  };

  _proto.isStale = function isStale() {
    return this.state.isInvalidated || !this.state.dataUpdatedAt || this.observers.some(function (observer) {
      return observer.getCurrentResult().isStale;
    });
  };

  _proto.isStaleByTime = function isStaleByTime(staleTime) {
    if (staleTime === void 0) {
      staleTime = 0;
    }

    return this.state.isInvalidated || !this.state.dataUpdatedAt || !timeUntilStale(this.state.dataUpdatedAt, staleTime);
  };

  _proto.onFocus = function onFocus() {
    var _this$retryer2;

    var observer = this.observers.find(function (x) {
      return x.shouldFetchOnWindowFocus();
    });

    if (observer) {
      observer.refetch();
    } // Continue fetch if currently paused


    (_this$retryer2 = this.retryer) == null ? void 0 : _this$retryer2.continue();
  };

  _proto.onOnline = function onOnline() {
    var _this$retryer3;

    var observer = this.observers.find(function (x) {
      return x.shouldFetchOnReconnect();
    });

    if (observer) {
      observer.refetch();
    } // Continue fetch if currently paused


    (_this$retryer3 = this.retryer) == null ? void 0 : _this$retryer3.continue();
  };

  _proto.addObserver = function addObserver(observer) {
    if (this.observers.indexOf(observer) === -1) {
      this.observers.push(observer);
      this.hadObservers = true; // Stop the query from being garbage collected

      this.clearGcTimeout();
      this.cache.notify({
        type: 'observerAdded',
        query: this,
        observer: observer
      });
    }
  };

  _proto.removeObserver = function removeObserver(observer) {
    if (this.observers.indexOf(observer) !== -1) {
      this.observers = this.observers.filter(function (x) {
        return x !== observer;
      });

      if (!this.observers.length) {
        // If the transport layer does not support cancellation
        // we'll let the query continue so the result can be cached
        if (this.retryer) {
          if (this.retryer.isTransportCancelable || this.abortSignalConsumed) {
            this.retryer.cancel({
              revert: true
            });
          } else {
            this.retryer.cancelRetry();
          }
        }

        if (this.cacheTime) {
          this.scheduleGc();
        } else {
          this.cache.remove(this);
        }
      }

      this.cache.notify({
        type: 'observerRemoved',
        query: this,
        observer: observer
      });
    }
  };

  _proto.getObserversCount = function getObserversCount() {
    return this.observers.length;
  };

  _proto.invalidate = function invalidate() {
    if (!this.state.isInvalidated) {
      this.dispatch({
        type: 'invalidate'
      });
    }
  };

  _proto.fetch = function fetch(options, fetchOptions) {
    var _this2 = this,
        _this$options$behavio,
        _context$fetchOptions,
        _abortController$abor;

    if (this.state.isFetching) {
      if (this.state.dataUpdatedAt && (fetchOptions == null ? void 0 : fetchOptions.cancelRefetch)) {
        // Silently cancel current fetch if the user wants to cancel refetches
        this.cancel({
          silent: true
        });
      } else if (this.promise) {
        var _this$retryer4;

        // make sure that retries that were potentially cancelled due to unmounts can continue
        (_this$retryer4 = this.retryer) == null ? void 0 : _this$retryer4.continueRetry(); // Return current promise if we are already fetching

        return this.promise;
      }
    } // Update config if passed, otherwise the config from the last execution is used


    if (options) {
      this.setOptions(options);
    } // Use the options from the first observer with a query function if no function is found.
    // This can happen when the query is hydrated or created with setQueryData.


    if (!this.options.queryFn) {
      var observer = this.observers.find(function (x) {
        return x.options.queryFn;
      });

      if (observer) {
        this.setOptions(observer.options);
      }
    }

    var queryKey = ensureQueryKeyArray(this.queryKey);
    var abortController = getAbortController(); // Create query function context

    var queryFnContext = {
      queryKey: queryKey,
      pageParam: undefined,
      meta: this.meta
    };
    Object.defineProperty(queryFnContext, 'signal', {
      enumerable: true,
      get: function get() {
        if (abortController) {
          _this2.abortSignalConsumed = true;
          return abortController.signal;
        }

        return undefined;
      }
    }); // Create fetch function

    var fetchFn = function fetchFn() {
      if (!_this2.options.queryFn) {
        return Promise.reject('Missing queryFn');
      }

      _this2.abortSignalConsumed = false;
      return _this2.options.queryFn(queryFnContext);
    }; // Trigger behavior hook


    var context = {
      fetchOptions: fetchOptions,
      options: this.options,
      queryKey: queryKey,
      state: this.state,
      fetchFn: fetchFn,
      meta: this.meta
    };

    if ((_this$options$behavio = this.options.behavior) == null ? void 0 : _this$options$behavio.onFetch) {
      var _this$options$behavio2;

      (_this$options$behavio2 = this.options.behavior) == null ? void 0 : _this$options$behavio2.onFetch(context);
    } // Store state in case the current fetch needs to be reverted


    this.revertState = this.state; // Set to fetching state if not already in it

    if (!this.state.isFetching || this.state.fetchMeta !== ((_context$fetchOptions = context.fetchOptions) == null ? void 0 : _context$fetchOptions.meta)) {
      var _context$fetchOptions2;

      this.dispatch({
        type: 'fetch',
        meta: (_context$fetchOptions2 = context.fetchOptions) == null ? void 0 : _context$fetchOptions2.meta
      });
    } // Try to fetch the data


    this.retryer = new Retryer({
      fn: context.fetchFn,
      abort: abortController == null ? void 0 : (_abortController$abor = abortController.abort) == null ? void 0 : _abortController$abor.bind(abortController),
      onSuccess: function onSuccess(data) {
        _this2.setData(data); // Notify cache callback


        _this2.cache.config.onSuccess == null ? void 0 : _this2.cache.config.onSuccess(data, _this2); // Remove query after fetching if cache time is 0

        if (_this2.cacheTime === 0) {
          _this2.optionalRemove();
        }
      },
      onError: function onError(error) {
        // Optimistically update state if needed
        if (!(isCancelledError(error) && error.silent)) {
          _this2.dispatch({
            type: 'error',
            error: error
          });
        }

        if (!isCancelledError(error)) {
          // Notify cache callback
          _this2.cache.config.onError == null ? void 0 : _this2.cache.config.onError(error, _this2); // Log error

          getLogger().error(error);
        } // Remove query after fetching if cache time is 0


        if (_this2.cacheTime === 0) {
          _this2.optionalRemove();
        }
      },
      onFail: function onFail() {
        _this2.dispatch({
          type: 'failed'
        });
      },
      onPause: function onPause() {
        _this2.dispatch({
          type: 'pause'
        });
      },
      onContinue: function onContinue() {
        _this2.dispatch({
          type: 'continue'
        });
      },
      retry: context.options.retry,
      retryDelay: context.options.retryDelay
    });
    this.promise = this.retryer.promise;
    return this.promise;
  };

  _proto.dispatch = function dispatch(action) {
    var _this3 = this;

    this.state = this.reducer(this.state, action);
    notifyManager.batch(function () {
      _this3.observers.forEach(function (observer) {
        observer.onQueryUpdate(action);
      });

      _this3.cache.notify({
        query: _this3,
        type: 'queryUpdated',
        action: action
      });
    });
  };

  _proto.getDefaultState = function getDefaultState(options) {
    var data = typeof options.initialData === 'function' ? options.initialData() : options.initialData;
    var hasInitialData = typeof options.initialData !== 'undefined';
    var initialDataUpdatedAt = hasInitialData ? typeof options.initialDataUpdatedAt === 'function' ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
    var hasData = typeof data !== 'undefined';
    return {
      data: data,
      dataUpdateCount: 0,
      dataUpdatedAt: hasData ? initialDataUpdatedAt != null ? initialDataUpdatedAt : Date.now() : 0,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchMeta: null,
      isFetching: false,
      isInvalidated: false,
      isPaused: false,
      status: hasData ? 'success' : 'idle'
    };
  };

  _proto.reducer = function reducer(state, action) {
    var _action$meta, _action$dataUpdatedAt;

    switch (action.type) {
      case 'failed':
        return _extends$1({}, state, {
          fetchFailureCount: state.fetchFailureCount + 1
        });

      case 'pause':
        return _extends$1({}, state, {
          isPaused: true
        });

      case 'continue':
        return _extends$1({}, state, {
          isPaused: false
        });

      case 'fetch':
        return _extends$1({}, state, {
          fetchFailureCount: 0,
          fetchMeta: (_action$meta = action.meta) != null ? _action$meta : null,
          isFetching: true,
          isPaused: false
        }, !state.dataUpdatedAt && {
          error: null,
          status: 'loading'
        });

      case 'success':
        return _extends$1({}, state, {
          data: action.data,
          dataUpdateCount: state.dataUpdateCount + 1,
          dataUpdatedAt: (_action$dataUpdatedAt = action.dataUpdatedAt) != null ? _action$dataUpdatedAt : Date.now(),
          error: null,
          fetchFailureCount: 0,
          isFetching: false,
          isInvalidated: false,
          isPaused: false,
          status: 'success'
        });

      case 'error':
        var error = action.error;

        if (isCancelledError(error) && error.revert && this.revertState) {
          return _extends$1({}, this.revertState);
        }

        return _extends$1({}, state, {
          error: error,
          errorUpdateCount: state.errorUpdateCount + 1,
          errorUpdatedAt: Date.now(),
          fetchFailureCount: state.fetchFailureCount + 1,
          isFetching: false,
          isPaused: false,
          status: 'error'
        });

      case 'invalidate':
        return _extends$1({}, state, {
          isInvalidated: true
        });

      case 'setState':
        return _extends$1({}, state, action.state);

      default:
        return state;
    }
  };

  return Query;
}();

// CLASS
var QueryCache = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(QueryCache, _Subscribable);

  function QueryCache(config) {
    var _this;

    _this = _Subscribable.call(this) || this;
    _this.config = config || {};
    _this.queries = [];
    _this.queriesMap = {};
    return _this;
  }

  var _proto = QueryCache.prototype;

  _proto.build = function build(client, options, state) {
    var _options$queryHash;

    var queryKey = options.queryKey;
    var queryHash = (_options$queryHash = options.queryHash) != null ? _options$queryHash : hashQueryKeyByOptions(queryKey, options);
    var query = this.get(queryHash);

    if (!query) {
      query = new Query({
        cache: this,
        queryKey: queryKey,
        queryHash: queryHash,
        options: client.defaultQueryOptions(options),
        state: state,
        defaultOptions: client.getQueryDefaults(queryKey),
        meta: options.meta
      });
      this.add(query);
    }

    return query;
  };

  _proto.add = function add(query) {
    if (!this.queriesMap[query.queryHash]) {
      this.queriesMap[query.queryHash] = query;
      this.queries.push(query);
      this.notify({
        type: 'queryAdded',
        query: query
      });
    }
  };

  _proto.remove = function remove(query) {
    var queryInMap = this.queriesMap[query.queryHash];

    if (queryInMap) {
      query.destroy();
      this.queries = this.queries.filter(function (x) {
        return x !== query;
      });

      if (queryInMap === query) {
        delete this.queriesMap[query.queryHash];
      }

      this.notify({
        type: 'queryRemoved',
        query: query
      });
    }
  };

  _proto.clear = function clear() {
    var _this2 = this;

    notifyManager.batch(function () {
      _this2.queries.forEach(function (query) {
        _this2.remove(query);
      });
    });
  };

  _proto.get = function get(queryHash) {
    return this.queriesMap[queryHash];
  };

  _proto.getAll = function getAll() {
    return this.queries;
  };

  _proto.find = function find(arg1, arg2) {
    var _parseFilterArgs = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs[0];

    if (typeof filters.exact === 'undefined') {
      filters.exact = true;
    }

    return this.queries.find(function (query) {
      return matchQuery(filters, query);
    });
  };

  _proto.findAll = function findAll(arg1, arg2) {
    var _parseFilterArgs2 = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs2[0];

    return Object.keys(filters).length > 0 ? this.queries.filter(function (query) {
      return matchQuery(filters, query);
    }) : this.queries;
  };

  _proto.notify = function notify(event) {
    var _this3 = this;

    notifyManager.batch(function () {
      _this3.listeners.forEach(function (listener) {
        listener(event);
      });
    });
  };

  _proto.onFocus = function onFocus() {
    var _this4 = this;

    notifyManager.batch(function () {
      _this4.queries.forEach(function (query) {
        query.onFocus();
      });
    });
  };

  _proto.onOnline = function onOnline() {
    var _this5 = this;

    notifyManager.batch(function () {
      _this5.queries.forEach(function (query) {
        query.onOnline();
      });
    });
  };

  return QueryCache;
}(Subscribable);

// CLASS
var Mutation = /*#__PURE__*/function () {
  function Mutation(config) {
    this.options = _extends$1({}, config.defaultOptions, config.options);
    this.mutationId = config.mutationId;
    this.mutationCache = config.mutationCache;
    this.observers = [];
    this.state = config.state || getDefaultState();
    this.meta = config.meta;
  }

  var _proto = Mutation.prototype;

  _proto.setState = function setState(state) {
    this.dispatch({
      type: 'setState',
      state: state
    });
  };

  _proto.addObserver = function addObserver(observer) {
    if (this.observers.indexOf(observer) === -1) {
      this.observers.push(observer);
    }
  };

  _proto.removeObserver = function removeObserver(observer) {
    this.observers = this.observers.filter(function (x) {
      return x !== observer;
    });
  };

  _proto.cancel = function cancel() {
    if (this.retryer) {
      this.retryer.cancel();
      return this.retryer.promise.then(noop$2).catch(noop$2);
    }

    return Promise.resolve();
  };

  _proto.continue = function _continue() {
    if (this.retryer) {
      this.retryer.continue();
      return this.retryer.promise;
    }

    return this.execute();
  };

  _proto.execute = function execute() {
    var _this = this;

    var data;
    var restored = this.state.status === 'loading';
    var promise = Promise.resolve();

    if (!restored) {
      this.dispatch({
        type: 'loading',
        variables: this.options.variables
      });
      promise = promise.then(function () {
        // Notify cache callback
        _this.mutationCache.config.onMutate == null ? void 0 : _this.mutationCache.config.onMutate(_this.state.variables, _this);
      }).then(function () {
        return _this.options.onMutate == null ? void 0 : _this.options.onMutate(_this.state.variables);
      }).then(function (context) {
        if (context !== _this.state.context) {
          _this.dispatch({
            type: 'loading',
            context: context,
            variables: _this.state.variables
          });
        }
      });
    }

    return promise.then(function () {
      return _this.executeMutation();
    }).then(function (result) {
      data = result; // Notify cache callback

      _this.mutationCache.config.onSuccess == null ? void 0 : _this.mutationCache.config.onSuccess(data, _this.state.variables, _this.state.context, _this);
    }).then(function () {
      return _this.options.onSuccess == null ? void 0 : _this.options.onSuccess(data, _this.state.variables, _this.state.context);
    }).then(function () {
      return _this.options.onSettled == null ? void 0 : _this.options.onSettled(data, null, _this.state.variables, _this.state.context);
    }).then(function () {
      _this.dispatch({
        type: 'success',
        data: data
      });

      return data;
    }).catch(function (error) {
      // Notify cache callback
      _this.mutationCache.config.onError == null ? void 0 : _this.mutationCache.config.onError(error, _this.state.variables, _this.state.context, _this); // Log error

      getLogger().error(error);
      return Promise.resolve().then(function () {
        return _this.options.onError == null ? void 0 : _this.options.onError(error, _this.state.variables, _this.state.context);
      }).then(function () {
        return _this.options.onSettled == null ? void 0 : _this.options.onSettled(undefined, error, _this.state.variables, _this.state.context);
      }).then(function () {
        _this.dispatch({
          type: 'error',
          error: error
        });

        throw error;
      });
    });
  };

  _proto.executeMutation = function executeMutation() {
    var _this2 = this,
        _this$options$retry;

    this.retryer = new Retryer({
      fn: function fn() {
        if (!_this2.options.mutationFn) {
          return Promise.reject('No mutationFn found');
        }

        return _this2.options.mutationFn(_this2.state.variables);
      },
      onFail: function onFail() {
        _this2.dispatch({
          type: 'failed'
        });
      },
      onPause: function onPause() {
        _this2.dispatch({
          type: 'pause'
        });
      },
      onContinue: function onContinue() {
        _this2.dispatch({
          type: 'continue'
        });
      },
      retry: (_this$options$retry = this.options.retry) != null ? _this$options$retry : 0,
      retryDelay: this.options.retryDelay
    });
    return this.retryer.promise;
  };

  _proto.dispatch = function dispatch(action) {
    var _this3 = this;

    this.state = reducer(this.state, action);
    notifyManager.batch(function () {
      _this3.observers.forEach(function (observer) {
        observer.onMutationUpdate(action);
      });

      _this3.mutationCache.notify(_this3);
    });
  };

  return Mutation;
}();
function getDefaultState() {
  return {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    isPaused: false,
    status: 'idle',
    variables: undefined
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'failed':
      return _extends$1({}, state, {
        failureCount: state.failureCount + 1
      });

    case 'pause':
      return _extends$1({}, state, {
        isPaused: true
      });

    case 'continue':
      return _extends$1({}, state, {
        isPaused: false
      });

    case 'loading':
      return _extends$1({}, state, {
        context: action.context,
        data: undefined,
        error: null,
        isPaused: false,
        status: 'loading',
        variables: action.variables
      });

    case 'success':
      return _extends$1({}, state, {
        data: action.data,
        error: null,
        status: 'success',
        isPaused: false
      });

    case 'error':
      return _extends$1({}, state, {
        data: undefined,
        error: action.error,
        failureCount: state.failureCount + 1,
        isPaused: false,
        status: 'error'
      });

    case 'setState':
      return _extends$1({}, state, action.state);

    default:
      return state;
  }
}

// CLASS
var MutationCache = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(MutationCache, _Subscribable);

  function MutationCache(config) {
    var _this;

    _this = _Subscribable.call(this) || this;
    _this.config = config || {};
    _this.mutations = [];
    _this.mutationId = 0;
    return _this;
  }

  var _proto = MutationCache.prototype;

  _proto.build = function build(client, options, state) {
    var mutation = new Mutation({
      mutationCache: this,
      mutationId: ++this.mutationId,
      options: client.defaultMutationOptions(options),
      state: state,
      defaultOptions: options.mutationKey ? client.getMutationDefaults(options.mutationKey) : undefined,
      meta: options.meta
    });
    this.add(mutation);
    return mutation;
  };

  _proto.add = function add(mutation) {
    this.mutations.push(mutation);
    this.notify(mutation);
  };

  _proto.remove = function remove(mutation) {
    this.mutations = this.mutations.filter(function (x) {
      return x !== mutation;
    });
    mutation.cancel();
    this.notify(mutation);
  };

  _proto.clear = function clear() {
    var _this2 = this;

    notifyManager.batch(function () {
      _this2.mutations.forEach(function (mutation) {
        _this2.remove(mutation);
      });
    });
  };

  _proto.getAll = function getAll() {
    return this.mutations;
  };

  _proto.find = function find(filters) {
    if (typeof filters.exact === 'undefined') {
      filters.exact = true;
    }

    return this.mutations.find(function (mutation) {
      return matchMutation(filters, mutation);
    });
  };

  _proto.findAll = function findAll(filters) {
    return this.mutations.filter(function (mutation) {
      return matchMutation(filters, mutation);
    });
  };

  _proto.notify = function notify(mutation) {
    var _this3 = this;

    notifyManager.batch(function () {
      _this3.listeners.forEach(function (listener) {
        listener(mutation);
      });
    });
  };

  _proto.onFocus = function onFocus() {
    this.resumePausedMutations();
  };

  _proto.onOnline = function onOnline() {
    this.resumePausedMutations();
  };

  _proto.resumePausedMutations = function resumePausedMutations() {
    var pausedMutations = this.mutations.filter(function (x) {
      return x.state.isPaused;
    });
    return notifyManager.batch(function () {
      return pausedMutations.reduce(function (promise, mutation) {
        return promise.then(function () {
          return mutation.continue().catch(noop$2);
        });
      }, Promise.resolve());
    });
  };

  return MutationCache;
}(Subscribable);

function infiniteQueryBehavior() {
  return {
    onFetch: function onFetch(context) {
      context.fetchFn = function () {
        var _context$fetchOptions, _context$fetchOptions2, _context$fetchOptions3, _context$fetchOptions4, _context$state$data, _context$state$data2;

        var refetchPage = (_context$fetchOptions = context.fetchOptions) == null ? void 0 : (_context$fetchOptions2 = _context$fetchOptions.meta) == null ? void 0 : _context$fetchOptions2.refetchPage;
        var fetchMore = (_context$fetchOptions3 = context.fetchOptions) == null ? void 0 : (_context$fetchOptions4 = _context$fetchOptions3.meta) == null ? void 0 : _context$fetchOptions4.fetchMore;
        var pageParam = fetchMore == null ? void 0 : fetchMore.pageParam;
        var isFetchingNextPage = (fetchMore == null ? void 0 : fetchMore.direction) === 'forward';
        var isFetchingPreviousPage = (fetchMore == null ? void 0 : fetchMore.direction) === 'backward';
        var oldPages = ((_context$state$data = context.state.data) == null ? void 0 : _context$state$data.pages) || [];
        var oldPageParams = ((_context$state$data2 = context.state.data) == null ? void 0 : _context$state$data2.pageParams) || [];
        var abortController = getAbortController();
        var abortSignal = abortController == null ? void 0 : abortController.signal;
        var newPageParams = oldPageParams;
        var cancelled = false; // Get query function

        var queryFn = context.options.queryFn || function () {
          return Promise.reject('Missing queryFn');
        };

        var buildNewPages = function buildNewPages(pages, param, page, previous) {
          newPageParams = previous ? [param].concat(newPageParams) : [].concat(newPageParams, [param]);
          return previous ? [page].concat(pages) : [].concat(pages, [page]);
        }; // Create function to fetch a page


        var fetchPage = function fetchPage(pages, manual, param, previous) {
          if (cancelled) {
            return Promise.reject('Cancelled');
          }

          if (typeof param === 'undefined' && !manual && pages.length) {
            return Promise.resolve(pages);
          }

          var queryFnContext = {
            queryKey: context.queryKey,
            signal: abortSignal,
            pageParam: param,
            meta: context.meta
          };
          var queryFnResult = queryFn(queryFnContext);
          var promise = Promise.resolve(queryFnResult).then(function (page) {
            return buildNewPages(pages, param, page, previous);
          });

          if (isCancelable(queryFnResult)) {
            var promiseAsAny = promise;
            promiseAsAny.cancel = queryFnResult.cancel;
          }

          return promise;
        };

        var promise; // Fetch first page?

        if (!oldPages.length) {
          promise = fetchPage([]);
        } // Fetch next page?
        else if (isFetchingNextPage) {
            var manual = typeof pageParam !== 'undefined';
            var param = manual ? pageParam : getNextPageParam(context.options, oldPages);
            promise = fetchPage(oldPages, manual, param);
          } // Fetch previous page?
          else if (isFetchingPreviousPage) {
              var _manual = typeof pageParam !== 'undefined';

              var _param = _manual ? pageParam : getPreviousPageParam(context.options, oldPages);

              promise = fetchPage(oldPages, _manual, _param, true);
            } // Refetch pages
            else {
                (function () {
                  newPageParams = [];
                  var manual = typeof context.options.getNextPageParam === 'undefined';
                  var shouldFetchFirstPage = refetchPage && oldPages[0] ? refetchPage(oldPages[0], 0, oldPages) : true; // Fetch first page

                  promise = shouldFetchFirstPage ? fetchPage([], manual, oldPageParams[0]) : Promise.resolve(buildNewPages([], oldPageParams[0], oldPages[0])); // Fetch remaining pages

                  var _loop = function _loop(i) {
                    promise = promise.then(function (pages) {
                      var shouldFetchNextPage = refetchPage && oldPages[i] ? refetchPage(oldPages[i], i, oldPages) : true;

                      if (shouldFetchNextPage) {
                        var _param2 = manual ? oldPageParams[i] : getNextPageParam(context.options, pages);

                        return fetchPage(pages, manual, _param2);
                      }

                      return Promise.resolve(buildNewPages(pages, oldPageParams[i], oldPages[i]));
                    });
                  };

                  for (var i = 1; i < oldPages.length; i++) {
                    _loop(i);
                  }
                })();
              }

        var finalPromise = promise.then(function (pages) {
          return {
            pages: pages,
            pageParams: newPageParams
          };
        });
        var finalPromiseAsAny = finalPromise;

        finalPromiseAsAny.cancel = function () {
          cancelled = true;
          abortController == null ? void 0 : abortController.abort();

          if (isCancelable(promise)) {
            promise.cancel();
          }
        };

        return finalPromise;
      };
    }
  };
}
function getNextPageParam(options, pages) {
  return options.getNextPageParam == null ? void 0 : options.getNextPageParam(pages[pages.length - 1], pages);
}
function getPreviousPageParam(options, pages) {
  return options.getPreviousPageParam == null ? void 0 : options.getPreviousPageParam(pages[0], pages);
}

// CLASS
var QueryClient = /*#__PURE__*/function () {
  function QueryClient(config) {
    if (config === void 0) {
      config = {};
    }

    this.queryCache = config.queryCache || new QueryCache();
    this.mutationCache = config.mutationCache || new MutationCache();
    this.defaultOptions = config.defaultOptions || {};
    this.queryDefaults = [];
    this.mutationDefaults = [];
  }

  var _proto = QueryClient.prototype;

  _proto.mount = function mount() {
    var _this = this;

    this.unsubscribeFocus = focusManager.subscribe(function () {
      if (focusManager.isFocused() && onlineManager.isOnline()) {
        _this.mutationCache.onFocus();

        _this.queryCache.onFocus();
      }
    });
    this.unsubscribeOnline = onlineManager.subscribe(function () {
      if (focusManager.isFocused() && onlineManager.isOnline()) {
        _this.mutationCache.onOnline();

        _this.queryCache.onOnline();
      }
    });
  };

  _proto.unmount = function unmount() {
    var _this$unsubscribeFocu, _this$unsubscribeOnli;

    (_this$unsubscribeFocu = this.unsubscribeFocus) == null ? void 0 : _this$unsubscribeFocu.call(this);
    (_this$unsubscribeOnli = this.unsubscribeOnline) == null ? void 0 : _this$unsubscribeOnli.call(this);
  };

  _proto.isFetching = function isFetching(arg1, arg2) {
    var _parseFilterArgs = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs[0];

    filters.fetching = true;
    return this.queryCache.findAll(filters).length;
  };

  _proto.isMutating = function isMutating(filters) {
    return this.mutationCache.findAll(_extends$1({}, filters, {
      fetching: true
    })).length;
  };

  _proto.getQueryData = function getQueryData(queryKey, filters) {
    var _this$queryCache$find;

    return (_this$queryCache$find = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find.state.data;
  };

  _proto.getQueriesData = function getQueriesData(queryKeyOrFilters) {
    return this.getQueryCache().findAll(queryKeyOrFilters).map(function (_ref) {
      var queryKey = _ref.queryKey,
          state = _ref.state;
      var data = state.data;
      return [queryKey, data];
    });
  };

  _proto.setQueryData = function setQueryData(queryKey, updater, options) {
    var parsedOptions = parseQueryArgs(queryKey);
    var defaultedOptions = this.defaultQueryOptions(parsedOptions);
    return this.queryCache.build(this, defaultedOptions).setData(updater, options);
  };

  _proto.setQueriesData = function setQueriesData(queryKeyOrFilters, updater, options) {
    var _this2 = this;

    return notifyManager.batch(function () {
      return _this2.getQueryCache().findAll(queryKeyOrFilters).map(function (_ref2) {
        var queryKey = _ref2.queryKey;
        return [queryKey, _this2.setQueryData(queryKey, updater, options)];
      });
    });
  };

  _proto.getQueryState = function getQueryState(queryKey, filters) {
    var _this$queryCache$find2;

    return (_this$queryCache$find2 = this.queryCache.find(queryKey, filters)) == null ? void 0 : _this$queryCache$find2.state;
  };

  _proto.removeQueries = function removeQueries(arg1, arg2) {
    var _parseFilterArgs2 = parseFilterArgs(arg1, arg2),
        filters = _parseFilterArgs2[0];

    var queryCache = this.queryCache;
    notifyManager.batch(function () {
      queryCache.findAll(filters).forEach(function (query) {
        queryCache.remove(query);
      });
    });
  };

  _proto.resetQueries = function resetQueries(arg1, arg2, arg3) {
    var _this3 = this;

    var _parseFilterArgs3 = parseFilterArgs(arg1, arg2, arg3),
        filters = _parseFilterArgs3[0],
        options = _parseFilterArgs3[1];

    var queryCache = this.queryCache;

    var refetchFilters = _extends$1({}, filters, {
      active: true
    });

    return notifyManager.batch(function () {
      queryCache.findAll(filters).forEach(function (query) {
        query.reset();
      });
      return _this3.refetchQueries(refetchFilters, options);
    });
  };

  _proto.cancelQueries = function cancelQueries(arg1, arg2, arg3) {
    var _this4 = this;

    var _parseFilterArgs4 = parseFilterArgs(arg1, arg2, arg3),
        filters = _parseFilterArgs4[0],
        _parseFilterArgs4$ = _parseFilterArgs4[1],
        cancelOptions = _parseFilterArgs4$ === void 0 ? {} : _parseFilterArgs4$;

    if (typeof cancelOptions.revert === 'undefined') {
      cancelOptions.revert = true;
    }

    var promises = notifyManager.batch(function () {
      return _this4.queryCache.findAll(filters).map(function (query) {
        return query.cancel(cancelOptions);
      });
    });
    return Promise.all(promises).then(noop$2).catch(noop$2);
  };

  _proto.invalidateQueries = function invalidateQueries(arg1, arg2, arg3) {
    var _ref3,
        _filters$refetchActiv,
        _filters$refetchInact,
        _this5 = this;

    var _parseFilterArgs5 = parseFilterArgs(arg1, arg2, arg3),
        filters = _parseFilterArgs5[0],
        options = _parseFilterArgs5[1];

    var refetchFilters = _extends$1({}, filters, {
      // if filters.refetchActive is not provided and filters.active is explicitly false,
      // e.g. invalidateQueries({ active: false }), we don't want to refetch active queries
      active: (_ref3 = (_filters$refetchActiv = filters.refetchActive) != null ? _filters$refetchActiv : filters.active) != null ? _ref3 : true,
      inactive: (_filters$refetchInact = filters.refetchInactive) != null ? _filters$refetchInact : false
    });

    return notifyManager.batch(function () {
      _this5.queryCache.findAll(filters).forEach(function (query) {
        query.invalidate();
      });

      return _this5.refetchQueries(refetchFilters, options);
    });
  };

  _proto.refetchQueries = function refetchQueries(arg1, arg2, arg3) {
    var _this6 = this;

    var _parseFilterArgs6 = parseFilterArgs(arg1, arg2, arg3),
        filters = _parseFilterArgs6[0],
        options = _parseFilterArgs6[1];

    var promises = notifyManager.batch(function () {
      return _this6.queryCache.findAll(filters).map(function (query) {
        return query.fetch(undefined, _extends$1({}, options, {
          meta: {
            refetchPage: filters == null ? void 0 : filters.refetchPage
          }
        }));
      });
    });
    var promise = Promise.all(promises).then(noop$2);

    if (!(options == null ? void 0 : options.throwOnError)) {
      promise = promise.catch(noop$2);
    }

    return promise;
  };

  _proto.fetchQuery = function fetchQuery(arg1, arg2, arg3) {
    var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    var defaultedOptions = this.defaultQueryOptions(parsedOptions); // https://github.com/tannerlinsley/react-query/issues/652

    if (typeof defaultedOptions.retry === 'undefined') {
      defaultedOptions.retry = false;
    }

    var query = this.queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(defaultedOptions.staleTime) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  };

  _proto.prefetchQuery = function prefetchQuery(arg1, arg2, arg3) {
    return this.fetchQuery(arg1, arg2, arg3).then(noop$2).catch(noop$2);
  };

  _proto.fetchInfiniteQuery = function fetchInfiniteQuery(arg1, arg2, arg3) {
    var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
    parsedOptions.behavior = infiniteQueryBehavior();
    return this.fetchQuery(parsedOptions);
  };

  _proto.prefetchInfiniteQuery = function prefetchInfiniteQuery(arg1, arg2, arg3) {
    return this.fetchInfiniteQuery(arg1, arg2, arg3).then(noop$2).catch(noop$2);
  };

  _proto.cancelMutations = function cancelMutations() {
    var _this7 = this;

    var promises = notifyManager.batch(function () {
      return _this7.mutationCache.getAll().map(function (mutation) {
        return mutation.cancel();
      });
    });
    return Promise.all(promises).then(noop$2).catch(noop$2);
  };

  _proto.resumePausedMutations = function resumePausedMutations() {
    return this.getMutationCache().resumePausedMutations();
  };

  _proto.executeMutation = function executeMutation(options) {
    return this.mutationCache.build(this, options).execute();
  };

  _proto.getQueryCache = function getQueryCache() {
    return this.queryCache;
  };

  _proto.getMutationCache = function getMutationCache() {
    return this.mutationCache;
  };

  _proto.getDefaultOptions = function getDefaultOptions() {
    return this.defaultOptions;
  };

  _proto.setDefaultOptions = function setDefaultOptions(options) {
    this.defaultOptions = options;
  };

  _proto.setQueryDefaults = function setQueryDefaults(queryKey, options) {
    var result = this.queryDefaults.find(function (x) {
      return hashQueryKey(queryKey) === hashQueryKey(x.queryKey);
    });

    if (result) {
      result.defaultOptions = options;
    } else {
      this.queryDefaults.push({
        queryKey: queryKey,
        defaultOptions: options
      });
    }
  };

  _proto.getQueryDefaults = function getQueryDefaults(queryKey) {
    var _this$queryDefaults$f;

    return queryKey ? (_this$queryDefaults$f = this.queryDefaults.find(function (x) {
      return partialMatchKey(queryKey, x.queryKey);
    })) == null ? void 0 : _this$queryDefaults$f.defaultOptions : undefined;
  };

  _proto.setMutationDefaults = function setMutationDefaults(mutationKey, options) {
    var result = this.mutationDefaults.find(function (x) {
      return hashQueryKey(mutationKey) === hashQueryKey(x.mutationKey);
    });

    if (result) {
      result.defaultOptions = options;
    } else {
      this.mutationDefaults.push({
        mutationKey: mutationKey,
        defaultOptions: options
      });
    }
  };

  _proto.getMutationDefaults = function getMutationDefaults(mutationKey) {
    var _this$mutationDefault;

    return mutationKey ? (_this$mutationDefault = this.mutationDefaults.find(function (x) {
      return partialMatchKey(mutationKey, x.mutationKey);
    })) == null ? void 0 : _this$mutationDefault.defaultOptions : undefined;
  };

  _proto.defaultQueryOptions = function defaultQueryOptions(options) {
    if (options == null ? void 0 : options._defaulted) {
      return options;
    }

    var defaultedOptions = _extends$1({}, this.defaultOptions.queries, this.getQueryDefaults(options == null ? void 0 : options.queryKey), options, {
      _defaulted: true
    });

    if (!defaultedOptions.queryHash && defaultedOptions.queryKey) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(defaultedOptions.queryKey, defaultedOptions);
    }

    return defaultedOptions;
  };

  _proto.defaultQueryObserverOptions = function defaultQueryObserverOptions(options) {
    return this.defaultQueryOptions(options);
  };

  _proto.defaultMutationOptions = function defaultMutationOptions(options) {
    if (options == null ? void 0 : options._defaulted) {
      return options;
    }

    return _extends$1({}, this.defaultOptions.mutations, this.getMutationDefaults(options == null ? void 0 : options.mutationKey), options, {
      _defaulted: true
    });
  };

  _proto.clear = function clear() {
    this.queryCache.clear();
    this.mutationCache.clear();
  };

  return QueryClient;
}();

var QueryObserver = /*#__PURE__*/function (_Subscribable) {
  _inheritsLoose(QueryObserver, _Subscribable);

  function QueryObserver(client, options) {
    var _this;

    _this = _Subscribable.call(this) || this;
    _this.client = client;
    _this.options = options;
    _this.trackedProps = [];
    _this.selectError = null;

    _this.bindMethods();

    _this.setOptions(options);

    return _this;
  }

  var _proto = QueryObserver.prototype;

  _proto.bindMethods = function bindMethods() {
    this.remove = this.remove.bind(this);
    this.refetch = this.refetch.bind(this);
  };

  _proto.onSubscribe = function onSubscribe() {
    if (this.listeners.length === 1) {
      this.currentQuery.addObserver(this);

      if (shouldFetchOnMount(this.currentQuery, this.options)) {
        this.executeFetch();
      }

      this.updateTimers();
    }
  };

  _proto.onUnsubscribe = function onUnsubscribe() {
    if (!this.listeners.length) {
      this.destroy();
    }
  };

  _proto.shouldFetchOnReconnect = function shouldFetchOnReconnect() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnReconnect);
  };

  _proto.shouldFetchOnWindowFocus = function shouldFetchOnWindowFocus() {
    return shouldFetchOn(this.currentQuery, this.options, this.options.refetchOnWindowFocus);
  };

  _proto.destroy = function destroy() {
    this.listeners = [];
    this.clearTimers();
    this.currentQuery.removeObserver(this);
  };

  _proto.setOptions = function setOptions(options, notifyOptions) {
    var prevOptions = this.options;
    var prevQuery = this.currentQuery;
    this.options = this.client.defaultQueryObserverOptions(options);

    if (typeof this.options.enabled !== 'undefined' && typeof this.options.enabled !== 'boolean') {
      throw new Error('Expected enabled to be a boolean');
    } // Keep previous query key if the user does not supply one


    if (!this.options.queryKey) {
      this.options.queryKey = prevOptions.queryKey;
    }

    this.updateQuery();
    var mounted = this.hasListeners(); // Fetch if there are subscribers

    if (mounted && shouldFetchOptionally(this.currentQuery, prevQuery, this.options, prevOptions)) {
      this.executeFetch();
    } // Update result


    this.updateResult(notifyOptions); // Update stale interval if needed

    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || this.options.staleTime !== prevOptions.staleTime)) {
      this.updateStaleTimeout();
    }

    var nextRefetchInterval = this.computeRefetchInterval(); // Update refetch interval if needed

    if (mounted && (this.currentQuery !== prevQuery || this.options.enabled !== prevOptions.enabled || nextRefetchInterval !== this.currentRefetchInterval)) {
      this.updateRefetchInterval(nextRefetchInterval);
    }
  };

  _proto.getOptimisticResult = function getOptimisticResult(options) {
    var defaultedOptions = this.client.defaultQueryObserverOptions(options);
    var query = this.client.getQueryCache().build(this.client, defaultedOptions);
    return this.createResult(query, defaultedOptions);
  };

  _proto.getCurrentResult = function getCurrentResult() {
    return this.currentResult;
  };

  _proto.trackResult = function trackResult(result, defaultedOptions) {
    var _this2 = this;

    var trackedResult = {};

    var trackProp = function trackProp(key) {
      if (!_this2.trackedProps.includes(key)) {
        _this2.trackedProps.push(key);
      }
    };

    Object.keys(result).forEach(function (key) {
      Object.defineProperty(trackedResult, key, {
        configurable: false,
        enumerable: true,
        get: function get() {
          trackProp(key);
          return result[key];
        }
      });
    });

    if (defaultedOptions.useErrorBoundary || defaultedOptions.suspense) {
      trackProp('error');
    }

    return trackedResult;
  };

  _proto.getNextResult = function getNextResult(options) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      var unsubscribe = _this3.subscribe(function (result) {
        if (!result.isFetching) {
          unsubscribe();

          if (result.isError && (options == null ? void 0 : options.throwOnError)) {
            reject(result.error);
          } else {
            resolve(result);
          }
        }
      });
    });
  };

  _proto.getCurrentQuery = function getCurrentQuery() {
    return this.currentQuery;
  };

  _proto.remove = function remove() {
    this.client.getQueryCache().remove(this.currentQuery);
  };

  _proto.refetch = function refetch(options) {
    return this.fetch(_extends$1({}, options, {
      meta: {
        refetchPage: options == null ? void 0 : options.refetchPage
      }
    }));
  };

  _proto.fetchOptimistic = function fetchOptimistic(options) {
    var _this4 = this;

    var defaultedOptions = this.client.defaultQueryObserverOptions(options);
    var query = this.client.getQueryCache().build(this.client, defaultedOptions);
    return query.fetch().then(function () {
      return _this4.createResult(query, defaultedOptions);
    });
  };

  _proto.fetch = function fetch(fetchOptions) {
    var _this5 = this;

    return this.executeFetch(fetchOptions).then(function () {
      _this5.updateResult();

      return _this5.currentResult;
    });
  };

  _proto.executeFetch = function executeFetch(fetchOptions) {
    // Make sure we reference the latest query as the current one might have been removed
    this.updateQuery(); // Fetch

    var promise = this.currentQuery.fetch(this.options, fetchOptions);

    if (!(fetchOptions == null ? void 0 : fetchOptions.throwOnError)) {
      promise = promise.catch(noop$2);
    }

    return promise;
  };

  _proto.updateStaleTimeout = function updateStaleTimeout() {
    var _this6 = this;

    this.clearStaleTimeout();

    if (isServer || this.currentResult.isStale || !isValidTimeout(this.options.staleTime)) {
      return;
    }

    var time = timeUntilStale(this.currentResult.dataUpdatedAt, this.options.staleTime); // The timeout is sometimes triggered 1 ms before the stale time expiration.
    // To mitigate this issue we always add 1 ms to the timeout.

    var timeout = time + 1;
    this.staleTimeoutId = setTimeout(function () {
      if (!_this6.currentResult.isStale) {
        _this6.updateResult();
      }
    }, timeout);
  };

  _proto.computeRefetchInterval = function computeRefetchInterval() {
    var _this$options$refetch;

    return typeof this.options.refetchInterval === 'function' ? this.options.refetchInterval(this.currentResult.data, this.currentQuery) : (_this$options$refetch = this.options.refetchInterval) != null ? _this$options$refetch : false;
  };

  _proto.updateRefetchInterval = function updateRefetchInterval(nextInterval) {
    var _this7 = this;

    this.clearRefetchInterval();
    this.currentRefetchInterval = nextInterval;

    if (isServer || this.options.enabled === false || !isValidTimeout(this.currentRefetchInterval) || this.currentRefetchInterval === 0) {
      return;
    }

    this.refetchIntervalId = setInterval(function () {
      if (_this7.options.refetchIntervalInBackground || focusManager.isFocused()) {
        _this7.executeFetch();
      }
    }, this.currentRefetchInterval);
  };

  _proto.updateTimers = function updateTimers() {
    this.updateStaleTimeout();
    this.updateRefetchInterval(this.computeRefetchInterval());
  };

  _proto.clearTimers = function clearTimers() {
    this.clearStaleTimeout();
    this.clearRefetchInterval();
  };

  _proto.clearStaleTimeout = function clearStaleTimeout() {
    if (this.staleTimeoutId) {
      clearTimeout(this.staleTimeoutId);
      this.staleTimeoutId = undefined;
    }
  };

  _proto.clearRefetchInterval = function clearRefetchInterval() {
    if (this.refetchIntervalId) {
      clearInterval(this.refetchIntervalId);
      this.refetchIntervalId = undefined;
    }
  };

  _proto.createResult = function createResult(query, options) {
    var prevQuery = this.currentQuery;
    var prevOptions = this.options;
    var prevResult = this.currentResult;
    var prevResultState = this.currentResultState;
    var prevResultOptions = this.currentResultOptions;
    var queryChange = query !== prevQuery;
    var queryInitialState = queryChange ? query.state : this.currentQueryInitialState;
    var prevQueryResult = queryChange ? this.currentResult : this.previousQueryResult;
    var state = query.state;
    var dataUpdatedAt = state.dataUpdatedAt,
        error = state.error,
        errorUpdatedAt = state.errorUpdatedAt,
        isFetching = state.isFetching,
        status = state.status;
    var isPreviousData = false;
    var isPlaceholderData = false;
    var data; // Optimistically set result in fetching state if needed

    if (options.optimisticResults) {
      var mounted = this.hasListeners();
      var fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      var fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);

      if (fetchOnMount || fetchOptionally) {
        isFetching = true;

        if (!dataUpdatedAt) {
          status = 'loading';
        }
      }
    } // Keep previous data if needed


    if (options.keepPreviousData && !state.dataUpdateCount && (prevQueryResult == null ? void 0 : prevQueryResult.isSuccess) && status !== 'error') {
      data = prevQueryResult.data;
      dataUpdatedAt = prevQueryResult.dataUpdatedAt;
      status = prevQueryResult.status;
      isPreviousData = true;
    } // Select data if needed
    else if (options.select && typeof state.data !== 'undefined') {
        // Memoize select result
        if (prevResult && state.data === (prevResultState == null ? void 0 : prevResultState.data) && options.select === this.selectFn) {
          data = this.selectResult;
        } else {
          try {
            this.selectFn = options.select;
            data = options.select(state.data);

            if (options.structuralSharing !== false) {
              data = replaceEqualDeep(prevResult == null ? void 0 : prevResult.data, data);
            }

            this.selectResult = data;
            this.selectError = null;
          } catch (selectError) {
            getLogger().error(selectError);
            this.selectError = selectError;
          }
        }
      } // Use query data
      else {
          data = state.data;
        } // Show placeholder data if needed


    if (typeof options.placeholderData !== 'undefined' && typeof data === 'undefined' && (status === 'loading' || status === 'idle')) {
      var placeholderData; // Memoize placeholder data

      if ((prevResult == null ? void 0 : prevResult.isPlaceholderData) && options.placeholderData === (prevResultOptions == null ? void 0 : prevResultOptions.placeholderData)) {
        placeholderData = prevResult.data;
      } else {
        placeholderData = typeof options.placeholderData === 'function' ? options.placeholderData() : options.placeholderData;

        if (options.select && typeof placeholderData !== 'undefined') {
          try {
            placeholderData = options.select(placeholderData);

            if (options.structuralSharing !== false) {
              placeholderData = replaceEqualDeep(prevResult == null ? void 0 : prevResult.data, placeholderData);
            }

            this.selectError = null;
          } catch (selectError) {
            getLogger().error(selectError);
            this.selectError = selectError;
          }
        }
      }

      if (typeof placeholderData !== 'undefined') {
        status = 'success';
        data = placeholderData;
        isPlaceholderData = true;
      }
    }

    if (this.selectError) {
      error = this.selectError;
      data = this.selectResult;
      errorUpdatedAt = Date.now();
      status = 'error';
    }

    var result = {
      status: status,
      isLoading: status === 'loading',
      isSuccess: status === 'success',
      isError: status === 'error',
      isIdle: status === 'idle',
      data: data,
      dataUpdatedAt: dataUpdatedAt,
      error: error,
      errorUpdatedAt: errorUpdatedAt,
      failureCount: state.fetchFailureCount,
      errorUpdateCount: state.errorUpdateCount,
      isFetched: state.dataUpdateCount > 0 || state.errorUpdateCount > 0,
      isFetchedAfterMount: state.dataUpdateCount > queryInitialState.dataUpdateCount || state.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching: isFetching,
      isRefetching: isFetching && status !== 'loading',
      isLoadingError: status === 'error' && state.dataUpdatedAt === 0,
      isPlaceholderData: isPlaceholderData,
      isPreviousData: isPreviousData,
      isRefetchError: status === 'error' && state.dataUpdatedAt !== 0,
      isStale: isStale(query, options),
      refetch: this.refetch,
      remove: this.remove
    };
    return result;
  };

  _proto.shouldNotifyListeners = function shouldNotifyListeners(result, prevResult) {
    if (!prevResult) {
      return true;
    }

    var _this$options = this.options,
        notifyOnChangeProps = _this$options.notifyOnChangeProps,
        notifyOnChangePropsExclusions = _this$options.notifyOnChangePropsExclusions;

    if (!notifyOnChangeProps && !notifyOnChangePropsExclusions) {
      return true;
    }

    if (notifyOnChangeProps === 'tracked' && !this.trackedProps.length) {
      return true;
    }

    var includedProps = notifyOnChangeProps === 'tracked' ? this.trackedProps : notifyOnChangeProps;
    return Object.keys(result).some(function (key) {
      var typedKey = key;
      var changed = result[typedKey] !== prevResult[typedKey];
      var isIncluded = includedProps == null ? void 0 : includedProps.some(function (x) {
        return x === key;
      });
      var isExcluded = notifyOnChangePropsExclusions == null ? void 0 : notifyOnChangePropsExclusions.some(function (x) {
        return x === key;
      });
      return changed && !isExcluded && (!includedProps || isIncluded);
    });
  };

  _proto.updateResult = function updateResult(notifyOptions) {
    var prevResult = this.currentResult;
    this.currentResult = this.createResult(this.currentQuery, this.options);
    this.currentResultState = this.currentQuery.state;
    this.currentResultOptions = this.options; // Only notify if something has changed

    if (shallowEqualObjects(this.currentResult, prevResult)) {
      return;
    } // Determine which callbacks to trigger


    var defaultNotifyOptions = {
      cache: true
    };

    if ((notifyOptions == null ? void 0 : notifyOptions.listeners) !== false && this.shouldNotifyListeners(this.currentResult, prevResult)) {
      defaultNotifyOptions.listeners = true;
    }

    this.notify(_extends$1({}, defaultNotifyOptions, notifyOptions));
  };

  _proto.updateQuery = function updateQuery() {
    var query = this.client.getQueryCache().build(this.client, this.options);

    if (query === this.currentQuery) {
      return;
    }

    var prevQuery = this.currentQuery;
    this.currentQuery = query;
    this.currentQueryInitialState = query.state;
    this.previousQueryResult = this.currentResult;

    if (this.hasListeners()) {
      prevQuery == null ? void 0 : prevQuery.removeObserver(this);
      query.addObserver(this);
    }
  };

  _proto.onQueryUpdate = function onQueryUpdate(action) {
    var notifyOptions = {};

    if (action.type === 'success') {
      notifyOptions.onSuccess = true;
    } else if (action.type === 'error' && !isCancelledError(action.error)) {
      notifyOptions.onError = true;
    }

    this.updateResult(notifyOptions);

    if (this.hasListeners()) {
      this.updateTimers();
    }
  };

  _proto.notify = function notify(notifyOptions) {
    var _this8 = this;

    notifyManager.batch(function () {
      // First trigger the configuration callbacks
      if (notifyOptions.onSuccess) {
        _this8.options.onSuccess == null ? void 0 : _this8.options.onSuccess(_this8.currentResult.data);
        _this8.options.onSettled == null ? void 0 : _this8.options.onSettled(_this8.currentResult.data, null);
      } else if (notifyOptions.onError) {
        _this8.options.onError == null ? void 0 : _this8.options.onError(_this8.currentResult.error);
        _this8.options.onSettled == null ? void 0 : _this8.options.onSettled(undefined, _this8.currentResult.error);
      } // Then trigger the listeners


      if (notifyOptions.listeners) {
        _this8.listeners.forEach(function (listener) {
          listener(_this8.currentResult);
        });
      } // Then the cache listeners


      if (notifyOptions.cache) {
        _this8.client.getQueryCache().notify({
          query: _this8.currentQuery,
          type: 'observerResultsUpdated'
        });
      }
    });
  };

  return QueryObserver;
}(Subscribable);

function shouldLoadOnMount(query, options) {
  return options.enabled !== false && !query.state.dataUpdatedAt && !(query.state.status === 'error' && options.retryOnMount === false);
}

function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.dataUpdatedAt > 0 && shouldFetchOn(query, options, options.refetchOnMount);
}

function shouldFetchOn(query, options, field) {
  if (options.enabled !== false) {
    var value = typeof field === 'function' ? field(query) : field;
    return value === 'always' || value !== false && isStale(query, options);
  }

  return false;
}

function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return options.enabled !== false && (query !== prevQuery || prevOptions.enabled === false) && (!options.suspense || query.state.status !== 'error') && isStale(query, options);
}

function isStale(query, options) {
  return query.isStaleByTime(options.staleTime);
}

var unstable_batchedUpdates = ReactDOM.unstable_batchedUpdates;

notifyManager.setBatchNotifyFunction(unstable_batchedUpdates);

var logger = console;

setLogger(logger);

var defaultContext = /*#__PURE__*/React$1.createContext(undefined);
var QueryClientSharingContext = /*#__PURE__*/React$1.createContext(false); // if contextSharing is on, we share the first and at least one
// instance of the context across the window
// to ensure that if React Query is used across
// different bundles or microfrontends they will
// all use the same **instance** of context, regardless
// of module scoping.

function getQueryClientContext(contextSharing) {
  if (contextSharing && typeof window !== 'undefined') {
    if (!window.ReactQueryClientContext) {
      window.ReactQueryClientContext = defaultContext;
    }

    return window.ReactQueryClientContext;
  }

  return defaultContext;
}

var useQueryClient = function useQueryClient() {
  var queryClient = React$1.useContext(getQueryClientContext(React$1.useContext(QueryClientSharingContext)));

  if (!queryClient) {
    throw new Error('No QueryClient set, use QueryClientProvider to set one');
  }

  return queryClient;
};
var QueryClientProvider = function QueryClientProvider(_ref) {
  var client = _ref.client,
      _ref$contextSharing = _ref.contextSharing,
      contextSharing = _ref$contextSharing === void 0 ? false : _ref$contextSharing,
      children = _ref.children;
  React$1.useEffect(function () {
    client.mount();
    return function () {
      client.unmount();
    };
  }, [client]);
  var Context = getQueryClientContext(contextSharing);
  return /*#__PURE__*/React$1.createElement(QueryClientSharingContext.Provider, {
    value: contextSharing
  }, /*#__PURE__*/React$1.createElement(Context.Provider, {
    value: client
  }, children));
};

function createValue() {
  var _isReset = false;
  return {
    clearReset: function clearReset() {
      _isReset = false;
    },
    reset: function reset() {
      _isReset = true;
    },
    isReset: function isReset() {
      return _isReset;
    }
  };
}

var QueryErrorResetBoundaryContext = /*#__PURE__*/React$1.createContext(createValue()); // HOOK

var useQueryErrorResetBoundary = function useQueryErrorResetBoundary() {
  return React$1.useContext(QueryErrorResetBoundaryContext);
}; // COMPONENT

function shouldThrowError(suspense, _useErrorBoundary, params) {
  // Allow useErrorBoundary function to override throwing behavior on a per-error basis
  if (typeof _useErrorBoundary === 'function') {
    return _useErrorBoundary.apply(void 0, params);
  } // Allow useErrorBoundary to override suspense's throwing behavior


  if (typeof _useErrorBoundary === 'boolean') return _useErrorBoundary; // If suspense is enabled default to throwing errors

  return !!suspense;
}

function useBaseQuery(options, Observer) {
  var mountedRef = React$1.useRef(false);

  var _React$useState = React$1.useState(0),
      forceUpdate = _React$useState[1];

  var queryClient = useQueryClient();
  var errorResetBoundary = useQueryErrorResetBoundary();
  var defaultedOptions = queryClient.defaultQueryObserverOptions(options); // Make sure results are optimistically set in fetching state before subscribing or updating options

  defaultedOptions.optimisticResults = true; // Include callbacks in batch renders

  if (defaultedOptions.onError) {
    defaultedOptions.onError = notifyManager.batchCalls(defaultedOptions.onError);
  }

  if (defaultedOptions.onSuccess) {
    defaultedOptions.onSuccess = notifyManager.batchCalls(defaultedOptions.onSuccess);
  }

  if (defaultedOptions.onSettled) {
    defaultedOptions.onSettled = notifyManager.batchCalls(defaultedOptions.onSettled);
  }

  if (defaultedOptions.suspense) {
    // Always set stale time when using suspense to prevent
    // fetching again when directly mounting after suspending
    if (typeof defaultedOptions.staleTime !== 'number') {
      defaultedOptions.staleTime = 1000;
    } // Set cache time to 1 if the option has been set to 0
    // when using suspense to prevent infinite loop of fetches


    if (defaultedOptions.cacheTime === 0) {
      defaultedOptions.cacheTime = 1;
    }
  }

  if (defaultedOptions.suspense || defaultedOptions.useErrorBoundary) {
    // Prevent retrying failed query if the error boundary has not been reset yet
    if (!errorResetBoundary.isReset()) {
      defaultedOptions.retryOnMount = false;
    }
  }

  var _React$useState2 = React$1.useState(function () {
    return new Observer(queryClient, defaultedOptions);
  }),
      observer = _React$useState2[0];

  var result = observer.getOptimisticResult(defaultedOptions);
  React$1.useEffect(function () {
    mountedRef.current = true;
    errorResetBoundary.clearReset();
    var unsubscribe = observer.subscribe(notifyManager.batchCalls(function () {
      if (mountedRef.current) {
        forceUpdate(function (x) {
          return x + 1;
        });
      }
    })); // Update result to make sure we did not miss any query updates
    // between creating the observer and subscribing to it.

    observer.updateResult();
    return function () {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [errorResetBoundary, observer]);
  React$1.useEffect(function () {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions(defaultedOptions, {
      listeners: false
    });
  }, [defaultedOptions, observer]); // Handle suspense

  if (defaultedOptions.suspense && result.isLoading) {
    throw observer.fetchOptimistic(defaultedOptions).then(function (_ref) {
      var data = _ref.data;
      defaultedOptions.onSuccess == null ? void 0 : defaultedOptions.onSuccess(data);
      defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(data, null);
    }).catch(function (error) {
      errorResetBoundary.clearReset();
      defaultedOptions.onError == null ? void 0 : defaultedOptions.onError(error);
      defaultedOptions.onSettled == null ? void 0 : defaultedOptions.onSettled(undefined, error);
    });
  } // Handle error boundary


  if (result.isError && !errorResetBoundary.isReset() && !result.isFetching && shouldThrowError(defaultedOptions.suspense, defaultedOptions.useErrorBoundary, [result.error, observer.getCurrentQuery()])) {
    throw result.error;
  } // Handle result property usage tracking


  if (defaultedOptions.notifyOnChangeProps === 'tracked') {
    result = observer.trackResult(result, defaultedOptions);
  }

  return result;
}

function useQuery(arg1, arg2, arg3) {
  var parsedOptions = parseQueryArgs(arg1, arg2, arg3);
  return useBaseQuery(parsedOptions, QueryObserver);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}

// utils is a library of generic helper functions non-specific to axios

const {toString: toString$1} = Object.prototype;
const {getPrototypeOf: getPrototypeOf$1} = Object;

const kindOf = (cache => thing => {
    const str = toString$1.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
})(Object.create(null));

const kindOfTest = (type) => {
  type = type.toLowerCase();
  return (thing) => kindOf(thing) === type
};

const typeOfTest = type => thing => typeof thing === type;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 *
 * @returns {boolean} True if value is an Array, otherwise false
 */
const {isArray: isArray$3} = Array;

/**
 * Determine if a value is undefined
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if the value is undefined, otherwise false
 */
const isUndefined = typeOfTest('undefined');

/**
 * Determine if a value is a Buffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer$3(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && isFunction$3(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
const isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  let result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a String, otherwise false
 */
const isString$2 = typeOfTest('string');

/**
 * Determine if a value is a Function
 *
 * @param {*} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
const isFunction$3 = typeOfTest('function');

/**
 * Determine if a value is a Number
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Number, otherwise false
 */
const isNumber = typeOfTest('number');

/**
 * Determine if a value is an Object
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an Object, otherwise false
 */
const isObject$2 = (thing) => thing !== null && typeof thing === 'object';

/**
 * Determine if a value is a Boolean
 *
 * @param {*} thing The value to test
 * @returns {boolean} True if value is a Boolean, otherwise false
 */
const isBoolean = thing => thing === true || thing === false;

/**
 * Determine if a value is a plain Object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a plain Object, otherwise false
 */
const isPlainObject$1 = (val) => {
  if (kindOf(val) !== 'object') {
    return false;
  }

  const prototype = getPrototypeOf$1(val);
  return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in val) && !(Symbol.iterator in val);
};

/**
 * Determine if a value is a Date
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Date, otherwise false
 */
const isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Blob, otherwise false
 */
const isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a File, otherwise false
 */
const isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Stream
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a Stream, otherwise false
 */
const isStream = (val) => isObject$2(val) && isFunction$3(val.pipe);

/**
 * Determine if a value is a FormData
 *
 * @param {*} thing The value to test
 *
 * @returns {boolean} True if value is an FormData, otherwise false
 */
const isFormData = (thing) => {
  let kind;
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) || (
      isFunction$3(thing.append) && (
        (kind = kindOf(thing)) === 'formdata' ||
        // detect form-data instance
        (kind === 'object' && isFunction$3(thing.toString) && thing.toString() === '[object FormData]')
      )
    )
  )
};

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
const isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 *
 * @returns {String} The String freed of excess whitespace
 */
const trim = (str) => str.trim ?
  str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 *
 * @param {Boolean} [allOwnKeys = false]
 * @returns {any}
 */
function forEach(obj, fn, {allOwnKeys = false} = {}) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  let i;
  let l;

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray$3(obj)) {
    // Iterate over array values
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;

    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}

function findKey(obj, key) {
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}

const _global = (() => {
  /*eslint no-undef:0*/
  if (typeof globalThis !== "undefined") return globalThis;
  return typeof self !== "undefined" ? self : (typeof window !== 'undefined' ? window : global)
})();

const isContextDefined = (context) => !isUndefined(context) && context !== _global;

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 *
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  const {caseless} = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    const targetKey = caseless && findKey(result, key) || key;
    if (isPlainObject$1(result[targetKey]) && isPlainObject$1(val)) {
      result[targetKey] = merge(result[targetKey], val);
    } else if (isPlainObject$1(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray$3(val)) {
      result[targetKey] = val.slice();
    } else {
      result[targetKey] = val;
    }
  };

  for (let i = 0, l = arguments.length; i < l; i++) {
    arguments[i] && forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 *
 * @param {Boolean} [allOwnKeys]
 * @returns {Object} The resulting value of object a
 */
const extend = (a, b, thisArg, {allOwnKeys}= {}) => {
  forEach(b, (val, key) => {
    if (thisArg && isFunction$3(val)) {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  }, {allOwnKeys});
  return a;
};

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 *
 * @returns {string} content value without BOM
 */
const stripBOM = (content) => {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
};

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 *
 * @returns {void}
 */
const inherits = (constructor, superConstructor, props, descriptors) => {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  Object.defineProperty(constructor, 'super', {
    value: superConstructor.prototype
  });
  props && Object.assign(constructor.prototype, props);
};

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function|Boolean} [filter]
 * @param {Function} [propFilter]
 *
 * @returns {Object}
 */
const toFlatObject = (sourceObj, destObj, filter, propFilter) => {
  let props;
  let i;
  let prop;
  const merged = {};

  destObj = destObj || {};
  // eslint-disable-next-line no-eq-null,eqeqeq
  if (sourceObj == null) return destObj;

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = filter !== false && getPrototypeOf$1(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
};

/**
 * Determines whether a string ends with the characters of a specified string
 *
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 *
 * @returns {boolean}
 */
const endsWith = (str, searchString, position) => {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  const lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
};


/**
 * Returns new array from array like object or null if failed
 *
 * @param {*} [thing]
 *
 * @returns {?Array}
 */
const toArray = (thing) => {
  if (!thing) return null;
  if (isArray$3(thing)) return thing;
  let i = thing.length;
  if (!isNumber(i)) return null;
  const arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
};

/**
 * Checking if the Uint8Array exists and if it does, it returns a function that checks if the
 * thing passed in is an instance of Uint8Array
 *
 * @param {TypedArray}
 *
 * @returns {Array}
 */
// eslint-disable-next-line func-names
const isTypedArray$2 = (TypedArray => {
  // eslint-disable-next-line func-names
  return thing => {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && getPrototypeOf$1(Uint8Array));

/**
 * For each entry in the object, call the function with the key and value.
 *
 * @param {Object<any, any>} obj - The object to iterate over.
 * @param {Function} fn - The function to call for each entry.
 *
 * @returns {void}
 */
const forEachEntry = (obj, fn) => {
  const generator = obj && obj[Symbol.iterator];

  const iterator = generator.call(obj);

  let result;

  while ((result = iterator.next()) && !result.done) {
    const pair = result.value;
    fn.call(obj, pair[0], pair[1]);
  }
};

/**
 * It takes a regular expression and a string, and returns an array of all the matches
 *
 * @param {string} regExp - The regular expression to match against.
 * @param {string} str - The string to search.
 *
 * @returns {Array<boolean>}
 */
const matchAll = (regExp, str) => {
  let matches;
  const arr = [];

  while ((matches = regExp.exec(str)) !== null) {
    arr.push(matches);
  }

  return arr;
};

/* Checking if the kindOfTest function returns true when passed an HTMLFormElement. */
const isHTMLForm = kindOfTest('HTMLFormElement');

const toCamelCase = str => {
  return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g,
    function replacer(m, p1, p2) {
      return p1.toUpperCase() + p2;
    }
  );
};

/* Creating a function that will check if an object has a property. */
const hasOwnProperty$b = (({hasOwnProperty}) => (obj, prop) => hasOwnProperty.call(obj, prop))(Object.prototype);

/**
 * Determine if a value is a RegExp object
 *
 * @param {*} val The value to test
 *
 * @returns {boolean} True if value is a RegExp object, otherwise false
 */
const isRegExp = kindOfTest('RegExp');

const reduceDescriptors = (obj, reducer) => {
  const descriptors = Object.getOwnPropertyDescriptors(obj);
  const reducedDescriptors = {};

  forEach(descriptors, (descriptor, name) => {
    if (reducer(descriptor, name, obj) !== false) {
      reducedDescriptors[name] = descriptor;
    }
  });

  Object.defineProperties(obj, reducedDescriptors);
};

/**
 * Makes all methods read-only
 * @param {Object} obj
 */

const freezeMethods = (obj) => {
  reduceDescriptors(obj, (descriptor, name) => {
    // skip restricted props in strict mode
    if (isFunction$3(obj) && ['arguments', 'caller', 'callee'].indexOf(name) !== -1) {
      return false;
    }

    const value = obj[name];

    if (!isFunction$3(value)) return;

    descriptor.enumerable = false;

    if ('writable' in descriptor) {
      descriptor.writable = false;
      return;
    }

    if (!descriptor.set) {
      descriptor.set = () => {
        throw Error('Can not rewrite read-only method \'' + name + '\'');
      };
    }
  });
};

const toObjectSet = (arrayOrString, delimiter) => {
  const obj = {};

  const define = (arr) => {
    arr.forEach(value => {
      obj[value] = true;
    });
  };

  isArray$3(arrayOrString) ? define(arrayOrString) : define(String(arrayOrString).split(delimiter));

  return obj;
};

const noop$1 = () => {};

const toFiniteNumber = (value, defaultValue) => {
  value = +value;
  return Number.isFinite(value) ? value : defaultValue;
};

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

const DIGIT = '0123456789';

const ALPHABET = {
  DIGIT,
  ALPHA,
  ALPHA_DIGIT: ALPHA + ALPHA.toUpperCase() + DIGIT
};

const generateString = (size = 16, alphabet = ALPHABET.ALPHA_DIGIT) => {
  let str = '';
  const {length} = alphabet;
  while (size--) {
    str += alphabet[Math.random() * length|0];
  }

  return str;
};

/**
 * If the thing is a FormData object, return true, otherwise return false.
 *
 * @param {unknown} thing - The thing to check.
 *
 * @returns {boolean}
 */
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction$3(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator]);
}

const toJSONObject = (obj) => {
  const stack = new Array(10);

  const visit = (source, i) => {

    if (isObject$2(source)) {
      if (stack.indexOf(source) >= 0) {
        return;
      }

      if(!('toJSON' in source)) {
        stack[i] = source;
        const target = isArray$3(source) ? [] : {};

        forEach(source, (value, key) => {
          const reducedValue = visit(value, i + 1);
          !isUndefined(reducedValue) && (target[key] = reducedValue);
        });

        stack[i] = undefined;

        return target;
      }
    }

    return source;
  };

  return visit(obj, 0);
};

const isAsyncFn = kindOfTest('AsyncFunction');

const isThenable = (thing) =>
  thing && (isObject$2(thing) || isFunction$3(thing)) && isFunction$3(thing.then) && isFunction$3(thing.catch);

var utils = {
  isArray: isArray$3,
  isArrayBuffer,
  isBuffer: isBuffer$3,
  isFormData,
  isArrayBufferView,
  isString: isString$2,
  isNumber,
  isBoolean,
  isObject: isObject$2,
  isPlainObject: isPlainObject$1,
  isUndefined,
  isDate,
  isFile,
  isBlob,
  isRegExp,
  isFunction: isFunction$3,
  isStream,
  isURLSearchParams,
  isTypedArray: isTypedArray$2,
  isFileList,
  forEach,
  merge,
  extend,
  trim,
  stripBOM,
  inherits,
  toFlatObject,
  kindOf,
  kindOfTest,
  endsWith,
  toArray,
  forEachEntry,
  matchAll,
  isHTMLForm,
  hasOwnProperty: hasOwnProperty$b,
  hasOwnProp: hasOwnProperty$b, // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors,
  freezeMethods,
  toObjectSet,
  toCamelCase,
  noop: noop$1,
  toFiniteNumber,
  findKey,
  global: _global,
  isContextDefined,
  ALPHABET,
  generateString,
  isSpecCompliantForm,
  toJSONObject,
  isAsyncFn,
  isThenable
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 *
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }

  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: utils.toJSONObject(this.config),
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

const prototype$1 = AxiosError.prototype;
const descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL'
// eslint-disable-next-line func-names
].forEach(code => {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype$1, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = (error, code, config, request, response, customProps) => {
  const axiosError = Object.create(prototype$1);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  }, prop => {
    return prop !== 'isAxiosError';
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.cause = error;

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var Stream$2 = stream.Stream;
var util$2 = require$$1;

var delayed_stream = DelayedStream$1;
function DelayedStream$1() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;

  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util$2.inherits(DelayedStream$1, Stream$2);

DelayedStream$1.create = function(source, options) {
  var delayedStream = new this();

  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }

  delayedStream.source = source;

  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };

  source.on('error', function() {});
  if (delayedStream.pauseStream) {
    source.pause();
  }

  return delayedStream;
};

Object.defineProperty(DelayedStream$1.prototype, 'readable', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});

DelayedStream$1.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};

DelayedStream$1.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }

  this.source.resume();
};

DelayedStream$1.prototype.pause = function() {
  this.source.pause();
};

DelayedStream$1.prototype.release = function() {
  this._released = true;

  this._bufferedEvents.forEach(function(args) {
    this.emit.apply(this, args);
  }.bind(this));
  this._bufferedEvents = [];
};

DelayedStream$1.prototype.pipe = function() {
  var r = Stream$2.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};

DelayedStream$1.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }

  if (args[0] === 'data') {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }

  this._bufferedEvents.push(args);
};

DelayedStream$1.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }

  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  this._maxDataSizeExceeded = true;
  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
  this.emit('error', new Error(message));
};

var util$1 = require$$1;
var Stream$1 = stream.Stream;
var DelayedStream = delayed_stream;

var combined_stream = CombinedStream$1;
function CombinedStream$1() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;

  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util$1.inherits(CombinedStream$1, Stream$1);

CombinedStream$1.create = function(options) {
  var combinedStream = new this();

  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }

  return combinedStream;
};

CombinedStream$1.isStreamLike = function(stream) {
  return (typeof stream !== 'function')
    && (typeof stream !== 'string')
    && (typeof stream !== 'boolean')
    && (typeof stream !== 'number')
    && (!Buffer.isBuffer(stream));
};

CombinedStream$1.prototype.append = function(stream) {
  var isStreamLike = CombinedStream$1.isStreamLike(stream);

  if (isStreamLike) {
    if (!(stream instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams,
      });
      stream.on('data', this._checkDataSize.bind(this));
      stream = newStream;
    }

    this._handleErrors(stream);

    if (this.pauseStreams) {
      stream.pause();
    }
  }

  this._streams.push(stream);
  return this;
};

CombinedStream$1.prototype.pipe = function(dest, options) {
  Stream$1.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};

CombinedStream$1.prototype._getNext = function() {
  this._currentStream = null;

  if (this._insideLoop) {
    this._pendingNext = true;
    return; // defer call
  }

  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};

CombinedStream$1.prototype._realGetNext = function() {
  var stream = this._streams.shift();


  if (typeof stream == 'undefined') {
    this.end();
    return;
  }

  if (typeof stream !== 'function') {
    this._pipeNext(stream);
    return;
  }

  var getStream = stream;
  getStream(function(stream) {
    var isStreamLike = CombinedStream$1.isStreamLike(stream);
    if (isStreamLike) {
      stream.on('data', this._checkDataSize.bind(this));
      this._handleErrors(stream);
    }

    this._pipeNext(stream);
  }.bind(this));
};

CombinedStream$1.prototype._pipeNext = function(stream) {
  this._currentStream = stream;

  var isStreamLike = CombinedStream$1.isStreamLike(stream);
  if (isStreamLike) {
    stream.on('end', this._getNext.bind(this));
    stream.pipe(this, {end: false});
    return;
  }

  var value = stream;
  this.write(value);
  this._getNext();
};

CombinedStream$1.prototype._handleErrors = function(stream) {
  var self = this;
  stream.on('error', function(err) {
    self._emitError(err);
  });
};

CombinedStream$1.prototype.write = function(data) {
  this.emit('data', data);
};

CombinedStream$1.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
  this.emit('pause');
};

CombinedStream$1.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
  this.emit('resume');
};

CombinedStream$1.prototype.end = function() {
  this._reset();
  this.emit('end');
};

CombinedStream$1.prototype.destroy = function() {
  this._reset();
  this.emit('close');
};

CombinedStream$1.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};

CombinedStream$1.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
  this._emitError(new Error(message));
};

CombinedStream$1.prototype._updateDataSize = function() {
  this.dataSize = 0;

  var self = this;
  this._streams.forEach(function(stream) {
    if (!stream.dataSize) {
      return;
    }

    self.dataSize += stream.dataSize;
  });

  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};

CombinedStream$1.prototype._emitError = function(err) {
  this._reset();
  this.emit('error', err);
};

var mimeTypes = {};

var require$$0 = {
	"application/1d-interleaved-parityfec": {
	source: "iana"
},
	"application/3gpdash-qoe-report+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/3gpp-ims+xml": {
	source: "iana",
	compressible: true
},
	"application/3gpphal+json": {
	source: "iana",
	compressible: true
},
	"application/3gpphalforms+json": {
	source: "iana",
	compressible: true
},
	"application/a2l": {
	source: "iana"
},
	"application/ace+cbor": {
	source: "iana"
},
	"application/activemessage": {
	source: "iana"
},
	"application/activity+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-directory+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcost+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcostparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointprop+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointpropparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-error+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamcontrol+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamparams+json": {
	source: "iana",
	compressible: true
},
	"application/aml": {
	source: "iana"
},
	"application/andrew-inset": {
	source: "iana",
	extensions: [
		"ez"
	]
},
	"application/applefile": {
	source: "iana"
},
	"application/applixware": {
	source: "apache",
	extensions: [
		"aw"
	]
},
	"application/at+jwt": {
	source: "iana"
},
	"application/atf": {
	source: "iana"
},
	"application/atfx": {
	source: "iana"
},
	"application/atom+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atom"
	]
},
	"application/atomcat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomcat"
	]
},
	"application/atomdeleted+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomdeleted"
	]
},
	"application/atomicmail": {
	source: "iana"
},
	"application/atomsvc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomsvc"
	]
},
	"application/atsc-dwd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dwd"
	]
},
	"application/atsc-dynamic-event-message": {
	source: "iana"
},
	"application/atsc-held+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"held"
	]
},
	"application/atsc-rdt+json": {
	source: "iana",
	compressible: true
},
	"application/atsc-rsat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsat"
	]
},
	"application/atxml": {
	source: "iana"
},
	"application/auth-policy+xml": {
	source: "iana",
	compressible: true
},
	"application/bacnet-xdd+zip": {
	source: "iana",
	compressible: false
},
	"application/batch-smtp": {
	source: "iana"
},
	"application/bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/beep+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/calendar+json": {
	source: "iana",
	compressible: true
},
	"application/calendar+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xcs"
	]
},
	"application/call-completion": {
	source: "iana"
},
	"application/cals-1840": {
	source: "iana"
},
	"application/captive+json": {
	source: "iana",
	compressible: true
},
	"application/cbor": {
	source: "iana"
},
	"application/cbor-seq": {
	source: "iana"
},
	"application/cccex": {
	source: "iana"
},
	"application/ccmp+xml": {
	source: "iana",
	compressible: true
},
	"application/ccxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ccxml"
	]
},
	"application/cdfx+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdfx"
	]
},
	"application/cdmi-capability": {
	source: "iana",
	extensions: [
		"cdmia"
	]
},
	"application/cdmi-container": {
	source: "iana",
	extensions: [
		"cdmic"
	]
},
	"application/cdmi-domain": {
	source: "iana",
	extensions: [
		"cdmid"
	]
},
	"application/cdmi-object": {
	source: "iana",
	extensions: [
		"cdmio"
	]
},
	"application/cdmi-queue": {
	source: "iana",
	extensions: [
		"cdmiq"
	]
},
	"application/cdni": {
	source: "iana"
},
	"application/cea": {
	source: "iana"
},
	"application/cea-2018+xml": {
	source: "iana",
	compressible: true
},
	"application/cellml+xml": {
	source: "iana",
	compressible: true
},
	"application/cfw": {
	source: "iana"
},
	"application/city+json": {
	source: "iana",
	compressible: true
},
	"application/clr": {
	source: "iana"
},
	"application/clue+xml": {
	source: "iana",
	compressible: true
},
	"application/clue_info+xml": {
	source: "iana",
	compressible: true
},
	"application/cms": {
	source: "iana"
},
	"application/cnrp+xml": {
	source: "iana",
	compressible: true
},
	"application/coap-group+json": {
	source: "iana",
	compressible: true
},
	"application/coap-payload": {
	source: "iana"
},
	"application/commonground": {
	source: "iana"
},
	"application/conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/cose": {
	source: "iana"
},
	"application/cose-key": {
	source: "iana"
},
	"application/cose-key-set": {
	source: "iana"
},
	"application/cpl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cpl"
	]
},
	"application/csrattrs": {
	source: "iana"
},
	"application/csta+xml": {
	source: "iana",
	compressible: true
},
	"application/cstadata+xml": {
	source: "iana",
	compressible: true
},
	"application/csvm+json": {
	source: "iana",
	compressible: true
},
	"application/cu-seeme": {
	source: "apache",
	extensions: [
		"cu"
	]
},
	"application/cwt": {
	source: "iana"
},
	"application/cybercash": {
	source: "iana"
},
	"application/dart": {
	compressible: true
},
	"application/dash+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpd"
	]
},
	"application/dash-patch+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpp"
	]
},
	"application/dashdelta": {
	source: "iana"
},
	"application/davmount+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"davmount"
	]
},
	"application/dca-rft": {
	source: "iana"
},
	"application/dcd": {
	source: "iana"
},
	"application/dec-dx": {
	source: "iana"
},
	"application/dialog-info+xml": {
	source: "iana",
	compressible: true
},
	"application/dicom": {
	source: "iana"
},
	"application/dicom+json": {
	source: "iana",
	compressible: true
},
	"application/dicom+xml": {
	source: "iana",
	compressible: true
},
	"application/dii": {
	source: "iana"
},
	"application/dit": {
	source: "iana"
},
	"application/dns": {
	source: "iana"
},
	"application/dns+json": {
	source: "iana",
	compressible: true
},
	"application/dns-message": {
	source: "iana"
},
	"application/docbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dbk"
	]
},
	"application/dots+cbor": {
	source: "iana"
},
	"application/dskpp+xml": {
	source: "iana",
	compressible: true
},
	"application/dssc+der": {
	source: "iana",
	extensions: [
		"dssc"
	]
},
	"application/dssc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdssc"
	]
},
	"application/dvcs": {
	source: "iana"
},
	"application/ecmascript": {
	source: "iana",
	compressible: true,
	extensions: [
		"es",
		"ecma"
	]
},
	"application/edi-consent": {
	source: "iana"
},
	"application/edi-x12": {
	source: "iana",
	compressible: false
},
	"application/edifact": {
	source: "iana",
	compressible: false
},
	"application/efi": {
	source: "iana"
},
	"application/elm+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/elm+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.cap+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/emergencycalldata.comment+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.control+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.deviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.ecall.msd": {
	source: "iana"
},
	"application/emergencycalldata.providerinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.serviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.subscriberinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.veds+xml": {
	source: "iana",
	compressible: true
},
	"application/emma+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emma"
	]
},
	"application/emotionml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emotionml"
	]
},
	"application/encaprtp": {
	source: "iana"
},
	"application/epp+xml": {
	source: "iana",
	compressible: true
},
	"application/epub+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"epub"
	]
},
	"application/eshop": {
	source: "iana"
},
	"application/exi": {
	source: "iana",
	extensions: [
		"exi"
	]
},
	"application/expect-ct-report+json": {
	source: "iana",
	compressible: true
},
	"application/express": {
	source: "iana",
	extensions: [
		"exp"
	]
},
	"application/fastinfoset": {
	source: "iana"
},
	"application/fastsoap": {
	source: "iana"
},
	"application/fdt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fdt"
	]
},
	"application/fhir+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fhir+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fido.trusted-apps+json": {
	compressible: true
},
	"application/fits": {
	source: "iana"
},
	"application/flexfec": {
	source: "iana"
},
	"application/font-sfnt": {
	source: "iana"
},
	"application/font-tdpfr": {
	source: "iana",
	extensions: [
		"pfr"
	]
},
	"application/font-woff": {
	source: "iana",
	compressible: false
},
	"application/framework-attributes+xml": {
	source: "iana",
	compressible: true
},
	"application/geo+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"geojson"
	]
},
	"application/geo+json-seq": {
	source: "iana"
},
	"application/geopackage+sqlite3": {
	source: "iana"
},
	"application/geoxacml+xml": {
	source: "iana",
	compressible: true
},
	"application/gltf-buffer": {
	source: "iana"
},
	"application/gml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"gml"
	]
},
	"application/gpx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"gpx"
	]
},
	"application/gxf": {
	source: "apache",
	extensions: [
		"gxf"
	]
},
	"application/gzip": {
	source: "iana",
	compressible: false,
	extensions: [
		"gz"
	]
},
	"application/h224": {
	source: "iana"
},
	"application/held+xml": {
	source: "iana",
	compressible: true
},
	"application/hjson": {
	extensions: [
		"hjson"
	]
},
	"application/http": {
	source: "iana"
},
	"application/hyperstudio": {
	source: "iana",
	extensions: [
		"stk"
	]
},
	"application/ibe-key-request+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pkg-reply+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pp-data": {
	source: "iana"
},
	"application/iges": {
	source: "iana"
},
	"application/im-iscomposing+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/index": {
	source: "iana"
},
	"application/index.cmd": {
	source: "iana"
},
	"application/index.obj": {
	source: "iana"
},
	"application/index.response": {
	source: "iana"
},
	"application/index.vnd": {
	source: "iana"
},
	"application/inkml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ink",
		"inkml"
	]
},
	"application/iotp": {
	source: "iana"
},
	"application/ipfix": {
	source: "iana",
	extensions: [
		"ipfix"
	]
},
	"application/ipp": {
	source: "iana"
},
	"application/isup": {
	source: "iana"
},
	"application/its+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"its"
	]
},
	"application/java-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"jar",
		"war",
		"ear"
	]
},
	"application/java-serialized-object": {
	source: "apache",
	compressible: false,
	extensions: [
		"ser"
	]
},
	"application/java-vm": {
	source: "apache",
	compressible: false,
	extensions: [
		"class"
	]
},
	"application/javascript": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"js",
		"mjs"
	]
},
	"application/jf2feed+json": {
	source: "iana",
	compressible: true
},
	"application/jose": {
	source: "iana"
},
	"application/jose+json": {
	source: "iana",
	compressible: true
},
	"application/jrd+json": {
	source: "iana",
	compressible: true
},
	"application/jscalendar+json": {
	source: "iana",
	compressible: true
},
	"application/json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"json",
		"map"
	]
},
	"application/json-patch+json": {
	source: "iana",
	compressible: true
},
	"application/json-seq": {
	source: "iana"
},
	"application/json5": {
	extensions: [
		"json5"
	]
},
	"application/jsonml+json": {
	source: "apache",
	compressible: true,
	extensions: [
		"jsonml"
	]
},
	"application/jwk+json": {
	source: "iana",
	compressible: true
},
	"application/jwk-set+json": {
	source: "iana",
	compressible: true
},
	"application/jwt": {
	source: "iana"
},
	"application/kpml-request+xml": {
	source: "iana",
	compressible: true
},
	"application/kpml-response+xml": {
	source: "iana",
	compressible: true
},
	"application/ld+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"jsonld"
	]
},
	"application/lgr+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lgr"
	]
},
	"application/link-format": {
	source: "iana"
},
	"application/load-control+xml": {
	source: "iana",
	compressible: true
},
	"application/lost+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lostxml"
	]
},
	"application/lostsync+xml": {
	source: "iana",
	compressible: true
},
	"application/lpf+zip": {
	source: "iana",
	compressible: false
},
	"application/lxf": {
	source: "iana"
},
	"application/mac-binhex40": {
	source: "iana",
	extensions: [
		"hqx"
	]
},
	"application/mac-compactpro": {
	source: "apache",
	extensions: [
		"cpt"
	]
},
	"application/macwriteii": {
	source: "iana"
},
	"application/mads+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mads"
	]
},
	"application/manifest+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"webmanifest"
	]
},
	"application/marc": {
	source: "iana",
	extensions: [
		"mrc"
	]
},
	"application/marcxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mrcx"
	]
},
	"application/mathematica": {
	source: "iana",
	extensions: [
		"ma",
		"nb",
		"mb"
	]
},
	"application/mathml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mathml"
	]
},
	"application/mathml-content+xml": {
	source: "iana",
	compressible: true
},
	"application/mathml-presentation+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-associated-procedure-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-deregister+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-envelope+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-protection-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-reception-report+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-schedule+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-user-service-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbox": {
	source: "iana",
	extensions: [
		"mbox"
	]
},
	"application/media-policy-dataset+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpf"
	]
},
	"application/media_control+xml": {
	source: "iana",
	compressible: true
},
	"application/mediaservercontrol+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mscml"
	]
},
	"application/merge-patch+json": {
	source: "iana",
	compressible: true
},
	"application/metalink+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"metalink"
	]
},
	"application/metalink4+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"meta4"
	]
},
	"application/mets+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mets"
	]
},
	"application/mf4": {
	source: "iana"
},
	"application/mikey": {
	source: "iana"
},
	"application/mipc": {
	source: "iana"
},
	"application/missing-blocks+cbor-seq": {
	source: "iana"
},
	"application/mmt-aei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"maei"
	]
},
	"application/mmt-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musd"
	]
},
	"application/mods+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mods"
	]
},
	"application/moss-keys": {
	source: "iana"
},
	"application/moss-signature": {
	source: "iana"
},
	"application/mosskey-data": {
	source: "iana"
},
	"application/mosskey-request": {
	source: "iana"
},
	"application/mp21": {
	source: "iana",
	extensions: [
		"m21",
		"mp21"
	]
},
	"application/mp4": {
	source: "iana",
	extensions: [
		"mp4s",
		"m4p"
	]
},
	"application/mpeg4-generic": {
	source: "iana"
},
	"application/mpeg4-iod": {
	source: "iana"
},
	"application/mpeg4-iod-xmt": {
	source: "iana"
},
	"application/mrb-consumer+xml": {
	source: "iana",
	compressible: true
},
	"application/mrb-publish+xml": {
	source: "iana",
	compressible: true
},
	"application/msc-ivr+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msc-mixer+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msword": {
	source: "iana",
	compressible: false,
	extensions: [
		"doc",
		"dot"
	]
},
	"application/mud+json": {
	source: "iana",
	compressible: true
},
	"application/multipart-core": {
	source: "iana"
},
	"application/mxf": {
	source: "iana",
	extensions: [
		"mxf"
	]
},
	"application/n-quads": {
	source: "iana",
	extensions: [
		"nq"
	]
},
	"application/n-triples": {
	source: "iana",
	extensions: [
		"nt"
	]
},
	"application/nasdata": {
	source: "iana"
},
	"application/news-checkgroups": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-groupinfo": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-transmission": {
	source: "iana"
},
	"application/nlsml+xml": {
	source: "iana",
	compressible: true
},
	"application/node": {
	source: "iana",
	extensions: [
		"cjs"
	]
},
	"application/nss": {
	source: "iana"
},
	"application/oauth-authz-req+jwt": {
	source: "iana"
},
	"application/oblivious-dns-message": {
	source: "iana"
},
	"application/ocsp-request": {
	source: "iana"
},
	"application/ocsp-response": {
	source: "iana"
},
	"application/octet-stream": {
	source: "iana",
	compressible: false,
	extensions: [
		"bin",
		"dms",
		"lrf",
		"mar",
		"so",
		"dist",
		"distz",
		"pkg",
		"bpk",
		"dump",
		"elc",
		"deploy",
		"exe",
		"dll",
		"deb",
		"dmg",
		"iso",
		"img",
		"msi",
		"msp",
		"msm",
		"buffer"
	]
},
	"application/oda": {
	source: "iana",
	extensions: [
		"oda"
	]
},
	"application/odm+xml": {
	source: "iana",
	compressible: true
},
	"application/odx": {
	source: "iana"
},
	"application/oebps-package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"opf"
	]
},
	"application/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogx"
	]
},
	"application/omdoc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"omdoc"
	]
},
	"application/onenote": {
	source: "apache",
	extensions: [
		"onetoc",
		"onetoc2",
		"onetmp",
		"onepkg"
	]
},
	"application/opc-nodeset+xml": {
	source: "iana",
	compressible: true
},
	"application/oscore": {
	source: "iana"
},
	"application/oxps": {
	source: "iana",
	extensions: [
		"oxps"
	]
},
	"application/p21": {
	source: "iana"
},
	"application/p21+zip": {
	source: "iana",
	compressible: false
},
	"application/p2p-overlay+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"relo"
	]
},
	"application/parityfec": {
	source: "iana"
},
	"application/passport": {
	source: "iana"
},
	"application/patch-ops-error+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xer"
	]
},
	"application/pdf": {
	source: "iana",
	compressible: false,
	extensions: [
		"pdf"
	]
},
	"application/pdx": {
	source: "iana"
},
	"application/pem-certificate-chain": {
	source: "iana"
},
	"application/pgp-encrypted": {
	source: "iana",
	compressible: false,
	extensions: [
		"pgp"
	]
},
	"application/pgp-keys": {
	source: "iana",
	extensions: [
		"asc"
	]
},
	"application/pgp-signature": {
	source: "iana",
	extensions: [
		"asc",
		"sig"
	]
},
	"application/pics-rules": {
	source: "apache",
	extensions: [
		"prf"
	]
},
	"application/pidf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pidf-diff+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pkcs10": {
	source: "iana",
	extensions: [
		"p10"
	]
},
	"application/pkcs12": {
	source: "iana"
},
	"application/pkcs7-mime": {
	source: "iana",
	extensions: [
		"p7m",
		"p7c"
	]
},
	"application/pkcs7-signature": {
	source: "iana",
	extensions: [
		"p7s"
	]
},
	"application/pkcs8": {
	source: "iana",
	extensions: [
		"p8"
	]
},
	"application/pkcs8-encrypted": {
	source: "iana"
},
	"application/pkix-attr-cert": {
	source: "iana",
	extensions: [
		"ac"
	]
},
	"application/pkix-cert": {
	source: "iana",
	extensions: [
		"cer"
	]
},
	"application/pkix-crl": {
	source: "iana",
	extensions: [
		"crl"
	]
},
	"application/pkix-pkipath": {
	source: "iana",
	extensions: [
		"pkipath"
	]
},
	"application/pkixcmp": {
	source: "iana",
	extensions: [
		"pki"
	]
},
	"application/pls+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pls"
	]
},
	"application/poc-settings+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/postscript": {
	source: "iana",
	compressible: true,
	extensions: [
		"ai",
		"eps",
		"ps"
	]
},
	"application/ppsp-tracker+json": {
	source: "iana",
	compressible: true
},
	"application/problem+json": {
	source: "iana",
	compressible: true
},
	"application/problem+xml": {
	source: "iana",
	compressible: true
},
	"application/provenance+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"provx"
	]
},
	"application/prs.alvestrand.titrax-sheet": {
	source: "iana"
},
	"application/prs.cww": {
	source: "iana",
	extensions: [
		"cww"
	]
},
	"application/prs.cyn": {
	source: "iana",
	charset: "7-BIT"
},
	"application/prs.hpub+zip": {
	source: "iana",
	compressible: false
},
	"application/prs.nprend": {
	source: "iana"
},
	"application/prs.plucker": {
	source: "iana"
},
	"application/prs.rdf-xml-crypt": {
	source: "iana"
},
	"application/prs.xsf+xml": {
	source: "iana",
	compressible: true
},
	"application/pskc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pskcxml"
	]
},
	"application/pvd+json": {
	source: "iana",
	compressible: true
},
	"application/qsig": {
	source: "iana"
},
	"application/raml+yaml": {
	compressible: true,
	extensions: [
		"raml"
	]
},
	"application/raptorfec": {
	source: "iana"
},
	"application/rdap+json": {
	source: "iana",
	compressible: true
},
	"application/rdf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rdf",
		"owl"
	]
},
	"application/reginfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rif"
	]
},
	"application/relax-ng-compact-syntax": {
	source: "iana",
	extensions: [
		"rnc"
	]
},
	"application/remote-printing": {
	source: "iana"
},
	"application/reputon+json": {
	source: "iana",
	compressible: true
},
	"application/resource-lists+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rl"
	]
},
	"application/resource-lists-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rld"
	]
},
	"application/rfc+xml": {
	source: "iana",
	compressible: true
},
	"application/riscos": {
	source: "iana"
},
	"application/rlmi+xml": {
	source: "iana",
	compressible: true
},
	"application/rls-services+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rs"
	]
},
	"application/route-apd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rapd"
	]
},
	"application/route-s-tsid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sls"
	]
},
	"application/route-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rusd"
	]
},
	"application/rpki-ghostbusters": {
	source: "iana",
	extensions: [
		"gbr"
	]
},
	"application/rpki-manifest": {
	source: "iana",
	extensions: [
		"mft"
	]
},
	"application/rpki-publication": {
	source: "iana"
},
	"application/rpki-roa": {
	source: "iana",
	extensions: [
		"roa"
	]
},
	"application/rpki-updown": {
	source: "iana"
},
	"application/rsd+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rsd"
	]
},
	"application/rss+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rss"
	]
},
	"application/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"application/rtploopback": {
	source: "iana"
},
	"application/rtx": {
	source: "iana"
},
	"application/samlassertion+xml": {
	source: "iana",
	compressible: true
},
	"application/samlmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/sarif+json": {
	source: "iana",
	compressible: true
},
	"application/sarif-external-properties+json": {
	source: "iana",
	compressible: true
},
	"application/sbe": {
	source: "iana"
},
	"application/sbml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sbml"
	]
},
	"application/scaip+xml": {
	source: "iana",
	compressible: true
},
	"application/scim+json": {
	source: "iana",
	compressible: true
},
	"application/scvp-cv-request": {
	source: "iana",
	extensions: [
		"scq"
	]
},
	"application/scvp-cv-response": {
	source: "iana",
	extensions: [
		"scs"
	]
},
	"application/scvp-vp-request": {
	source: "iana",
	extensions: [
		"spq"
	]
},
	"application/scvp-vp-response": {
	source: "iana",
	extensions: [
		"spp"
	]
},
	"application/sdp": {
	source: "iana",
	extensions: [
		"sdp"
	]
},
	"application/secevent+jwt": {
	source: "iana"
},
	"application/senml+cbor": {
	source: "iana"
},
	"application/senml+json": {
	source: "iana",
	compressible: true
},
	"application/senml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"senmlx"
	]
},
	"application/senml-etch+cbor": {
	source: "iana"
},
	"application/senml-etch+json": {
	source: "iana",
	compressible: true
},
	"application/senml-exi": {
	source: "iana"
},
	"application/sensml+cbor": {
	source: "iana"
},
	"application/sensml+json": {
	source: "iana",
	compressible: true
},
	"application/sensml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sensmlx"
	]
},
	"application/sensml-exi": {
	source: "iana"
},
	"application/sep+xml": {
	source: "iana",
	compressible: true
},
	"application/sep-exi": {
	source: "iana"
},
	"application/session-info": {
	source: "iana"
},
	"application/set-payment": {
	source: "iana"
},
	"application/set-payment-initiation": {
	source: "iana",
	extensions: [
		"setpay"
	]
},
	"application/set-registration": {
	source: "iana"
},
	"application/set-registration-initiation": {
	source: "iana",
	extensions: [
		"setreg"
	]
},
	"application/sgml": {
	source: "iana"
},
	"application/sgml-open-catalog": {
	source: "iana"
},
	"application/shf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"shf"
	]
},
	"application/sieve": {
	source: "iana",
	extensions: [
		"siv",
		"sieve"
	]
},
	"application/simple-filter+xml": {
	source: "iana",
	compressible: true
},
	"application/simple-message-summary": {
	source: "iana"
},
	"application/simplesymbolcontainer": {
	source: "iana"
},
	"application/sipc": {
	source: "iana"
},
	"application/slate": {
	source: "iana"
},
	"application/smil": {
	source: "iana"
},
	"application/smil+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"smi",
		"smil"
	]
},
	"application/smpte336m": {
	source: "iana"
},
	"application/soap+fastinfoset": {
	source: "iana"
},
	"application/soap+xml": {
	source: "iana",
	compressible: true
},
	"application/sparql-query": {
	source: "iana",
	extensions: [
		"rq"
	]
},
	"application/sparql-results+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"srx"
	]
},
	"application/spdx+json": {
	source: "iana",
	compressible: true
},
	"application/spirits-event+xml": {
	source: "iana",
	compressible: true
},
	"application/sql": {
	source: "iana"
},
	"application/srgs": {
	source: "iana",
	extensions: [
		"gram"
	]
},
	"application/srgs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"grxml"
	]
},
	"application/sru+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sru"
	]
},
	"application/ssdl+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ssdl"
	]
},
	"application/ssml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ssml"
	]
},
	"application/stix+json": {
	source: "iana",
	compressible: true
},
	"application/swid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"swidtag"
	]
},
	"application/tamp-apex-update": {
	source: "iana"
},
	"application/tamp-apex-update-confirm": {
	source: "iana"
},
	"application/tamp-community-update": {
	source: "iana"
},
	"application/tamp-community-update-confirm": {
	source: "iana"
},
	"application/tamp-error": {
	source: "iana"
},
	"application/tamp-sequence-adjust": {
	source: "iana"
},
	"application/tamp-sequence-adjust-confirm": {
	source: "iana"
},
	"application/tamp-status-query": {
	source: "iana"
},
	"application/tamp-status-response": {
	source: "iana"
},
	"application/tamp-update": {
	source: "iana"
},
	"application/tamp-update-confirm": {
	source: "iana"
},
	"application/tar": {
	compressible: true
},
	"application/taxii+json": {
	source: "iana",
	compressible: true
},
	"application/td+json": {
	source: "iana",
	compressible: true
},
	"application/tei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tei",
		"teicorpus"
	]
},
	"application/tetra_isi": {
	source: "iana"
},
	"application/thraud+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tfi"
	]
},
	"application/timestamp-query": {
	source: "iana"
},
	"application/timestamp-reply": {
	source: "iana"
},
	"application/timestamped-data": {
	source: "iana",
	extensions: [
		"tsd"
	]
},
	"application/tlsrpt+gzip": {
	source: "iana"
},
	"application/tlsrpt+json": {
	source: "iana",
	compressible: true
},
	"application/tnauthlist": {
	source: "iana"
},
	"application/token-introspection+jwt": {
	source: "iana"
},
	"application/toml": {
	compressible: true,
	extensions: [
		"toml"
	]
},
	"application/trickle-ice-sdpfrag": {
	source: "iana"
},
	"application/trig": {
	source: "iana",
	extensions: [
		"trig"
	]
},
	"application/ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttml"
	]
},
	"application/tve-trigger": {
	source: "iana"
},
	"application/tzif": {
	source: "iana"
},
	"application/tzif-leap": {
	source: "iana"
},
	"application/ubjson": {
	compressible: false,
	extensions: [
		"ubj"
	]
},
	"application/ulpfec": {
	source: "iana"
},
	"application/urc-grpsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/urc-ressheet+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsheet"
	]
},
	"application/urc-targetdesc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"td"
	]
},
	"application/urc-uisocketdesc+xml": {
	source: "iana",
	compressible: true
},
	"application/vcard+json": {
	source: "iana",
	compressible: true
},
	"application/vcard+xml": {
	source: "iana",
	compressible: true
},
	"application/vemmi": {
	source: "iana"
},
	"application/vividence.scriptfile": {
	source: "apache"
},
	"application/vnd.1000minds.decision-model+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"1km"
	]
},
	"application/vnd.3gpp-prose+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3ch+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-v2x-local-service-information": {
	source: "iana"
},
	"application/vnd.3gpp.5gnas": {
	source: "iana"
},
	"application/vnd.3gpp.access-transfer-events+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.bsf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gmop+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gtpc": {
	source: "iana"
},
	"application/vnd.3gpp.interworking-data": {
	source: "iana"
},
	"application/vnd.3gpp.lpp": {
	source: "iana"
},
	"application/vnd.3gpp.mc-signalling-ear": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-payload": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-signalling": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-floor-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-signed+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-init-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-transmission-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mid-call+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ngap": {
	source: "iana"
},
	"application/vnd.3gpp.pfcp": {
	source: "iana"
},
	"application/vnd.3gpp.pic-bw-large": {
	source: "iana",
	extensions: [
		"plb"
	]
},
	"application/vnd.3gpp.pic-bw-small": {
	source: "iana",
	extensions: [
		"psb"
	]
},
	"application/vnd.3gpp.pic-bw-var": {
	source: "iana",
	extensions: [
		"pvb"
	]
},
	"application/vnd.3gpp.s1ap": {
	source: "iana"
},
	"application/vnd.3gpp.sms": {
	source: "iana"
},
	"application/vnd.3gpp.sms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-ext+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.state-and-event-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ussd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.bcmcsinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.sms": {
	source: "iana"
},
	"application/vnd.3gpp2.tcap": {
	source: "iana",
	extensions: [
		"tcap"
	]
},
	"application/vnd.3lightssoftware.imagescal": {
	source: "iana"
},
	"application/vnd.3m.post-it-notes": {
	source: "iana",
	extensions: [
		"pwn"
	]
},
	"application/vnd.accpac.simply.aso": {
	source: "iana",
	extensions: [
		"aso"
	]
},
	"application/vnd.accpac.simply.imp": {
	source: "iana",
	extensions: [
		"imp"
	]
},
	"application/vnd.acucobol": {
	source: "iana",
	extensions: [
		"acu"
	]
},
	"application/vnd.acucorp": {
	source: "iana",
	extensions: [
		"atc",
		"acutc"
	]
},
	"application/vnd.adobe.air-application-installer-package+zip": {
	source: "apache",
	compressible: false,
	extensions: [
		"air"
	]
},
	"application/vnd.adobe.flash.movie": {
	source: "iana"
},
	"application/vnd.adobe.formscentral.fcdt": {
	source: "iana",
	extensions: [
		"fcdt"
	]
},
	"application/vnd.adobe.fxp": {
	source: "iana",
	extensions: [
		"fxp",
		"fxpl"
	]
},
	"application/vnd.adobe.partial-upload": {
	source: "iana"
},
	"application/vnd.adobe.xdp+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdp"
	]
},
	"application/vnd.adobe.xfdf": {
	source: "iana",
	extensions: [
		"xfdf"
	]
},
	"application/vnd.aether.imp": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata-pagedef": {
	source: "iana"
},
	"application/vnd.afpc.cmoca-cmresource": {
	source: "iana"
},
	"application/vnd.afpc.foca-charset": {
	source: "iana"
},
	"application/vnd.afpc.foca-codedfont": {
	source: "iana"
},
	"application/vnd.afpc.foca-codepage": {
	source: "iana"
},
	"application/vnd.afpc.modca": {
	source: "iana"
},
	"application/vnd.afpc.modca-cmtable": {
	source: "iana"
},
	"application/vnd.afpc.modca-formdef": {
	source: "iana"
},
	"application/vnd.afpc.modca-mediummap": {
	source: "iana"
},
	"application/vnd.afpc.modca-objectcontainer": {
	source: "iana"
},
	"application/vnd.afpc.modca-overlay": {
	source: "iana"
},
	"application/vnd.afpc.modca-pagesegment": {
	source: "iana"
},
	"application/vnd.age": {
	source: "iana",
	extensions: [
		"age"
	]
},
	"application/vnd.ah-barcode": {
	source: "iana"
},
	"application/vnd.ahead.space": {
	source: "iana",
	extensions: [
		"ahead"
	]
},
	"application/vnd.airzip.filesecure.azf": {
	source: "iana",
	extensions: [
		"azf"
	]
},
	"application/vnd.airzip.filesecure.azs": {
	source: "iana",
	extensions: [
		"azs"
	]
},
	"application/vnd.amadeus+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.amazon.ebook": {
	source: "apache",
	extensions: [
		"azw"
	]
},
	"application/vnd.amazon.mobi8-ebook": {
	source: "iana"
},
	"application/vnd.americandynamics.acc": {
	source: "iana",
	extensions: [
		"acc"
	]
},
	"application/vnd.amiga.ami": {
	source: "iana",
	extensions: [
		"ami"
	]
},
	"application/vnd.amundsen.maze+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.android.ota": {
	source: "iana"
},
	"application/vnd.android.package-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"apk"
	]
},
	"application/vnd.anki": {
	source: "iana"
},
	"application/vnd.anser-web-certificate-issue-initiation": {
	source: "iana",
	extensions: [
		"cii"
	]
},
	"application/vnd.anser-web-funds-transfer-initiation": {
	source: "apache",
	extensions: [
		"fti"
	]
},
	"application/vnd.antix.game-component": {
	source: "iana",
	extensions: [
		"atx"
	]
},
	"application/vnd.apache.arrow.file": {
	source: "iana"
},
	"application/vnd.apache.arrow.stream": {
	source: "iana"
},
	"application/vnd.apache.thrift.binary": {
	source: "iana"
},
	"application/vnd.apache.thrift.compact": {
	source: "iana"
},
	"application/vnd.apache.thrift.json": {
	source: "iana"
},
	"application/vnd.api+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.aplextor.warrp+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apothekende.reservation+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apple.installer+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpkg"
	]
},
	"application/vnd.apple.keynote": {
	source: "iana",
	extensions: [
		"key"
	]
},
	"application/vnd.apple.mpegurl": {
	source: "iana",
	extensions: [
		"m3u8"
	]
},
	"application/vnd.apple.numbers": {
	source: "iana",
	extensions: [
		"numbers"
	]
},
	"application/vnd.apple.pages": {
	source: "iana",
	extensions: [
		"pages"
	]
},
	"application/vnd.apple.pkpass": {
	compressible: false,
	extensions: [
		"pkpass"
	]
},
	"application/vnd.arastra.swi": {
	source: "iana"
},
	"application/vnd.aristanetworks.swi": {
	source: "iana",
	extensions: [
		"swi"
	]
},
	"application/vnd.artisan+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.artsquare": {
	source: "iana"
},
	"application/vnd.astraea-software.iota": {
	source: "iana",
	extensions: [
		"iota"
	]
},
	"application/vnd.audiograph": {
	source: "iana",
	extensions: [
		"aep"
	]
},
	"application/vnd.autopackage": {
	source: "iana"
},
	"application/vnd.avalon+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.avistar+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.balsamiq.bmml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmml"
	]
},
	"application/vnd.balsamiq.bmpr": {
	source: "iana"
},
	"application/vnd.banana-accounting": {
	source: "iana"
},
	"application/vnd.bbf.usp.error": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bekitzur-stech+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bint.med-content": {
	source: "iana"
},
	"application/vnd.biopax.rdf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.blink-idb-value-wrapper": {
	source: "iana"
},
	"application/vnd.blueice.multipass": {
	source: "iana",
	extensions: [
		"mpm"
	]
},
	"application/vnd.bluetooth.ep.oob": {
	source: "iana"
},
	"application/vnd.bluetooth.le.oob": {
	source: "iana"
},
	"application/vnd.bmi": {
	source: "iana",
	extensions: [
		"bmi"
	]
},
	"application/vnd.bpf": {
	source: "iana"
},
	"application/vnd.bpf3": {
	source: "iana"
},
	"application/vnd.businessobjects": {
	source: "iana",
	extensions: [
		"rep"
	]
},
	"application/vnd.byu.uapi+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cab-jscript": {
	source: "iana"
},
	"application/vnd.canon-cpdl": {
	source: "iana"
},
	"application/vnd.canon-lips": {
	source: "iana"
},
	"application/vnd.capasystems-pg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cendio.thinlinc.clientconf": {
	source: "iana"
},
	"application/vnd.century-systems.tcp_stream": {
	source: "iana"
},
	"application/vnd.chemdraw+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdxml"
	]
},
	"application/vnd.chess-pgn": {
	source: "iana"
},
	"application/vnd.chipnuts.karaoke-mmd": {
	source: "iana",
	extensions: [
		"mmd"
	]
},
	"application/vnd.ciedi": {
	source: "iana"
},
	"application/vnd.cinderella": {
	source: "iana",
	extensions: [
		"cdy"
	]
},
	"application/vnd.cirpack.isdn-ext": {
	source: "iana"
},
	"application/vnd.citationstyles.style+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"csl"
	]
},
	"application/vnd.claymore": {
	source: "iana",
	extensions: [
		"cla"
	]
},
	"application/vnd.cloanto.rp9": {
	source: "iana",
	extensions: [
		"rp9"
	]
},
	"application/vnd.clonk.c4group": {
	source: "iana",
	extensions: [
		"c4g",
		"c4d",
		"c4f",
		"c4p",
		"c4u"
	]
},
	"application/vnd.cluetrust.cartomobile-config": {
	source: "iana",
	extensions: [
		"c11amc"
	]
},
	"application/vnd.cluetrust.cartomobile-config-pkg": {
	source: "iana",
	extensions: [
		"c11amz"
	]
},
	"application/vnd.coffeescript": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet-template": {
	source: "iana"
},
	"application/vnd.collection+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.doc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.next+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.comicbook+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.comicbook-rar": {
	source: "iana"
},
	"application/vnd.commerce-battelle": {
	source: "iana"
},
	"application/vnd.commonspace": {
	source: "iana",
	extensions: [
		"csp"
	]
},
	"application/vnd.contact.cmsg": {
	source: "iana",
	extensions: [
		"cdbcmsg"
	]
},
	"application/vnd.coreos.ignition+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cosmocaller": {
	source: "iana",
	extensions: [
		"cmc"
	]
},
	"application/vnd.crick.clicker": {
	source: "iana",
	extensions: [
		"clkx"
	]
},
	"application/vnd.crick.clicker.keyboard": {
	source: "iana",
	extensions: [
		"clkk"
	]
},
	"application/vnd.crick.clicker.palette": {
	source: "iana",
	extensions: [
		"clkp"
	]
},
	"application/vnd.crick.clicker.template": {
	source: "iana",
	extensions: [
		"clkt"
	]
},
	"application/vnd.crick.clicker.wordbank": {
	source: "iana",
	extensions: [
		"clkw"
	]
},
	"application/vnd.criticaltools.wbs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wbs"
	]
},
	"application/vnd.cryptii.pipe+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.crypto-shade-file": {
	source: "iana"
},
	"application/vnd.cryptomator.encrypted": {
	source: "iana"
},
	"application/vnd.cryptomator.vault": {
	source: "iana"
},
	"application/vnd.ctc-posml": {
	source: "iana",
	extensions: [
		"pml"
	]
},
	"application/vnd.ctct.ws+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cups-pdf": {
	source: "iana"
},
	"application/vnd.cups-postscript": {
	source: "iana"
},
	"application/vnd.cups-ppd": {
	source: "iana",
	extensions: [
		"ppd"
	]
},
	"application/vnd.cups-raster": {
	source: "iana"
},
	"application/vnd.cups-raw": {
	source: "iana"
},
	"application/vnd.curl": {
	source: "iana"
},
	"application/vnd.curl.car": {
	source: "apache",
	extensions: [
		"car"
	]
},
	"application/vnd.curl.pcurl": {
	source: "apache",
	extensions: [
		"pcurl"
	]
},
	"application/vnd.cyan.dean.root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cybank": {
	source: "iana"
},
	"application/vnd.cyclonedx+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cyclonedx+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.d2l.coursepackage1p0+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.d3m-dataset": {
	source: "iana"
},
	"application/vnd.d3m-problem": {
	source: "iana"
},
	"application/vnd.dart": {
	source: "iana",
	compressible: true,
	extensions: [
		"dart"
	]
},
	"application/vnd.data-vision.rdz": {
	source: "iana",
	extensions: [
		"rdz"
	]
},
	"application/vnd.datapackage+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dataresource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dbf": {
	source: "iana",
	extensions: [
		"dbf"
	]
},
	"application/vnd.debian.binary-package": {
	source: "iana"
},
	"application/vnd.dece.data": {
	source: "iana",
	extensions: [
		"uvf",
		"uvvf",
		"uvd",
		"uvvd"
	]
},
	"application/vnd.dece.ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uvt",
		"uvvt"
	]
},
	"application/vnd.dece.unspecified": {
	source: "iana",
	extensions: [
		"uvx",
		"uvvx"
	]
},
	"application/vnd.dece.zip": {
	source: "iana",
	extensions: [
		"uvz",
		"uvvz"
	]
},
	"application/vnd.denovo.fcselayout-link": {
	source: "iana",
	extensions: [
		"fe_launch"
	]
},
	"application/vnd.desmume.movie": {
	source: "iana"
},
	"application/vnd.dir-bi.plate-dl-nosuffix": {
	source: "iana"
},
	"application/vnd.dm.delegation+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dna": {
	source: "iana",
	extensions: [
		"dna"
	]
},
	"application/vnd.document+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dolby.mlp": {
	source: "apache",
	extensions: [
		"mlp"
	]
},
	"application/vnd.dolby.mobile.1": {
	source: "iana"
},
	"application/vnd.dolby.mobile.2": {
	source: "iana"
},
	"application/vnd.doremir.scorecloud-binary-document": {
	source: "iana"
},
	"application/vnd.dpgraph": {
	source: "iana",
	extensions: [
		"dpg"
	]
},
	"application/vnd.dreamfactory": {
	source: "iana",
	extensions: [
		"dfac"
	]
},
	"application/vnd.drive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ds-keypoint": {
	source: "apache",
	extensions: [
		"kpxx"
	]
},
	"application/vnd.dtg.local": {
	source: "iana"
},
	"application/vnd.dtg.local.flash": {
	source: "iana"
},
	"application/vnd.dtg.local.html": {
	source: "iana"
},
	"application/vnd.dvb.ait": {
	source: "iana",
	extensions: [
		"ait"
	]
},
	"application/vnd.dvb.dvbisl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.dvbj": {
	source: "iana"
},
	"application/vnd.dvb.esgcontainer": {
	source: "iana"
},
	"application/vnd.dvb.ipdcdftnotifaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess2": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgpdd": {
	source: "iana"
},
	"application/vnd.dvb.ipdcroaming": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-base": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-enhancement": {
	source: "iana"
},
	"application/vnd.dvb.notif-aggregate-root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-container+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-generic+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-msglist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-response+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-init+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.pfr": {
	source: "iana"
},
	"application/vnd.dvb.service": {
	source: "iana",
	extensions: [
		"svc"
	]
},
	"application/vnd.dxr": {
	source: "iana"
},
	"application/vnd.dynageo": {
	source: "iana",
	extensions: [
		"geo"
	]
},
	"application/vnd.dzr": {
	source: "iana"
},
	"application/vnd.easykaraoke.cdgdownload": {
	source: "iana"
},
	"application/vnd.ecdis-update": {
	source: "iana"
},
	"application/vnd.ecip.rlp": {
	source: "iana"
},
	"application/vnd.eclipse.ditto+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ecowin.chart": {
	source: "iana",
	extensions: [
		"mag"
	]
},
	"application/vnd.ecowin.filerequest": {
	source: "iana"
},
	"application/vnd.ecowin.fileupdate": {
	source: "iana"
},
	"application/vnd.ecowin.series": {
	source: "iana"
},
	"application/vnd.ecowin.seriesrequest": {
	source: "iana"
},
	"application/vnd.ecowin.seriesupdate": {
	source: "iana"
},
	"application/vnd.efi.img": {
	source: "iana"
},
	"application/vnd.efi.iso": {
	source: "iana"
},
	"application/vnd.emclient.accessrequest+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.enliven": {
	source: "iana",
	extensions: [
		"nml"
	]
},
	"application/vnd.enphase.envoy": {
	source: "iana"
},
	"application/vnd.eprints.data+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.epson.esf": {
	source: "iana",
	extensions: [
		"esf"
	]
},
	"application/vnd.epson.msf": {
	source: "iana",
	extensions: [
		"msf"
	]
},
	"application/vnd.epson.quickanime": {
	source: "iana",
	extensions: [
		"qam"
	]
},
	"application/vnd.epson.salt": {
	source: "iana",
	extensions: [
		"slt"
	]
},
	"application/vnd.epson.ssf": {
	source: "iana",
	extensions: [
		"ssf"
	]
},
	"application/vnd.ericsson.quickcall": {
	source: "iana"
},
	"application/vnd.espass-espass+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.eszigno3+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"es3",
		"et3"
	]
},
	"application/vnd.etsi.aoc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.asic-e+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.asic-s+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.cug+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvcommand+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-bc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-cod+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-npvr+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvservice+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsync+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mcid+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mheg5": {
	source: "iana"
},
	"application/vnd.etsi.overload-control-policy-dataset+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.pstn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.sci+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.simservs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.timestamp-token": {
	source: "iana"
},
	"application/vnd.etsi.tsl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.tsl.der": {
	source: "iana"
},
	"application/vnd.eu.kasparian.car+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.eudora.data": {
	source: "iana"
},
	"application/vnd.evolv.ecig.profile": {
	source: "iana"
},
	"application/vnd.evolv.ecig.settings": {
	source: "iana"
},
	"application/vnd.evolv.ecig.theme": {
	source: "iana"
},
	"application/vnd.exstream-empower+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.exstream-package": {
	source: "iana"
},
	"application/vnd.ezpix-album": {
	source: "iana",
	extensions: [
		"ez2"
	]
},
	"application/vnd.ezpix-package": {
	source: "iana",
	extensions: [
		"ez3"
	]
},
	"application/vnd.f-secure.mobile": {
	source: "iana"
},
	"application/vnd.familysearch.gedcom+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.fastcopy-disk-image": {
	source: "iana"
},
	"application/vnd.fdf": {
	source: "iana",
	extensions: [
		"fdf"
	]
},
	"application/vnd.fdsn.mseed": {
	source: "iana",
	extensions: [
		"mseed"
	]
},
	"application/vnd.fdsn.seed": {
	source: "iana",
	extensions: [
		"seed",
		"dataless"
	]
},
	"application/vnd.ffsns": {
	source: "iana"
},
	"application/vnd.ficlab.flb+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.filmit.zfc": {
	source: "iana"
},
	"application/vnd.fints": {
	source: "iana"
},
	"application/vnd.firemonkeys.cloudcell": {
	source: "iana"
},
	"application/vnd.flographit": {
	source: "iana",
	extensions: [
		"gph"
	]
},
	"application/vnd.fluxtime.clip": {
	source: "iana",
	extensions: [
		"ftc"
	]
},
	"application/vnd.font-fontforge-sfd": {
	source: "iana"
},
	"application/vnd.framemaker": {
	source: "iana",
	extensions: [
		"fm",
		"frame",
		"maker",
		"book"
	]
},
	"application/vnd.frogans.fnc": {
	source: "iana",
	extensions: [
		"fnc"
	]
},
	"application/vnd.frogans.ltf": {
	source: "iana",
	extensions: [
		"ltf"
	]
},
	"application/vnd.fsc.weblaunch": {
	source: "iana",
	extensions: [
		"fsc"
	]
},
	"application/vnd.fujifilm.fb.docuworks": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.binder": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.jfi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.fujitsu.oasys": {
	source: "iana",
	extensions: [
		"oas"
	]
},
	"application/vnd.fujitsu.oasys2": {
	source: "iana",
	extensions: [
		"oa2"
	]
},
	"application/vnd.fujitsu.oasys3": {
	source: "iana",
	extensions: [
		"oa3"
	]
},
	"application/vnd.fujitsu.oasysgp": {
	source: "iana",
	extensions: [
		"fg5"
	]
},
	"application/vnd.fujitsu.oasysprs": {
	source: "iana",
	extensions: [
		"bh2"
	]
},
	"application/vnd.fujixerox.art-ex": {
	source: "iana"
},
	"application/vnd.fujixerox.art4": {
	source: "iana"
},
	"application/vnd.fujixerox.ddd": {
	source: "iana",
	extensions: [
		"ddd"
	]
},
	"application/vnd.fujixerox.docuworks": {
	source: "iana",
	extensions: [
		"xdw"
	]
},
	"application/vnd.fujixerox.docuworks.binder": {
	source: "iana",
	extensions: [
		"xbd"
	]
},
	"application/vnd.fujixerox.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujixerox.hbpl": {
	source: "iana"
},
	"application/vnd.fut-misnet": {
	source: "iana"
},
	"application/vnd.futoin+cbor": {
	source: "iana"
},
	"application/vnd.futoin+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.fuzzysheet": {
	source: "iana",
	extensions: [
		"fzs"
	]
},
	"application/vnd.genomatix.tuxedo": {
	source: "iana",
	extensions: [
		"txd"
	]
},
	"application/vnd.gentics.grd+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geo+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.geocube+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.geogebra.file": {
	source: "iana",
	extensions: [
		"ggb"
	]
},
	"application/vnd.geogebra.slides": {
	source: "iana"
},
	"application/vnd.geogebra.tool": {
	source: "iana",
	extensions: [
		"ggt"
	]
},
	"application/vnd.geometry-explorer": {
	source: "iana",
	extensions: [
		"gex",
		"gre"
	]
},
	"application/vnd.geonext": {
	source: "iana",
	extensions: [
		"gxt"
	]
},
	"application/vnd.geoplan": {
	source: "iana",
	extensions: [
		"g2w"
	]
},
	"application/vnd.geospace": {
	source: "iana",
	extensions: [
		"g3w"
	]
},
	"application/vnd.gerber": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt-response": {
	source: "iana"
},
	"application/vnd.gmx": {
	source: "iana",
	extensions: [
		"gmx"
	]
},
	"application/vnd.google-apps.document": {
	compressible: false,
	extensions: [
		"gdoc"
	]
},
	"application/vnd.google-apps.presentation": {
	compressible: false,
	extensions: [
		"gslides"
	]
},
	"application/vnd.google-apps.spreadsheet": {
	compressible: false,
	extensions: [
		"gsheet"
	]
},
	"application/vnd.google-earth.kml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"kml"
	]
},
	"application/vnd.google-earth.kmz": {
	source: "iana",
	compressible: false,
	extensions: [
		"kmz"
	]
},
	"application/vnd.gov.sk.e-form+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.gov.sk.e-form+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.gov.sk.xmldatacontainer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.grafeq": {
	source: "iana",
	extensions: [
		"gqf",
		"gqs"
	]
},
	"application/vnd.gridmp": {
	source: "iana"
},
	"application/vnd.groove-account": {
	source: "iana",
	extensions: [
		"gac"
	]
},
	"application/vnd.groove-help": {
	source: "iana",
	extensions: [
		"ghf"
	]
},
	"application/vnd.groove-identity-message": {
	source: "iana",
	extensions: [
		"gim"
	]
},
	"application/vnd.groove-injector": {
	source: "iana",
	extensions: [
		"grv"
	]
},
	"application/vnd.groove-tool-message": {
	source: "iana",
	extensions: [
		"gtm"
	]
},
	"application/vnd.groove-tool-template": {
	source: "iana",
	extensions: [
		"tpl"
	]
},
	"application/vnd.groove-vcard": {
	source: "iana",
	extensions: [
		"vcg"
	]
},
	"application/vnd.hal+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hal+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"hal"
	]
},
	"application/vnd.handheld-entertainment+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zmm"
	]
},
	"application/vnd.hbci": {
	source: "iana",
	extensions: [
		"hbci"
	]
},
	"application/vnd.hc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hcl-bireports": {
	source: "iana"
},
	"application/vnd.hdt": {
	source: "iana"
},
	"application/vnd.heroku+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hhe.lesson-player": {
	source: "iana",
	extensions: [
		"les"
	]
},
	"application/vnd.hl7cda+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.hl7v2+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.hp-hpgl": {
	source: "iana",
	extensions: [
		"hpgl"
	]
},
	"application/vnd.hp-hpid": {
	source: "iana",
	extensions: [
		"hpid"
	]
},
	"application/vnd.hp-hps": {
	source: "iana",
	extensions: [
		"hps"
	]
},
	"application/vnd.hp-jlyt": {
	source: "iana",
	extensions: [
		"jlt"
	]
},
	"application/vnd.hp-pcl": {
	source: "iana",
	extensions: [
		"pcl"
	]
},
	"application/vnd.hp-pclxl": {
	source: "iana",
	extensions: [
		"pclxl"
	]
},
	"application/vnd.httphone": {
	source: "iana"
},
	"application/vnd.hydrostatix.sof-data": {
	source: "iana",
	extensions: [
		"sfd-hdstx"
	]
},
	"application/vnd.hyper+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyper-item+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyperdrive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hzn-3d-crossword": {
	source: "iana"
},
	"application/vnd.ibm.afplinedata": {
	source: "iana"
},
	"application/vnd.ibm.electronic-media": {
	source: "iana"
},
	"application/vnd.ibm.minipay": {
	source: "iana",
	extensions: [
		"mpy"
	]
},
	"application/vnd.ibm.modcap": {
	source: "iana",
	extensions: [
		"afp",
		"listafp",
		"list3820"
	]
},
	"application/vnd.ibm.rights-management": {
	source: "iana",
	extensions: [
		"irm"
	]
},
	"application/vnd.ibm.secure-container": {
	source: "iana",
	extensions: [
		"sc"
	]
},
	"application/vnd.iccprofile": {
	source: "iana",
	extensions: [
		"icc",
		"icm"
	]
},
	"application/vnd.ieee.1905": {
	source: "iana"
},
	"application/vnd.igloader": {
	source: "iana",
	extensions: [
		"igl"
	]
},
	"application/vnd.imagemeter.folder+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.imagemeter.image+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.immervision-ivp": {
	source: "iana",
	extensions: [
		"ivp"
	]
},
	"application/vnd.immervision-ivu": {
	source: "iana",
	extensions: [
		"ivu"
	]
},
	"application/vnd.ims.imsccv1p1": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p2": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p3": {
	source: "iana"
},
	"application/vnd.ims.lis.v2.result+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy.id+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings.simple+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.informedcontrol.rms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.informix-visionary": {
	source: "iana"
},
	"application/vnd.infotech.project": {
	source: "iana"
},
	"application/vnd.infotech.project+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.innopath.wamp.notification": {
	source: "iana"
},
	"application/vnd.insors.igm": {
	source: "iana",
	extensions: [
		"igm"
	]
},
	"application/vnd.intercon.formnet": {
	source: "iana",
	extensions: [
		"xpw",
		"xpx"
	]
},
	"application/vnd.intergeo": {
	source: "iana",
	extensions: [
		"i2g"
	]
},
	"application/vnd.intertrust.digibox": {
	source: "iana"
},
	"application/vnd.intertrust.nncp": {
	source: "iana"
},
	"application/vnd.intu.qbo": {
	source: "iana",
	extensions: [
		"qbo"
	]
},
	"application/vnd.intu.qfx": {
	source: "iana",
	extensions: [
		"qfx"
	]
},
	"application/vnd.iptc.g2.catalogitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.conceptitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.knowledgeitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.packageitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.planningitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ipunplugged.rcprofile": {
	source: "iana",
	extensions: [
		"rcprofile"
	]
},
	"application/vnd.irepository.package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"irp"
	]
},
	"application/vnd.is-xpr": {
	source: "iana",
	extensions: [
		"xpr"
	]
},
	"application/vnd.isac.fcs": {
	source: "iana",
	extensions: [
		"fcs"
	]
},
	"application/vnd.iso11783-10+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.jam": {
	source: "iana",
	extensions: [
		"jam"
	]
},
	"application/vnd.japannet-directory-service": {
	source: "iana"
},
	"application/vnd.japannet-jpnstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-payment-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-registration": {
	source: "iana"
},
	"application/vnd.japannet-registration-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-setstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-verification": {
	source: "iana"
},
	"application/vnd.japannet-verification-wakeup": {
	source: "iana"
},
	"application/vnd.jcp.javame.midlet-rms": {
	source: "iana",
	extensions: [
		"rms"
	]
},
	"application/vnd.jisp": {
	source: "iana",
	extensions: [
		"jisp"
	]
},
	"application/vnd.joost.joda-archive": {
	source: "iana",
	extensions: [
		"joda"
	]
},
	"application/vnd.jsk.isdn-ngn": {
	source: "iana"
},
	"application/vnd.kahootz": {
	source: "iana",
	extensions: [
		"ktz",
		"ktr"
	]
},
	"application/vnd.kde.karbon": {
	source: "iana",
	extensions: [
		"karbon"
	]
},
	"application/vnd.kde.kchart": {
	source: "iana",
	extensions: [
		"chrt"
	]
},
	"application/vnd.kde.kformula": {
	source: "iana",
	extensions: [
		"kfo"
	]
},
	"application/vnd.kde.kivio": {
	source: "iana",
	extensions: [
		"flw"
	]
},
	"application/vnd.kde.kontour": {
	source: "iana",
	extensions: [
		"kon"
	]
},
	"application/vnd.kde.kpresenter": {
	source: "iana",
	extensions: [
		"kpr",
		"kpt"
	]
},
	"application/vnd.kde.kspread": {
	source: "iana",
	extensions: [
		"ksp"
	]
},
	"application/vnd.kde.kword": {
	source: "iana",
	extensions: [
		"kwd",
		"kwt"
	]
},
	"application/vnd.kenameaapp": {
	source: "iana",
	extensions: [
		"htke"
	]
},
	"application/vnd.kidspiration": {
	source: "iana",
	extensions: [
		"kia"
	]
},
	"application/vnd.kinar": {
	source: "iana",
	extensions: [
		"kne",
		"knp"
	]
},
	"application/vnd.koan": {
	source: "iana",
	extensions: [
		"skp",
		"skd",
		"skt",
		"skm"
	]
},
	"application/vnd.kodak-descriptor": {
	source: "iana",
	extensions: [
		"sse"
	]
},
	"application/vnd.las": {
	source: "iana"
},
	"application/vnd.las.las+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.las.las+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lasxml"
	]
},
	"application/vnd.laszip": {
	source: "iana"
},
	"application/vnd.leap+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.liberty-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.llamagraphics.life-balance.desktop": {
	source: "iana",
	extensions: [
		"lbd"
	]
},
	"application/vnd.llamagraphics.life-balance.exchange+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lbe"
	]
},
	"application/vnd.logipipe.circuit+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.loom": {
	source: "iana"
},
	"application/vnd.lotus-1-2-3": {
	source: "iana",
	extensions: [
		"123"
	]
},
	"application/vnd.lotus-approach": {
	source: "iana",
	extensions: [
		"apr"
	]
},
	"application/vnd.lotus-freelance": {
	source: "iana",
	extensions: [
		"pre"
	]
},
	"application/vnd.lotus-notes": {
	source: "iana",
	extensions: [
		"nsf"
	]
},
	"application/vnd.lotus-organizer": {
	source: "iana",
	extensions: [
		"org"
	]
},
	"application/vnd.lotus-screencam": {
	source: "iana",
	extensions: [
		"scm"
	]
},
	"application/vnd.lotus-wordpro": {
	source: "iana",
	extensions: [
		"lwp"
	]
},
	"application/vnd.macports.portpkg": {
	source: "iana",
	extensions: [
		"portpkg"
	]
},
	"application/vnd.mapbox-vector-tile": {
	source: "iana",
	extensions: [
		"mvt"
	]
},
	"application/vnd.marlin.drm.actiontoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.conftoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.license+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.mdcf": {
	source: "iana"
},
	"application/vnd.mason+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.maxar.archive.3tz+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.maxmind.maxmind-db": {
	source: "iana"
},
	"application/vnd.mcd": {
	source: "iana",
	extensions: [
		"mcd"
	]
},
	"application/vnd.medcalcdata": {
	source: "iana",
	extensions: [
		"mc1"
	]
},
	"application/vnd.mediastation.cdkey": {
	source: "iana",
	extensions: [
		"cdkey"
	]
},
	"application/vnd.meridian-slingshot": {
	source: "iana"
},
	"application/vnd.mfer": {
	source: "iana",
	extensions: [
		"mwf"
	]
},
	"application/vnd.mfmp": {
	source: "iana",
	extensions: [
		"mfm"
	]
},
	"application/vnd.micro+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.micrografx.flo": {
	source: "iana",
	extensions: [
		"flo"
	]
},
	"application/vnd.micrografx.igx": {
	source: "iana",
	extensions: [
		"igx"
	]
},
	"application/vnd.microsoft.portable-executable": {
	source: "iana"
},
	"application/vnd.microsoft.windows.thumbnail-cache": {
	source: "iana"
},
	"application/vnd.miele+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.mif": {
	source: "iana",
	extensions: [
		"mif"
	]
},
	"application/vnd.minisoft-hp3000-save": {
	source: "iana"
},
	"application/vnd.mitsubishi.misty-guard.trustweb": {
	source: "iana"
},
	"application/vnd.mobius.daf": {
	source: "iana",
	extensions: [
		"daf"
	]
},
	"application/vnd.mobius.dis": {
	source: "iana",
	extensions: [
		"dis"
	]
},
	"application/vnd.mobius.mbk": {
	source: "iana",
	extensions: [
		"mbk"
	]
},
	"application/vnd.mobius.mqy": {
	source: "iana",
	extensions: [
		"mqy"
	]
},
	"application/vnd.mobius.msl": {
	source: "iana",
	extensions: [
		"msl"
	]
},
	"application/vnd.mobius.plc": {
	source: "iana",
	extensions: [
		"plc"
	]
},
	"application/vnd.mobius.txf": {
	source: "iana",
	extensions: [
		"txf"
	]
},
	"application/vnd.mophun.application": {
	source: "iana",
	extensions: [
		"mpn"
	]
},
	"application/vnd.mophun.certificate": {
	source: "iana",
	extensions: [
		"mpc"
	]
},
	"application/vnd.motorola.flexsuite": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.adsi": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.fis": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.gotap": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.kmr": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.ttc": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.wem": {
	source: "iana"
},
	"application/vnd.motorola.iprm": {
	source: "iana"
},
	"application/vnd.mozilla.xul+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xul"
	]
},
	"application/vnd.ms-3mfdocument": {
	source: "iana"
},
	"application/vnd.ms-artgalry": {
	source: "iana",
	extensions: [
		"cil"
	]
},
	"application/vnd.ms-asf": {
	source: "iana"
},
	"application/vnd.ms-cab-compressed": {
	source: "iana",
	extensions: [
		"cab"
	]
},
	"application/vnd.ms-color.iccprofile": {
	source: "apache"
},
	"application/vnd.ms-excel": {
	source: "iana",
	compressible: false,
	extensions: [
		"xls",
		"xlm",
		"xla",
		"xlc",
		"xlt",
		"xlw"
	]
},
	"application/vnd.ms-excel.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlam"
	]
},
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsb"
	]
},
	"application/vnd.ms-excel.sheet.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsm"
	]
},
	"application/vnd.ms-excel.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"xltm"
	]
},
	"application/vnd.ms-fontobject": {
	source: "iana",
	compressible: true,
	extensions: [
		"eot"
	]
},
	"application/vnd.ms-htmlhelp": {
	source: "iana",
	extensions: [
		"chm"
	]
},
	"application/vnd.ms-ims": {
	source: "iana",
	extensions: [
		"ims"
	]
},
	"application/vnd.ms-lrm": {
	source: "iana",
	extensions: [
		"lrm"
	]
},
	"application/vnd.ms-office.activex+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-officetheme": {
	source: "iana",
	extensions: [
		"thmx"
	]
},
	"application/vnd.ms-opentype": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-outlook": {
	compressible: false,
	extensions: [
		"msg"
	]
},
	"application/vnd.ms-package.obfuscated-opentype": {
	source: "apache"
},
	"application/vnd.ms-pki.seccat": {
	source: "apache",
	extensions: [
		"cat"
	]
},
	"application/vnd.ms-pki.stl": {
	source: "apache",
	extensions: [
		"stl"
	]
},
	"application/vnd.ms-playready.initiator+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-powerpoint": {
	source: "iana",
	compressible: false,
	extensions: [
		"ppt",
		"pps",
		"pot"
	]
},
	"application/vnd.ms-powerpoint.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppam"
	]
},
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
	source: "iana",
	extensions: [
		"pptm"
	]
},
	"application/vnd.ms-powerpoint.slide.macroenabled.12": {
	source: "iana",
	extensions: [
		"sldm"
	]
},
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppsm"
	]
},
	"application/vnd.ms-powerpoint.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"potm"
	]
},
	"application/vnd.ms-printdevicecapabilities+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-printing.printticket+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-printschematicket+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-project": {
	source: "iana",
	extensions: [
		"mpp",
		"mpt"
	]
},
	"application/vnd.ms-tnef": {
	source: "iana"
},
	"application/vnd.ms-windows.devicepairing": {
	source: "iana"
},
	"application/vnd.ms-windows.nwprinting.oob": {
	source: "iana"
},
	"application/vnd.ms-windows.printerpairing": {
	source: "iana"
},
	"application/vnd.ms-windows.wsd.oob": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-resp": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-resp": {
	source: "iana"
},
	"application/vnd.ms-word.document.macroenabled.12": {
	source: "iana",
	extensions: [
		"docm"
	]
},
	"application/vnd.ms-word.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"dotm"
	]
},
	"application/vnd.ms-works": {
	source: "iana",
	extensions: [
		"wps",
		"wks",
		"wcm",
		"wdb"
	]
},
	"application/vnd.ms-wpl": {
	source: "iana",
	extensions: [
		"wpl"
	]
},
	"application/vnd.ms-xpsdocument": {
	source: "iana",
	compressible: false,
	extensions: [
		"xps"
	]
},
	"application/vnd.msa-disk-image": {
	source: "iana"
},
	"application/vnd.mseq": {
	source: "iana",
	extensions: [
		"mseq"
	]
},
	"application/vnd.msign": {
	source: "iana"
},
	"application/vnd.multiad.creator": {
	source: "iana"
},
	"application/vnd.multiad.creator.cif": {
	source: "iana"
},
	"application/vnd.music-niff": {
	source: "iana"
},
	"application/vnd.musician": {
	source: "iana",
	extensions: [
		"mus"
	]
},
	"application/vnd.muvee.style": {
	source: "iana",
	extensions: [
		"msty"
	]
},
	"application/vnd.mynfc": {
	source: "iana",
	extensions: [
		"taglet"
	]
},
	"application/vnd.nacamar.ybrid+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ncd.control": {
	source: "iana"
},
	"application/vnd.ncd.reference": {
	source: "iana"
},
	"application/vnd.nearst.inv+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nebumind.line": {
	source: "iana"
},
	"application/vnd.nervana": {
	source: "iana"
},
	"application/vnd.netfpx": {
	source: "iana"
},
	"application/vnd.neurolanguage.nlu": {
	source: "iana",
	extensions: [
		"nlu"
	]
},
	"application/vnd.nimn": {
	source: "iana"
},
	"application/vnd.nintendo.nitro.rom": {
	source: "iana"
},
	"application/vnd.nintendo.snes.rom": {
	source: "iana"
},
	"application/vnd.nitf": {
	source: "iana",
	extensions: [
		"ntf",
		"nitf"
	]
},
	"application/vnd.noblenet-directory": {
	source: "iana",
	extensions: [
		"nnd"
	]
},
	"application/vnd.noblenet-sealer": {
	source: "iana",
	extensions: [
		"nns"
	]
},
	"application/vnd.noblenet-web": {
	source: "iana",
	extensions: [
		"nnw"
	]
},
	"application/vnd.nokia.catalogs": {
	source: "iana"
},
	"application/vnd.nokia.conml+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.conml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.iptv.config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.isds-radio-presets": {
	source: "iana"
},
	"application/vnd.nokia.landmark+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.landmark+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.landmarkcollection+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.n-gage.ac+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ac"
	]
},
	"application/vnd.nokia.n-gage.data": {
	source: "iana",
	extensions: [
		"ngdat"
	]
},
	"application/vnd.nokia.n-gage.symbian.install": {
	source: "iana",
	extensions: [
		"n-gage"
	]
},
	"application/vnd.nokia.ncd": {
	source: "iana"
},
	"application/vnd.nokia.pcd+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.pcd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.radio-preset": {
	source: "iana",
	extensions: [
		"rpst"
	]
},
	"application/vnd.nokia.radio-presets": {
	source: "iana",
	extensions: [
		"rpss"
	]
},
	"application/vnd.novadigm.edm": {
	source: "iana",
	extensions: [
		"edm"
	]
},
	"application/vnd.novadigm.edx": {
	source: "iana",
	extensions: [
		"edx"
	]
},
	"application/vnd.novadigm.ext": {
	source: "iana",
	extensions: [
		"ext"
	]
},
	"application/vnd.ntt-local.content-share": {
	source: "iana"
},
	"application/vnd.ntt-local.file-transfer": {
	source: "iana"
},
	"application/vnd.ntt-local.ogw_remote-access": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_remote": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_tcp_stream": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.chart": {
	source: "iana",
	extensions: [
		"odc"
	]
},
	"application/vnd.oasis.opendocument.chart-template": {
	source: "iana",
	extensions: [
		"otc"
	]
},
	"application/vnd.oasis.opendocument.database": {
	source: "iana",
	extensions: [
		"odb"
	]
},
	"application/vnd.oasis.opendocument.formula": {
	source: "iana",
	extensions: [
		"odf"
	]
},
	"application/vnd.oasis.opendocument.formula-template": {
	source: "iana",
	extensions: [
		"odft"
	]
},
	"application/vnd.oasis.opendocument.graphics": {
	source: "iana",
	compressible: false,
	extensions: [
		"odg"
	]
},
	"application/vnd.oasis.opendocument.graphics-template": {
	source: "iana",
	extensions: [
		"otg"
	]
},
	"application/vnd.oasis.opendocument.image": {
	source: "iana",
	extensions: [
		"odi"
	]
},
	"application/vnd.oasis.opendocument.image-template": {
	source: "iana",
	extensions: [
		"oti"
	]
},
	"application/vnd.oasis.opendocument.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"odp"
	]
},
	"application/vnd.oasis.opendocument.presentation-template": {
	source: "iana",
	extensions: [
		"otp"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"ods"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet-template": {
	source: "iana",
	extensions: [
		"ots"
	]
},
	"application/vnd.oasis.opendocument.text": {
	source: "iana",
	compressible: false,
	extensions: [
		"odt"
	]
},
	"application/vnd.oasis.opendocument.text-master": {
	source: "iana",
	extensions: [
		"odm"
	]
},
	"application/vnd.oasis.opendocument.text-template": {
	source: "iana",
	extensions: [
		"ott"
	]
},
	"application/vnd.oasis.opendocument.text-web": {
	source: "iana",
	extensions: [
		"oth"
	]
},
	"application/vnd.obn": {
	source: "iana"
},
	"application/vnd.ocf+cbor": {
	source: "iana"
},
	"application/vnd.oci.image.manifest.v1+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oftn.l10n+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessdownload+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessstreaming+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.cspg-hexbinary": {
	source: "iana"
},
	"application/vnd.oipf.dae.svg+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.dae.xhtml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.mippvcontrolmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.pae.gem": {
	source: "iana"
},
	"application/vnd.oipf.spdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.spdlist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.ueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.userprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.olpc-sugar": {
	source: "iana",
	extensions: [
		"xo"
	]
},
	"application/vnd.oma-scws-config": {
	source: "iana"
},
	"application/vnd.oma-scws-http-request": {
	source: "iana"
},
	"application/vnd.oma-scws-http-response": {
	source: "iana"
},
	"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.drm-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.imd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.ltkm": {
	source: "iana"
},
	"application/vnd.oma.bcast.notification+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.provisioningtrigger": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgboot": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgdd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sgdu": {
	source: "iana"
},
	"application/vnd.oma.bcast.simple-symbol-container": {
	source: "iana"
},
	"application/vnd.oma.bcast.smartcard-trigger+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sprov+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.stkm": {
	source: "iana"
},
	"application/vnd.oma.cab-address-book+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-feature-handler+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-pcc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-subs-invite+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-user-prefs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.dcd": {
	source: "iana"
},
	"application/vnd.oma.dcdc": {
	source: "iana"
},
	"application/vnd.oma.dd2+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dd2"
	]
},
	"application/vnd.oma.drm.risd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.group-usage-list+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+cbor": {
	source: "iana"
},
	"application/vnd.oma.lwm2m+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+tlv": {
	source: "iana"
},
	"application/vnd.oma.pal+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.detailed-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.final-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.groups+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.invocation-descriptor+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.optimized-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.push": {
	source: "iana"
},
	"application/vnd.oma.scidm.messages+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.xcap-directory+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.omads-email+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-file+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-folder+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omaloc-supl-init": {
	source: "iana"
},
	"application/vnd.onepager": {
	source: "iana"
},
	"application/vnd.onepagertamp": {
	source: "iana"
},
	"application/vnd.onepagertamx": {
	source: "iana"
},
	"application/vnd.onepagertat": {
	source: "iana"
},
	"application/vnd.onepagertatp": {
	source: "iana"
},
	"application/vnd.onepagertatx": {
	source: "iana"
},
	"application/vnd.openblox.game+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"obgx"
	]
},
	"application/vnd.openblox.game-binary": {
	source: "iana"
},
	"application/vnd.openeye.oeb": {
	source: "iana"
},
	"application/vnd.openofficeorg.extension": {
	source: "apache",
	extensions: [
		"oxt"
	]
},
	"application/vnd.openstreetmap.data+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osm"
	]
},
	"application/vnd.opentimestamps.ots": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawing+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"pptx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide": {
	source: "iana",
	extensions: [
		"sldx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
	source: "iana",
	extensions: [
		"ppsx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.template": {
	source: "iana",
	extensions: [
		"potx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"xlsx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
	source: "iana",
	extensions: [
		"xltx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.theme+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.vmldrawing": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
	source: "iana",
	compressible: false,
	extensions: [
		"docx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
	source: "iana",
	extensions: [
		"dotx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.core-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.relationships+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oracle.resource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.orange.indata": {
	source: "iana"
},
	"application/vnd.osa.netdeploy": {
	source: "iana"
},
	"application/vnd.osgeo.mapguide.package": {
	source: "iana",
	extensions: [
		"mgp"
	]
},
	"application/vnd.osgi.bundle": {
	source: "iana"
},
	"application/vnd.osgi.dp": {
	source: "iana",
	extensions: [
		"dp"
	]
},
	"application/vnd.osgi.subsystem": {
	source: "iana",
	extensions: [
		"esa"
	]
},
	"application/vnd.otps.ct-kip+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oxli.countgraph": {
	source: "iana"
},
	"application/vnd.pagerduty+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.palm": {
	source: "iana",
	extensions: [
		"pdb",
		"pqa",
		"oprc"
	]
},
	"application/vnd.panoply": {
	source: "iana"
},
	"application/vnd.paos.xml": {
	source: "iana"
},
	"application/vnd.patentdive": {
	source: "iana"
},
	"application/vnd.patientecommsdoc": {
	source: "iana"
},
	"application/vnd.pawaafile": {
	source: "iana",
	extensions: [
		"paw"
	]
},
	"application/vnd.pcos": {
	source: "iana"
},
	"application/vnd.pg.format": {
	source: "iana",
	extensions: [
		"str"
	]
},
	"application/vnd.pg.osasli": {
	source: "iana",
	extensions: [
		"ei6"
	]
},
	"application/vnd.piaccess.application-licence": {
	source: "iana"
},
	"application/vnd.picsel": {
	source: "iana",
	extensions: [
		"efif"
	]
},
	"application/vnd.pmi.widget": {
	source: "iana",
	extensions: [
		"wg"
	]
},
	"application/vnd.poc.group-advertisement+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.pocketlearn": {
	source: "iana",
	extensions: [
		"plf"
	]
},
	"application/vnd.powerbuilder6": {
	source: "iana",
	extensions: [
		"pbd"
	]
},
	"application/vnd.powerbuilder6-s": {
	source: "iana"
},
	"application/vnd.powerbuilder7": {
	source: "iana"
},
	"application/vnd.powerbuilder7-s": {
	source: "iana"
},
	"application/vnd.powerbuilder75": {
	source: "iana"
},
	"application/vnd.powerbuilder75-s": {
	source: "iana"
},
	"application/vnd.preminet": {
	source: "iana"
},
	"application/vnd.previewsystems.box": {
	source: "iana",
	extensions: [
		"box"
	]
},
	"application/vnd.proteus.magazine": {
	source: "iana",
	extensions: [
		"mgz"
	]
},
	"application/vnd.psfs": {
	source: "iana"
},
	"application/vnd.publishare-delta-tree": {
	source: "iana",
	extensions: [
		"qps"
	]
},
	"application/vnd.pvi.ptid1": {
	source: "iana",
	extensions: [
		"ptid"
	]
},
	"application/vnd.pwg-multiplexed": {
	source: "iana"
},
	"application/vnd.pwg-xhtml-print+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.qualcomm.brew-app-res": {
	source: "iana"
},
	"application/vnd.quarantainenet": {
	source: "iana"
},
	"application/vnd.quark.quarkxpress": {
	source: "iana",
	extensions: [
		"qxd",
		"qxt",
		"qwd",
		"qwt",
		"qxl",
		"qxb"
	]
},
	"application/vnd.quobject-quoxdocument": {
	source: "iana"
},
	"application/vnd.radisys.moml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-stream+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-base+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-detect+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-group+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-speech+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-transform+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.rainstor.data": {
	source: "iana"
},
	"application/vnd.rapid": {
	source: "iana"
},
	"application/vnd.rar": {
	source: "iana",
	extensions: [
		"rar"
	]
},
	"application/vnd.realvnc.bed": {
	source: "iana",
	extensions: [
		"bed"
	]
},
	"application/vnd.recordare.musicxml": {
	source: "iana",
	extensions: [
		"mxl"
	]
},
	"application/vnd.recordare.musicxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musicxml"
	]
},
	"application/vnd.renlearn.rlprint": {
	source: "iana"
},
	"application/vnd.resilient.logic": {
	source: "iana"
},
	"application/vnd.restful+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.rig.cryptonote": {
	source: "iana",
	extensions: [
		"cryptonote"
	]
},
	"application/vnd.rim.cod": {
	source: "apache",
	extensions: [
		"cod"
	]
},
	"application/vnd.rn-realmedia": {
	source: "apache",
	extensions: [
		"rm"
	]
},
	"application/vnd.rn-realmedia-vbr": {
	source: "apache",
	extensions: [
		"rmvb"
	]
},
	"application/vnd.route66.link66+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"link66"
	]
},
	"application/vnd.rs-274x": {
	source: "iana"
},
	"application/vnd.ruckus.download": {
	source: "iana"
},
	"application/vnd.s3sms": {
	source: "iana"
},
	"application/vnd.sailingtracker.track": {
	source: "iana",
	extensions: [
		"st"
	]
},
	"application/vnd.sar": {
	source: "iana"
},
	"application/vnd.sbm.cid": {
	source: "iana"
},
	"application/vnd.sbm.mid2": {
	source: "iana"
},
	"application/vnd.scribus": {
	source: "iana"
},
	"application/vnd.sealed.3df": {
	source: "iana"
},
	"application/vnd.sealed.csf": {
	source: "iana"
},
	"application/vnd.sealed.doc": {
	source: "iana"
},
	"application/vnd.sealed.eml": {
	source: "iana"
},
	"application/vnd.sealed.mht": {
	source: "iana"
},
	"application/vnd.sealed.net": {
	source: "iana"
},
	"application/vnd.sealed.ppt": {
	source: "iana"
},
	"application/vnd.sealed.tiff": {
	source: "iana"
},
	"application/vnd.sealed.xls": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.html": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.pdf": {
	source: "iana"
},
	"application/vnd.seemail": {
	source: "iana",
	extensions: [
		"see"
	]
},
	"application/vnd.seis+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.sema": {
	source: "iana",
	extensions: [
		"sema"
	]
},
	"application/vnd.semd": {
	source: "iana",
	extensions: [
		"semd"
	]
},
	"application/vnd.semf": {
	source: "iana",
	extensions: [
		"semf"
	]
},
	"application/vnd.shade-save-file": {
	source: "iana"
},
	"application/vnd.shana.informed.formdata": {
	source: "iana",
	extensions: [
		"ifm"
	]
},
	"application/vnd.shana.informed.formtemplate": {
	source: "iana",
	extensions: [
		"itp"
	]
},
	"application/vnd.shana.informed.interchange": {
	source: "iana",
	extensions: [
		"iif"
	]
},
	"application/vnd.shana.informed.package": {
	source: "iana",
	extensions: [
		"ipk"
	]
},
	"application/vnd.shootproof+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shopkick+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shp": {
	source: "iana"
},
	"application/vnd.shx": {
	source: "iana"
},
	"application/vnd.sigrok.session": {
	source: "iana"
},
	"application/vnd.simtech-mindmapper": {
	source: "iana",
	extensions: [
		"twd",
		"twds"
	]
},
	"application/vnd.siren+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.smaf": {
	source: "iana",
	extensions: [
		"mmf"
	]
},
	"application/vnd.smart.notebook": {
	source: "iana"
},
	"application/vnd.smart.teacher": {
	source: "iana",
	extensions: [
		"teacher"
	]
},
	"application/vnd.snesdev-page-table": {
	source: "iana"
},
	"application/vnd.software602.filler.form+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fo"
	]
},
	"application/vnd.software602.filler.form-xml-zip": {
	source: "iana"
},
	"application/vnd.solent.sdkm+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sdkm",
		"sdkd"
	]
},
	"application/vnd.spotfire.dxp": {
	source: "iana",
	extensions: [
		"dxp"
	]
},
	"application/vnd.spotfire.sfs": {
	source: "iana",
	extensions: [
		"sfs"
	]
},
	"application/vnd.sqlite3": {
	source: "iana"
},
	"application/vnd.sss-cod": {
	source: "iana"
},
	"application/vnd.sss-dtf": {
	source: "iana"
},
	"application/vnd.sss-ntf": {
	source: "iana"
},
	"application/vnd.stardivision.calc": {
	source: "apache",
	extensions: [
		"sdc"
	]
},
	"application/vnd.stardivision.draw": {
	source: "apache",
	extensions: [
		"sda"
	]
},
	"application/vnd.stardivision.impress": {
	source: "apache",
	extensions: [
		"sdd"
	]
},
	"application/vnd.stardivision.math": {
	source: "apache",
	extensions: [
		"smf"
	]
},
	"application/vnd.stardivision.writer": {
	source: "apache",
	extensions: [
		"sdw",
		"vor"
	]
},
	"application/vnd.stardivision.writer-global": {
	source: "apache",
	extensions: [
		"sgl"
	]
},
	"application/vnd.stepmania.package": {
	source: "iana",
	extensions: [
		"smzip"
	]
},
	"application/vnd.stepmania.stepchart": {
	source: "iana",
	extensions: [
		"sm"
	]
},
	"application/vnd.street-stream": {
	source: "iana"
},
	"application/vnd.sun.wadl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wadl"
	]
},
	"application/vnd.sun.xml.calc": {
	source: "apache",
	extensions: [
		"sxc"
	]
},
	"application/vnd.sun.xml.calc.template": {
	source: "apache",
	extensions: [
		"stc"
	]
},
	"application/vnd.sun.xml.draw": {
	source: "apache",
	extensions: [
		"sxd"
	]
},
	"application/vnd.sun.xml.draw.template": {
	source: "apache",
	extensions: [
		"std"
	]
},
	"application/vnd.sun.xml.impress": {
	source: "apache",
	extensions: [
		"sxi"
	]
},
	"application/vnd.sun.xml.impress.template": {
	source: "apache",
	extensions: [
		"sti"
	]
},
	"application/vnd.sun.xml.math": {
	source: "apache",
	extensions: [
		"sxm"
	]
},
	"application/vnd.sun.xml.writer": {
	source: "apache",
	extensions: [
		"sxw"
	]
},
	"application/vnd.sun.xml.writer.global": {
	source: "apache",
	extensions: [
		"sxg"
	]
},
	"application/vnd.sun.xml.writer.template": {
	source: "apache",
	extensions: [
		"stw"
	]
},
	"application/vnd.sus-calendar": {
	source: "iana",
	extensions: [
		"sus",
		"susp"
	]
},
	"application/vnd.svd": {
	source: "iana",
	extensions: [
		"svd"
	]
},
	"application/vnd.swiftview-ics": {
	source: "iana"
},
	"application/vnd.sycle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.syft+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.symbian.install": {
	source: "apache",
	extensions: [
		"sis",
		"sisx"
	]
},
	"application/vnd.syncml+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xsm"
	]
},
	"application/vnd.syncml.dm+wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"bdm"
	]
},
	"application/vnd.syncml.dm+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xdm"
	]
},
	"application/vnd.syncml.dm.notification": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"ddf"
	]
},
	"application/vnd.syncml.dmtnds+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmtnds+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.syncml.ds.notification": {
	source: "iana"
},
	"application/vnd.tableschema+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tao.intent-module-archive": {
	source: "iana",
	extensions: [
		"tao"
	]
},
	"application/vnd.tcpdump.pcap": {
	source: "iana",
	extensions: [
		"pcap",
		"cap",
		"dmp"
	]
},
	"application/vnd.think-cell.ppttc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tmd.mediaflex.api+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.tml": {
	source: "iana"
},
	"application/vnd.tmobile-livetv": {
	source: "iana",
	extensions: [
		"tmo"
	]
},
	"application/vnd.tri.onesource": {
	source: "iana"
},
	"application/vnd.trid.tpt": {
	source: "iana",
	extensions: [
		"tpt"
	]
},
	"application/vnd.triscape.mxs": {
	source: "iana",
	extensions: [
		"mxs"
	]
},
	"application/vnd.trueapp": {
	source: "iana",
	extensions: [
		"tra"
	]
},
	"application/vnd.truedoc": {
	source: "iana"
},
	"application/vnd.ubisoft.webplayer": {
	source: "iana"
},
	"application/vnd.ufdl": {
	source: "iana",
	extensions: [
		"ufd",
		"ufdl"
	]
},
	"application/vnd.uiq.theme": {
	source: "iana",
	extensions: [
		"utz"
	]
},
	"application/vnd.umajin": {
	source: "iana",
	extensions: [
		"umj"
	]
},
	"application/vnd.unity": {
	source: "iana",
	extensions: [
		"unityweb"
	]
},
	"application/vnd.uoml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uoml"
	]
},
	"application/vnd.uplanet.alert": {
	source: "iana"
},
	"application/vnd.uplanet.alert-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.channel": {
	source: "iana"
},
	"application/vnd.uplanet.channel-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.list": {
	source: "iana"
},
	"application/vnd.uplanet.list-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.signal": {
	source: "iana"
},
	"application/vnd.uri-map": {
	source: "iana"
},
	"application/vnd.valve.source.material": {
	source: "iana"
},
	"application/vnd.vcx": {
	source: "iana",
	extensions: [
		"vcx"
	]
},
	"application/vnd.vd-study": {
	source: "iana"
},
	"application/vnd.vectorworks": {
	source: "iana"
},
	"application/vnd.vel+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.verimatrix.vcas": {
	source: "iana"
},
	"application/vnd.veritone.aion+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.veryant.thin": {
	source: "iana"
},
	"application/vnd.ves.encrypted": {
	source: "iana"
},
	"application/vnd.vidsoft.vidconference": {
	source: "iana"
},
	"application/vnd.visio": {
	source: "iana",
	extensions: [
		"vsd",
		"vst",
		"vss",
		"vsw"
	]
},
	"application/vnd.visionary": {
	source: "iana",
	extensions: [
		"vis"
	]
},
	"application/vnd.vividence.scriptfile": {
	source: "iana"
},
	"application/vnd.vsf": {
	source: "iana",
	extensions: [
		"vsf"
	]
},
	"application/vnd.wap.sic": {
	source: "iana"
},
	"application/vnd.wap.slc": {
	source: "iana"
},
	"application/vnd.wap.wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"wbxml"
	]
},
	"application/vnd.wap.wmlc": {
	source: "iana",
	extensions: [
		"wmlc"
	]
},
	"application/vnd.wap.wmlscriptc": {
	source: "iana",
	extensions: [
		"wmlsc"
	]
},
	"application/vnd.webturbo": {
	source: "iana",
	extensions: [
		"wtb"
	]
},
	"application/vnd.wfa.dpp": {
	source: "iana"
},
	"application/vnd.wfa.p2p": {
	source: "iana"
},
	"application/vnd.wfa.wsc": {
	source: "iana"
},
	"application/vnd.windows.devicepairing": {
	source: "iana"
},
	"application/vnd.wmc": {
	source: "iana"
},
	"application/vnd.wmf.bootstrap": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica.package": {
	source: "iana"
},
	"application/vnd.wolfram.player": {
	source: "iana",
	extensions: [
		"nbp"
	]
},
	"application/vnd.wordperfect": {
	source: "iana",
	extensions: [
		"wpd"
	]
},
	"application/vnd.wqd": {
	source: "iana",
	extensions: [
		"wqd"
	]
},
	"application/vnd.wrq-hp3000-labelled": {
	source: "iana"
},
	"application/vnd.wt.stf": {
	source: "iana",
	extensions: [
		"stf"
	]
},
	"application/vnd.wv.csp+wbxml": {
	source: "iana"
},
	"application/vnd.wv.csp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.wv.ssp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xacml+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.xara": {
	source: "iana",
	extensions: [
		"xar"
	]
},
	"application/vnd.xfdl": {
	source: "iana",
	extensions: [
		"xfdl"
	]
},
	"application/vnd.xfdl.webform": {
	source: "iana"
},
	"application/vnd.xmi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xmpie.cpkg": {
	source: "iana"
},
	"application/vnd.xmpie.dpkg": {
	source: "iana"
},
	"application/vnd.xmpie.plan": {
	source: "iana"
},
	"application/vnd.xmpie.ppkg": {
	source: "iana"
},
	"application/vnd.xmpie.xlim": {
	source: "iana"
},
	"application/vnd.yamaha.hv-dic": {
	source: "iana",
	extensions: [
		"hvd"
	]
},
	"application/vnd.yamaha.hv-script": {
	source: "iana",
	extensions: [
		"hvs"
	]
},
	"application/vnd.yamaha.hv-voice": {
	source: "iana",
	extensions: [
		"hvp"
	]
},
	"application/vnd.yamaha.openscoreformat": {
	source: "iana",
	extensions: [
		"osf"
	]
},
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osfpvg"
	]
},
	"application/vnd.yamaha.remote-setup": {
	source: "iana"
},
	"application/vnd.yamaha.smaf-audio": {
	source: "iana",
	extensions: [
		"saf"
	]
},
	"application/vnd.yamaha.smaf-phrase": {
	source: "iana",
	extensions: [
		"spf"
	]
},
	"application/vnd.yamaha.through-ngn": {
	source: "iana"
},
	"application/vnd.yamaha.tunnel-udpencap": {
	source: "iana"
},
	"application/vnd.yaoweme": {
	source: "iana"
},
	"application/vnd.yellowriver-custom-menu": {
	source: "iana",
	extensions: [
		"cmp"
	]
},
	"application/vnd.youtube.yt": {
	source: "iana"
},
	"application/vnd.zul": {
	source: "iana",
	extensions: [
		"zir",
		"zirz"
	]
},
	"application/vnd.zzazz.deck+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zaz"
	]
},
	"application/voicexml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"vxml"
	]
},
	"application/voucher-cms+json": {
	source: "iana",
	compressible: true
},
	"application/vq-rtcpxr": {
	source: "iana"
},
	"application/wasm": {
	source: "iana",
	compressible: true,
	extensions: [
		"wasm"
	]
},
	"application/watcherinfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wif"
	]
},
	"application/webpush-options+json": {
	source: "iana",
	compressible: true
},
	"application/whoispp-query": {
	source: "iana"
},
	"application/whoispp-response": {
	source: "iana"
},
	"application/widget": {
	source: "iana",
	extensions: [
		"wgt"
	]
},
	"application/winhlp": {
	source: "apache",
	extensions: [
		"hlp"
	]
},
	"application/wita": {
	source: "iana"
},
	"application/wordperfect5.1": {
	source: "iana"
},
	"application/wsdl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wsdl"
	]
},
	"application/wspolicy+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wspolicy"
	]
},
	"application/x-7z-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"7z"
	]
},
	"application/x-abiword": {
	source: "apache",
	extensions: [
		"abw"
	]
},
	"application/x-ace-compressed": {
	source: "apache",
	extensions: [
		"ace"
	]
},
	"application/x-amf": {
	source: "apache"
},
	"application/x-apple-diskimage": {
	source: "apache",
	extensions: [
		"dmg"
	]
},
	"application/x-arj": {
	compressible: false,
	extensions: [
		"arj"
	]
},
	"application/x-authorware-bin": {
	source: "apache",
	extensions: [
		"aab",
		"x32",
		"u32",
		"vox"
	]
},
	"application/x-authorware-map": {
	source: "apache",
	extensions: [
		"aam"
	]
},
	"application/x-authorware-seg": {
	source: "apache",
	extensions: [
		"aas"
	]
},
	"application/x-bcpio": {
	source: "apache",
	extensions: [
		"bcpio"
	]
},
	"application/x-bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/x-bittorrent": {
	source: "apache",
	extensions: [
		"torrent"
	]
},
	"application/x-blorb": {
	source: "apache",
	extensions: [
		"blb",
		"blorb"
	]
},
	"application/x-bzip": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz"
	]
},
	"application/x-bzip2": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz2",
		"boz"
	]
},
	"application/x-cbr": {
	source: "apache",
	extensions: [
		"cbr",
		"cba",
		"cbt",
		"cbz",
		"cb7"
	]
},
	"application/x-cdlink": {
	source: "apache",
	extensions: [
		"vcd"
	]
},
	"application/x-cfs-compressed": {
	source: "apache",
	extensions: [
		"cfs"
	]
},
	"application/x-chat": {
	source: "apache",
	extensions: [
		"chat"
	]
},
	"application/x-chess-pgn": {
	source: "apache",
	extensions: [
		"pgn"
	]
},
	"application/x-chrome-extension": {
	extensions: [
		"crx"
	]
},
	"application/x-cocoa": {
	source: "nginx",
	extensions: [
		"cco"
	]
},
	"application/x-compress": {
	source: "apache"
},
	"application/x-conference": {
	source: "apache",
	extensions: [
		"nsc"
	]
},
	"application/x-cpio": {
	source: "apache",
	extensions: [
		"cpio"
	]
},
	"application/x-csh": {
	source: "apache",
	extensions: [
		"csh"
	]
},
	"application/x-deb": {
	compressible: false
},
	"application/x-debian-package": {
	source: "apache",
	extensions: [
		"deb",
		"udeb"
	]
},
	"application/x-dgc-compressed": {
	source: "apache",
	extensions: [
		"dgc"
	]
},
	"application/x-director": {
	source: "apache",
	extensions: [
		"dir",
		"dcr",
		"dxr",
		"cst",
		"cct",
		"cxt",
		"w3d",
		"fgd",
		"swa"
	]
},
	"application/x-doom": {
	source: "apache",
	extensions: [
		"wad"
	]
},
	"application/x-dtbncx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ncx"
	]
},
	"application/x-dtbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dtb"
	]
},
	"application/x-dtbresource+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"res"
	]
},
	"application/x-dvi": {
	source: "apache",
	compressible: false,
	extensions: [
		"dvi"
	]
},
	"application/x-envoy": {
	source: "apache",
	extensions: [
		"evy"
	]
},
	"application/x-eva": {
	source: "apache",
	extensions: [
		"eva"
	]
},
	"application/x-font-bdf": {
	source: "apache",
	extensions: [
		"bdf"
	]
},
	"application/x-font-dos": {
	source: "apache"
},
	"application/x-font-framemaker": {
	source: "apache"
},
	"application/x-font-ghostscript": {
	source: "apache",
	extensions: [
		"gsf"
	]
},
	"application/x-font-libgrx": {
	source: "apache"
},
	"application/x-font-linux-psf": {
	source: "apache",
	extensions: [
		"psf"
	]
},
	"application/x-font-pcf": {
	source: "apache",
	extensions: [
		"pcf"
	]
},
	"application/x-font-snf": {
	source: "apache",
	extensions: [
		"snf"
	]
},
	"application/x-font-speedo": {
	source: "apache"
},
	"application/x-font-sunos-news": {
	source: "apache"
},
	"application/x-font-type1": {
	source: "apache",
	extensions: [
		"pfa",
		"pfb",
		"pfm",
		"afm"
	]
},
	"application/x-font-vfont": {
	source: "apache"
},
	"application/x-freearc": {
	source: "apache",
	extensions: [
		"arc"
	]
},
	"application/x-futuresplash": {
	source: "apache",
	extensions: [
		"spl"
	]
},
	"application/x-gca-compressed": {
	source: "apache",
	extensions: [
		"gca"
	]
},
	"application/x-glulx": {
	source: "apache",
	extensions: [
		"ulx"
	]
},
	"application/x-gnumeric": {
	source: "apache",
	extensions: [
		"gnumeric"
	]
},
	"application/x-gramps-xml": {
	source: "apache",
	extensions: [
		"gramps"
	]
},
	"application/x-gtar": {
	source: "apache",
	extensions: [
		"gtar"
	]
},
	"application/x-gzip": {
	source: "apache"
},
	"application/x-hdf": {
	source: "apache",
	extensions: [
		"hdf"
	]
},
	"application/x-httpd-php": {
	compressible: true,
	extensions: [
		"php"
	]
},
	"application/x-install-instructions": {
	source: "apache",
	extensions: [
		"install"
	]
},
	"application/x-iso9660-image": {
	source: "apache",
	extensions: [
		"iso"
	]
},
	"application/x-iwork-keynote-sffkey": {
	extensions: [
		"key"
	]
},
	"application/x-iwork-numbers-sffnumbers": {
	extensions: [
		"numbers"
	]
},
	"application/x-iwork-pages-sffpages": {
	extensions: [
		"pages"
	]
},
	"application/x-java-archive-diff": {
	source: "nginx",
	extensions: [
		"jardiff"
	]
},
	"application/x-java-jnlp-file": {
	source: "apache",
	compressible: false,
	extensions: [
		"jnlp"
	]
},
	"application/x-javascript": {
	compressible: true
},
	"application/x-keepass2": {
	extensions: [
		"kdbx"
	]
},
	"application/x-latex": {
	source: "apache",
	compressible: false,
	extensions: [
		"latex"
	]
},
	"application/x-lua-bytecode": {
	extensions: [
		"luac"
	]
},
	"application/x-lzh-compressed": {
	source: "apache",
	extensions: [
		"lzh",
		"lha"
	]
},
	"application/x-makeself": {
	source: "nginx",
	extensions: [
		"run"
	]
},
	"application/x-mie": {
	source: "apache",
	extensions: [
		"mie"
	]
},
	"application/x-mobipocket-ebook": {
	source: "apache",
	extensions: [
		"prc",
		"mobi"
	]
},
	"application/x-mpegurl": {
	compressible: false
},
	"application/x-ms-application": {
	source: "apache",
	extensions: [
		"application"
	]
},
	"application/x-ms-shortcut": {
	source: "apache",
	extensions: [
		"lnk"
	]
},
	"application/x-ms-wmd": {
	source: "apache",
	extensions: [
		"wmd"
	]
},
	"application/x-ms-wmz": {
	source: "apache",
	extensions: [
		"wmz"
	]
},
	"application/x-ms-xbap": {
	source: "apache",
	extensions: [
		"xbap"
	]
},
	"application/x-msaccess": {
	source: "apache",
	extensions: [
		"mdb"
	]
},
	"application/x-msbinder": {
	source: "apache",
	extensions: [
		"obd"
	]
},
	"application/x-mscardfile": {
	source: "apache",
	extensions: [
		"crd"
	]
},
	"application/x-msclip": {
	source: "apache",
	extensions: [
		"clp"
	]
},
	"application/x-msdos-program": {
	extensions: [
		"exe"
	]
},
	"application/x-msdownload": {
	source: "apache",
	extensions: [
		"exe",
		"dll",
		"com",
		"bat",
		"msi"
	]
},
	"application/x-msmediaview": {
	source: "apache",
	extensions: [
		"mvb",
		"m13",
		"m14"
	]
},
	"application/x-msmetafile": {
	source: "apache",
	extensions: [
		"wmf",
		"wmz",
		"emf",
		"emz"
	]
},
	"application/x-msmoney": {
	source: "apache",
	extensions: [
		"mny"
	]
},
	"application/x-mspublisher": {
	source: "apache",
	extensions: [
		"pub"
	]
},
	"application/x-msschedule": {
	source: "apache",
	extensions: [
		"scd"
	]
},
	"application/x-msterminal": {
	source: "apache",
	extensions: [
		"trm"
	]
},
	"application/x-mswrite": {
	source: "apache",
	extensions: [
		"wri"
	]
},
	"application/x-netcdf": {
	source: "apache",
	extensions: [
		"nc",
		"cdf"
	]
},
	"application/x-ns-proxy-autoconfig": {
	compressible: true,
	extensions: [
		"pac"
	]
},
	"application/x-nzb": {
	source: "apache",
	extensions: [
		"nzb"
	]
},
	"application/x-perl": {
	source: "nginx",
	extensions: [
		"pl",
		"pm"
	]
},
	"application/x-pilot": {
	source: "nginx",
	extensions: [
		"prc",
		"pdb"
	]
},
	"application/x-pkcs12": {
	source: "apache",
	compressible: false,
	extensions: [
		"p12",
		"pfx"
	]
},
	"application/x-pkcs7-certificates": {
	source: "apache",
	extensions: [
		"p7b",
		"spc"
	]
},
	"application/x-pkcs7-certreqresp": {
	source: "apache",
	extensions: [
		"p7r"
	]
},
	"application/x-pki-message": {
	source: "iana"
},
	"application/x-rar-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"rar"
	]
},
	"application/x-redhat-package-manager": {
	source: "nginx",
	extensions: [
		"rpm"
	]
},
	"application/x-research-info-systems": {
	source: "apache",
	extensions: [
		"ris"
	]
},
	"application/x-sea": {
	source: "nginx",
	extensions: [
		"sea"
	]
},
	"application/x-sh": {
	source: "apache",
	compressible: true,
	extensions: [
		"sh"
	]
},
	"application/x-shar": {
	source: "apache",
	extensions: [
		"shar"
	]
},
	"application/x-shockwave-flash": {
	source: "apache",
	compressible: false,
	extensions: [
		"swf"
	]
},
	"application/x-silverlight-app": {
	source: "apache",
	extensions: [
		"xap"
	]
},
	"application/x-sql": {
	source: "apache",
	extensions: [
		"sql"
	]
},
	"application/x-stuffit": {
	source: "apache",
	compressible: false,
	extensions: [
		"sit"
	]
},
	"application/x-stuffitx": {
	source: "apache",
	extensions: [
		"sitx"
	]
},
	"application/x-subrip": {
	source: "apache",
	extensions: [
		"srt"
	]
},
	"application/x-sv4cpio": {
	source: "apache",
	extensions: [
		"sv4cpio"
	]
},
	"application/x-sv4crc": {
	source: "apache",
	extensions: [
		"sv4crc"
	]
},
	"application/x-t3vm-image": {
	source: "apache",
	extensions: [
		"t3"
	]
},
	"application/x-tads": {
	source: "apache",
	extensions: [
		"gam"
	]
},
	"application/x-tar": {
	source: "apache",
	compressible: true,
	extensions: [
		"tar"
	]
},
	"application/x-tcl": {
	source: "apache",
	extensions: [
		"tcl",
		"tk"
	]
},
	"application/x-tex": {
	source: "apache",
	extensions: [
		"tex"
	]
},
	"application/x-tex-tfm": {
	source: "apache",
	extensions: [
		"tfm"
	]
},
	"application/x-texinfo": {
	source: "apache",
	extensions: [
		"texinfo",
		"texi"
	]
},
	"application/x-tgif": {
	source: "apache",
	extensions: [
		"obj"
	]
},
	"application/x-ustar": {
	source: "apache",
	extensions: [
		"ustar"
	]
},
	"application/x-virtualbox-hdd": {
	compressible: true,
	extensions: [
		"hdd"
	]
},
	"application/x-virtualbox-ova": {
	compressible: true,
	extensions: [
		"ova"
	]
},
	"application/x-virtualbox-ovf": {
	compressible: true,
	extensions: [
		"ovf"
	]
},
	"application/x-virtualbox-vbox": {
	compressible: true,
	extensions: [
		"vbox"
	]
},
	"application/x-virtualbox-vbox-extpack": {
	compressible: false,
	extensions: [
		"vbox-extpack"
	]
},
	"application/x-virtualbox-vdi": {
	compressible: true,
	extensions: [
		"vdi"
	]
},
	"application/x-virtualbox-vhd": {
	compressible: true,
	extensions: [
		"vhd"
	]
},
	"application/x-virtualbox-vmdk": {
	compressible: true,
	extensions: [
		"vmdk"
	]
},
	"application/x-wais-source": {
	source: "apache",
	extensions: [
		"src"
	]
},
	"application/x-web-app-manifest+json": {
	compressible: true,
	extensions: [
		"webapp"
	]
},
	"application/x-www-form-urlencoded": {
	source: "iana",
	compressible: true
},
	"application/x-x509-ca-cert": {
	source: "iana",
	extensions: [
		"der",
		"crt",
		"pem"
	]
},
	"application/x-x509-ca-ra-cert": {
	source: "iana"
},
	"application/x-x509-next-ca-cert": {
	source: "iana"
},
	"application/x-xfig": {
	source: "apache",
	extensions: [
		"fig"
	]
},
	"application/x-xliff+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/x-xpinstall": {
	source: "apache",
	compressible: false,
	extensions: [
		"xpi"
	]
},
	"application/x-xz": {
	source: "apache",
	extensions: [
		"xz"
	]
},
	"application/x-zmachine": {
	source: "apache",
	extensions: [
		"z1",
		"z2",
		"z3",
		"z4",
		"z5",
		"z6",
		"z7",
		"z8"
	]
},
	"application/x400-bp": {
	source: "iana"
},
	"application/xacml+xml": {
	source: "iana",
	compressible: true
},
	"application/xaml+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xaml"
	]
},
	"application/xcap-att+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xav"
	]
},
	"application/xcap-caps+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xca"
	]
},
	"application/xcap-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdf"
	]
},
	"application/xcap-el+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xel"
	]
},
	"application/xcap-error+xml": {
	source: "iana",
	compressible: true
},
	"application/xcap-ns+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xns"
	]
},
	"application/xcon-conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/xcon-conference-info-diff+xml": {
	source: "iana",
	compressible: true
},
	"application/xenc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xenc"
	]
},
	"application/xhtml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xhtml",
		"xht"
	]
},
	"application/xhtml-voice+xml": {
	source: "apache",
	compressible: true
},
	"application/xliff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml",
		"xsl",
		"xsd",
		"rng"
	]
},
	"application/xml-dtd": {
	source: "iana",
	compressible: true,
	extensions: [
		"dtd"
	]
},
	"application/xml-external-parsed-entity": {
	source: "iana"
},
	"application/xml-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/xmpp+xml": {
	source: "iana",
	compressible: true
},
	"application/xop+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xop"
	]
},
	"application/xproc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xpl"
	]
},
	"application/xslt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xsl",
		"xslt"
	]
},
	"application/xspf+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xspf"
	]
},
	"application/xv+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mxml",
		"xhvml",
		"xvml",
		"xvm"
	]
},
	"application/yang": {
	source: "iana",
	extensions: [
		"yang"
	]
},
	"application/yang-data+json": {
	source: "iana",
	compressible: true
},
	"application/yang-data+xml": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+json": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/yin+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"yin"
	]
},
	"application/zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"zip"
	]
},
	"application/zlib": {
	source: "iana"
},
	"application/zstd": {
	source: "iana"
},
	"audio/1d-interleaved-parityfec": {
	source: "iana"
},
	"audio/32kadpcm": {
	source: "iana"
},
	"audio/3gpp": {
	source: "iana",
	compressible: false,
	extensions: [
		"3gpp"
	]
},
	"audio/3gpp2": {
	source: "iana"
},
	"audio/aac": {
	source: "iana"
},
	"audio/ac3": {
	source: "iana"
},
	"audio/adpcm": {
	source: "apache",
	extensions: [
		"adp"
	]
},
	"audio/amr": {
	source: "iana",
	extensions: [
		"amr"
	]
},
	"audio/amr-wb": {
	source: "iana"
},
	"audio/amr-wb+": {
	source: "iana"
},
	"audio/aptx": {
	source: "iana"
},
	"audio/asc": {
	source: "iana"
},
	"audio/atrac-advanced-lossless": {
	source: "iana"
},
	"audio/atrac-x": {
	source: "iana"
},
	"audio/atrac3": {
	source: "iana"
},
	"audio/basic": {
	source: "iana",
	compressible: false,
	extensions: [
		"au",
		"snd"
	]
},
	"audio/bv16": {
	source: "iana"
},
	"audio/bv32": {
	source: "iana"
},
	"audio/clearmode": {
	source: "iana"
},
	"audio/cn": {
	source: "iana"
},
	"audio/dat12": {
	source: "iana"
},
	"audio/dls": {
	source: "iana"
},
	"audio/dsr-es201108": {
	source: "iana"
},
	"audio/dsr-es202050": {
	source: "iana"
},
	"audio/dsr-es202211": {
	source: "iana"
},
	"audio/dsr-es202212": {
	source: "iana"
},
	"audio/dv": {
	source: "iana"
},
	"audio/dvi4": {
	source: "iana"
},
	"audio/eac3": {
	source: "iana"
},
	"audio/encaprtp": {
	source: "iana"
},
	"audio/evrc": {
	source: "iana"
},
	"audio/evrc-qcp": {
	source: "iana"
},
	"audio/evrc0": {
	source: "iana"
},
	"audio/evrc1": {
	source: "iana"
},
	"audio/evrcb": {
	source: "iana"
},
	"audio/evrcb0": {
	source: "iana"
},
	"audio/evrcb1": {
	source: "iana"
},
	"audio/evrcnw": {
	source: "iana"
},
	"audio/evrcnw0": {
	source: "iana"
},
	"audio/evrcnw1": {
	source: "iana"
},
	"audio/evrcwb": {
	source: "iana"
},
	"audio/evrcwb0": {
	source: "iana"
},
	"audio/evrcwb1": {
	source: "iana"
},
	"audio/evs": {
	source: "iana"
},
	"audio/flexfec": {
	source: "iana"
},
	"audio/fwdred": {
	source: "iana"
},
	"audio/g711-0": {
	source: "iana"
},
	"audio/g719": {
	source: "iana"
},
	"audio/g722": {
	source: "iana"
},
	"audio/g7221": {
	source: "iana"
},
	"audio/g723": {
	source: "iana"
},
	"audio/g726-16": {
	source: "iana"
},
	"audio/g726-24": {
	source: "iana"
},
	"audio/g726-32": {
	source: "iana"
},
	"audio/g726-40": {
	source: "iana"
},
	"audio/g728": {
	source: "iana"
},
	"audio/g729": {
	source: "iana"
},
	"audio/g7291": {
	source: "iana"
},
	"audio/g729d": {
	source: "iana"
},
	"audio/g729e": {
	source: "iana"
},
	"audio/gsm": {
	source: "iana"
},
	"audio/gsm-efr": {
	source: "iana"
},
	"audio/gsm-hr-08": {
	source: "iana"
},
	"audio/ilbc": {
	source: "iana"
},
	"audio/ip-mr_v2.5": {
	source: "iana"
},
	"audio/isac": {
	source: "apache"
},
	"audio/l16": {
	source: "iana"
},
	"audio/l20": {
	source: "iana"
},
	"audio/l24": {
	source: "iana",
	compressible: false
},
	"audio/l8": {
	source: "iana"
},
	"audio/lpc": {
	source: "iana"
},
	"audio/melp": {
	source: "iana"
},
	"audio/melp1200": {
	source: "iana"
},
	"audio/melp2400": {
	source: "iana"
},
	"audio/melp600": {
	source: "iana"
},
	"audio/mhas": {
	source: "iana"
},
	"audio/midi": {
	source: "apache",
	extensions: [
		"mid",
		"midi",
		"kar",
		"rmi"
	]
},
	"audio/mobile-xmf": {
	source: "iana",
	extensions: [
		"mxmf"
	]
},
	"audio/mp3": {
	compressible: false,
	extensions: [
		"mp3"
	]
},
	"audio/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"m4a",
		"mp4a"
	]
},
	"audio/mp4a-latm": {
	source: "iana"
},
	"audio/mpa": {
	source: "iana"
},
	"audio/mpa-robust": {
	source: "iana"
},
	"audio/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpga",
		"mp2",
		"mp2a",
		"mp3",
		"m2a",
		"m3a"
	]
},
	"audio/mpeg4-generic": {
	source: "iana"
},
	"audio/musepack": {
	source: "apache"
},
	"audio/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"oga",
		"ogg",
		"spx",
		"opus"
	]
},
	"audio/opus": {
	source: "iana"
},
	"audio/parityfec": {
	source: "iana"
},
	"audio/pcma": {
	source: "iana"
},
	"audio/pcma-wb": {
	source: "iana"
},
	"audio/pcmu": {
	source: "iana"
},
	"audio/pcmu-wb": {
	source: "iana"
},
	"audio/prs.sid": {
	source: "iana"
},
	"audio/qcelp": {
	source: "iana"
},
	"audio/raptorfec": {
	source: "iana"
},
	"audio/red": {
	source: "iana"
},
	"audio/rtp-enc-aescm128": {
	source: "iana"
},
	"audio/rtp-midi": {
	source: "iana"
},
	"audio/rtploopback": {
	source: "iana"
},
	"audio/rtx": {
	source: "iana"
},
	"audio/s3m": {
	source: "apache",
	extensions: [
		"s3m"
	]
},
	"audio/scip": {
	source: "iana"
},
	"audio/silk": {
	source: "apache",
	extensions: [
		"sil"
	]
},
	"audio/smv": {
	source: "iana"
},
	"audio/smv-qcp": {
	source: "iana"
},
	"audio/smv0": {
	source: "iana"
},
	"audio/sofa": {
	source: "iana"
},
	"audio/sp-midi": {
	source: "iana"
},
	"audio/speex": {
	source: "iana"
},
	"audio/t140c": {
	source: "iana"
},
	"audio/t38": {
	source: "iana"
},
	"audio/telephone-event": {
	source: "iana"
},
	"audio/tetra_acelp": {
	source: "iana"
},
	"audio/tetra_acelp_bb": {
	source: "iana"
},
	"audio/tone": {
	source: "iana"
},
	"audio/tsvcis": {
	source: "iana"
},
	"audio/uemclip": {
	source: "iana"
},
	"audio/ulpfec": {
	source: "iana"
},
	"audio/usac": {
	source: "iana"
},
	"audio/vdvi": {
	source: "iana"
},
	"audio/vmr-wb": {
	source: "iana"
},
	"audio/vnd.3gpp.iufp": {
	source: "iana"
},
	"audio/vnd.4sb": {
	source: "iana"
},
	"audio/vnd.audiokoz": {
	source: "iana"
},
	"audio/vnd.celp": {
	source: "iana"
},
	"audio/vnd.cisco.nse": {
	source: "iana"
},
	"audio/vnd.cmles.radio-events": {
	source: "iana"
},
	"audio/vnd.cns.anp1": {
	source: "iana"
},
	"audio/vnd.cns.inf1": {
	source: "iana"
},
	"audio/vnd.dece.audio": {
	source: "iana",
	extensions: [
		"uva",
		"uvva"
	]
},
	"audio/vnd.digital-winds": {
	source: "iana",
	extensions: [
		"eol"
	]
},
	"audio/vnd.dlna.adts": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.1": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.2": {
	source: "iana"
},
	"audio/vnd.dolby.mlp": {
	source: "iana"
},
	"audio/vnd.dolby.mps": {
	source: "iana"
},
	"audio/vnd.dolby.pl2": {
	source: "iana"
},
	"audio/vnd.dolby.pl2x": {
	source: "iana"
},
	"audio/vnd.dolby.pl2z": {
	source: "iana"
},
	"audio/vnd.dolby.pulse.1": {
	source: "iana"
},
	"audio/vnd.dra": {
	source: "iana",
	extensions: [
		"dra"
	]
},
	"audio/vnd.dts": {
	source: "iana",
	extensions: [
		"dts"
	]
},
	"audio/vnd.dts.hd": {
	source: "iana",
	extensions: [
		"dtshd"
	]
},
	"audio/vnd.dts.uhd": {
	source: "iana"
},
	"audio/vnd.dvb.file": {
	source: "iana"
},
	"audio/vnd.everad.plj": {
	source: "iana"
},
	"audio/vnd.hns.audio": {
	source: "iana"
},
	"audio/vnd.lucent.voice": {
	source: "iana",
	extensions: [
		"lvp"
	]
},
	"audio/vnd.ms-playready.media.pya": {
	source: "iana",
	extensions: [
		"pya"
	]
},
	"audio/vnd.nokia.mobile-xmf": {
	source: "iana"
},
	"audio/vnd.nortel.vbk": {
	source: "iana"
},
	"audio/vnd.nuera.ecelp4800": {
	source: "iana",
	extensions: [
		"ecelp4800"
	]
},
	"audio/vnd.nuera.ecelp7470": {
	source: "iana",
	extensions: [
		"ecelp7470"
	]
},
	"audio/vnd.nuera.ecelp9600": {
	source: "iana",
	extensions: [
		"ecelp9600"
	]
},
	"audio/vnd.octel.sbc": {
	source: "iana"
},
	"audio/vnd.presonus.multitrack": {
	source: "iana"
},
	"audio/vnd.qcelp": {
	source: "iana"
},
	"audio/vnd.rhetorex.32kadpcm": {
	source: "iana"
},
	"audio/vnd.rip": {
	source: "iana",
	extensions: [
		"rip"
	]
},
	"audio/vnd.rn-realaudio": {
	compressible: false
},
	"audio/vnd.sealedmedia.softseal.mpeg": {
	source: "iana"
},
	"audio/vnd.vmx.cvsd": {
	source: "iana"
},
	"audio/vnd.wave": {
	compressible: false
},
	"audio/vorbis": {
	source: "iana",
	compressible: false
},
	"audio/vorbis-config": {
	source: "iana"
},
	"audio/wav": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/wave": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"weba"
	]
},
	"audio/x-aac": {
	source: "apache",
	compressible: false,
	extensions: [
		"aac"
	]
},
	"audio/x-aiff": {
	source: "apache",
	extensions: [
		"aif",
		"aiff",
		"aifc"
	]
},
	"audio/x-caf": {
	source: "apache",
	compressible: false,
	extensions: [
		"caf"
	]
},
	"audio/x-flac": {
	source: "apache",
	extensions: [
		"flac"
	]
},
	"audio/x-m4a": {
	source: "nginx",
	extensions: [
		"m4a"
	]
},
	"audio/x-matroska": {
	source: "apache",
	extensions: [
		"mka"
	]
},
	"audio/x-mpegurl": {
	source: "apache",
	extensions: [
		"m3u"
	]
},
	"audio/x-ms-wax": {
	source: "apache",
	extensions: [
		"wax"
	]
},
	"audio/x-ms-wma": {
	source: "apache",
	extensions: [
		"wma"
	]
},
	"audio/x-pn-realaudio": {
	source: "apache",
	extensions: [
		"ram",
		"ra"
	]
},
	"audio/x-pn-realaudio-plugin": {
	source: "apache",
	extensions: [
		"rmp"
	]
},
	"audio/x-realaudio": {
	source: "nginx",
	extensions: [
		"ra"
	]
},
	"audio/x-tta": {
	source: "apache"
},
	"audio/x-wav": {
	source: "apache",
	extensions: [
		"wav"
	]
},
	"audio/xm": {
	source: "apache",
	extensions: [
		"xm"
	]
},
	"chemical/x-cdx": {
	source: "apache",
	extensions: [
		"cdx"
	]
},
	"chemical/x-cif": {
	source: "apache",
	extensions: [
		"cif"
	]
},
	"chemical/x-cmdf": {
	source: "apache",
	extensions: [
		"cmdf"
	]
},
	"chemical/x-cml": {
	source: "apache",
	extensions: [
		"cml"
	]
},
	"chemical/x-csml": {
	source: "apache",
	extensions: [
		"csml"
	]
},
	"chemical/x-pdb": {
	source: "apache"
},
	"chemical/x-xyz": {
	source: "apache",
	extensions: [
		"xyz"
	]
},
	"font/collection": {
	source: "iana",
	extensions: [
		"ttc"
	]
},
	"font/otf": {
	source: "iana",
	compressible: true,
	extensions: [
		"otf"
	]
},
	"font/sfnt": {
	source: "iana"
},
	"font/ttf": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttf"
	]
},
	"font/woff": {
	source: "iana",
	extensions: [
		"woff"
	]
},
	"font/woff2": {
	source: "iana",
	extensions: [
		"woff2"
	]
},
	"image/aces": {
	source: "iana",
	extensions: [
		"exr"
	]
},
	"image/apng": {
	compressible: false,
	extensions: [
		"apng"
	]
},
	"image/avci": {
	source: "iana",
	extensions: [
		"avci"
	]
},
	"image/avcs": {
	source: "iana",
	extensions: [
		"avcs"
	]
},
	"image/avif": {
	source: "iana",
	compressible: false,
	extensions: [
		"avif"
	]
},
	"image/bmp": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/cgm": {
	source: "iana",
	extensions: [
		"cgm"
	]
},
	"image/dicom-rle": {
	source: "iana",
	extensions: [
		"drle"
	]
},
	"image/emf": {
	source: "iana",
	extensions: [
		"emf"
	]
},
	"image/fits": {
	source: "iana",
	extensions: [
		"fits"
	]
},
	"image/g3fax": {
	source: "iana",
	extensions: [
		"g3"
	]
},
	"image/gif": {
	source: "iana",
	compressible: false,
	extensions: [
		"gif"
	]
},
	"image/heic": {
	source: "iana",
	extensions: [
		"heic"
	]
},
	"image/heic-sequence": {
	source: "iana",
	extensions: [
		"heics"
	]
},
	"image/heif": {
	source: "iana",
	extensions: [
		"heif"
	]
},
	"image/heif-sequence": {
	source: "iana",
	extensions: [
		"heifs"
	]
},
	"image/hej2k": {
	source: "iana",
	extensions: [
		"hej2"
	]
},
	"image/hsj2": {
	source: "iana",
	extensions: [
		"hsj2"
	]
},
	"image/ief": {
	source: "iana",
	extensions: [
		"ief"
	]
},
	"image/jls": {
	source: "iana",
	extensions: [
		"jls"
	]
},
	"image/jp2": {
	source: "iana",
	compressible: false,
	extensions: [
		"jp2",
		"jpg2"
	]
},
	"image/jpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpeg",
		"jpg",
		"jpe"
	]
},
	"image/jph": {
	source: "iana",
	extensions: [
		"jph"
	]
},
	"image/jphc": {
	source: "iana",
	extensions: [
		"jhc"
	]
},
	"image/jpm": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpm"
	]
},
	"image/jpx": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpx",
		"jpf"
	]
},
	"image/jxr": {
	source: "iana",
	extensions: [
		"jxr"
	]
},
	"image/jxra": {
	source: "iana",
	extensions: [
		"jxra"
	]
},
	"image/jxrs": {
	source: "iana",
	extensions: [
		"jxrs"
	]
},
	"image/jxs": {
	source: "iana",
	extensions: [
		"jxs"
	]
},
	"image/jxsc": {
	source: "iana",
	extensions: [
		"jxsc"
	]
},
	"image/jxsi": {
	source: "iana",
	extensions: [
		"jxsi"
	]
},
	"image/jxss": {
	source: "iana",
	extensions: [
		"jxss"
	]
},
	"image/ktx": {
	source: "iana",
	extensions: [
		"ktx"
	]
},
	"image/ktx2": {
	source: "iana",
	extensions: [
		"ktx2"
	]
},
	"image/naplps": {
	source: "iana"
},
	"image/pjpeg": {
	compressible: false
},
	"image/png": {
	source: "iana",
	compressible: false,
	extensions: [
		"png"
	]
},
	"image/prs.btif": {
	source: "iana",
	extensions: [
		"btif"
	]
},
	"image/prs.pti": {
	source: "iana",
	extensions: [
		"pti"
	]
},
	"image/pwg-raster": {
	source: "iana"
},
	"image/sgi": {
	source: "apache",
	extensions: [
		"sgi"
	]
},
	"image/svg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"svg",
		"svgz"
	]
},
	"image/t38": {
	source: "iana",
	extensions: [
		"t38"
	]
},
	"image/tiff": {
	source: "iana",
	compressible: false,
	extensions: [
		"tif",
		"tiff"
	]
},
	"image/tiff-fx": {
	source: "iana",
	extensions: [
		"tfx"
	]
},
	"image/vnd.adobe.photoshop": {
	source: "iana",
	compressible: true,
	extensions: [
		"psd"
	]
},
	"image/vnd.airzip.accelerator.azv": {
	source: "iana",
	extensions: [
		"azv"
	]
},
	"image/vnd.cns.inf2": {
	source: "iana"
},
	"image/vnd.dece.graphic": {
	source: "iana",
	extensions: [
		"uvi",
		"uvvi",
		"uvg",
		"uvvg"
	]
},
	"image/vnd.djvu": {
	source: "iana",
	extensions: [
		"djvu",
		"djv"
	]
},
	"image/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"image/vnd.dwg": {
	source: "iana",
	extensions: [
		"dwg"
	]
},
	"image/vnd.dxf": {
	source: "iana",
	extensions: [
		"dxf"
	]
},
	"image/vnd.fastbidsheet": {
	source: "iana",
	extensions: [
		"fbs"
	]
},
	"image/vnd.fpx": {
	source: "iana",
	extensions: [
		"fpx"
	]
},
	"image/vnd.fst": {
	source: "iana",
	extensions: [
		"fst"
	]
},
	"image/vnd.fujixerox.edmics-mmr": {
	source: "iana",
	extensions: [
		"mmr"
	]
},
	"image/vnd.fujixerox.edmics-rlc": {
	source: "iana",
	extensions: [
		"rlc"
	]
},
	"image/vnd.globalgraphics.pgb": {
	source: "iana"
},
	"image/vnd.microsoft.icon": {
	source: "iana",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/vnd.mix": {
	source: "iana"
},
	"image/vnd.mozilla.apng": {
	source: "iana"
},
	"image/vnd.ms-dds": {
	compressible: true,
	extensions: [
		"dds"
	]
},
	"image/vnd.ms-modi": {
	source: "iana",
	extensions: [
		"mdi"
	]
},
	"image/vnd.ms-photo": {
	source: "apache",
	extensions: [
		"wdp"
	]
},
	"image/vnd.net-fpx": {
	source: "iana",
	extensions: [
		"npx"
	]
},
	"image/vnd.pco.b16": {
	source: "iana",
	extensions: [
		"b16"
	]
},
	"image/vnd.radiance": {
	source: "iana"
},
	"image/vnd.sealed.png": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.gif": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.jpg": {
	source: "iana"
},
	"image/vnd.svf": {
	source: "iana"
},
	"image/vnd.tencent.tap": {
	source: "iana",
	extensions: [
		"tap"
	]
},
	"image/vnd.valve.source.texture": {
	source: "iana",
	extensions: [
		"vtf"
	]
},
	"image/vnd.wap.wbmp": {
	source: "iana",
	extensions: [
		"wbmp"
	]
},
	"image/vnd.xiff": {
	source: "iana",
	extensions: [
		"xif"
	]
},
	"image/vnd.zbrush.pcx": {
	source: "iana",
	extensions: [
		"pcx"
	]
},
	"image/webp": {
	source: "apache",
	extensions: [
		"webp"
	]
},
	"image/wmf": {
	source: "iana",
	extensions: [
		"wmf"
	]
},
	"image/x-3ds": {
	source: "apache",
	extensions: [
		"3ds"
	]
},
	"image/x-cmu-raster": {
	source: "apache",
	extensions: [
		"ras"
	]
},
	"image/x-cmx": {
	source: "apache",
	extensions: [
		"cmx"
	]
},
	"image/x-freehand": {
	source: "apache",
	extensions: [
		"fh",
		"fhc",
		"fh4",
		"fh5",
		"fh7"
	]
},
	"image/x-icon": {
	source: "apache",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/x-jng": {
	source: "nginx",
	extensions: [
		"jng"
	]
},
	"image/x-mrsid-image": {
	source: "apache",
	extensions: [
		"sid"
	]
},
	"image/x-ms-bmp": {
	source: "nginx",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/x-pcx": {
	source: "apache",
	extensions: [
		"pcx"
	]
},
	"image/x-pict": {
	source: "apache",
	extensions: [
		"pic",
		"pct"
	]
},
	"image/x-portable-anymap": {
	source: "apache",
	extensions: [
		"pnm"
	]
},
	"image/x-portable-bitmap": {
	source: "apache",
	extensions: [
		"pbm"
	]
},
	"image/x-portable-graymap": {
	source: "apache",
	extensions: [
		"pgm"
	]
},
	"image/x-portable-pixmap": {
	source: "apache",
	extensions: [
		"ppm"
	]
},
	"image/x-rgb": {
	source: "apache",
	extensions: [
		"rgb"
	]
},
	"image/x-tga": {
	source: "apache",
	extensions: [
		"tga"
	]
},
	"image/x-xbitmap": {
	source: "apache",
	extensions: [
		"xbm"
	]
},
	"image/x-xcf": {
	compressible: false
},
	"image/x-xpixmap": {
	source: "apache",
	extensions: [
		"xpm"
	]
},
	"image/x-xwindowdump": {
	source: "apache",
	extensions: [
		"xwd"
	]
},
	"message/cpim": {
	source: "iana"
},
	"message/delivery-status": {
	source: "iana"
},
	"message/disposition-notification": {
	source: "iana",
	extensions: [
		"disposition-notification"
	]
},
	"message/external-body": {
	source: "iana"
},
	"message/feedback-report": {
	source: "iana"
},
	"message/global": {
	source: "iana",
	extensions: [
		"u8msg"
	]
},
	"message/global-delivery-status": {
	source: "iana",
	extensions: [
		"u8dsn"
	]
},
	"message/global-disposition-notification": {
	source: "iana",
	extensions: [
		"u8mdn"
	]
},
	"message/global-headers": {
	source: "iana",
	extensions: [
		"u8hdr"
	]
},
	"message/http": {
	source: "iana",
	compressible: false
},
	"message/imdn+xml": {
	source: "iana",
	compressible: true
},
	"message/news": {
	source: "iana"
},
	"message/partial": {
	source: "iana",
	compressible: false
},
	"message/rfc822": {
	source: "iana",
	compressible: true,
	extensions: [
		"eml",
		"mime"
	]
},
	"message/s-http": {
	source: "iana"
},
	"message/sip": {
	source: "iana"
},
	"message/sipfrag": {
	source: "iana"
},
	"message/tracking-status": {
	source: "iana"
},
	"message/vnd.si.simp": {
	source: "iana"
},
	"message/vnd.wfa.wsc": {
	source: "iana",
	extensions: [
		"wsc"
	]
},
	"model/3mf": {
	source: "iana",
	extensions: [
		"3mf"
	]
},
	"model/e57": {
	source: "iana"
},
	"model/gltf+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"gltf"
	]
},
	"model/gltf-binary": {
	source: "iana",
	compressible: true,
	extensions: [
		"glb"
	]
},
	"model/iges": {
	source: "iana",
	compressible: false,
	extensions: [
		"igs",
		"iges"
	]
},
	"model/mesh": {
	source: "iana",
	compressible: false,
	extensions: [
		"msh",
		"mesh",
		"silo"
	]
},
	"model/mtl": {
	source: "iana",
	extensions: [
		"mtl"
	]
},
	"model/obj": {
	source: "iana",
	extensions: [
		"obj"
	]
},
	"model/step": {
	source: "iana"
},
	"model/step+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"stpx"
	]
},
	"model/step+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpz"
	]
},
	"model/step-xml+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpxz"
	]
},
	"model/stl": {
	source: "iana",
	extensions: [
		"stl"
	]
},
	"model/vnd.collada+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dae"
	]
},
	"model/vnd.dwf": {
	source: "iana",
	extensions: [
		"dwf"
	]
},
	"model/vnd.flatland.3dml": {
	source: "iana"
},
	"model/vnd.gdl": {
	source: "iana",
	extensions: [
		"gdl"
	]
},
	"model/vnd.gs-gdl": {
	source: "apache"
},
	"model/vnd.gs.gdl": {
	source: "iana"
},
	"model/vnd.gtw": {
	source: "iana",
	extensions: [
		"gtw"
	]
},
	"model/vnd.moml+xml": {
	source: "iana",
	compressible: true
},
	"model/vnd.mts": {
	source: "iana",
	extensions: [
		"mts"
	]
},
	"model/vnd.opengex": {
	source: "iana",
	extensions: [
		"ogex"
	]
},
	"model/vnd.parasolid.transmit.binary": {
	source: "iana",
	extensions: [
		"x_b"
	]
},
	"model/vnd.parasolid.transmit.text": {
	source: "iana",
	extensions: [
		"x_t"
	]
},
	"model/vnd.pytha.pyox": {
	source: "iana"
},
	"model/vnd.rosette.annotated-data-model": {
	source: "iana"
},
	"model/vnd.sap.vds": {
	source: "iana",
	extensions: [
		"vds"
	]
},
	"model/vnd.usdz+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"usdz"
	]
},
	"model/vnd.valve.source.compiled-map": {
	source: "iana",
	extensions: [
		"bsp"
	]
},
	"model/vnd.vtu": {
	source: "iana",
	extensions: [
		"vtu"
	]
},
	"model/vrml": {
	source: "iana",
	compressible: false,
	extensions: [
		"wrl",
		"vrml"
	]
},
	"model/x3d+binary": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3db",
		"x3dbz"
	]
},
	"model/x3d+fastinfoset": {
	source: "iana",
	extensions: [
		"x3db"
	]
},
	"model/x3d+vrml": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3dv",
		"x3dvz"
	]
},
	"model/x3d+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"x3d",
		"x3dz"
	]
},
	"model/x3d-vrml": {
	source: "iana",
	extensions: [
		"x3dv"
	]
},
	"multipart/alternative": {
	source: "iana",
	compressible: false
},
	"multipart/appledouble": {
	source: "iana"
},
	"multipart/byteranges": {
	source: "iana"
},
	"multipart/digest": {
	source: "iana"
},
	"multipart/encrypted": {
	source: "iana",
	compressible: false
},
	"multipart/form-data": {
	source: "iana",
	compressible: false
},
	"multipart/header-set": {
	source: "iana"
},
	"multipart/mixed": {
	source: "iana"
},
	"multipart/multilingual": {
	source: "iana"
},
	"multipart/parallel": {
	source: "iana"
},
	"multipart/related": {
	source: "iana",
	compressible: false
},
	"multipart/report": {
	source: "iana"
},
	"multipart/signed": {
	source: "iana",
	compressible: false
},
	"multipart/vnd.bint.med-plus": {
	source: "iana"
},
	"multipart/voice-message": {
	source: "iana"
},
	"multipart/x-mixed-replace": {
	source: "iana"
},
	"text/1d-interleaved-parityfec": {
	source: "iana"
},
	"text/cache-manifest": {
	source: "iana",
	compressible: true,
	extensions: [
		"appcache",
		"manifest"
	]
},
	"text/calendar": {
	source: "iana",
	extensions: [
		"ics",
		"ifb"
	]
},
	"text/calender": {
	compressible: true
},
	"text/cmd": {
	compressible: true
},
	"text/coffeescript": {
	extensions: [
		"coffee",
		"litcoffee"
	]
},
	"text/cql": {
	source: "iana"
},
	"text/cql-expression": {
	source: "iana"
},
	"text/cql-identifier": {
	source: "iana"
},
	"text/css": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"css"
	]
},
	"text/csv": {
	source: "iana",
	compressible: true,
	extensions: [
		"csv"
	]
},
	"text/csv-schema": {
	source: "iana"
},
	"text/directory": {
	source: "iana"
},
	"text/dns": {
	source: "iana"
},
	"text/ecmascript": {
	source: "iana"
},
	"text/encaprtp": {
	source: "iana"
},
	"text/enriched": {
	source: "iana"
},
	"text/fhirpath": {
	source: "iana"
},
	"text/flexfec": {
	source: "iana"
},
	"text/fwdred": {
	source: "iana"
},
	"text/gff3": {
	source: "iana"
},
	"text/grammar-ref-list": {
	source: "iana"
},
	"text/html": {
	source: "iana",
	compressible: true,
	extensions: [
		"html",
		"htm",
		"shtml"
	]
},
	"text/jade": {
	extensions: [
		"jade"
	]
},
	"text/javascript": {
	source: "iana",
	compressible: true
},
	"text/jcr-cnd": {
	source: "iana"
},
	"text/jsx": {
	compressible: true,
	extensions: [
		"jsx"
	]
},
	"text/less": {
	compressible: true,
	extensions: [
		"less"
	]
},
	"text/markdown": {
	source: "iana",
	compressible: true,
	extensions: [
		"markdown",
		"md"
	]
},
	"text/mathml": {
	source: "nginx",
	extensions: [
		"mml"
	]
},
	"text/mdx": {
	compressible: true,
	extensions: [
		"mdx"
	]
},
	"text/mizar": {
	source: "iana"
},
	"text/n3": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"n3"
	]
},
	"text/parameters": {
	source: "iana",
	charset: "UTF-8"
},
	"text/parityfec": {
	source: "iana"
},
	"text/plain": {
	source: "iana",
	compressible: true,
	extensions: [
		"txt",
		"text",
		"conf",
		"def",
		"list",
		"log",
		"in",
		"ini"
	]
},
	"text/provenance-notation": {
	source: "iana",
	charset: "UTF-8"
},
	"text/prs.fallenstein.rst": {
	source: "iana"
},
	"text/prs.lines.tag": {
	source: "iana",
	extensions: [
		"dsc"
	]
},
	"text/prs.prop.logic": {
	source: "iana"
},
	"text/raptorfec": {
	source: "iana"
},
	"text/red": {
	source: "iana"
},
	"text/rfc822-headers": {
	source: "iana"
},
	"text/richtext": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtx"
	]
},
	"text/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"text/rtp-enc-aescm128": {
	source: "iana"
},
	"text/rtploopback": {
	source: "iana"
},
	"text/rtx": {
	source: "iana"
},
	"text/sgml": {
	source: "iana",
	extensions: [
		"sgml",
		"sgm"
	]
},
	"text/shaclc": {
	source: "iana"
},
	"text/shex": {
	source: "iana",
	extensions: [
		"shex"
	]
},
	"text/slim": {
	extensions: [
		"slim",
		"slm"
	]
},
	"text/spdx": {
	source: "iana",
	extensions: [
		"spdx"
	]
},
	"text/strings": {
	source: "iana"
},
	"text/stylus": {
	extensions: [
		"stylus",
		"styl"
	]
},
	"text/t140": {
	source: "iana"
},
	"text/tab-separated-values": {
	source: "iana",
	compressible: true,
	extensions: [
		"tsv"
	]
},
	"text/troff": {
	source: "iana",
	extensions: [
		"t",
		"tr",
		"roff",
		"man",
		"me",
		"ms"
	]
},
	"text/turtle": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"ttl"
	]
},
	"text/ulpfec": {
	source: "iana"
},
	"text/uri-list": {
	source: "iana",
	compressible: true,
	extensions: [
		"uri",
		"uris",
		"urls"
	]
},
	"text/vcard": {
	source: "iana",
	compressible: true,
	extensions: [
		"vcard"
	]
},
	"text/vnd.a": {
	source: "iana"
},
	"text/vnd.abc": {
	source: "iana"
},
	"text/vnd.ascii-art": {
	source: "iana"
},
	"text/vnd.curl": {
	source: "iana",
	extensions: [
		"curl"
	]
},
	"text/vnd.curl.dcurl": {
	source: "apache",
	extensions: [
		"dcurl"
	]
},
	"text/vnd.curl.mcurl": {
	source: "apache",
	extensions: [
		"mcurl"
	]
},
	"text/vnd.curl.scurl": {
	source: "apache",
	extensions: [
		"scurl"
	]
},
	"text/vnd.debian.copyright": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.dmclientscript": {
	source: "iana"
},
	"text/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"text/vnd.esmertec.theme-descriptor": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.familysearch.gedcom": {
	source: "iana",
	extensions: [
		"ged"
	]
},
	"text/vnd.ficlab.flt": {
	source: "iana"
},
	"text/vnd.fly": {
	source: "iana",
	extensions: [
		"fly"
	]
},
	"text/vnd.fmi.flexstor": {
	source: "iana",
	extensions: [
		"flx"
	]
},
	"text/vnd.gml": {
	source: "iana"
},
	"text/vnd.graphviz": {
	source: "iana",
	extensions: [
		"gv"
	]
},
	"text/vnd.hans": {
	source: "iana"
},
	"text/vnd.hgl": {
	source: "iana"
},
	"text/vnd.in3d.3dml": {
	source: "iana",
	extensions: [
		"3dml"
	]
},
	"text/vnd.in3d.spot": {
	source: "iana",
	extensions: [
		"spot"
	]
},
	"text/vnd.iptc.newsml": {
	source: "iana"
},
	"text/vnd.iptc.nitf": {
	source: "iana"
},
	"text/vnd.latex-z": {
	source: "iana"
},
	"text/vnd.motorola.reflex": {
	source: "iana"
},
	"text/vnd.ms-mediapackage": {
	source: "iana"
},
	"text/vnd.net2phone.commcenter.command": {
	source: "iana"
},
	"text/vnd.radisys.msml-basic-layout": {
	source: "iana"
},
	"text/vnd.senx.warpscript": {
	source: "iana"
},
	"text/vnd.si.uricatalogue": {
	source: "iana"
},
	"text/vnd.sosi": {
	source: "iana"
},
	"text/vnd.sun.j2me.app-descriptor": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"jad"
	]
},
	"text/vnd.trolltech.linguist": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.wap.si": {
	source: "iana"
},
	"text/vnd.wap.sl": {
	source: "iana"
},
	"text/vnd.wap.wml": {
	source: "iana",
	extensions: [
		"wml"
	]
},
	"text/vnd.wap.wmlscript": {
	source: "iana",
	extensions: [
		"wmls"
	]
},
	"text/vtt": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"vtt"
	]
},
	"text/x-asm": {
	source: "apache",
	extensions: [
		"s",
		"asm"
	]
},
	"text/x-c": {
	source: "apache",
	extensions: [
		"c",
		"cc",
		"cxx",
		"cpp",
		"h",
		"hh",
		"dic"
	]
},
	"text/x-component": {
	source: "nginx",
	extensions: [
		"htc"
	]
},
	"text/x-fortran": {
	source: "apache",
	extensions: [
		"f",
		"for",
		"f77",
		"f90"
	]
},
	"text/x-gwt-rpc": {
	compressible: true
},
	"text/x-handlebars-template": {
	extensions: [
		"hbs"
	]
},
	"text/x-java-source": {
	source: "apache",
	extensions: [
		"java"
	]
},
	"text/x-jquery-tmpl": {
	compressible: true
},
	"text/x-lua": {
	extensions: [
		"lua"
	]
},
	"text/x-markdown": {
	compressible: true,
	extensions: [
		"mkd"
	]
},
	"text/x-nfo": {
	source: "apache",
	extensions: [
		"nfo"
	]
},
	"text/x-opml": {
	source: "apache",
	extensions: [
		"opml"
	]
},
	"text/x-org": {
	compressible: true,
	extensions: [
		"org"
	]
},
	"text/x-pascal": {
	source: "apache",
	extensions: [
		"p",
		"pas"
	]
},
	"text/x-processing": {
	compressible: true,
	extensions: [
		"pde"
	]
},
	"text/x-sass": {
	extensions: [
		"sass"
	]
},
	"text/x-scss": {
	extensions: [
		"scss"
	]
},
	"text/x-setext": {
	source: "apache",
	extensions: [
		"etx"
	]
},
	"text/x-sfv": {
	source: "apache",
	extensions: [
		"sfv"
	]
},
	"text/x-suse-ymp": {
	compressible: true,
	extensions: [
		"ymp"
	]
},
	"text/x-uuencode": {
	source: "apache",
	extensions: [
		"uu"
	]
},
	"text/x-vcalendar": {
	source: "apache",
	extensions: [
		"vcs"
	]
},
	"text/x-vcard": {
	source: "apache",
	extensions: [
		"vcf"
	]
},
	"text/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml"
	]
},
	"text/xml-external-parsed-entity": {
	source: "iana"
},
	"text/yaml": {
	compressible: true,
	extensions: [
		"yaml",
		"yml"
	]
},
	"video/1d-interleaved-parityfec": {
	source: "iana"
},
	"video/3gpp": {
	source: "iana",
	extensions: [
		"3gp",
		"3gpp"
	]
},
	"video/3gpp-tt": {
	source: "iana"
},
	"video/3gpp2": {
	source: "iana",
	extensions: [
		"3g2"
	]
},
	"video/av1": {
	source: "iana"
},
	"video/bmpeg": {
	source: "iana"
},
	"video/bt656": {
	source: "iana"
},
	"video/celb": {
	source: "iana"
},
	"video/dv": {
	source: "iana"
},
	"video/encaprtp": {
	source: "iana"
},
	"video/ffv1": {
	source: "iana"
},
	"video/flexfec": {
	source: "iana"
},
	"video/h261": {
	source: "iana",
	extensions: [
		"h261"
	]
},
	"video/h263": {
	source: "iana",
	extensions: [
		"h263"
	]
},
	"video/h263-1998": {
	source: "iana"
},
	"video/h263-2000": {
	source: "iana"
},
	"video/h264": {
	source: "iana",
	extensions: [
		"h264"
	]
},
	"video/h264-rcdo": {
	source: "iana"
},
	"video/h264-svc": {
	source: "iana"
},
	"video/h265": {
	source: "iana"
},
	"video/iso.segment": {
	source: "iana",
	extensions: [
		"m4s"
	]
},
	"video/jpeg": {
	source: "iana",
	extensions: [
		"jpgv"
	]
},
	"video/jpeg2000": {
	source: "iana"
},
	"video/jpm": {
	source: "apache",
	extensions: [
		"jpm",
		"jpgm"
	]
},
	"video/jxsv": {
	source: "iana"
},
	"video/mj2": {
	source: "iana",
	extensions: [
		"mj2",
		"mjp2"
	]
},
	"video/mp1s": {
	source: "iana"
},
	"video/mp2p": {
	source: "iana"
},
	"video/mp2t": {
	source: "iana",
	extensions: [
		"ts"
	]
},
	"video/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"mp4",
		"mp4v",
		"mpg4"
	]
},
	"video/mp4v-es": {
	source: "iana"
},
	"video/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpeg",
		"mpg",
		"mpe",
		"m1v",
		"m2v"
	]
},
	"video/mpeg4-generic": {
	source: "iana"
},
	"video/mpv": {
	source: "iana"
},
	"video/nv": {
	source: "iana"
},
	"video/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogv"
	]
},
	"video/parityfec": {
	source: "iana"
},
	"video/pointer": {
	source: "iana"
},
	"video/quicktime": {
	source: "iana",
	compressible: false,
	extensions: [
		"qt",
		"mov"
	]
},
	"video/raptorfec": {
	source: "iana"
},
	"video/raw": {
	source: "iana"
},
	"video/rtp-enc-aescm128": {
	source: "iana"
},
	"video/rtploopback": {
	source: "iana"
},
	"video/rtx": {
	source: "iana"
},
	"video/scip": {
	source: "iana"
},
	"video/smpte291": {
	source: "iana"
},
	"video/smpte292m": {
	source: "iana"
},
	"video/ulpfec": {
	source: "iana"
},
	"video/vc1": {
	source: "iana"
},
	"video/vc2": {
	source: "iana"
},
	"video/vnd.cctv": {
	source: "iana"
},
	"video/vnd.dece.hd": {
	source: "iana",
	extensions: [
		"uvh",
		"uvvh"
	]
},
	"video/vnd.dece.mobile": {
	source: "iana",
	extensions: [
		"uvm",
		"uvvm"
	]
},
	"video/vnd.dece.mp4": {
	source: "iana"
},
	"video/vnd.dece.pd": {
	source: "iana",
	extensions: [
		"uvp",
		"uvvp"
	]
},
	"video/vnd.dece.sd": {
	source: "iana",
	extensions: [
		"uvs",
		"uvvs"
	]
},
	"video/vnd.dece.video": {
	source: "iana",
	extensions: [
		"uvv",
		"uvvv"
	]
},
	"video/vnd.directv.mpeg": {
	source: "iana"
},
	"video/vnd.directv.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dlna.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dvb.file": {
	source: "iana",
	extensions: [
		"dvb"
	]
},
	"video/vnd.fvt": {
	source: "iana",
	extensions: [
		"fvt"
	]
},
	"video/vnd.hns.video": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsavc": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsmpeg2": {
	source: "iana"
},
	"video/vnd.motorola.video": {
	source: "iana"
},
	"video/vnd.motorola.videop": {
	source: "iana"
},
	"video/vnd.mpegurl": {
	source: "iana",
	extensions: [
		"mxu",
		"m4u"
	]
},
	"video/vnd.ms-playready.media.pyv": {
	source: "iana",
	extensions: [
		"pyv"
	]
},
	"video/vnd.nokia.interleaved-multimedia": {
	source: "iana"
},
	"video/vnd.nokia.mp4vr": {
	source: "iana"
},
	"video/vnd.nokia.videovoip": {
	source: "iana"
},
	"video/vnd.objectvideo": {
	source: "iana"
},
	"video/vnd.radgamettools.bink": {
	source: "iana"
},
	"video/vnd.radgamettools.smacker": {
	source: "iana"
},
	"video/vnd.sealed.mpeg1": {
	source: "iana"
},
	"video/vnd.sealed.mpeg4": {
	source: "iana"
},
	"video/vnd.sealed.swf": {
	source: "iana"
},
	"video/vnd.sealedmedia.softseal.mov": {
	source: "iana"
},
	"video/vnd.uvvu.mp4": {
	source: "iana",
	extensions: [
		"uvu",
		"uvvu"
	]
},
	"video/vnd.vivo": {
	source: "iana",
	extensions: [
		"viv"
	]
},
	"video/vnd.youtube.yt": {
	source: "iana"
},
	"video/vp8": {
	source: "iana"
},
	"video/vp9": {
	source: "iana"
},
	"video/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"webm"
	]
},
	"video/x-f4v": {
	source: "apache",
	extensions: [
		"f4v"
	]
},
	"video/x-fli": {
	source: "apache",
	extensions: [
		"fli"
	]
},
	"video/x-flv": {
	source: "apache",
	compressible: false,
	extensions: [
		"flv"
	]
},
	"video/x-m4v": {
	source: "apache",
	extensions: [
		"m4v"
	]
},
	"video/x-matroska": {
	source: "apache",
	compressible: false,
	extensions: [
		"mkv",
		"mk3d",
		"mks"
	]
},
	"video/x-mng": {
	source: "apache",
	extensions: [
		"mng"
	]
},
	"video/x-ms-asf": {
	source: "apache",
	extensions: [
		"asf",
		"asx"
	]
},
	"video/x-ms-vob": {
	source: "apache",
	extensions: [
		"vob"
	]
},
	"video/x-ms-wm": {
	source: "apache",
	extensions: [
		"wm"
	]
},
	"video/x-ms-wmv": {
	source: "apache",
	compressible: false,
	extensions: [
		"wmv"
	]
},
	"video/x-ms-wmx": {
	source: "apache",
	extensions: [
		"wmx"
	]
},
	"video/x-ms-wvx": {
	source: "apache",
	extensions: [
		"wvx"
	]
},
	"video/x-msvideo": {
	source: "apache",
	extensions: [
		"avi"
	]
},
	"video/x-sgi-movie": {
	source: "apache",
	extensions: [
		"movie"
	]
},
	"video/x-smv": {
	source: "apache",
	extensions: [
		"smv"
	]
},
	"x-conference/x-cooltalk": {
	source: "apache",
	extensions: [
		"ice"
	]
},
	"x-shader/x-fragment": {
	compressible: true
},
	"x-shader/x-vertex": {
	compressible: true
}
};

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

var mimeDb = require$$0;

/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

(function (exports) {

	/**
	 * Module dependencies.
	 * @private
	 */

	var db = mimeDb;
	var extname = require$$1$1.extname;

	/**
	 * Module variables.
	 * @private
	 */

	var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
	var TEXT_TYPE_REGEXP = /^text\//i;

	/**
	 * Module exports.
	 * @public
	 */

	exports.charset = charset;
	exports.charsets = { lookup: charset };
	exports.contentType = contentType;
	exports.extension = extension;
	exports.extensions = Object.create(null);
	exports.lookup = lookup;
	exports.types = Object.create(null);

	// Populate the extensions/types maps
	populateMaps(exports.extensions, exports.types);

	/**
	 * Get the default charset for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function charset (type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = EXTRACT_TYPE_REGEXP.exec(type);
	  var mime = match && db[match[1].toLowerCase()];

	  if (mime && mime.charset) {
	    return mime.charset
	  }

	  // default text/* to utf-8
	  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
	    return 'UTF-8'
	  }

	  return false
	}

	/**
	 * Create a full Content-Type header given a MIME type or extension.
	 *
	 * @param {string} str
	 * @return {boolean|string}
	 */

	function contentType (str) {
	  // TODO: should this even be in this module?
	  if (!str || typeof str !== 'string') {
	    return false
	  }

	  var mime = str.indexOf('/') === -1
	    ? exports.lookup(str)
	    : str;

	  if (!mime) {
	    return false
	  }

	  // TODO: use content-type or other module
	  if (mime.indexOf('charset') === -1) {
	    var charset = exports.charset(mime);
	    if (charset) mime += '; charset=' + charset.toLowerCase();
	  }

	  return mime
	}

	/**
	 * Get the default extension for a MIME type.
	 *
	 * @param {string} type
	 * @return {boolean|string}
	 */

	function extension (type) {
	  if (!type || typeof type !== 'string') {
	    return false
	  }

	  // TODO: use media-typer
	  var match = EXTRACT_TYPE_REGEXP.exec(type);

	  // get extensions
	  var exts = match && exports.extensions[match[1].toLowerCase()];

	  if (!exts || !exts.length) {
	    return false
	  }

	  return exts[0]
	}

	/**
	 * Lookup the MIME type for a file path/extension.
	 *
	 * @param {string} path
	 * @return {boolean|string}
	 */

	function lookup (path) {
	  if (!path || typeof path !== 'string') {
	    return false
	  }

	  // get the extension ("ext" or ".ext" or full path)
	  var extension = extname('x.' + path)
	    .toLowerCase()
	    .substr(1);

	  if (!extension) {
	    return false
	  }

	  return exports.types[extension] || false
	}

	/**
	 * Populate the extensions and types maps.
	 * @private
	 */

	function populateMaps (extensions, types) {
	  // source preference (least -> most)
	  var preference = ['nginx', 'apache', undefined, 'iana'];

	  Object.keys(db).forEach(function forEachMimeType (type) {
	    var mime = db[type];
	    var exts = mime.extensions;

	    if (!exts || !exts.length) {
	      return
	    }

	    // mime -> extensions
	    extensions[type] = exts;

	    // extension -> mime
	    for (var i = 0; i < exts.length; i++) {
	      var extension = exts[i];

	      if (types[extension]) {
	        var from = preference.indexOf(db[types[extension]].source);
	        var to = preference.indexOf(mime.source);

	        if (types[extension] !== 'application/octet-stream' &&
	          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
	          // skip the remapping
	          continue
	        }
	      }

	      // set the extension -> mime
	      types[extension] = type;
	    }
	  });
	} 
} (mimeTypes));

var defer_1 = defer$1;

/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */
function defer$1(fn)
{
  var nextTick = typeof setImmediate == 'function'
    ? setImmediate
    : (
      typeof process == 'object' && typeof process.nextTick == 'function'
      ? process.nextTick
      : null
    );

  if (nextTick)
  {
    nextTick(fn);
  }
  else
  {
    setTimeout(fn, 0);
  }
}

var defer = defer_1;

// API
var async_1 = async$2;

/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */
function async$2(callback)
{
  var isAsync = false;

  // check if async happened
  defer(function() { isAsync = true; });

  return function async_callback(err, result)
  {
    if (isAsync)
    {
      callback(err, result);
    }
    else
    {
      defer(function nextTick_callback()
      {
        callback(err, result);
      });
    }
  };
}

// API
var abort_1 = abort$2;

/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */
function abort$2(state)
{
  Object.keys(state.jobs).forEach(clean.bind(state));

  // reset leftover jobs
  state.jobs = {};
}

/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */
function clean(key)
{
  if (typeof this.jobs[key] == 'function')
  {
    this.jobs[key]();
  }
}

var async$1 = async_1
  , abort$1 = abort_1
  ;

// API
var iterate_1 = iterate$2;

/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */
function iterate$2(list, iterator, state, callback)
{
  // store current index
  var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;

  state.jobs[key] = runJob(iterator, key, list[key], function(error, output)
  {
    // don't repeat yourself
    // skip secondary callbacks
    if (!(key in state.jobs))
    {
      return;
    }

    // clean up jobs
    delete state.jobs[key];

    if (error)
    {
      // don't process rest of the results
      // stop still active jobs
      // and reset the list
      abort$1(state);
    }
    else
    {
      state.results[key] = output;
    }

    // return salvaged results
    callback(error, state.results);
  });
}

/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */
function runJob(iterator, key, item, callback)
{
  var aborter;

  // allow shortcut if iterator expects only two arguments
  if (iterator.length == 2)
  {
    aborter = iterator(item, async$1(callback));
  }
  // otherwise go with full three arguments
  else
  {
    aborter = iterator(item, key, async$1(callback));
  }

  return aborter;
}

// API
var state_1 = state;

/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */
function state(list, sortMethod)
{
  var isNamedList = !Array.isArray(list)
    , initState =
    {
      index    : 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs     : {},
      results  : isNamedList ? {} : [],
      size     : isNamedList ? Object.keys(list).length : list.length
    }
    ;

  if (sortMethod)
  {
    // sort array keys based on it's values
    // sort object's keys just on own merit
    initState.keyedList.sort(isNamedList ? sortMethod : function(a, b)
    {
      return sortMethod(list[a], list[b]);
    });
  }

  return initState;
}

var abort = abort_1
  , async = async_1
  ;

// API
var terminator_1 = terminator$2;

/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */
function terminator$2(callback)
{
  if (!Object.keys(this.jobs).length)
  {
    return;
  }

  // fast forward iteration index
  this.index = this.size;

  // abort jobs
  abort(this);

  // send back results we have so far
  async(callback)(null, this.results);
}

var iterate$1    = iterate_1
  , initState$1  = state_1
  , terminator$1 = terminator_1
  ;

// Public API
var parallel_1 = parallel;

/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function parallel(list, iterator, callback)
{
  var state = initState$1(list);

  while (state.index < (state['keyedList'] || list).length)
  {
    iterate$1(list, iterator, state, function(error, result)
    {
      if (error)
      {
        callback(error, result);
        return;
      }

      // looks like it's the last one
      if (Object.keys(state.jobs).length === 0)
      {
        callback(null, state.results);
        return;
      }
    });

    state.index++;
  }

  return terminator$1.bind(state, callback);
}

var serialOrdered$2 = {exports: {}};

var iterate    = iterate_1
  , initState  = state_1
  , terminator = terminator_1
  ;

// Public API
serialOrdered$2.exports = serialOrdered$1;
// sorting helpers
serialOrdered$2.exports.ascending  = ascending;
serialOrdered$2.exports.descending = descending;

/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serialOrdered$1(list, iterator, sortMethod, callback)
{
  var state = initState(list, sortMethod);

  iterate(list, iterator, state, function iteratorHandler(error, result)
  {
    if (error)
    {
      callback(error, result);
      return;
    }

    state.index++;

    // are we there yet?
    if (state.index < (state['keyedList'] || list).length)
    {
      iterate(list, iterator, state, iteratorHandler);
      return;
    }

    // done here
    callback(null, state.results);
  });

  return terminator.bind(state, callback);
}

/*
 * -- Sort methods
 */

/**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function ascending(a, b)
{
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function descending(a, b)
{
  return -1 * ascending(a, b);
}

var serialOrderedExports = serialOrdered$2.exports;

var serialOrdered = serialOrderedExports;

// Public API
var serial_1 = serial;

/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serial(list, iterator, callback)
{
  return serialOrdered(list, iterator, null, callback);
}

var asynckit$1 =
{
  parallel      : parallel_1,
  serial        : serial_1,
  serialOrdered : serialOrderedExports
};

// populates missing values
var populate$1 = function(dst, src) {

  Object.keys(src).forEach(function(prop)
  {
    dst[prop] = dst[prop] || src[prop];
  });

  return dst;
};

var CombinedStream = combined_stream;
var util = require$$1;
var path = require$$1$1;
var http$1 = require$$3;
var https$1 = require$$4;
var parseUrl$1 = require$$0$1.parse;
var fs = require$$6;
var Stream = stream.Stream;
var mime = mimeTypes;
var asynckit = asynckit$1;
var populate = populate$1;

// Public API
var form_data = FormData$1;

// make it a Stream
util.inherits(FormData$1, CombinedStream);

/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
 */
function FormData$1(options) {
  if (!(this instanceof FormData$1)) {
    return new FormData$1(options);
  }

  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];

  CombinedStream.call(this);

  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}

FormData$1.LINE_BREAK = '\r\n';
FormData$1.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData$1.prototype.append = function(field, value, options) {

  options = options || {};

  // allow filename as single option
  if (typeof options == 'string') {
    options = {filename: options};
  }

  var append = CombinedStream.prototype.append.bind(this);

  // all that streamy business can't handle numbers
  if (typeof value == 'number') {
    value = '' + value;
  }

  // https://github.com/felixge/node-form-data/issues/38
  if (util.isArray(value)) {
    // Please convert your array into string
    // the way web server expects it
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();

  append(header);
  append(value);
  append(footer);

  // pass along options.knownLength
  this._trackLength(header, value, options);
};

FormData$1.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;

  // used w/ getLengthSync(), when length is known.
  // e.g. for streaming directly from a remote server,
  // w/ a known file a size, and not wanting to wait for
  // incoming file to finish to get its size.
  if (options.knownLength != null) {
    valueLength += +options.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;

  // @check why add CRLF? does this account for custom/multiple CRLFs?
  this._overheadLength +=
    Buffer.byteLength(header) +
    FormData$1.LINE_BREAK.length;

  // empty or either doesn't have path or not an http response or not a stream
  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) && !(value instanceof Stream))) {
    return;
  }

  // no need to bother with the length
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData$1.prototype._lengthRetriever = function(value, callback) {

  if (value.hasOwnProperty('fd')) {

    // take read range into a account
    // `end` = Infinity –> read file till the end
    //
    // TODO: Looks like there is bug in Node fs.createReadStream
    // it doesn't respect `end` options without `start` options
    // Fix it when node fixes it.
    // https://github.com/joyent/node/issues/7819
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {

      // when end specified
      // no need to calculate range
      // inclusive, starts with 0
      callback(null, value.end + 1 - (value.start ? value.start : 0));

    // not that fast snoopy
    } else {
      // still need to fetch file size from fs
      fs.stat(value.path, function(err, stat) {

        var fileSize;

        if (err) {
          callback(err);
          return;
        }

        // update final size based on the range options
        fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }

  // or http response
  } else if (value.hasOwnProperty('httpVersion')) {
    callback(null, +value.headers['content-length']);

  // or request stream http://github.com/mikeal/request
  } else if (value.hasOwnProperty('httpModule')) {
    // wait till response come back
    value.on('response', function(response) {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();

  // something else
  } else {
    callback('Unknown stream');
  }
};

FormData$1.prototype._multiPartHeader = function(field, value, options) {
  // custom header specified (as string)?
  // it becomes responsible for boundary
  // (e.g. to handle extra CRLFs on .NET servers)
  if (typeof options.header == 'string') {
    return options.header;
  }

  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);

  var contents = '';
  var headers  = {
    // add custom disposition as third element or keep it two elements if not
    'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    'Content-Type': [].concat(contentType || [])
  };

  // allow custom headers.
  if (typeof options.header == 'object') {
    populate(headers, options.header);
  }

  var header;
  for (var prop in headers) {
    if (!headers.hasOwnProperty(prop)) continue;
    header = headers[prop];

    // skip nullish headers.
    if (header == null) {
      continue;
    }

    // convert all headers to arrays.
    if (!Array.isArray(header)) {
      header = [header];
    }

    // add non-empty headers.
    if (header.length) {
      contents += prop + ': ' + header.join('; ') + FormData$1.LINE_BREAK;
    }
  }

  return '--' + this.getBoundary() + FormData$1.LINE_BREAK + contents + FormData$1.LINE_BREAK;
};

FormData$1.prototype._getContentDisposition = function(value, options) {

  var filename
    , contentDisposition
    ;

  if (typeof options.filepath === 'string') {
    // custom filepath for relative paths
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    // custom filename take precedence
    // formidable and the browser add a name property
    // fs- and request- streams have path property
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
    // or try http response
    filename = path.basename(value.client._httpMessage.path || '');
  }

  if (filename) {
    contentDisposition = 'filename="' + filename + '"';
  }

  return contentDisposition;
};

FormData$1.prototype._getContentType = function(value, options) {

  // use custom content-type above all
  var contentType = options.contentType;

  // or try `name` from formidable, browser
  if (!contentType && value.name) {
    contentType = mime.lookup(value.name);
  }

  // or try `path` from fs-, request- streams
  if (!contentType && value.path) {
    contentType = mime.lookup(value.path);
  }

  // or if it's http-reponse
  if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
    contentType = value.headers['content-type'];
  }

  // or guess it from the filepath or filename
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }

  // fallback to the default content type if `value` is not simple value
  if (!contentType && typeof value == 'object') {
    contentType = FormData$1.DEFAULT_CONTENT_TYPE;
  }

  return contentType;
};

FormData$1.prototype._multiPartFooter = function() {
  return function(next) {
    var footer = FormData$1.LINE_BREAK;

    var lastPart = (this._streams.length === 0);
    if (lastPart) {
      footer += this._lastBoundary();
    }

    next(footer);
  }.bind(this);
};

FormData$1.prototype._lastBoundary = function() {
  return '--' + this.getBoundary() + '--' + FormData$1.LINE_BREAK;
};

FormData$1.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
  };

  for (header in userHeaders) {
    if (userHeaders.hasOwnProperty(header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }

  return formHeaders;
};

FormData$1.prototype.setBoundary = function(boundary) {
  this._boundary = boundary;
};

FormData$1.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }

  return this._boundary;
};

FormData$1.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc( 0 );
  var boundary = this.getBoundary();

  // Create the form content. Add Line breaks to the end of data.
  for (var i = 0, len = this._streams.length; i < len; i++) {
    if (typeof this._streams[i] !== 'function') {

      // Add content to the buffer.
      if(Buffer.isBuffer(this._streams[i])) {
        dataBuffer = Buffer.concat( [dataBuffer, this._streams[i]]);
      }else {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(this._streams[i])]);
      }

      // Add break after content.
      if (typeof this._streams[i] !== 'string' || this._streams[i].substring( 2, boundary.length + 2 ) !== boundary) {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(FormData$1.LINE_BREAK)] );
      }
    }
  }

  // Add the footer and return the Buffer object.
  return Buffer.concat( [dataBuffer, Buffer.from(this._lastBoundary())] );
};

FormData$1.prototype._generateBoundary = function() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }

  this._boundary = boundary;
};

// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually
// and add it as knownLength option
FormData$1.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;

  // Don't get confused, there are 3 "internal" streams for each keyval pair
  // so it basically checks if there is any value added to the form
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  // https://github.com/form-data/form-data/issues/40
  if (!this.hasKnownLength()) {
    // Some async length retrievers are present
    // therefore synchronous length calculation is false.
    // Please use getLength(callback) to get proper length
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }

  return knownLength;
};

// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData$1.prototype.hasKnownLength = function() {
  var hasKnownLength = true;

  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }

  return hasKnownLength;
};

FormData$1.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }

    values.forEach(function(length) {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData$1.prototype.submit = function(params, cb) {
  var request
    , options
    , defaults = {method: 'post'}
    ;

  // parse provided url if it's string
  // or treat it as options object
  if (typeof params == 'string') {

    params = parseUrl$1(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults);

  // use custom params
  } else {

    options = populate(params, defaults);
    // if no port provided use default one
    if (!options.port) {
      options.port = options.protocol == 'https:' ? 443 : 80;
    }
  }

  // put that good code in getHeaders to some use
  options.headers = this.getHeaders(params.headers);

  // https if specified, fallback to http in any other case
  if (options.protocol == 'https:') {
    request = https$1.request(options);
  } else {
    request = http$1.request(options);
  }

  // get content length and fire away
  this.getLength(function(err, length) {
    if (err && err !== 'Unknown stream') {
      this._error(err);
      return;
    }

    // add content length
    if (length) {
      request.setHeader('Content-Length', length);
    }

    this.pipe(request);
    if (cb) {
      var onResponse;

      var callback = function (error, responce) {
        request.removeListener('error', callback);
        request.removeListener('response', onResponse);

        return cb.call(this, error, responce);
      };

      onResponse = callback.bind(this, null);

      request.on('error', callback);
      request.on('response', onResponse);
    }
  }.bind(this));

  return request;
};

FormData$1.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData$1.prototype.toString = function () {
  return '[object FormData]';
};

var FormData$2 = /*@__PURE__*/getDefaultExportFromCjs(form_data);

/**
 * Determines if the given thing is a array or js object.
 *
 * @param {string} thing - The object or array to be visited.
 *
 * @returns {boolean}
 */
function isVisitable(thing) {
  return utils.isPlainObject(thing) || utils.isArray(thing);
}

/**
 * It removes the brackets from the end of a string
 *
 * @param {string} key - The key of the parameter.
 *
 * @returns {string} the key without the brackets.
 */
function removeBrackets(key) {
  return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
}

/**
 * It takes a path, a key, and a boolean, and returns a string
 *
 * @param {string} path - The path to the current key.
 * @param {string} key - The key of the current object being iterated over.
 * @param {string} dots - If true, the key will be rendered with dots instead of brackets.
 *
 * @returns {string} The path to the current key.
 */
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    // eslint-disable-next-line no-param-reassign
    token = removeBrackets(token);
    return !dots && i ? '[' + token + ']' : token;
  }).join(dots ? '.' : '');
}

/**
 * If the array is an array and none of its elements are visitable, then it's a flat array.
 *
 * @param {Array<any>} arr - The array to check
 *
 * @returns {boolean}
 */
function isFlatArray(arr) {
  return utils.isArray(arr) && !arr.some(isVisitable);
}

const predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
  return /^is[A-Z]/.test(prop);
});

/**
 * Convert a data object to FormData
 *
 * @param {Object} obj
 * @param {?Object} [formData]
 * @param {?Object} [options]
 * @param {Function} [options.visitor]
 * @param {Boolean} [options.metaTokens = true]
 * @param {Boolean} [options.dots = false]
 * @param {?Boolean} [options.indexes = false]
 *
 * @returns {Object}
 **/

/**
 * It converts an object into a FormData object
 *
 * @param {Object<any, any>} obj - The object to convert to form data.
 * @param {string} formData - The FormData object to append to.
 * @param {Object<string, any>} options
 *
 * @returns
 */
function toFormData(obj, formData, options) {
  if (!utils.isObject(obj)) {
    throw new TypeError('target must be an object');
  }

  // eslint-disable-next-line no-param-reassign
  formData = formData || new (FormData$2 || FormData)();

  // eslint-disable-next-line no-param-reassign
  options = utils.toFlatObject(options, {
    metaTokens: true,
    dots: false,
    indexes: false
  }, false, function defined(option, source) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    return !utils.isUndefined(source[option]);
  });

  const metaTokens = options.metaTokens;
  // eslint-disable-next-line no-use-before-define
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
  const useBlob = _Blob && utils.isSpecCompliantForm(formData);

  if (!utils.isFunction(visitor)) {
    throw new TypeError('visitor must be a function');
  }

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (!useBlob && utils.isBlob(value)) {
      throw new AxiosError('Blob is not supported. Use a Buffer instead.');
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  /**
   * Default visitor.
   *
   * @param {*} value
   * @param {String|Number} key
   * @param {Array<String|Number>} path
   * @this {FormData}
   *
   * @returns {boolean} return true to visit the each prop of the value recursively
   */
  function defaultVisitor(value, key, path) {
    let arr = value;

    if (value && !path && typeof value === 'object') {
      if (utils.endsWith(key, '{}')) {
        // eslint-disable-next-line no-param-reassign
        key = metaTokens ? key : key.slice(0, -2);
        // eslint-disable-next-line no-param-reassign
        value = JSON.stringify(value);
      } else if (
        (utils.isArray(value) && isFlatArray(value)) ||
        ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value))
        )) {
        // eslint-disable-next-line no-param-reassign
        key = removeBrackets(key);

        arr.forEach(function each(el, index) {
          !(utils.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
            convertValue(el)
          );
        });
        return false;
      }
    }

    if (isVisitable(value)) {
      return true;
    }

    formData.append(renderKey(path, key, dots), convertValue(value));

    return false;
  }

  const stack = [];

  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });

  function build(value, path) {
    if (utils.isUndefined(value)) return;

    if (stack.indexOf(value) !== -1) {
      throw Error('Circular reference detected in ' + path.join('.'));
    }

    stack.push(value);

    utils.forEach(value, function each(el, key) {
      const result = !(utils.isUndefined(el) || el === null) && visitor.call(
        formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
      );

      if (result === true) {
        build(el, path ? path.concat(key) : [key]);
      }
    });

    stack.pop();
  }

  if (!utils.isObject(obj)) {
    throw new TypeError('data must be an object');
  }

  build(obj);

  return formData;
}

/**
 * It encodes a string by replacing all characters that are not in the unreserved set with
 * their percent-encoded equivalents
 *
 * @param {string} str - The string to encode.
 *
 * @returns {string} The encoded string.
 */
function encode$1(str) {
  const charMap = {
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '~': '%7E',
    '%20': '+',
    '%00': '\x00'
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20|%00/g, function replacer(match) {
    return charMap[match];
  });
}

/**
 * It takes a params object and converts it to a FormData object
 *
 * @param {Object<string, any>} params - The parameters to be converted to a FormData object.
 * @param {Object<string, any>} options - The options object passed to the Axios constructor.
 *
 * @returns {void}
 */
function AxiosURLSearchParams(params, options) {
  this._pairs = [];

  params && toFormData(params, this, options);
}

const prototype = AxiosURLSearchParams.prototype;

prototype.append = function append(name, value) {
  this._pairs.push([name, value]);
};

prototype.toString = function toString(encoder) {
  const _encode = encoder ? function(value) {
    return encoder.call(this, value, encode$1);
  } : encode$1;

  return this._pairs.map(function each(pair) {
    return _encode(pair[0]) + '=' + _encode(pair[1]);
  }, '').join('&');
};

/**
 * It replaces all instances of the characters `:`, `$`, `,`, `+`, `[`, and `]` with their
 * URI encoded counterparts
 *
 * @param {string} val The value to be encoded.
 *
 * @returns {string} The encoded value.
 */
function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @param {?object} options
 *
 * @returns {string} The formatted url
 */
function buildURL(url, params, options) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }
  
  const _encode = options && options.encode || encode;

  const serializeFn = options && options.serialize;

  let serializedParams;

  if (serializeFn) {
    serializedParams = serializeFn(params, options);
  } else {
    serializedParams = utils.isURLSearchParams(params) ?
      params.toString() :
      new AxiosURLSearchParams(params, options).toString(_encode);
  }

  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");

    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
}

class InterceptorManager {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled,
      rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  }

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  }

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  }
}

var InterceptorManager$1 = InterceptorManager;

var transitionalDefaults = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

var URLSearchParams = require$$0$1.URLSearchParams;

var platform = {
  isNode: true,
  classes: {
    URLSearchParams,
    FormData: FormData$2,
    Blob: typeof Blob !== 'undefined' && Blob || null
  },
  protocols: [ 'http', 'https', 'file', 'data' ]
};

function toURLEncodedForm(data, options) {
  return toFormData(data, new platform.classes.URLSearchParams(), Object.assign({
    visitor: function(value, key, path, helpers) {
      if (utils.isBuffer(value)) {
        this.append(key, value.toString('base64'));
        return false;
      }

      return helpers.defaultVisitor.apply(this, arguments);
    }
  }, options));
}

/**
 * It takes a string like `foo[x][y][z]` and returns an array like `['foo', 'x', 'y', 'z']
 *
 * @param {string} name - The name of the property to get.
 *
 * @returns An array of strings.
 */
function parsePropPath(name) {
  // foo[x][y][z]
  // foo.x.y.z
  // foo-x-y-z
  // foo x y z
  return utils.matchAll(/\w+|\[(\w*)]/g, name).map(match => {
    return match[0] === '[]' ? '' : match[1] || match[0];
  });
}

/**
 * Convert an array to an object.
 *
 * @param {Array<any>} arr - The array to convert to an object.
 *
 * @returns An object with the same keys and values as the array.
 */
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}

/**
 * It takes a FormData object and returns a JavaScript object
 *
 * @param {string} formData The FormData object to convert to JSON.
 *
 * @returns {Object<string, any> | null} The converted object.
 */
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils.isArray(target) ? target.length : name;

    if (isLast) {
      if (utils.hasOwnProp(target, name)) {
        target[name] = [target[name], value];
      } else {
        target[name] = value;
      }

      return !isNumericKey;
    }

    if (!target[name] || !utils.isObject(target[name])) {
      target[name] = [];
    }

    const result = buildPath(path, value, target[name], index);

    if (result && utils.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }

    return !isNumericKey;
  }

  if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
    const obj = {};

    utils.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });

    return obj;
  }

  return null;
}

const DEFAULT_CONTENT_TYPE = {
  'Content-Type': undefined
};

/**
 * It takes a string, tries to parse it, and if it fails, it returns the stringified version
 * of the input
 *
 * @param {any} rawValue - The value to be stringified.
 * @param {Function} parser - A function that parses a string into a JavaScript object.
 * @param {Function} encoder - A function that takes a value and returns a string.
 *
 * @returns {string} A stringified version of the rawValue.
 */
function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

const defaults = {

  transitional: transitionalDefaults,

  adapter: ['xhr', 'http'],

  transformRequest: [function transformRequest(data, headers) {
    const contentType = headers.getContentType() || '';
    const hasJSONContentType = contentType.indexOf('application/json') > -1;
    const isObjectPayload = utils.isObject(data);

    if (isObjectPayload && utils.isHTMLForm(data)) {
      data = new FormData(data);
    }

    const isFormData = utils.isFormData(data);

    if (isFormData) {
      if (!hasJSONContentType) {
        return data;
      }
      return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
    }

    if (utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      headers.setContentType('application/x-www-form-urlencoded;charset=utf-8', false);
      return data.toString();
    }

    let isFileList;

    if (isObjectPayload) {
      if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        return toURLEncodedForm(data, this.formSerializer).toString();
      }

      if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
        const _FormData = this.env && this.env.FormData;

        return toFormData(
          isFileList ? {'files[]': data} : data,
          _FormData && new _FormData(),
          this.formSerializer
        );
      }
    }

    if (isObjectPayload || hasJSONContentType ) {
      headers.setContentType('application/json', false);
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    const transitional = this.transitional || defaults.transitional;
    const forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    const JSONRequested = this.responseType === 'json';

    if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
      const silentJSONParsing = transitional && transitional.silentJSONParsing;
      const strictJSONParsing = !silentJSONParsing && JSONRequested;

      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: platform.classes.FormData,
    Blob: platform.classes.Blob
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults$1 = defaults;

// RawAxiosHeaders whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
const ignoreDuplicateOf = utils.toObjectSet([
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
]);

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} rawHeaders Headers needing to be parsed
 *
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = rawHeaders => {
  const parsed = {};
  let key;
  let val;
  let i;

  rawHeaders && rawHeaders.split('\n').forEach(function parser(line) {
    i = line.indexOf(':');
    key = line.substring(0, i).trim().toLowerCase();
    val = line.substring(i + 1).trim();

    if (!key || (parsed[key] && ignoreDuplicateOf[key])) {
      return;
    }

    if (key === 'set-cookie') {
      if (parsed[key]) {
        parsed[key].push(val);
      } else {
        parsed[key] = [val];
      }
    } else {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

const $internals = Symbol('internals');

function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}

function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }

  return utils.isArray(value) ? value.map(normalizeValue) : String(value);
}

function parseTokens(str) {
  const tokens = Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;

  while ((match = tokensRE.exec(str))) {
    tokens[match[1]] = match[2];
  }

  return tokens;
}

const isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());

function matchHeaderValue(context, value, header, filter, isHeaderNameFilter) {
  if (utils.isFunction(filter)) {
    return filter.call(this, value, header);
  }

  if (isHeaderNameFilter) {
    value = header;
  }

  if (!utils.isString(value)) return;

  if (utils.isString(filter)) {
    return value.indexOf(filter) !== -1;
  }

  if (utils.isRegExp(filter)) {
    return filter.test(value);
  }
}

function formatHeader(header) {
  return header.trim()
    .toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
      return char.toUpperCase() + str;
    });
}

function buildAccessors(obj, header) {
  const accessorName = utils.toCamelCase(' ' + header);

  ['get', 'set', 'has'].forEach(methodName => {
    Object.defineProperty(obj, methodName + accessorName, {
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}

class AxiosHeaders {
  constructor(headers) {
    headers && this.set(headers);
  }

  set(header, valueOrRewrite, rewrite) {
    const self = this;

    function setHeader(_value, _header, _rewrite) {
      const lHeader = normalizeHeader(_header);

      if (!lHeader) {
        throw new Error('header name must be a non-empty string');
      }

      const key = utils.findKey(self, lHeader);

      if(!key || self[key] === undefined || _rewrite === true || (_rewrite === undefined && self[key] !== false)) {
        self[key || _header] = normalizeValue(_value);
      }
    }

    const setHeaders = (headers, _rewrite) =>
      utils.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));

    if (utils.isPlainObject(header) || header instanceof this.constructor) {
      setHeaders(header, valueOrRewrite);
    } else if(utils.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
      setHeaders(parseHeaders(header), valueOrRewrite);
    } else {
      header != null && setHeader(valueOrRewrite, header, rewrite);
    }

    return this;
  }

  get(header, parser) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      if (key) {
        const value = this[key];

        if (!parser) {
          return value;
        }

        if (parser === true) {
          return parseTokens(value);
        }

        if (utils.isFunction(parser)) {
          return parser.call(this, value, key);
        }

        if (utils.isRegExp(parser)) {
          return parser.exec(value);
        }

        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }

  has(header, matcher) {
    header = normalizeHeader(header);

    if (header) {
      const key = utils.findKey(this, header);

      return !!(key && this[key] !== undefined && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
    }

    return false;
  }

  delete(header, matcher) {
    const self = this;
    let deleted = false;

    function deleteHeader(_header) {
      _header = normalizeHeader(_header);

      if (_header) {
        const key = utils.findKey(self, _header);

        if (key && (!matcher || matchHeaderValue(self, self[key], key, matcher))) {
          delete self[key];

          deleted = true;
        }
      }
    }

    if (utils.isArray(header)) {
      header.forEach(deleteHeader);
    } else {
      deleteHeader(header);
    }

    return deleted;
  }

  clear(matcher) {
    const keys = Object.keys(this);
    let i = keys.length;
    let deleted = false;

    while (i--) {
      const key = keys[i];
      if(!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
        delete this[key];
        deleted = true;
      }
    }

    return deleted;
  }

  normalize(format) {
    const self = this;
    const headers = {};

    utils.forEach(this, (value, header) => {
      const key = utils.findKey(headers, header);

      if (key) {
        self[key] = normalizeValue(value);
        delete self[header];
        return;
      }

      const normalized = format ? formatHeader(header) : String(header).trim();

      if (normalized !== header) {
        delete self[header];
      }

      self[normalized] = normalizeValue(value);

      headers[normalized] = true;
    });

    return this;
  }

  concat(...targets) {
    return this.constructor.concat(this, ...targets);
  }

  toJSON(asStrings) {
    const obj = Object.create(null);

    utils.forEach(this, (value, header) => {
      value != null && value !== false && (obj[header] = asStrings && utils.isArray(value) ? value.join(', ') : value);
    });

    return obj;
  }

  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }

  toString() {
    return Object.entries(this.toJSON()).map(([header, value]) => header + ': ' + value).join('\n');
  }

  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }

  static from(thing) {
    return thing instanceof this ? thing : new this(thing);
  }

  static concat(first, ...targets) {
    const computed = new this(first);

    targets.forEach((target) => computed.set(target));

    return computed;
  }

  static accessor(header) {
    const internals = this[$internals] = (this[$internals] = {
      accessors: {}
    });

    const accessors = internals.accessors;
    const prototype = this.prototype;

    function defineAccessor(_header) {
      const lHeader = normalizeHeader(_header);

      if (!accessors[lHeader]) {
        buildAccessors(prototype, _header);
        accessors[lHeader] = true;
      }
    }

    utils.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);

    return this;
  }
}

AxiosHeaders.accessor(['Content-Type', 'Content-Length', 'Accept', 'Accept-Encoding', 'User-Agent', 'Authorization']);

utils.freezeMethods(AxiosHeaders.prototype);
utils.freezeMethods(AxiosHeaders);

var AxiosHeaders$1 = AxiosHeaders;

/**
 * Transform the data for a request or a response
 *
 * @param {Array|Function} fns A single function or Array of functions
 * @param {?Object} response The response object
 *
 * @returns {*} The resulting transformed data
 */
function transformData(fns, response) {
  const config = this || defaults$1;
  const context = response || config;
  const headers = AxiosHeaders$1.from(context.headers);
  let data = context.data;

  utils.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : undefined);
  });

  headers.normalize();

  return data;
}

function isCancel(value) {
  return !!(value && value.__CANCEL__);
}

/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @param {string=} message The message.
 * @param {Object=} config The config.
 * @param {Object=} request The request.
 *
 * @returns {CanceledError} The created error.
 */
function CanceledError(message, config, request) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED, config, request);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 *
 * @returns {object} The response.
 */
function settle(resolve, reject, response) {
  const validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 *
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 *
 * @returns {string} The combined URL
 */
function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 *
 * @returns {string} The combined full path
 */
function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}

var parseUrl = require$$0$1.parse;

var DEFAULT_PORTS = {
  ftp: 21,
  gopher: 70,
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
};

var stringEndsWith = String.prototype.endsWith || function(s) {
  return s.length <= this.length &&
    this.indexOf(s, this.length - s.length) !== -1;
};

/**
 * @param {string|object} url - The URL, or the result from url.parse.
 * @return {string} The URL of the proxy that should handle the request to the
 *  given URL. If no proxy is set, this will be an empty string.
 */
function getProxyForUrl(url) {
  var parsedUrl = typeof url === 'string' ? parseUrl(url) : url || {};
  var proto = parsedUrl.protocol;
  var hostname = parsedUrl.host;
  var port = parsedUrl.port;
  if (typeof hostname !== 'string' || !hostname || typeof proto !== 'string') {
    return '';  // Don't proxy URLs without a valid scheme or host.
  }

  proto = proto.split(':', 1)[0];
  // Stripping ports in this way instead of using parsedUrl.hostname to make
  // sure that the brackets around IPv6 addresses are kept.
  hostname = hostname.replace(/:\d*$/, '');
  port = parseInt(port) || DEFAULT_PORTS[proto] || 0;
  if (!shouldProxy(hostname, port)) {
    return '';  // Don't proxy URLs that match NO_PROXY.
  }

  var proxy =
    getEnv('npm_config_' + proto + '_proxy') ||
    getEnv(proto + '_proxy') ||
    getEnv('npm_config_proxy') ||
    getEnv('all_proxy');
  if (proxy && proxy.indexOf('://') === -1) {
    // Missing scheme in proxy, default to the requested URL's scheme.
    proxy = proto + '://' + proxy;
  }
  return proxy;
}

/**
 * Determines whether a given URL should be proxied.
 *
 * @param {string} hostname - The host name of the URL.
 * @param {number} port - The effective port of the URL.
 * @returns {boolean} Whether the given URL should be proxied.
 * @private
 */
function shouldProxy(hostname, port) {
  var NO_PROXY =
    (getEnv('npm_config_no_proxy') || getEnv('no_proxy')).toLowerCase();
  if (!NO_PROXY) {
    return true;  // Always proxy if NO_PROXY is not set.
  }
  if (NO_PROXY === '*') {
    return false;  // Never proxy if wildcard is set.
  }

  return NO_PROXY.split(/[,\s]/).every(function(proxy) {
    if (!proxy) {
      return true;  // Skip zero-length hosts.
    }
    var parsedProxy = proxy.match(/^(.+):(\d+)$/);
    var parsedProxyHostname = parsedProxy ? parsedProxy[1] : proxy;
    var parsedProxyPort = parsedProxy ? parseInt(parsedProxy[2]) : 0;
    if (parsedProxyPort && parsedProxyPort !== port) {
      return true;  // Skip if ports don't match.
    }

    if (!/^[.*]/.test(parsedProxyHostname)) {
      // No wildcards, so stop proxying if there is an exact match.
      return hostname !== parsedProxyHostname;
    }

    if (parsedProxyHostname.charAt(0) === '*') {
      // Remove leading wildcard.
      parsedProxyHostname = parsedProxyHostname.slice(1);
    }
    // Stop proxying if the hostname ends with the no_proxy host.
    return !stringEndsWith.call(hostname, parsedProxyHostname);
  });
}

/**
 * Get the value for an environment variable.
 *
 * @param {string} key - The name of the environment variable.
 * @return {string} The value of the environment variable.
 * @private
 */
function getEnv(key) {
  return process.env[key.toLowerCase()] || process.env[key.toUpperCase()] || '';
}

var getProxyForUrl_1 = getProxyForUrl;

var followRedirects$1 = {exports: {}};

var src = {exports: {}};

var node = {exports: {}};

var hasFlag;
var hasRequiredHasFlag;

function requireHasFlag () {
	if (hasRequiredHasFlag) return hasFlag;
	hasRequiredHasFlag = 1;

	hasFlag = (flag, argv = process.argv) => {
		const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
		const position = argv.indexOf(prefix + flag);
		const terminatorPosition = argv.indexOf('--');
		return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
	};
	return hasFlag;
}

var supportsColor_1;
var hasRequiredSupportsColor;

function requireSupportsColor () {
	if (hasRequiredSupportsColor) return supportsColor_1;
	hasRequiredSupportsColor = 1;
	const os = require$$0$2;
	const tty = require$$1$2;
	const hasFlag = requireHasFlag();

	const {env} = process;

	let forceColor;
	if (hasFlag('no-color') ||
		hasFlag('no-colors') ||
		hasFlag('color=false') ||
		hasFlag('color=never')) {
		forceColor = 0;
	} else if (hasFlag('color') ||
		hasFlag('colors') ||
		hasFlag('color=true') ||
		hasFlag('color=always')) {
		forceColor = 1;
	}

	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			forceColor = 1;
		} else if (env.FORCE_COLOR === 'false') {
			forceColor = 0;
		} else {
			forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
		}
	}

	function translateLevel(level) {
		if (level === 0) {
			return false;
		}

		return {
			level,
			hasBasic: true,
			has256: level >= 2,
			has16m: level >= 3
		};
	}

	function supportsColor(haveStream, streamIsTTY) {
		if (forceColor === 0) {
			return 0;
		}

		if (hasFlag('color=16m') ||
			hasFlag('color=full') ||
			hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}

		if (haveStream && !streamIsTTY && forceColor === undefined) {
			return 0;
		}

		const min = forceColor || 0;

		if (env.TERM === 'dumb') {
			return min;
		}

		if (process.platform === 'win32') {
			// Windows 10 build 10586 is the first Windows release that supports 256 colors.
			// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
			const osRelease = os.release().split('.');
			if (
				Number(osRelease[0]) >= 10 &&
				Number(osRelease[2]) >= 10586
			) {
				return Number(osRelease[2]) >= 14931 ? 3 : 2;
			}

			return 1;
		}

		if ('CI' in env) {
			if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
				return 1;
			}

			return min;
		}

		if ('TEAMCITY_VERSION' in env) {
			return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
		}

		if (env.COLORTERM === 'truecolor') {
			return 3;
		}

		if ('TERM_PROGRAM' in env) {
			const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

			switch (env.TERM_PROGRAM) {
				case 'iTerm.app':
					return version >= 3 ? 3 : 2;
				case 'Apple_Terminal':
					return 2;
				// No default
			}
		}

		if (/-256(color)?$/i.test(env.TERM)) {
			return 2;
		}

		if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
			return 1;
		}

		if ('COLORTERM' in env) {
			return 1;
		}

		return min;
	}

	function getSupportLevel(stream) {
		const level = supportsColor(stream, stream && stream.isTTY);
		return translateLevel(level);
	}

	supportsColor_1 = {
		supportsColor: getSupportLevel,
		stdout: translateLevel(supportsColor(true, tty.isatty(1))),
		stderr: translateLevel(supportsColor(true, tty.isatty(2)))
	};
	return supportsColor_1;
}

/**
 * Helpers.
 */

var ms;
var hasRequiredMs;

function requireMs () {
	if (hasRequiredMs) return ms;
	hasRequiredMs = 1;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var w = d * 7;
	var y = d * 365.25;

	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	ms = function(val, options) {
	  options = options || {};
	  var type = typeof val;
	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isFinite(val)) {
	    return options.long ? fmtLong(val) : fmtShort(val);
	  }
	  throw new Error(
	    'val is not a non-empty string or a valid number. val=' +
	      JSON.stringify(val)
	  );
	};

	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */

	function parse(str) {
	  str = String(str);
	  if (str.length > 100) {
	    return;
	  }
	  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
	    str
	  );
	  if (!match) {
	    return;
	  }
	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();
	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;
	    case 'weeks':
	    case 'week':
	    case 'w':
	      return n * w;
	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;
	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;
	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;
	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;
	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;
	    default:
	      return undefined;
	  }
	}

	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtShort(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return Math.round(ms / d) + 'd';
	  }
	  if (msAbs >= h) {
	    return Math.round(ms / h) + 'h';
	  }
	  if (msAbs >= m) {
	    return Math.round(ms / m) + 'm';
	  }
	  if (msAbs >= s) {
	    return Math.round(ms / s) + 's';
	  }
	  return ms + 'ms';
	}

	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */

	function fmtLong(ms) {
	  var msAbs = Math.abs(ms);
	  if (msAbs >= d) {
	    return plural(ms, msAbs, d, 'day');
	  }
	  if (msAbs >= h) {
	    return plural(ms, msAbs, h, 'hour');
	  }
	  if (msAbs >= m) {
	    return plural(ms, msAbs, m, 'minute');
	  }
	  if (msAbs >= s) {
	    return plural(ms, msAbs, s, 'second');
	  }
	  return ms + ' ms';
	}

	/**
	 * Pluralization helper.
	 */

	function plural(ms, msAbs, n, name) {
	  var isPlural = msAbs >= n * 1.5;
	  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
	}
	return ms;
}

var common;
var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	/**
	 * This is the common logic for both the Node.js and web browser
	 * implementations of `debug()`.
	 */

	function setup(env) {
		createDebug.debug = createDebug;
		createDebug.default = createDebug;
		createDebug.coerce = coerce;
		createDebug.disable = disable;
		createDebug.enable = enable;
		createDebug.enabled = enabled;
		createDebug.humanize = requireMs();
		createDebug.destroy = destroy;

		Object.keys(env).forEach(key => {
			createDebug[key] = env[key];
		});

		/**
		* The currently active debug mode names, and names to skip.
		*/

		createDebug.names = [];
		createDebug.skips = [];

		/**
		* Map of special "%n" handling functions, for the debug "format" argument.
		*
		* Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
		*/
		createDebug.formatters = {};

		/**
		* Selects a color for a debug namespace
		* @param {String} namespace The namespace string for the debug instance to be colored
		* @return {Number|String} An ANSI color code for the given namespace
		* @api private
		*/
		function selectColor(namespace) {
			let hash = 0;

			for (let i = 0; i < namespace.length; i++) {
				hash = ((hash << 5) - hash) + namespace.charCodeAt(i);
				hash |= 0; // Convert to 32bit integer
			}

			return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
		}
		createDebug.selectColor = selectColor;

		/**
		* Create a debugger with the given `namespace`.
		*
		* @param {String} namespace
		* @return {Function}
		* @api public
		*/
		function createDebug(namespace) {
			let prevTime;
			let enableOverride = null;
			let namespacesCache;
			let enabledCache;

			function debug(...args) {
				// Disabled?
				if (!debug.enabled) {
					return;
				}

				const self = debug;

				// Set `diff` timestamp
				const curr = Number(new Date());
				const ms = curr - (prevTime || curr);
				self.diff = ms;
				self.prev = prevTime;
				self.curr = curr;
				prevTime = curr;

				args[0] = createDebug.coerce(args[0]);

				if (typeof args[0] !== 'string') {
					// Anything else let's inspect with %O
					args.unshift('%O');
				}

				// Apply any `formatters` transformations
				let index = 0;
				args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
					// If we encounter an escaped % then don't increase the array index
					if (match === '%%') {
						return '%';
					}
					index++;
					const formatter = createDebug.formatters[format];
					if (typeof formatter === 'function') {
						const val = args[index];
						match = formatter.call(self, val);

						// Now we need to remove `args[index]` since it's inlined in the `format`
						args.splice(index, 1);
						index--;
					}
					return match;
				});

				// Apply env-specific formatting (colors, etc.)
				createDebug.formatArgs.call(self, args);

				const logFn = self.log || createDebug.log;
				logFn.apply(self, args);
			}

			debug.namespace = namespace;
			debug.useColors = createDebug.useColors();
			debug.color = createDebug.selectColor(namespace);
			debug.extend = extend;
			debug.destroy = createDebug.destroy; // XXX Temporary. Will be removed in the next major release.

			Object.defineProperty(debug, 'enabled', {
				enumerable: true,
				configurable: false,
				get: () => {
					if (enableOverride !== null) {
						return enableOverride;
					}
					if (namespacesCache !== createDebug.namespaces) {
						namespacesCache = createDebug.namespaces;
						enabledCache = createDebug.enabled(namespace);
					}

					return enabledCache;
				},
				set: v => {
					enableOverride = v;
				}
			});

			// Env-specific initialization logic for debug instances
			if (typeof createDebug.init === 'function') {
				createDebug.init(debug);
			}

			return debug;
		}

		function extend(namespace, delimiter) {
			const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace);
			newDebug.log = this.log;
			return newDebug;
		}

		/**
		* Enables a debug mode by namespaces. This can include modes
		* separated by a colon and wildcards.
		*
		* @param {String} namespaces
		* @api public
		*/
		function enable(namespaces) {
			createDebug.save(namespaces);
			createDebug.namespaces = namespaces;

			createDebug.names = [];
			createDebug.skips = [];

			let i;
			const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
			const len = split.length;

			for (i = 0; i < len; i++) {
				if (!split[i]) {
					// ignore empty strings
					continue;
				}

				namespaces = split[i].replace(/\*/g, '.*?');

				if (namespaces[0] === '-') {
					createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'));
				} else {
					createDebug.names.push(new RegExp('^' + namespaces + '$'));
				}
			}
		}

		/**
		* Disable debug output.
		*
		* @return {String} namespaces
		* @api public
		*/
		function disable() {
			const namespaces = [
				...createDebug.names.map(toNamespace),
				...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
			].join(',');
			createDebug.enable('');
			return namespaces;
		}

		/**
		* Returns true if the given mode name is enabled, false otherwise.
		*
		* @param {String} name
		* @return {Boolean}
		* @api public
		*/
		function enabled(name) {
			if (name[name.length - 1] === '*') {
				return true;
			}

			let i;
			let len;

			for (i = 0, len = createDebug.skips.length; i < len; i++) {
				if (createDebug.skips[i].test(name)) {
					return false;
				}
			}

			for (i = 0, len = createDebug.names.length; i < len; i++) {
				if (createDebug.names[i].test(name)) {
					return true;
				}
			}

			return false;
		}

		/**
		* Convert regexp to namespace
		*
		* @param {RegExp} regxep
		* @return {String} namespace
		* @api private
		*/
		function toNamespace(regexp) {
			return regexp.toString()
				.substring(2, regexp.toString().length - 2)
				.replace(/\.\*\?$/, '*');
		}

		/**
		* Coerce `val`.
		*
		* @param {Mixed} val
		* @return {Mixed}
		* @api private
		*/
		function coerce(val) {
			if (val instanceof Error) {
				return val.stack || val.message;
			}
			return val;
		}

		/**
		* XXX DO NOT USE. This is a temporary stub function.
		* XXX It WILL be removed in the next major release.
		*/
		function destroy() {
			console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
		}

		createDebug.enable(createDebug.load());

		return createDebug;
	}

	common = setup;
	return common;
}

/**
 * Module dependencies.
 */

var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node.exports;
	hasRequiredNode = 1;
	(function (module, exports) {
		const tty = require$$1$2;
		const util = require$$1;

		/**
		 * This is the Node.js implementation of `debug()`.
		 */

		exports.init = init;
		exports.log = log;
		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.destroy = util.deprecate(
			() => {},
			'Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.'
		);

		/**
		 * Colors.
		 */

		exports.colors = [6, 2, 3, 4, 5, 1];

		try {
			// Optional dependency (as in, doesn't need to be installed, NOT like optionalDependencies in package.json)
			// eslint-disable-next-line import/no-extraneous-dependencies
			const supportsColor = requireSupportsColor();

			if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
				exports.colors = [
					20,
					21,
					26,
					27,
					32,
					33,
					38,
					39,
					40,
					41,
					42,
					43,
					44,
					45,
					56,
					57,
					62,
					63,
					68,
					69,
					74,
					75,
					76,
					77,
					78,
					79,
					80,
					81,
					92,
					93,
					98,
					99,
					112,
					113,
					128,
					129,
					134,
					135,
					148,
					149,
					160,
					161,
					162,
					163,
					164,
					165,
					166,
					167,
					168,
					169,
					170,
					171,
					172,
					173,
					178,
					179,
					184,
					185,
					196,
					197,
					198,
					199,
					200,
					201,
					202,
					203,
					204,
					205,
					206,
					207,
					208,
					209,
					214,
					215,
					220,
					221
				];
			}
		} catch (error) {
			// Swallow - we only care if `supports-color` is available; it doesn't have to be.
		}

		/**
		 * Build up the default `inspectOpts` object from the environment variables.
		 *
		 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
		 */

		exports.inspectOpts = Object.keys(process.env).filter(key => {
			return /^debug_/i.test(key);
		}).reduce((obj, key) => {
			// Camel-case
			const prop = key
				.substring(6)
				.toLowerCase()
				.replace(/_([a-z])/g, (_, k) => {
					return k.toUpperCase();
				});

			// Coerce string value into JS value
			let val = process.env[key];
			if (/^(yes|on|true|enabled)$/i.test(val)) {
				val = true;
			} else if (/^(no|off|false|disabled)$/i.test(val)) {
				val = false;
			} else if (val === 'null') {
				val = null;
			} else {
				val = Number(val);
			}

			obj[prop] = val;
			return obj;
		}, {});

		/**
		 * Is stdout a TTY? Colored output is enabled when `true`.
		 */

		function useColors() {
			return 'colors' in exports.inspectOpts ?
				Boolean(exports.inspectOpts.colors) :
				tty.isatty(process.stderr.fd);
		}

		/**
		 * Adds ANSI color escape codes if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			const {namespace: name, useColors} = this;

			if (useColors) {
				const c = this.color;
				const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c);
				const prefix = `  ${colorCode};1m${name} \u001B[0m`;

				args[0] = prefix + args[0].split('\n').join('\n' + prefix);
				args.push(colorCode + 'm+' + module.exports.humanize(this.diff) + '\u001B[0m');
			} else {
				args[0] = getDate() + name + ' ' + args[0];
			}
		}

		function getDate() {
			if (exports.inspectOpts.hideDate) {
				return '';
			}
			return new Date().toISOString() + ' ';
		}

		/**
		 * Invokes `util.format()` with the specified arguments and writes to stderr.
		 */

		function log(...args) {
			return process.stderr.write(util.format(...args) + '\n');
		}

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			if (namespaces) {
				process.env.DEBUG = namespaces;
			} else {
				// If you set a process.env field to null or undefined, it gets cast to the
				// string 'null' or 'undefined'. Just delete instead.
				delete process.env.DEBUG;
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */

		function load() {
			return process.env.DEBUG;
		}

		/**
		 * Init logic for `debug` instances.
		 *
		 * Create a new `inspectOpts` object in case `useColors` is set
		 * differently for a particular `debug` instance.
		 */

		function init(debug) {
			debug.inspectOpts = {};

			const keys = Object.keys(exports.inspectOpts);
			for (let i = 0; i < keys.length; i++) {
				debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %o to `util.inspect()`, all on a single line.
		 */

		formatters.o = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts)
				.split('\n')
				.map(str => str.trim())
				.join(' ');
		};

		/**
		 * Map %O to `util.inspect()`, allowing multiple lines if needed.
		 */

		formatters.O = function (v) {
			this.inspectOpts.colors = this.useColors;
			return util.inspect(v, this.inspectOpts);
		}; 
	} (node, node.exports));
	return node.exports;
}

var browser = {exports: {}};

/* eslint-env browser */

var hasRequiredBrowser;

function requireBrowser () {
	if (hasRequiredBrowser) return browser.exports;
	hasRequiredBrowser = 1;
	(function (module, exports) {
		/**
		 * This is the web browser implementation of `debug()`.
		 */

		exports.formatArgs = formatArgs;
		exports.save = save;
		exports.load = load;
		exports.useColors = useColors;
		exports.storage = localstorage();
		exports.destroy = (() => {
			let warned = false;

			return () => {
				if (!warned) {
					warned = true;
					console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.');
				}
			};
		})();

		/**
		 * Colors.
		 */

		exports.colors = [
			'#0000CC',
			'#0000FF',
			'#0033CC',
			'#0033FF',
			'#0066CC',
			'#0066FF',
			'#0099CC',
			'#0099FF',
			'#00CC00',
			'#00CC33',
			'#00CC66',
			'#00CC99',
			'#00CCCC',
			'#00CCFF',
			'#3300CC',
			'#3300FF',
			'#3333CC',
			'#3333FF',
			'#3366CC',
			'#3366FF',
			'#3399CC',
			'#3399FF',
			'#33CC00',
			'#33CC33',
			'#33CC66',
			'#33CC99',
			'#33CCCC',
			'#33CCFF',
			'#6600CC',
			'#6600FF',
			'#6633CC',
			'#6633FF',
			'#66CC00',
			'#66CC33',
			'#9900CC',
			'#9900FF',
			'#9933CC',
			'#9933FF',
			'#99CC00',
			'#99CC33',
			'#CC0000',
			'#CC0033',
			'#CC0066',
			'#CC0099',
			'#CC00CC',
			'#CC00FF',
			'#CC3300',
			'#CC3333',
			'#CC3366',
			'#CC3399',
			'#CC33CC',
			'#CC33FF',
			'#CC6600',
			'#CC6633',
			'#CC9900',
			'#CC9933',
			'#CCCC00',
			'#CCCC33',
			'#FF0000',
			'#FF0033',
			'#FF0066',
			'#FF0099',
			'#FF00CC',
			'#FF00FF',
			'#FF3300',
			'#FF3333',
			'#FF3366',
			'#FF3399',
			'#FF33CC',
			'#FF33FF',
			'#FF6600',
			'#FF6633',
			'#FF9900',
			'#FF9933',
			'#FFCC00',
			'#FFCC33'
		];

		/**
		 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
		 * and the Firebug extension (any Firefox version) are known
		 * to support "%c" CSS customizations.
		 *
		 * TODO: add a `localStorage` variable to explicitly enable/disable colors
		 */

		// eslint-disable-next-line complexity
		function useColors() {
			// NB: In an Electron preload script, document will be defined but not fully
			// initialized. Since we know we're in Chrome, we'll just detect this case
			// explicitly
			if (typeof window !== 'undefined' && window.process && (window.process.type === 'renderer' || window.process.__nwjs)) {
				return true;
			}

			// Internet Explorer and Edge do not support colors.
			if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
				return false;
			}

			// Is webkit? http://stackoverflow.com/a/16459606/376773
			// document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
			return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
				// Is firebug? http://stackoverflow.com/a/398120/376773
				(typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
				// Is firefox >= v31?
				// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
				// Double check webkit in userAgent just in case we are in a worker
				(typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
		}

		/**
		 * Colorize log arguments if enabled.
		 *
		 * @api public
		 */

		function formatArgs(args) {
			args[0] = (this.useColors ? '%c' : '') +
				this.namespace +
				(this.useColors ? ' %c' : ' ') +
				args[0] +
				(this.useColors ? '%c ' : ' ') +
				'+' + module.exports.humanize(this.diff);

			if (!this.useColors) {
				return;
			}

			const c = 'color: ' + this.color;
			args.splice(1, 0, c, 'color: inherit');

			// The final "%c" is somewhat tricky, because there could be other
			// arguments passed either before or after the %c, so we need to
			// figure out the correct index to insert the CSS into
			let index = 0;
			let lastC = 0;
			args[0].replace(/%[a-zA-Z%]/g, match => {
				if (match === '%%') {
					return;
				}
				index++;
				if (match === '%c') {
					// We only are interested in the *last* %c
					// (the user may have provided their own)
					lastC = index;
				}
			});

			args.splice(lastC, 0, c);
		}

		/**
		 * Invokes `console.debug()` when available.
		 * No-op when `console.debug` is not a "function".
		 * If `console.debug` is not available, falls back
		 * to `console.log`.
		 *
		 * @api public
		 */
		exports.log = console.debug || console.log || (() => {});

		/**
		 * Save `namespaces`.
		 *
		 * @param {String} namespaces
		 * @api private
		 */
		function save(namespaces) {
			try {
				if (namespaces) {
					exports.storage.setItem('debug', namespaces);
				} else {
					exports.storage.removeItem('debug');
				}
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		/**
		 * Load `namespaces`.
		 *
		 * @return {String} returns the previously persisted debug modes
		 * @api private
		 */
		function load() {
			let r;
			try {
				r = exports.storage.getItem('debug');
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}

			// If debug isn't set in LS, and we're in Electron, try to load $DEBUG
			if (!r && typeof process !== 'undefined' && 'env' in process) {
				r = process.env.DEBUG;
			}

			return r;
		}

		/**
		 * Localstorage attempts to return the localstorage.
		 *
		 * This is necessary because safari throws
		 * when a user disables cookies/localstorage
		 * and you attempt to access it.
		 *
		 * @return {LocalStorage}
		 * @api private
		 */

		function localstorage() {
			try {
				// TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
				// The Browser also has localStorage in the global context.
				return localStorage;
			} catch (error) {
				// Swallow
				// XXX (@Qix-) should we be logging these?
			}
		}

		module.exports = requireCommon()(exports);

		const {formatters} = module.exports;

		/**
		 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
		 */

		formatters.j = function (v) {
			try {
				return JSON.stringify(v);
			} catch (error) {
				return '[UnexpectedJSONParseError]: ' + error.message;
			}
		}; 
	} (browser, browser.exports));
	return browser.exports;
}

/**
 * Detect Electron renderer / nwjs process, which is node, but we should
 * treat as a browser.
 */

var hasRequiredSrc;

function requireSrc () {
	if (hasRequiredSrc) return src.exports;
	hasRequiredSrc = 1;
	if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
		src.exports = requireBrowser();
	} else {
		src.exports = requireNode();
	}
	return src.exports;
}

var debug$1;

var debug_1 = function () {
  if (!debug$1) {
    try {
      /* eslint global-require: off */
      debug$1 = requireSrc()("follow-redirects");
    }
    catch (error) { /* */ }
    if (typeof debug$1 !== "function") {
      debug$1 = function () { /* */ };
    }
  }
  debug$1.apply(null, arguments);
};

var url = require$$0$1;
var URL$1 = url.URL;
var http = require$$3;
var https = require$$4;
var Writable = stream.Writable;
var assert = require$$4$1;
var debug = debug_1;

// Create handlers that pass events from native requests
var events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
var eventHandlers = Object.create(null);
events.forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

var InvalidUrlError = createErrorType(
  "ERR_INVALID_URL",
  "Invalid URL",
  TypeError
);
// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  "Redirected request failed"
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  abortRequest(this._currentRequest);
  this.emit("abort");
};

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!isString$1(data) && !isBuffer$2(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction$2(encoding)) {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (isFunction$2(data)) {
    callback = data;
    data = encoding = null;
  }
  else if (isFunction$2(encoding)) {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  var self = this;

  // Destroys the socket on timeout
  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }

  // Sets up a timer to trigger a timeout event
  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(function () {
      self.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  // Stops a timeout from triggering
  function clearTimer() {
    // Clear the timeout
    if (self._timeout) {
      clearTimeout(self._timeout);
      self._timeout = null;
    }

    // Clean up all attached listeners
    self.removeListener("abort", clearTimer);
    self.removeListener("error", clearTimer);
    self.removeListener("response", clearTimer);
    if (callback) {
      self.removeListener("timeout", callback);
    }
    if (!self.socket) {
      self._currentRequest.removeListener("socket", startTimer);
    }
  }

  // Attach callback if passed
  if (callback) {
    this.on("timeout", callback);
  }

  // Start the timer if or when the socket is opened
  if (this.socket) {
    startTimer(this.socket);
  }
  else {
    this._currentRequest.once("socket", startTimer);
  }

  // Clean up on events
  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);

  return this;
};

// Proxy all other public ClientRequest methods
[
  "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request and set up its event handlers
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (var event of events) {
    request.on(event, eventHandlers[event]);
  }

  // RFC7230§5.3.1: When making a request directly to an origin server, […]
  // a client MUST send only the absolute path […] as the request-target.
  this._currentUrl = /^\//.test(this._options.path) ?
    url.format(this._options) :
    // When making a request to a proxy, […]
    // a client MUST send the target URI in absolute-form […].
    this._options.path;

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.

  // If the response is not a redirect; return it as-is
  var location = response.headers.location;
  if (!location || this._options.followRedirects === false ||
      statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
    return;
  }

  // The response is a redirect, so abort the current request
  abortRequest(this._currentRequest);
  // Discard the remainder of the response to avoid waiting for data
  response.destroy();

  // RFC7231§6.4: A client SHOULD detect and intervene
  // in cyclical redirections (i.e., "infinite" redirection loops).
  if (++this._redirectCount > this._options.maxRedirects) {
    this.emit("error", new TooManyRedirectsError());
    return;
  }

  // Store the request headers if applicable
  var requestHeaders;
  var beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      // The Host header was set by nativeProtocol.request
      Host: response.req.getHeader("host"),
    }, this._options.headers);
  }

  // RFC7231§6.4: Automatic redirection needs to done with
  // care for methods not known to be safe, […]
  // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
  // the request method from POST to GET for the subsequent request.
  var method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
      // RFC7231§6.4.4: The 303 (See Other) status code indicates that
      // the server is redirecting the user agent to a different resource […]
      // A user agent can perform a retrieval request targeting that URI
      // (a GET or HEAD request if using HTTP) […]
      (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    // Drop a possible entity and headers related to it
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }

  // Drop the Host header, as the redirect might lead to a different host
  var currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);

  // If the redirect is relative, carry over the host of the last request
  var currentUrlParts = url.parse(this._currentUrl);
  var currentHost = currentHostHeader || currentUrlParts.host;
  var currentUrl = /^\w+:/.test(location) ? this._currentUrl :
    url.format(Object.assign(currentUrlParts, { host: currentHost }));

  // Determine the URL of the redirection
  var redirectUrl;
  try {
    redirectUrl = url.resolve(currentUrl, location);
  }
  catch (cause) {
    this.emit("error", new RedirectionError({ cause: cause }));
    return;
  }

  // Create the redirected request
  debug("redirecting to", redirectUrl);
  this._isRedirect = true;
  var redirectUrlParts = url.parse(redirectUrl);
  Object.assign(this._options, redirectUrlParts);

  // Drop confidential headers when redirecting to a less secure protocol
  // or to a different domain that is not a superdomain
  if (redirectUrlParts.protocol !== currentUrlParts.protocol &&
     redirectUrlParts.protocol !== "https:" ||
     redirectUrlParts.host !== currentHost &&
     !isSubdomain(redirectUrlParts.host, currentHost)) {
    removeMatchingHeaders(/^(?:authorization|cookie)$/i, this._options.headers);
  }

  // Evaluate the beforeRedirect callback
  if (isFunction$2(beforeRedirect)) {
    var responseDetails = {
      headers: response.headers,
      statusCode: statusCode,
    };
    var requestDetails = {
      url: currentUrl,
      method: method,
      headers: requestHeaders,
    };
    try {
      beforeRedirect(this._options, responseDetails, requestDetails);
    }
    catch (err) {
      this.emit("error", err);
      return;
    }
    this._sanitizeOptions(this._options);
  }

  // Perform the redirected request
  try {
    this._performRequest();
  }
  catch (cause) {
    this.emit("error", new RedirectionError({ cause: cause }));
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters
      if (isString$1(input)) {
        var parsed;
        try {
          parsed = urlToOptions(new URL$1(input));
        }
        catch (err) {
          /* istanbul ignore next */
          parsed = url.parse(input);
        }
        if (!isString$1(parsed.protocol)) {
          throw new InvalidUrlError({ input });
        }
        input = parsed;
      }
      else if (URL$1 && (input instanceof URL$1)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (isFunction$2(options)) {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString$1(options.host) && !isString$1(options.hostname)) {
        options.hostname = "::1";
      }

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return (lastValue === null || typeof lastValue === "undefined") ?
    undefined : String(lastValue).trim();
}

function createErrorType(code, message, baseClass) {
  // Create constructor
  function CustomError(properties) {
    Error.captureStackTrace(this, this.constructor);
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? message + ": " + this.cause.message : message;
  }

  // Attach constructor and set default properties
  CustomError.prototype = new (baseClass || Error)();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  return CustomError;
}

function abortRequest(request) {
  for (var event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.abort();
}

function isSubdomain(subdomain, domain) {
  assert(isString$1(subdomain) && isString$1(domain));
  var dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}

function isString$1(value) {
  return typeof value === "string" || value instanceof String;
}

function isFunction$2(value) {
  return typeof value === "function";
}

function isBuffer$2(value) {
  return typeof value === "object" && ("length" in value);
}

// Exports
followRedirects$1.exports = wrap({ http: http, https: https });
followRedirects$1.exports.wrap = wrap;

var followRedirectsExports = followRedirects$1.exports;
var followRedirects = /*@__PURE__*/getDefaultExportFromCjs(followRedirectsExports);

const VERSION = "1.4.0";

function parseProtocol(url) {
  const match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
  return match && match[1] || '';
}

const DATA_URL_PATTERN = /^(?:([^;]+);)?(?:[^;]+;)?(base64|),([\s\S]*)$/;

/**
 * Parse data uri to a Buffer or Blob
 *
 * @param {String} uri
 * @param {?Boolean} asBlob
 * @param {?Object} options
 * @param {?Function} options.Blob
 *
 * @returns {Buffer|Blob}
 */
function fromDataURI(uri, asBlob, options) {
  const _Blob = options && options.Blob || platform.classes.Blob;
  const protocol = parseProtocol(uri);

  if (asBlob === undefined && _Blob) {
    asBlob = true;
  }

  if (protocol === 'data') {
    uri = protocol.length ? uri.slice(protocol.length + 1) : uri;

    const match = DATA_URL_PATTERN.exec(uri);

    if (!match) {
      throw new AxiosError('Invalid URL', AxiosError.ERR_INVALID_URL);
    }

    const mime = match[1];
    const isBase64 = match[2];
    const body = match[3];
    const buffer = Buffer.from(decodeURIComponent(body), isBase64 ? 'base64' : 'utf8');

    if (asBlob) {
      if (!_Blob) {
        throw new AxiosError('Blob is not supported', AxiosError.ERR_NOT_SUPPORT);
      }

      return new _Blob([buffer], {type: mime});
    }

    return buffer;
  }

  throw new AxiosError('Unsupported protocol ' + protocol, AxiosError.ERR_NOT_SUPPORT);
}

/**
 * Throttle decorator
 * @param {Function} fn
 * @param {Number} freq
 * @return {Function}
 */
function throttle(fn, freq) {
  let timestamp = 0;
  const threshold = 1000 / freq;
  let timer = null;
  return function throttled(force, args) {
    const now = Date.now();
    if (force || now - timestamp > threshold) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timestamp = now;
      return fn.apply(null, args);
    }
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        timestamp = Date.now();
        return fn.apply(null, args);
      }, threshold - (now - timestamp));
    }
  };
}

/**
 * Calculate data maxRate
 * @param {Number} [samplesCount= 10]
 * @param {Number} [min= 1000]
 * @returns {Function}
 */
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;

  min = min !== undefined ? min : 1000;

  return function push(chunkLength) {
    const now = Date.now();

    const startedAt = timestamps[tail];

    if (!firstSampleTS) {
      firstSampleTS = now;
    }

    bytes[head] = chunkLength;
    timestamps[head] = now;

    let i = tail;
    let bytesCount = 0;

    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }

    head = (head + 1) % samplesCount;

    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }

    if (now - firstSampleTS < min) {
      return;
    }

    const passed = startedAt && now - startedAt;

    return passed ? Math.round(bytesCount * 1000 / passed) : undefined;
  };
}

const kInternals = Symbol('internals');

class AxiosTransformStream extends stream.Transform{
  constructor(options) {
    options = utils.toFlatObject(options, {
      maxRate: 0,
      chunkSize: 64 * 1024,
      minChunkSize: 100,
      timeWindow: 500,
      ticksRate: 2,
      samplesCount: 15
    }, null, (prop, source) => {
      return !utils.isUndefined(source[prop]);
    });

    super({
      readableHighWaterMark: options.chunkSize
    });

    const self = this;

    const internals = this[kInternals] = {
      length: options.length,
      timeWindow: options.timeWindow,
      ticksRate: options.ticksRate,
      chunkSize: options.chunkSize,
      maxRate: options.maxRate,
      minChunkSize: options.minChunkSize,
      bytesSeen: 0,
      isCaptured: false,
      notifiedBytesLoaded: 0,
      ts: Date.now(),
      bytes: 0,
      onReadCallback: null
    };

    const _speedometer = speedometer(internals.ticksRate * options.samplesCount, internals.timeWindow);

    this.on('newListener', event => {
      if (event === 'progress') {
        if (!internals.isCaptured) {
          internals.isCaptured = true;
        }
      }
    });

    let bytesNotified = 0;

    internals.updateProgress = throttle(function throttledHandler() {
      const totalBytes = internals.length;
      const bytesTransferred = internals.bytesSeen;
      const progressBytes = bytesTransferred - bytesNotified;
      if (!progressBytes || self.destroyed) return;

      const rate = _speedometer(progressBytes);

      bytesNotified = bytesTransferred;

      process.nextTick(() => {
        self.emit('progress', {
          'loaded': bytesTransferred,
          'total': totalBytes,
          'progress': totalBytes ? (bytesTransferred / totalBytes) : undefined,
          'bytes': progressBytes,
          'rate': rate ? rate : undefined,
          'estimated': rate && totalBytes && bytesTransferred <= totalBytes ?
            (totalBytes - bytesTransferred) / rate : undefined
        });
      });
    }, internals.ticksRate);

    const onFinish = () => {
      internals.updateProgress(true);
    };

    this.once('end', onFinish);
    this.once('error', onFinish);
  }

  _read(size) {
    const internals = this[kInternals];

    if (internals.onReadCallback) {
      internals.onReadCallback();
    }

    return super._read(size);
  }

  _transform(chunk, encoding, callback) {
    const self = this;
    const internals = this[kInternals];
    const maxRate = internals.maxRate;

    const readableHighWaterMark = this.readableHighWaterMark;

    const timeWindow = internals.timeWindow;

    const divider = 1000 / timeWindow;
    const bytesThreshold = (maxRate / divider);
    const minChunkSize = internals.minChunkSize !== false ? Math.max(internals.minChunkSize, bytesThreshold * 0.01) : 0;

    function pushChunk(_chunk, _callback) {
      const bytes = Buffer.byteLength(_chunk);
      internals.bytesSeen += bytes;
      internals.bytes += bytes;

      if (internals.isCaptured) {
        internals.updateProgress();
      }

      if (self.push(_chunk)) {
        process.nextTick(_callback);
      } else {
        internals.onReadCallback = () => {
          internals.onReadCallback = null;
          process.nextTick(_callback);
        };
      }
    }

    const transformChunk = (_chunk, _callback) => {
      const chunkSize = Buffer.byteLength(_chunk);
      let chunkRemainder = null;
      let maxChunkSize = readableHighWaterMark;
      let bytesLeft;
      let passed = 0;

      if (maxRate) {
        const now = Date.now();

        if (!internals.ts || (passed = (now - internals.ts)) >= timeWindow) {
          internals.ts = now;
          bytesLeft = bytesThreshold - internals.bytes;
          internals.bytes = bytesLeft < 0 ? -bytesLeft : 0;
          passed = 0;
        }

        bytesLeft = bytesThreshold - internals.bytes;
      }

      if (maxRate) {
        if (bytesLeft <= 0) {
          // next time window
          return setTimeout(() => {
            _callback(null, _chunk);
          }, timeWindow - passed);
        }

        if (bytesLeft < maxChunkSize) {
          maxChunkSize = bytesLeft;
        }
      }

      if (maxChunkSize && chunkSize > maxChunkSize && (chunkSize - maxChunkSize) > minChunkSize) {
        chunkRemainder = _chunk.subarray(maxChunkSize);
        _chunk = _chunk.subarray(0, maxChunkSize);
      }

      pushChunk(_chunk, chunkRemainder ? () => {
        process.nextTick(_callback, null, chunkRemainder);
      } : _callback);
    };

    transformChunk(chunk, function transformNextChunk(err, _chunk) {
      if (err) {
        return callback(err);
      }

      if (_chunk) {
        transformChunk(_chunk, transformNextChunk);
      } else {
        callback(null);
      }
    });
  }

  setLength(length) {
    this[kInternals].length = +length;
    return this;
  }
}

var AxiosTransformStream$1 = AxiosTransformStream;

const {asyncIterator} = Symbol;

const readBlob = async function* (blob) {
  if (blob.stream) {
    yield* blob.stream();
  } else if (blob.arrayBuffer) {
    yield await blob.arrayBuffer();
  } else if (blob[asyncIterator]) {
    yield* blob[asyncIterator]();
  } else {
    yield blob;
  }
};

var readBlob$1 = readBlob;

const BOUNDARY_ALPHABET = utils.ALPHABET.ALPHA_DIGIT + '-_';

const textEncoder = new require$$1.TextEncoder();

const CRLF = '\r\n';
const CRLF_BYTES = textEncoder.encode(CRLF);
const CRLF_BYTES_COUNT = 2;

class FormDataPart {
  constructor(name, value) {
    const {escapeName} = this.constructor;
    const isStringValue = utils.isString(value);

    let headers = `Content-Disposition: form-data; name="${escapeName(name)}"${
      !isStringValue && value.name ? `; filename="${escapeName(value.name)}"` : ''
    }${CRLF}`;

    if (isStringValue) {
      value = textEncoder.encode(String(value).replace(/\r?\n|\r\n?/g, CRLF));
    } else {
      headers += `Content-Type: ${value.type || "application/octet-stream"}${CRLF}`;
    }

    this.headers = textEncoder.encode(headers + CRLF);

    this.contentLength = isStringValue ? value.byteLength : value.size;

    this.size = this.headers.byteLength + this.contentLength + CRLF_BYTES_COUNT;

    this.name = name;
    this.value = value;
  }

  async *encode(){
    yield this.headers;

    const {value} = this;

    if(utils.isTypedArray(value)) {
      yield value;
    } else {
      yield* readBlob$1(value);
    }

    yield CRLF_BYTES;
  }

  static escapeName(name) {
      return String(name).replace(/[\r\n"]/g, (match) => ({
        '\r' : '%0D',
        '\n' : '%0A',
        '"' : '%22',
      }[match]));
  }
}

const formDataToStream = (form, headersHandler, options) => {
  const {
    tag = 'form-data-boundary',
    size = 25,
    boundary = tag + '-' + utils.generateString(size, BOUNDARY_ALPHABET)
  } = options || {};

  if(!utils.isFormData(form)) {
    throw TypeError('FormData instance required');
  }

  if (boundary.length < 1 || boundary.length > 70) {
    throw Error('boundary must be 10-70 characters long')
  }

  const boundaryBytes = textEncoder.encode('--' + boundary + CRLF);
  const footerBytes = textEncoder.encode('--' + boundary + '--' + CRLF + CRLF);
  let contentLength = footerBytes.byteLength;

  const parts = Array.from(form.entries()).map(([name, value]) => {
    const part = new FormDataPart(name, value);
    contentLength += part.size;
    return part;
  });

  contentLength += boundaryBytes.byteLength * parts.length;

  contentLength = utils.toFiniteNumber(contentLength);

  const computedHeaders = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`
  };

  if (Number.isFinite(contentLength)) {
    computedHeaders['Content-Length'] = contentLength;
  }

  headersHandler && headersHandler(computedHeaders);

  return stream.Readable.from((async function *() {
    for(const part of parts) {
      yield boundaryBytes;
      yield* part.encode();
    }

    yield footerBytes;
  })());
};

var formDataToStream$1 = formDataToStream;

class ZlibHeaderTransformStream extends stream.Transform {
  __transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }

  _transform(chunk, encoding, callback) {
    if (chunk.length !== 0) {
      this._transform = this.__transform;

      // Add Default Compression headers if no zlib headers are present
      if (chunk[0] !== 120) { // Hex: 78
        const header = Buffer.alloc(2);
        header[0] = 120; // Hex: 78
        header[1] = 156; // Hex: 9C 
        this.push(header, encoding);
      }
    }

    this.__transform(chunk, encoding, callback);
  }
}

var ZlibHeaderTransformStream$1 = ZlibHeaderTransformStream;

const callbackify = (fn, reducer) => {
  return utils.isAsyncFn(fn) ? function (...args) {
    const cb = args.pop();
    fn.apply(this, args).then((value) => {
      try {
        reducer ? cb(null, ...reducer(value)) : cb(null, value);
      } catch (err) {
        cb(err);
      }
    }, cb);
  } : fn;
};

var callbackify$1 = callbackify;

const zlibOptions = {
  flush: zlib.constants.Z_SYNC_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH
};

const brotliOptions = {
  flush: zlib.constants.BROTLI_OPERATION_FLUSH,
  finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH
};

const isBrotliSupported = utils.isFunction(zlib.createBrotliDecompress);

const {http: httpFollow, https: httpsFollow} = followRedirects;

const isHttps = /https:?/;

const supportedProtocols = platform.protocols.map(protocol => {
  return protocol + ':';
});

/**
 * If the proxy or config beforeRedirects functions are defined, call them with the options
 * object.
 *
 * @param {Object<string, any>} options - The options object that was passed to the request.
 *
 * @returns {Object<string, any>}
 */
function dispatchBeforeRedirect(options) {
  if (options.beforeRedirects.proxy) {
    options.beforeRedirects.proxy(options);
  }
  if (options.beforeRedirects.config) {
    options.beforeRedirects.config(options);
  }
}

/**
 * If the proxy or config afterRedirects functions are defined, call them with the options
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} configProxy configuration from Axios options object
 * @param {string} location
 *
 * @returns {http.ClientRequestArgs}
 */
function setProxy(options, configProxy, location) {
  let proxy = configProxy;
  if (!proxy && proxy !== false) {
    const proxyUrl = getProxyForUrl_1(location);
    if (proxyUrl) {
      proxy = new URL(proxyUrl);
    }
  }
  if (proxy) {
    // Basic proxy authorization
    if (proxy.username) {
      proxy.auth = (proxy.username || '') + ':' + (proxy.password || '');
    }

    if (proxy.auth) {
      // Support proxy auth object form
      if (proxy.auth.username || proxy.auth.password) {
        proxy.auth = (proxy.auth.username || '') + ':' + (proxy.auth.password || '');
      }
      const base64 = Buffer
        .from(proxy.auth, 'utf8')
        .toString('base64');
      options.headers['Proxy-Authorization'] = 'Basic ' + base64;
    }

    options.headers.host = options.hostname + (options.port ? ':' + options.port : '');
    const proxyHost = proxy.hostname || proxy.host;
    options.hostname = proxyHost;
    // Replace 'host' since options is not a URL object
    options.host = proxyHost;
    options.port = proxy.port;
    options.path = location;
    if (proxy.protocol) {
      options.protocol = proxy.protocol.includes(':') ? proxy.protocol : `${proxy.protocol}:`;
    }
  }

  options.beforeRedirects.proxy = function beforeRedirect(redirectOptions) {
    // Configure proxy for redirected request, passing the original config proxy to apply
    // the exact same logic as if the redirected request was performed by axios directly.
    setProxy(redirectOptions, configProxy, redirectOptions.href);
  };
}

const isHttpAdapterSupported = typeof process !== 'undefined' && utils.kindOf(process) === 'process';

// temporary hotfix

const wrapAsync = (asyncExecutor) => {
  return new Promise((resolve, reject) => {
    let onDone;
    let isDone;

    const done = (value, isRejected) => {
      if (isDone) return;
      isDone = true;
      onDone && onDone(value, isRejected);
    };

    const _resolve = (value) => {
      done(value);
      resolve(value);
    };

    const _reject = (reason) => {
      done(reason, true);
      reject(reason);
    };

    asyncExecutor(_resolve, _reject, (onDoneHandler) => (onDone = onDoneHandler)).catch(_reject);
  })
};

/*eslint consistent-return:0*/
var httpAdapter = isHttpAdapterSupported && function httpAdapter(config) {
  return wrapAsync(async function dispatchHttpRequest(resolve, reject, onDone) {
    let {data, lookup, family} = config;
    const {responseType, responseEncoding} = config;
    const method = config.method.toUpperCase();
    let isDone;
    let rejected = false;
    let req;

    if (lookup && utils.isAsyncFn(lookup)) {
      lookup = callbackify$1(lookup, (entry) => {
        if(utils.isString(entry)) {
          entry = [entry, entry.indexOf('.') < 0 ? 6 : 4];
        } else if (!utils.isArray(entry)) {
          throw new TypeError('lookup async function must return an array [ip: string, family: number]]')
        }
        return entry;
      });
    }

    // temporary internal emitter until the AxiosRequest class will be implemented
    const emitter = new EventEmitter();

    const onFinished = () => {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(abort);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', abort);
      }

      emitter.removeAllListeners();
    };

    onDone((value, isRejected) => {
      isDone = true;
      if (isRejected) {
        rejected = true;
        onFinished();
      }
    });

    function abort(reason) {
      emitter.emit('abort', !reason || reason.type ? new CanceledError(null, config, req) : reason);
    }

    emitter.once('abort', reject);

    if (config.cancelToken || config.signal) {
      config.cancelToken && config.cancelToken.subscribe(abort);
      if (config.signal) {
        config.signal.aborted ? abort() : config.signal.addEventListener('abort', abort);
      }
    }

    // Parse url
    const fullPath = buildFullPath(config.baseURL, config.url);
    const parsed = new URL(fullPath, 'http://localhost');
    const protocol = parsed.protocol || supportedProtocols[0];

    if (protocol === 'data:') {
      let convertedData;

      if (method !== 'GET') {
        return settle(resolve, reject, {
          status: 405,
          statusText: 'method not allowed',
          headers: {},
          config
        });
      }

      try {
        convertedData = fromDataURI(config.url, responseType === 'blob', {
          Blob: config.env && config.env.Blob
        });
      } catch (err) {
        throw AxiosError.from(err, AxiosError.ERR_BAD_REQUEST, config);
      }

      if (responseType === 'text') {
        convertedData = convertedData.toString(responseEncoding);

        if (!responseEncoding || responseEncoding === 'utf8') {
          convertedData = utils.stripBOM(convertedData);
        }
      } else if (responseType === 'stream') {
        convertedData = stream.Readable.from(convertedData);
      }

      return settle(resolve, reject, {
        data: convertedData,
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders$1(),
        config
      });
    }

    if (supportedProtocols.indexOf(protocol) === -1) {
      return reject(new AxiosError(
        'Unsupported protocol ' + protocol,
        AxiosError.ERR_BAD_REQUEST,
        config
      ));
    }

    const headers = AxiosHeaders$1.from(config.headers).normalize();

    // Set User-Agent (required by some servers)
    // See https://github.com/axios/axios/issues/69
    // User-Agent is specified; handle case where no UA header is desired
    // Only set header if it hasn't been set in config
    headers.set('User-Agent', 'axios/' + VERSION, false);

    const onDownloadProgress = config.onDownloadProgress;
    const onUploadProgress = config.onUploadProgress;
    const maxRate = config.maxRate;
    let maxUploadRate = undefined;
    let maxDownloadRate = undefined;

    // support for spec compliant FormData objects
    if (utils.isSpecCompliantForm(data)) {
      const userBoundary = headers.getContentType(/boundary=([-_\w\d]{10,70})/i);

      data = formDataToStream$1(data, (formHeaders) => {
        headers.set(formHeaders);
      }, {
        tag: `axios-${VERSION}-boundary`,
        boundary: userBoundary && userBoundary[1] || undefined
      });
      // support for https://www.npmjs.com/package/form-data api
    } else if (utils.isFormData(data) && utils.isFunction(data.getHeaders)) {
      headers.set(data.getHeaders());

      if (!headers.hasContentLength()) {
        try {
          const knownLength = await require$$1.promisify(data.getLength).call(data);
          Number.isFinite(knownLength) && knownLength >= 0 && headers.setContentLength(knownLength);
          /*eslint no-empty:0*/
        } catch (e) {
        }
      }
    } else if (utils.isBlob(data)) {
      data.size && headers.setContentType(data.type || 'application/octet-stream');
      headers.setContentLength(data.size || 0);
      data = stream.Readable.from(readBlob$1(data));
    } else if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) ; else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(new AxiosError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }

      // Add Content-Length header if data exists
      headers.setContentLength(data.length, false);

      if (config.maxBodyLength > -1 && data.length > config.maxBodyLength) {
        return reject(new AxiosError(
          'Request body larger than maxBodyLength limit',
          AxiosError.ERR_BAD_REQUEST,
          config
        ));
      }
    }

    const contentLength = utils.toFiniteNumber(headers.getContentLength());

    if (utils.isArray(maxRate)) {
      maxUploadRate = maxRate[0];
      maxDownloadRate = maxRate[1];
    } else {
      maxUploadRate = maxDownloadRate = maxRate;
    }

    if (data && (onUploadProgress || maxUploadRate)) {
      if (!utils.isStream(data)) {
        data = stream.Readable.from(data, {objectMode: false});
      }

      data = stream.pipeline([data, new AxiosTransformStream$1({
        length: contentLength,
        maxRate: utils.toFiniteNumber(maxUploadRate)
      })], utils.noop);

      onUploadProgress && data.on('progress', progress => {
        onUploadProgress(Object.assign(progress, {
          upload: true
        }));
      });
    }

    // HTTP basic authentication
    let auth = undefined;
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password || '';
      auth = username + ':' + password;
    }

    if (!auth && parsed.username) {
      const urlUsername = parsed.username;
      const urlPassword = parsed.password;
      auth = urlUsername + ':' + urlPassword;
    }

    auth && headers.delete('authorization');

    let path;

    try {
      path = buildURL(
        parsed.pathname + parsed.search,
        config.params,
        config.paramsSerializer
      ).replace(/^\?/, '');
    } catch (err) {
      const customErr = new Error(err.message);
      customErr.config = config;
      customErr.url = config.url;
      customErr.exists = true;
      return reject(customErr);
    }

    headers.set(
      'Accept-Encoding',
      'gzip, compress, deflate' + (isBrotliSupported ? ', br' : ''), false
      );

    const options = {
      path,
      method: method,
      headers: headers.toJSON(),
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth,
      protocol,
      family,
      lookup,
      beforeRedirect: dispatchBeforeRedirect,
      beforeRedirects: {}
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
      setProxy(options, config.proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    let transport;
    const isHttpsRequest = isHttps.test(options.protocol);
    options.agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsRequest ? require$$4 : require$$3;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      if (config.beforeRedirect) {
        options.beforeRedirects.config = config.beforeRedirect;
      }
      transport = isHttpsRequest ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    } else {
      // follow-redirects does not skip comparison, so it should always succeed for axios -1 unlimited
      options.maxBodyLength = Infinity;
    }

    if (config.insecureHTTPParser) {
      options.insecureHTTPParser = config.insecureHTTPParser;
    }

    // Create the request
    req = transport.request(options, function handleResponse(res) {
      if (req.destroyed) return;

      const streams = [res];

      const responseLength = +res.headers['content-length'];

      if (onDownloadProgress) {
        const transformStream = new AxiosTransformStream$1({
          length: utils.toFiniteNumber(responseLength),
          maxRate: utils.toFiniteNumber(maxDownloadRate)
        });

        onDownloadProgress && transformStream.on('progress', progress => {
          onDownloadProgress(Object.assign(progress, {
            download: true
          }));
        });

        streams.push(transformStream);
      }

      // decompress the response body transparently if required
      let responseStream = res;

      // return the last request in case of redirects
      const lastRequest = res.req || req;

      // if decompress disabled we should not decompress
      if (config.decompress !== false && res.headers['content-encoding']) {
        // if no content, but headers still say that it is encoded,
        // remove the header not confuse downstream operations
        if (method === 'HEAD' || res.statusCode === 204) {
          delete res.headers['content-encoding'];
        }

        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'x-gzip':
        case 'compress':
        case 'x-compress':
          // add the unzipper to the body stream processing pipeline
          streams.push(zlib.createUnzip(zlibOptions));

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        case 'deflate':
          streams.push(new ZlibHeaderTransformStream$1());

          // add the unzipper to the body stream processing pipeline
          streams.push(zlib.createUnzip(zlibOptions));

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        case 'br':
          if (isBrotliSupported) {
            streams.push(zlib.createBrotliDecompress(brotliOptions));
            delete res.headers['content-encoding'];
          }
        }
      }

      responseStream = streams.length > 1 ? stream.pipeline(streams, utils.noop) : streams[0];

      const offListeners = stream.finished(responseStream, () => {
        offListeners();
        onFinished();
      });

      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: new AxiosHeaders$1(res.headers),
        config,
        request: lastRequest
      };

      if (responseType === 'stream') {
        response.data = responseStream;
        settle(resolve, reject, response);
      } else {
        const responseBuffer = [];
        let totalResponseBytes = 0;

        responseStream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);
          totalResponseBytes += chunk.length;

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && totalResponseBytes > config.maxContentLength) {
            // stream.destroy() emit aborted event before calling reject() on Node.js v16
            rejected = true;
            responseStream.destroy();
            reject(new AxiosError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              AxiosError.ERR_BAD_RESPONSE, config, lastRequest));
          }
        });

        responseStream.on('aborted', function handlerStreamAborted() {
          if (rejected) {
            return;
          }

          const err = new AxiosError(
            'maxContentLength size of ' + config.maxContentLength + ' exceeded',
            AxiosError.ERR_BAD_RESPONSE,
            config,
            lastRequest
          );
          responseStream.destroy(err);
          reject(err);
        });

        responseStream.on('error', function handleStreamError(err) {
          if (req.destroyed) return;
          reject(AxiosError.from(err, null, config, lastRequest));
        });

        responseStream.on('end', function handleStreamEnd() {
          try {
            let responseData = responseBuffer.length === 1 ? responseBuffer[0] : Buffer.concat(responseBuffer);
            if (responseType !== 'arraybuffer') {
              responseData = responseData.toString(responseEncoding);
              if (!responseEncoding || responseEncoding === 'utf8') {
                responseData = utils.stripBOM(responseData);
              }
            }
            response.data = responseData;
          } catch (err) {
            reject(AxiosError.from(err, null, config, response.request, response));
          }
          settle(resolve, reject, response);
        });
      }

      emitter.once('abort', err => {
        if (!responseStream.destroyed) {
          responseStream.emit('error', err);
          responseStream.destroy();
        }
      });
    });

    emitter.once('abort', err => {
      reject(err);
      req.destroy(err);
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      // @todo remove
      // if (req.aborted && err.code !== AxiosError.ERR_FR_TOO_MANY_REDIRECTS) return;
      reject(AxiosError.from(err, null, config, req));
    });

    // set tcp keep alive to prevent drop connection by peer
    req.on('socket', function handleRequestSocket(socket) {
      // default interval of sending ack packet is 1 minute
      socket.setKeepAlive(true, 1000 * 60);
    });

    // Handle request timeout
    if (config.timeout) {
      // This is forcing a int timeout to avoid problems if the `req` interface doesn't handle other types.
      const timeout = parseInt(config.timeout, 10);

      if (isNaN(timeout)) {
        reject(new AxiosError(
          'error trying to parse `config.timeout` to int',
          AxiosError.ERR_BAD_OPTION_VALUE,
          config,
          req
        ));

        return;
      }

      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devouring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(timeout, function handleRequestTimeout() {
        if (isDone) return;
        let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
        const transitional = config.transitional || transitionalDefaults;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(new AxiosError(
          timeoutErrorMessage,
          transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
          config,
          req
        ));
        abort();
      });
    }


    // Send the request
    if (utils.isStream(data)) {
      let ended = false;
      let errored = false;

      data.on('end', () => {
        ended = true;
      });

      data.once('error', err => {
        errored = true;
        req.destroy(err);
      });

      data.on('close', () => {
        if (!ended && !errored) {
          abort(new CanceledError('Request stream has been aborted', config, req));
        }
      });

      data.pipe(req);
    } else {
      req.end(data);
    }
  });
};

var cookies = platform.isStandardBrowserEnv ?

// Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        const cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

// Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })();

var isURLSameOrigin = platform.isStandardBrowserEnv ?

// Standard browser envs have full support of the APIs needed to test
// whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    const msie = /(msie|trident)/i.test(navigator.userAgent);
    const urlParsingNode = document.createElement('a');
    let originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      let href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
          urlParsingNode.pathname :
          '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      const parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
          parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })();

function progressEventReducer(listener, isDownloadStream) {
  let bytesNotified = 0;
  const _speedometer = speedometer(50, 250);

  return e => {
    const loaded = e.loaded;
    const total = e.lengthComputable ? e.total : undefined;
    const progressBytes = loaded - bytesNotified;
    const rate = _speedometer(progressBytes);
    const inRange = loaded <= total;

    bytesNotified = loaded;

    const data = {
      loaded,
      total,
      progress: total ? (loaded / total) : undefined,
      bytes: progressBytes,
      rate: rate ? rate : undefined,
      estimated: rate && total && inRange ? (total - loaded) / rate : undefined,
      event: e
    };

    data[isDownloadStream ? 'download' : 'upload'] = true;

    listener(data);
  };
}

const isXHRAdapterSupported = typeof XMLHttpRequest !== 'undefined';

var xhrAdapter = isXHRAdapterSupported && function (config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    let requestData = config.data;
    const requestHeaders = AxiosHeaders$1.from(config.headers).normalize();
    const responseType = config.responseType;
    let onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      if (platform.isStandardBrowserEnv || platform.isStandardBrowserWebWorkerEnv) {
        requestHeaders.setContentType(false); // Let the browser set it
      } else {
        requestHeaders.setContentType('multipart/form-data;', false); // mobile/desktop app frameworks
      }
    }

    let request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      const username = config.auth.username || '';
      const password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.set('Authorization', 'Basic ' + btoa(username + ':' + password));
    }

    const fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      const responseHeaders = AxiosHeaders$1.from(
        'getAllResponseHeaders' in request && request.getAllResponseHeaders()
      );
      const responseData = !responseType || responseType === 'text' || responseType === 'json' ?
        request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config,
        request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      let timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      const transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (platform.isStandardBrowserEnv) {
      // Add xsrf header
      const xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath))
        && config.xsrfCookieName && cookies.read(config.xsrfCookieName);

      if (xsrfValue) {
        requestHeaders.set(config.xsrfHeaderName, xsrfValue);
      }
    }

    // Remove Content-Type if data is undefined
    requestData === undefined && requestHeaders.setContentType(null);

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
        request.setRequestHeader(key, val);
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', progressEventReducer(config.onDownloadProgress, true));
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', progressEventReducer(config.onUploadProgress));
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = cancel => {
        if (!request) {
          return;
        }
        reject(!cancel || cancel.type ? new CanceledError(null, config, request) : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    const protocol = parseProtocol(fullPath);

    if (protocol && platform.protocols.indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData || null);
  });
};

const knownAdapters = {
  http: httpAdapter,
  xhr: xhrAdapter
};

utils.forEach(knownAdapters, (fn, value) => {
  if(fn) {
    try {
      Object.defineProperty(fn, 'name', {value});
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
    Object.defineProperty(fn, 'adapterName', {value});
  }
});

var adapters = {
  getAdapter: (adapters) => {
    adapters = utils.isArray(adapters) ? adapters : [adapters];

    const {length} = adapters;
    let nameOrAdapter;
    let adapter;

    for (let i = 0; i < length; i++) {
      nameOrAdapter = adapters[i];
      if((adapter = utils.isString(nameOrAdapter) ? knownAdapters[nameOrAdapter.toLowerCase()] : nameOrAdapter)) {
        break;
      }
    }

    if (!adapter) {
      if (adapter === false) {
        throw new AxiosError(
          `Adapter ${nameOrAdapter} is not supported by the environment`,
          'ERR_NOT_SUPPORT'
        );
      }

      throw new Error(
        utils.hasOwnProp(knownAdapters, nameOrAdapter) ?
          `Adapter '${nameOrAdapter}' is not available in the build` :
          `Unknown adapter '${nameOrAdapter}'`
      );
    }

    if (!utils.isFunction(adapter)) {
      throw new TypeError('adapter is not a function');
    }

    return adapter;
  },
  adapters: knownAdapters
};

/**
 * Throws a `CanceledError` if cancellation has been requested.
 *
 * @param {Object} config The config that is to be used for the request
 *
 * @returns {void}
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError(null, config);
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 *
 * @returns {Promise} The Promise to be fulfilled
 */
function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = AxiosHeaders$1.from(config.headers);

  // Transform request data
  config.data = transformData.call(
    config,
    config.transformRequest
  );

  if (['post', 'put', 'patch'].indexOf(config.method) !== -1) {
    config.headers.setContentType('application/x-www-form-urlencoded', false);
  }

  const adapter = adapters.getAdapter(config.adapter || defaults$1.adapter);

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      config.transformResponse,
      response
    );

    response.headers = AxiosHeaders$1.from(response.headers);

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          config.transformResponse,
          reason.response
        );
        reason.response.headers = AxiosHeaders$1.from(reason.response.headers);
      }
    }

    return Promise.reject(reason);
  });
}

const headersToObject = (thing) => thing instanceof AxiosHeaders$1 ? thing.toJSON() : thing;

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 *
 * @returns {Object} New object resulting from merging config2 to config1
 */
function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  const config = {};

  function getMergedValue(target, source, caseless) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge.call({caseless}, target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(a, b, caseless) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(a, b, caseless);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a, caseless);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(a, b) {
    if (!utils.isUndefined(b)) {
      return getMergedValue(undefined, b);
    } else if (!utils.isUndefined(a)) {
      return getMergedValue(undefined, a);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(a, b, prop) {
    if (prop in config2) {
      return getMergedValue(a, b);
    } else if (prop in config1) {
      return getMergedValue(undefined, a);
    }
  }

  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b) => mergeDeepProperties(headersToObject(a), headersToObject(b), true)
  };

  utils.forEach(Object.keys(Object.assign({}, config1, config2)), function computeConfigValue(prop) {
    const merge = mergeMap[prop] || mergeDeepProperties;
    const configValue = merge(config1[prop], config2[prop], prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
}

const validators$1 = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((type, i) => {
  validators$1[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

const deprecatedWarnings = {};

/**
 * Transitional option validator
 *
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 *
 * @returns {function}
 */
validators$1.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return (value, opt, opts) => {
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 *
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 *
 * @returns {object}
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = schema[opt];
    if (validator) {
      const value = options[opt];
      const result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}

var validator = {
  assertOptions,
  validators: validators$1
};

const validators = validator.validators;

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 *
 * @return {Axios} A new instance of Axios
 */
class Axios {
  constructor(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager$1(),
      response: new InterceptorManager$1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    config = mergeConfig(this.defaults, config);

    const {transitional, paramsSerializer, headers} = config;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    if (paramsSerializer != null) {
      if (utils.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }

    // Set config.method
    config.method = (config.method || this.defaults.method || 'get').toLowerCase();

    let contextHeaders;

    // Flatten headers
    contextHeaders = headers && utils.merge(
      headers.common,
      headers[config.method]
    );

    contextHeaders && utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      (method) => {
        delete headers[method];
      }
    );

    config.headers = AxiosHeaders$1.concat(contextHeaders, headers);

    // filter out skipped interceptors
    const requestInterceptorChain = [];
    let synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    const responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    let promise;
    let i = 0;
    let len;

    if (!synchronousRequestInterceptors) {
      const chain = [dispatchRequest.bind(this), undefined];
      chain.unshift.apply(chain, requestInterceptorChain);
      chain.push.apply(chain, responseInterceptorChain);
      len = chain.length;

      promise = Promise.resolve(config);

      while (i < len) {
        promise = promise.then(chain[i++], chain[i++]);
      }

      return promise;
    }

    len = requestInterceptorChain.length;

    let newConfig = config;

    i = 0;

    while (i < len) {
      const onFulfilled = requestInterceptorChain[i++];
      const onRejected = requestInterceptorChain[i++];
      try {
        newConfig = onFulfilled(newConfig);
      } catch (error) {
        onRejected.call(this, error);
        break;
      }
    }

    try {
      promise = dispatchRequest.call(this, newConfig);
    } catch (error) {
      return Promise.reject(error);
    }

    i = 0;
    len = responseInterceptorChain.length;

    while (i < len) {
      promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
    }

    return promise;
  }

  getUri(config) {
    config = mergeConfig(this.defaults, config);
    const fullPath = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  }
}

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method,
      url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url,
        data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

var Axios$1 = Axios;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @param {Function} executor The executor function.
 *
 * @returns {CancelToken}
 */
class CancelToken {
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    let resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    const token = this;

    // eslint-disable-next-line func-names
    this.promise.then(cancel => {
      if (!token._listeners) return;

      let i = token._listeners.length;

      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = onfulfilled => {
      let _resolve;
      // eslint-disable-next-line func-names
      const promise = new Promise(resolve => {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message, config, request) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new CanceledError(message, config, request);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  }

  /**
   * Subscribe to the cancel signal
   */

  subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  }

  /**
   * Unsubscribe from the cancel signal
   */

  unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let cancel;
    const token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token,
      cancel
    };
  }
}

var CancelToken$1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 *
 * @returns {Function}
 */
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 *
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
}

const HttpStatusCode = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};

Object.entries(HttpStatusCode).forEach(([key, value]) => {
  HttpStatusCode[value] = key;
});

var HttpStatusCode$1 = HttpStatusCode;

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 *
 * @returns {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  const context = new Axios$1(defaultConfig);
  const instance = bind(Axios$1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios$1.prototype, context, {allOwnKeys: true});

  // Copy context to instance
  utils.extend(instance, context, null, {allOwnKeys: true});

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
const axios = createInstance(defaults$1);

// Expose Axios class to allow class inheritance
axios.Axios = Axios$1;

// Expose Cancel & CancelToken
axios.CanceledError = CanceledError;
axios.CancelToken = CancelToken$1;
axios.isCancel = isCancel;
axios.VERSION = VERSION;
axios.toFormData = toFormData;

// Expose AxiosError class
axios.AxiosError = AxiosError;

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = spread;

// Expose isAxiosError
axios.isAxiosError = isAxiosError;

// Expose mergeConfig
axios.mergeConfig = mergeConfig;

axios.AxiosHeaders = AxiosHeaders$1;

axios.formToJSON = thing => formDataToJSON(utils.isHTMLForm(thing) ? new FormData(thing) : thing);

axios.HttpStatusCode = HttpStatusCode$1;

axios.default = axios;

// this module should only have a default export
var axios$1 = axios;

var getFloorMain = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios$1.get("https://c8fb3182-0df7-4b6d-8c42-d11075e15f05.mock.pstmn.io/get_all?floor_number=1")];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };

var DEFAULT_WAI_ARIA_ATTRIBUTE = {
    'aria-busy': true,
    role: 'status',
};

var __assign$x = (undefined && undefined.__assign) || function () {
    __assign$x = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$x.apply(this, arguments);
};

var __assign$w = (undefined && undefined.__assign) || function () {
    __assign$w = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$w.apply(this, arguments);
};

var __assign$v = (undefined && undefined.__assign) || function () {
    __assign$v = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$v.apply(this, arguments);
};

var __assign$u = (undefined && undefined.__assign) || function () {
    __assign$u = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$u.apply(this, arguments);
};

var __assign$t = (undefined && undefined.__assign) || function () {
    __assign$t = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$t.apply(this, arguments);
};

var __assign$s = (undefined && undefined.__assign) || function () {
    __assign$s = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$s.apply(this, arguments);
};

var __assign$r = (undefined && undefined.__assign) || function () {
    __assign$r = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$r.apply(this, arguments);
};

var reactIs$2 = {exports: {}};

var reactIs_development$1 = {};

/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_development$1;

function requireReactIs_development$1 () {
	if (hasRequiredReactIs_development$1) return reactIs_development$1;
	hasRequiredReactIs_development$1 = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	// ATTENTION
	// When adding new symbols to this file,
	// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
	// The Symbol used to tag the ReactElement-like types.
	var REACT_ELEMENT_TYPE = Symbol.for('react.element');
	var REACT_PORTAL_TYPE = Symbol.for('react.portal');
	var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
	var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
	var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
	var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
	var REACT_CONTEXT_TYPE = Symbol.for('react.context');
	var REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');
	var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
	var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
	var REACT_MEMO_TYPE = Symbol.for('react.memo');
	var REACT_LAZY_TYPE = Symbol.for('react.lazy');
	var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');

	// -----------------------------------------------------------------------------

	var enableScopeAPI = false; // Experimental Create Event Handle API.
	var enableCacheElement = false;
	var enableTransitionTracing = false; // No known bugs, but needs performance testing

	var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
	// stuff. Intended to enable React core members to more easily debug scheduling
	// issues in DEV builds.

	var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

	var REACT_MODULE_REFERENCE;

	{
	  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
	}

	function isValidElementType(type) {
	  if (typeof type === 'string' || typeof type === 'function') {
	    return true;
	  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


	  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
	    return true;
	  }

	  if (typeof type === 'object' && type !== null) {
	    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
	    // types supported by any Flight configuration anywhere since
	    // we don't know which Flight build this will end up being used
	    // with.
	    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
	      return true;
	    }
	  }

	  return false;
	}

	function typeOf(object) {
	  if (typeof object === 'object' && object !== null) {
	    var $$typeof = object.$$typeof;

	    switch ($$typeof) {
	      case REACT_ELEMENT_TYPE:
	        var type = object.type;

	        switch (type) {
	          case REACT_FRAGMENT_TYPE:
	          case REACT_PROFILER_TYPE:
	          case REACT_STRICT_MODE_TYPE:
	          case REACT_SUSPENSE_TYPE:
	          case REACT_SUSPENSE_LIST_TYPE:
	            return type;

	          default:
	            var $$typeofType = type && type.$$typeof;

	            switch ($$typeofType) {
	              case REACT_SERVER_CONTEXT_TYPE:
	              case REACT_CONTEXT_TYPE:
	              case REACT_FORWARD_REF_TYPE:
	              case REACT_LAZY_TYPE:
	              case REACT_MEMO_TYPE:
	              case REACT_PROVIDER_TYPE:
	                return $$typeofType;

	              default:
	                return $$typeof;
	            }

	        }

	      case REACT_PORTAL_TYPE:
	        return $$typeof;
	    }
	  }

	  return undefined;
	}
	var ContextConsumer = REACT_CONTEXT_TYPE;
	var ContextProvider = REACT_PROVIDER_TYPE;
	var Element = REACT_ELEMENT_TYPE;
	var ForwardRef = REACT_FORWARD_REF_TYPE;
	var Fragment = REACT_FRAGMENT_TYPE;
	var Lazy = REACT_LAZY_TYPE;
	var Memo = REACT_MEMO_TYPE;
	var Portal = REACT_PORTAL_TYPE;
	var Profiler = REACT_PROFILER_TYPE;
	var StrictMode = REACT_STRICT_MODE_TYPE;
	var Suspense = REACT_SUSPENSE_TYPE;
	var SuspenseList = REACT_SUSPENSE_LIST_TYPE;
	var hasWarnedAboutDeprecatedIsAsyncMode = false;
	var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

	function isAsyncMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
	      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

	      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
	    }
	  }

	  return false;
	}
	function isConcurrentMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
	      hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

	      console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
	    }
	  }

	  return false;
	}
	function isContextConsumer(object) {
	  return typeOf(object) === REACT_CONTEXT_TYPE;
	}
	function isContextProvider(object) {
	  return typeOf(object) === REACT_PROVIDER_TYPE;
	}
	function isElement(object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function isForwardRef(object) {
	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
	}
	function isFragment(object) {
	  return typeOf(object) === REACT_FRAGMENT_TYPE;
	}
	function isLazy(object) {
	  return typeOf(object) === REACT_LAZY_TYPE;
	}
	function isMemo(object) {
	  return typeOf(object) === REACT_MEMO_TYPE;
	}
	function isPortal(object) {
	  return typeOf(object) === REACT_PORTAL_TYPE;
	}
	function isProfiler(object) {
	  return typeOf(object) === REACT_PROFILER_TYPE;
	}
	function isStrictMode(object) {
	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
	}
	function isSuspense(object) {
	  return typeOf(object) === REACT_SUSPENSE_TYPE;
	}
	function isSuspenseList(object) {
	  return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
	}

	reactIs_development$1.ContextConsumer = ContextConsumer;
	reactIs_development$1.ContextProvider = ContextProvider;
	reactIs_development$1.Element = Element;
	reactIs_development$1.ForwardRef = ForwardRef;
	reactIs_development$1.Fragment = Fragment;
	reactIs_development$1.Lazy = Lazy;
	reactIs_development$1.Memo = Memo;
	reactIs_development$1.Portal = Portal;
	reactIs_development$1.Profiler = Profiler;
	reactIs_development$1.StrictMode = StrictMode;
	reactIs_development$1.Suspense = Suspense;
	reactIs_development$1.SuspenseList = SuspenseList;
	reactIs_development$1.isAsyncMode = isAsyncMode;
	reactIs_development$1.isConcurrentMode = isConcurrentMode;
	reactIs_development$1.isContextConsumer = isContextConsumer;
	reactIs_development$1.isContextProvider = isContextProvider;
	reactIs_development$1.isElement = isElement;
	reactIs_development$1.isForwardRef = isForwardRef;
	reactIs_development$1.isFragment = isFragment;
	reactIs_development$1.isLazy = isLazy;
	reactIs_development$1.isMemo = isMemo;
	reactIs_development$1.isPortal = isPortal;
	reactIs_development$1.isProfiler = isProfiler;
	reactIs_development$1.isStrictMode = isStrictMode;
	reactIs_development$1.isSuspense = isSuspense;
	reactIs_development$1.isSuspenseList = isSuspenseList;
	reactIs_development$1.isValidElementType = isValidElementType;
	reactIs_development$1.typeOf = typeOf;
	  })();
	}
	return reactIs_development$1;
}

var reactIs_production_min$1 = {};

/**
 * @license React
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_production_min$1;

function requireReactIs_production_min$1 () {
	if (hasRequiredReactIs_production_min$1) return reactIs_production_min$1;
	hasRequiredReactIs_production_min$1 = 1;
var b=Symbol.for("react.element"),c=Symbol.for("react.portal"),d=Symbol.for("react.fragment"),e=Symbol.for("react.strict_mode"),f=Symbol.for("react.profiler"),g=Symbol.for("react.provider"),h=Symbol.for("react.context"),k=Symbol.for("react.server_context"),l=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),n=Symbol.for("react.suspense_list"),p=Symbol.for("react.memo"),q=Symbol.for("react.lazy"),t=Symbol.for("react.offscreen"),u;u=Symbol.for("react.module.reference");
	function v(a){if("object"===typeof a&&null!==a){var r=a.$$typeof;switch(r){case b:switch(a=a.type,a){case d:case f:case e:case m:case n:return a;default:switch(a=a&&a.$$typeof,a){case k:case h:case l:case q:case p:case g:return a;default:return r}}case c:return r}}}reactIs_production_min$1.ContextConsumer=h;reactIs_production_min$1.ContextProvider=g;reactIs_production_min$1.Element=b;reactIs_production_min$1.ForwardRef=l;reactIs_production_min$1.Fragment=d;reactIs_production_min$1.Lazy=q;reactIs_production_min$1.Memo=p;reactIs_production_min$1.Portal=c;reactIs_production_min$1.Profiler=f;reactIs_production_min$1.StrictMode=e;reactIs_production_min$1.Suspense=m;
	reactIs_production_min$1.SuspenseList=n;reactIs_production_min$1.isAsyncMode=function(){return !1};reactIs_production_min$1.isConcurrentMode=function(){return !1};reactIs_production_min$1.isContextConsumer=function(a){return v(a)===h};reactIs_production_min$1.isContextProvider=function(a){return v(a)===g};reactIs_production_min$1.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===b};reactIs_production_min$1.isForwardRef=function(a){return v(a)===l};reactIs_production_min$1.isFragment=function(a){return v(a)===d};reactIs_production_min$1.isLazy=function(a){return v(a)===q};reactIs_production_min$1.isMemo=function(a){return v(a)===p};
	reactIs_production_min$1.isPortal=function(a){return v(a)===c};reactIs_production_min$1.isProfiler=function(a){return v(a)===f};reactIs_production_min$1.isStrictMode=function(a){return v(a)===e};reactIs_production_min$1.isSuspense=function(a){return v(a)===m};reactIs_production_min$1.isSuspenseList=function(a){return v(a)===n};
	reactIs_production_min$1.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===d||a===f||a===e||a===m||a===n||a===t||"object"===typeof a&&null!==a&&(a.$$typeof===q||a.$$typeof===p||a.$$typeof===g||a.$$typeof===h||a.$$typeof===l||a.$$typeof===u||void 0!==a.getModuleId)?!0:!1};reactIs_production_min$1.typeOf=v;
	return reactIs_production_min$1;
}

if (process.env.NODE_ENV === 'production') {
  reactIs$2.exports = requireReactIs_production_min$1();
} else {
  reactIs$2.exports = requireReactIs_development$1();
}

var reactIsExports$1 = reactIs$2.exports;

function stylis_min (W) {
  function M(d, c, e, h, a) {
    for (var m = 0, b = 0, v = 0, n = 0, q, g, x = 0, K = 0, k, u = k = q = 0, l = 0, r = 0, I = 0, t = 0, B = e.length, J = B - 1, y, f = '', p = '', F = '', G = '', C; l < B;) {
      g = e.charCodeAt(l);
      l === J && 0 !== b + n + v + m && (0 !== b && (g = 47 === b ? 10 : 47), n = v = m = 0, B++, J++);

      if (0 === b + n + v + m) {
        if (l === J && (0 < r && (f = f.replace(N, '')), 0 < f.trim().length)) {
          switch (g) {
            case 32:
            case 9:
            case 59:
            case 13:
            case 10:
              break;

            default:
              f += e.charAt(l);
          }

          g = 59;
        }

        switch (g) {
          case 123:
            f = f.trim();
            q = f.charCodeAt(0);
            k = 1;

            for (t = ++l; l < B;) {
              switch (g = e.charCodeAt(l)) {
                case 123:
                  k++;
                  break;

                case 125:
                  k--;
                  break;

                case 47:
                  switch (g = e.charCodeAt(l + 1)) {
                    case 42:
                    case 47:
                      a: {
                        for (u = l + 1; u < J; ++u) {
                          switch (e.charCodeAt(u)) {
                            case 47:
                              if (42 === g && 42 === e.charCodeAt(u - 1) && l + 2 !== u) {
                                l = u + 1;
                                break a;
                              }

                              break;

                            case 10:
                              if (47 === g) {
                                l = u + 1;
                                break a;
                              }

                          }
                        }

                        l = u;
                      }

                  }

                  break;

                case 91:
                  g++;

                case 40:
                  g++;

                case 34:
                case 39:
                  for (; l++ < J && e.charCodeAt(l) !== g;) {
                  }

              }

              if (0 === k) break;
              l++;
            }

            k = e.substring(t, l);
            0 === q && (q = (f = f.replace(ca, '').trim()).charCodeAt(0));

            switch (q) {
              case 64:
                0 < r && (f = f.replace(N, ''));
                g = f.charCodeAt(1);

                switch (g) {
                  case 100:
                  case 109:
                  case 115:
                  case 45:
                    r = c;
                    break;

                  default:
                    r = O;
                }

                k = M(c, r, k, g, a + 1);
                t = k.length;
                0 < A && (r = X(O, f, I), C = H(3, k, r, c, D, z, t, g, a, h), f = r.join(''), void 0 !== C && 0 === (t = (k = C.trim()).length) && (g = 0, k = ''));
                if (0 < t) switch (g) {
                  case 115:
                    f = f.replace(da, ea);

                  case 100:
                  case 109:
                  case 45:
                    k = f + '{' + k + '}';
                    break;

                  case 107:
                    f = f.replace(fa, '$1 $2');
                    k = f + '{' + k + '}';
                    k = 1 === w || 2 === w && L('@' + k, 3) ? '@-webkit-' + k + '@' + k : '@' + k;
                    break;

                  default:
                    k = f + k, 112 === h && (k = (p += k, ''));
                } else k = '';
                break;

              default:
                k = M(c, X(c, f, I), k, h, a + 1);
            }

            F += k;
            k = I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
            break;

          case 125:
          case 59:
            f = (0 < r ? f.replace(N, '') : f).trim();
            if (1 < (t = f.length)) switch (0 === u && (q = f.charCodeAt(0), 45 === q || 96 < q && 123 > q) && (t = (f = f.replace(' ', ':')).length), 0 < A && void 0 !== (C = H(1, f, c, d, D, z, p.length, h, a, h)) && 0 === (t = (f = C.trim()).length) && (f = '\x00\x00'), q = f.charCodeAt(0), g = f.charCodeAt(1), q) {
              case 0:
                break;

              case 64:
                if (105 === g || 99 === g) {
                  G += f + e.charAt(l);
                  break;
                }

              default:
                58 !== f.charCodeAt(t - 1) && (p += P(f, q, g, f.charCodeAt(2)));
            }
            I = r = u = q = 0;
            f = '';
            g = e.charCodeAt(++l);
        }
      }

      switch (g) {
        case 13:
        case 10:
          47 === b ? b = 0 : 0 === 1 + q && 107 !== h && 0 < f.length && (r = 1, f += '\x00');
          0 < A * Y && H(0, f, c, d, D, z, p.length, h, a, h);
          z = 1;
          D++;
          break;

        case 59:
        case 125:
          if (0 === b + n + v + m) {
            z++;
            break;
          }

        default:
          z++;
          y = e.charAt(l);

          switch (g) {
            case 9:
            case 32:
              if (0 === n + m + b) switch (x) {
                case 44:
                case 58:
                case 9:
                case 32:
                  y = '';
                  break;

                default:
                  32 !== g && (y = ' ');
              }
              break;

            case 0:
              y = '\\0';
              break;

            case 12:
              y = '\\f';
              break;

            case 11:
              y = '\\v';
              break;

            case 38:
              0 === n + b + m && (r = I = 1, y = '\f' + y);
              break;

            case 108:
              if (0 === n + b + m + E && 0 < u) switch (l - u) {
                case 2:
                  112 === x && 58 === e.charCodeAt(l - 3) && (E = x);

                case 8:
                  111 === K && (E = K);
              }
              break;

            case 58:
              0 === n + b + m && (u = l);
              break;

            case 44:
              0 === b + v + n + m && (r = 1, y += '\r');
              break;

            case 34:
            case 39:
              0 === b && (n = n === g ? 0 : 0 === n ? g : n);
              break;

            case 91:
              0 === n + b + v && m++;
              break;

            case 93:
              0 === n + b + v && m--;
              break;

            case 41:
              0 === n + b + m && v--;
              break;

            case 40:
              if (0 === n + b + m) {
                if (0 === q) switch (2 * x + 3 * K) {
                  case 533:
                    break;

                  default:
                    q = 1;
                }
                v++;
              }

              break;

            case 64:
              0 === b + v + n + m + u + k && (k = 1);
              break;

            case 42:
            case 47:
              if (!(0 < n + m + v)) switch (b) {
                case 0:
                  switch (2 * g + 3 * e.charCodeAt(l + 1)) {
                    case 235:
                      b = 47;
                      break;

                    case 220:
                      t = l, b = 42;
                  }

                  break;

                case 42:
                  47 === g && 42 === x && t + 2 !== l && (33 === e.charCodeAt(t + 2) && (p += e.substring(t, l + 1)), y = '', b = 0);
              }
          }

          0 === b && (f += y);
      }

      K = x;
      x = g;
      l++;
    }

    t = p.length;

    if (0 < t) {
      r = c;
      if (0 < A && (C = H(2, p, r, d, D, z, t, h, a, h), void 0 !== C && 0 === (p = C).length)) return G + p + F;
      p = r.join(',') + '{' + p + '}';

      if (0 !== w * E) {
        2 !== w || L(p, 2) || (E = 0);

        switch (E) {
          case 111:
            p = p.replace(ha, ':-moz-$1') + p;
            break;

          case 112:
            p = p.replace(Q, '::-webkit-input-$1') + p.replace(Q, '::-moz-$1') + p.replace(Q, ':-ms-input-$1') + p;
        }

        E = 0;
      }
    }

    return G + p + F;
  }

  function X(d, c, e) {
    var h = c.trim().split(ia);
    c = h;
    var a = h.length,
        m = d.length;

    switch (m) {
      case 0:
      case 1:
        var b = 0;

        for (d = 0 === m ? '' : d[0] + ' '; b < a; ++b) {
          c[b] = Z(d, c[b], e).trim();
        }

        break;

      default:
        var v = b = 0;

        for (c = []; b < a; ++b) {
          for (var n = 0; n < m; ++n) {
            c[v++] = Z(d[n] + ' ', h[b], e).trim();
          }
        }

    }

    return c;
  }

  function Z(d, c, e) {
    var h = c.charCodeAt(0);
    33 > h && (h = (c = c.trim()).charCodeAt(0));

    switch (h) {
      case 38:
        return c.replace(F, '$1' + d.trim());

      case 58:
        return d.trim() + c.replace(F, '$1' + d.trim());

      default:
        if (0 < 1 * e && 0 < c.indexOf('\f')) return c.replace(F, (58 === d.charCodeAt(0) ? '' : '$1') + d.trim());
    }

    return d + c;
  }

  function P(d, c, e, h) {
    var a = d + ';',
        m = 2 * c + 3 * e + 4 * h;

    if (944 === m) {
      d = a.indexOf(':', 9) + 1;
      var b = a.substring(d, a.length - 1).trim();
      b = a.substring(0, d).trim() + b + ';';
      return 1 === w || 2 === w && L(b, 1) ? '-webkit-' + b + b : b;
    }

    if (0 === w || 2 === w && !L(a, 1)) return a;

    switch (m) {
      case 1015:
        return 97 === a.charCodeAt(10) ? '-webkit-' + a + a : a;

      case 951:
        return 116 === a.charCodeAt(3) ? '-webkit-' + a + a : a;

      case 963:
        return 110 === a.charCodeAt(5) ? '-webkit-' + a + a : a;

      case 1009:
        if (100 !== a.charCodeAt(4)) break;

      case 969:
      case 942:
        return '-webkit-' + a + a;

      case 978:
        return '-webkit-' + a + '-moz-' + a + a;

      case 1019:
      case 983:
        return '-webkit-' + a + '-moz-' + a + '-ms-' + a + a;

      case 883:
        if (45 === a.charCodeAt(8)) return '-webkit-' + a + a;
        if (0 < a.indexOf('image-set(', 11)) return a.replace(ja, '$1-webkit-$2') + a;
        break;

      case 932:
        if (45 === a.charCodeAt(4)) switch (a.charCodeAt(5)) {
          case 103:
            return '-webkit-box-' + a.replace('-grow', '') + '-webkit-' + a + '-ms-' + a.replace('grow', 'positive') + a;

          case 115:
            return '-webkit-' + a + '-ms-' + a.replace('shrink', 'negative') + a;

          case 98:
            return '-webkit-' + a + '-ms-' + a.replace('basis', 'preferred-size') + a;
        }
        return '-webkit-' + a + '-ms-' + a + a;

      case 964:
        return '-webkit-' + a + '-ms-flex-' + a + a;

      case 1023:
        if (99 !== a.charCodeAt(8)) break;
        b = a.substring(a.indexOf(':', 15)).replace('flex-', '').replace('space-between', 'justify');
        return '-webkit-box-pack' + b + '-webkit-' + a + '-ms-flex-pack' + b + a;

      case 1005:
        return ka.test(a) ? a.replace(aa, ':-webkit-') + a.replace(aa, ':-moz-') + a : a;

      case 1e3:
        b = a.substring(13).trim();
        c = b.indexOf('-') + 1;

        switch (b.charCodeAt(0) + b.charCodeAt(c)) {
          case 226:
            b = a.replace(G, 'tb');
            break;

          case 232:
            b = a.replace(G, 'tb-rl');
            break;

          case 220:
            b = a.replace(G, 'lr');
            break;

          default:
            return a;
        }

        return '-webkit-' + a + '-ms-' + b + a;

      case 1017:
        if (-1 === a.indexOf('sticky', 9)) break;

      case 975:
        c = (a = d).length - 10;
        b = (33 === a.charCodeAt(c) ? a.substring(0, c) : a).substring(d.indexOf(':', 7) + 1).trim();

        switch (m = b.charCodeAt(0) + (b.charCodeAt(7) | 0)) {
          case 203:
            if (111 > b.charCodeAt(8)) break;

          case 115:
            a = a.replace(b, '-webkit-' + b) + ';' + a;
            break;

          case 207:
          case 102:
            a = a.replace(b, '-webkit-' + (102 < m ? 'inline-' : '') + 'box') + ';' + a.replace(b, '-webkit-' + b) + ';' + a.replace(b, '-ms-' + b + 'box') + ';' + a;
        }

        return a + ';';

      case 938:
        if (45 === a.charCodeAt(5)) switch (a.charCodeAt(6)) {
          case 105:
            return b = a.replace('-items', ''), '-webkit-' + a + '-webkit-box-' + b + '-ms-flex-' + b + a;

          case 115:
            return '-webkit-' + a + '-ms-flex-item-' + a.replace(ba, '') + a;

          default:
            return '-webkit-' + a + '-ms-flex-line-pack' + a.replace('align-content', '').replace(ba, '') + a;
        }
        break;

      case 973:
      case 989:
        if (45 !== a.charCodeAt(3) || 122 === a.charCodeAt(4)) break;

      case 931:
      case 953:
        if (!0 === la.test(d)) return 115 === (b = d.substring(d.indexOf(':') + 1)).charCodeAt(0) ? P(d.replace('stretch', 'fill-available'), c, e, h).replace(':fill-available', ':stretch') : a.replace(b, '-webkit-' + b) + a.replace(b, '-moz-' + b.replace('fill-', '')) + a;
        break;

      case 962:
        if (a = '-webkit-' + a + (102 === a.charCodeAt(5) ? '-ms-' + a : '') + a, 211 === e + h && 105 === a.charCodeAt(13) && 0 < a.indexOf('transform', 10)) return a.substring(0, a.indexOf(';', 27) + 1).replace(ma, '$1-webkit-$2') + a;
    }

    return a;
  }

  function L(d, c) {
    var e = d.indexOf(1 === c ? ':' : '{'),
        h = d.substring(0, 3 !== c ? e : 10);
    e = d.substring(e + 1, d.length - 1);
    return R(2 !== c ? h : h.replace(na, '$1'), e, c);
  }

  function ea(d, c) {
    var e = P(c, c.charCodeAt(0), c.charCodeAt(1), c.charCodeAt(2));
    return e !== c + ';' ? e.replace(oa, ' or ($1)').substring(4) : '(' + c + ')';
  }

  function H(d, c, e, h, a, m, b, v, n, q) {
    for (var g = 0, x = c, w; g < A; ++g) {
      switch (w = S[g].call(B, d, x, e, h, a, m, b, v, n, q)) {
        case void 0:
        case !1:
        case !0:
        case null:
          break;

        default:
          x = w;
      }
    }

    if (x !== c) return x;
  }

  function T(d) {
    switch (d) {
      case void 0:
      case null:
        A = S.length = 0;
        break;

      default:
        if ('function' === typeof d) S[A++] = d;else if ('object' === typeof d) for (var c = 0, e = d.length; c < e; ++c) {
          T(d[c]);
        } else Y = !!d | 0;
    }

    return T;
  }

  function U(d) {
    d = d.prefix;
    void 0 !== d && (R = null, d ? 'function' !== typeof d ? w = 1 : (w = 2, R = d) : w = 0);
    return U;
  }

  function B(d, c) {
    var e = d;
    33 > e.charCodeAt(0) && (e = e.trim());
    V = e;
    e = [V];

    if (0 < A) {
      var h = H(-1, c, e, e, D, z, 0, 0, 0, 0);
      void 0 !== h && 'string' === typeof h && (c = h);
    }

    var a = M(O, e, c, 0, 0);
    0 < A && (h = H(-2, a, e, e, D, z, a.length, 0, 0, 0), void 0 !== h && (a = h));
    V = '';
    E = 0;
    z = D = 1;
    return a;
  }

  var ca = /^\0+/g,
      N = /[\0\r\f]/g,
      aa = /: */g,
      ka = /zoo|gra/,
      ma = /([,: ])(transform)/g,
      ia = /,\r+?/g,
      F = /([\t\r\n ])*\f?&/g,
      fa = /@(k\w+)\s*(\S*)\s*/,
      Q = /::(place)/g,
      ha = /:(read-only)/g,
      G = /[svh]\w+-[tblr]{2}/,
      da = /\(\s*(.*)\s*\)/g,
      oa = /([\s\S]*?);/g,
      ba = /-self|flex-/g,
      na = /[^]*?(:[rp][el]a[\w-]+)[^]*/,
      la = /stretch|:\s*\w+\-(?:conte|avail)/,
      ja = /([^-])(image-set\()/,
      z = 1,
      D = 1,
      E = 0,
      w = 1,
      O = [],
      S = [],
      A = 0,
      R = null,
      Y = 0,
      V = '';
  B.use = T;
  B.set = U;
  void 0 !== W && U(W);
  return B;
}

var unitlessKeys = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
};

function memoize$1(fn) {
  var cache = Object.create(null);
  return function (arg) {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

var reactPropsRegex = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|download|draggable|encType|enterKeyHint|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/; // https://esbench.com/bench/5bfee68a4cd7e6009ef61d23

var isPropValid = /* #__PURE__ */memoize$1(function (prop) {
  return reactPropsRegex.test(prop) || prop.charCodeAt(0) === 111
  /* o */
  && prop.charCodeAt(1) === 110
  /* n */
  && prop.charCodeAt(2) < 91;
}
/* Z+1 */
);

var reactIs$1 = {exports: {}};

var reactIs_development = {};

/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_development;

function requireReactIs_development () {
	if (hasRequiredReactIs_development) return reactIs_development;
	hasRequiredReactIs_development = 1;



	if (process.env.NODE_ENV !== "production") {
	  (function() {

	// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	var hasSymbol = typeof Symbol === 'function' && Symbol.for;
	var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
	var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
	var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
	var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
	var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
	var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
	var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
	// (unstable) APIs that have been removed. Can we remove the symbols?

	var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
	var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
	var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
	var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
	var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
	var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
	var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
	var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
	var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
	var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
	var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

	function isValidElementType(type) {
	  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
	  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
	}

	function typeOf(object) {
	  if (typeof object === 'object' && object !== null) {
	    var $$typeof = object.$$typeof;

	    switch ($$typeof) {
	      case REACT_ELEMENT_TYPE:
	        var type = object.type;

	        switch (type) {
	          case REACT_ASYNC_MODE_TYPE:
	          case REACT_CONCURRENT_MODE_TYPE:
	          case REACT_FRAGMENT_TYPE:
	          case REACT_PROFILER_TYPE:
	          case REACT_STRICT_MODE_TYPE:
	          case REACT_SUSPENSE_TYPE:
	            return type;

	          default:
	            var $$typeofType = type && type.$$typeof;

	            switch ($$typeofType) {
	              case REACT_CONTEXT_TYPE:
	              case REACT_FORWARD_REF_TYPE:
	              case REACT_LAZY_TYPE:
	              case REACT_MEMO_TYPE:
	              case REACT_PROVIDER_TYPE:
	                return $$typeofType;

	              default:
	                return $$typeof;
	            }

	        }

	      case REACT_PORTAL_TYPE:
	        return $$typeof;
	    }
	  }

	  return undefined;
	} // AsyncMode is deprecated along with isAsyncMode

	var AsyncMode = REACT_ASYNC_MODE_TYPE;
	var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
	var ContextConsumer = REACT_CONTEXT_TYPE;
	var ContextProvider = REACT_PROVIDER_TYPE;
	var Element = REACT_ELEMENT_TYPE;
	var ForwardRef = REACT_FORWARD_REF_TYPE;
	var Fragment = REACT_FRAGMENT_TYPE;
	var Lazy = REACT_LAZY_TYPE;
	var Memo = REACT_MEMO_TYPE;
	var Portal = REACT_PORTAL_TYPE;
	var Profiler = REACT_PROFILER_TYPE;
	var StrictMode = REACT_STRICT_MODE_TYPE;
	var Suspense = REACT_SUSPENSE_TYPE;
	var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

	function isAsyncMode(object) {
	  {
	    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
	      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

	      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
	    }
	  }

	  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
	}
	function isConcurrentMode(object) {
	  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
	}
	function isContextConsumer(object) {
	  return typeOf(object) === REACT_CONTEXT_TYPE;
	}
	function isContextProvider(object) {
	  return typeOf(object) === REACT_PROVIDER_TYPE;
	}
	function isElement(object) {
	  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function isForwardRef(object) {
	  return typeOf(object) === REACT_FORWARD_REF_TYPE;
	}
	function isFragment(object) {
	  return typeOf(object) === REACT_FRAGMENT_TYPE;
	}
	function isLazy(object) {
	  return typeOf(object) === REACT_LAZY_TYPE;
	}
	function isMemo(object) {
	  return typeOf(object) === REACT_MEMO_TYPE;
	}
	function isPortal(object) {
	  return typeOf(object) === REACT_PORTAL_TYPE;
	}
	function isProfiler(object) {
	  return typeOf(object) === REACT_PROFILER_TYPE;
	}
	function isStrictMode(object) {
	  return typeOf(object) === REACT_STRICT_MODE_TYPE;
	}
	function isSuspense(object) {
	  return typeOf(object) === REACT_SUSPENSE_TYPE;
	}

	reactIs_development.AsyncMode = AsyncMode;
	reactIs_development.ConcurrentMode = ConcurrentMode;
	reactIs_development.ContextConsumer = ContextConsumer;
	reactIs_development.ContextProvider = ContextProvider;
	reactIs_development.Element = Element;
	reactIs_development.ForwardRef = ForwardRef;
	reactIs_development.Fragment = Fragment;
	reactIs_development.Lazy = Lazy;
	reactIs_development.Memo = Memo;
	reactIs_development.Portal = Portal;
	reactIs_development.Profiler = Profiler;
	reactIs_development.StrictMode = StrictMode;
	reactIs_development.Suspense = Suspense;
	reactIs_development.isAsyncMode = isAsyncMode;
	reactIs_development.isConcurrentMode = isConcurrentMode;
	reactIs_development.isContextConsumer = isContextConsumer;
	reactIs_development.isContextProvider = isContextProvider;
	reactIs_development.isElement = isElement;
	reactIs_development.isForwardRef = isForwardRef;
	reactIs_development.isFragment = isFragment;
	reactIs_development.isLazy = isLazy;
	reactIs_development.isMemo = isMemo;
	reactIs_development.isPortal = isPortal;
	reactIs_development.isProfiler = isProfiler;
	reactIs_development.isStrictMode = isStrictMode;
	reactIs_development.isSuspense = isSuspense;
	reactIs_development.isValidElementType = isValidElementType;
	reactIs_development.typeOf = typeOf;
	  })();
	}
	return reactIs_development;
}

var reactIs_production_min = {};

/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactIs_production_min;

function requireReactIs_production_min () {
	if (hasRequiredReactIs_production_min) return reactIs_production_min;
	hasRequiredReactIs_production_min = 1;
var b="function"===typeof Symbol&&Symbol.for,c=b?Symbol.for("react.element"):60103,d=b?Symbol.for("react.portal"):60106,e=b?Symbol.for("react.fragment"):60107,f=b?Symbol.for("react.strict_mode"):60108,g=b?Symbol.for("react.profiler"):60114,h=b?Symbol.for("react.provider"):60109,k=b?Symbol.for("react.context"):60110,l=b?Symbol.for("react.async_mode"):60111,m=b?Symbol.for("react.concurrent_mode"):60111,n=b?Symbol.for("react.forward_ref"):60112,p=b?Symbol.for("react.suspense"):60113,q=b?
	Symbol.for("react.suspense_list"):60120,r=b?Symbol.for("react.memo"):60115,t=b?Symbol.for("react.lazy"):60116,v=b?Symbol.for("react.block"):60121,w=b?Symbol.for("react.fundamental"):60117,x=b?Symbol.for("react.responder"):60118,y=b?Symbol.for("react.scope"):60119;
	function z(a){if("object"===typeof a&&null!==a){var u=a.$$typeof;switch(u){case c:switch(a=a.type,a){case l:case m:case e:case g:case f:case p:return a;default:switch(a=a&&a.$$typeof,a){case k:case n:case t:case r:case h:return a;default:return u}}case d:return u}}}function A(a){return z(a)===m}reactIs_production_min.AsyncMode=l;reactIs_production_min.ConcurrentMode=m;reactIs_production_min.ContextConsumer=k;reactIs_production_min.ContextProvider=h;reactIs_production_min.Element=c;reactIs_production_min.ForwardRef=n;reactIs_production_min.Fragment=e;reactIs_production_min.Lazy=t;reactIs_production_min.Memo=r;reactIs_production_min.Portal=d;
	reactIs_production_min.Profiler=g;reactIs_production_min.StrictMode=f;reactIs_production_min.Suspense=p;reactIs_production_min.isAsyncMode=function(a){return A(a)||z(a)===l};reactIs_production_min.isConcurrentMode=A;reactIs_production_min.isContextConsumer=function(a){return z(a)===k};reactIs_production_min.isContextProvider=function(a){return z(a)===h};reactIs_production_min.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===c};reactIs_production_min.isForwardRef=function(a){return z(a)===n};reactIs_production_min.isFragment=function(a){return z(a)===e};reactIs_production_min.isLazy=function(a){return z(a)===t};
	reactIs_production_min.isMemo=function(a){return z(a)===r};reactIs_production_min.isPortal=function(a){return z(a)===d};reactIs_production_min.isProfiler=function(a){return z(a)===g};reactIs_production_min.isStrictMode=function(a){return z(a)===f};reactIs_production_min.isSuspense=function(a){return z(a)===p};
	reactIs_production_min.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===e||a===m||a===g||a===f||a===p||a===q||"object"===typeof a&&null!==a&&(a.$$typeof===t||a.$$typeof===r||a.$$typeof===h||a.$$typeof===k||a.$$typeof===n||a.$$typeof===w||a.$$typeof===x||a.$$typeof===y||a.$$typeof===v)};reactIs_production_min.typeOf=z;
	return reactIs_production_min;
}

if (process.env.NODE_ENV === 'production') {
  reactIs$1.exports = requireReactIs_production_min();
} else {
  reactIs$1.exports = requireReactIs_development();
}

var reactIsExports = reactIs$1.exports;

var reactIs = reactIsExports;

/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  '$$typeof': true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  '$$typeof': true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

function getStatics(component) {
  // React v16.11 and below
  if (reactIs.isMemo(component)) {
    return MEMO_STATICS;
  } // React v16.12 and above


  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}

var defineProperty$2 = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== 'string') {
    // don't hoist over string (html) components
    if (objectPrototype) {
      var inheritedComponent = getPrototypeOf(sourceComponent);

      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    var keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);

    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];

      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

        try {
          // Avoid failures from read-only properties
          defineProperty$2(targetComponent, key, descriptor);
        } catch (e) {}
      }
    }
  }

  return targetComponent;
}

var hoistNonReactStatics_cjs = hoistNonReactStatics;

var hoistNonReactStatics$1 = /*@__PURE__*/getDefaultExportFromCjs(hoistNonReactStatics_cjs);

function m(){return (m=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r]);}return e}).apply(this,arguments)}var y=function(e,t){for(var n=[e[0]],r=0,o=t.length;r<o;r+=1)n.push(t[r],e[r+1]);return n},v=function(t){return null!==t&&"object"==typeof t&&"[object Object]"===(t.toString?t.toString():Object.prototype.toString.call(t))&&!reactIsExports$1.typeOf(t)},g=Object.freeze([]),S=Object.freeze({});function w(e){return "function"==typeof e}function E(e){return "production"!==process.env.NODE_ENV&&"string"==typeof e&&e||e.displayName||e.name||"Component"}function b(e){return e&&"string"==typeof e.styledComponentId}var _="undefined"!=typeof process&&void 0!==process.env&&(process.env.REACT_APP_SC_ATTR||process.env.SC_ATTR)||"data-styled",A="undefined"!=typeof window&&"HTMLElement"in window,C=Boolean("boolean"==typeof SC_DISABLE_SPEEDY?SC_DISABLE_SPEEDY:"undefined"!=typeof process&&void 0!==process.env&&(void 0!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&""!==process.env.REACT_APP_SC_DISABLE_SPEEDY?"false"!==process.env.REACT_APP_SC_DISABLE_SPEEDY&&process.env.REACT_APP_SC_DISABLE_SPEEDY:void 0!==process.env.SC_DISABLE_SPEEDY&&""!==process.env.SC_DISABLE_SPEEDY?"false"!==process.env.SC_DISABLE_SPEEDY&&process.env.SC_DISABLE_SPEEDY:"production"!==process.env.NODE_ENV)),P="production"!==process.env.NODE_ENV?{1:"Cannot create styled-component for component: %s.\n\n",2:"Can't collect styles once you've consumed a `ServerStyleSheet`'s styles! `ServerStyleSheet` is a one off instance for each server-side render cycle.\n\n- Are you trying to reuse it across renders?\n- Are you accidentally calling collectStyles twice?\n\n",3:"Streaming SSR is only supported in a Node.js environment; Please do not try to call this method in the browser.\n\n",4:"The `StyleSheetManager` expects a valid target or sheet prop!\n\n- Does this error occur on the client and is your target falsy?\n- Does this error occur on the server and is the sheet falsy?\n\n",5:"The clone method cannot be used on the client!\n\n- Are you running in a client-like environment on the server?\n- Are you trying to run SSR on the client?\n\n",6:"Trying to insert a new style tag, but the given Node is unmounted!\n\n- Are you using a custom target that isn't mounted?\n- Does your document not have a valid head element?\n- Have you accidentally removed a style tag manually?\n\n",7:'ThemeProvider: Please return an object from your "theme" prop function, e.g.\n\n```js\ntheme={() => ({})}\n```\n\n',8:'ThemeProvider: Please make your "theme" prop an object.\n\n',9:"Missing document `<head>`\n\n",10:"Cannot find a StyleSheet instance. Usually this happens if there are multiple copies of styled-components loaded at once. Check out this issue for how to troubleshoot and fix the common cases where this situation can happen: https://github.com/styled-components/styled-components/issues/1941#issuecomment-417862021\n\n",11:"_This error was replaced with a dev-time warning, it will be deleted for v4 final._ [createGlobalStyle] received children which will not be rendered. Please use the component without passing children elements.\n\n",12:"It seems you are interpolating a keyframe declaration (%s) into an untagged string. This was supported in styled-components v3, but is not longer supported in v4 as keyframes are now injected on-demand. Please wrap your string in the css\\`\\` helper which ensures the styles are injected correctly. See https://www.styled-components.com/docs/api#css\n\n",13:"%s is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.\n\n",14:'ThemeProvider: "theme" prop is required.\n\n',15:"A stylis plugin has been supplied that is not named. We need a name for each plugin to be able to prevent styling collisions between different stylis configurations within the same app. Before you pass your plugin to `<StyleSheetManager stylisPlugins={[]}>`, please make sure each plugin is uniquely-named, e.g.\n\n```js\nObject.defineProperty(importedPlugin, 'name', { value: 'some-unique-name' });\n```\n\n",16:"Reached the limit of how many styled components may be created at group %s.\nYou may only create up to 1,073,741,824 components. If you're creating components dynamically,\nas for instance in your render method then you may be running into this limitation.\n\n",17:"CSSStyleSheet could not be found on HTMLStyleElement.\nHas styled-components' style tag been unmounted or altered by another script?\n"}:{};function O(){for(var e=arguments.length<=0?void 0:arguments[0],t=[],n=1,r=arguments.length;n<r;n+=1)t.push(n<0||arguments.length<=n?void 0:arguments[n]);return t.forEach((function(t){e=e.replace(/%[a-z]/,t);})),e}function R(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];throw "production"===process.env.NODE_ENV?new Error("An error occurred. See https://git.io/JUIaE#"+e+" for more information."+(n.length>0?" Args: "+n.join(", "):"")):new Error(O.apply(void 0,[P[e]].concat(n)).trim())}var D=function(){function e(e){this.groupSizes=new Uint32Array(512),this.length=512,this.tag=e;}var t=e.prototype;return t.indexOfGroup=function(e){for(var t=0,n=0;n<e;n++)t+=this.groupSizes[n];return t},t.insertRules=function(e,t){if(e>=this.groupSizes.length){for(var n=this.groupSizes,r=n.length,o=r;e>=o;)(o<<=1)<0&&R(16,""+e);this.groupSizes=new Uint32Array(o),this.groupSizes.set(n),this.length=o;for(var s=r;s<o;s++)this.groupSizes[s]=0;}for(var i=this.indexOfGroup(e+1),a=0,c=t.length;a<c;a++)this.tag.insertRule(i,t[a])&&(this.groupSizes[e]++,i++);},t.clearGroup=function(e){if(e<this.length){var t=this.groupSizes[e],n=this.indexOfGroup(e),r=n+t;this.groupSizes[e]=0;for(var o=n;o<r;o++)this.tag.deleteRule(n);}},t.getGroup=function(e){var t="";if(e>=this.length||0===this.groupSizes[e])return t;for(var n=this.groupSizes[e],r=this.indexOfGroup(e),o=r+n,s=r;s<o;s++)t+=this.tag.getRule(s)+"/*!sc*/\n";return t},e}(),j=new Map,T=new Map,x=1,k=function(e){if(j.has(e))return j.get(e);for(;T.has(x);)x++;var t=x++;return "production"!==process.env.NODE_ENV&&((0|t)<0||t>1<<30)&&R(16,""+t),j.set(e,t),T.set(t,e),t},V=function(e){return T.get(e)},z=function(e,t){t>=x&&(x=t+1),j.set(e,t),T.set(t,e);},B="style["+_+'][data-styled-version="5.3.11"]',M=new RegExp("^"+_+'\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)'),G=function(e,t,n){for(var r,o=n.split(","),s=0,i=o.length;s<i;s++)(r=o[s])&&e.registerName(t,r);},L=function(e,t){for(var n=(t.textContent||"").split("/*!sc*/\n"),r=[],o=0,s=n.length;o<s;o++){var i=n[o].trim();if(i){var a=i.match(M);if(a){var c=0|parseInt(a[1],10),u=a[2];0!==c&&(z(u,c),G(e,u,a[3]),e.getTag().insertRules(c,r)),r.length=0;}else r.push(i);}}},F=function(){return "undefined"!=typeof __webpack_nonce__?__webpack_nonce__:null},Y=function(e){var t=document.head,n=e||t,r=document.createElement("style"),o=function(e){for(var t=e.childNodes,n=t.length;n>=0;n--){var r=t[n];if(r&&1===r.nodeType&&r.hasAttribute(_))return r}}(n),s=void 0!==o?o.nextSibling:null;r.setAttribute(_,"active"),r.setAttribute("data-styled-version","5.3.11");var i=F();return i&&r.setAttribute("nonce",i),n.insertBefore(r,s),r},q=function(){function e(e){var t=this.element=Y(e);t.appendChild(document.createTextNode("")),this.sheet=function(e){if(e.sheet)return e.sheet;for(var t=document.styleSheets,n=0,r=t.length;n<r;n++){var o=t[n];if(o.ownerNode===e)return o}R(17);}(t),this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){try{return this.sheet.insertRule(t,e),this.length++,!0}catch(e){return !1}},t.deleteRule=function(e){this.sheet.deleteRule(e),this.length--;},t.getRule=function(e){var t=this.sheet.cssRules[e];return void 0!==t&&"string"==typeof t.cssText?t.cssText:""},e}(),H=function(){function e(e){var t=this.element=Y(e);this.nodes=t.childNodes,this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){if(e<=this.length&&e>=0){var n=document.createTextNode(t),r=this.nodes[e];return this.element.insertBefore(n,r||null),this.length++,!0}return !1},t.deleteRule=function(e){this.element.removeChild(this.nodes[e]),this.length--;},t.getRule=function(e){return e<this.length?this.nodes[e].textContent:""},e}(),$=function(){function e(e){this.rules=[],this.length=0;}var t=e.prototype;return t.insertRule=function(e,t){return e<=this.length&&(this.rules.splice(e,0,t),this.length++,!0)},t.deleteRule=function(e){this.rules.splice(e,1),this.length--;},t.getRule=function(e){return e<this.length?this.rules[e]:""},e}(),W=A,U={isServer:!A,useCSSOMInjection:!C},J=function(){function e(e,t,n){void 0===e&&(e=S),void 0===t&&(t={}),this.options=m({},U,{},e),this.gs=t,this.names=new Map(n),this.server=!!e.isServer,!this.server&&A&&W&&(W=!1,function(e){for(var t=document.querySelectorAll(B),n=0,r=t.length;n<r;n++){var o=t[n];o&&"active"!==o.getAttribute(_)&&(L(e,o),o.parentNode&&o.parentNode.removeChild(o));}}(this));}e.registerId=function(e){return k(e)};var t=e.prototype;return t.reconstructWithOptions=function(t,n){return void 0===n&&(n=!0),new e(m({},this.options,{},t),this.gs,n&&this.names||void 0)},t.allocateGSInstance=function(e){return this.gs[e]=(this.gs[e]||0)+1},t.getTag=function(){return this.tag||(this.tag=(n=(t=this.options).isServer,r=t.useCSSOMInjection,o=t.target,e=n?new $(o):r?new q(o):new H(o),new D(e)));var e,t,n,r,o;},t.hasNameForId=function(e,t){return this.names.has(e)&&this.names.get(e).has(t)},t.registerName=function(e,t){if(k(e),this.names.has(e))this.names.get(e).add(t);else {var n=new Set;n.add(t),this.names.set(e,n);}},t.insertRules=function(e,t,n){this.registerName(e,t),this.getTag().insertRules(k(e),n);},t.clearNames=function(e){this.names.has(e)&&this.names.get(e).clear();},t.clearRules=function(e){this.getTag().clearGroup(k(e)),this.clearNames(e);},t.clearTag=function(){this.tag=void 0;},t.toString=function(){return function(e){for(var t=e.getTag(),n=t.length,r="",o=0;o<n;o++){var s=V(o);if(void 0!==s){var i=e.names.get(s),a=t.getGroup(o);if(i&&a&&i.size){var c=_+".g"+o+'[id="'+s+'"]',u="";void 0!==i&&i.forEach((function(e){e.length>0&&(u+=e+",");})),r+=""+a+c+'{content:"'+u+'"}/*!sc*/\n';}}}return r}(this)},e}(),X=/(a)(d)/gi,Z=function(e){return String.fromCharCode(e+(e>25?39:97))};function K(e){var t,n="";for(t=Math.abs(e);t>52;t=t/52|0)n=Z(t%52)+n;return (Z(t%52)+n).replace(X,"$1-$2")}var Q=function(e,t){for(var n=t.length;n;)e=33*e^t.charCodeAt(--n);return e},ee=function(e){return Q(5381,e)};function te(e){for(var t=0;t<e.length;t+=1){var n=e[t];if(w(n)&&!b(n))return !1}return !0}var ne=ee("5.3.11"),re=function(){function e(e,t,n){this.rules=e,this.staticRulesId="",this.isStatic="production"===process.env.NODE_ENV&&(void 0===n||n.isStatic)&&te(e),this.componentId=t,this.baseHash=Q(ne,t),this.baseStyle=n,J.registerId(t);}return e.prototype.generateAndInjectStyles=function(e,t,n){var r=this.componentId,o=[];if(this.baseStyle&&o.push(this.baseStyle.generateAndInjectStyles(e,t,n)),this.isStatic&&!n.hash)if(this.staticRulesId&&t.hasNameForId(r,this.staticRulesId))o.push(this.staticRulesId);else {var s=be(this.rules,e,t,n).join(""),i=K(Q(this.baseHash,s)>>>0);if(!t.hasNameForId(r,i)){var a=n(s,"."+i,void 0,r);t.insertRules(r,i,a);}o.push(i),this.staticRulesId=i;}else {for(var c=this.rules.length,u=Q(this.baseHash,n.hash),l="",d=0;d<c;d++){var h=this.rules[d];if("string"==typeof h)l+=h,"production"!==process.env.NODE_ENV&&(u=Q(u,h+d));else if(h){var p=be(h,e,t,n),f=Array.isArray(p)?p.join(""):p;u=Q(u,f+d),l+=f;}}if(l){var m=K(u>>>0);if(!t.hasNameForId(r,m)){var y=n(l,"."+m,void 0,r);t.insertRules(r,m,y);}o.push(m);}}return o.join(" ")},e}(),oe=/^\s*\/\/.*$/gm,se=[":","[",".","#"];function ie(e){var t,n,r,o,s=void 0===e?S:e,i=s.options,a=void 0===i?S:i,c=s.plugins,u=void 0===c?g:c,l=new stylis_min(a),h=[],p=function(e){function t(t){if(t)try{e(t+"}");}catch(e){}}return function(n,r,o,s,i,a,c,u,l,d){switch(n){case 1:if(0===l&&64===r.charCodeAt(0))return e(r+";"),"";break;case 2:if(0===u)return r+"/*|*/";break;case 3:switch(u){case 102:case 112:return e(o[0]+r),"";default:return r+(0===d?"/*|*/":"")}case-2:r.split("/*|*/}").forEach(t);}}}((function(e){h.push(e);})),f=function(e,r,s){return 0===r&&-1!==se.indexOf(s[n.length])||s.match(o)?e:"."+t};function m(e,s,i,a){void 0===a&&(a="&");var c=e.replace(oe,""),u=s&&i?i+" "+s+" { "+c+" }":c;return t=a,n=s,r=new RegExp("\\"+n+"\\b","g"),o=new RegExp("(\\"+n+"\\b){2,}"),l(i||!s?"":s,u)}return l.use([].concat(u,[function(e,t,o){2===e&&o.length&&o[0].lastIndexOf(n)>0&&(o[0]=o[0].replace(r,f));},p,function(e){if(-2===e){var t=h;return h=[],t}}])),m.hash=u.length?u.reduce((function(e,t){return t.name||R(15),Q(e,t.name)}),5381).toString():"",m}var ae=React$1.createContext();ae.Consumer;var ue=React$1.createContext(),le=(ue.Consumer,new J),de=ie();function he(){return React$1.useContext(ae)||le}function pe(){return React$1.useContext(ue)||de}var me=function(){function e(e,t){var n=this;this.inject=function(e,t){void 0===t&&(t=de);var r=n.name+t.hash;e.hasNameForId(n.id,r)||e.insertRules(n.id,r,t(n.rules,r,"@keyframes"));},this.toString=function(){return R(12,String(n.name))},this.name=e,this.id="sc-keyframes-"+e,this.rules=t;}return e.prototype.getName=function(e){return void 0===e&&(e=de),this.name+e.hash},e}(),ye=/([A-Z])/,ve=/([A-Z])/g,ge=/^ms-/,Se=function(e){return "-"+e.toLowerCase()};function we(e){return ye.test(e)?e.replace(ve,Se).replace(ge,"-ms-"):e}var Ee=function(e){return null==e||!1===e||""===e};function be(e,n,r,o){if(Array.isArray(e)){for(var s,i=[],a=0,c=e.length;a<c;a+=1)""!==(s=be(e[a],n,r,o))&&(Array.isArray(s)?i.push.apply(i,s):i.push(s));return i}if(Ee(e))return "";if(b(e))return "."+e.styledComponentId;if(w(e)){if("function"!=typeof(l=e)||l.prototype&&l.prototype.isReactComponent||!n)return e;var u=e(n);return "production"!==process.env.NODE_ENV&&reactIsExports$1.isElement(u)&&console.warn(E(e)+" is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details."),be(u,n,r,o)}var l;return e instanceof me?r?(e.inject(r,o),e.getName(o)):e:v(e)?function e(t,n){var r,o,s=[];for(var i in t)t.hasOwnProperty(i)&&!Ee(t[i])&&(Array.isArray(t[i])&&t[i].isCss||w(t[i])?s.push(we(i)+":",t[i],";"):v(t[i])?s.push.apply(s,e(t[i],i)):s.push(we(i)+": "+(r=i,null==(o=t[i])||"boolean"==typeof o||""===o?"":"number"!=typeof o||0===o||r in unitlessKeys||r.startsWith("--")?String(o).trim():o+"px")+";"));return n?[n+" {"].concat(s,["}"]):s}(e):e.toString()}var _e=function(e){return Array.isArray(e)&&(e.isCss=!0),e};function Ne(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return w(e)||v(e)?_e(be(y(g,[e].concat(n)))):0===n.length&&1===e.length&&"string"==typeof e[0]?e:_e(be(y(e,n)))}var Ae=/invalid hook call/i,Ce=new Set,Ie=function(e,t){if("production"!==process.env.NODE_ENV){var n="The component "+e+(t?' with the id of "'+t+'"':"")+" has been created dynamically.\nYou may see this warning because you've called styled inside another component.\nTo resolve this only create new StyledComponents outside of any render method and function component.",r=console.error;try{var o=!0;console.error=function(e){if(Ae.test(e))o=!1,Ce.delete(n);else {for(var t=arguments.length,s=new Array(t>1?t-1:0),i=1;i<t;i++)s[i-1]=arguments[i];r.apply(void 0,[e].concat(s));}},React$1.useRef(),o&&!Ce.has(n)&&(console.warn(n),Ce.add(n));}catch(e){Ae.test(e.message)&&Ce.delete(n);}finally{console.error=r;}}},Pe=function(e,t,n){return void 0===n&&(n=S),e.theme!==n.theme&&e.theme||t||n.theme},Oe=/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g,Re=/(^-|-$)/g;function De(e){return e.replace(Oe,"-").replace(Re,"")}var je=function(e){return K(ee(e)>>>0)};function Te(e){return "string"==typeof e&&("production"===process.env.NODE_ENV||e.charAt(0)===e.charAt(0).toLowerCase())}var xe=function(e){return "function"==typeof e||"object"==typeof e&&null!==e&&!Array.isArray(e)},ke=function(e){return "__proto__"!==e&&"constructor"!==e&&"prototype"!==e};function Ve(e,t,n){var r=e[n];xe(t)&&xe(r)?ze(r,t):e[n]=t;}function ze(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];for(var o=0,s=n;o<s.length;o++){var i=s[o];if(xe(i))for(var a in i)ke(a)&&Ve(e,i[a],a);}return e}var Be=React$1.createContext();Be.Consumer;var Le={};function Fe(e,t,n){var o=b(e),i=!Te(e),a=t.attrs,c=void 0===a?g:a,l=t.componentId,d=void 0===l?function(e,t){var n="string"!=typeof e?"sc":De(e);Le[n]=(Le[n]||0)+1;var r=n+"-"+je("5.3.11"+n+Le[n]);return t?t+"-"+r:r}(t.displayName,t.parentComponentId):l,h=t.displayName,y=void 0===h?function(e){return Te(e)?"styled."+e:"Styled("+E(e)+")"}(e):h,v=t.displayName&&t.componentId?De(t.displayName)+"-"+t.componentId:t.componentId||d,_=o&&e.attrs?Array.prototype.concat(e.attrs,c).filter(Boolean):c,N=t.shouldForwardProp;o&&e.shouldForwardProp&&(N=t.shouldForwardProp?function(n,r,o){return e.shouldForwardProp(n,r,o)&&t.shouldForwardProp(n,r,o)}:e.shouldForwardProp);var A,C=new re(n,v,o?e.componentStyle:void 0),I=C.isStatic&&0===c.length,P=function(e,t){return function(e,t,n,r){var o=e.attrs,i=e.componentStyle,a=e.defaultProps,c=e.foldedComponentIds,l=e.shouldForwardProp,d=e.styledComponentId,h=e.target,f=function(e,t,n){void 0===e&&(e=S);var r=m({},t,{theme:e}),o={};return n.forEach((function(e){var t,n,s,i=e;for(t in w(i)&&(i=i(r)),i)r[t]=o[t]="className"===t?(n=o[t],s=i[t],n&&s?n+" "+s:n||s):i[t];})),[r,o]}(Pe(t,React$1.useContext(Be),a)||S,t,o),y=f[0],v=f[1],g=function(e,t,n,r){var o=he(),s=pe(),i=t?e.generateAndInjectStyles(S,o,s):e.generateAndInjectStyles(n,o,s);return "production"!==process.env.NODE_ENV&&!t&&r&&r(i),i}(i,r,y,"production"!==process.env.NODE_ENV?e.warnTooManyClasses:void 0),E=n,b=v.$as||t.$as||v.as||t.as||h,_=Te(b),N=v!==t?m({},t,{},v):t,A={};for(var C in N)"$"!==C[0]&&"as"!==C&&("forwardedAs"===C?A.as=N[C]:(l?l(C,isPropValid,b):!_||isPropValid(C))&&(A[C]=N[C]));return t.style&&v.style!==t.style&&(A.style=m({},t.style,{},v.style)),A.className=Array.prototype.concat(c,d,g!==d?g:null,t.className,v.className).filter(Boolean).join(" "),A.ref=E,React$1.createElement(b,A)}(A,e,t,I)};return P.displayName=y,(A=React$1.forwardRef(P)).attrs=_,A.componentStyle=C,A.displayName=y,A.shouldForwardProp=N,A.foldedComponentIds=o?Array.prototype.concat(e.foldedComponentIds,e.styledComponentId):g,A.styledComponentId=v,A.target=o?e.target:e,A.withComponent=function(e){var r=t.componentId,o=function(e,t){if(null==e)return {};var n,r,o={},s=Object.keys(e);for(r=0;r<s.length;r++)n=s[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(t,["componentId"]),s=r&&r+"-"+(Te(e)?e:De(E(e)));return Fe(e,m({},o,{attrs:_,componentId:s}),n)},Object.defineProperty(A,"defaultProps",{get:function(){return this._foldedDefaultProps},set:function(t){this._foldedDefaultProps=o?ze({},e.defaultProps,t):t;}}),"production"!==process.env.NODE_ENV&&(Ie(y,v),A.warnTooManyClasses=function(e,t){var n={},r=!1;return function(o){if(!r&&(n[o]=!0,Object.keys(n).length>=200)){var s=t?' with the id of "'+t+'"':"";console.warn("Over 200 classes were generated for component "+e+s+".\nConsider using the attrs method, together with a style object for frequently changed styles.\nExample:\n  const Component = styled.div.attrs(props => ({\n    style: {\n      background: props.background,\n    },\n  }))`width: 100%;`\n\n  <Component />"),r=!0,n={};}}}(y,v)),Object.defineProperty(A,"toString",{value:function(){return "."+A.styledComponentId}}),i&&hoistNonReactStatics$1(A,e,{attrs:!0,componentStyle:!0,displayName:!0,foldedComponentIds:!0,shouldForwardProp:!0,styledComponentId:!0,target:!0,withComponent:!0}),A}var Ye=function(e){return function e(t,r,o){if(void 0===o&&(o=S),!reactIsExports$1.isValidElementType(r))return R(1,String(r));var s=function(){return t(r,o,Ne.apply(void 0,arguments))};return s.withConfig=function(n){return e(t,r,m({},o,{},n))},s.attrs=function(n){return e(t,r,m({},o,{attrs:Array.prototype.concat(o.attrs,n).filter(Boolean)}))},s}(Fe,e)};["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","marquee","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","textPath","tspan"].forEach((function(e){Ye[e]=Ye(e);}));function $e(e){"production"!==process.env.NODE_ENV&&"undefined"!=typeof navigator&&"ReactNative"===navigator.product&&console.warn("`keyframes` cannot be used on ReactNative, only on the web. To do animation in ReactNative please use Animated.");for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];var o=Ne.apply(void 0,[e].concat(n)).join(""),s=je(o);return new me(s,o)}"production"!==process.env.NODE_ENV&&"undefined"!=typeof navigator&&"ReactNative"===navigator.product&&console.warn("It looks like you've imported 'styled-components' on React Native.\nPerhaps you're looking to import 'styled-components/native'?\nRead more about this at https://www.styled-components.com/docs/basics#react-native"),"production"!==process.env.NODE_ENV&&"test"!==process.env.NODE_ENV&&"undefined"!=typeof window&&(window["__styled-components-init__"]=window["__styled-components-init__"]||0,1===window["__styled-components-init__"]&&console.warn("It looks like there are several instances of 'styled-components' initialized in this application. This may cause dynamic styles to not render properly, errors during the rehydration process, a missing theme prop, and makes your application bigger without good reason.\n\nSee https://s-c.sh/2BAXzed for more info."),window["__styled-components-init__"]+=1);var styled = Ye;

var __makeTemplateObject$2 = (undefined && undefined.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var len = 242.776657104492;
var time = 1.6;
var anim = $e(templateObject_1$2 || (templateObject_1$2 = __makeTemplateObject$2(["\n  12.5% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n  43.75% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n  100% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n"], ["\n  12.5% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n  43.75% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n  100% {\n    stroke-dasharray: ", "px, ", "px;\n    stroke-dashoffset: -", "px;\n  }\n"])), len * 0.14, len, len * 0.11, len * 0.35, len, len * 0.35, len * 0.01, len, len * 0.99);
styled.path(templateObject_2$2 || (templateObject_2$2 = __makeTemplateObject$2(["\n  stroke-dasharray: ", "px, ", ";\n  stroke-dashoffset: 0;\n  animation: ", " ", "s linear infinite;\n"], ["\n  stroke-dasharray: ", "px, ", ";\n  stroke-dashoffset: 0;\n  animation: ", " ", "s linear infinite;\n"])), len * 0.01, len, anim, time);
var templateObject_1$2, templateObject_2$2;

var __assign$q = (undefined && undefined.__assign) || function () {
    __assign$q = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$q.apply(this, arguments);
};

var __assign$p = (undefined && undefined.__assign) || function () {
    __assign$p = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$p.apply(this, arguments);
};

var __assign$o = (undefined && undefined.__assign) || function () {
    __assign$o = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$o.apply(this, arguments);
};

var __assign$n = (undefined && undefined.__assign) || function () {
    __assign$n = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$n.apply(this, arguments);
};

var __assign$m = (undefined && undefined.__assign) || function () {
    __assign$m = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$m.apply(this, arguments);
};

var __assign$l = (undefined && undefined.__assign) || function () {
    __assign$l = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$l.apply(this, arguments);
};

var __assign$k = (undefined && undefined.__assign) || function () {
    __assign$k = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$k.apply(this, arguments);
};

/**
 * Returns the value of `props[path]` or `defaultValue`
 * @example
 * import styled from "styled-components";
 * import { prop } from "styled-tools";
 *
 * const Button = styled.button`
 *   color: ${prop("color", "red")};
 * `;
 */
var prop = function prop(path, defaultValue) {
  return function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (typeof props[path] !== "undefined") {
      return props[path];
    }

    if (path && path.indexOf(".") > 0) {
      var paths = path.split(".");
      var length = paths.length;
      var object = props[paths[0]];
      var index = 1;

      while (object != null && index < length) {
        object = object[paths[index]];
        index += 1;
      }

      if (typeof object !== "undefined") {
        return object;
      }
    }

    return defaultValue;
  };
};

var __makeTemplateObject$1 = (undefined && undefined.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign$j = (undefined && undefined.__assign) || function () {
    __assign$j = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$j.apply(this, arguments);
};
var spin = $e(templateObject_1$1 || (templateObject_1$1 = __makeTemplateObject$1(["\n to {\n    transform: rotate(360deg);\n  }\n"], ["\n to {\n    transform: rotate(360deg);\n  }\n"])));
styled.svg(templateObject_2$1 || (templateObject_2$1 = __makeTemplateObject$1(["\n  animation: ", " 0.75s steps(12, end) infinite;\n  animation-duration: ", "s;\n"], ["\n  animation: ", " 0.75s steps(12, end) infinite;\n  animation-duration: ", "s;\n"])), spin, prop('speed', '0.75'));
styled.polyline(templateObject_3$1 || (templateObject_3$1 = __makeTemplateObject$1(["\n  stroke-width: ", "px;\n  stroke-linecap: round;\n\n  &:nth-child(12n + 0) {\n    stroke-opacity: 0.08;\n  }\n\n  &:nth-child(12n + 1) {\n    stroke-opacity: 0.17;\n  }\n\n  &:nth-child(12n + 2) {\n    stroke-opacity: 0.25;\n  }\n\n  &:nth-child(12n + 3) {\n    stroke-opacity: 0.33;\n  }\n\n  &:nth-child(12n + 4) {\n    stroke-opacity: 0.42;\n  }\n\n  &:nth-child(12n + 5) {\n    stroke-opacity: 0.5;\n  }\n\n  &:nth-child(12n + 6) {\n    stroke-opacity: 0.58;\n  }\n\n  &:nth-child(12n + 7) {\n    stroke-opacity: 0.66;\n  }\n\n  &:nth-child(12n + 8) {\n    stroke-opacity: 0.75;\n  }\n\n  &:nth-child(12n + 9) {\n    stroke-opacity: 0.83;\n  }\n\n  &:nth-child(12n + 11) {\n    stroke-opacity: 0.92;\n  }\n"], ["\n  stroke-width: ", "px;\n  stroke-linecap: round;\n\n  &:nth-child(12n + 0) {\n    stroke-opacity: 0.08;\n  }\n\n  &:nth-child(12n + 1) {\n    stroke-opacity: 0.17;\n  }\n\n  &:nth-child(12n + 2) {\n    stroke-opacity: 0.25;\n  }\n\n  &:nth-child(12n + 3) {\n    stroke-opacity: 0.33;\n  }\n\n  &:nth-child(12n + 4) {\n    stroke-opacity: 0.42;\n  }\n\n  &:nth-child(12n + 5) {\n    stroke-opacity: 0.5;\n  }\n\n  &:nth-child(12n + 6) {\n    stroke-opacity: 0.58;\n  }\n\n  &:nth-child(12n + 7) {\n    stroke-opacity: 0.66;\n  }\n\n  &:nth-child(12n + 8) {\n    stroke-opacity: 0.75;\n  }\n\n  &:nth-child(12n + 9) {\n    stroke-opacity: 0.83;\n  }\n\n  &:nth-child(12n + 11) {\n    stroke-opacity: 0.92;\n  }\n"])), function (props) { return props.width; });
var templateObject_1$1, templateObject_2$1, templateObject_3$1;

var __assign$i = (undefined && undefined.__assign) || function () {
    __assign$i = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$i.apply(this, arguments);
};

var __assign$h = (undefined && undefined.__assign) || function () {
    __assign$h = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$h.apply(this, arguments);
};

var __assign$g = (undefined && undefined.__assign) || function () {
    __assign$g = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$g.apply(this, arguments);
};

var __makeTemplateObject = (undefined && undefined.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign$f = (undefined && undefined.__assign) || function () {
    __assign$f = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$f.apply(this, arguments);
};
var dash = $e(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n to {\n    stroke-dashoffset: 136;\n  }\n"], ["\n to {\n    stroke-dashoffset: 136;\n  }\n"])));
styled.polygon(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  stroke-dasharray: 17;\n  animation: ", " 2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;\n"], ["\n  stroke-dasharray: 17;\n  animation: ", " 2.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;\n"])), dash);
styled.svg(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  transform-origin: 50% 65%;\n"], ["\n  transform-origin: 50% 65%;\n"])));
var templateObject_1, templateObject_2, templateObject_3;

var __assign$e = (undefined && undefined.__assign) || function () {
    __assign$e = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$e.apply(this, arguments);
};

var __assign$d = (undefined && undefined.__assign) || function () {
    __assign$d = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$d.apply(this, arguments);
};

var __assign$c = (undefined && undefined.__assign) || function () {
    __assign$c = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$c.apply(this, arguments);
};

var __assign$b = (undefined && undefined.__assign) || function () {
    __assign$b = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$b.apply(this, arguments);
};

var __assign$a = (undefined && undefined.__assign) || function () {
    __assign$a = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$a.apply(this, arguments);
};

var __assign$9 = (undefined && undefined.__assign) || function () {
    __assign$9 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$9.apply(this, arguments);
};

var __assign$8 = (undefined && undefined.__assign) || function () {
    __assign$8 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$8.apply(this, arguments);
};

var __assign$7 = (undefined && undefined.__assign) || function () {
    __assign$7 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$7.apply(this, arguments);
};

var __assign$6 = (undefined && undefined.__assign) || function () {
    __assign$6 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$6.apply(this, arguments);
};

var __assign$5 = (undefined && undefined.__assign) || function () {
    __assign$5 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$5.apply(this, arguments);
};

var __assign$4 = (undefined && undefined.__assign) || function () {
    __assign$4 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$4.apply(this, arguments);
};
function ColorRing(_a) {
    var _b = _a.visible, visible = _b === void 0 ? true : _b, _c = _a.width, width = _c === void 0 ? '80' : _c, _d = _a.height, height = _d === void 0 ? '80' : _d, _e = _a.colors, colors = _e === void 0 ? ['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87'] : _e, _f = _a.wrapperClass, wrapperClass = _f === void 0 ? '' : _f, _g = _a.wrapperStyle, wrapperStyle = _g === void 0 ? {} : _g, _h = _a.ariaLabel, ariaLabel = _h === void 0 ? 'color-ring-loading' : _h;
    return !visible ? null : (React$1.createElement("svg", __assign$4({ xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", width: width, height: height, viewBox: "0 0 100 100", preserveAspectRatio: "xMidYMid", className: wrapperClass, style: wrapperStyle, "aria-label": ariaLabel, "data-testid": "color-ring-svg" }, DEFAULT_WAI_ARIA_ATTRIBUTE),
        React$1.createElement("defs", null,
            React$1.createElement("mask", { id: "ldio-4offds5dlws-mask" },
                React$1.createElement("circle", { cx: "50", cy: "50", r: "26", stroke: "#fff", strokeLinecap: "round", strokeDasharray: "122.52211349000194 40.840704496667314", strokeWidth: "9", transform: "rotate(198.018 50 50)" },
                    React$1.createElement("animateTransform", { attributeName: "transform", type: "rotate", values: "0 50 50;360 50 50", keyTimes: "0;1", dur: "1s", repeatCount: "indefinite" })))),
        React$1.createElement("g", { mask: "url(#ldio-4offds5dlws-mask)" },
            React$1.createElement("rect", { x: "14.5", y: "0", width: "15", height: "100", fill: colors[0] },
                React$1.createElement("animate", { attributeName: "fill", values: colors.join(';').toString(), keyTimes: "0;0.25;0.5;0.75;1", dur: "1s", repeatCount: "indefinite", begin: "-0.8s" })),
            React$1.createElement("rect", { x: "28.5", y: "0", width: "15", height: "100", fill: colors[1] },
                React$1.createElement("animate", { attributeName: "fill", values: colors.join(';').toString(), keyTimes: "0;0.25;0.5;0.75;1", dur: "1s", repeatCount: "indefinite", begin: "-0.6s" })),
            React$1.createElement("rect", { x: "42.5", y: "0", width: "15", height: "100", fill: colors[2] },
                React$1.createElement("animate", { attributeName: "fill", values: colors.join(';').toString(), keyTimes: "0;0.25;0.5;0.75;1", dur: "1s", repeatCount: "indefinite", begin: "-0.4s" })),
            React$1.createElement("rect", { x: "56.5", y: "0", width: "15", height: "100", fill: colors[3] },
                React$1.createElement("animate", { attributeName: "fill", values: colors.join(';').toString(), keyTimes: "0;0.25;0.5;0.75;1", dur: "1s", repeatCount: "indefinite", begin: "-0.2s" })),
            React$1.createElement("rect", { x: "70.5", y: "0", width: "15", height: "100", fill: colors[4] },
                React$1.createElement("animate", { attributeName: "fill", values: colors.join(';').toString(), keyTimes: "0;0.25;0.5;0.75;1", dur: "1s", repeatCount: "indefinite", begin: "0s" })))));
}

var __assign$3 = (undefined && undefined.__assign) || function () {
    __assign$3 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$3.apply(this, arguments);
};

var __assign$2 = (undefined && undefined.__assign) || function () {
    __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};

const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object") ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((undefined ? undefined.MODE : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, subscribe, destroy };
  state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;

var withSelector = {exports: {}};

var withSelector_development = {};

var shim = {exports: {}};

var useSyncExternalStoreShim_development = {};

/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredUseSyncExternalStoreShim_development;

function requireUseSyncExternalStoreShim_development () {
	if (hasRequiredUseSyncExternalStoreShim_development) return useSyncExternalStoreShim_development;
	hasRequiredUseSyncExternalStoreShim_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	if (
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
	    'function'
	) {
	  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
	}
	          var React = React$1;

	var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

	function error(format) {
	  {
	    {
	      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	        args[_key2 - 1] = arguments[_key2];
	      }

	      printWarning('error', format, args);
	    }
	  }
	}

	function printWarning(level, format, args) {
	  // When changing this logic, you might want to also
	  // update consoleWithStackDev.www.js as well.
	  {
	    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
	    var stack = ReactDebugCurrentFrame.getStackAddendum();

	    if (stack !== '') {
	      format += '%s';
	      args = args.concat([stack]);
	    } // eslint-disable-next-line react-internal/safe-string-coercion


	    var argsWithFormat = args.map(function (item) {
	      return String(item);
	    }); // Careful: RN currently depends on this prefix

	    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
	    // breaks IE9: https://github.com/facebook/react/issues/13610
	    // eslint-disable-next-line react-internal/no-production-logging

	    Function.prototype.apply.call(console[level], console, argsWithFormat);
	  }
	}

	/**
	 * inlined Object.is polyfill to avoid requiring consumers ship their own
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	 */
	function is(x, y) {
	  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
	  ;
	}

	var objectIs = typeof Object.is === 'function' ? Object.is : is;

	// dispatch for CommonJS interop named imports.

	var useState = React.useState,
	    useEffect = React.useEffect,
	    useLayoutEffect = React.useLayoutEffect,
	    useDebugValue = React.useDebugValue;
	var didWarnOld18Alpha = false;
	var didWarnUncachedGetSnapshot = false; // Disclaimer: This shim breaks many of the rules of React, and only works
	// because of a very particular set of implementation details and assumptions
	// -- change any one of them and it will break. The most important assumption
	// is that updates are always synchronous, because concurrent rendering is
	// only available in versions of React that also have a built-in
	// useSyncExternalStore API. And we only use this shim when the built-in API
	// does not exist.
	//
	// Do not assume that the clever hacks used by this hook also work in general.
	// The point of this shim is to replace the need for hacks by other libraries.

	function useSyncExternalStore(subscribe, getSnapshot, // Note: The shim does not use getServerSnapshot, because pre-18 versions of
	// React do not expose a way to check if we're hydrating. So users of the shim
	// will need to track that themselves and return the correct value
	// from `getSnapshot`.
	getServerSnapshot) {
	  {
	    if (!didWarnOld18Alpha) {
	      if (React.startTransition !== undefined) {
	        didWarnOld18Alpha = true;

	        error('You are using an outdated, pre-release alpha of React 18 that ' + 'does not support useSyncExternalStore. The ' + 'use-sync-external-store shim will not work correctly. Upgrade ' + 'to a newer pre-release.');
	      }
	    }
	  } // Read the current snapshot from the store on every render. Again, this
	  // breaks the rules of React, and only works here because of specific
	  // implementation details, most importantly that updates are
	  // always synchronous.


	  var value = getSnapshot();

	  {
	    if (!didWarnUncachedGetSnapshot) {
	      var cachedValue = getSnapshot();

	      if (!objectIs(value, cachedValue)) {
	        error('The result of getSnapshot should be cached to avoid an infinite loop');

	        didWarnUncachedGetSnapshot = true;
	      }
	    }
	  } // Because updates are synchronous, we don't queue them. Instead we force a
	  // re-render whenever the subscribed state changes by updating an some
	  // arbitrary useState hook. Then, during render, we call getSnapshot to read
	  // the current value.
	  //
	  // Because we don't actually use the state returned by the useState hook, we
	  // can save a bit of memory by storing other stuff in that slot.
	  //
	  // To implement the early bailout, we need to track some things on a mutable
	  // object. Usually, we would put that in a useRef hook, but we can stash it in
	  // our useState hook instead.
	  //
	  // To force a re-render, we call forceUpdate({inst}). That works because the
	  // new object always fails an equality check.


	  var _useState = useState({
	    inst: {
	      value: value,
	      getSnapshot: getSnapshot
	    }
	  }),
	      inst = _useState[0].inst,
	      forceUpdate = _useState[1]; // Track the latest getSnapshot function with a ref. This needs to be updated
	  // in the layout phase so we can access it during the tearing check that
	  // happens on subscribe.


	  useLayoutEffect(function () {
	    inst.value = value;
	    inst.getSnapshot = getSnapshot; // Whenever getSnapshot or subscribe changes, we need to check in the
	    // commit phase if there was an interleaved mutation. In concurrent mode
	    // this can happen all the time, but even in synchronous mode, an earlier
	    // effect may have mutated the store.

	    if (checkIfSnapshotChanged(inst)) {
	      // Force a re-render.
	      forceUpdate({
	        inst: inst
	      });
	    }
	  }, [subscribe, value, getSnapshot]);
	  useEffect(function () {
	    // Check for changes right before subscribing. Subsequent changes will be
	    // detected in the subscription handler.
	    if (checkIfSnapshotChanged(inst)) {
	      // Force a re-render.
	      forceUpdate({
	        inst: inst
	      });
	    }

	    var handleStoreChange = function () {
	      // TODO: Because there is no cross-renderer API for batching updates, it's
	      // up to the consumer of this library to wrap their subscription event
	      // with unstable_batchedUpdates. Should we try to detect when this isn't
	      // the case and print a warning in development?
	      // The store changed. Check if the snapshot changed since the last time we
	      // read from the store.
	      if (checkIfSnapshotChanged(inst)) {
	        // Force a re-render.
	        forceUpdate({
	          inst: inst
	        });
	      }
	    }; // Subscribe to the store and return a clean-up function.


	    return subscribe(handleStoreChange);
	  }, [subscribe]);
	  useDebugValue(value);
	  return value;
	}

	function checkIfSnapshotChanged(inst) {
	  var latestGetSnapshot = inst.getSnapshot;
	  var prevValue = inst.value;

	  try {
	    var nextValue = latestGetSnapshot();
	    return !objectIs(prevValue, nextValue);
	  } catch (error) {
	    return true;
	  }
	}

	function useSyncExternalStore$1(subscribe, getSnapshot, getServerSnapshot) {
	  // Note: The shim does not use getServerSnapshot, because pre-18 versions of
	  // React do not expose a way to check if we're hydrating. So users of the shim
	  // will need to track that themselves and return the correct value
	  // from `getSnapshot`.
	  return getSnapshot();
	}

	var canUseDOM = !!(typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined');

	var isServerEnvironment = !canUseDOM;

	var shim = isServerEnvironment ? useSyncExternalStore$1 : useSyncExternalStore;
	var useSyncExternalStore$2 = React.useSyncExternalStore !== undefined ? React.useSyncExternalStore : shim;

	useSyncExternalStoreShim_development.useSyncExternalStore = useSyncExternalStore$2;
	          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	if (
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
	    'function'
	) {
	  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
	}
	        
	  })();
	}
	return useSyncExternalStoreShim_development;
}

var useSyncExternalStoreShim_production_min = {};

/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredUseSyncExternalStoreShim_production_min;

function requireUseSyncExternalStoreShim_production_min () {
	if (hasRequiredUseSyncExternalStoreShim_production_min) return useSyncExternalStoreShim_production_min;
	hasRequiredUseSyncExternalStoreShim_production_min = 1;
var e=React$1;function h(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var k="function"===typeof Object.is?Object.is:h,l=e.useState,m=e.useEffect,n=e.useLayoutEffect,p=e.useDebugValue;function q(a,b){var d=b(),f=l({inst:{value:d,getSnapshot:b}}),c=f[0].inst,g=f[1];n(function(){c.value=d;c.getSnapshot=b;r(c)&&g({inst:c});},[a,d,b]);m(function(){r(c)&&g({inst:c});return a(function(){r(c)&&g({inst:c});})},[a]);p(d);return d}
	function r(a){var b=a.getSnapshot;a=a.value;try{var d=b();return !k(a,d)}catch(f){return !0}}function t(a,b){return b()}var u="undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement?t:q;useSyncExternalStoreShim_production_min.useSyncExternalStore=void 0!==e.useSyncExternalStore?e.useSyncExternalStore:u;
	return useSyncExternalStoreShim_production_min;
}

var hasRequiredShim;

function requireShim () {
	if (hasRequiredShim) return shim.exports;
	hasRequiredShim = 1;

	if (process.env.NODE_ENV === 'production') {
	  shim.exports = requireUseSyncExternalStoreShim_production_min();
	} else {
	  shim.exports = requireUseSyncExternalStoreShim_development();
	}
	return shim.exports;
}

/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredWithSelector_development;

function requireWithSelector_development () {
	if (hasRequiredWithSelector_development) return withSelector_development;
	hasRequiredWithSelector_development = 1;

	if (process.env.NODE_ENV !== "production") {
	  (function() {

	/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	if (
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
	    'function'
	) {
	  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
	}
	          var React = React$1;
	var shim = requireShim();

	/**
	 * inlined Object.is polyfill to avoid requiring consumers ship their own
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	 */
	function is(x, y) {
	  return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y // eslint-disable-line no-self-compare
	  ;
	}

	var objectIs = typeof Object.is === 'function' ? Object.is : is;

	var useSyncExternalStore = shim.useSyncExternalStore;

	// for CommonJS interop.

	var useRef = React.useRef,
	    useEffect = React.useEffect,
	    useMemo = React.useMemo,
	    useDebugValue = React.useDebugValue; // Same as useSyncExternalStore, but supports selector and isEqual arguments.

	function useSyncExternalStoreWithSelector(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
	  // Use this to track the rendered snapshot.
	  var instRef = useRef(null);
	  var inst;

	  if (instRef.current === null) {
	    inst = {
	      hasValue: false,
	      value: null
	    };
	    instRef.current = inst;
	  } else {
	    inst = instRef.current;
	  }

	  var _useMemo = useMemo(function () {
	    // Track the memoized state using closure variables that are local to this
	    // memoized instance of a getSnapshot function. Intentionally not using a
	    // useRef hook, because that state would be shared across all concurrent
	    // copies of the hook/component.
	    var hasMemo = false;
	    var memoizedSnapshot;
	    var memoizedSelection;

	    var memoizedSelector = function (nextSnapshot) {
	      if (!hasMemo) {
	        // The first time the hook is called, there is no memoized result.
	        hasMemo = true;
	        memoizedSnapshot = nextSnapshot;

	        var _nextSelection = selector(nextSnapshot);

	        if (isEqual !== undefined) {
	          // Even if the selector has changed, the currently rendered selection
	          // may be equal to the new selection. We should attempt to reuse the
	          // current value if possible, to preserve downstream memoizations.
	          if (inst.hasValue) {
	            var currentSelection = inst.value;

	            if (isEqual(currentSelection, _nextSelection)) {
	              memoizedSelection = currentSelection;
	              return currentSelection;
	            }
	          }
	        }

	        memoizedSelection = _nextSelection;
	        return _nextSelection;
	      } // We may be able to reuse the previous invocation's result.


	      // We may be able to reuse the previous invocation's result.
	      var prevSnapshot = memoizedSnapshot;
	      var prevSelection = memoizedSelection;

	      if (objectIs(prevSnapshot, nextSnapshot)) {
	        // The snapshot is the same as last time. Reuse the previous selection.
	        return prevSelection;
	      } // The snapshot has changed, so we need to compute a new selection.


	      // The snapshot has changed, so we need to compute a new selection.
	      var nextSelection = selector(nextSnapshot); // If a custom isEqual function is provided, use that to check if the data
	      // has changed. If it hasn't, return the previous selection. That signals
	      // to React that the selections are conceptually equal, and we can bail
	      // out of rendering.

	      // If a custom isEqual function is provided, use that to check if the data
	      // has changed. If it hasn't, return the previous selection. That signals
	      // to React that the selections are conceptually equal, and we can bail
	      // out of rendering.
	      if (isEqual !== undefined && isEqual(prevSelection, nextSelection)) {
	        return prevSelection;
	      }

	      memoizedSnapshot = nextSnapshot;
	      memoizedSelection = nextSelection;
	      return nextSelection;
	    }; // Assigning this to a constant so that Flow knows it can't change.


	    // Assigning this to a constant so that Flow knows it can't change.
	    var maybeGetServerSnapshot = getServerSnapshot === undefined ? null : getServerSnapshot;

	    var getSnapshotWithSelector = function () {
	      return memoizedSelector(getSnapshot());
	    };

	    var getServerSnapshotWithSelector = maybeGetServerSnapshot === null ? undefined : function () {
	      return memoizedSelector(maybeGetServerSnapshot());
	    };
	    return [getSnapshotWithSelector, getServerSnapshotWithSelector];
	  }, [getSnapshot, getServerSnapshot, selector, isEqual]),
	      getSelection = _useMemo[0],
	      getServerSelection = _useMemo[1];

	  var value = useSyncExternalStore(subscribe, getSelection, getServerSelection);
	  useEffect(function () {
	    inst.hasValue = true;
	    inst.value = value;
	  }, [value]);
	  useDebugValue(value);
	  return value;
	}

	withSelector_development.useSyncExternalStoreWithSelector = useSyncExternalStoreWithSelector;
	          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
	if (
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
	  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
	    'function'
	) {
	  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
	}
	        
	  })();
	}
	return withSelector_development;
}

var withSelector_production_min = {};

/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredWithSelector_production_min;

function requireWithSelector_production_min () {
	if (hasRequiredWithSelector_production_min) return withSelector_production_min;
	hasRequiredWithSelector_production_min = 1;
var h=React$1,n=requireShim();function p(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}var q="function"===typeof Object.is?Object.is:p,r=n.useSyncExternalStore,t=h.useRef,u=h.useEffect,v=h.useMemo,w=h.useDebugValue;
	withSelector_production_min.useSyncExternalStoreWithSelector=function(a,b,e,l,g){var c=t(null);if(null===c.current){var f={hasValue:!1,value:null};c.current=f;}else f=c.current;c=v(function(){function a(a){if(!c){c=!0;d=a;a=l(a);if(void 0!==g&&f.hasValue){var b=f.value;if(g(b,a))return k=b}return k=a}b=k;if(q(d,a))return b;var e=l(a);if(void 0!==g&&g(b,e))return b;d=a;return k=e}var c=!1,d,k,m=void 0===e?null:e;return [function(){return a(b())},null===m?void 0:function(){return a(m())}]},[b,e,l,g]);var d=r(a,c[0],c[1]);
	u(function(){f.hasValue=!0;f.value=d;},[d]);w(d);return d};
	return withSelector_production_min;
}

if (process.env.NODE_ENV === 'production') {
  withSelector.exports = requireWithSelector_production_min();
} else {
  withSelector.exports = requireWithSelector_development();
}

var withSelectorExports = withSelector.exports;
var useSyncExternalStoreExports = /*@__PURE__*/getDefaultExportFromCjs(withSelectorExports);

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
function useStore$1(api, selector = api.getState, equalityFn) {
  if ((undefined ? undefined.MODE : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getState,
    selector,
    equalityFn
  );
  React$1.useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  if ((undefined ? undefined.MODE : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore$1(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;

// import { IData } from "../types/IData";

const useStore = create((set, get) => ({
  data: {
    allDataMeta: {},
    activeItem: null,
    activeEditItem: null,
    selectItem: null,
    viewportCoordinates: {
      x: 0,
      y: 0,
      height: 0,
      width: 0,
      scale: 0
    }
  },
  setAllDataMeta: data => set(state => ({
    data: {
      ...state.data,
      allDataMeta: data
    }
  })),
  setViewportCoordinates: _ref => {
    let {
      x,
      y,
      width,
      height,
      scale
    } = _ref;
    return set(state => ({
      data: {
        ...state.data,
        viewportCoordinates: {
          x: x,
          y: y,
          width: width,
          height: height,
          scale: scale
        }
      }
    }));
  },
  changeItem: item => {
    const data = get().data.allDataMeta?.objects;
    const newData = data.map(el => {
      if (el.id === item.id) {
        return item;
      } else {
        return el;
      }
    });
    const event = new CustomEvent("editObject");
    event.param = {
      item: item
    };
    window.document.dispatchEvent(event);
    set(state => ({
      data: {
        ...state.data,
        allDataMeta: {
          ...state.data?.allDataMeta,
          objects: newData
        }
      }
    }));
  },
  setActiveItem: item => set(state => ({
    data: {
      ...state.data,
      activeItem: item
    }
  })),
  setSelectItem: item => set(state => ({
    data: {
      ...state.data,
      selectItem: item
    }
  })),
  setActiveEditItem: item => set(state => ({
    data: {
      ...state.data,
      activeEditItem: item
    }
  })),
  addObject: item => {
    const allDataMeta = get().data.allDataMeta;
    const newItem = {
      ...item,
      active: true
    };
    const event = new CustomEvent("addObject");
    event.param = {
      item: newItem
    };
    window.document.dispatchEvent(event);
    set(state => ({
      data: {
        ...state.data,
        selectItem: newItem,
        allDataMeta: {
          ...allDataMeta,
          objects: [...allDataMeta.objects, newItem]
        }
      }
    }));
  },
  clearActiveItem: () => set(state => ({
    data: {
      ...state.data,
      activeItem: null
    }
  })),
  editItem: (item, positions) => {
    const data = get().data.allDataMeta?.objects;
    const editEl = data.find(el => el.id === item.id);
    if (+editEl.coordinate.x_coordinate !== positions.x_coordinate || +editEl.coordinate.y_coordinate !== positions.y_coordinate || +editEl.coordinate.rotate !== positions.rotate) {
      const newData = data.map(el => {
        if (el.id === item.id) {
          return {
            ...el,
            coordinate: positions
          };
        } else {
          return el;
        }
      });
      const event = new CustomEvent("editObject");
      event.param = {
        item: {
          ...editEl,
          coordinate: positions
        }
      };
      window.document.dispatchEvent(event);
      set(state => ({
        data: {
          ...state.data,
          allDataMeta: {
            ...state.data?.allDataMeta,
            objects: newData
          }
        }
      }));
    }
  }
}));

function Modal(_ref) {
  let {
    setShowModal
  } = _ref;
  const {
    clearActiveItem
  } = useStore(store => store);
  const activeItem = useStore(store => store.data.activeItem);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-auto my-6 mx-auto max-w-3xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-start justify-between p-5 border-b border-solid border-slate-200 rounded-t"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-3xl font-semibold"
  }, "name: ", activeItem.name)), /*#__PURE__*/React.createElement("div", {
    className: "relative p-6 flex-auto"
  }, /*#__PURE__*/React.createElement("p", {
    className: "my-1 text-slate-500 text-lg leading-relaxed"
  }, "coordinate: x:", activeItem.coordinate.x_coordinate), /*#__PURE__*/React.createElement("p", {
    className: "my-1 text-slate-500 text-lg leading-relaxed"
  }, "coordinate: y:", activeItem.coordinate.y_coordinate), /*#__PURE__*/React.createElement("p", {
    className: "my-1 text-slate-500 text-lg leading-relaxed"
  }, "coordinate: rotate:", activeItem.coordinate.rotate)), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b"
  }, /*#__PURE__*/React.createElement("button", {
    className: "text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150",
    type: "button",
    onClick: () => {
      setShowModal(false);
      clearActiveItem();
    }
  }, "\u0417\u0430\u043A\u0440\u044B\u0442\u044C"), /*#__PURE__*/React.createElement("button", {
    className: "bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150",
    type: "button",
    onClick: () => {
      setShowModal(false);
      clearActiveItem();
    }
  }, "\u0417\u0430\u0431\u0440\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C"))))), /*#__PURE__*/React.createElement("div", {
    className: "opacity-25 fixed inset-0 z-40 bg-black"
  }));
}

var img$5 = "data:image/svg+xml,%3csvg width='10' height='12' viewBox='0 0 10 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10 6L0 0.226497V11.7735L10 6Z' fill='%231C83FA'/%3e%3c/svg%3e";

var img$4 = "data:image/svg+xml,%3csvg width='10' height='13' viewBox='0 0 10 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3.66667 12.3333L3.66667 5.66665M3.66667 12.3333L1 9.66665M3.66667 12.3333L6.33333 9.66665M6.33333 0.999979L6.33333 7.66665M6.33333 0.999979L9 3.66665M6.33333 0.999979L3.66667 3.66665' stroke='%235B5B5B' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

const FilterItem = _ref => {
  let {
    handleClick,
    item,
    zones
  } = _ref;
  const zone = zones.find(el => el.id === item?.zone_id);
  const selectItem = useStore(store => store.data.selectItem);
  // console.log(zone);
  const select = selectItem?.id === item?.id;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => handleClick(e, item),
    key: item.id,
    className: `${select ? "bg-gray-300" : "hover:bg-gray-300"} pt-1 pb-1 pl-2 pr-2 flex items-center cursor-pointer transition-all duration-500 w-full border-b border-gray-300 `
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-1/2"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mr-2"
  }, item.name)), /*#__PURE__*/React.createElement("div", {
    className: "w-1/2"
  }, /*#__PURE__*/React.createElement("p", {
    className: "mr-2"
  }, zone?.name)));
};

const sortForObjectOrZone = _ref => {
  let {
    objectFilter,
    zoneFilter,
    arr,
    zones,
    category
  } = _ref;
  if (objectFilter === "desc") {
    const sorted = arr?.sort((a, b) => {
      return Number.isNaN(+a?.name) || Number.isNaN(+b?.name) ? a?.name?.localeCompare(b?.name) : a?.name - b?.name;
    });
    return sorted;
  }
  if (objectFilter === "asc") {
    const sorted = arr?.sort((a, b) => {
      return Number.isNaN(+b?.name) || Number.isNaN(+a?.name) ? b?.name?.localeCompare(a?.name) : b?.name - a?.name;
    });
    return sorted;
  }
  if (zoneFilter === "desc") {
    const zonesArr = arr?.map(item => {
      return {
        ...item,
        item_zone: zones.find(el => el.id === item?.zone_id)
      };
    });
    const sorted = zonesArr?.sort((a, b) => {
      return Number.isNaN(+a?.item_zone?.name) || Number.isNaN(+b?.item_zone?.name) ? a?.item_zone?.name?.localeCompare(b?.item_zone?.name) : a?.item_zone?.name - b?.item_zone?.name;
    });
    return sorted;
  }
  if (zoneFilter === "asc") {
    const zonesArr = arr?.map(item => {
      return {
        ...item,
        item_zone: zones.find(el => el.id === item?.zone_id)
      };
    });
    const sorted = zonesArr?.sort((a, b) => {
      return Number.isNaN(+b?.item_zone?.name) || Number.isNaN(+a?.item_zone?.name) ? b?.item_zone?.name?.localeCompare(a?.item_zone?.name) : b?.item_zone?.name - a?.item_zone?.name;
    });
    return sorted;
  }
};

const Filter = _ref => {
  let {
    data,
    setShowFilter,
    showFilter,
    zones,
    viewer,
    setShowEditModal,
    categoies
  } = _ref;
  const [filter, setFilter] = React$1.useState("Размещен");
  const [dataFilter, setDataFilter] = React$1.useState(null);
  const {
    setActiveItem,
    setActiveEditItem,
    setSelectItem
  } = useStore(store => store);
  const [category, setCategory] = React$1.useState(null);
  const [objectFilter, setObjectFilter] = React$1.useState("desc");
  const [zoneFilter, setZoneFilter] = React$1.useState(null);
  // const activeEditItem = useStore((store) => store.data.activeEditItem);
  // console.log(data);
  React$1.useEffect(() => {
    if (filter === "Размещен") {
      setDataFilter(sortForObjectOrZone({
        arr: data.filter(item => item?.status_name === "Размещен" && (category ? item?.object_category_id === category : true)),
        objectFilter,
        zoneFilter,
        zones
      }));
    }
    if (filter === "Не размещен") {
      setDataFilter(sortForObjectOrZone({
        arr: data.filter(item => item?.status_name === "Не размещен" && (category ? item?.object_category_id === category : true)),
        objectFilter,
        zoneFilter,
        zones
      }));
    }
    if (filter === "Архив") {
      setDataFilter(sortForObjectOrZone({
        arr: data.filter(item => item?.status_name === "Архив" && (category ? item?.object_category_id === category : true)),
        objectFilter,
        zoneFilter,
        zones
      }));
    }
  }, [filter, data, objectFilter, zoneFilter, category]);
  const handleClick = (e, item) => {
    e.stopPropagation();
    if (e.detail === 1) {
      if (item?.status_name === "Размещен") {
        viewer?.current?.zoomToElement(item?.id, viewer?.current?.instance?.transformState?.scale);
      }
      setSelectItem(item);
      setActiveEditItem(null);
    }
    if (e.detail === 2) {
      setShowEditModal(true);
      setActiveItem(item);
    }
  };
  const handleClickObjectSort = () => {
    if (objectFilter === "asc" || objectFilter === null) {
      setObjectFilter("desc");
      setZoneFilter(null);
    }
    if (objectFilter === "desc") {
      setObjectFilter("asc");
      setZoneFilter(null);
    }
  };
  const handleClickZonesSort = () => {
    if (zoneFilter === "asc" || zoneFilter === null) {
      setZoneFilter("desc");
      setObjectFilter(null);
    }
    if (zoneFilter === "desc") {
      setZoneFilter("asc");
      setObjectFilter(null);
    }
  };
  return !showFilter ? /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      viewer?.current?.resetTransform();
      setShowFilter(true);
    },
    className: `bg-white fixed w-6 h-12 top-1/2 left-0 z-50 flex justify-center items-center border shadow-buttonHeader border-gray-200 transform -translate-y-1/2`
  }, /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$5,
    alt: "arrow"
  })) : /*#__PURE__*/React.createElement("div", {
    className: "z-50 bg-white w-80 h-100 overflow-hidden w-80 h-screen shrink-0 border flex flex-col"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setShowFilter(false);
      viewer?.current?.resetTransform();
    },
    className: `bg-white fixed w-6 h-12 top-1/2 left-80 z-50 flex justify-center items-center border shadow-buttonHeader border-gray-200 transform -translate-y-1/2`
  }, /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$5,
    alt: "arrow",
    className: "rotate-180"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700 overflow-hidden shrink-0"
  }, /*#__PURE__*/React.createElement("ul", {
    className: "flex justify-between -mb-px mt-2 px-1"
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFilter("Размещен");
    },
    className: `${filter === "Размещен" ? "border-blueCustom border-b-4" : "hover:border-b-4 hover:border-gray-300"} inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active`
  }, "\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u044B")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFilter("Не размещен");
    },
    className: `${filter === "Не размещен" ? "border-blueCustom border-b-4" : "hover:border-b-4 hover:border-gray-300"} inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active`
  }, "\u041D\u0435 \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u044B")), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFilter("Архив");
    },
    className: `${filter === "Архив" ? "border-blueCustom border-b-4" : "hover:border-b-4 hover:border-gray-300"} inline-block p-1 text-base font-semibold text-slate-800 rounded-t-lg active `
  }, "\u0410\u0440\u0445\u0438\u0432")))), /*#__PURE__*/React.createElement("div", {
    className: "flex  border-b border-gray-300 w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex px-2 w-full justify-between items-center my-4"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "type",
    className: "block text-sm text-gray-900 dark:text-white mr-2"
  }, "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C:"), /*#__PURE__*/React.createElement("select", {
    onChange: event => setCategory(event.target?.value),
    className: "w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  }, /*#__PURE__*/React.createElement("option", {
    selected: true,
    value: ""
  }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F"), categoies?.map(item => /*#__PURE__*/React.createElement("option", {
    key: item.id,
    value: item?.id
  }, item?.name))))), /*#__PURE__*/React.createElement("div", {
    className: "flex  border-b border-gray-300 w-full"
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => handleClickObjectSort(),
    className: "w-1/2 pt-4 pl-2 pb-4 cursor-pointer flex hover:font-bold text-sm"
  }, /*#__PURE__*/React.createElement("p", null, "\u041E\u0431\u044A\u0435\u043A\u0442"), /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$4,
    className: "ml-1",
    alt: "swith"
  })), /*#__PURE__*/React.createElement("div", {
    onClick: () => handleClickZonesSort(),
    className: "w-1/2 pt-4 pb-4 cursor-pointer flex hover:font-bold text-sm"
  }, /*#__PURE__*/React.createElement("p", null, "\u0417\u043E\u043D\u0430"), /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$4,
    className: "ml-1",
    alt: "swith"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex text-sm grow flex-col overflow-auto"
  }, dataFilter?.map(item => /*#__PURE__*/React.createElement(FilterItem, {
    zones: zones,
    key: item.id,
    item: item,
    handleClick: handleClick
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex pb-3 pt-3 border-t border-gray-300"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setShowEditModal(true);
    },
    className: "text-white bg-blueCustom rounded text-lg px-2 py-2 outline-none focus:outline-none w-11/12 m-auto ease-linear transition-all duration-150"
  }, "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043D\u043E\u0432\u044B\u0439 \u043E\u0431\u044A\u0435\u043A\u0442")));
};

var img$3 = "data:image/svg+xml,%3csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M9.54545 5.45455C9.54545 5.10511 9.27273 4.90909 9.27273 4.90909L7.09091 2.72727C7.09091 2.72727 6.85227 2.45455 6.54545 2.45455C6.23864 2.45455 6 2.72727 6 2.72727L0.545455 8.18182C0.545455 8.18182 0.246913 8.48504 0.136364 8.72727C0.0018747 9.02196 0 9.54545 0 9.54545V11.4545C0 11.4545 1.12653e-05 11.7273 0.136364 11.8636C0.272716 12 0.545455 12 0.545455 12H2.45455C2.45455 12 2.97804 11.9981 3.27273 11.8636C3.51496 11.7531 3.81818 11.4545 3.81818 11.4545L9.27273 6C9.27273 6 9.54545 5.80398 9.54545 5.45455ZM0.954546 9C1.06509 8.75777 1.36364 8.45455 1.36364 8.45455L6.27273 3.54545C6.27273 3.54545 6.35795 3.40909 6.54545 3.40909C6.73295 3.40909 6.81818 3.54545 6.81818 3.54545L7.36364 4.09091C7.36364 4.09091 7.5 4.18466 7.5 4.36364C7.5 4.54261 7.36364 4.63636 7.36364 4.63636L1.36364 10.6364C1.36364 10.6364 1.09091 10.9091 0.954546 10.7727C0.818182 10.6364 0.818182 10.5 0.818182 10.5V9.54545C0.818182 9.54545 0.820057 9.29469 0.954546 9Z' fill='%2322252A'/%3e%3cpath d='M7.36364 2.45455L9.54545 4.63636C9.54545 4.63636 9.75852 4.90909 10.0909 4.90909C10.4233 4.90909 10.6364 4.63636 10.6364 4.63636L11.7273 3.54545C11.7273 3.54545 12 3.34943 12 3C12 2.65057 11.7273 2.45455 11.7273 2.45455L9.54545 0.272727C9.54545 0.272727 9.32386 0 9 0C8.67614 0 8.45455 0.272727 8.45455 0.272727L7.36364 1.36364C7.36364 1.36364 7.09091 1.58523 7.09091 1.90909C7.09091 2.23295 7.36364 2.45455 7.36364 2.45455Z' fill='%2322252A'/%3e%3c/svg%3e";

var img$2 = "data:image/svg+xml,%3csvg width='14' height='13' viewBox='0 0 14 13' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.78033 0.969668C6.07322 1.26256 6.07322 1.73744 5.78033 2.03033L2.81066 5H9.25C11.8733 5 14 7.12663 14 9.75V12.25C14 12.6642 13.6642 13 13.25 13C12.8358 13 12.5 12.6642 12.5 12.25V9.75C12.5 7.95507 11.0449 6.5 9.25 6.5H2.81066L5.78033 9.4697C6.07322 9.7626 6.07322 10.2374 5.78033 10.5303C5.48744 10.8232 5.01256 10.8232 4.71967 10.5303L0.469668 6.28033C0.176777 5.98744 0.176777 5.51256 0.469668 5.21967L4.71967 0.969668C5.01256 0.676777 5.48744 0.676777 5.78033 0.969668Z' fill='%2322252A'/%3e%3c/svg%3e";

const Header = _ref => {
  let {
    setToggleEditMode,
    toggleEditMode,
    saveToggle,
    setSaveToggle,
    setActiveEditItem,
    setSelectItem
  } = _ref;
  const allDataMeta = useStore(store => store.data.allDataMeta);
  return /*#__PURE__*/React.createElement("div", {
    className: "fixed flex right-5 top-4 z-50"
  }, saveToggle && toggleEditMode && /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      // setActiveEditItem(null);
      // setSelectItem(null);
      // setSaveToggle(false);
      const event = new CustomEvent("return");
      window.document.dispatchEvent(event);
    },
    className: `bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-12 h-8 mr-2`
  }, /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$2,
    alt: "back",
    className: "mr-1"
  })), saveToggle && toggleEditMode ? /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setActiveEditItem(null);
      setSelectItem(null);
      setSaveToggle(false);
      const event = new CustomEvent("save");
      event.param = {
        json: allDataMeta
      };
      window.document.dispatchEvent(event);
    },
    className: `bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-56 h-8`
  }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F") : /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setToggleEditMode(!toggleEditMode);
    },
    className: `bg-white flex items-center rounded transition-all duration-500 border text-sm justify-center shadow-buttonHeader w-56 h-8`
  }, /*#__PURE__*/React.createElement("img", {
    // eslint-disable-next-line no-undef
    src: process.env.REACT_APP_PUBLIC_URL + img$3,
    alt: "pen",
    className: "mr-1"
  }), "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0440\u0430\u0441\u0441\u0430\u0434\u043A\u0438"));
};

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		Object.keys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	Object.keys(source).forEach(function(key) {
		if (!options.isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		} else {
			destination[key] = deepmerge(target[key], source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

var freeGlobal$1 = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal$1 || freeSelf || Function('return this')();

var root$1 = root;

/** Built-in value references. */
var Symbol$1 = root$1.Symbol;

var Symbol$2 = Symbol$1;

/** Used for built-in method references. */
var objectProto$d = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$a = objectProto$d.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$d.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$c = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$c.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

var getPrototype$1 = getPrototype;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var objectTag$3 = '[object Object]';

/** Used for built-in method references. */
var funcProto$2 = Function.prototype,
    objectProto$b = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString$2.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag$3) {
    return false;
  }
  var proto = getPrototype$1(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$9.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString$2.call(Ctor) == objectCtorString;
}

var isArray$2 = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;
var hasElementType = typeof Element !== 'undefined';

function equal(a, b) {
  // fast-deep-equal index.js 2.0.1
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray$2(a)
      , arrB = isArray$2(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;
    // end fast-deep-equal

    // start react-fast-compare
    // custom handling for DOM elements
    if (hasElementType && a instanceof Element && b instanceof Element)
      return a === b;

    // custom handling for React
    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (key === '_owner' && a.$$typeof) {
        // React-specific: avoid traversing React elements' _owner.
        //  _owner contains circular references
        // and is not needed when comparing the actual elements (and not their owners)
        // .$$typeof and ._store on just reasonable markers of a react element
        continue;
      } else {
        // all other properties should be traversed as usual
        if (!equal(a[key], b[key])) return false;
      }
    }
    // end react-fast-compare

    // fast-deep-equal index.js 2.0.1
    return true;
  }

  return a !== a && b !== b;
}
// end fast-deep-equal

var reactFastCompare = function exportedEqual(a, b) {
  try {
    return equal(a, b);
  } catch (error) {
    if ((error.message && error.message.match(/stack|recursion/i)) || (error.number === -2146828260)) {
      // warn on circular references, don't crash
      // browsers give this different errors name and messages:
      // chrome/safari: "RangeError", "Maximum call stack size exceeded"
      // firefox: "InternalError", too much recursion"
      // edge: "Error", "Out of stack space"
      console.warn('Warning: react-fast-compare does not handle circular references.', error.name, error.message);
      return false;
    }
    // some other error. we should definitely know about these
    throw error;
  }
};

var isEqual = /*@__PURE__*/getDefaultExportFromCjs(reactFastCompare);

var isProduction = process.env.NODE_ENV === 'production';
function warning(condition, message) {
  if (!isProduction) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction$1(value) {
  if (!isObject$1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
}

/** Used to detect overreaching core-js shims. */
var coreJsData = root$1['__core-js_shared__'];

var coreJsData$1 = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/** Used for built-in method references. */
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$a = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty$8).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/* Built-in method references that are verified to be native. */
var Map$1 = getNative(root$1, 'Map');

var Map$2 = Map$1;

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

var nativeCreate$1 = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate$1) {
    var result = data[key];
    return result === HASH_UNDEFINED$1 ? undefined : result;
  }
  return hasOwnProperty$7.call(data, key) ? data[key] : undefined;
}

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate$1 ? (data[key] !== undefined) : hasOwnProperty$6.call(data, key);
}

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate$1 && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map$2 || ListCache),
    'string': new Hash
  };
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$2 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var defineProperty$1 = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty$1) {
    defineProperty$1(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$5.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$2;
}

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$6.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$4.call(value, 'callee') &&
    !propertyIsEnumerable$1.call(value, 'callee');
};

var isArguments$1 = isArguments;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray$1 = isArray;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/** Detect free variable `exports`. */
var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;

/** Built-in value references. */
var Buffer$2 = moduleExports$2 ? root$1.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer$2 ? Buffer$2.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

var isBuffer$1 = isBuffer;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag$4 = '[object Map]',
    numberTag$2 = '[object Number]',
    objectTag$2 = '[object Object]',
    regexpTag$2 = '[object RegExp]',
    setTag$4 = '[object Set]',
    stringTag$2 = '[object String]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag$2] = typedArrayTags[float64Tag$2] =
typedArrayTags[int8Tag$2] = typedArrayTags[int16Tag$2] =
typedArrayTags[int32Tag$2] = typedArrayTags[uint8Tag$2] =
typedArrayTags[uint8ClampedTag$2] = typedArrayTags[uint16Tag$2] =
typedArrayTags[uint32Tag$2] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] =
typedArrayTags[arrayBufferTag$2] = typedArrayTags[boolTag$2] =
typedArrayTags[dataViewTag$3] = typedArrayTags[dateTag$2] =
typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag$4] = typedArrayTags[numberTag$2] =
typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$2] =
typedArrayTags[setTag$4] = typedArrayTags[stringTag$2] =
typedArrayTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/** Detect free variable `exports`. */
var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports$1 && freeGlobal$1.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

var nodeUtil$1 = nodeUtil;

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil$1 && nodeUtil$1.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

var isTypedArray$1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$5.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray$1(value),
      isArg = !isArr && isArguments$1(value),
      isBuff = !isArr && !isArg && isBuffer$1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray$1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$3.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$4;

  return value === proto;
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

var nativeKeys$1 = nativeKeys;

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys$1(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$2.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction$1(value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && copyObject(source, keys(source), object);
}

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject$1(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$1.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && copyObject(source, keysIn(source), object);
}

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer$1 = moduleExports ? root$1.Buffer : undefined,
    allocUnsafe = Buffer$1 ? Buffer$1.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$1.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols$1 ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols$1(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

var getSymbols$1 = getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return copyObject(source, getSymbols$1(source), object);
}

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
  var result = [];
  while (object) {
    arrayPush(result, getSymbols$1(object));
    object = getPrototype$1(object);
  }
  return result;
};

var getSymbolsIn$1 = getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return copyObject(source, getSymbolsIn$1(source), object);
}

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
}

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols$1);
}

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return baseGetAllKeys(object, keysIn, getSymbolsIn$1);
}

/* Built-in method references that are verified to be native. */
var DataView = getNative(root$1, 'DataView');

var DataView$1 = DataView;

/* Built-in method references that are verified to be native. */
var Promise$1 = getNative(root$1, 'Promise');

var Promise$2 = Promise$1;

/* Built-in method references that are verified to be native. */
var Set$1 = getNative(root$1, 'Set');

var Set$2 = Set$1;

/* Built-in method references that are verified to be native. */
var WeakMap$1 = getNative(root$1, 'WeakMap');

var WeakMap$2 = WeakMap$1;

/** `Object#toString` result references. */
var mapTag$3 = '[object Map]',
    objectTag$1 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$3 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = toSource(DataView$1),
    mapCtorString = toSource(Map$2),
    promiseCtorString = toSource(Promise$2),
    setCtorString = toSource(Set$2),
    weakMapCtorString = toSource(WeakMap$2);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((DataView$1 && getTag(new DataView$1(new ArrayBuffer(1))) != dataViewTag$2) ||
    (Map$2 && getTag(new Map$2) != mapTag$3) ||
    (Promise$2 && getTag(Promise$2.resolve()) != promiseTag) ||
    (Set$2 && getTag(new Set$2) != setTag$3) ||
    (WeakMap$2 && getTag(new WeakMap$2) != weakMapTag$1)) {
  getTag = function(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag$1 ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$2;
        case mapCtorString: return mapTag$3;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$3;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var getTag$1 = getTag;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/** Built-in value references. */
var Uint8Array$1 = root$1.Uint8Array;

var Uint8Array$2 = Uint8Array$1;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array$2(result).set(new Uint8Array$2(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/** Used to convert symbols to primitives and strings. */
var symbolProto$1 = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    mapTag$2 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag$2 = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$1 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return cloneArrayBuffer(object);

    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);

    case dataViewTag$1:
      return cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return cloneTypedArray(object, isDeep);

    case mapTag$2:
      return new Ctor;

    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);

    case regexpTag$1:
      return cloneRegExp(object);

    case setTag$2:
      return new Ctor;

    case symbolTag$2:
      return cloneSymbol(object);
  }
}

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject$1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var baseCreate$1 = baseCreate;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate$1(getPrototype$1(object))
    : {};
}

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return isObjectLike(value) && getTag$1(value) == mapTag$1;
}

/* Node.js helper references. */
var nodeIsMap = nodeUtil$1 && nodeUtil$1.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

var isMap$1 = isMap;

/** `Object#toString` result references. */
var setTag$1 = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return isObjectLike(value) && getTag$1(value) == setTag$1;
}

/* Node.js helper references. */
var nodeIsSet = nodeUtil$1 && nodeUtil$1.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

var isSet$1 = isSet;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG$1 = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag$1 = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag$1] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject$1(value)) {
    return value;
  }
  var isArr = isArray$1(value);
  if (isArr) {
    result = initCloneArray(value);
    if (!isDeep) {
      return copyArray(value, result);
    }
  } else {
    var tag = getTag$1(value),
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer$1(value)) {
      return cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? copySymbolsIn(value, baseAssignIn(result, value))
          : copySymbols(value, baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (isSet$1(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (isMap$1(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? getAllKeysIn : getAllKeys)
    : (isFlat ? keysIn : keys);

  var props = isArr ? undefined : keysFunc(value);
  arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

/** Used to compose bitmasks for cloning. */
var CLONE_SYMBOLS_FLAG = 4;

/**
 * Creates a shallow clone of `value`.
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
 * and supports cloning arrays, array buffers, booleans, date objects, maps,
 * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
 * arrays. The own enumerable properties of `arguments` objects are cloned
 * as plain objects. An empty object is returned for uncloneable values such
 * as error objects, functions, DOM nodes, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 * @see _.cloneDeep
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var shallow = _.clone(objects);
 * console.log(shallow[0] === objects[0]);
 * // => true
 */
function clone(value) {
  return baseClone(value, CLONE_SYMBOLS_FLAG);
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

var stringToPath$1 = stringToPath;

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
}

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol$2 ? Symbol$2.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray$1(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/**
 * Converts `value` to a property path array.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Util
 * @param {*} value The value to convert.
 * @returns {Array} Returns the new property path array.
 * @example
 *
 * _.toPath('a.b.c');
 * // => ['a', 'b', 'c']
 *
 * _.toPath('a[0].b.c');
 * // => ['a', '0', 'b', 'c']
 */
function toPath(value) {
  if (isArray$1(value)) {
    return arrayMap(value, toKey);
  }
  return isSymbol(value) ? [value] : copyArray(stringToPath$1(toString(value)));
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var FormikContext = /*#__PURE__*/React$1.createContext(undefined);
FormikContext.displayName = 'FormikContext';
var FormikProvider = FormikContext.Provider;
FormikContext.Consumer;
function useFormikContext() {
  var formik = React$1.useContext(FormikContext);
  !!!formik ? process.env.NODE_ENV !== "production" ? warning(false, "Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.") : warning(false) : void 0;
  return formik;
}
/** @private is the given object a Function? */

var isFunction = function isFunction(obj) {
  return typeof obj === 'function';
};
/** @private is the given object an Object? */

var isObject = function isObject(obj) {
  return obj !== null && typeof obj === 'object';
};
/** @private is the given object an integer? */

var isInteger = function isInteger(obj) {
  return String(Math.floor(Number(obj))) === obj;
};
/** @private is the given object a string? */

var isString = function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
};
/** @private Does a React component have exactly 0 children? */

var isEmptyChildren = function isEmptyChildren(children) {
  return React$1.Children.count(children) === 0;
};
/** @private is the given object/value a promise? */

var isPromise = function isPromise(value) {
  return isObject(value) && isFunction(value.then);
};
/**
 * Same as document.activeElement but wraps in a try-catch block. In IE it is
 * not safe to call document.activeElement if there is nothing focused.
 *
 * The activeElement will be null only if the document or document body is not
 * yet defined.
 *
 * @param {?Document} doc Defaults to current document.
 * @return {Element | null}
 * @see https://github.com/facebook/fbjs/blob/master/packages/fbjs/src/core/dom/getActiveElement.js
 */

function getActiveElement(doc) {
  doc = doc || (typeof document !== 'undefined' ? document : undefined);

  if (typeof doc === 'undefined') {
    return null;
  }

  try {
    return doc.activeElement || doc.body;
  } catch (e) {
    return doc.body;
  }
}
/**
 * Deeply get a value from an object via its path.
 */

function getIn(obj, key, def, p) {
  if (p === void 0) {
    p = 0;
  }

  var path = toPath(key);

  while (obj && p < path.length) {
    obj = obj[path[p++]];
  } // check if path is not in the end


  if (p !== path.length && !obj) {
    return def;
  }

  return obj === undefined ? def : obj;
}
/**
 * Deeply set a value from in object via it's path. If the value at `path`
 * has changed, return a shallow copy of obj with `value` set at `path`.
 * If `value` has not changed, return the original `obj`.
 *
 * Existing objects / arrays along `path` are also shallow copied. Sibling
 * objects along path retain the same internal js reference. Since new
 * objects / arrays are only created along `path`, we can test if anything
 * changed in a nested structure by comparing the object's reference in
 * the old and new object, similar to how russian doll cache invalidation
 * works.
 *
 * In earlier versions of this function, which used cloneDeep, there were
 * issues whereby settings a nested value would mutate the parent
 * instead of creating a new object. `clone` avoids that bug making a
 * shallow copy of the objects along the update path
 * so no object is mutated in place.
 *
 * Before changing this function, please read through the following
 * discussions.
 *
 * @see https://github.com/developit/linkstate
 * @see https://github.com/jaredpalmer/formik/pull/123
 */

function setIn(obj, path, value) {
  var res = clone(obj); // this keeps inheritance when obj is a class

  var resVal = res;
  var i = 0;
  var pathArray = toPath(path);

  for (; i < pathArray.length - 1; i++) {
    var currentPath = pathArray[i];
    var currentObj = getIn(obj, pathArray.slice(0, i + 1));

    if (currentObj && (isObject(currentObj) || Array.isArray(currentObj))) {
      resVal = resVal[currentPath] = clone(currentObj);
    } else {
      var nextPath = pathArray[i + 1];
      resVal = resVal[currentPath] = isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
    }
  } // Return original object if new value is the same as current


  if ((i === 0 ? obj : resVal)[pathArray[i]] === value) {
    return obj;
  }

  if (value === undefined) {
    delete resVal[pathArray[i]];
  } else {
    resVal[pathArray[i]] = value;
  } // If the path array has a single element, the loop did not run.
  // Deleting on `resVal` had no effect in this scenario, so we delete on the result instead.


  if (i === 0 && value === undefined) {
    delete res[pathArray[i]];
  }

  return res;
}
/**
 * Recursively a set the same value for all keys and arrays nested object, cloning
 * @param object
 * @param value
 * @param visited
 * @param response
 */

function setNestedObjectValues(object, value, visited, response) {
  if (visited === void 0) {
    visited = new WeakMap();
  }

  if (response === void 0) {
    response = {};
  }

  for (var _i = 0, _Object$keys = Object.keys(object); _i < _Object$keys.length; _i++) {
    var k = _Object$keys[_i];
    var val = object[k];

    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true); // In order to keep array values consistent for both dot path  and
        // bracket syntax, we need to check if this is an array so that
        // this will output  { friends: [true] } and not { friends: { "0": true } }

        response[k] = Array.isArray(val) ? [] : {};
        setNestedObjectValues(val, value, visited, response[k]);
      }
    } else {
      response[k] = value;
    }
  }

  return response;
}

function formikReducer(state, msg) {
  switch (msg.type) {
    case 'SET_VALUES':
      return _extends({}, state, {
        values: msg.payload
      });

    case 'SET_TOUCHED':
      return _extends({}, state, {
        touched: msg.payload
      });

    case 'SET_ERRORS':
      if (isEqual(state.errors, msg.payload)) {
        return state;
      }

      return _extends({}, state, {
        errors: msg.payload
      });

    case 'SET_STATUS':
      return _extends({}, state, {
        status: msg.payload
      });

    case 'SET_ISSUBMITTING':
      return _extends({}, state, {
        isSubmitting: msg.payload
      });

    case 'SET_ISVALIDATING':
      return _extends({}, state, {
        isValidating: msg.payload
      });

    case 'SET_FIELD_VALUE':
      return _extends({}, state, {
        values: setIn(state.values, msg.payload.field, msg.payload.value)
      });

    case 'SET_FIELD_TOUCHED':
      return _extends({}, state, {
        touched: setIn(state.touched, msg.payload.field, msg.payload.value)
      });

    case 'SET_FIELD_ERROR':
      return _extends({}, state, {
        errors: setIn(state.errors, msg.payload.field, msg.payload.value)
      });

    case 'RESET_FORM':
      return _extends({}, state, msg.payload);

    case 'SET_FORMIK_STATE':
      return msg.payload(state);

    case 'SUBMIT_ATTEMPT':
      return _extends({}, state, {
        touched: setNestedObjectValues(state.values, true),
        isSubmitting: true,
        submitCount: state.submitCount + 1
      });

    case 'SUBMIT_FAILURE':
      return _extends({}, state, {
        isSubmitting: false
      });

    case 'SUBMIT_SUCCESS':
      return _extends({}, state, {
        isSubmitting: false
      });

    default:
      return state;
  }
} // Initial empty states // objects


var emptyErrors = {};
var emptyTouched = {};
function useFormik(_ref) {
  var _ref$validateOnChange = _ref.validateOnChange,
      validateOnChange = _ref$validateOnChange === void 0 ? true : _ref$validateOnChange,
      _ref$validateOnBlur = _ref.validateOnBlur,
      validateOnBlur = _ref$validateOnBlur === void 0 ? true : _ref$validateOnBlur,
      _ref$validateOnMount = _ref.validateOnMount,
      validateOnMount = _ref$validateOnMount === void 0 ? false : _ref$validateOnMount,
      isInitialValid = _ref.isInitialValid,
      _ref$enableReinitiali = _ref.enableReinitialize,
      enableReinitialize = _ref$enableReinitiali === void 0 ? false : _ref$enableReinitiali,
      onSubmit = _ref.onSubmit,
      rest = _objectWithoutPropertiesLoose(_ref, ["validateOnChange", "validateOnBlur", "validateOnMount", "isInitialValid", "enableReinitialize", "onSubmit"]);

  var props = _extends({
    validateOnChange: validateOnChange,
    validateOnBlur: validateOnBlur,
    validateOnMount: validateOnMount,
    onSubmit: onSubmit
  }, rest);

  var initialValues = React$1.useRef(props.initialValues);
  var initialErrors = React$1.useRef(props.initialErrors || emptyErrors);
  var initialTouched = React$1.useRef(props.initialTouched || emptyTouched);
  var initialStatus = React$1.useRef(props.initialStatus);
  var isMounted = React$1.useRef(false);
  var fieldRegistry = React$1.useRef({});

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React$1.useEffect(function () {
      !(typeof isInitialValid === 'undefined') ? process.env.NODE_ENV !== "production" ? warning(false, 'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.') : warning(false) : void 0; // eslint-disable-next-line
    }, []);
  }

  React$1.useEffect(function () {
    isMounted.current = true;
    return function () {
      isMounted.current = false;
    };
  }, []);

  var _React$useState = React$1.useState(0),
      setIteration = _React$useState[1];

  var stateRef = React$1.useRef({
    values: props.initialValues,
    errors: props.initialErrors || emptyErrors,
    touched: props.initialTouched || emptyTouched,
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0
  });
  var state = stateRef.current;
  var dispatch = React$1.useCallback(function (action) {
    var prev = stateRef.current;
    stateRef.current = formikReducer(prev, action); // force rerender

    if (prev !== stateRef.current) setIteration(function (x) {
      return x + 1;
    });
  }, []);
  var runValidateHandler = React$1.useCallback(function (values, field) {
    return new Promise(function (resolve, reject) {
      var maybePromisedErrors = props.validate(values, field);

      if (maybePromisedErrors == null) {
        // use loose null check here on purpose
        resolve(emptyErrors);
      } else if (isPromise(maybePromisedErrors)) {
        maybePromisedErrors.then(function (errors) {
          resolve(errors || emptyErrors);
        }, function (actualException) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn("Warning: An unhandled error was caught during validation in <Formik validate />", actualException);
          }

          reject(actualException);
        });
      } else {
        resolve(maybePromisedErrors);
      }
    });
  }, [props.validate]);
  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */

  var runValidationSchema = React$1.useCallback(function (values, field) {
    var validationSchema = props.validationSchema;
    var schema = isFunction(validationSchema) ? validationSchema(field) : validationSchema;
    var promise = field && schema.validateAt ? schema.validateAt(field, values) : validateYupSchema(values, schema);
    return new Promise(function (resolve, reject) {
      promise.then(function () {
        resolve(emptyErrors);
      }, function (err) {
        // Yup will throw a validation error if validation fails. We catch those and
        // resolve them into Formik errors. We can sniff if something is a Yup error
        // by checking error.name.
        // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
        if (err.name === 'ValidationError') {
          resolve(yupToFormErrors(err));
        } else {
          // We throw any other errors
          if (process.env.NODE_ENV !== 'production') {
            console.warn("Warning: An unhandled error was caught during validation in <Formik validationSchema />", err);
          }

          reject(err);
        }
      });
    });
  }, [props.validationSchema]);
  var runSingleFieldLevelValidation = React$1.useCallback(function (field, value) {
    return new Promise(function (resolve) {
      return resolve(fieldRegistry.current[field].validate(value));
    });
  }, []);
  var runFieldLevelValidations = React$1.useCallback(function (values) {
    var fieldKeysWithValidation = Object.keys(fieldRegistry.current).filter(function (f) {
      return isFunction(fieldRegistry.current[f].validate);
    }); // Construct an array with all of the field validation functions

    var fieldValidations = fieldKeysWithValidation.length > 0 ? fieldKeysWithValidation.map(function (f) {
      return runSingleFieldLevelValidation(f, getIn(values, f));
    }) : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')]; // use special case ;)

    return Promise.all(fieldValidations).then(function (fieldErrorsList) {
      return fieldErrorsList.reduce(function (prev, curr, index) {
        if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
          return prev;
        }

        if (curr) {
          prev = setIn(prev, fieldKeysWithValidation[index], curr);
        }

        return prev;
      }, {});
    });
  }, [runSingleFieldLevelValidation]); // Run all validations and return the result

  var runAllValidations = React$1.useCallback(function (values) {
    return Promise.all([runFieldLevelValidations(values), props.validationSchema ? runValidationSchema(values) : {}, props.validate ? runValidateHandler(values) : {}]).then(function (_ref2) {
      var fieldErrors = _ref2[0],
          schemaErrors = _ref2[1],
          validateErrors = _ref2[2];
      var combinedErrors = deepmerge_1.all([fieldErrors, schemaErrors, validateErrors], {
        arrayMerge: arrayMerge
      });
      return combinedErrors;
    });
  }, [props.validate, props.validationSchema, runFieldLevelValidations, runValidateHandler, runValidationSchema]); // Run all validations methods and update state accordingly

  var validateFormWithHighPriority = useEventCallback(function (values) {
    if (values === void 0) {
      values = state.values;
    }

    dispatch({
      type: 'SET_ISVALIDATING',
      payload: true
    });
    return runAllValidations(values).then(function (combinedErrors) {
      if (!!isMounted.current) {
        dispatch({
          type: 'SET_ISVALIDATING',
          payload: false
        });
        dispatch({
          type: 'SET_ERRORS',
          payload: combinedErrors
        });
      }

      return combinedErrors;
    });
  });
  React$1.useEffect(function () {
    if (validateOnMount && isMounted.current === true && isEqual(initialValues.current, props.initialValues)) {
      validateFormWithHighPriority(initialValues.current);
    }
  }, [validateOnMount, validateFormWithHighPriority]);
  var resetForm = React$1.useCallback(function (nextState) {
    var values = nextState && nextState.values ? nextState.values : initialValues.current;
    var errors = nextState && nextState.errors ? nextState.errors : initialErrors.current ? initialErrors.current : props.initialErrors || {};
    var touched = nextState && nextState.touched ? nextState.touched : initialTouched.current ? initialTouched.current : props.initialTouched || {};
    var status = nextState && nextState.status ? nextState.status : initialStatus.current ? initialStatus.current : props.initialStatus;
    initialValues.current = values;
    initialErrors.current = errors;
    initialTouched.current = touched;
    initialStatus.current = status;

    var dispatchFn = function dispatchFn() {
      dispatch({
        type: 'RESET_FORM',
        payload: {
          isSubmitting: !!nextState && !!nextState.isSubmitting,
          errors: errors,
          touched: touched,
          status: status,
          values: values,
          isValidating: !!nextState && !!nextState.isValidating,
          submitCount: !!nextState && !!nextState.submitCount && typeof nextState.submitCount === 'number' ? nextState.submitCount : 0
        }
      });
    };

    if (props.onReset) {
      var maybePromisedOnReset = props.onReset(state.values, imperativeMethods);

      if (isPromise(maybePromisedOnReset)) {
        maybePromisedOnReset.then(dispatchFn);
      } else {
        dispatchFn();
      }
    } else {
      dispatchFn();
    }
  }, [props.initialErrors, props.initialStatus, props.initialTouched, props.onReset]);
  React$1.useEffect(function () {
    if (isMounted.current === true && !isEqual(initialValues.current, props.initialValues)) {
      if (enableReinitialize) {
        initialValues.current = props.initialValues;
        resetForm();

        if (validateOnMount) {
          validateFormWithHighPriority(initialValues.current);
        }
      }
    }
  }, [enableReinitialize, props.initialValues, resetForm, validateOnMount, validateFormWithHighPriority]);
  React$1.useEffect(function () {
    if (enableReinitialize && isMounted.current === true && !isEqual(initialErrors.current, props.initialErrors)) {
      initialErrors.current = props.initialErrors || emptyErrors;
      dispatch({
        type: 'SET_ERRORS',
        payload: props.initialErrors || emptyErrors
      });
    }
  }, [enableReinitialize, props.initialErrors]);
  React$1.useEffect(function () {
    if (enableReinitialize && isMounted.current === true && !isEqual(initialTouched.current, props.initialTouched)) {
      initialTouched.current = props.initialTouched || emptyTouched;
      dispatch({
        type: 'SET_TOUCHED',
        payload: props.initialTouched || emptyTouched
      });
    }
  }, [enableReinitialize, props.initialTouched]);
  React$1.useEffect(function () {
    if (enableReinitialize && isMounted.current === true && !isEqual(initialStatus.current, props.initialStatus)) {
      initialStatus.current = props.initialStatus;
      dispatch({
        type: 'SET_STATUS',
        payload: props.initialStatus
      });
    }
  }, [enableReinitialize, props.initialStatus, props.initialTouched]);
  var validateField = useEventCallback(function (name) {
    // This will efficiently validate a single field by avoiding state
    // changes if the validation function is synchronous. It's different from
    // what is called when using validateForm.
    if (fieldRegistry.current[name] && isFunction(fieldRegistry.current[name].validate)) {
      var value = getIn(state.values, name);
      var maybePromise = fieldRegistry.current[name].validate(value);

      if (isPromise(maybePromise)) {
        // Only flip isValidating if the function is async.
        dispatch({
          type: 'SET_ISVALIDATING',
          payload: true
        });
        return maybePromise.then(function (x) {
          return x;
        }).then(function (error) {
          dispatch({
            type: 'SET_FIELD_ERROR',
            payload: {
              field: name,
              value: error
            }
          });
          dispatch({
            type: 'SET_ISVALIDATING',
            payload: false
          });
        });
      } else {
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: {
            field: name,
            value: maybePromise
          }
        });
        return Promise.resolve(maybePromise);
      }
    } else if (props.validationSchema) {
      dispatch({
        type: 'SET_ISVALIDATING',
        payload: true
      });
      return runValidationSchema(state.values, name).then(function (x) {
        return x;
      }).then(function (error) {
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: {
            field: name,
            value: getIn(error, name)
          }
        });
        dispatch({
          type: 'SET_ISVALIDATING',
          payload: false
        });
      });
    }

    return Promise.resolve();
  });
  var registerField = React$1.useCallback(function (name, _ref3) {
    var validate = _ref3.validate;
    fieldRegistry.current[name] = {
      validate: validate
    };
  }, []);
  var unregisterField = React$1.useCallback(function (name) {
    delete fieldRegistry.current[name];
  }, []);
  var setTouched = useEventCallback(function (touched, shouldValidate) {
    dispatch({
      type: 'SET_TOUCHED',
      payload: touched
    });
    var willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate;
    return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve();
  });
  var setErrors = React$1.useCallback(function (errors) {
    dispatch({
      type: 'SET_ERRORS',
      payload: errors
    });
  }, []);
  var setValues = useEventCallback(function (values, shouldValidate) {
    var resolvedValues = isFunction(values) ? values(state.values) : values;
    dispatch({
      type: 'SET_VALUES',
      payload: resolvedValues
    });
    var willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate;
    return willValidate ? validateFormWithHighPriority(resolvedValues) : Promise.resolve();
  });
  var setFieldError = React$1.useCallback(function (field, value) {
    dispatch({
      type: 'SET_FIELD_ERROR',
      payload: {
        field: field,
        value: value
      }
    });
  }, []);
  var setFieldValue = useEventCallback(function (field, value, shouldValidate) {
    dispatch({
      type: 'SET_FIELD_VALUE',
      payload: {
        field: field,
        value: value
      }
    });
    var willValidate = shouldValidate === undefined ? validateOnChange : shouldValidate;
    return willValidate ? validateFormWithHighPriority(setIn(state.values, field, value)) : Promise.resolve();
  });
  var executeChange = React$1.useCallback(function (eventOrTextValue, maybePath) {
    // By default, assume that the first argument is a string. This allows us to use
    // handleChange with React Native and React Native Web's onChangeText prop which
    // provides just the value of the input.
    var field = maybePath;
    var val = eventOrTextValue;
    var parsed; // If the first argument is not a string though, it has to be a synthetic React Event (or a fake one),
    // so we handle like we would a normal HTML change event.

    if (!isString(eventOrTextValue)) {
      // If we can, persist the event
      // @see https://reactjs.org/docs/events.html#event-pooling
      if (eventOrTextValue.persist) {
        eventOrTextValue.persist();
      }

      var target = eventOrTextValue.target ? eventOrTextValue.target : eventOrTextValue.currentTarget;
      var type = target.type,
          name = target.name,
          id = target.id,
          value = target.value,
          checked = target.checked,
          outerHTML = target.outerHTML,
          options = target.options,
          multiple = target.multiple;
      field = maybePath ? maybePath : name ? name : id;

      if (!field && process.env.NODE_ENV !== "production") {
        warnAboutMissingIdentifier({
          htmlContent: outerHTML,
          documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
          handlerName: 'handleChange'
        });
      }

      val = /number|range/.test(type) ? (parsed = parseFloat(value), isNaN(parsed) ? '' : parsed) : /checkbox/.test(type) // checkboxes
      ? getValueForCheckbox(getIn(state.values, field), checked, value) : options && multiple // <select multiple>
      ? getSelectedValues(options) : value;
    }

    if (field) {
      // Set form fields by name
      setFieldValue(field, val);
    }
  }, [setFieldValue, state.values]);
  var handleChange = useEventCallback(function (eventOrPath) {
    if (isString(eventOrPath)) {
      return function (event) {
        return executeChange(event, eventOrPath);
      };
    } else {
      executeChange(eventOrPath);
    }
  });
  var setFieldTouched = useEventCallback(function (field, touched, shouldValidate) {
    if (touched === void 0) {
      touched = true;
    }

    dispatch({
      type: 'SET_FIELD_TOUCHED',
      payload: {
        field: field,
        value: touched
      }
    });
    var willValidate = shouldValidate === undefined ? validateOnBlur : shouldValidate;
    return willValidate ? validateFormWithHighPriority(state.values) : Promise.resolve();
  });
  var executeBlur = React$1.useCallback(function (e, path) {
    if (e.persist) {
      e.persist();
    }

    var _e$target = e.target,
        name = _e$target.name,
        id = _e$target.id,
        outerHTML = _e$target.outerHTML;
    var field = path ? path : name ? name : id;

    if (!field && process.env.NODE_ENV !== "production") {
      warnAboutMissingIdentifier({
        htmlContent: outerHTML,
        documentationAnchorLink: 'handleblur-e-any--void',
        handlerName: 'handleBlur'
      });
    }

    setFieldTouched(field, true);
  }, [setFieldTouched]);
  var handleBlur = useEventCallback(function (eventOrString) {
    if (isString(eventOrString)) {
      return function (event) {
        return executeBlur(event, eventOrString);
      };
    } else {
      executeBlur(eventOrString);
    }
  });
  var setFormikState = React$1.useCallback(function (stateOrCb) {
    if (isFunction(stateOrCb)) {
      dispatch({
        type: 'SET_FORMIK_STATE',
        payload: stateOrCb
      });
    } else {
      dispatch({
        type: 'SET_FORMIK_STATE',
        payload: function payload() {
          return stateOrCb;
        }
      });
    }
  }, []);
  var setStatus = React$1.useCallback(function (status) {
    dispatch({
      type: 'SET_STATUS',
      payload: status
    });
  }, []);
  var setSubmitting = React$1.useCallback(function (isSubmitting) {
    dispatch({
      type: 'SET_ISSUBMITTING',
      payload: isSubmitting
    });
  }, []);
  var submitForm = useEventCallback(function () {
    dispatch({
      type: 'SUBMIT_ATTEMPT'
    });
    return validateFormWithHighPriority().then(function (combinedErrors) {
      // In case an error was thrown and passed to the resolved Promise,
      // `combinedErrors` can be an instance of an Error. We need to check
      // that and abort the submit.
      // If we don't do that, calling `Object.keys(new Error())` yields an
      // empty array, which causes the validation to pass and the form
      // to be submitted.
      var isInstanceOfError = combinedErrors instanceof Error;
      var isActuallyValid = !isInstanceOfError && Object.keys(combinedErrors).length === 0;

      if (isActuallyValid) {
        // Proceed with submit...
        //
        // To respect sync submit fns, we can't simply wrap executeSubmit in a promise and
        // _always_ dispatch SUBMIT_SUCCESS because isSubmitting would then always be false.
        // This would be fine in simple cases, but make it impossible to disable submit
        // buttons where people use callbacks or promises as side effects (which is basically
        // all of v1 Formik code). Instead, recall that we are inside of a promise chain already,
        //  so we can try/catch executeSubmit(), if it returns undefined, then just bail.
        // If there are errors, throw em. Otherwise, wrap executeSubmit in a promise and handle
        // cleanup of isSubmitting on behalf of the consumer.
        var promiseOrUndefined;

        try {
          promiseOrUndefined = executeSubmit(); // Bail if it's sync, consumer is responsible for cleaning up
          // via setSubmitting(false)

          if (promiseOrUndefined === undefined) {
            return;
          }
        } catch (error) {
          throw error;
        }

        return Promise.resolve(promiseOrUndefined).then(function (result) {
          if (!!isMounted.current) {
            dispatch({
              type: 'SUBMIT_SUCCESS'
            });
          }

          return result;
        })["catch"](function (_errors) {
          if (!!isMounted.current) {
            dispatch({
              type: 'SUBMIT_FAILURE'
            }); // This is a legit error rejected by the onSubmit fn
            // so we don't want to break the promise chain

            throw _errors;
          }
        });
      } else if (!!isMounted.current) {
        // ^^^ Make sure Formik is still mounted before updating state
        dispatch({
          type: 'SUBMIT_FAILURE'
        }); // throw combinedErrors;

        if (isInstanceOfError) {
          throw combinedErrors;
        }
      }

      return;
    });
  });
  var handleSubmit = useEventCallback(function (e) {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault();
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation();
    } // Warn if form submission is triggered by a <button> without a
    // specified `type` attribute during development. This mitigates
    // a common gotcha in forms with both reset and submit buttons,
    // where the dev forgets to add type="button" to the reset button.


    if (process.env.NODE_ENV !== "production" && typeof document !== 'undefined') {
      // Safely get the active element (works with IE)
      var activeElement = getActiveElement();

      if (activeElement !== null && activeElement instanceof HTMLButtonElement) {
        !(activeElement.attributes && activeElement.attributes.getNamedItem('type')) ? process.env.NODE_ENV !== "production" ? warning(false, 'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.') : warning(false) : void 0;
      }
    }

    submitForm()["catch"](function (reason) {
      console.warn("Warning: An unhandled error was caught from submitForm()", reason);
    });
  });
  var imperativeMethods = {
    resetForm: resetForm,
    validateForm: validateFormWithHighPriority,
    validateField: validateField,
    setErrors: setErrors,
    setFieldError: setFieldError,
    setFieldTouched: setFieldTouched,
    setFieldValue: setFieldValue,
    setStatus: setStatus,
    setSubmitting: setSubmitting,
    setTouched: setTouched,
    setValues: setValues,
    setFormikState: setFormikState,
    submitForm: submitForm
  };
  var executeSubmit = useEventCallback(function () {
    return onSubmit(state.values, imperativeMethods);
  });
  var handleReset = useEventCallback(function (e) {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault();
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation();
    }

    resetForm();
  });
  var getFieldMeta = React$1.useCallback(function (name) {
    return {
      value: getIn(state.values, name),
      error: getIn(state.errors, name),
      touched: !!getIn(state.touched, name),
      initialValue: getIn(initialValues.current, name),
      initialTouched: !!getIn(initialTouched.current, name),
      initialError: getIn(initialErrors.current, name)
    };
  }, [state.errors, state.touched, state.values]);
  var getFieldHelpers = React$1.useCallback(function (name) {
    return {
      setValue: function setValue(value, shouldValidate) {
        return setFieldValue(name, value, shouldValidate);
      },
      setTouched: function setTouched(value, shouldValidate) {
        return setFieldTouched(name, value, shouldValidate);
      },
      setError: function setError(value) {
        return setFieldError(name, value);
      }
    };
  }, [setFieldValue, setFieldTouched, setFieldError]);
  var getFieldProps = React$1.useCallback(function (nameOrOptions) {
    var isAnObject = isObject(nameOrOptions);
    var name = isAnObject ? nameOrOptions.name : nameOrOptions;
    var valueState = getIn(state.values, name);
    var field = {
      name: name,
      value: valueState,
      onChange: handleChange,
      onBlur: handleBlur
    };

    if (isAnObject) {
      var type = nameOrOptions.type,
          valueProp = nameOrOptions.value,
          is = nameOrOptions.as,
          multiple = nameOrOptions.multiple;

      if (type === 'checkbox') {
        if (valueProp === undefined) {
          field.checked = !!valueState;
        } else {
          field.checked = !!(Array.isArray(valueState) && ~valueState.indexOf(valueProp));
          field.value = valueProp;
        }
      } else if (type === 'radio') {
        field.checked = valueState === valueProp;
        field.value = valueProp;
      } else if (is === 'select' && multiple) {
        field.value = field.value || [];
        field.multiple = true;
      }
    }

    return field;
  }, [handleBlur, handleChange, state.values]);
  var dirty = React$1.useMemo(function () {
    return !isEqual(initialValues.current, state.values);
  }, [initialValues.current, state.values]);
  var isValid = React$1.useMemo(function () {
    return typeof isInitialValid !== 'undefined' ? dirty ? state.errors && Object.keys(state.errors).length === 0 : isInitialValid !== false && isFunction(isInitialValid) ? isInitialValid(props) : isInitialValid : state.errors && Object.keys(state.errors).length === 0;
  }, [isInitialValid, dirty, state.errors, props]);

  var ctx = _extends({}, state, {
    initialValues: initialValues.current,
    initialErrors: initialErrors.current,
    initialTouched: initialTouched.current,
    initialStatus: initialStatus.current,
    handleBlur: handleBlur,
    handleChange: handleChange,
    handleReset: handleReset,
    handleSubmit: handleSubmit,
    resetForm: resetForm,
    setErrors: setErrors,
    setFormikState: setFormikState,
    setFieldTouched: setFieldTouched,
    setFieldValue: setFieldValue,
    setFieldError: setFieldError,
    setStatus: setStatus,
    setSubmitting: setSubmitting,
    setTouched: setTouched,
    setValues: setValues,
    submitForm: submitForm,
    validateForm: validateFormWithHighPriority,
    validateField: validateField,
    isValid: isValid,
    dirty: dirty,
    unregisterField: unregisterField,
    registerField: registerField,
    getFieldProps: getFieldProps,
    getFieldMeta: getFieldMeta,
    getFieldHelpers: getFieldHelpers,
    validateOnBlur: validateOnBlur,
    validateOnChange: validateOnChange,
    validateOnMount: validateOnMount
  });

  return ctx;
}
function Formik(props) {
  var formikbag = useFormik(props);
  var component = props.component,
      children = props.children,
      render = props.render,
      innerRef = props.innerRef; // This allows folks to pass a ref to <Formik />

  React$1.useImperativeHandle(innerRef, function () {
    return formikbag;
  });

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React$1.useEffect(function () {
      !!props.render ? process.env.NODE_ENV !== "production" ? warning(false, "<Formik render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Formik render={(props) => ...} /> with <Formik>{(props) => ...}</Formik>") : warning(false) : void 0; // eslint-disable-next-line
    }, []);
  }

  return React$1.createElement(FormikProvider, {
    value: formikbag
  }, component ? React$1.createElement(component, formikbag) : render ? render(formikbag) : children // children come last, always called
  ? isFunction(children) ? children(formikbag) : !isEmptyChildren(children) ? React$1.Children.only(children) : null : null);
}

function warnAboutMissingIdentifier(_ref4) {
  var htmlContent = _ref4.htmlContent,
      documentationAnchorLink = _ref4.documentationAnchorLink,
      handlerName = _ref4.handlerName;
  console.warn("Warning: Formik called `" + handlerName + "`, but you forgot to pass an `id` or `name` attribute to your input:\n    " + htmlContent + "\n    Formik cannot determine which value to update. For more info see https://formik.org/docs/api/formik#" + documentationAnchorLink + "\n  ");
}
/**
 * Transform Yup ValidationError to a more usable object
 */


function yupToFormErrors(yupError) {
  var errors = {};

  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      return setIn(errors, yupError.path, yupError.message);
    }

    for (var _iterator = yupError.inner, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref5;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref5 = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref5 = _i.value;
      }

      var err = _ref5;

      if (!getIn(errors, err.path)) {
        errors = setIn(errors, err.path, err.message);
      }
    }
  }

  return errors;
}
/**
 * Validate a yup schema.
 */

function validateYupSchema(values, schema, sync, context) {
  if (sync === void 0) {
    sync = false;
  }

  var normalizedValues = prepareDataForValidation(values);
  return schema[sync ? 'validateSync' : 'validate'](normalizedValues, {
    abortEarly: false,
    context: context || normalizedValues
  });
}
/**
 * Recursively prepare values.
 */

function prepareDataForValidation(values) {
  var data = Array.isArray(values) ? [] : {};

  for (var k in values) {
    if (Object.prototype.hasOwnProperty.call(values, k)) {
      var key = String(k);

      if (Array.isArray(values[key]) === true) {
        data[key] = values[key].map(function (value) {
          if (Array.isArray(value) === true || isPlainObject(value)) {
            return prepareDataForValidation(value);
          } else {
            return value !== '' ? value : undefined;
          }
        });
      } else if (isPlainObject(values[key])) {
        data[key] = prepareDataForValidation(values[key]);
      } else {
        data[key] = values[key] !== '' ? values[key] : undefined;
      }
    }
  }

  return data;
}
/**
 * deepmerge array merging algorithm
 * https://github.com/KyleAMathews/deepmerge#combine-array
 */

function arrayMerge(target, source, options) {
  var destination = target.slice();
  source.forEach(function merge(e, i) {
    if (typeof destination[i] === 'undefined') {
      var cloneRequested = options.clone !== false;
      var shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone ? deepmerge_1(Array.isArray(e) ? [] : {}, e, options) : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = deepmerge_1(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
}
/** Return multi select values based on an array of options */


function getSelectedValues(options) {
  return Array.from(options).filter(function (el) {
    return el.selected;
  }).map(function (el) {
    return el.value;
  });
}
/** Return the next value for a checkbox */


function getValueForCheckbox(currentValue, checked, valueProp) {
  // If the current value was a boolean, return a boolean
  if (typeof currentValue === 'boolean') {
    return Boolean(checked);
  } // If the currentValue was not a boolean we want to return an array


  var currentArrayOfValues = [];
  var isValueInArray = false;
  var index = -1;

  if (!Array.isArray(currentValue)) {
    // eslint-disable-next-line eqeqeq
    if (!valueProp || valueProp == 'true' || valueProp == 'false') {
      return Boolean(checked);
    }
  } else {
    // If the current value is already an array, use it
    currentArrayOfValues = currentValue;
    index = currentValue.indexOf(valueProp);
    isValueInArray = index >= 0;
  } // If the checkbox was checked and the value is not already present in the aray we want to add the new value to the array of values


  if (checked && valueProp && !isValueInArray) {
    return currentArrayOfValues.concat(valueProp);
  } // If the checkbox was unchecked and the value is not in the array, simply return the already existing array of values


  if (!isValueInArray) {
    return currentArrayOfValues;
  } // If the checkbox was unchecked and the value is in the array, remove the value and return the array


  return currentArrayOfValues.slice(0, index).concat(currentArrayOfValues.slice(index + 1));
} // React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85


var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? React$1.useLayoutEffect : React$1.useEffect;

function useEventCallback(fn) {
  var ref = React$1.useRef(fn); // we copy a ref to the callback scoped to the current state/props on each render

  useIsomorphicLayoutEffect(function () {
    ref.current = fn;
  });
  return React$1.useCallback(function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return ref.current.apply(void 0, args);
  }, []);
}
function Field(_ref) {
  var validate = _ref.validate,
      name = _ref.name,
      render = _ref.render,
      children = _ref.children,
      is = _ref.as,
      component = _ref.component,
      className = _ref.className,
      props = _objectWithoutPropertiesLoose(_ref, ["validate", "name", "render", "children", "as", "component", "className"]);

  var _useFormikContext = useFormikContext(),
      formik = _objectWithoutPropertiesLoose(_useFormikContext, ["validate", "validationSchema"]);

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React$1.useEffect(function () {
      !!render ? process.env.NODE_ENV !== "production" ? warning(false, "<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name=\"" + name + "\" render={({field, form}) => ...} /> with <Field name=\"" + name + "\">{({field, form, meta}) => ...}</Field>") : warning(false) : void 0;
      !!(is && children && isFunction(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.') : warning(false) : void 0;
      !!(component && children && isFunction(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.') : warning(false) : void 0;
      !!(render && children && !isEmptyChildren(children)) ? process.env.NODE_ENV !== "production" ? warning(false, 'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored') : warning(false) : void 0; // eslint-disable-next-line
    }, []);
  } // Register field and field-level validation with parent <Formik>


  var registerField = formik.registerField,
      unregisterField = formik.unregisterField;
  React$1.useEffect(function () {
    registerField(name, {
      validate: validate
    });
    return function () {
      unregisterField(name);
    };
  }, [registerField, unregisterField, name, validate]);
  var field = formik.getFieldProps(_extends({
    name: name
  }, props));
  var meta = formik.getFieldMeta(name);
  var legacyBag = {
    field: field,
    form: formik
  };

  if (render) {
    return render(_extends({}, legacyBag, {
      meta: meta
    }));
  }

  if (isFunction(children)) {
    return children(_extends({}, legacyBag, {
      meta: meta
    }));
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      var innerRef = props.innerRef,
          rest = _objectWithoutPropertiesLoose(props, ["innerRef"]);

      return React$1.createElement(component, _extends({
        ref: innerRef
      }, field, rest, {
        className: className
      }), children);
    } // We don't pass `meta` for backwards compat


    return React$1.createElement(component, _extends({
      field: field,
      form: formik
    }, props, {
      className: className
    }), children);
  } // default to input here so we can check for both `as` and `children` above


  var asElement = is || 'input';

  if (typeof asElement === 'string') {
    var _innerRef = props.innerRef,
        _rest = _objectWithoutPropertiesLoose(props, ["innerRef"]);

    return React$1.createElement(asElement, _extends({
      ref: _innerRef
    }, field, _rest, {
      className: className
    }), children);
  }

  return React$1.createElement(asElement, _extends({}, field, props, {
    className: className
  }), children);
}

var Form = /*#__PURE__*/React$1.forwardRef(function (props, ref) {
  // iOS needs an "action" attribute for nice input: https://stackoverflow.com/a/39485162/406725
  // We default the action to "#" in case the preventDefault fails (just updates the URL hash)
  var action = props.action,
      rest = _objectWithoutPropertiesLoose(props, ["action"]);

  var _action = action != null ? action : '#';

  var _useFormikContext = useFormikContext(),
      handleReset = _useFormikContext.handleReset,
      handleSubmit = _useFormikContext.handleSubmit;

  return React$1.createElement("form", _extends({
    onSubmit: handleSubmit,
    ref: ref,
    onReset: handleReset,
    action: _action
  }, rest));
});
Form.displayName = 'Form';

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}

const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native = {
  randomUUID
};

function v4(options, buf, offset) {
  if (native.randomUUID && !buf && !options) {
    return native.randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return unsafeStringify(rnds);
}

const apiMeta = "https://bro.realweb.ru";

const ModalAddOrEdit = _ref => {
  let {
    setShowEditModal,
    allDataMeta,
    viewer
  } = _ref;
  const {
    clearActiveItem,
    changeItem,
    addObject
  } = useStore(store => store);
  const activeItem = useStore(store => store.data.activeItem);
  const categories = allDataMeta?.object_categories;
  const types = allDataMeta?.object_types;
  const zones = allDataMeta?.zones;
  const handleSubmit = values => {
    if (activeItem?.id) {
      const newItem = {
        ...activeItem,
        object_category_id: values?.category,
        name: values?.name,
        status_name: values?.status,
        object_type_id: values?.type,
        zone_id: values?.zone
      };
      changeItem(newItem);
      setShowEditModal(false);
    } else {
      const coordinate = {
        x_coordinate: allDataMeta?.maps[0]?.size?.width / 2,
        y_coordinate: allDataMeta?.maps[0]?.size?.height / 2
      };
      const newItem = {
        id: v4(),
        object_category_id: values?.category,
        name: values?.name,
        status_name: values?.status,
        object_type_id: values?.type,
        zone_id: values?.zone,
        coordinate
      };
      addObject(newItem);
      if (values?.status === "Размещен") {
        viewer?.current?.centerView(viewer?.current?.instance?.transformState?.scale);
      }
      setShowEditModal(false);
    }
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    tabIndex: "-1",
    className: "z-[100] fixed top-0 left-0 right-0 z-50 justify-center items-center flex w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full outline-none focus:outline-none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-[680px] max-h-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative bg-white rounded shadow dark:bg-gray-700"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white",
    onClick: () => {
      setShowEditModal(false);
      clearActiveItem();
    }
  }, /*#__PURE__*/React.createElement("svg", {
    className: "w-3 h-3",
    "aria-hidden": "true",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 14 14"
  }, /*#__PURE__*/React.createElement("path", {
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
    d: "m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "px-6 py-4 border-gray-200 border-b mb-4 text-xl font-medium text-gray-900 dark:text-white"
  }, "\u0414\u0430\u043D\u043D\u044B\u0435 \u043E\u0431\u044A\u0435\u043A\u0442\u0430"), /*#__PURE__*/React.createElement(Formik, {
    initialValues: {
      category: activeItem?.object_category_id || null,
      type: activeItem?.object_type_id || null,
      zone: activeItem?.zone_id || null,
      name: activeItem?.name || null,
      status: activeItem?.status_name || "Размещен"
    },
    onSubmit: async values => {
      handleSubmit(values);
    }
  }, _ref2 => {
    let {
      values
    } = _ref2;
    return /*#__PURE__*/React.createElement(Form, {
      className: "space-y-6 px-6 pb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex"
    }, /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 grow flex flex-col flex-wrap"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex w-full  justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "category",
      className: "block text-sm font-medium text-gray-900 dark:text-white font-semibold"
    }, "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F", /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 text-sm"
    }, "*")), /*#__PURE__*/React.createElement(Field, {
      component: "select",
      required: true,
      id: "category",
      name: "category",
      className: "w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    }, /*#__PURE__*/React.createElement("option", {
      selected: true,
      value: ""
    }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E"), categories?.map(item => /*#__PURE__*/React.createElement("option", {
      key: item.id,
      value: item?.id
    }, item?.name)))), /*#__PURE__*/React.createElement("div", {
      className: "flex w-full justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "type",
      className: "block text-sm font-medium text-gray-900 dark:text-white font-semibold"
    }, "\u0422\u0438\u043F", /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 text-sm"
    }, "*")), /*#__PURE__*/React.createElement(Field, {
      component: "select",
      required: true,
      id: "type",
      name: "type",
      className: "w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    }, /*#__PURE__*/React.createElement("option", {
      selected: true,
      value: ""
    }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0438\u043F"), types?.map(item => /*#__PURE__*/React.createElement("option", {
      key: item.id,
      value: item?.id
    }, item?.name)))), /*#__PURE__*/React.createElement("div", {
      className: "flex w-full justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "type",
      className: "block text-sm font-medium text-gray-900 dark:text-white font-semibold"
    }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435", /*#__PURE__*/React.createElement("span", {
      className: "text-red-600 text-sm"
    }, "*")), /*#__PURE__*/React.createElement(Field, {
      type: "text",
      id: "name",
      name: "name",
      className: "w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
      placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
      required: true
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex w-full justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "zone",
      className: "block text-sm font-medium text-gray-900 dark:text-white font-semibold"
    }, "\u0417\u043E\u043D\u0430"), /*#__PURE__*/React.createElement(Field, {
      component: "select",
      id: "zone",
      name: "zone",
      className: "w-[305px] border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    }, /*#__PURE__*/React.createElement("option", {
      selected: true,
      value: ""
    }, "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u043E\u043D\u0443"), zones?.map(item => /*#__PURE__*/React.createElement("option", {
      key: item.id,
      value: item?.id
    }, item?.name)))), /*#__PURE__*/React.createElement("div", {
      className: "flex w-full justify-between items-center mb-4"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "zone",
      className: "block text-sm font-medium text-gray-900 dark:text-white font-semibold"
    }, "\u0421\u0442\u0430\u0442\u0443\u0441"), /*#__PURE__*/React.createElement("div", {
      role: "group",
      className: "bg-grayCustom w-[305px] rounded px-3 py-2 flex justify-between",
      "aria-labelledby": "my-radio-group"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "status 1"
    }, /*#__PURE__*/React.createElement(Field, {
      type: "radio",
      name: "status",
      className: "hidden peer",
      value: "\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D",
      id: "status 1"
    }), /*#__PURE__*/React.createElement("div", {
      className: "peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm"
    }, "\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D")), /*#__PURE__*/React.createElement("label", {
      htmlFor: "status 2"
    }, /*#__PURE__*/React.createElement(Field, {
      type: "radio",
      name: "status",
      className: "hidden peer",
      value: "\u041D\u0435 \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D",
      id: "status 2"
    }), /*#__PURE__*/React.createElement("div", {
      className: "peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm"
    }, "\u041D\u0435 \u0440\u0430\u0437\u043C\u0435\u0449\u0435\u043D")), /*#__PURE__*/React.createElement("label", {
      htmlFor: "status 3"
    }, /*#__PURE__*/React.createElement(Field, {
      type: "radio",
      name: "status",
      className: "hidden peer",
      value: "\u0410\u0440\u0445\u0438\u0432",
      id: "status 3"
    }), /*#__PURE__*/React.createElement("div", {
      className: "peer-checked:bg-white peer-checked:rounded peer-checked:py-1 peer-checked:px-2 peer-checked:shadow-buttonHeader py-1 px-2 block cursor-pointer text-sm"
    }, "\u0410\u0440\u0445\u0438\u0432"))))), /*#__PURE__*/React.createElement("div", {
      className: "ml-4 rounded border-gray-200 border w-48 shrink-0 flex justify-center items-center"
    }, types?.find(item => item?.id === values?.type)?.image_link ? /*#__PURE__*/React.createElement("img", {
      className: "w-1/2",
      alt: "type image",
      src: `${apiMeta + types?.find(item => item?.id === values?.type)?.image_link}`
    }) : null)), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "text-white bg-blueCustom hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    }, "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435"));
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "opacity-25 fixed inset-0 z-[55] bg-black"
  }));
};

/**
 * Rounds number to given decimal
 * eg. roundNumber(2.34343, 1) => 2.3
 */
var roundNumber = function (num, decimal) {
    return Number(num.toFixed(decimal));
};
/**
 * Checks if value is number, if not it returns default value
 * 1# eg. checkIsNumber(2, 30) => 2
 * 2# eg. checkIsNumber(null, 30) => 30
 */
var checkIsNumber = function (num, defaultValue) {
    return typeof num === "number" ? num : defaultValue;
};

var handleCallback = function (context, event, callback) {
    if (callback && typeof callback === "function") {
        callback(context, event);
    }
};

/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/**
 * Functions should return denominator of the target value, which is the next animation step.
 * t is a value from 0 to 1, reflecting the percentage of animation status.
 */
var easeOut = function (t) {
    return -Math.cos(t * Math.PI) / 2 + 0.5;
};
// linear
var linear = function (t) {
    return t;
};
// accelerating from zero velocity
var easeInQuad = function (t) {
    return t * t;
};
// decelerating to zero velocity
var easeOutQuad = function (t) {
    return t * (2 - t);
};
// acceleration until halfway, then deceleration
var easeInOutQuad = function (t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};
// accelerating from zero velocity
var easeInCubic = function (t) {
    return t * t * t;
};
// decelerating to zero velocity
var easeOutCubic = function (t) {
    return --t * t * t + 1;
};
// acceleration until halfway, then deceleration
var easeInOutCubic = function (t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
};
// accelerating from zero velocity
var easeInQuart = function (t) {
    return t * t * t * t;
};
// decelerating to zero velocity
var easeOutQuart = function (t) {
    return 1 - --t * t * t * t;
};
// acceleration until halfway, then deceleration
var easeInOutQuart = function (t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
};
// accelerating from zero velocity
var easeInQuint = function (t) {
    return t * t * t * t * t;
};
// decelerating to zero velocity
var easeOutQuint = function (t) {
    return 1 + --t * t * t * t * t;
};
// acceleration until halfway, then deceleration
var easeInOutQuint = function (t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
};
var animations = {
    easeOut: easeOut,
    linear: linear,
    easeInQuad: easeInQuad,
    easeOutQuad: easeOutQuad,
    easeInOutQuad: easeInOutQuad,
    easeInCubic: easeInCubic,
    easeOutCubic: easeOutCubic,
    easeInOutCubic: easeInOutCubic,
    easeInQuart: easeInQuart,
    easeOutQuart: easeOutQuart,
    easeInOutQuart: easeInOutQuart,
    easeInQuint: easeInQuint,
    easeOutQuint: easeOutQuint,
    easeInOutQuint: easeInOutQuint,
};

/* eslint-disable no-param-reassign */
var handleCancelAnimationFrame = function (animation) {
    if (typeof animation === "number") {
        cancelAnimationFrame(animation);
    }
};
var handleCancelAnimation = function (contextInstance) {
    if (!contextInstance.mounted)
        return;
    handleCancelAnimationFrame(contextInstance.animation);
    // Clear animation state
    contextInstance.animate = false;
    contextInstance.animation = null;
    contextInstance.velocity = null;
};
function handleSetupAnimation(contextInstance, animationName, animationTime, callback) {
    if (!contextInstance.mounted)
        return;
    var startTime = new Date().getTime();
    var lastStep = 1;
    // if another animation is active
    handleCancelAnimation(contextInstance);
    // new animation
    contextInstance.animation = function () {
        if (!contextInstance.mounted) {
            return handleCancelAnimationFrame(contextInstance.animation);
        }
        var frameTime = new Date().getTime() - startTime;
        var animationProgress = frameTime / animationTime;
        var animationType = animations[animationName];
        var step = animationType(animationProgress);
        if (frameTime >= animationTime) {
            callback(lastStep);
            contextInstance.animation = null;
        }
        else if (contextInstance.animation) {
            callback(step);
            requestAnimationFrame(contextInstance.animation);
        }
    };
    requestAnimationFrame(contextInstance.animation);
}
function isValidTargetState(targetState) {
    var scale = targetState.scale, positionX = targetState.positionX, positionY = targetState.positionY;
    if (Number.isNaN(scale) ||
        Number.isNaN(positionX) ||
        Number.isNaN(positionY)) {
        return false;
    }
    return true;
}
function animate(contextInstance, targetState, animationTime, animationName) {
    var isValid = isValidTargetState(targetState);
    if (!contextInstance.mounted || !isValid)
        return;
    var setTransformState = contextInstance.setTransformState;
    var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    var scaleDiff = targetState.scale - scale;
    var positionXDiff = targetState.positionX - positionX;
    var positionYDiff = targetState.positionY - positionY;
    if (animationTime === 0) {
        setTransformState(targetState.scale, targetState.positionX, targetState.positionY);
    }
    else {
        // animation start timestamp
        handleSetupAnimation(contextInstance, animationName, animationTime, function (step) {
            var newScale = scale + scaleDiff * step;
            var newPositionX = positionX + positionXDiff * step;
            var newPositionY = positionY + positionYDiff * step;
            setTransformState(newScale, newPositionX, newPositionY);
        });
    }
}

/* eslint-disable no-param-reassign */
function getComponentsSizes(wrapperComponent, contentComponent, newScale) {
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var contentWidth = contentComponent.offsetWidth;
    var contentHeight = contentComponent.offsetHeight;
    var newContentWidth = contentWidth * newScale;
    var newContentHeight = contentHeight * newScale;
    var newDiffWidth = wrapperWidth - newContentWidth;
    var newDiffHeight = wrapperHeight - newContentHeight;
    return {
        wrapperWidth: wrapperWidth,
        wrapperHeight: wrapperHeight,
        newContentWidth: newContentWidth,
        newDiffWidth: newDiffWidth,
        newContentHeight: newContentHeight,
        newDiffHeight: newDiffHeight,
    };
}
var getBounds = function (wrapperWidth, newContentWidth, diffWidth, wrapperHeight, newContentHeight, diffHeight, centerZoomedOut) {
    var scaleWidthFactor = wrapperWidth > newContentWidth
        ? diffWidth * (centerZoomedOut ? 1 : 0.5)
        : 0;
    var scaleHeightFactor = wrapperHeight > newContentHeight
        ? diffHeight * (centerZoomedOut ? 1 : 0.5)
        : 0;
    var minPositionX = wrapperWidth - newContentWidth - scaleWidthFactor;
    var maxPositionX = scaleWidthFactor;
    var minPositionY = wrapperHeight - newContentHeight - scaleHeightFactor;
    var maxPositionY = scaleHeightFactor;
    return { minPositionX: minPositionX, maxPositionX: maxPositionX, minPositionY: minPositionY, maxPositionY: maxPositionY };
};
var calculateBounds = function (contextInstance, newScale) {
    var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
    var centerZoomedOut = contextInstance.setup.centerZoomedOut;
    if (!wrapperComponent || !contentComponent) {
        throw new Error("Components are not mounted");
    }
    var _a = getComponentsSizes(wrapperComponent, contentComponent, newScale), wrapperWidth = _a.wrapperWidth, wrapperHeight = _a.wrapperHeight, newContentWidth = _a.newContentWidth, newDiffWidth = _a.newDiffWidth, newContentHeight = _a.newContentHeight, newDiffHeight = _a.newDiffHeight;
    var bounds = getBounds(wrapperWidth, newContentWidth, newDiffWidth, wrapperHeight, newContentHeight, newDiffHeight, Boolean(centerZoomedOut));
    return bounds;
};
/**
 * Keeps value between given bounds, used for limiting view to given boundaries
 * 1# eg. boundLimiter(2, 0, 3, true) => 2
 * 2# eg. boundLimiter(4, 0, 3, true) => 3
 * 3# eg. boundLimiter(-2, 0, 3, true) => 0
 * 4# eg. boundLimiter(10, 0, 3, false) => 10
 */
var boundLimiter = function (value, minBound, maxBound, isActive) {
    if (!isActive)
        return roundNumber(value, 2);
    if (value < minBound)
        return roundNumber(minBound, 2);
    if (value > maxBound)
        return roundNumber(maxBound, 2);
    return roundNumber(value, 2);
};
var handleCalculateBounds = function (contextInstance, newScale) {
    var bounds = calculateBounds(contextInstance, newScale);
    // Save bounds
    contextInstance.bounds = bounds;
    return bounds;
};
function getMouseBoundedPosition(positionX, positionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent) {
    var minPositionX = bounds.minPositionX, minPositionY = bounds.minPositionY, maxPositionX = bounds.maxPositionX, maxPositionY = bounds.maxPositionY;
    var paddingX = 0;
    var paddingY = 0;
    if (wrapperComponent) {
        paddingX = paddingValueX;
        paddingY = paddingValueY;
    }
    var x = boundLimiter(positionX, minPositionX - paddingX, maxPositionX + paddingX, limitToBounds);
    var y = boundLimiter(positionY, minPositionY - paddingY, maxPositionY + paddingY, limitToBounds);
    return { x: x, y: y };
}

function handleCalculateZoomPositions(contextInstance, mouseX, mouseY, newScale, bounds, limitToBounds) {
    var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    var scaleDifference = newScale - scale;
    if (typeof mouseX !== "number" || typeof mouseY !== "number") {
        console.error("Mouse X and Y position were not provided!");
        return { x: positionX, y: positionY };
    }
    var calculatedPositionX = positionX - mouseX * scaleDifference;
    var calculatedPositionY = positionY - mouseY * scaleDifference;
    // do not limit to bounds when there is padding animation,
    // it causes animation strange behaviour
    var newPositions = getMouseBoundedPosition(calculatedPositionX, calculatedPositionY, bounds, limitToBounds, 0, 0, null);
    return newPositions;
}
function checkZoomBounds(zoom, minScale, maxScale, zoomPadding, enablePadding) {
    var scalePadding = enablePadding ? zoomPadding : 0;
    var minScaleWithPadding = minScale - scalePadding;
    if (!Number.isNaN(maxScale) && zoom >= maxScale)
        return maxScale;
    if (!Number.isNaN(minScale) && zoom <= minScaleWithPadding)
        return minScaleWithPadding;
    return zoom;
}

var isPanningStartAllowed = function (contextInstance, event) {
    var excluded = contextInstance.setup.panning.excluded;
    var isInitialized = contextInstance.isInitialized, wrapperComponent = contextInstance.wrapperComponent;
    var target = event.target;
    var isWrapperChild = wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.contains(target);
    var isAllowed = isInitialized && target && isWrapperChild;
    if (!isAllowed)
        return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
        return false;
    return true;
};
var isPanningAllowed = function (contextInstance) {
    var isInitialized = contextInstance.isInitialized, isPanning = contextInstance.isPanning, setup = contextInstance.setup;
    var disabled = setup.panning.disabled;
    var isAllowed = isInitialized && isPanning && !disabled;
    if (!isAllowed)
        return false;
    return true;
};
var handlePanningSetup = function (contextInstance, event) {
    var _a = contextInstance.transformState, positionX = _a.positionX, positionY = _a.positionY;
    contextInstance.isPanning = true;
    // Panning with mouse
    var x = event.clientX;
    var y = event.clientY;
    contextInstance.startCoords = { x: x - positionX, y: y - positionY };
};
var handleTouchPanningSetup = function (contextInstance, event) {
    var touches = event.touches;
    var _a = contextInstance.transformState, positionX = _a.positionX, positionY = _a.positionY;
    contextInstance.isPanning = true;
    // Panning with touch
    var oneFingerTouch = touches.length === 1;
    if (oneFingerTouch) {
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        contextInstance.startCoords = { x: x - positionX, y: y - positionY };
    }
};
function handlePanToBounds(contextInstance) {
    var _a = contextInstance.transformState, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale;
    var _b = contextInstance.setup, disabled = _b.disabled, limitToBounds = _b.limitToBounds, centerZoomedOut = _b.centerZoomedOut;
    var wrapperComponent = contextInstance.wrapperComponent;
    if (disabled || !wrapperComponent || !contextInstance.bounds)
        return;
    var _c = contextInstance.bounds, maxPositionX = _c.maxPositionX, minPositionX = _c.minPositionX, maxPositionY = _c.maxPositionY, minPositionY = _c.minPositionY;
    var xChanged = positionX > maxPositionX || positionX < minPositionX;
    var yChanged = positionY > maxPositionY || positionY < minPositionY;
    var mousePosX = positionX > maxPositionX
        ? wrapperComponent.offsetWidth
        : contextInstance.setup.minPositionX || 0;
    var mousePosY = positionY > maxPositionY
        ? wrapperComponent.offsetHeight
        : contextInstance.setup.minPositionY || 0;
    var _d = handleCalculateZoomPositions(contextInstance, mousePosX, mousePosY, scale, contextInstance.bounds, limitToBounds || centerZoomedOut), x = _d.x, y = _d.y;
    return {
        scale: scale,
        positionX: xChanged ? x : positionX,
        positionY: yChanged ? y : positionY,
    };
}
function handleNewPosition(contextInstance, newPositionX, newPositionY, paddingValueX, paddingValueY) {
    var limitToBounds = contextInstance.setup.limitToBounds;
    var wrapperComponent = contextInstance.wrapperComponent, bounds = contextInstance.bounds;
    var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    if (wrapperComponent === null ||
        bounds === null ||
        (newPositionX === positionX && newPositionY === positionY)) {
        return;
    }
    var _b = getMouseBoundedPosition(newPositionX, newPositionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent), x = _b.x, y = _b.y;
    contextInstance.setTransformState(scale, x, y);
}
var getPanningClientPosition = function (contextInstance, clientX, clientY) {
    var startCoords = contextInstance.startCoords, transformState = contextInstance.transformState;
    var panning = contextInstance.setup.panning;
    var lockAxisX = panning.lockAxisX, lockAxisY = panning.lockAxisY;
    var positionX = transformState.positionX, positionY = transformState.positionY;
    if (!startCoords) {
        return { x: positionX, y: positionY };
    }
    var mouseX = clientX - startCoords.x;
    var mouseY = clientY - startCoords.y;
    var newPositionX = lockAxisX ? positionX : mouseX;
    var newPositionY = lockAxisY ? positionY : mouseY;
    return { x: newPositionX, y: newPositionY };
};
var getPaddingValue = function (contextInstance, size) {
    var setup = contextInstance.setup, transformState = contextInstance.transformState;
    var scale = transformState.scale;
    var minScale = setup.minScale, disablePadding = setup.disablePadding;
    if (size > 0 && scale >= minScale && !disablePadding) {
        return size;
    }
    return 0;
};

var isVelocityCalculationAllowed = function (contextInstance) {
    var mounted = contextInstance.mounted;
    var _a = contextInstance.setup, disabled = _a.disabled, velocityAnimation = _a.velocityAnimation;
    var scale = contextInstance.transformState.scale;
    var disabledVelocity = velocityAnimation.disabled;
    var isAllowed = !disabledVelocity || scale > 1 || !disabled || mounted;
    if (!isAllowed)
        return false;
    return true;
};
var isVelocityAllowed = function (contextInstance) {
    var mounted = contextInstance.mounted, velocity = contextInstance.velocity, bounds = contextInstance.bounds;
    var _a = contextInstance.setup, disabled = _a.disabled, velocityAnimation = _a.velocityAnimation;
    var scale = contextInstance.transformState.scale;
    var disabledVelocity = velocityAnimation.disabled;
    var isAllowed = !disabledVelocity || scale > 1 || !disabled || mounted;
    if (!isAllowed)
        return false;
    if (!velocity || !bounds)
        return false;
    return true;
};
function getVelocityMoveTime(contextInstance, velocity) {
    var velocityAnimation = contextInstance.setup.velocityAnimation;
    var equalToMove = velocityAnimation.equalToMove, animationTime = velocityAnimation.animationTime, sensitivity = velocityAnimation.sensitivity;
    if (equalToMove) {
        return animationTime * velocity * sensitivity;
    }
    return animationTime;
}
function getVelocityPosition(newPosition, startPosition, currentPosition, isLocked, limitToBounds, minPosition, maxPosition, minTarget, maxTarget, step) {
    if (limitToBounds) {
        if (startPosition > maxPosition && currentPosition > maxPosition) {
            var calculatedPosition = maxPosition + (newPosition - maxPosition) * step;
            if (calculatedPosition > maxTarget)
                return maxTarget;
            if (calculatedPosition < maxPosition)
                return maxPosition;
            return calculatedPosition;
        }
        if (startPosition < minPosition && currentPosition < minPosition) {
            var calculatedPosition = minPosition + (newPosition - minPosition) * step;
            if (calculatedPosition < minTarget)
                return minTarget;
            if (calculatedPosition > minPosition)
                return minPosition;
            return calculatedPosition;
        }
    }
    if (isLocked)
        return startPosition;
    return boundLimiter(newPosition, minPosition, maxPosition, limitToBounds);
}

function getSizeMultiplier(wrapperComponent, equalToMove) {
    var defaultMultiplier = 1;
    if (equalToMove) {
        return Math.min(defaultMultiplier, wrapperComponent.offsetWidth / window.innerWidth);
    }
    return defaultMultiplier;
}
function handleCalculateVelocity(contextInstance, position) {
    var isAllowed = isVelocityCalculationAllowed(contextInstance);
    if (!isAllowed) {
        return;
    }
    var lastMousePosition = contextInstance.lastMousePosition, velocityTime = contextInstance.velocityTime, setup = contextInstance.setup;
    var wrapperComponent = contextInstance.wrapperComponent;
    var equalToMove = setup.velocityAnimation.equalToMove;
    var now = Date.now();
    if (lastMousePosition && velocityTime && wrapperComponent) {
        var sizeMultiplier = getSizeMultiplier(wrapperComponent, equalToMove);
        var distanceX = position.x - lastMousePosition.x;
        var distanceY = position.y - lastMousePosition.y;
        var velocityX = distanceX / sizeMultiplier;
        var velocityY = distanceY / sizeMultiplier;
        var interval = now - velocityTime;
        var speed = distanceX * distanceX + distanceY * distanceY;
        var velocity = Math.sqrt(speed) / interval;
        contextInstance.velocity = { velocityX: velocityX, velocityY: velocityY, total: velocity };
    }
    contextInstance.lastMousePosition = position;
    contextInstance.velocityTime = now;
}
function handleVelocityPanning(contextInstance) {
    var velocity = contextInstance.velocity, bounds = contextInstance.bounds, setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent;
    var isAllowed = isVelocityAllowed(contextInstance);
    if (!isAllowed || !velocity || !bounds || !wrapperComponent) {
        return;
    }
    var velocityX = velocity.velocityX, velocityY = velocity.velocityY, total = velocity.total;
    var maxPositionX = bounds.maxPositionX, minPositionX = bounds.minPositionX, maxPositionY = bounds.maxPositionY, minPositionY = bounds.minPositionY;
    var limitToBounds = setup.limitToBounds, alignmentAnimation = setup.alignmentAnimation;
    var zoomAnimation = setup.zoomAnimation, panning = setup.panning;
    var lockAxisY = panning.lockAxisY, lockAxisX = panning.lockAxisX;
    var animationType = zoomAnimation.animationType;
    var sizeX = alignmentAnimation.sizeX, sizeY = alignmentAnimation.sizeY, velocityAlignmentTime = alignmentAnimation.velocityAlignmentTime;
    var alignAnimationTime = velocityAlignmentTime;
    var moveAnimationTime = getVelocityMoveTime(contextInstance, total);
    var finalAnimationTime = Math.max(moveAnimationTime, alignAnimationTime);
    var paddingValueX = getPaddingValue(contextInstance, sizeX);
    var paddingValueY = getPaddingValue(contextInstance, sizeY);
    var paddingX = (paddingValueX * wrapperComponent.offsetWidth) / 100;
    var paddingY = (paddingValueY * wrapperComponent.offsetHeight) / 100;
    var maxTargetX = maxPositionX + paddingX;
    var minTargetX = minPositionX - paddingX;
    var maxTargetY = maxPositionY + paddingY;
    var minTargetY = minPositionY - paddingY;
    var startState = contextInstance.transformState;
    var startTime = new Date().getTime();
    handleSetupAnimation(contextInstance, animationType, finalAnimationTime, function (step) {
        var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
        var frameTime = new Date().getTime() - startTime;
        var animationProgress = frameTime / alignAnimationTime;
        var alignAnimation = animations[alignmentAnimation.animationType];
        var alignStep = 1 - alignAnimation(Math.min(1, animationProgress));
        var customStep = 1 - step;
        var newPositionX = positionX + velocityX * customStep;
        var newPositionY = positionY + velocityY * customStep;
        var currentPositionX = getVelocityPosition(newPositionX, startState.positionX, positionX, lockAxisX, limitToBounds, minPositionX, maxPositionX, minTargetX, maxTargetX, alignStep);
        var currentPositionY = getVelocityPosition(newPositionY, startState.positionY, positionY, lockAxisY, limitToBounds, minPositionY, maxPositionY, minTargetY, maxTargetY, alignStep);
        if (positionX !== newPositionX || positionY !== newPositionY) {
            contextInstance.setTransformState(scale, currentPositionX, currentPositionY);
        }
    });
}

function handlePanningStart(contextInstance, event) {
    var scale = contextInstance.transformState.scale;
    handleCancelAnimation(contextInstance);
    handleCalculateBounds(contextInstance, scale);
    if (window.TouchEvent !== undefined && event instanceof TouchEvent) {
        handleTouchPanningSetup(contextInstance, event);
    }
    else {
        handlePanningSetup(contextInstance, event);
    }
}
function handleAlignToBounds(contextInstance) {
    var scale = contextInstance.transformState.scale;
    var _a = contextInstance.setup, minScale = _a.minScale, alignmentAnimation = _a.alignmentAnimation;
    var disabled = alignmentAnimation.disabled, sizeX = alignmentAnimation.sizeX, sizeY = alignmentAnimation.sizeY, animationTime = alignmentAnimation.animationTime, animationType = alignmentAnimation.animationType;
    var isDisabled = disabled || scale < minScale || (!sizeX && !sizeY);
    if (isDisabled)
        return;
    var targetState = handlePanToBounds(contextInstance);
    if (targetState) {
        animate(contextInstance, targetState, animationTime, animationType);
    }
}
function handlePanning(contextInstance, clientX, clientY) {
    var startCoords = contextInstance.startCoords, setup = contextInstance.setup;
    var _a = setup.alignmentAnimation, sizeX = _a.sizeX, sizeY = _a.sizeY;
    if (!startCoords)
        return;
    var _b = getPanningClientPosition(contextInstance, clientX, clientY), x = _b.x, y = _b.y;
    var paddingValueX = getPaddingValue(contextInstance, sizeX);
    var paddingValueY = getPaddingValue(contextInstance, sizeY);
    handleCalculateVelocity(contextInstance, { x: x, y: y });
    handleNewPosition(contextInstance, x, y, paddingValueX, paddingValueY);
}
function handlePanningEnd(contextInstance) {
    if (contextInstance.isPanning) {
        var velocityDisabled = contextInstance.setup.panning.velocityDisabled;
        var velocity = contextInstance.velocity, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
        contextInstance.isPanning = false;
        contextInstance.animate = false;
        contextInstance.animation = null;
        var wrapperRect = wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.getBoundingClientRect();
        var contentRect = contentComponent === null || contentComponent === void 0 ? void 0 : contentComponent.getBoundingClientRect();
        var wrapperWidth = (wrapperRect === null || wrapperRect === void 0 ? void 0 : wrapperRect.width) || 0;
        var wrapperHeight = (wrapperRect === null || wrapperRect === void 0 ? void 0 : wrapperRect.height) || 0;
        var contentWidth = (contentRect === null || contentRect === void 0 ? void 0 : contentRect.width) || 0;
        var contentHeight = (contentRect === null || contentRect === void 0 ? void 0 : contentRect.height) || 0;
        var isZoomed = wrapperWidth < contentWidth || wrapperHeight < contentHeight;
        var shouldAnimate = !velocityDisabled && velocity && (velocity === null || velocity === void 0 ? void 0 : velocity.total) > 0.1 && isZoomed;
        if (shouldAnimate) {
            handleVelocityPanning(contextInstance);
        }
        else {
            handleAlignToBounds(contextInstance);
        }
    }
}

function handleZoomToPoint(contextInstance, scale, mouseX, mouseY) {
    var _a = contextInstance.setup, minScale = _a.minScale, maxScale = _a.maxScale, limitToBounds = _a.limitToBounds;
    var newScale = checkZoomBounds(roundNumber(scale, 2), minScale, maxScale, 0, false);
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var _b = handleCalculateZoomPositions(contextInstance, mouseX, mouseY, newScale, bounds, limitToBounds), x = _b.x, y = _b.y;
    return { scale: newScale, positionX: x, positionY: y };
}
function handleAlignToScaleBounds(contextInstance, mousePositionX, mousePositionY) {
    var scale = contextInstance.transformState.scale;
    var wrapperComponent = contextInstance.wrapperComponent;
    var _a = contextInstance.setup, minScale = _a.minScale, limitToBounds = _a.limitToBounds, zoomAnimation = _a.zoomAnimation;
    var disabled = zoomAnimation.disabled, animationTime = zoomAnimation.animationTime, animationType = zoomAnimation.animationType;
    var isDisabled = disabled || scale >= minScale;
    if (scale >= 1 || limitToBounds) {
        // fire fit to bounds animation
        handleAlignToBounds(contextInstance);
    }
    if (isDisabled || !wrapperComponent || !contextInstance.mounted)
        return;
    var mouseX = mousePositionX || wrapperComponent.offsetWidth / 2;
    var mouseY = mousePositionY || wrapperComponent.offsetHeight / 2;
    var targetState = handleZoomToPoint(contextInstance, minScale, mouseX, mouseY);
    if (targetState) {
        animate(contextInstance, targetState, animationTime, animationType);
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign$1 = function() {
    __assign$1 = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};

function __spreadArray$1(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var initialState = {
    previousScale: 1,
    scale: 1,
    positionX: 0,
    positionY: 0,
};
var initialSetup = {
    disabled: false,
    minPositionX: null,
    maxPositionX: null,
    minPositionY: null,
    maxPositionY: null,
    minScale: 1,
    maxScale: 8,
    limitToBounds: true,
    centerZoomedOut: false,
    centerOnInit: false,
    disablePadding: false,
    smooth: true,
    wheel: {
        step: 0.2,
        disabled: false,
        smoothStep: 0.001,
        wheelDisabled: false,
        touchPadDisabled: false,
        activationKeys: [],
        excluded: [],
    },
    panning: {
        disabled: false,
        velocityDisabled: false,
        lockAxisX: false,
        lockAxisY: false,
        activationKeys: [],
        excluded: [],
    },
    pinch: {
        step: 5,
        disabled: false,
        excluded: [],
    },
    doubleClick: {
        disabled: false,
        step: 0.7,
        mode: "zoomIn",
        animationType: "easeOut",
        animationTime: 200,
        excluded: [],
    },
    zoomAnimation: {
        disabled: false,
        size: 0.4,
        animationTime: 200,
        animationType: "easeOut",
    },
    alignmentAnimation: {
        disabled: false,
        sizeX: 100,
        sizeY: 100,
        animationTime: 200,
        velocityAlignmentTime: 400,
        animationType: "easeOut",
    },
    velocityAnimation: {
        disabled: false,
        sensitivity: 1,
        animationTime: 400,
        animationType: "easeOut",
        equalToMove: true,
    },
};

var createState = function (props) {
    var _a, _b, _c, _d;
    return {
        previousScale: (_a = props.initialScale) !== null && _a !== void 0 ? _a : initialState.scale,
        scale: (_b = props.initialScale) !== null && _b !== void 0 ? _b : initialState.scale,
        positionX: (_c = props.initialPositionX) !== null && _c !== void 0 ? _c : initialState.positionX,
        positionY: (_d = props.initialPositionY) !== null && _d !== void 0 ? _d : initialState.positionY,
    };
};
var createSetup = function (props) {
    var newSetup = __assign$1({}, initialSetup);
    Object.keys(props).forEach(function (key) {
        var validValue = typeof props[key] !== "undefined";
        var validParameter = typeof initialSetup[key] !== "undefined";
        if (validParameter && validValue) {
            var dataType = Object.prototype.toString.call(initialSetup[key]);
            var isObject = dataType === "[object Object]";
            var isArray = dataType === "[object Array]";
            if (isObject) {
                newSetup[key] = __assign$1(__assign$1({}, initialSetup[key]), props[key]);
            }
            else if (isArray) {
                newSetup[key] = __spreadArray$1(__spreadArray$1([], initialSetup[key], true), props[key], true);
            }
            else {
                newSetup[key] = props[key];
            }
        }
    });
    return newSetup;
};

var handleCalculateButtonZoom = function (contextInstance, delta, step) {
    var scale = contextInstance.transformState.scale;
    var wrapperComponent = contextInstance.wrapperComponent, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, smooth = setup.smooth;
    var size = zoomAnimation.size;
    if (!wrapperComponent) {
        throw new Error("Wrapper is not mounted");
    }
    var targetScale = smooth
        ? scale * Math.exp(delta * step)
        : scale + delta * step;
    var newScale = checkZoomBounds(roundNumber(targetScale, 3), minScale, maxScale, size, false);
    return newScale;
};
function handleZoomToViewCenter(contextInstance, delta, step, animationTime, animationType) {
    var wrapperComponent = contextInstance.wrapperComponent;
    var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    if (!wrapperComponent)
        return console.error("No WrapperComponent found");
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var mouseX = (wrapperWidth / 2 - positionX) / scale;
    var mouseY = (wrapperHeight / 2 - positionY) / scale;
    var newScale = handleCalculateButtonZoom(contextInstance, delta, step);
    var targetState = handleZoomToPoint(contextInstance, newScale, mouseX, mouseY);
    if (!targetState) {
        return console.error("Error during zoom event. New transformation state was not calculated.");
    }
    animate(contextInstance, targetState, animationTime, animationType);
}
function resetTransformations(contextInstance, animationTime, animationType, onResetTransformation) {
    var setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent;
    var limitToBounds = setup.limitToBounds;
    var initialTransformation = createState(contextInstance.props);
    var _a = contextInstance.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
    if (!wrapperComponent)
        return;
    var newBounds = calculateBounds(contextInstance, initialTransformation.scale);
    var boundedPositions = getMouseBoundedPosition(initialTransformation.positionX, initialTransformation.positionY, newBounds, limitToBounds, 0, 0, wrapperComponent);
    var newState = {
        scale: initialTransformation.scale,
        positionX: boundedPositions.x,
        positionY: boundedPositions.y,
    };
    if (scale === initialTransformation.scale &&
        positionX === initialTransformation.positionX &&
        positionY === initialTransformation.positionY) {
        return;
    }
    onResetTransformation === null || onResetTransformation === void 0 ? void 0 : onResetTransformation();
    animate(contextInstance, newState, animationTime, animationType);
}
function getOffset(element, wrapper, content, state) {
    var offset = element.getBoundingClientRect();
    var wrapperOffset = wrapper.getBoundingClientRect();
    var contentOffset = content.getBoundingClientRect();
    var xOff = wrapperOffset.x * state.scale;
    var yOff = wrapperOffset.y * state.scale;
    return {
        x: (offset.x - contentOffset.x + xOff) / state.scale,
        y: (offset.y - contentOffset.y + yOff) / state.scale,
    };
}
function calculateZoomToNode(contextInstance, node, customZoom) {
    var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent, transformState = contextInstance.transformState;
    var _a = contextInstance.setup, limitToBounds = _a.limitToBounds, minScale = _a.minScale, maxScale = _a.maxScale;
    if (!wrapperComponent || !contentComponent)
        return transformState;
    var wrapperRect = wrapperComponent.getBoundingClientRect();
    var nodeRect = node.getBoundingClientRect();
    var nodeOffset = getOffset(node, wrapperComponent, contentComponent, transformState);
    var nodeLeft = nodeOffset.x;
    var nodeTop = nodeOffset.y;
    var nodeWidth = nodeRect.width / transformState.scale;
    var nodeHeight = nodeRect.height / transformState.scale;
    var scaleX = wrapperComponent.offsetWidth / nodeWidth;
    var scaleY = wrapperComponent.offsetHeight / nodeHeight;
    var newScale = checkZoomBounds(customZoom || Math.min(scaleX, scaleY), minScale, maxScale, 0, false);
    var offsetX = (wrapperRect.width - nodeWidth * newScale) / 2;
    var offsetY = (wrapperRect.height - nodeHeight * newScale) / 2;
    var newPositionX = (wrapperRect.left - nodeLeft) * newScale + offsetX;
    var newPositionY = (wrapperRect.top - nodeTop) * newScale + offsetY;
    var bounds = calculateBounds(contextInstance, newScale);
    var _b = getMouseBoundedPosition(newPositionX, newPositionY, bounds, limitToBounds, 0, 0, wrapperComponent), x = _b.x, y = _b.y;
    return { positionX: x, positionY: y, scale: newScale };
}

var zoomIn = function (contextInstance) {
    return function (step, animationTime, animationType) {
        if (step === void 0) { step = 0.5; }
        if (animationTime === void 0) { animationTime = 300; }
        if (animationType === void 0) { animationType = "easeOut"; }
        handleZoomToViewCenter(contextInstance, 1, step, animationTime, animationType);
    };
};
var zoomOut = function (contextInstance) {
    return function (step, animationTime, animationType) {
        if (step === void 0) { step = 0.5; }
        if (animationTime === void 0) { animationTime = 300; }
        if (animationType === void 0) { animationType = "easeOut"; }
        handleZoomToViewCenter(contextInstance, -1, step, animationTime, animationType);
    };
};
var setTransform = function (contextInstance) {
    return function (newPositionX, newPositionY, newScale, animationTime, animationType) {
        if (animationTime === void 0) { animationTime = 300; }
        if (animationType === void 0) { animationType = "easeOut"; }
        var _a = contextInstance.transformState, positionX = _a.positionX, positionY = _a.positionY, scale = _a.scale;
        var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
        var disabled = contextInstance.setup.disabled;
        if (disabled || !wrapperComponent || !contentComponent)
            return;
        var targetState = {
            positionX: Number.isNaN(newPositionX) ? positionX : newPositionX,
            positionY: Number.isNaN(newPositionY) ? positionY : newPositionY,
            scale: Number.isNaN(newScale) ? scale : newScale,
        };
        animate(contextInstance, targetState, animationTime, animationType);
    };
};
var resetTransform = function (contextInstance) {
    return function (animationTime, animationType) {
        if (animationTime === void 0) { animationTime = 200; }
        if (animationType === void 0) { animationType = "easeOut"; }
        resetTransformations(contextInstance, animationTime, animationType);
    };
};
var centerView = function (contextInstance) {
    return function (scale, animationTime, animationType) {
        if (animationTime === void 0) { animationTime = 200; }
        if (animationType === void 0) { animationType = "easeOut"; }
        var transformState = contextInstance.transformState, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
        if (wrapperComponent && contentComponent) {
            var targetState = getCenterPosition(scale || transformState.scale, wrapperComponent, contentComponent);
            animate(contextInstance, targetState, animationTime, animationType);
        }
    };
};
var zoomToElement = function (contextInstance) {
    return function (node, scale, animationTime, animationType) {
        if (animationTime === void 0) { animationTime = 600; }
        if (animationType === void 0) { animationType = "easeOut"; }
        handleCancelAnimation(contextInstance);
        var wrapperComponent = contextInstance.wrapperComponent;
        var target = typeof node === "string" ? document.getElementById(node) : node;
        if (wrapperComponent && target && wrapperComponent.contains(target)) {
            var targetState = calculateZoomToNode(contextInstance, target, scale);
            animate(contextInstance, targetState, animationTime, animationType);
        }
    };
};

var getControls = function (contextInstance) {
    return {
        instance: contextInstance,
        zoomIn: zoomIn(contextInstance),
        zoomOut: zoomOut(contextInstance),
        setTransform: setTransform(contextInstance),
        resetTransform: resetTransform(contextInstance),
        centerView: centerView(contextInstance),
        zoomToElement: zoomToElement(contextInstance),
    };
};
var getState = function (contextInstance) {
    return {
        instance: contextInstance,
        state: contextInstance.transformState,
    };
};
var getContext = function (contextInstance) {
    var ref = {};
    Object.assign(ref, getState(contextInstance));
    Object.assign(ref, getControls(contextInstance));
    return ref;
};

// We want to make event listeners non-passive, and to do so have to check
// that browsers support EventListenerOptions in the first place.
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
var passiveSupported = false;
function makePassiveEventOption() {
    try {
        var options = {
            get passive() {
                // This function will be called when the browser
                //   attempts to access the passive property.
                passiveSupported = true;
                return false;
            },
        };
        return options;
    }
    catch (err) {
        passiveSupported = false;
        return passiveSupported;
    }
}

var isExcludedNode = function (node, excluded) {
    var targetTagName = node.tagName.toUpperCase();
    var isExcludedTag = excluded.find(function (tag) { return tag.toUpperCase() === targetTagName; });
    if (isExcludedTag)
        return true;
    var isExcludedClassName = excluded.find(function (className) {
        return node.classList.contains(className);
    });
    if (isExcludedClassName)
        return true;
    return false;
};
var cancelTimeout = function (timeout) {
    if (timeout) {
        clearTimeout(timeout);
    }
};

var getTransformStyles = function (x, y, scale) {
    // Standard translate prevents blurry svg on the safari
    return "translate(".concat(x, "px, ").concat(y, "px) scale(").concat(scale, ")");
};
var getCenterPosition = function (scale, wrapperComponent, contentComponent) {
    var contentWidth = contentComponent.offsetWidth * scale;
    var contentHeight = contentComponent.offsetHeight * scale;
    var centerPositionX = (wrapperComponent.offsetWidth - contentWidth) / 2;
    var centerPositionY = (wrapperComponent.offsetHeight - contentHeight) / 2;
    return {
        scale: scale,
        positionX: centerPositionX,
        positionY: centerPositionY,
    };
};

function mergeRefs(refs) {
    return function (value) {
        refs.forEach(function (ref) {
            if (typeof ref === "function") {
                ref(value);
            }
            else if (ref != null) {
                ref.current = value;
            }
        });
    };
}

var isWheelAllowed = function (contextInstance, event) {
    var _a = contextInstance.setup.wheel, disabled = _a.disabled, wheelDisabled = _a.wheelDisabled, touchPadDisabled = _a.touchPadDisabled, excluded = _a.excluded;
    var isInitialized = contextInstance.isInitialized, isPanning = contextInstance.isPanning;
    var target = event.target;
    var isAllowed = isInitialized && !isPanning && !disabled && target;
    if (!isAllowed)
        return false;
    // Event ctrlKey detects if touchpad action is executing wheel or pinch gesture
    if (wheelDisabled && !event.ctrlKey)
        return false;
    if (touchPadDisabled && event.ctrlKey)
        return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
        return false;
    return true;
};
var getDeltaY = function (event) {
    if (event) {
        return event.deltaY < 0 ? 1 : -1;
    }
    return 0;
};
function getDelta(event, customDelta) {
    var deltaY = getDeltaY(event);
    var delta = checkIsNumber(customDelta, deltaY);
    return delta;
}
function getMousePosition(event, contentComponent, scale) {
    var contentRect = contentComponent.getBoundingClientRect();
    var mouseX = 0;
    var mouseY = 0;
    if ("clientX" in event) {
        // mouse position x, y over wrapper component
        mouseX = (event.clientX - contentRect.left) / scale;
        mouseY = (event.clientY - contentRect.top) / scale;
    }
    else {
        var touch = event.touches[0];
        mouseX = (touch.clientX - contentRect.left) / scale;
        mouseY = (touch.clientY - contentRect.top) / scale;
    }
    if (Number.isNaN(mouseX) || Number.isNaN(mouseY))
        console.error("No mouse or touch offset found");
    return {
        x: mouseX,
        y: mouseY,
    };
}
var handleCalculateWheelZoom = function (contextInstance, delta, step, disable, getTarget) {
    var scale = contextInstance.transformState.scale;
    var wrapperComponent = contextInstance.wrapperComponent, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, disablePadding = setup.disablePadding;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    if (!wrapperComponent) {
        throw new Error("Wrapper is not mounted");
    }
    var targetScale = scale + delta * step;
    if (getTarget)
        return targetScale;
    var paddingEnabled = disable ? false : !disabled;
    var newScale = checkZoomBounds(roundNumber(targetScale, 3), minScale, maxScale, size, paddingEnabled && !disablePadding);
    return newScale;
};
var handleWheelZoomStop = function (contextInstance, event) {
    var previousWheelEvent = contextInstance.previousWheelEvent;
    var scale = contextInstance.transformState.scale;
    var _a = contextInstance.setup, maxScale = _a.maxScale, minScale = _a.minScale;
    if (!previousWheelEvent)
        return false;
    if (scale < maxScale || scale > minScale)
        return true;
    if (Math.sign(previousWheelEvent.deltaY) !== Math.sign(event.deltaY))
        return true;
    if (previousWheelEvent.deltaY > 0 && previousWheelEvent.deltaY < event.deltaY)
        return true;
    if (previousWheelEvent.deltaY < 0 && previousWheelEvent.deltaY > event.deltaY)
        return true;
    if (Math.sign(previousWheelEvent.deltaY) !== Math.sign(event.deltaY))
        return true;
    return false;
};

var isPinchStartAllowed = function (contextInstance, event) {
    var _a = contextInstance.setup.pinch, disabled = _a.disabled, excluded = _a.excluded;
    var isInitialized = contextInstance.isInitialized;
    var target = event.target;
    var isAllowed = isInitialized && !disabled && target;
    if (!isAllowed)
        return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
        return false;
    return true;
};
var isPinchAllowed = function (contextInstance) {
    var disabled = contextInstance.setup.pinch.disabled;
    var isInitialized = contextInstance.isInitialized, pinchStartDistance = contextInstance.pinchStartDistance;
    var isAllowed = isInitialized && !disabled && pinchStartDistance;
    if (!isAllowed)
        return false;
    return true;
};
var calculateTouchMidPoint = function (event, scale, contentComponent) {
    var contentRect = contentComponent.getBoundingClientRect();
    var touches = event.touches;
    var firstPointX = roundNumber(touches[0].clientX - contentRect.left, 5);
    var firstPointY = roundNumber(touches[0].clientY - contentRect.top, 5);
    var secondPointX = roundNumber(touches[1].clientX - contentRect.left, 5);
    var secondPointY = roundNumber(touches[1].clientY - contentRect.top, 5);
    return {
        x: (firstPointX + secondPointX) / 2 / scale,
        y: (firstPointY + secondPointY) / 2 / scale,
    };
};
var getTouchDistance = function (event) {
    return Math.sqrt(Math.pow((event.touches[0].pageX - event.touches[1].pageX), 2) +
        Math.pow((event.touches[0].pageY - event.touches[1].pageY), 2));
};
var calculatePinchZoom = function (contextInstance, currentDistance) {
    var pinchStartScale = contextInstance.pinchStartScale, pinchStartDistance = contextInstance.pinchStartDistance, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, disablePadding = setup.disablePadding;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    if (!pinchStartScale || pinchStartDistance === null || !currentDistance) {
        throw new Error("Pinch touches distance was not provided");
    }
    if (currentDistance < 0) {
        return contextInstance.transformState.scale;
    }
    var touchProportion = currentDistance / pinchStartDistance;
    var scaleDifference = touchProportion * pinchStartScale;
    return checkZoomBounds(roundNumber(scaleDifference, 2), minScale, maxScale, size, !disabled && !disablePadding);
};

var wheelStopEventTime = 160;
var wheelAnimationTime = 100;
var handleWheelStart = function (contextInstance, event) {
    var _a = contextInstance.props, onWheelStart = _a.onWheelStart, onZoomStart = _a.onZoomStart;
    if (!contextInstance.wheelStopEventTimer) {
        handleCancelAnimation(contextInstance);
        handleCallback(getContext(contextInstance), event, onWheelStart);
        handleCallback(getContext(contextInstance), event, onZoomStart);
    }
};
var handleWheelZoom = function (contextInstance, event) {
    var _a = contextInstance.props, onWheel = _a.onWheel, onZoom = _a.onZoom;
    var contentComponent = contextInstance.contentComponent, setup = contextInstance.setup, transformState = contextInstance.transformState;
    var scale = transformState.scale;
    var limitToBounds = setup.limitToBounds, centerZoomedOut = setup.centerZoomedOut, zoomAnimation = setup.zoomAnimation, wheel = setup.wheel, disablePadding = setup.disablePadding, smooth = setup.smooth;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    var step = wheel.step, smoothStep = wheel.smoothStep;
    if (!contentComponent) {
        throw new Error("Component not mounted");
    }
    event.preventDefault();
    event.stopPropagation();
    var delta = getDelta(event, null);
    var zoomStep = smooth ? smoothStep * Math.abs(event.deltaY) : step;
    var newScale = handleCalculateWheelZoom(contextInstance, delta, zoomStep, !event.ctrlKey);
    // if scale not change
    if (scale === newScale)
        return;
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var mousePosition = getMousePosition(event, contentComponent, scale);
    var isPaddingDisabled = disabled || size === 0 || centerZoomedOut || disablePadding;
    var isLimitedToBounds = limitToBounds && isPaddingDisabled;
    var _b = handleCalculateZoomPositions(contextInstance, mousePosition.x, mousePosition.y, newScale, bounds, isLimitedToBounds), x = _b.x, y = _b.y;
    contextInstance.previousWheelEvent = event;
    contextInstance.setTransformState(newScale, x, y);
    handleCallback(getContext(contextInstance), event, onWheel);
    handleCallback(getContext(contextInstance), event, onZoom);
};
var handleWheelStop = function (contextInstance, event) {
    var _a = contextInstance.props, onWheelStop = _a.onWheelStop, onZoomStop = _a.onZoomStop;
    // fire animation
    cancelTimeout(contextInstance.wheelAnimationTimer);
    contextInstance.wheelAnimationTimer = setTimeout(function () {
        if (!contextInstance.mounted)
            return;
        handleAlignToScaleBounds(contextInstance, event.x, event.y);
        contextInstance.wheelAnimationTimer = null;
    }, wheelAnimationTime);
    // Wheel stop event
    var hasStoppedZooming = handleWheelZoomStop(contextInstance, event);
    if (hasStoppedZooming) {
        cancelTimeout(contextInstance.wheelStopEventTimer);
        contextInstance.wheelStopEventTimer = setTimeout(function () {
            if (!contextInstance.mounted)
                return;
            contextInstance.wheelStopEventTimer = null;
            handleCallback(getContext(contextInstance), event, onWheelStop);
            handleCallback(getContext(contextInstance), event, onZoomStop);
        }, wheelStopEventTime);
    }
};

var handlePinchStart = function (contextInstance, event) {
    var distance = getTouchDistance(event);
    contextInstance.pinchStartDistance = distance;
    contextInstance.lastDistance = distance;
    contextInstance.pinchStartScale = contextInstance.transformState.scale;
    contextInstance.isPanning = false;
    handleCancelAnimation(contextInstance);
};
var handlePinchZoom = function (contextInstance, event) {
    var contentComponent = contextInstance.contentComponent, pinchStartDistance = contextInstance.pinchStartDistance;
    var scale = contextInstance.transformState.scale;
    var _a = contextInstance.setup, limitToBounds = _a.limitToBounds, centerZoomedOut = _a.centerZoomedOut, zoomAnimation = _a.zoomAnimation;
    var disabled = zoomAnimation.disabled, size = zoomAnimation.size;
    // if one finger starts from outside of wrapper
    if (pinchStartDistance === null || !contentComponent)
        return;
    var midPoint = calculateTouchMidPoint(event, scale, contentComponent);
    // if touches goes off of the wrapper element
    if (!Number.isFinite(midPoint.x) || !Number.isFinite(midPoint.y))
        return;
    var currentDistance = getTouchDistance(event);
    var newScale = calculatePinchZoom(contextInstance, currentDistance);
    if (newScale === scale)
        return;
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var isPaddingDisabled = disabled || size === 0 || centerZoomedOut;
    var isLimitedToBounds = limitToBounds && isPaddingDisabled;
    var _b = handleCalculateZoomPositions(contextInstance, midPoint.x, midPoint.y, newScale, bounds, isLimitedToBounds), x = _b.x, y = _b.y;
    contextInstance.pinchMidpoint = midPoint;
    contextInstance.lastDistance = currentDistance;
    contextInstance.setTransformState(newScale, x, y);
};
var handlePinchStop = function (contextInstance) {
    var pinchMidpoint = contextInstance.pinchMidpoint;
    contextInstance.velocity = null;
    contextInstance.lastDistance = null;
    contextInstance.pinchMidpoint = null;
    contextInstance.pinchStartScale = null;
    contextInstance.pinchStartDistance = null;
    handleAlignToScaleBounds(contextInstance, pinchMidpoint === null || pinchMidpoint === void 0 ? void 0 : pinchMidpoint.x, pinchMidpoint === null || pinchMidpoint === void 0 ? void 0 : pinchMidpoint.y);
};

var handleDoubleClickStop = function (contextInstance, event) {
    var onZoomStop = contextInstance.props.onZoomStop;
    var animationTime = contextInstance.setup.doubleClick.animationTime;
    cancelTimeout(contextInstance.doubleClickStopEventTimer);
    contextInstance.doubleClickStopEventTimer = setTimeout(function () {
        contextInstance.doubleClickStopEventTimer = null;
        handleCallback(getContext(contextInstance), event, onZoomStop);
    }, animationTime);
};
var handleDoubleClickResetMode = function (contextInstance, event) {
    var _a = contextInstance.props, onZoomStart = _a.onZoomStart, onZoom = _a.onZoom;
    var _b = contextInstance.setup.doubleClick, animationTime = _b.animationTime, animationType = _b.animationType;
    handleCallback(getContext(contextInstance), event, onZoomStart);
    resetTransformations(contextInstance, animationTime, animationType, function () {
        return handleCallback(getContext(contextInstance), event, onZoom);
    });
    handleDoubleClickStop(contextInstance, event);
};
function handleDoubleClick(contextInstance, event) {
    var setup = contextInstance.setup, doubleClickStopEventTimer = contextInstance.doubleClickStopEventTimer, transformState = contextInstance.transformState, contentComponent = contextInstance.contentComponent;
    var scale = transformState.scale;
    var _a = contextInstance.props, onZoomStart = _a.onZoomStart, onZoom = _a.onZoom;
    var _b = setup.doubleClick, disabled = _b.disabled, mode = _b.mode, step = _b.step, animationTime = _b.animationTime, animationType = _b.animationType;
    if (disabled)
        return;
    if (doubleClickStopEventTimer)
        return;
    if (mode === "reset") {
        return handleDoubleClickResetMode(contextInstance, event);
    }
    if (!contentComponent)
        return console.error("No ContentComponent found");
    var delta = mode === "zoomOut" ? -1 : 1;
    var newScale = handleCalculateButtonZoom(contextInstance, delta, step);
    // stop execution when scale didn't change
    if (scale === newScale)
        return;
    handleCallback(getContext(contextInstance), event, onZoomStart);
    var mousePosition = getMousePosition(event, contentComponent, scale);
    var targetState = handleZoomToPoint(contextInstance, newScale, mousePosition.x, mousePosition.y);
    if (!targetState) {
        return console.error("Error during zoom event. New transformation state was not calculated.");
    }
    handleCallback(getContext(contextInstance), event, onZoom);
    animate(contextInstance, targetState, animationTime, animationType);
    handleDoubleClickStop(contextInstance, event);
}
var isDoubleClickAllowed = function (contextInstance, event) {
    var isInitialized = contextInstance.isInitialized, setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent;
    var _a = setup.doubleClick, disabled = _a.disabled, excluded = _a.excluded;
    var target = event.target;
    var isWrapperChild = wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.contains(target);
    var isAllowed = isInitialized && target && isWrapperChild && !disabled;
    if (!isAllowed)
        return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
        return false;
    return true;
};

var ZoomPanPinch = /** @class */ (function () {
    function ZoomPanPinch(props) {
        var _this = this;
        this.mounted = true;
        this.onChangeCallbacks = new Set();
        this.onInitCallbacks = new Set();
        // Components
        this.wrapperComponent = null;
        this.contentComponent = null;
        // Initialization
        this.isInitialized = false;
        this.bounds = null;
        // wheel helpers
        this.previousWheelEvent = null;
        this.wheelStopEventTimer = null;
        this.wheelAnimationTimer = null;
        // panning helpers
        this.isPanning = false;
        this.startCoords = null;
        this.lastTouch = null;
        // pinch helpers
        this.distance = null;
        this.lastDistance = null;
        this.pinchStartDistance = null;
        this.pinchStartScale = null;
        this.pinchMidpoint = null;
        // double click helpers
        this.doubleClickStopEventTimer = null;
        // velocity helpers
        this.velocity = null;
        this.velocityTime = null;
        this.lastMousePosition = null;
        // animations helpers
        this.animate = false;
        this.animation = null;
        this.maxBounds = null;
        // key press
        this.pressedKeys = {};
        this.mount = function () {
            _this.initializeWindowEvents();
        };
        this.unmount = function () {
            _this.cleanupWindowEvents();
        };
        this.update = function (newProps) {
            handleCalculateBounds(_this, _this.transformState.scale);
            _this.setup = createSetup(newProps);
        };
        this.initializeWindowEvents = function () {
            var _a;
            var passive = makePassiveEventOption();
            var currentDocument = (_a = _this.wrapperComponent) === null || _a === void 0 ? void 0 : _a.ownerDocument;
            var currentWindow = currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.defaultView;
            // Panning on window to allow panning when mouse is out of component wrapper
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mousedown", _this.onPanningStart, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mousemove", _this.onPanning, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mouseup", _this.onPanningStop, passive);
            currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.addEventListener("mouseleave", _this.clearPanning, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("keyup", _this.setKeyUnPressed, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("keydown", _this.setKeyPressed, passive);
        };
        this.cleanupWindowEvents = function () {
            var _a, _b;
            var passive = makePassiveEventOption();
            var currentDocument = (_a = _this.wrapperComponent) === null || _a === void 0 ? void 0 : _a.ownerDocument;
            var currentWindow = currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.defaultView;
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mousedown", _this.onPanningStart, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mousemove", _this.onPanning, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mouseup", _this.onPanningStop, passive);
            currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.removeEventListener("mouseleave", _this.clearPanning, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("keyup", _this.setKeyUnPressed, passive);
            currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("keydown", _this.setKeyPressed, passive);
            document.removeEventListener("mouseleave", _this.clearPanning, passive);
            handleCancelAnimation(_this);
            (_b = _this.observer) === null || _b === void 0 ? void 0 : _b.disconnect();
        };
        this.handleInitializeWrapperEvents = function (wrapper) {
            // Zooming events on wrapper
            var passive = makePassiveEventOption();
            wrapper.addEventListener("wheel", _this.onWheelZoom, passive);
            wrapper.addEventListener("dblclick", _this.onDoubleClick, passive);
            wrapper.addEventListener("touchstart", _this.onTouchPanningStart, passive);
            wrapper.addEventListener("touchmove", _this.onTouchPanning, passive);
            wrapper.addEventListener("touchend", _this.onTouchPanningStop, passive);
        };
        this.handleInitialize = function (contentComponent) {
            var centerOnInit = _this.setup.centerOnInit;
            _this.applyTransformation();
            _this.onInitCallbacks.forEach(function (callback) { return callback(getContext(_this)); });
            if (centerOnInit) {
                _this.setCenter();
                _this.observer = new ResizeObserver(function () {
                    var _a;
                    _this.onInitCallbacks.forEach(function (callback) { return callback(getContext(_this)); });
                    _this.setCenter();
                    (_a = _this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
                });
                // Start observing the target node for configured mutations
                _this.observer.observe(contentComponent);
            }
        };
        /// ///////
        // Zoom
        /// ///////
        this.onWheelZoom = function (event) {
            var disabled = _this.setup.disabled;
            if (disabled)
                return;
            var isAllowed = isWheelAllowed(_this, event);
            if (!isAllowed)
                return;
            var keysPressed = _this.isPressingKeys(_this.setup.wheel.activationKeys);
            if (!keysPressed)
                return;
            handleWheelStart(_this, event);
            handleWheelZoom(_this, event);
            handleWheelStop(_this, event);
        };
        /// ///////
        // Pan
        /// ///////
        this.onPanningStart = function (event) {
            var disabled = _this.setup.disabled;
            var onPanningStart = _this.props.onPanningStart;
            if (disabled)
                return;
            var isAllowed = isPanningStartAllowed(_this, event);
            if (!isAllowed)
                return;
            var keysPressed = _this.isPressingKeys(_this.setup.panning.activationKeys);
            if (!keysPressed)
                return;
            event.preventDefault();
            event.stopPropagation();
            handleCancelAnimation(_this);
            handlePanningStart(_this, event);
            handleCallback(getContext(_this), event, onPanningStart);
        };
        this.onPanning = function (event) {
            var disabled = _this.setup.disabled;
            var onPanning = _this.props.onPanning;
            if (disabled)
                return;
            var isAllowed = isPanningAllowed(_this);
            if (!isAllowed)
                return;
            var keysPressed = _this.isPressingKeys(_this.setup.panning.activationKeys);
            if (!keysPressed)
                return;
            event.preventDefault();
            event.stopPropagation();
            handlePanning(_this, event.clientX, event.clientY);
            handleCallback(getContext(_this), event, onPanning);
        };
        this.onPanningStop = function (event) {
            var onPanningStop = _this.props.onPanningStop;
            if (_this.isPanning) {
                handlePanningEnd(_this);
                handleCallback(getContext(_this), event, onPanningStop);
            }
        };
        /// ///////
        // Pinch
        /// ///////
        this.onPinchStart = function (event) {
            var disabled = _this.setup.disabled;
            var _a = _this.props, onPinchingStart = _a.onPinchingStart, onZoomStart = _a.onZoomStart;
            if (disabled)
                return;
            var isAllowed = isPinchStartAllowed(_this, event);
            if (!isAllowed)
                return;
            handlePinchStart(_this, event);
            handleCancelAnimation(_this);
            handleCallback(getContext(_this), event, onPinchingStart);
            handleCallback(getContext(_this), event, onZoomStart);
        };
        this.onPinch = function (event) {
            var disabled = _this.setup.disabled;
            var _a = _this.props, onPinching = _a.onPinching, onZoom = _a.onZoom;
            if (disabled)
                return;
            var isAllowed = isPinchAllowed(_this);
            if (!isAllowed)
                return;
            event.preventDefault();
            event.stopPropagation();
            handlePinchZoom(_this, event);
            handleCallback(getContext(_this), event, onPinching);
            handleCallback(getContext(_this), event, onZoom);
        };
        this.onPinchStop = function (event) {
            var _a = _this.props, onPinchingStop = _a.onPinchingStop, onZoomStop = _a.onZoomStop;
            if (_this.pinchStartScale) {
                handlePinchStop(_this);
                handleCallback(getContext(_this), event, onPinchingStop);
                handleCallback(getContext(_this), event, onZoomStop);
            }
        };
        /// ///////
        // Touch
        /// ///////
        this.onTouchPanningStart = function (event) {
            var disabled = _this.setup.disabled;
            var onPanningStart = _this.props.onPanningStart;
            if (disabled)
                return;
            var isAllowed = isPanningStartAllowed(_this, event);
            if (!isAllowed)
                return;
            var isDoubleTap = _this.lastTouch && +new Date() - _this.lastTouch < 200;
            if (isDoubleTap && event.touches.length === 1) {
                _this.onDoubleClick(event);
            }
            else {
                _this.lastTouch = +new Date();
                handleCancelAnimation(_this);
                var touches = event.touches;
                var isPanningAction = touches.length === 1;
                var isPinchAction = touches.length === 2;
                if (isPanningAction) {
                    handleCancelAnimation(_this);
                    handlePanningStart(_this, event);
                    handleCallback(getContext(_this), event, onPanningStart);
                }
                if (isPinchAction) {
                    _this.onPinchStart(event);
                }
            }
        };
        this.onTouchPanning = function (event) {
            var disabled = _this.setup.disabled;
            var onPanning = _this.props.onPanning;
            if (_this.isPanning && event.touches.length === 1) {
                if (disabled)
                    return;
                var isAllowed = isPanningAllowed(_this);
                if (!isAllowed)
                    return;
                event.preventDefault();
                event.stopPropagation();
                var touch = event.touches[0];
                handlePanning(_this, touch.clientX, touch.clientY);
                handleCallback(getContext(_this), event, onPanning);
            }
            else if (event.touches.length > 1) {
                _this.onPinch(event);
            }
        };
        this.onTouchPanningStop = function (event) {
            _this.onPanningStop(event);
            _this.onPinchStop(event);
        };
        /// ///////
        // Double Click
        /// ///////
        this.onDoubleClick = function (event) {
            var disabled = _this.setup.disabled;
            if (disabled)
                return;
            var isAllowed = isDoubleClickAllowed(_this, event);
            if (!isAllowed)
                return;
            handleDoubleClick(_this, event);
        };
        /// ///////
        // Helpers
        /// ///////
        this.clearPanning = function (event) {
            if (_this.isPanning) {
                _this.onPanningStop(event);
            }
        };
        this.setKeyPressed = function (e) {
            _this.pressedKeys[e.key] = true;
        };
        this.setKeyUnPressed = function (e) {
            _this.pressedKeys[e.key] = false;
        };
        this.isPressingKeys = function (keys) {
            if (!keys.length) {
                return true;
            }
            return Boolean(keys.find(function (key) { return _this.pressedKeys[key]; }));
        };
        this.setTransformState = function (scale, positionX, positionY) {
            var onTransformed = _this.props.onTransformed;
            if (!Number.isNaN(scale) &&
                !Number.isNaN(positionX) &&
                !Number.isNaN(positionY)) {
                if (scale !== _this.transformState.scale) {
                    _this.transformState.previousScale = _this.transformState.scale;
                    _this.transformState.scale = scale;
                }
                _this.transformState.positionX = positionX;
                _this.transformState.positionY = positionY;
                _this.applyTransformation();
                var ctx_1 = getContext(_this);
                _this.onChangeCallbacks.forEach(function (callback) { return callback(ctx_1); });
                handleCallback(ctx_1, { scale: scale, positionX: positionX, positionY: positionY }, onTransformed);
            }
            else {
                console.error("Detected NaN set state values");
            }
        };
        this.setCenter = function () {
            if (_this.wrapperComponent && _this.contentComponent) {
                var targetState = getCenterPosition(_this.transformState.scale, _this.wrapperComponent, _this.contentComponent);
                _this.setTransformState(targetState.scale, targetState.positionX, targetState.positionY);
            }
        };
        this.handleTransformStyles = function (x, y, scale) {
            if (_this.props.customTransform) {
                return _this.props.customTransform(x, y, scale);
            }
            return getTransformStyles(x, y, scale);
        };
        this.applyTransformation = function () {
            if (!_this.mounted || !_this.contentComponent)
                return;
            var _a = _this.transformState, scale = _a.scale, positionX = _a.positionX, positionY = _a.positionY;
            var transform = _this.handleTransformStyles(positionX, positionY, scale);
            _this.contentComponent.style.transform = transform;
        };
        this.getContext = function () {
            return getContext(_this);
        };
        /**
         * Hooks
         */
        this.onChange = function (callback) {
            if (!_this.onChangeCallbacks.has(callback)) {
                _this.onChangeCallbacks.add(callback);
            }
            return function () {
                _this.onChangeCallbacks.delete(callback);
            };
        };
        this.onInit = function (callback) {
            if (!_this.onInitCallbacks.has(callback)) {
                _this.onInitCallbacks.add(callback);
            }
            return function () {
                _this.onInitCallbacks.delete(callback);
            };
        };
        /**
         * Initialization
         */
        this.init = function (wrapperComponent, contentComponent) {
            _this.cleanupWindowEvents();
            _this.wrapperComponent = wrapperComponent;
            _this.contentComponent = contentComponent;
            handleCalculateBounds(_this, _this.transformState.scale);
            _this.handleInitializeWrapperEvents(wrapperComponent);
            _this.handleInitialize(contentComponent);
            _this.initializeWindowEvents();
            _this.isInitialized = true;
            var ctx = getContext(_this);
            handleCallback(ctx, undefined, _this.props.onInit);
        };
        this.props = props;
        this.setup = createSetup(this.props);
        this.transformState = createState(this.props);
    }
    return ZoomPanPinch;
}());

var Context = React$1.createContext(null);
var getContent = function (children, ctx) {
    if (typeof children === "function") {
        return children(ctx);
    }
    return children;
};
var TransformWrapper = React$1.forwardRef(function (props, ref) {
    var instance = React$1.useRef(new ZoomPanPinch(props)).current;
    var content = getContent(props.children, getControls(instance));
    React$1.useImperativeHandle(ref, function () { return getControls(instance); }, [instance]);
    React$1.useEffect(function () {
        instance.update(props);
    }, [instance, props]);
    return React$1.createElement(Context.Provider, { value: instance }, content);
});

React$1.forwardRef(function (props, ref) {
    var localRef = React$1.useRef(null);
    var instance = React$1.useContext(Context);
    React$1.useEffect(function () {
        return instance.onChange(function (ctx) {
            if (localRef.current) {
                var positionX = 0;
                var positionY = 0;
                localRef.current.style.transform = instance.handleTransformStyles(positionX, positionY, 1 / ctx.instance.transformState.scale);
            }
        });
    }, [instance]);
    return React$1.createElement("div", __assign$1({}, props, { ref: mergeRefs([localRef, ref]) }));
});

function styleInject$1(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z$1 = ".transform-component-module_wrapper__SPB86 {\n  position: relative;\n  width: -moz-fit-content;\n  width: fit-content;\n  height: -moz-fit-content;\n  height: fit-content;\n  overflow: hidden;\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n  -khtml-user-select: none; /* Konqueror HTML */\n  -moz-user-select: none; /* Firefox */\n  -ms-user-select: none; /* Internet Explorer/Edge */\n  user-select: none;\n  margin: 0;\n  padding: 0;\n}\n.transform-component-module_content__FBWxo {\n  display: flex;\n  flex-wrap: wrap;\n  width: -moz-fit-content;\n  width: fit-content;\n  height: -moz-fit-content;\n  height: fit-content;\n  margin: 0;\n  padding: 0;\n  transform-origin: 0% 0%;\n}\n.transform-component-module_content__FBWxo img {\n  pointer-events: none;\n}\n";
var styles = {"wrapper":"transform-component-module_wrapper__SPB86","content":"transform-component-module_content__FBWxo"};
styleInject$1(css_248z$1);

var TransformComponent = function (_a) {
    var children = _a.children, _b = _a.wrapperClass, wrapperClass = _b === void 0 ? "" : _b, _c = _a.contentClass, contentClass = _c === void 0 ? "" : _c, wrapperStyle = _a.wrapperStyle, contentStyle = _a.contentStyle, _d = _a.wrapperProps, wrapperProps = _d === void 0 ? {} : _d, _e = _a.contentProps, contentProps = _e === void 0 ? {} : _e;
    var init = React$1.useContext(Context).init;
    var wrapperRef = React$1.useRef(null);
    var contentRef = React$1.useRef(null);
    React$1.useEffect(function () {
        var wrapper = wrapperRef.current;
        var content = contentRef.current;
        if (wrapper !== null && content !== null && init) {
            init(wrapper, content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (React$1.createElement("div", __assign$1({}, wrapperProps, { ref: wrapperRef, className: "react-transform-wrapper ".concat(styles.wrapper, " ").concat(wrapperClass), style: wrapperStyle }),
        React$1.createElement("div", __assign$1({}, contentProps, { ref: contentRef, className: "react-transform-component ".concat(styles.content, " ").concat(contentClass), style: contentStyle }), children)));
};

var useTransformContext = function () {
    var libraryContext = React$1.useContext(Context);
    if (!libraryContext) {
        throw new Error("Transform context must be placed inside TransformWrapper");
    }
    return libraryContext;
};

var useTransformInit = function (callback) {
    var libraryContext = useTransformContext();
    React$1.useEffect(function () {
        var unmountCallback;
        var unmount;
        if (libraryContext.contentComponent && libraryContext.wrapperComponent) {
            unmountCallback = callback(getState(libraryContext));
        }
        else {
            unmount = libraryContext.onInit(function (ref) {
                unmountCallback = callback(getState(ref.instance));
            });
        }
        return function () {
            unmount === null || unmount === void 0 ? void 0 : unmount();
            unmountCallback === null || unmountCallback === void 0 ? void 0 : unmountCallback();
        };
    }, []);
};

var useTransformEffect = function (callback) {
    var libraryContext = useTransformContext();
    React$1.useEffect(function () {
        var unmountCallback;
        var unmount = libraryContext.onChange(function (ref) {
            unmountCallback = callback(getState(ref.instance));
        });
        return function () {
            unmount();
            unmountCallback === null || unmountCallback === void 0 ? void 0 : unmountCallback();
        };
    }, [callback, libraryContext]);
};

/**
 * Calculate a point transformed with an affine matrix
 * @param matrix {Matrix} Affine Matrix
 * @param  point {Point} Point
 * @returns {Point} Point
 */
function applyToPoint (matrix, point) {
  return Array.isArray(point)
    ? [
        matrix.a * point[0] + matrix.c * point[1] + matrix.e,
        matrix.b * point[0] + matrix.d * point[1] + matrix.f
      ]
    : {
        x: matrix.a * point.x + matrix.c * point.y + matrix.e,
        y: matrix.b * point.x + matrix.d * point.y + matrix.f
      }
}

/**
 * Calculate an array of points transformed with an affine matrix
 * @param matrix {Matrix} Affine Matrix
 * @param points {Point[]} Array of point
 * @returns {Point[]} Array of point
 */
function applyToPoints (matrix, points) {
  return points.map(point => applyToPoint(matrix, point))
}

/**
 * Calculate a matrix that is the inverse of the provided matrix
 * @param matrix {Matrix} Affine Matrix
 * @returns {Matrix} Inverted Affine Matrix
 */
function inverse (matrix) {
  // http://www.wolframalpha.com/input/?i=Inverse+%5B%7B%7Ba,c,e%7D,%7Bb,d,f%7D,%7B0,0,1%7D%7D%5D

  const { a, b, c, d, e, f } = matrix;

  const denom = a * d - b * c;

  return {
    a: d / denom,
    b: b / -denom,
    c: c / -denom,
    d: a / denom,
    e: (d * e - c * f) / -denom,
    f: (b * e - a * f) / denom
  }
}

// Generated by Peggy 3.0.0.
//
// https://peggyjs.org/

function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function MiniatureMask(_ref) {
  let {
    SVGMinX,
    SVGMinY,
    SVGWidth,
    SVGHeight,
    x1,
    y1,
    x2,
    y2
  } = _ref;
  return /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("mask", {
    id: `react-svg-pan-zoom_miniature_mask_234`
  }, /*#__PURE__*/React.createElement("rect", {
    x: SVGMinX,
    y: SVGMinY,
    width: SVGWidth,
    height: SVGHeight,
    fill: "#ffffff"
  }), /*#__PURE__*/React.createElement("rect", {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1
  }))), /*#__PURE__*/React.createElement("rect", {
    x: SVGMinX,
    y: SVGMinY,
    width: SVGWidth,
    height: SVGHeight,
    style: {
      stroke: "none",
      fill: "#000",
      mask: `url(#react-svg-pan-zoom_miniature_mask_234)`,
      opacity: 0.4
    }
  }));
}

// import { useThrottleState } from "@better-hooks/performance";

function CustomMinimap(_ref) {
  let {
    background,
    width: miniatureWidth,
    height: miniatureHeight,
    miniatureOpen,
    SVGWidth,
    SVGHeight,
    viewerWidth,
    viewerHeight,
    children
  } = _ref;
  const [SVGMinX] = React$1.useState(0);
  const [SVGMinY] = React$1.useState(0);
  const [scale, setScale] = React$1.useState(0);
  const [positionX, setPositionX] = React$1.useState(0);
  const [positionY, setPositionY] = React$1.useState(0);
  useTransformEffect(_ref2 => {
    let {
      state
    } = _ref2;
    setScale(state?.scale);
    setPositionX(state?.positionX);
    setPositionY(state?.positionY);
  });
  useTransformInit(_ref3 => {
    let {
      state
    } = _ref3;
    setScale(state?.scale);
    setPositionX(state?.positionX);
    setPositionY(state?.positionY);
  });
  let ratio = SVGHeight / SVGWidth;
  const [zoomToFit, setZoomToFit] = React$1.useState(0);
  React$1.useMemo(() => {
    setZoomToFit(ratio >= 1 ? miniatureHeight / SVGHeight : miniatureWidth / SVGWidth);
  }, [ratio, miniatureHeight, SVGHeight, miniatureWidth, SVGWidth]);
  let [{
    x: x1,
    y: y1
  }, {
    x: x2,
    y: y2
  }] = applyToPoints(inverse({
    a: scale,
    b: 0,
    c: 0,
    d: scale,
    e: positionX,
    f: positionY
  }), [{
    x: 0,
    y: 0
  }, {
    x: viewerWidth,
    y: viewerHeight
  }]);
  let width, height;
  if (miniatureOpen) {
    width = miniatureWidth;
    height = miniatureHeight;
  } else {
    width = 23;
    height = 23;
  }
  let style = {
    position: "absolute",
    overflow: "hidden",
    outline: "1px solid rgba(19, 20, 22, 0.90)",
    transition: "width 200ms ease, height 200ms ease, bottom 200ms ease",
    width: width + "px",
    height: height + "px",
    bottom: "6px",
    right: "6px",
    zIndex: 501,
    background
  };
  let centerTranslation = ratio >= 1 ? `translate(${(miniatureWidth - SVGWidth * zoomToFit) / 2 - SVGMinX * zoomToFit}, ${-SVGMinY * zoomToFit})` : `translate(${-SVGMinX * zoomToFit}, ${(miniatureHeight - SVGHeight * zoomToFit) / 2 - SVGMinY * zoomToFit})`;
  return /*#__PURE__*/React.createElement("div", {
    role: "navigation",
    style: style
  }, /*#__PURE__*/React.createElement("svg", {
    width: miniatureWidth,
    height: miniatureHeight,
    style: {
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("g", {
    transform: centerTranslation
  }, /*#__PURE__*/React.createElement("g", {
    transform: `scale(${zoomToFit}, ${zoomToFit})`
  }, /*#__PURE__*/React.createElement("rect", {
    fill: background,
    x: SVGMinX,
    y: SVGMinY,
    width: SVGWidth,
    height: SVGHeight
  }), /*#__PURE__*/React.createElement("foreignObject", {
    width: SVGWidth,
    height: SVGHeight
  }, children), x1 ? /*#__PURE__*/React.createElement(MiniatureMask, {
    SVGWidth: SVGWidth,
    SVGHeight: SVGHeight,
    SVGMinX: SVGMinX,
    SVGMinY: SVGMinY,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    zoomToFit: zoomToFit
  }) : null))));
}

var __read$1 = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var styleToObject = function (input) {
    var attributes = input.split(/ ?; ?/);
    return attributes.reduce(function (acc, d) {
        var _a = __read$1(d.split(/ ?: ?/), 2), key = _a[0], value = _a[1];
        if (key && value) {
            acc[key.replace(/-(\w)/g, function (_$0, $1) { return $1.toUpperCase(); })] = Number.isNaN(Number(value))
                ? value
                : Number(value);
        }
        return acc;
    }, {});
};
/* istanbul ignore next */
function randomString$1(length) {
    if (length === void 0) { length = 6; }
    var characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var index = length; index > 0; --index) {
        result += characters[Math.round(Math.random() * (characters.length - 1))];
    }
    return result;
}
var noTextChildNodes = [
    'br',
    'col',
    'colgroup',
    'dl',
    'hr',
    'iframe',
    'img',
    'input',
    'link',
    'menuitem',
    'meta',
    'ol',
    'param',
    'select',
    'table',
    'tbody',
    'tfoot',
    'thead',
    'tr',
    'ul',
    'wbr',
];
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Taken from https://raw.githubusercontent.com/facebook/react/baff5cc2f69d30589a5dc65b089e47765437294b/packages/react-dom/src/shared/possibleStandardNames.js
// tslint:disable:object-literal-sort-keys
var possibleStandardNames = {
    // HTML
    'accept-charset': 'acceptCharset',
    acceptcharset: 'acceptCharset',
    accesskey: 'accessKey',
    allowfullscreen: 'allowFullScreen',
    autocapitalize: 'autoCapitalize',
    autocomplete: 'autoComplete',
    autocorrect: 'autoCorrect',
    autofocus: 'autoFocus',
    autoplay: 'autoPlay',
    autosave: 'autoSave',
    cellpadding: 'cellPadding',
    cellspacing: 'cellSpacing',
    charset: 'charSet',
    class: 'className',
    classid: 'classID',
    classname: 'className',
    colspan: 'colSpan',
    contenteditable: 'contentEditable',
    contextmenu: 'contextMenu',
    controlslist: 'controlsList',
    crossorigin: 'crossOrigin',
    dangerouslysetinnerhtml: 'dangerouslySetInnerHTML',
    datetime: 'dateTime',
    defaultchecked: 'defaultChecked',
    defaultvalue: 'defaultValue',
    enctype: 'encType',
    for: 'htmlFor',
    formmethod: 'formMethod',
    formaction: 'formAction',
    formenctype: 'formEncType',
    formnovalidate: 'formNoValidate',
    formtarget: 'formTarget',
    frameborder: 'frameBorder',
    hreflang: 'hrefLang',
    htmlfor: 'htmlFor',
    httpequiv: 'httpEquiv',
    'http-equiv': 'httpEquiv',
    icon: 'icon',
    innerhtml: 'innerHTML',
    inputmode: 'inputMode',
    itemid: 'itemID',
    itemprop: 'itemProp',
    itemref: 'itemRef',
    itemscope: 'itemScope',
    itemtype: 'itemType',
    keyparams: 'keyParams',
    keytype: 'keyType',
    marginwidth: 'marginWidth',
    marginheight: 'marginHeight',
    maxlength: 'maxLength',
    mediagroup: 'mediaGroup',
    minlength: 'minLength',
    nomodule: 'noModule',
    novalidate: 'noValidate',
    playsinline: 'playsInline',
    radiogroup: 'radioGroup',
    readonly: 'readOnly',
    referrerpolicy: 'referrerPolicy',
    rowspan: 'rowSpan',
    spellcheck: 'spellCheck',
    srcdoc: 'srcDoc',
    srclang: 'srcLang',
    srcset: 'srcSet',
    tabindex: 'tabIndex',
    typemustmatch: 'typeMustMatch',
    usemap: 'useMap',
    // SVG
    accentheight: 'accentHeight',
    'accent-height': 'accentHeight',
    alignmentbaseline: 'alignmentBaseline',
    'alignment-baseline': 'alignmentBaseline',
    allowreorder: 'allowReorder',
    arabicform: 'arabicForm',
    'arabic-form': 'arabicForm',
    attributename: 'attributeName',
    attributetype: 'attributeType',
    autoreverse: 'autoReverse',
    basefrequency: 'baseFrequency',
    baselineshift: 'baselineShift',
    'baseline-shift': 'baselineShift',
    baseprofile: 'baseProfile',
    calcmode: 'calcMode',
    capheight: 'capHeight',
    'cap-height': 'capHeight',
    clippath: 'clipPath',
    'clip-path': 'clipPath',
    clippathunits: 'clipPathUnits',
    cliprule: 'clipRule',
    'clip-rule': 'clipRule',
    colorinterpolation: 'colorInterpolation',
    'color-interpolation': 'colorInterpolation',
    colorinterpolationfilters: 'colorInterpolationFilters',
    'color-interpolation-filters': 'colorInterpolationFilters',
    colorprofile: 'colorProfile',
    'color-profile': 'colorProfile',
    colorrendering: 'colorRendering',
    'color-rendering': 'colorRendering',
    contentscripttype: 'contentScriptType',
    contentstyletype: 'contentStyleType',
    diffuseconstant: 'diffuseConstant',
    dominantbaseline: 'dominantBaseline',
    'dominant-baseline': 'dominantBaseline',
    edgemode: 'edgeMode',
    enablebackground: 'enableBackground',
    'enable-background': 'enableBackground',
    externalresourcesrequired: 'externalResourcesRequired',
    fillopacity: 'fillOpacity',
    'fill-opacity': 'fillOpacity',
    fillrule: 'fillRule',
    'fill-rule': 'fillRule',
    filterres: 'filterRes',
    filterunits: 'filterUnits',
    floodopacity: 'floodOpacity',
    'flood-opacity': 'floodOpacity',
    floodcolor: 'floodColor',
    'flood-color': 'floodColor',
    fontfamily: 'fontFamily',
    'font-family': 'fontFamily',
    fontsize: 'fontSize',
    'font-size': 'fontSize',
    fontsizeadjust: 'fontSizeAdjust',
    'font-size-adjust': 'fontSizeAdjust',
    fontstretch: 'fontStretch',
    'font-stretch': 'fontStretch',
    fontstyle: 'fontStyle',
    'font-style': 'fontStyle',
    fontvariant: 'fontVariant',
    'font-variant': 'fontVariant',
    fontweight: 'fontWeight',
    'font-weight': 'fontWeight',
    glyphname: 'glyphName',
    'glyph-name': 'glyphName',
    glyphorientationhorizontal: 'glyphOrientationHorizontal',
    'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
    glyphorientationvertical: 'glyphOrientationVertical',
    'glyph-orientation-vertical': 'glyphOrientationVertical',
    glyphref: 'glyphRef',
    gradienttransform: 'gradientTransform',
    gradientunits: 'gradientUnits',
    horizadvx: 'horizAdvX',
    'horiz-adv-x': 'horizAdvX',
    horizoriginx: 'horizOriginX',
    'horiz-origin-x': 'horizOriginX',
    imagerendering: 'imageRendering',
    'image-rendering': 'imageRendering',
    kernelmatrix: 'kernelMatrix',
    kernelunitlength: 'kernelUnitLength',
    keypoints: 'keyPoints',
    keysplines: 'keySplines',
    keytimes: 'keyTimes',
    lengthadjust: 'lengthAdjust',
    letterspacing: 'letterSpacing',
    'letter-spacing': 'letterSpacing',
    lightingcolor: 'lightingColor',
    'lighting-color': 'lightingColor',
    limitingconeangle: 'limitingConeAngle',
    markerend: 'markerEnd',
    'marker-end': 'markerEnd',
    markerheight: 'markerHeight',
    markermid: 'markerMid',
    'marker-mid': 'markerMid',
    markerstart: 'markerStart',
    'marker-start': 'markerStart',
    markerunits: 'markerUnits',
    markerwidth: 'markerWidth',
    maskcontentunits: 'maskContentUnits',
    maskunits: 'maskUnits',
    numoctaves: 'numOctaves',
    overlineposition: 'overlinePosition',
    'overline-position': 'overlinePosition',
    overlinethickness: 'overlineThickness',
    'overline-thickness': 'overlineThickness',
    paintorder: 'paintOrder',
    'paint-order': 'paintOrder',
    'panose-1': 'panose1',
    pathlength: 'pathLength',
    patterncontentunits: 'patternContentUnits',
    patterntransform: 'patternTransform',
    patternunits: 'patternUnits',
    pointerevents: 'pointerEvents',
    'pointer-events': 'pointerEvents',
    pointsatx: 'pointsAtX',
    pointsaty: 'pointsAtY',
    pointsatz: 'pointsAtZ',
    preservealpha: 'preserveAlpha',
    preserveaspectratio: 'preserveAspectRatio',
    primitiveunits: 'primitiveUnits',
    refx: 'refX',
    refy: 'refY',
    renderingintent: 'renderingIntent',
    'rendering-intent': 'renderingIntent',
    repeatcount: 'repeatCount',
    repeatdur: 'repeatDur',
    requiredextensions: 'requiredExtensions',
    requiredfeatures: 'requiredFeatures',
    shaperendering: 'shapeRendering',
    'shape-rendering': 'shapeRendering',
    specularconstant: 'specularConstant',
    specularexponent: 'specularExponent',
    spreadmethod: 'spreadMethod',
    startoffset: 'startOffset',
    stddeviation: 'stdDeviation',
    stitchtiles: 'stitchTiles',
    stopcolor: 'stopColor',
    'stop-color': 'stopColor',
    stopopacity: 'stopOpacity',
    'stop-opacity': 'stopOpacity',
    strikethroughposition: 'strikethroughPosition',
    'strikethrough-position': 'strikethroughPosition',
    strikethroughthickness: 'strikethroughThickness',
    'strikethrough-thickness': 'strikethroughThickness',
    strokedasharray: 'strokeDasharray',
    'stroke-dasharray': 'strokeDasharray',
    strokedashoffset: 'strokeDashoffset',
    'stroke-dashoffset': 'strokeDashoffset',
    strokelinecap: 'strokeLinecap',
    'stroke-linecap': 'strokeLinecap',
    strokelinejoin: 'strokeLinejoin',
    'stroke-linejoin': 'strokeLinejoin',
    strokemiterlimit: 'strokeMiterlimit',
    'stroke-miterlimit': 'strokeMiterlimit',
    strokewidth: 'strokeWidth',
    'stroke-width': 'strokeWidth',
    strokeopacity: 'strokeOpacity',
    'stroke-opacity': 'strokeOpacity',
    suppresscontenteditablewarning: 'suppressContentEditableWarning',
    suppresshydrationwarning: 'suppressHydrationWarning',
    surfacescale: 'surfaceScale',
    systemlanguage: 'systemLanguage',
    tablevalues: 'tableValues',
    targetx: 'targetX',
    targety: 'targetY',
    textanchor: 'textAnchor',
    'text-anchor': 'textAnchor',
    textdecoration: 'textDecoration',
    'text-decoration': 'textDecoration',
    textlength: 'textLength',
    textrendering: 'textRendering',
    'text-rendering': 'textRendering',
    underlineposition: 'underlinePosition',
    'underline-position': 'underlinePosition',
    underlinethickness: 'underlineThickness',
    'underline-thickness': 'underlineThickness',
    unicodebidi: 'unicodeBidi',
    'unicode-bidi': 'unicodeBidi',
    unicoderange: 'unicodeRange',
    'unicode-range': 'unicodeRange',
    unitsperem: 'unitsPerEm',
    'units-per-em': 'unitsPerEm',
    unselectable: 'unselectable',
    valphabetic: 'vAlphabetic',
    'v-alphabetic': 'vAlphabetic',
    vectoreffect: 'vectorEffect',
    'vector-effect': 'vectorEffect',
    vertadvy: 'vertAdvY',
    'vert-adv-y': 'vertAdvY',
    vertoriginx: 'vertOriginX',
    'vert-origin-x': 'vertOriginX',
    vertoriginy: 'vertOriginY',
    'vert-origin-y': 'vertOriginY',
    vhanging: 'vHanging',
    'v-hanging': 'vHanging',
    videographic: 'vIdeographic',
    'v-ideographic': 'vIdeographic',
    viewbox: 'viewBox',
    viewtarget: 'viewTarget',
    vmathematical: 'vMathematical',
    'v-mathematical': 'vMathematical',
    wordspacing: 'wordSpacing',
    'word-spacing': 'wordSpacing',
    writingmode: 'writingMode',
    'writing-mode': 'writingMode',
    xchannelselector: 'xChannelSelector',
    xheight: 'xHeight',
    'x-height': 'xHeight',
    xlinkactuate: 'xlinkActuate',
    'xlink:actuate': 'xlinkActuate',
    xlinkarcrole: 'xlinkArcrole',
    'xlink:arcrole': 'xlinkArcrole',
    xlinkhref: 'xlinkHref',
    'xlink:href': 'xlinkHref',
    xlinkrole: 'xlinkRole',
    'xlink:role': 'xlinkRole',
    xlinkshow: 'xlinkShow',
    'xlink:show': 'xlinkShow',
    xlinktitle: 'xlinkTitle',
    'xlink:title': 'xlinkTitle',
    xlinktype: 'xlinkType',
    'xlink:type': 'xlinkType',
    xmlbase: 'xmlBase',
    'xml:base': 'xmlBase',
    xmllang: 'xmlLang',
    'xml:lang': 'xmlLang',
    'xml:space': 'xmlSpace',
    xmlnsxlink: 'xmlnsXlink',
    'xmlns:xlink': 'xmlnsXlink',
    xmlspace: 'xmlSpace',
    ychannelselector: 'yChannelSelector',
    zoomandpan: 'zoomAndPan',
    // event handlers
    onblur: 'onBlur',
    onchange: 'onChange',
    onclick: 'onClick',
    oncontextmenu: 'onContextMenu',
    ondoubleclick: 'onDoubleClick',
    ondrag: 'onDrag',
    ondragend: 'onDragEnd',
    ondragenter: 'onDragEnter',
    ondragexit: 'onDragExit',
    ondragleave: 'onDragLeave',
    ondragover: 'onDragOver',
    ondragstart: 'onDragStart',
    ondrop: 'onDrop',
    onerror: 'onError',
    onfocus: 'onFocus',
    oninput: 'onInput',
    oninvalid: 'onInvalid',
    onkeydown: 'onKeyDown',
    onkeypress: 'onKeyPress',
    onkeyup: 'onKeyUp',
    onload: 'onLoad',
    onmousedown: 'onMouseDown',
    onmouseenter: 'onMouseEnter',
    onmouseleave: 'onMouseLeave',
    onmousemove: 'onMouseMove',
    onmouseout: 'onMouseOut',
    onmouseover: 'onMouseOver',
    onmouseup: 'onMouseUp',
    onscroll: 'onScroll',
    onsubmit: 'onSubmit',
    ontouchcancel: 'onTouchCancel',
    ontouchend: 'onTouchEnd',
    ontouchmove: 'onTouchMove',
    ontouchstart: 'onTouchStart',
    onwheel: 'onWheel',
};

var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
function parseAttributes(node, reactKey) {
    var attributes = {
        key: reactKey,
    };
    /* istanbul ignore else */
    if (node instanceof Element) {
        var nodeClassNames = node.getAttribute('class');
        if (nodeClassNames) {
            attributes.className = nodeClassNames;
        }
        __spreadArray([], __read(node.attributes), false).forEach(function (d) {
            switch (d.name) {
                // this is manually handled above, so break;
                case 'class':
                    break;
                case 'style':
                    attributes[d.name] = styleToObject(d.value);
                    break;
                case 'allowfullscreen':
                case 'allowpaymentrequest':
                case 'async':
                case 'autofocus':
                case 'autoplay':
                case 'checked':
                case 'controls':
                case 'default':
                case 'defer':
                case 'disabled':
                case 'formnovalidate':
                case 'hidden':
                case 'ismap':
                case 'itemscope':
                case 'loop':
                case 'multiple':
                case 'muted':
                case 'nomodule':
                case 'novalidate':
                case 'open':
                case 'readonly':
                case 'required':
                case 'reversed':
                case 'selected':
                case 'typemustmatch':
                    attributes[possibleStandardNames[d.name] || d.name] = true;
                    break;
                default:
                    attributes[possibleStandardNames[d.name] || d.name] = d.value;
            }
        });
    }
    return attributes;
}
function parseChildren(childNodeList, level, options) {
    var children = __spreadArray([], __read(childNodeList), false).map(function (node, index) {
        return convertFromNode(node, __assign(__assign({}, options), { index: index, level: level + 1 }));
    })
        .filter(Boolean);
    if (!children.length) {
        return null;
    }
    return children;
}
function parseName(nodeName) {
    if (/[a-z]+[A-Z]+[a-z]+/.test(nodeName)) {
        return nodeName;
    }
    return nodeName.toLowerCase();
}
function convertFromNode(input, options) {
    var _a;
    if (options === void 0) { options = {}; }
    if (!input || !(input instanceof Node)) {
        return null;
    }
    var _b = options.actions, actions = _b === void 0 ? [] : _b, _c = options.index, index = _c === void 0 ? 0 : _c, _d = options.level, level = _d === void 0 ? 0 : _d, randomKey = options.randomKey;
    var node = input;
    var key = "".concat(level, "-").concat(index);
    var result = [];
    if (randomKey && level === 0) {
        key = "".concat(randomString$1(), "-").concat(key);
    }
    /* istanbul ignore else */
    if (Array.isArray(actions)) {
        actions.forEach(function (action) {
            if (action.condition(node, key, level)) {
                if (typeof action.pre === 'function') {
                    node = action.pre(node, key, level);
                    if (!(node instanceof Node)) {
                        node = input;
                        /* istanbul ignore else */
                        if (process.env.NODE_ENV !== 'production') {
                            // eslint-disable-next-line no-console
                            console.warn('The `pre` method always must return a valid DomNode (instanceof Node) - your modification will be ignored (Hint: if you want to render a React-component, use the `post` method instead)');
                        }
                    }
                }
                if (typeof action.post === 'function') {
                    result.push(action.post(node, key, level));
                }
            }
        });
    }
    if (result.length) {
        return result;
    }
    switch (node.nodeType) {
        case 1: {
            // regular dom-node
            return React__namespace.createElement(parseName(node.nodeName), parseAttributes(node, key), parseChildren(node.childNodes, level, options));
        }
        case 3: {
            // textnode
            var nodeText = ((_a = node.nodeValue) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            /* istanbul ignore else */
            if (/^\s+$/.test(nodeText) && !/[\u00A0\u202F]/.test(nodeText)) {
                return null;
            }
            /* istanbul ignore next */
            if (!node.parentNode) {
                return nodeText;
            }
            var parentNodeName = node.parentNode.nodeName.toLowerCase();
            if (noTextChildNodes.includes(parentNodeName)) {
                /* istanbul ignore else */
                if (/\S/.test(nodeText)) {
                    // eslint-disable-next-line no-console
                    console.warn("A textNode is not allowed inside '".concat(parentNodeName, "'. Your text \"").concat(nodeText, "\" will be ignored"));
                }
                return null;
            }
            return nodeText;
        }
        case 8: {
            // html-comment
            return null;
        }
        /* istanbul ignore next */
        default: {
            return null;
        }
    }
}
function convertFromString(input, options) {
    if (options === void 0) { options = {}; }
    if (!input || typeof input !== 'string') {
        return null;
    }
    var _a = options.nodeOnly, nodeOnly = _a === void 0 ? false : _a, _b = options.selector, selector = _b === void 0 ? 'body > *' : _b, _c = options.type, type = _c === void 0 ? 'text/html' : _c;
    try {
        var parser = new DOMParser();
        var document_1 = parser.parseFromString(input, type);
        var node = document_1.querySelector(selector);
        if (!(node instanceof Node)) {
            throw new TypeError('Error parsing input');
        }
        if (nodeOnly) {
            return node;
        }
        return convertFromNode(node, options);
    }
    catch (error) {
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error(error);
        }
    }
    return null;
}
function convert(input, options) {
    if (options === void 0) { options = {}; }
    if (typeof input === 'string') {
        return convertFromString(input, options);
    }
    if (input instanceof Node) {
        return convertFromNode(input, options);
    }
    return null;
}

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/config.ts
var CACHE_NAME = "react-inlinesvg";
var CACHE_MAX_RETRIES = 10;
var STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  LOADED: "loaded",
  FAILED: "failed",
  READY: "ready",
  UNSUPPORTED: "unsupported"
};

// src/helpers.ts
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document && window.document.createElement);
}
function isSupportedEnvironment() {
  return supportsInlineSVG() && typeof window !== "undefined" && window !== null;
}
async function request(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");
  const [fileType] = (contentType ?? "").split(/ ?; ?/);
  if (response.status > 299) {
    throw new Error("Not found");
  }
  if (!["image/svg+xml", "text/plain"].some((d) => fileType.includes(d))) {
    throw new Error(`Content type isn't valid: ${fileType}`);
  }
  return response.text();
}
function sleep(seconds = 1) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1e3);
  });
}
function supportsInlineSVG() {
  if (!document) {
    return false;
  }
  const div = document.createElement("div");
  div.innerHTML = "<svg />";
  const svg = div.firstChild;
  return !!svg && svg.namespaceURI === "http://www.w3.org/2000/svg";
}
function randomCharacter(character) {
  return character[Math.floor(Math.random() * character.length)];
}
function randomString(length) {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "1234567890";
  const charset = `${letters}${letters.toUpperCase()}${numbers}`;
  let R = "";
  for (let index = 0; index < length; index++) {
    R += randomCharacter(charset);
  }
  return R;
}
function omit(input, ...filter) {
  const output = {};
  for (const key in input) {
    if ({}.hasOwnProperty.call(input, key)) {
      if (!filter.includes(key)) {
        output[key] = input[key];
      }
    }
  }
  return output;
}

// src/cache.ts
var CacheStore = class {
  constructor() {
    __publicField(this, "cacheApi");
    __publicField(this, "cacheStore");
    __publicField(this, "subscribers", []);
    __publicField(this, "isReady", false);
    this.cacheStore = /* @__PURE__ */ new Map();
    let cacheName = CACHE_NAME;
    let usePersistentCache = false;
    if (canUseDOM()) {
      cacheName = window.REACT_INLINESVG_CACHE_NAME ?? CACHE_NAME;
      usePersistentCache = !!window.REACT_INLINESVG_PERSISTENT_CACHE;
    }
    if (usePersistentCache) {
      caches.open(cacheName).then((cache) => {
        this.cacheApi = cache;
        this.isReady = true;
        this.subscribers.forEach((callback) => callback());
      });
    } else {
      this.isReady = true;
    }
  }
  onReady(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.subscribers.push(callback);
    }
  }
  async get(url, fetchOptions) {
    await (this.cacheApi ? this.fetchAndAddToPersistentCache(url, fetchOptions) : this.fetchAndAddToInternalCache(url, fetchOptions));
    return this.cacheStore.get(url)?.content ?? "";
  }
  set(url, data) {
    this.cacheStore.set(url, data);
  }
  isCached(url) {
    return this.cacheStore.get(url)?.status === STATUS.LOADED;
  }
  async fetchAndAddToInternalCache(url, fetchOptions) {
    const cache = this.cacheStore.get(url);
    if (cache?.status === STATUS.LOADING) {
      await this.handleLoading(url, async () => {
        this.cacheStore.set(url, { content: "", status: STATUS.IDLE });
        await this.fetchAndAddToInternalCache(url, fetchOptions);
      });
      return;
    }
    if (!cache?.content) {
      this.cacheStore.set(url, { content: "", status: STATUS.LOADING });
      try {
        const content = await request(url, fetchOptions);
        this.cacheStore.set(url, { content, status: STATUS.LOADED });
      } catch (error) {
        this.cacheStore.set(url, { content: "", status: STATUS.FAILED });
        throw error;
      }
    }
  }
  async fetchAndAddToPersistentCache(url, fetchOptions) {
    const cache = this.cacheStore.get(url);
    if (cache?.status === STATUS.LOADED) {
      return;
    }
    if (cache?.status === STATUS.LOADING) {
      await this.handleLoading(url, async () => {
        this.cacheStore.set(url, { content: "", status: STATUS.IDLE });
        await this.fetchAndAddToPersistentCache(url, fetchOptions);
      });
      return;
    }
    this.cacheStore.set(url, { content: "", status: STATUS.LOADING });
    const data = await this.cacheApi?.match(url);
    if (data) {
      const content = await data.text();
      this.cacheStore.set(url, { content, status: STATUS.LOADED });
      return;
    }
    try {
      await this.cacheApi?.add(new Request(url, fetchOptions));
      const response = await this.cacheApi?.match(url);
      const content = await response?.text() ?? "";
      this.cacheStore.set(url, { content, status: STATUS.LOADED });
    } catch (error) {
      this.cacheStore.set(url, { content: "", status: STATUS.FAILED });
      throw error;
    }
  }
  async handleLoading(url, callback) {
    let retryCount = 0;
    while (this.cacheStore.get(url)?.status === STATUS.LOADING && retryCount < CACHE_MAX_RETRIES) {
      await sleep(0.1);
      retryCount += 1;
    }
    if (retryCount >= CACHE_MAX_RETRIES) {
      await callback();
    }
  }
  keys() {
    return [...this.cacheStore.keys()];
  }
  data() {
    return [...this.cacheStore.entries()].map(([key, value]) => ({ [key]: value }));
  }
  async delete(url) {
    if (this.cacheApi) {
      await this.cacheApi.delete(url);
    }
    this.cacheStore.delete(url);
  }
  async clear() {
    if (this.cacheApi) {
      const keys = await this.cacheApi.keys();
      for (const key of keys) {
        await this.cacheApi.delete(key);
      }
    }
    this.cacheStore.clear();
  }
};
var cacheStore;
var ReactInlineSVG = class extends React__namespace.PureComponent {
  constructor(props) {
    super(props);
    __publicField(this, "hash");
    __publicField(this, "isActive", false);
    __publicField(this, "isInitialized", false);
    __publicField(this, "fetchContent", async () => {
      const { fetchOptions, src } = this.props;
      const content = await request(src, fetchOptions);
      this.handleLoad(content);
    });
    __publicField(this, "handleError", (error) => {
      const { onError } = this.props;
      const status = error.message === "Browser does not support SVG" ? STATUS.UNSUPPORTED : STATUS.FAILED;
      if (this.isActive) {
        this.setState({ status }, () => {
          if (typeof onError === "function") {
            onError(error);
          }
        });
      }
    });
    __publicField(this, "handleLoad", (content, hasCache = false) => {
      if (this.isActive) {
        this.setState(
          {
            content,
            isCached: hasCache,
            status: STATUS.LOADED
          },
          this.getElement
        );
      }
    });
    this.state = {
      content: "",
      element: null,
      isCached: !!props.cacheRequests && cacheStore.isCached(props.src),
      status: STATUS.IDLE
    };
    this.hash = props.uniqueHash ?? randomString(8);
  }
  componentDidMount() {
    this.isActive = true;
    if (!canUseDOM() || this.isInitialized) {
      return;
    }
    const { status } = this.state;
    const { src } = this.props;
    try {
      if (status === STATUS.IDLE) {
        if (!isSupportedEnvironment()) {
          throw new Error("Browser does not support SVG");
        }
        if (!src) {
          throw new Error("Missing src");
        }
        this.load();
      }
    } catch (error) {
      this.handleError(error);
    }
    this.isInitialized = true;
  }
  componentDidUpdate(previousProps, previousState) {
    if (!canUseDOM()) {
      return;
    }
    const { isCached, status } = this.state;
    const { onLoad, src } = this.props;
    if (previousState.status !== STATUS.READY && status === STATUS.READY) {
      if (onLoad) {
        onLoad(src, isCached);
      }
    }
    if (previousProps.src !== src) {
      if (!src) {
        this.handleError(new Error("Missing src"));
        return;
      }
      this.load();
    }
  }
  componentWillUnmount() {
    this.isActive = false;
  }
  getElement() {
    try {
      const node = this.getNode();
      const element = convert(node);
      if (!element || !React__namespace.isValidElement(element)) {
        throw new Error("Could not convert the src to a React element");
      }
      this.setState({
        element,
        status: STATUS.READY
      });
    } catch (error) {
      this.handleError(new Error(error.message));
    }
  }
  getNode() {
    const { description, title } = this.props;
    try {
      const svgText = this.processSVG();
      const node = convert(svgText, { nodeOnly: true });
      if (!node || !(node instanceof SVGSVGElement)) {
        throw new Error("Could not convert the src to a DOM Node");
      }
      const svg = this.updateSVGAttributes(node);
      if (description) {
        const originalDesc = svg.querySelector("desc");
        if (originalDesc?.parentNode) {
          originalDesc.parentNode.removeChild(originalDesc);
        }
        const descElement = document.createElementNS("http://www.w3.org/2000/svg", "desc");
        descElement.innerHTML = description;
        svg.prepend(descElement);
      }
      if (typeof title !== "undefined") {
        const originalTitle = svg.querySelector("title");
        if (originalTitle?.parentNode) {
          originalTitle.parentNode.removeChild(originalTitle);
        }
        if (title) {
          const titleElement = document.createElementNS("http://www.w3.org/2000/svg", "title");
          titleElement.innerHTML = title;
          svg.prepend(titleElement);
        }
      }
      return svg;
    } catch (error) {
      return this.handleError(error);
    }
  }
  load() {
    if (this.isActive) {
      this.setState(
        {
          content: "",
          element: null,
          isCached: false,
          status: STATUS.LOADING
        },
        async () => {
          const { cacheRequests, fetchOptions, src } = this.props;
          const dataURI = /^data:image\/svg[^,]*?(;base64)?,(.*)/u.exec(src);
          let inlineSrc;
          if (dataURI) {
            inlineSrc = dataURI[1] ? window.atob(dataURI[2]) : decodeURIComponent(dataURI[2]);
          } else if (src.includes("<svg")) {
            inlineSrc = src;
          }
          if (inlineSrc) {
            this.handleLoad(inlineSrc);
            return;
          }
          try {
            if (cacheRequests) {
              const content = await cacheStore.get(src, fetchOptions);
              this.handleLoad(content, true);
            } else {
              await this.fetchContent();
            }
          } catch (error) {
            this.handleError(error);
          }
        }
      );
    }
  }
  processSVG() {
    const { content } = this.state;
    const { preProcessor } = this.props;
    if (preProcessor) {
      return preProcessor(content);
    }
    return content;
  }
  updateSVGAttributes(node) {
    const { baseURL = "", uniquifyIDs } = this.props;
    const replaceableAttributes = ["id", "href", "xlink:href", "xlink:role", "xlink:arcrole"];
    const linkAttributes = ["href", "xlink:href"];
    const isDataValue = (name, value) => linkAttributes.includes(name) && (value ? !value.includes("#") : false);
    if (!uniquifyIDs) {
      return node;
    }
    [...node.children].forEach((d) => {
      if (d.attributes?.length) {
        const attributes = Object.values(d.attributes).map((a) => {
          const attribute = a;
          const match = /url\((.*?)\)/.exec(a.value);
          if (match?.[1]) {
            attribute.value = a.value.replace(match[0], `url(${baseURL}${match[1]}__${this.hash})`);
          }
          return attribute;
        });
        replaceableAttributes.forEach((r) => {
          const attribute = attributes.find((a) => a.name === r);
          if (attribute && !isDataValue(r, attribute.value)) {
            attribute.value = `${attribute.value}__${this.hash}`;
          }
        });
      }
      if (d.children.length) {
        return this.updateSVGAttributes(d);
      }
      return d;
    });
    return node;
  }
  render() {
    const { element, status } = this.state;
    const { children = null, innerRef, loader = null } = this.props;
    const elementProps = omit(
      this.props,
      "baseURL",
      "cacheRequests",
      "children",
      "description",
      "fetchOptions",
      "innerRef",
      "loader",
      "onError",
      "onLoad",
      "preProcessor",
      "src",
      "title",
      "uniqueHash",
      "uniquifyIDs"
    );
    if (!canUseDOM()) {
      return loader;
    }
    if (element) {
      return React__namespace.cloneElement(element, { ref: innerRef, ...elementProps });
    }
    if ([STATUS.UNSUPPORTED, STATUS.FAILED].includes(status)) {
      return children;
    }
    return loader;
  }
};
__publicField(ReactInlineSVG, "defaultProps", {
  cacheRequests: true,
  uniquifyIDs: false
});
function InlineSVG(props) {
  if (!cacheStore) {
    cacheStore = new CacheStore();
  }
  const { loader } = props;
  const hasCallback = React__namespace.useRef(false);
  const [isReady, setReady] = React__namespace.useState(cacheStore.isReady);
  React__namespace.useEffect(() => {
    if (!hasCallback.current) {
      cacheStore.onReady(() => {
        setReady(true);
      });
      hasCallback.current = true;
    }
  }, []);
  if (!isReady) {
    return loader;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ReactInlineSVG, { ...props });
}

const svgFillEditMode = _ref => {
  let {
    svgRef,
    select
  } = _ref;
  if (select && svgRef?.current) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#7DFE7F";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#7DFE7F";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#7DFE7F";
      });
    }
  }
  if (!select && svgRef?.current) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#ccc";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#ccc";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#ccc";
      });
    }
  }
};

const svgFillNoEditMode = _ref => {
  let {
    svgRef,
    item
  } = _ref;
  if (!item?.active) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#DEDEDE";
        circle.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#DEDEDE";
        path.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#DEDEDE";
        polygon.style.stroke = "#8D8D8D";
      });
    }
    return;
  }
  if (item?.reservations?.length && !item?.reservations?.find(el => el?.my_reservation)) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#DEDEDE";
        circle.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#DEDEDE";
        path.style.stroke = "#8D8D8D";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#DEDEDE";
        polygon.style.stroke = "#8D8D8D";
      });
    }
    return;
  }
  if (item?.reservations?.length && item?.reservations?.find(el => el?.my_reservation)) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#C9E2FF";
        circle.style.stroke = "#1C83FA";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#C9E2FF";
        path.style.stroke = "#1C83FA";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#C9E2FF";
        polygon.style.stroke = "#1C83FA";
      });
    }
    return;
  }
  if (!item?.reservations?.length) {
    if (svgRef.current?.querySelector("circle")) {
      const circles = svgRef.current.querySelectorAll("circle");
      circles.forEach(circle => {
        circle.style.fill = "#CEF0D6";
        circle.style.stroke = "#3BB856";
      });
    }
    if (svgRef.current?.querySelector("path")) {
      const paths = svgRef.current.querySelectorAll("path");
      paths.forEach(path => {
        path.style.fill = "#CEF0D6";
        path.style.stroke = "#3BB856";
      });
    }
    if (svgRef.current?.querySelector("polygon")) {
      const polygons = svgRef.current.querySelectorAll("polygon");
      polygons.forEach(polygon => {
        polygon.style.fill = "#CEF0D6";
        polygon.style.stroke = "#3BB856";
      });
    }
    return;
  }
};

var img$1 = "data:image/svg+xml,%3csvg width='11' height='12' viewBox='0 0 11 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.2 1.2V0H3.6V1.2H2.4V2.4H0V3.6H1.2V10.8H2.4V12H8.4V10.8H9.6V3.6H10.8V2.4H8.4V1.2H7.2ZM3.6 4.8H2.4V9.6H3.6V4.8ZM4.8 4.8H6V9.6H4.8V4.8ZM8.4 4.8H7.2V9.6H8.4V4.8Z' fill='%237F8082'/%3e%3c/svg%3e";

var img = "data:image/svg+xml,%3csvg width='11' height='12' viewBox='0 0 11 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' clip-rule='evenodd' d='M7.2 1.2V0H3.6V1.2H2.4V2.4H0V3.6H1.2V10.8H2.4V12H8.4V10.8H9.6V3.6H10.8V2.4H8.4V1.2H7.2ZM3.6 4.8H2.4V9.6H3.6V4.8ZM4.8 4.8H6V9.6H4.8V4.8ZM8.4 4.8H7.2V9.6H8.4V4.8Z' fill='white'/%3e%3c/svg%3e";

const NoActiveTooltip = _ref => {
  let {
    setTooltipSizes,
    refTooltip,
    item
  } = _ref;
  const context = useTransformContext();
  React$1.useEffect(() => {
    if (refTooltip?.current) {
      setTooltipSizes({
        width: refTooltip?.current?.offsetWidth,
        height: refTooltip?.current?.offsetHeight,
        x: refTooltip?.current?.getBoundingClientRect()?.x + refTooltip?.current?.offsetWidth * context?.transformState?.scale
      });
    }
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: refTooltip,
    className: `w-fit py-1 px-3 z-[500] rounded-md bg-[#000000] before:content-['']`
  }, item?.reservations?.length ? item?.reservations?.map((el, i) => /*#__PURE__*/React.createElement("div", {
    key: el.user.id + i,
    className: `flex ${i !== item?.reservations?.length - 1 ? "mb-4" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "mr-2.5"
  }, /*#__PURE__*/React.createElement("img", {
    className: "w-8 h-8 rounded-full",
    src: el?.user?.avatar_url,
    alt: "avatar"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: `text-xs ${item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"}`
  }, el?.user?.name), /*#__PURE__*/React.createElement("p", {
    className: `text-xs font-light ${item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"}`
  }, "\u0421 ", el?.period?.from, " \u0434\u043E ", el?.period?.to)))) : /*#__PURE__*/React.createElement("p", {
    className: `text-sx text-[#fff]`
  }, "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E"));
};
const ActiveReservationTooltip = _ref2 => {
  let {
    setTooltipSizes,
    item,
    refTooltip
  } = _ref2;
  const context = useTransformContext();
  React$1.useEffect(() => {
    if (refTooltip?.current) {
      setTooltipSizes({
        width: refTooltip?.current?.offsetWidth,
        height: refTooltip?.current?.offsetHeight,
        x: refTooltip?.current?.getBoundingClientRect()?.x + refTooltip?.current?.offsetWidth * context?.transformState?.scale
      });
    }
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: refTooltip,
    className: `overflow-auto w-[290px] max-h-80 p-4 pb-4 z-[500] rounded-md ${item?.reservations?.length > 1 ? "bg-[#ffffff]" : "bg-[#000000]"}`
  }, item?.reservations?.map((el, i) => /*#__PURE__*/React.createElement("div", {
    key: el.user.id + i,
    className: `flex relative ${i !== item?.reservations?.length - 1 ? "mb-4" : ""}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "mr-2.5"
  }, /*#__PURE__*/React.createElement("img", {
    className: "w-8 h-8 rounded-full",
    src: el?.user?.avatar_url,
    alt: "avatar"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: `text-xs pr-2 ${item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"}`
  }, el?.user?.name), /*#__PURE__*/React.createElement("p", {
    className: `text-xs pr-2 font-light ${item?.reservations?.length > 1 ? "text-[#000]" : "text-[#fff]"}`
  }, "\u0421 ", el?.period?.from, " \u0434\u043E ", el?.period?.to), el?.my_reservation ? /*#__PURE__*/React.createElement("img", {
    style: {
      pointerEvents: "visiblePainted"
    },
    onClick: () => {
      const event = new CustomEvent("deleteMyBooking");
      event.param = {
        reservationId: el.id,
        idObject: item.id
      };
      window.document.dispatchEvent(event);
    },
    className: "absolute right-0 top-1 cursor-pointer",
    src: item?.reservations?.length > 1 ?
    // eslint-disable-next-line no-undef
    process.env.REACT_APP_PUBLIC_URL + img$1 :
    // eslint-disable-next-line no-undef
    process.env.REACT_APP_PUBLIC_URL + img,
    alt: "delete"
  }) : null))));
};
const Tooltip = _ref3 => {
  let {
    item,
    handleHideTooltip,
    handleShowTooltip,
    position,
    width,
    height,
    widthScreen
  } = _ref3;
  const [tooltipSizes, setTooltipSizes] = React$1.useState({
    width: 0,
    height: 0,
    x: 0
  });
  const refTooltip = React$1.useRef();
  // console.log(tooltipSizes?.x);
  return /*#__PURE__*/React.createElement("g", {
    onPointerLeave: () => handleHideTooltip(),
    onPointerEnter: () => {
      handleShowTooltip();
    },
    transform: tooltipSizes?.x > widthScreen ? `translate(${position.x - tooltipSizes?.width - 10},${position.y})` : `translate(${position.x + width + 10},${position.y})`
  }, /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("foreignObject", {
    className: "shadow-tooltip rounded-md",
    width: tooltipSizes?.width,
    height: tooltipSizes?.height
  }, !item?.active ? /*#__PURE__*/React.createElement(NoActiveTooltip, {
    refTooltip: refTooltip,
    item: item,
    setTooltipSizes: setTooltipSizes
  }) : item?.reservations?.length ? /*#__PURE__*/React.createElement(ActiveReservationTooltip, {
    item: item,
    refTooltip: refTooltip,
    setTooltipSizes: setTooltipSizes
  }) : /*#__PURE__*/React.createElement(React.Fragment, null)), /*#__PURE__*/React.createElement("rect", {
    transform: tooltipSizes?.x > widthScreen ? `translate(${tooltipSizes?.width})` : "translate(-10)",
    width: 10,
    height: height > tooltipSizes?.height ? tooltipSizes?.height : height,
    fill: "transparent"
  })));
};

const statusFill = item => {
  if (!item?.active) {
    return "#DEDEDE";
  }
  if (item?.reservations?.length && !item?.reservations?.find(el => el?.my_reservation)) {
    return "#DEDEDE";
  }
  if (item?.reservations?.length && item?.reservations?.find(el => el?.my_reservation)) {
    return "#C9E2FF";
  }
  if (!item?.reservations?.length) {
    return "#CEF0D6";
  }
};

const statusStroke = item => {
  if (!item?.active) {
    return "#8D8D8D";
  }
  if (item?.reservations?.length && !item?.reservations?.find(el => el?.my_reservation)) {
    return "#8D8D8D";
  }
  if (item?.reservations?.length && item?.reservations?.find(el => el?.my_reservation)) {
    return "#1C83FA";
  }
  if (!item?.reservations?.length) {
    return "#3BB856";
  }
};

const Plus = _ref => {
  let {
    itemObject,
    mapScale,
    rotate,
    hoverItem,
    item,
    maxFontSizeCircle,
    fontCircle = false
  } = _ref;
  return hoverItem ? /*#__PURE__*/React.createElement("g", {
    cursor: "pointer",
    transform: `translate(${itemObject?.focus_coordinate?.x_coordinate / mapScale}, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`
  }, /*#__PURE__*/React.createElement("g", {
    transform: `rotate(${-rotate})`
  }, /*#__PURE__*/React.createElement("circle", {
    r: "14",
    fill: "#1F88D4"
  }), /*#__PURE__*/React.createElement("circle", {
    r: "6",
    fill: "#ffffff"
  }), /*#__PURE__*/React.createElement("line", {
    x1: -4,
    y1: 0,
    x2: 4,
    y2: 0,
    style: {
      stroke: "#1F88D4",
      strokeWidth: "1px"
    }
  }), /*#__PURE__*/React.createElement("line", {
    x1: 0,
    y1: -4,
    x2: 0,
    y2: 4,
    style: {
      stroke: "#1F88D4",
      strokeWidth: "1px"
    }
  }))) : fontCircle ? /*#__PURE__*/React.createElement("g", {
    cursor: "pointer",
    transform: `translate(${itemObject?.focus_coordinate?.x_coordinate / mapScale}, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`
  }, /*#__PURE__*/React.createElement("g", {
    transform: `rotate(${-rotate})`
  }, /*#__PURE__*/React.createElement("text", {
    textAnchor: "middle",
    alignmentBaseline: "middle",
    style: {
      fontSize: maxFontSizeCircle
    }
  }, item?.name))) : /*#__PURE__*/React.createElement("g", {
    cursor: "pointer",
    transform: `translate(${itemObject?.focus_coordinate?.x_coordinate / mapScale}, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`
  }, /*#__PURE__*/React.createElement("g", {
    transform: `rotate(${-rotate})`
  }, /*#__PURE__*/React.createElement("circle", {
    r: "14",
    fill: statusFill(item),
    stroke: statusStroke(item)
  }), /*#__PURE__*/React.createElement("text", {
    textAnchor: "middle",
    alignmentBaseline: "middle",
    style: {
      fontSize: maxFontSizeCircle
    }
  }, item?.name)));
};
const Avatar = _ref2 => {
  let {
    itemObject,
    item,
    mapScale,
    rotate
  } = _ref2;
  return /*#__PURE__*/React.createElement("g", {
    transform: `translate(${itemObject?.focus_coordinate?.x_coordinate / mapScale}, ${itemObject?.focus_coordinate?.y_coordinate / mapScale})`
  }, /*#__PURE__*/React.createElement("g", {
    transform: `rotate(${-rotate})`
  }, /*#__PURE__*/React.createElement("foreignObject", {
    className: "rounded-full",
    width: 28,
    height: 28,
    x: -14,
    y: -14
  }, /*#__PURE__*/React.createElement("img", {
    className: "w-8 h-8 rounded-full",
    src: item?.reservations[0]?.user?.avatar_url,
    alt: "avatar",
    width: 28,
    height: 28
  }))));
};
const HoverItemStatus = _ref3 => {
  let {
    itemObject,
    mapScale,
    item,
    hoverItem,
    rotate,
    maxFontSizeCircle
  } = _ref3;
  // console.log(item);
  return item?.active && !item?.reservations?.length ? /*#__PURE__*/React.createElement(Plus, {
    itemObject: itemObject,
    mapScale: mapScale,
    hoverItem: hoverItem,
    rotate: rotate,
    item: item,
    maxFontSizeCircle: maxFontSizeCircle
  }) : item?.active && item?.reservations?.length ? /*#__PURE__*/React.createElement(Avatar, {
    itemObject: itemObject,
    item: item,
    mapScale: mapScale,
    rotate: rotate
  }) : null;
};

const DragSvg = _ref => {
  let {
    x,
    y,
    href,
    zoomComponentActive,
    width,
    height,
    setPanningDisabled,
    setDisabledZoomComponent,
    editItem,
    item,
    deltaX,
    deltaY,
    mapScale,
    editMode,
    setShowModal,
    setSaveToggle,
    setShowEditModal,
    changeIndexObjectsArray,
    widthScreen,
    setRotateActive,
    mapSize,
    itemObject,
    maxFontSizeCircle
  } = _ref;
  const {
    setActiveItem,
    setActiveEditItem,
    setSelectItem
  } = useStore(store => store);
  const activeEditItem = useStore(store => store.data.activeEditItem);
  const selectItem = useStore(store => store.data.selectItem);
  const active = activeEditItem?.id === item?.id;
  const select = selectItem?.id === item?.id;
  const [position, setPosition] = React$1.useState({
    x: x,
    y: y,
    active: false,
    rotate: 0,
    offset: {}
  });
  const [load, setLoad] = React$1.useState(false);
  const [down, setDawn] = React$1.useState(false);
  const [hoverItem, setHoverItem] = React$1.useState(false);
  const [mouseDefaultPositionDown, setMouseDefaultPositionDown] = React$1.useState({
    x: 0,
    y: 0
  });
  const ref = React$1.useRef();
  const svgRef = React$1.useRef();
  const handlePointerDown = e => {
    if (editMode) {
      setMouseDefaultPositionDown({
        x: e?.clientX,
        y: e?.clientY
      });
      if (activeEditItem?.id === item.id) {
        setDawn(true);
        setPanningDisabled(true);
        setDisabledZoomComponent(true);
        const el = e.target;
        const bbox = e.target.getBoundingClientRect();
        const x = e.clientX - bbox.left;
        const y = e.clientY - bbox.top;
        el.setPointerCapture(e.pointerId);
        setPosition({
          ...position,
          active: true,
          offset: {
            x,
            y
          }
        });
      }
    }
  };
  React$1.useEffect(() => {
    if (!editMode) {
      setActiveEditItem(null);
      setSelectItem(null);
    }
  }, [editMode]);
  const handlePointerMove = e => {
    const bbox = e.target.getBoundingClientRect();
    const x = e.clientX - bbox.left;
    const y = e.clientY - bbox.top;
    if (position.active) {
      setPosition({
        ...position,
        x: position.x - (position.offset.x - x) < 0 ? 0 : position.x + width - (position.offset.x - x) > mapSize?.width ? mapSize?.width - width : position.x - (position.offset.x - x),
        y: position.y - (position.offset.y - y) < 0 ? 0 : position.y + height - (position.offset.y - y) > mapSize?.height ? mapSize?.height - height : position.y - (position.offset.y - y)
      });
    }
  };
  const handlePointerUp = e => {
    if (down) {
      e.stopPropagation();
      setPanningDisabled(false);
      setDisabledZoomComponent(false);
      const positions = {
        x_coordinate: Math.round(position.x * mapScale - deltaX),
        y_coordinate: Math.round(position.y * mapScale - deltaY)
      };
      editItem(item, positions);
      setPosition({
        ...position,
        active: false
      });
      setSaveToggle(true);
      setDawn(false);
    }
  };
  const handleClick = e => {
    e.stopPropagation();
    if (editMode) {
      changeIndexObjectsArray(item);
      if (e.detail === 1) {
        setActiveEditItem(item);
        setSelectItem(item);
      }
      if (e.detail === 2) {
        if (Math.round(e.clientX) - 5 < Math.round(mouseDefaultPositionDown.x) && Math.round(e.clientX) + 5 > Math.round(mouseDefaultPositionDown.x) && Math.round(e.clientY) - 5 < Math.round(mouseDefaultPositionDown.y) && Math.round(e.clientY) + 5 > Math.round(mouseDefaultPositionDown.y)) {
          setActiveItem(item);
          setSelectItem(item);
          setShowEditModal(true);
        }
      }
    } else {
      const event = new CustomEvent("openBookingModal");
      event.param = {
        id: item.id
      };
      window.document.dispatchEvent(event);
    }
  };
  const handlePointerDownRotate = React$1.useCallback(e => {
    e.stopPropagation();
    setDisabledZoomComponent(true);
    setRotateActive(true);
    document.addEventListener("mousemove", handlePointerMoveRotate);
    document.addEventListener("mouseup", mouseUpRotate);
  }, [position]);
  const mouseUpRotate = React$1.useCallback(e => {
    e.stopPropagation();
    let x2 = e.clientX,
      y2 = e.clientY,
      x1 = ref.current?.getBoundingClientRect().x + width / 2,
      y1 = ref.current?.getBoundingClientRect().y + height / 2,
      angleRads = Math.atan2(y2 - y1, x2 - x1),
      angleDeg = angleRads * (180 / Math.PI) + 90 - 180;
    const positions = {
      x_coordinate: Math.round(position.x * mapScale - deltaX),
      y_coordinate: Math.round(position.y * mapScale - deltaY),
      rotate: angleDeg
    };
    editItem(item, positions);
    document.removeEventListener("mousemove", handlePointerMoveRotate);
    document.removeEventListener("mouseup", mouseUpRotate);
  }, [position]);
  const handlePointerMoveRotate = React$1.useCallback(e => {
    e.stopPropagation();
    let x2 = e.clientX,
      y2 = e.clientY,
      x1 = ref.current?.getBoundingClientRect().x + width / 2,
      y1 = ref.current?.getBoundingClientRect().y + height / 2,
      angleRads = Math.atan2(y2 - y1, x2 - x1),
      angleDeg = angleRads * (180 / Math.PI) + 90 - 180;
    setPosition({
      ...position,
      rotate: angleDeg
    });
  }, [position]);
  React$1.useEffect(() => {
    if (editMode) {
      svgFillEditMode({
        svgRef,
        select
      });
    } else {
      if (svgRef?.current) {
        svgFillNoEditMode({
          svgRef,
          item
        });
      }
    }
  }, [select, editMode, svgRef?.current, item]);
  const handleShowTooltip = () => {
    setHoverItem(true);
    changeIndexObjectsArray(item);
    // setPanningDisabled(true);
    // setDisabledZoomComponent(true);
  };

  const handleHideTooltip = () => {
    setHoverItem(false);
    // setPanningDisabled(false);
    // setDisabledZoomComponent(false);
  };

  // console.log(itemObject);

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("g", {
    id: item?.id,
    transform: `translate(${position.x},${position.y}) rotate(${position.rotate})`,
    style: {
      transformOrigin: "center",
      transformBox: "fill-box",
      willChange: "transform"
    },
    ref: ref
  }, /*#__PURE__*/React.createElement(InlineSVG, {
    opacity: load ? 1 : 0,
    onLoad: () => setLoad(true),
    innerRef: svgRef,
    width: width,
    height: height,
    src: href
  }), !editMode ? /*#__PURE__*/React.createElement(HoverItemStatus, {
    item: item,
    maxFontSizeCircle: maxFontSizeCircle,
    rotate: position.rotate,
    hoverItem: hoverItem,
    itemObject: itemObject,
    mapScale: mapScale
  }) : null), /*#__PURE__*/React.createElement("g", {
    transform: `translate(${position.x},${position.y})`,
    style: {
      transformOrigin: "center",
      transformBox: "fill-box",
      willChange: "transform"
    },
    visibility: editMode && active ? "" : "hidden"
  }, /*#__PURE__*/React.createElement("line", {
    x1: width / 2,
    y1: height / 2,
    x2: width / 2 + (width / 2 - width / 2) * Math.cos(position.rotate * (Math.PI / 180)) - (height + 40 - height / 2) * Math.sin(position.rotate * (Math.PI / 180)),
    y2: height / 2 + (width / 2 - width / 2) * Math.sin(position.rotate * (Math.PI / 180)) + (height + 40 - height / 2) * Math.cos(position.rotate * (Math.PI / 180)),
    style: {
      stroke: "#000",
      strokeWidth: "1px"
    }
  }), /*#__PURE__*/React.createElement("circle", {
    cx: width / 2 + (width / 2 - width / 2) * Math.cos(position.rotate * (Math.PI / 180)) - (height + 40 - height / 2) * Math.sin(position.rotate * (Math.PI / 180)),
    cy: height / 2 + (width / 2 - width / 2) * Math.sin(position.rotate * (Math.PI / 180)) + (height + 40 - height / 2) * Math.cos(position.rotate * (Math.PI / 180)),
    r: "5",
    stroke: "black",
    cursor: "ew-resize",
    strokeWidth: "1",
    fill: "white",
    onPointerDown: handlePointerDownRotate
  })), !editMode && hoverItem ? /*#__PURE__*/React.createElement(Tooltip, {
    handleHideTooltip: handleHideTooltip,
    handleShowTooltip: handleShowTooltip,
    item: item,
    position: position,
    width: width,
    height: height,
    widthScreen: widthScreen
  }) : null, /*#__PURE__*/React.createElement("rect", {
    transform: `translate(${position.x},${position.y}) rotate(${position.rotate})`,
    style: {
      transformOrigin: "center",
      transformBox: "fill-box",
      willChange: "transform"
    },
    width: width,
    height: height,
    fill: "transparent",
    cursor: active ? "all-scroll" : editMode ? "pointer" : !editMode && item?.active ? "pointer" : "default",
    onPointerLeave: () => {
      !editMode ? handleHideTooltip() : () => {};
    },
    onPointerEnter: () => {
      !editMode ? handleShowTooltip() : () => {};
    },
    onPointerDown: handlePointerDown,
    onPointerUp: e => editMode ? handlePointerUp(e) : () => {},
    onClick: e => editMode ? handleClick(e) : item?.active ? handleClick(e) : () => {},
    onPointerMove: e => editMode ? handlePointerMove(e) : () => {}
  }));
};

const sizeMap = _ref => {
  let {
    stageWidth,
    stageHeight,
    width,
    height
  } = _ref;
  if (width < height) {
    if (stageWidth > stageHeight) {
      return {
        widthMap: width / 3,
        heightMap: width / 4
      };
    }
    if (stageWidth < stageHeight) {
      return {
        widthMap: width / 4,
        heightMap: width / 3
      };
    }
    return {
      widthMap: width / 4,
      heightMap: width / 4
    };
  } else {
    if (stageWidth > stageHeight) {
      return {
        widthMap: height / 3,
        heightMap: height / 4
      };
    }
    if (stageWidth < stageHeight) {
      return {
        widthMap: height / 4,
        heightMap: height / 3
      };
    }
    return {
      widthMap: height / 4,
      heightMap: height / 4
    };
  }
};

function IconArrow(_ref) {
  let {
    open
  } = _ref;
  return /*#__PURE__*/React.createElement("svg", {
    width: 24,
    height: 24,
    stroke: "currentColor"
  }, /*#__PURE__*/React.createElement("g", {
    transform: open ? "rotate(135, 12, 13)" : "rotate(-45, 12, 13)"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#000000",
    d: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z"
  })));
}

function MiniatureToggleButton(_ref) {
  let {
    setMiniatureOpen,
    miniatureOpen,
    position
  } = _ref;
  let style = {
    width: "24px",
    height: "24px",
    display: "block",
    position: "absolute",
    bottom: "6px",
    right: "6px",
    background: "rgba(19, 20, 22, 0.901961)",
    border: 0,
    padding: 0,
    outline: 0,
    color: "#fff",
    zIndex: 502
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    style: style,
    onClick: () => setMiniatureOpen(!miniatureOpen)
  }, /*#__PURE__*/React.createElement(IconArrow, {
    open: miniatureOpen,
    position: position
  }));
}

function findMaxFontSize(texts, containerWidth) {
  let maxFontSizes = [];
  const tempElement = document.createElement("div");
  tempElement.style.visibility = "hidden";
  tempElement.style.position = "absolute";
  document.body.appendChild(tempElement);
  function getTextWidth(text, fontSize) {
    tempElement.style.fontSize = `${fontSize}px`;
    tempElement.innerText = text;
    return tempElement.getBoundingClientRect().width;
  }
  for (const text of texts) {
    let lowerFontSize = 1;
    let upperFontSize = 1000;
    while (lowerFontSize < upperFontSize - 1) {
      const currentFontSize = (lowerFontSize + upperFontSize) / 2;
      const textWidth = getTextWidth(text, currentFontSize);
      if (textWidth > containerWidth) {
        upperFontSize = currentFontSize;
      } else {
        lowerFontSize = currentFontSize;
        maxFontSizes.push(currentFontSize);
      }
    }
  }
  document.body.removeChild(tempElement);
  return Math.min(...maxFontSizes);
}

const ZoomComponent = _ref => {
  let {
    allDataMeta,
    Viewer,
    // showFilter,
    toggleEditMode,
    mapSize,
    mapScale,
    setShowModal,
    saveToggle,
    mapScaleZeroPoint,
    setSaveToggle,
    setShowEditModal,
    width,
    height,
    panningDisabled,
    setPanningDisabled,
    setDisabledZoomComponent,
    disabledZoomComponent,
    setRotateActive
  } = _ref;
  const [objectsArray, setObjectsArray] = React$1.useState(allDataMeta?.objects);
  const {
    editItem
  } = useStore(store => store);
  const [mapWidth, setMapWidth] = React$1.useState(0);
  const [miniatureOpen, setMiniatureOpen] = React$1.useState(true);
  const [maxFontSizeCircle, setMaxFontSizeCircle] = React$1.useState(0);
  const [zoomComponentActive, setZoomComponentActive] = React$1.useState(false);
  const [mapHeight, setMapHeight] = React$1.useState(0);
  const handleKeyPress = event => {
    if (event.key === "+" || event.key === "=") {
      Viewer?.current?.zoomIn(0.06);
    } else if (event.key === "-") {
      Viewer?.current?.zoomOut(0.06);
    }
  };
  React$1.useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
  React$1.useMemo(() => {
    const {
      widthMap,
      heightMap
    } = sizeMap({
      width,
      height,
      stageWidth: +mapSize.width / 2,
      stageHeight: +mapSize.height / 2
    });
    setMapWidth(Math.floor(widthMap));
    setMapHeight(Math.floor(heightMap));
  }, [width, height, mapSize.width, mapSize.height]);
  React$1.useMemo(() => {
    setObjectsArray(allDataMeta?.objects);
    const objectsArrayActive = allDataMeta?.objects?.filter(item => item.status_name === "Размещен" && !item?.reservations?.length);
    const objectsArrayNames = objectsArrayActive?.map(item => item.name);
    const maxFontSize = findMaxFontSize(objectsArrayNames, 27);
    setMaxFontSizeCircle(maxFontSize);
  }, [allDataMeta?.objects]);
  const changeIndexObjectsArray = item => {
    const elementToBringToFront = objectsArray.filter(el => el?.id !== item?.id);
    elementToBringToFront.push(item);
    setObjectsArray(elementToBringToFront);
  };
  const objectsCollection = allDataMeta?.object_types;
  const image = `${apiMeta + allDataMeta?.maps[0]?.image_link}`;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MiniatureToggleButton, {
    miniatureOpen: miniatureOpen,
    setMiniatureOpen: setMiniatureOpen
  }), /*#__PURE__*/React.createElement(TransformWrapper, {
    wheel: {
      step: 0.06
    },
    smooth: false,
    panning: {
      velocityDisabled: true,
      disabled: panningDisabled
    },
    onPanningStart: () => setZoomComponentActive(true),
    onPanningStop: () => setZoomComponentActive(false),
    onWheelStart: () => setZoomComponentActive(true),
    onWheelStop: () => setZoomComponentActive(false),
    onZoomStart: () => setZoomComponentActive(true),
    onZoomStop: () => setZoomComponentActive(false),
    limitToBounds: false,
    doubleClick: {
      disabled: true
    },
    disablePadding: true,
    disabled: disabledZoomComponent,
    ref: Viewer,
    initialScale: +mapSize.width >= +mapSize.height ? width / +mapSize?.width : height / +mapSize.height,
    minScale: +mapSize.width >= +mapSize.height ? width / +mapSize?.width / 1.2 : height / +mapSize.height / 1.2,
    centerOnInit: true,
    maxScale: 1.9
  }, /*#__PURE__*/React.createElement(CustomMinimap, {
    background: "#fff",
    width: mapWidth,
    setMiniatureOpen: setMiniatureOpen,
    miniatureOpen: miniatureOpen,
    height: mapHeight,
    SVGWidth: +mapSize.width,
    SVGHeight: +mapSize.height,
    viewerWidth: width,
    viewerHeight: height
  }, /*#__PURE__*/React.createElement("svg", {
    width: +mapSize.width,
    height: +mapSize.height
  }, /*#__PURE__*/React.createElement("image", {
    width: +mapSize.width,
    height: +mapSize.height,
    href: image
  }))), /*#__PURE__*/React.createElement(TransformComponent, {
    wrapperStyle: {
      maxWidth: "100%",
      width: "100%",
      maxHeight: "100vh"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: +mapSize.width,
    height: +mapSize.height
  }, /*#__PURE__*/React.createElement("image", {
    width: +mapSize.width,
    height: +mapSize.height,
    href: image
  }), objectsArray?.map((item, i) => {
    const itemObject = objectsCollection?.find(el => el.id === item?.object_type_id);
    const imageUrl = `${apiMeta + itemObject?.image_link}`;
    const widthImage = itemObject?.size?.width / mapScale;
    const heightImage = itemObject?.size?.depth / mapScale;
    if (item?.status_name === "Размещен") {
      return /*#__PURE__*/React.createElement(DragSvg, {
        changeIndexObjectsArray: changeIndexObjectsArray,
        setShowEditModal: setShowEditModal,
        setShowModal: setShowModal,
        saveToggle: saveToggle,
        editMode: toggleEditMode,
        editItem: editItem,
        maxFontSizeCircle: maxFontSizeCircle,
        zoomComponentActive: zoomComponentActive,
        setPanningDisabled: setPanningDisabled,
        setDisabledZoomComponent: setDisabledZoomComponent,
        x: (+item.coordinate.x_coordinate + +mapScaleZeroPoint?.x_coordinate) / mapScale,
        y: (+item.coordinate.y_coordinate + +mapScaleZeroPoint?.y_coordinate) / mapScale,
        key: item.id,
        href: imageUrl,
        deltaX: +mapScaleZeroPoint?.x_coordinate,
        deltaY: +mapScaleZeroPoint?.y_coordinate,
        mapScale: mapScale,
        setRotateActive: setRotateActive,
        width: widthImage,
        height: heightImage,
        heightScreen: height,
        widthScreen: width,
        item: item,
        itemObject: itemObject,
        mapSize: mapSize,
        setSaveToggle: setSaveToggle
      });
    } else {
      return null;
    }
  })))));
};

function getWindowDimensions() {
    var width = window.innerWidth, height = window.innerHeight;
    return {
        width: width,
        height: height
    };
}
function useWindowDimensions() {
    var _a = React$1.useState(getWindowDimensions()), windowDimensions = _a[0], setWindowDimensions = _a[1];
    React$1.useEffect(function () {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    return windowDimensions;
}

const StageScene = _ref => {
  let {
    allDataJson
  } = _ref;
  const {
    width,
    height
  } = useWindowDimensions();
  const [showModal, setShowModal] = React$1.useState(false);
  const [showEditModal, setShowEditModal] = React$1.useState(false);
  const [panningDisabled, setPanningDisabled] = React$1.useState(false);
  const [rotateActive, setRotateActive] = React$1.useState(false);
  const [disabledZoomComponent, setDisabledZoomComponent] = React$1.useState(false);
  const [mouseDefaultPositionDown, setMouseDefaultPositionDown] = React$1.useState({
    x: 0,
    y: 0
  });
  const [toggleEditMode, setToggleEditMode] = React$1.useState(false);
  const [showFilter, setShowFilter] = React$1.useState(false);
  const [saveToggle, setSaveToggle] = React$1.useState(false);
  const {
    setAllDataMeta,
    setActiveEditItem,
    setSelectItem
  } = useStore(store => store);
  const allDataMeta = useStore(store => store.data.allDataMeta);
  const activeEditItem = useStore(store => store.data.activeEditItem);
  const selectItem = useStore(store => store.data.selectItem);
  const {
    isLoading: floorMainLoading
  } = useQuery(["floor_main"], () => getFloorMain(), {
    onSuccess: data => {
      if (!allDataJson) {
        setAllDataMeta(data.data);
      }
    }
  });
  const Viewer = React$1.useRef(null);
  if (floorMainLoading) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement(ColorRing, {
      visible: true,
      height: "80",
      width: "80",
      ariaLabel: "blocks-loading",
      wrapperStyle: {},
      wrapperClass: "blocks-wrapper"
    }));
  }
  const mapSizeMM = allDataMeta.maps[0].size;
  const mapSize = {
    width: +mapSizeMM?.width / 20,
    height: +mapSizeMM?.height / 20
  };
  const mapScale = +mapSizeMM?.width / +mapSize?.width;
  const mapScaleZeroPoint = allDataMeta.maps[0]?.zero_coordinate;
  const handleClick = e => {
    if (rotateActive) {
      setDisabledZoomComponent(false);
      setRotateActive(false);
    }
    if (Math.round(e.clientX) === Math.round(mouseDefaultPositionDown.x) && Math.round(e.clientY) === Math.round(mouseDefaultPositionDown.y)) {
      if (activeEditItem?.id) {
        setActiveEditItem(null);
      }
      if (selectItem?.id) {
        setSelectItem(null);
      }
    }
  };
  const handleMouseDown = e => {
    setMouseDefaultPositionDown({
      x: e?.clientX,
      y: e?.clientY
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "flex",
    onClick: e => handleClick(e),
    onMouseDown: e => handleMouseDown(e)
  }, toggleEditMode && width > 800 ? /*#__PURE__*/React.createElement(Filter, {
    showFilter: showFilter,
    zones: allDataMeta?.zones,
    categoies: allDataMeta?.object_categories,
    setShowFilter: setShowFilter,
    data: allDataMeta?.objects,
    viewer: Viewer,
    setShowEditModal: setShowEditModal
  }) : null, width > 800 ? /*#__PURE__*/React.createElement(Header, {
    setActiveEditItem: setActiveEditItem,
    setSelectItem: setSelectItem,
    saveToggle: saveToggle,
    toggleEditMode: toggleEditMode,
    setToggleEditMode: setToggleEditMode,
    setSaveToggle: setSaveToggle
  }) : null, showEditModal ? /*#__PURE__*/React.createElement(ModalAddOrEdit, {
    viewer: Viewer,
    allDataMeta: allDataMeta,
    setShowEditModal: setShowEditModal
  }) : null, showModal ? /*#__PURE__*/React.createElement(Modal, {
    setShowModal: setShowModal
  }) : null, /*#__PURE__*/React.createElement(ZoomComponent, {
    showFilter: showFilter,
    setRotateActive: setRotateActive,
    toggleEditMode: toggleEditMode,
    Viewer: Viewer,
    setPanningDisabled: setPanningDisabled,
    setDisabledZoomComponent: setDisabledZoomComponent,
    panningDisabled: panningDisabled,
    disabledZoomComponent: disabledZoomComponent,
    allDataMeta: allDataMeta,
    mapSize: mapSize,
    width: width,
    height: height,
    mapScale: mapScale,
    setShowEditModal: setShowEditModal,
    setShowModal: setShowModal,
    saveToggle: saveToggle,
    mapScaleZeroPoint: mapScaleZeroPoint,
    setSaveToggle: setSaveToggle
  }));
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/*\n! tailwindcss v3.3.5 | MIT License | https://tailwindcss.com\n*//*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box; /* 1 */\n  border-width: 0; /* 2 */\n  border-style: solid; /* 2 */\n  border-color: #e5e7eb; /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n5. Use the user's configured `sans` font-feature-settings by default.\n6. Use the user's configured `sans` font-variation-settings by default.\n*/\n\nhtml {\n  line-height: 1.5; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */ /* 3 */\n  tab-size: 4; /* 3 */\n  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; /* 4 */\n  font-feature-settings: normal; /* 5 */\n  font-variation-settings: normal; /* 6 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0; /* 1 */\n  line-height: inherit; /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0; /* 1 */\n  color: inherit; /* 2 */\n  border-top-width: 1px; /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0; /* 1 */\n  border-color: inherit; /* 2 */\n  border-collapse: collapse; /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-feature-settings: inherit; /* 1 */\n  font-variation-settings: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  font-weight: inherit; /* 1 */\n  line-height: inherit; /* 1 */\n  color: inherit; /* 1 */\n  margin: 0; /* 2 */\n  padding: 0; /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button; /* 1 */\n  background-color: transparent; /* 2 */\n  background-image: none; /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nReset default styling for dialogs.\n*/\ndialog {\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1; /* 1 */\n  color: #9ca3af; /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block; /* 1 */\n  vertical-align: middle; /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n/* Make elements with the HTML hidden attribute stay hidden by default */\n[hidden] {\n  display: none;\n}\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-gradient-from-position:  ;\n  --tw-gradient-via-position:  ;\n  --tw-gradient-to-position:  ;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n.visible {\n  visibility: visible;\n}\n.fixed {\n  position: fixed;\n}\n.absolute {\n  position: absolute;\n}\n.relative {\n  position: relative;\n}\n.inset-0 {\n  inset: 0px;\n}\n.left-0 {\n  left: 0px;\n}\n.left-80 {\n  left: 20rem;\n}\n.right-0 {\n  right: 0px;\n}\n.right-2 {\n  right: 0.5rem;\n}\n.right-2\\.5 {\n  right: 0.625rem;\n}\n.right-5 {\n  right: 1.25rem;\n}\n.top-0 {\n  top: 0px;\n}\n.top-1 {\n  top: 0.25rem;\n}\n.top-1\\/2 {\n  top: 50%;\n}\n.top-3 {\n  top: 0.75rem;\n}\n.top-4 {\n  top: 1rem;\n}\n.z-40 {\n  z-index: 40;\n}\n.z-50 {\n  z-index: 50;\n}\n.z-\\[100\\] {\n  z-index: 100;\n}\n.z-\\[500\\] {\n  z-index: 500;\n}\n.z-\\[55\\] {\n  z-index: 55;\n}\n.m-auto {\n  margin: auto;\n}\n.mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n.my-1 {\n  margin-top: 0.25rem;\n  margin-bottom: 0.25rem;\n}\n.my-4 {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n}\n.my-6 {\n  margin-top: 1.5rem;\n  margin-bottom: 1.5rem;\n}\n.-mb-px {\n  margin-bottom: -1px;\n}\n.mb-1 {\n  margin-bottom: 0.25rem;\n}\n.mb-4 {\n  margin-bottom: 1rem;\n}\n.ml-1 {\n  margin-left: 0.25rem;\n}\n.ml-4 {\n  margin-left: 1rem;\n}\n.ml-auto {\n  margin-left: auto;\n}\n.mr-1 {\n  margin-right: 0.25rem;\n}\n.mr-2 {\n  margin-right: 0.5rem;\n}\n.mr-2\\.5 {\n  margin-right: 0.625rem;\n}\n.mt-2 {\n  margin-top: 0.5rem;\n}\n.block {\n  display: block;\n}\n.inline-block {\n  display: inline-block;\n}\n.flex {\n  display: flex;\n}\n.inline-flex {\n  display: inline-flex;\n}\n.hidden {\n  display: none;\n}\n.h-12 {\n  height: 3rem;\n}\n.h-3 {\n  height: 0.75rem;\n}\n.h-8 {\n  height: 2rem;\n}\n.h-\\[calc\\(100\\%-1rem\\)\\] {\n  height: calc(100% - 1rem);\n}\n.h-screen {\n  height: 100vh;\n}\n.max-h-80 {\n  max-height: 20rem;\n}\n.max-h-full {\n  max-height: 100%;\n}\n.w-1\\/2 {\n  width: 50%;\n}\n.w-11\\/12 {\n  width: 91.666667%;\n}\n.w-12 {\n  width: 3rem;\n}\n.w-3 {\n  width: 0.75rem;\n}\n.w-48 {\n  width: 12rem;\n}\n.w-56 {\n  width: 14rem;\n}\n.w-6 {\n  width: 1.5rem;\n}\n.w-8 {\n  width: 2rem;\n}\n.w-80 {\n  width: 20rem;\n}\n.w-\\[290px\\] {\n  width: 290px;\n}\n.w-\\[305px\\] {\n  width: 305px;\n}\n.w-\\[680px\\] {\n  width: 680px;\n}\n.w-auto {\n  width: auto;\n}\n.w-fit {\n  width: -moz-fit-content;\n  width: fit-content;\n}\n.w-full {\n  width: 100%;\n}\n.max-w-3xl {\n  max-width: 48rem;\n}\n.flex-auto {\n  flex: 1 1 auto;\n}\n.shrink-0 {\n  flex-shrink: 0;\n}\n.grow {\n  flex-grow: 1;\n}\n.-translate-y-1\\/2 {\n  --tw-translate-y: -50%;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.rotate-180 {\n  --tw-rotate: 180deg;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n.cursor-pointer {\n  cursor: pointer;\n}\n.resize {\n  resize: both;\n}\n.flex-col {\n  flex-direction: column;\n}\n.flex-wrap {\n  flex-wrap: wrap;\n}\n.items-start {\n  align-items: flex-start;\n}\n.items-center {\n  align-items: center;\n}\n.justify-end {\n  justify-content: flex-end;\n}\n.justify-center {\n  justify-content: center;\n}\n.justify-between {\n  justify-content: space-between;\n}\n.space-y-6 > :not([hidden]) ~ :not([hidden]) {\n  --tw-space-y-reverse: 0;\n  margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));\n  margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));\n}\n.overflow-auto {\n  overflow: auto;\n}\n.overflow-hidden {\n  overflow: hidden;\n}\n.overflow-y-auto {\n  overflow-y: auto;\n}\n.overflow-x-hidden {\n  overflow-x: hidden;\n}\n.rounded {\n  border-radius: 0.25rem;\n}\n.rounded-full {\n  border-radius: 9999px;\n}\n.rounded-lg {\n  border-radius: 0.5rem;\n}\n.rounded-md {\n  border-radius: 0.375rem;\n}\n.rounded-b {\n  border-bottom-right-radius: 0.25rem;\n  border-bottom-left-radius: 0.25rem;\n}\n.rounded-t {\n  border-top-left-radius: 0.25rem;\n  border-top-right-radius: 0.25rem;\n}\n.rounded-t-lg {\n  border-top-left-radius: 0.5rem;\n  border-top-right-radius: 0.5rem;\n}\n.border {\n  border-width: 1px;\n}\n.border-0 {\n  border-width: 0px;\n}\n.border-b {\n  border-bottom-width: 1px;\n}\n.border-b-4 {\n  border-bottom-width: 4px;\n}\n.border-t {\n  border-top-width: 1px;\n}\n.border-solid {\n  border-style: solid;\n}\n.border-blueCustom {\n  --tw-border-opacity: 1;\n  border-color: rgb(31 136 212 / var(--tw-border-opacity));\n}\n.border-gray-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(229 231 235 / var(--tw-border-opacity));\n}\n.border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n.border-slate-200 {\n  --tw-border-opacity: 1;\n  border-color: rgb(226 232 240 / var(--tw-border-opacity));\n}\n.bg-\\[\\#000000\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity));\n}\n.bg-\\[\\#ffffff\\] {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.bg-black {\n  --tw-bg-opacity: 1;\n  background-color: rgb(0 0 0 / var(--tw-bg-opacity));\n}\n.bg-blueCustom {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 136 212 / var(--tw-bg-opacity));\n}\n.bg-emerald-500 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(16 185 129 / var(--tw-bg-opacity));\n}\n.bg-gray-300 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(209 213 219 / var(--tw-bg-opacity));\n}\n.bg-grayCustom {\n  --tw-bg-opacity: 1;\n  background-color: rgb(241 241 241 / var(--tw-bg-opacity));\n}\n.bg-transparent {\n  background-color: transparent;\n}\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n.p-1 {\n  padding: 0.25rem;\n}\n.p-2 {\n  padding: 0.5rem;\n}\n.p-2\\.5 {\n  padding: 0.625rem;\n}\n.p-4 {\n  padding: 1rem;\n}\n.p-5 {\n  padding: 1.25rem;\n}\n.p-6 {\n  padding: 1.5rem;\n}\n.px-1 {\n  padding-left: 0.25rem;\n  padding-right: 0.25rem;\n}\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n.px-3 {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem;\n}\n.px-4 {\n  padding-left: 1rem;\n  padding-right: 1rem;\n}\n.px-5 {\n  padding-left: 1.25rem;\n  padding-right: 1.25rem;\n}\n.px-6 {\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n}\n.py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n.py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n.py-2\\.5 {\n  padding-top: 0.625rem;\n  padding-bottom: 0.625rem;\n}\n.py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n.py-4 {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n.pb-1 {\n  padding-bottom: 0.25rem;\n}\n.pb-3 {\n  padding-bottom: 0.75rem;\n}\n.pb-4 {\n  padding-bottom: 1rem;\n}\n.pl-2 {\n  padding-left: 0.5rem;\n}\n.pr-2 {\n  padding-right: 0.5rem;\n}\n.pt-1 {\n  padding-top: 0.25rem;\n}\n.pt-3 {\n  padding-top: 0.75rem;\n}\n.pt-4 {\n  padding-top: 1rem;\n}\n.text-center {\n  text-align: center;\n}\n.text-3xl {\n  font-size: 1.875rem;\n  line-height: 2.25rem;\n}\n.text-base {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n.text-lg {\n  font-size: 1.125rem;\n  line-height: 1.75rem;\n}\n.text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n.text-xl {\n  font-size: 1.25rem;\n  line-height: 1.75rem;\n}\n.text-xs {\n  font-size: 0.75rem;\n  line-height: 1rem;\n}\n.font-bold {\n  font-weight: 700;\n}\n.font-light {\n  font-weight: 300;\n}\n.font-medium {\n  font-weight: 500;\n}\n.font-semibold {\n  font-weight: 600;\n}\n.uppercase {\n  text-transform: uppercase;\n}\n.leading-relaxed {\n  line-height: 1.625;\n}\n.text-\\[\\#000\\] {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity));\n}\n.text-\\[\\#fff\\] {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n.text-gray-400 {\n  --tw-text-opacity: 1;\n  color: rgb(156 163 175 / var(--tw-text-opacity));\n}\n.text-gray-500 {\n  --tw-text-opacity: 1;\n  color: rgb(107 114 128 / var(--tw-text-opacity));\n}\n.text-gray-900 {\n  --tw-text-opacity: 1;\n  color: rgb(17 24 39 / var(--tw-text-opacity));\n}\n.text-red-500 {\n  --tw-text-opacity: 1;\n  color: rgb(239 68 68 / var(--tw-text-opacity));\n}\n.text-red-600 {\n  --tw-text-opacity: 1;\n  color: rgb(220 38 38 / var(--tw-text-opacity));\n}\n.text-slate-500 {\n  --tw-text-opacity: 1;\n  color: rgb(100 116 139 / var(--tw-text-opacity));\n}\n.text-slate-800 {\n  --tw-text-opacity: 1;\n  color: rgb(30 41 59 / var(--tw-text-opacity));\n}\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n.opacity-25 {\n  opacity: 0.25;\n}\n.shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-buttonHeader {\n  --tw-shadow:  0px 2px 24px 0px rgba(0, 0, 0, 0.2), 0px 0px 2px 0px rgba(0, 0, 0, 0.09);;\n  --tw-shadow-colored: 0px 2px 24px 0px var(--tw-shadow-color), 0px 0px 2px 0px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.shadow-tooltip {\n  --tw-shadow:  0px 1px 4px 0px #00000040;\n  --tw-shadow-colored: 0px 1px 4px 0px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n.outline-none {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n.outline {\n  outline-style: solid;\n}\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n.transition {\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.transition-all {\n  transition-property: all;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n.duration-150 {\n  transition-duration: 150ms;\n}\n.duration-500 {\n  transition-duration: 500ms;\n}\n.ease-linear {\n  transition-timing-function: linear;\n}\n\nbody {\n  overflow: hidden;\n  margin: 0;\n  height: 100%;\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',\n    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',\n    sans-serif;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\ncode {\n  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',\n    monospace;\n}\n\nhtml {\n  height: 100%;\n}\n\n#root {\n  height: 100%;\n}\n\n.before\\:content-\\[\\'\\'\\]::before {\n  --tw-content: '';\n  content: var(--tw-content);\n}\n\n.hover\\:border-b-4:hover {\n  border-bottom-width: 4px;\n}\n\n.hover\\:border-gray-300:hover {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n\n.hover\\:bg-blue-800:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(30 64 175 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-gray-200:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(229 231 235 / var(--tw-bg-opacity));\n}\n\n.hover\\:bg-gray-300:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(209 213 219 / var(--tw-bg-opacity));\n}\n\n.hover\\:font-bold:hover {\n  font-weight: 700;\n}\n\n.hover\\:text-gray-900:hover {\n  --tw-text-opacity: 1;\n  color: rgb(17 24 39 / var(--tw-text-opacity));\n}\n\n.hover\\:shadow-lg:hover {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.focus\\:border-blue-500:focus {\n  --tw-border-opacity: 1;\n  border-color: rgb(59 130 246 / var(--tw-border-opacity));\n}\n\n.focus\\:outline-none:focus {\n  outline: 2px solid transparent;\n  outline-offset: 2px;\n}\n\n.focus\\:ring-4:focus {\n  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);\n  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(4px + var(--tw-ring-offset-width)) var(--tw-ring-color);\n  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);\n}\n\n.focus\\:ring-blue-300:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(147 197 253 / var(--tw-ring-opacity));\n}\n\n.focus\\:ring-blue-500:focus {\n  --tw-ring-opacity: 1;\n  --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));\n}\n\n.active\\:bg-emerald-600:active {\n  --tw-bg-opacity: 1;\n  background-color: rgb(5 150 105 / var(--tw-bg-opacity));\n}\n\n.peer:checked ~ .peer-checked\\:rounded {\n  border-radius: 0.25rem;\n}\n\n.peer:checked ~ .peer-checked\\:bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n.peer:checked ~ .peer-checked\\:px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n\n.peer:checked ~ .peer-checked\\:py-1 {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n}\n\n.peer:checked ~ .peer-checked\\:shadow-buttonHeader {\n  --tw-shadow:  0px 2px 24px 0px rgba(0, 0, 0, 0.2), 0px 0px 2px 0px rgba(0, 0, 0, 0.09);;\n  --tw-shadow-colored: 0px 2px 24px 0px var(--tw-shadow-color), 0px 0px 2px 0px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n@media (prefers-color-scheme: dark) {\n\n  .dark\\:border-gray-600 {\n    --tw-border-opacity: 1;\n    border-color: rgb(75 85 99 / var(--tw-border-opacity));\n  }\n\n  .dark\\:border-gray-700 {\n    --tw-border-opacity: 1;\n    border-color: rgb(55 65 81 / var(--tw-border-opacity));\n  }\n\n  .dark\\:bg-blue-600 {\n    --tw-bg-opacity: 1;\n    background-color: rgb(37 99 235 / var(--tw-bg-opacity));\n  }\n\n  .dark\\:bg-gray-700 {\n    --tw-bg-opacity: 1;\n    background-color: rgb(55 65 81 / var(--tw-bg-opacity));\n  }\n\n  .dark\\:text-gray-400 {\n    --tw-text-opacity: 1;\n    color: rgb(156 163 175 / var(--tw-text-opacity));\n  }\n\n  .dark\\:text-white {\n    --tw-text-opacity: 1;\n    color: rgb(255 255 255 / var(--tw-text-opacity));\n  }\n\n  .dark\\:placeholder-gray-400::placeholder {\n    --tw-placeholder-opacity: 1;\n    color: rgb(156 163 175 / var(--tw-placeholder-opacity));\n  }\n\n  .dark\\:hover\\:bg-blue-700:hover {\n    --tw-bg-opacity: 1;\n    background-color: rgb(29 78 216 / var(--tw-bg-opacity));\n  }\n\n  .dark\\:hover\\:bg-gray-600:hover {\n    --tw-bg-opacity: 1;\n    background-color: rgb(75 85 99 / var(--tw-bg-opacity));\n  }\n\n  .dark\\:hover\\:text-white:hover {\n    --tw-text-opacity: 1;\n    color: rgb(255 255 255 / var(--tw-text-opacity));\n  }\n\n  .dark\\:focus\\:border-blue-500:focus {\n    --tw-border-opacity: 1;\n    border-color: rgb(59 130 246 / var(--tw-border-opacity));\n  }\n\n  .dark\\:focus\\:ring-blue-500:focus {\n    --tw-ring-opacity: 1;\n    --tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity));\n  }\n\n  .dark\\:focus\\:ring-blue-800:focus {\n    --tw-ring-opacity: 1;\n    --tw-ring-color: rgb(30 64 175 / var(--tw-ring-opacity));\n  }\n}\n\n@media (min-width: 768px) {\n\n  .md\\:inset-0 {\n    inset: 0px;\n  }\n}";
styleInject(css_248z,{"insertAt":"top"});

var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
});
var App = function App(props) {
  return /*#__PURE__*/React.createElement(QueryClientProvider, {
    client: queryClient
  }, /*#__PURE__*/React.createElement(StageScene, {
    allDataJson: props.json
  }));
};

module.exports = App;
//# sourceMappingURL=index.js.map
