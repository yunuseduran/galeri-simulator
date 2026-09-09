"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports2) {
    "use strict";
    var l = Symbol.for("react.element");
    var n = Symbol.for("react.portal");
    var p = Symbol.for("react.fragment");
    var q = Symbol.for("react.strict_mode");
    var r = Symbol.for("react.profiler");
    var t = Symbol.for("react.provider");
    var u = Symbol.for("react.context");
    var v = Symbol.for("react.forward_ref");
    var w = Symbol.for("react.suspense");
    var x = Symbol.for("react.memo");
    var y = Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h = null;
      if (null != b) for (d in void 0 !== b.ref && (h = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h = false;
      if (null === a) h = true;
      else switch (k) {
        case "string":
        case "number":
          h = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h = true;
          }
      }
      if (h) return h = a, c = c(h), a = "" === d ? "." + Q(h, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h && h.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports2.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports2.Component = E;
    exports2.Fragment = p;
    exports2.Profiler = r;
    exports2.PureComponent = G;
    exports2.StrictMode = q;
    exports2.Suspense = w;
    exports2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports2.act = X;
    exports2.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h };
    };
    exports2.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports2.createElement = M;
    exports2.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports2.createRef = function() {
      return { current: null };
    };
    exports2.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports2.isValidElement = O;
    exports2.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    exports2.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports2.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports2.unstable_act = X;
    exports2.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports2.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports2.useDebugValue = function() {
    };
    exports2.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports2.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports2.useId = function() {
      return U.current.useId();
    };
    exports2.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports2.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports2.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports2.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports2.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports2.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports2.useState = function(a) {
      return U.current.useState(a);
    };
    exports2.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports2.useTransition = function() {
      return U.current.useTransition();
    };
    exports2.version = "18.3.1";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext2(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext2(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer2(reducer2, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer2, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect2(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module2 && module2[requireString];
              enqueueTaskImpl = nodeRequire.call(module2, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports2.Children = Children;
        exports2.Component = Component;
        exports2.Fragment = REACT_FRAGMENT_TYPE;
        exports2.Profiler = REACT_PROFILER_TYPE;
        exports2.PureComponent = PureComponent;
        exports2.StrictMode = REACT_STRICT_MODE_TYPE;
        exports2.Suspense = REACT_SUSPENSE_TYPE;
        exports2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports2.act = act;
        exports2.cloneElement = cloneElement$1;
        exports2.createContext = createContext2;
        exports2.createElement = createElement$1;
        exports2.createFactory = createFactory;
        exports2.createRef = createRef;
        exports2.forwardRef = forwardRef;
        exports2.isValidElement = isValidElement;
        exports2.lazy = lazy;
        exports2.memo = memo;
        exports2.startTransition = startTransition;
        exports2.unstable_act = act;
        exports2.useCallback = useCallback;
        exports2.useContext = useContext2;
        exports2.useDebugValue = useDebugValue;
        exports2.useDeferredValue = useDeferredValue;
        exports2.useEffect = useEffect2;
        exports2.useId = useId;
        exports2.useImperativeHandle = useImperativeHandle;
        exports2.useInsertionEffect = useInsertionEffect;
        exports2.useLayoutEffect = useLayoutEffect;
        exports2.useMemo = useMemo;
        exports2.useReducer = useReducer2;
        exports2.useRef = useRef;
        exports2.useState = useState;
        exports2.useSyncExternalStore = useSyncExternalStore;
        exports2.useTransition = useTransition;
        exports2.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_production_min();
    } else {
      module2.exports = require_react_development();
    }
  }
});

// node_modules/react/cjs/react-jsx-runtime.production.min.js
var require_react_jsx_runtime_production_min = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports2) {
    "use strict";
    var f = require_react();
    var k = Symbol.for("react.element");
    var l = Symbol.for("react.fragment");
    var m = Object.prototype.hasOwnProperty;
    var n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
    var p = { key: true, ref: true, __self: true, __source: true };
    function q(c, a, g) {
      var b, d = {}, e = null, h = null;
      void 0 !== g && (e = "" + g);
      void 0 !== a.key && (e = "" + a.key);
      void 0 !== a.ref && (h = a.ref);
      for (b in a) m.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
      if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
      return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
    }
    exports2.Fragment = l;
    exports2.jsx = q;
    exports2.jsxs = q;
  }
});

// node_modules/react/cjs/react-jsx-runtime.development.js
var require_react_jsx_runtime_development = __commonJS({
  "node_modules/react/cjs/react-jsx-runtime.development.js"(exports2) {
    "use strict";
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        var React2 = require_react();
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactSharedInternals = React2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var assign = Object.assign;
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher.current;
            ReactCurrentDispatcher.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component) {
          var prototype = Component.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown;
        var specialPropRefWarningShown;
        var didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function warnIfStringRefCannotBeAutoConverted(config, self) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        function defineKeyPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingKey = function() {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingKey.isReactWarning = true;
            Object.defineProperty(props, "key", {
              get: warnAboutAccessingKey,
              configurable: true
            });
          }
        }
        function defineRefPropWarningGetter(props, displayName) {
          {
            var warnAboutAccessingRef = function() {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            };
            warnAboutAccessingRef.isReactWarning = true;
            Object.defineProperty(props, "ref", {
              get: warnAboutAccessingRef,
              configurable: true
            });
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function jsxDEV(type, config, maybeKey, source, self) {
          {
            var propName;
            var props = {};
            var key = null;
            var ref = null;
            if (maybeKey !== void 0) {
              {
                checkKeyStringCoercion(maybeKey);
              }
              key = "" + maybeKey;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            if (hasValidRef(config)) {
              ref = config.ref;
              warnIfStringRefCannotBeAutoConverted(config, self);
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
            if (type && type.defaultProps) {
              var defaultProps = type.defaultProps;
              for (propName in defaultProps) {
                if (props[propName] === void 0) {
                  props[propName] = defaultProps[propName];
                }
              }
            }
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
            return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
          }
        }
        var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function isValidElement(object) {
          {
            return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
          }
        }
        function getDeclarationErrorAddendum() {
          {
            if (ReactCurrentOwner$1.current) {
              var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);
              if (name) {
                return "\n\nCheck the render method of `" + name + "`.";
              }
            }
            return "";
          }
        }
        function getSourceInfoErrorAddendum(source) {
          {
            if (source !== void 0) {
              var fileName = source.fileName.replace(/^.*[\\\/]/, "");
              var lineNumber = source.lineNumber;
              return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
            }
            return "";
          }
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          {
            var info = getDeclarationErrorAddendum();
            if (!info) {
              var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
              if (parentName) {
                info = "\n\nCheck the top-level render call using <" + parentName + ">.";
              }
            }
            return info;
          }
        }
        function validateExplicitKey(element, parentType) {
          {
            if (!element._store || element._store.validated || element.key != null) {
              return;
            }
            element._store.validated = true;
            var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
            if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
              return;
            }
            ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
            var childOwner = "";
            if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
              childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
            }
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          {
            if (typeof node !== "object") {
              return;
            }
            if (isArray(node)) {
              for (var i = 0; i < node.length; i++) {
                var child = node[i];
                if (isValidElement(child)) {
                  validateExplicitKey(child, parentType);
                }
              }
            } else if (isValidElement(node)) {
              if (node._store) {
                node._store.validated = true;
              }
            } else if (node) {
              var iteratorFn = getIteratorFn(node);
              if (typeof iteratorFn === "function") {
                if (iteratorFn !== node.entries) {
                  var iterator = iteratorFn.call(node);
                  var step;
                  while (!(step = iterator.next()).done) {
                    if (isValidElement(step.value)) {
                      validateExplicitKey(step.value, parentType);
                    }
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        var didWarnAboutKeySpread = {};
        function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
          {
            var validType = isValidElementType(type);
            if (!validType) {
              var info = "";
              if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
                info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
              }
              var sourceInfo = getSourceInfoErrorAddendum(source);
              if (sourceInfo) {
                info += sourceInfo;
              } else {
                info += getDeclarationErrorAddendum();
              }
              var typeString;
              if (type === null) {
                typeString = "null";
              } else if (isArray(type)) {
                typeString = "array";
              } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
                typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
                info = " Did you accidentally export a JSX literal instead of a component?";
              } else {
                typeString = typeof type;
              }
              error("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
            var element = jsxDEV(type, props, key, source, self);
            if (element == null) {
              return element;
            }
            if (validType) {
              var children = props.children;
              if (children !== void 0) {
                if (isStaticChildren) {
                  if (isArray(children)) {
                    for (var i = 0; i < children.length; i++) {
                      validateChildKeys(children[i], type);
                    }
                    if (Object.freeze) {
                      Object.freeze(children);
                    }
                  } else {
                    error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
                  }
                } else {
                  validateChildKeys(children, type);
                }
              }
            }
            {
              if (hasOwnProperty.call(props, "key")) {
                var componentName = getComponentNameFromType(type);
                var keys = Object.keys(props).filter(function(k) {
                  return k !== "key";
                });
                var beforeExample = keys.length > 0 ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
                if (!didWarnAboutKeySpread[componentName + beforeExample]) {
                  var afterExample = keys.length > 0 ? "{" + keys.join(": ..., ") + ": ...}" : "{}";
                  error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);
                  didWarnAboutKeySpread[componentName + beforeExample] = true;
                }
              }
            }
            if (type === REACT_FRAGMENT_TYPE) {
              validateFragmentProps(element);
            } else {
              validatePropTypes(element);
            }
            return element;
          }
        }
        function jsxWithValidationStatic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, true);
          }
        }
        function jsxWithValidationDynamic(type, props, key) {
          {
            return jsxWithValidation(type, props, key, false);
          }
        }
        var jsx2 = jsxWithValidationDynamic;
        var jsxs = jsxWithValidationStatic;
        exports2.Fragment = REACT_FRAGMENT_TYPE;
        exports2.jsx = jsx2;
        exports2.jsxs = jsxs;
      })();
    }
  }
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS({
  "node_modules/react/jsx-runtime.js"(exports2, module2) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module2.exports = require_react_jsx_runtime_production_min();
    } else {
      module2.exports = require_react_jsx_runtime_development();
    }
  }
});

// src/game/state.tsx
var import_react = __toESM(require_react(), 1);

// src/types.ts
var PART_LABELS = {
  motor: "Motor",
  sanziman: "\u015Eanz\u0131man",
  fren: "Frenler",
  suspansiyon: "S\xFCspansiyon",
  lastik: "Lastikler",
  aku: "Ak\xFC",
  klima: "Klima"
};
var PART_KEYS = [
  "motor",
  "sanziman",
  "fren",
  "suspansiyon",
  "lastik",
  "aku",
  "klima"
];
var SEGMENT_LABELS = {
  ekonomi: "Ekonomi",
  orta: "Orta S\u0131n\u0131f",
  ust: "\xDCst S\u0131n\u0131f",
  suv: "SUV",
  ticari: "Ticari",
  klasik: "Klasik"
};
var STAFF_DEFS = {
  usta: {
    label: "Usta (Tamirci)",
    emoji: "\u{1F468}\u200D\u{1F527}",
    weeklySalary: 3e4,
    desc: "At\xF6lye i\u015Fleri %15 daha ucuz ve 1 g\xFCn daha h\u0131zl\u0131 biter (en az 1 g\xFCn)."
  },
  danisman: {
    label: "Sat\u0131\u015F Dan\u0131\u015Fman\u0131",
    emoji: "\u{1F468}\u200D\u{1F4BC}",
    weeklySalary: 25e3,
    desc: "Galeriye daha fazla m\xFC\u015Fteri gelir ve m\xFC\u015Fteriler biraz daha c\xF6mert pazarl\u0131k eder."
  },
  detayci: {
    label: "Detayc\u0131 (Temizlik\xE7i)",
    emoji: "\u{1F9FD}",
    weeklySalary: 15e3,
    desc: "Vitrindeki ara\xE7lar tozlanmaz; temizlikleri her g\xFCn biraz artar."
  }
};

// src/data/cities.ts
var CITIES = [
  { plate: 1, name: "Adana", lat: 37, lon: 35.32 },
  { plate: 2, name: "Ad\u0131yaman", lat: 37.76, lon: 38.28 },
  { plate: 3, name: "Afyonkarahisar", lat: 38.76, lon: 30.54 },
  { plate: 4, name: "A\u011Fr\u0131", lat: 39.72, lon: 43.05 },
  { plate: 5, name: "Amasya", lat: 40.65, lon: 35.83 },
  { plate: 6, name: "Ankara", lat: 39.93, lon: 32.86 },
  { plate: 7, name: "Antalya", lat: 36.89, lon: 30.71 },
  { plate: 8, name: "Artvin", lat: 41.18, lon: 41.82 },
  { plate: 9, name: "Ayd\u0131n", lat: 37.85, lon: 27.85 },
  { plate: 10, name: "Bal\u0131kesir", lat: 39.65, lon: 27.89 },
  { plate: 11, name: "Bilecik", lat: 40.15, lon: 29.98 },
  { plate: 12, name: "Bing\xF6l", lat: 38.88, lon: 40.5 },
  { plate: 13, name: "Bitlis", lat: 38.4, lon: 42.11 },
  { plate: 14, name: "Bolu", lat: 40.74, lon: 31.61 },
  { plate: 15, name: "Burdur", lat: 37.72, lon: 30.29 },
  { plate: 16, name: "Bursa", lat: 40.18, lon: 29.07 },
  { plate: 17, name: "\xC7anakkale", lat: 40.15, lon: 26.41 },
  { plate: 18, name: "\xC7ank\u0131r\u0131", lat: 40.6, lon: 33.62 },
  { plate: 19, name: "\xC7orum", lat: 40.55, lon: 34.95 },
  { plate: 20, name: "Denizli", lat: 37.78, lon: 29.09 },
  { plate: 21, name: "Diyarbak\u0131r", lat: 37.91, lon: 40.24 },
  { plate: 22, name: "Edirne", lat: 41.68, lon: 26.56 },
  { plate: 23, name: "Elaz\u0131\u011F", lat: 38.68, lon: 39.22 },
  { plate: 24, name: "Erzincan", lat: 39.75, lon: 39.49 },
  { plate: 25, name: "Erzurum", lat: 39.9, lon: 41.27 },
  { plate: 26, name: "Eski\u015Fehir", lat: 39.78, lon: 30.52 },
  { plate: 27, name: "Gaziantep", lat: 37.07, lon: 37.38 },
  { plate: 28, name: "Giresun", lat: 40.91, lon: 38.39 },
  { plate: 29, name: "G\xFCm\xFC\u015Fhane", lat: 40.46, lon: 39.48 },
  { plate: 30, name: "Hakkari", lat: 37.58, lon: 43.74 },
  { plate: 31, name: "Hatay", lat: 36.2, lon: 36.16 },
  { plate: 32, name: "Isparta", lat: 37.77, lon: 30.55 },
  { plate: 33, name: "Mersin", lat: 36.81, lon: 34.64 },
  { plate: 34, name: "\u0130stanbul", lat: 41.01, lon: 28.98 },
  { plate: 35, name: "\u0130zmir", lat: 38.42, lon: 27.13 },
  { plate: 36, name: "Kars", lat: 40.6, lon: 43.1 },
  { plate: 37, name: "Kastamonu", lat: 41.38, lon: 33.78 },
  { plate: 38, name: "Kayseri", lat: 38.73, lon: 35.49 },
  { plate: 39, name: "K\u0131rklareli", lat: 41.74, lon: 27.23 },
  { plate: 40, name: "K\u0131r\u015Fehir", lat: 39.15, lon: 34.16 },
  { plate: 41, name: "Kocaeli", lat: 40.85, lon: 29.88 },
  { plate: 42, name: "Konya", lat: 37.87, lon: 32.48 },
  { plate: 43, name: "K\xFCtahya", lat: 39.42, lon: 29.98 },
  { plate: 44, name: "Malatya", lat: 38.35, lon: 38.31 },
  { plate: 45, name: "Manisa", lat: 38.61, lon: 27.43 },
  { plate: 46, name: "Kahramanmara\u015F", lat: 37.58, lon: 36.94 },
  { plate: 47, name: "Mardin", lat: 37.31, lon: 40.74 },
  { plate: 48, name: "Mu\u011Fla", lat: 37.22, lon: 28.36 },
  { plate: 49, name: "Mu\u015F", lat: 38.73, lon: 41.49 },
  { plate: 50, name: "Nev\u015Fehir", lat: 38.62, lon: 34.71 },
  { plate: 51, name: "Ni\u011Fde", lat: 37.97, lon: 34.68 },
  { plate: 52, name: "Ordu", lat: 40.98, lon: 37.88 },
  { plate: 53, name: "Rize", lat: 41.02, lon: 40.52 },
  { plate: 54, name: "Sakarya", lat: 40.77, lon: 30.4 },
  { plate: 55, name: "Samsun", lat: 41.29, lon: 36.33 },
  { plate: 56, name: "Siirt", lat: 37.93, lon: 41.94 },
  { plate: 57, name: "Sinop", lat: 42.03, lon: 35.15 },
  { plate: 58, name: "Sivas", lat: 39.75, lon: 37.02 },
  { plate: 59, name: "Tekirda\u011F", lat: 40.98, lon: 27.51 },
  { plate: 60, name: "Tokat", lat: 40.31, lon: 36.55 },
  { plate: 61, name: "Trabzon", lat: 41, lon: 39.72 },
  { plate: 62, name: "Tunceli", lat: 39.11, lon: 39.55 },
  { plate: 63, name: "\u015Eanl\u0131urfa", lat: 37.16, lon: 38.79 },
  { plate: 64, name: "U\u015Fak", lat: 38.68, lon: 29.41 },
  { plate: 65, name: "Van", lat: 38.49, lon: 43.38 },
  { plate: 66, name: "Yozgat", lat: 39.82, lon: 34.81 },
  { plate: 67, name: "Zonguldak", lat: 41.45, lon: 31.79 },
  { plate: 68, name: "Aksaray", lat: 38.37, lon: 34.03 },
  { plate: 69, name: "Bayburt", lat: 40.26, lon: 40.22 },
  { plate: 70, name: "Karaman", lat: 37.18, lon: 33.22 },
  { plate: 71, name: "K\u0131r\u0131kkale", lat: 39.85, lon: 33.51 },
  { plate: 72, name: "Batman", lat: 37.88, lon: 41.13 },
  { plate: 73, name: "\u015E\u0131rnak", lat: 37.52, lon: 42.46 },
  { plate: 74, name: "Bart\u0131n", lat: 41.64, lon: 32.34 },
  { plate: 75, name: "Ardahan", lat: 41.11, lon: 42.7 },
  { plate: 76, name: "I\u011Fd\u0131r", lat: 39.92, lon: 44.05 },
  { plate: 77, name: "Yalova", lat: 40.65, lon: 29.27 },
  { plate: 78, name: "Karab\xFCk", lat: 41.2, lon: 32.62 },
  { plate: 79, name: "Kilis", lat: 36.72, lon: 37.12 },
  { plate: 80, name: "Osmaniye", lat: 37.07, lon: 36.25 },
  { plate: 81, name: "D\xFCzce", lat: 40.84, lon: 31.16 }
];
function cityByPlate(plate) {
  const c = CITIES.find((c2) => c2.plate === plate);
  if (!c) throw new Error("Bilinmeyen plaka: " + plate);
  return c;
}
function roadDistance(a, b) {
  if (a === b) return 0;
  const ca = cityByPlate(a);
  const cb = cityByPlate(b);
  const R = 6371;
  const dLat = (cb.lat - ca.lat) * Math.PI / 180;
  const dLon = (cb.lon - ca.lon) * Math.PI / 180;
  const la = ca.lat * Math.PI / 180;
  const lb = cb.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLon / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));
  return Math.round(straight * 1.32);
}

// src/data/cars.ts
var MODELS = [
  // Ekonomi
  { brand: "Tofa\u015F", model: "\u015Eahin 1.6", segment: "klasik", basePrice: 42e4, minYear: 1990, maxYear: 2002, fuels: ["benzin", "lpg"], weight: 5 },
  { brand: "Tofa\u015F", model: "Do\u011Fan SLX", segment: "klasik", basePrice: 48e4, minYear: 1990, maxYear: 2001, fuels: ["benzin", "lpg"], weight: 4 },
  { brand: "Renault", model: "Toros", segment: "klasik", basePrice: 39e4, minYear: 1991, maxYear: 2e3, fuels: ["benzin", "lpg"], weight: 4 },
  { brand: "Fiat", model: "Egea 1.4 Fire", segment: "ekonomi", basePrice: 115e4, minYear: 2016, maxYear: 2026, fuels: ["benzin", "lpg", "dizel"], weight: 10 },
  { brand: "Renault", model: "Clio 1.0 TCe", segment: "ekonomi", basePrice: 125e4, minYear: 2013, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 9 },
  { brand: "Renault", model: "Symbol 1.5 dCi", segment: "ekonomi", basePrice: 85e4, minYear: 2009, maxYear: 2021, fuels: ["dizel", "benzin"], weight: 7 },
  { brand: "Hyundai", model: "i20 1.4 MPI", segment: "ekonomi", basePrice: 12e5, minYear: 2012, maxYear: 2026, fuels: ["benzin"], weight: 7 },
  { brand: "Opel", model: "Corsa 1.2", segment: "ekonomi", basePrice: 118e4, minYear: 2010, maxYear: 2026, fuels: ["benzin"], weight: 6 },
  { brand: "Dacia", model: "Sandero Stepway", segment: "ekonomi", basePrice: 11e5, minYear: 2013, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 6 },
  { brand: "Peugeot", model: "208 1.2 PureTech", segment: "ekonomi", basePrice: 135e4, minYear: 2013, maxYear: 2026, fuels: ["benzin"], weight: 5 },
  // Orta
  { brand: "Toyota", model: "Corolla 1.6", segment: "orta", basePrice: 175e4, minYear: 2005, maxYear: 2026, fuels: ["benzin", "lpg", "hibrit"], weight: 9 },
  { brand: "Honda", model: "Civic 1.6 Eco", segment: "orta", basePrice: 185e4, minYear: 2006, maxYear: 2026, fuels: ["benzin", "lpg"], weight: 8 },
  { brand: "Renault", model: "Megane 1.3 TCe", segment: "orta", basePrice: 155e4, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 8 },
  { brand: "Volkswagen", model: "Golf 1.4 TSI", segment: "orta", basePrice: 19e5, minYear: 2008, maxYear: 2026, fuels: ["benzin"], weight: 7 },
  { brand: "Ford", model: "Focus 1.5 Ti-VCT", segment: "orta", basePrice: 15e5, minYear: 2008, maxYear: 2025, fuels: ["benzin", "dizel"], weight: 7 },
  { brand: "Opel", model: "Astra 1.4 Turbo", segment: "orta", basePrice: 145e4, minYear: 2008, maxYear: 2025, fuels: ["benzin"], weight: 6 },
  { brand: "Skoda", model: "Octavia 1.5 TSI", segment: "orta", basePrice: 18e5, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 6 },
  { brand: "Fiat", model: "Egea Cross 1.5 Hybrid", segment: "orta", basePrice: 15e5, minYear: 2021, maxYear: 2026, fuels: ["hibrit"], weight: 5 },
  { brand: "Togg", model: "T10X V2", segment: "suv", basePrice: 23e5, minYear: 2023, maxYear: 2026, fuels: ["elektrik"], weight: 4 },
  // Üst
  { brand: "Volkswagen", model: "Passat 1.5 TSI", segment: "ust", basePrice: 26e5, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 6 },
  { brand: "BMW", model: "3.20i", segment: "ust", basePrice: 34e5, minYear: 2005, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  { brand: "Mercedes-Benz", model: "C200 AMG", segment: "ust", basePrice: 37e5, minYear: 2008, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  { brand: "Audi", model: "A4 40 TFSI", segment: "ust", basePrice: 35e5, minYear: 2008, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 4 },
  { brand: "Volvo", model: "S60 T4", segment: "ust", basePrice: 29e5, minYear: 2012, maxYear: 2026, fuels: ["benzin"], weight: 3 },
  { brand: "Skoda", model: "Superb 1.5 TSI", segment: "ust", basePrice: 25e5, minYear: 2012, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 4 },
  // SUV
  { brand: "Nissan", model: "Qashqai 1.3 DIG-T", segment: "suv", basePrice: 195e4, minYear: 2010, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 7 },
  { brand: "Dacia", model: "Duster 1.3 TCe", segment: "suv", basePrice: 145e4, minYear: 2012, maxYear: 2026, fuels: ["benzin", "dizel", "lpg"], weight: 7 },
  { brand: "Hyundai", model: "Tucson 1.6 T-GDI", segment: "suv", basePrice: 24e5, minYear: 2015, maxYear: 2026, fuels: ["benzin", "hibrit"], weight: 5 },
  { brand: "Kia", model: "Sportage 1.6 CRDi", segment: "suv", basePrice: 23e5, minYear: 2014, maxYear: 2026, fuels: ["dizel", "benzin"], weight: 5 },
  { brand: "Peugeot", model: "3008 1.2 PureTech", segment: "suv", basePrice: 235e4, minYear: 2016, maxYear: 2026, fuels: ["benzin", "dizel"], weight: 5 },
  // Ticari
  { brand: "Fiat", model: "Doblo 1.6 Multijet", segment: "ticari", basePrice: 115e4, minYear: 2008, maxYear: 2025, fuels: ["dizel"], weight: 6 },
  { brand: "Ford", model: "Transit Custom", segment: "ticari", basePrice: 19e5, minYear: 2013, maxYear: 2026, fuels: ["dizel"], weight: 4 },
  { brand: "Volkswagen", model: "Transporter 2.0 TDI", segment: "ticari", basePrice: 22e5, minYear: 2010, maxYear: 2026, fuels: ["dizel"], weight: 4 },
  { brand: "Renault", model: "Kangoo Multix", segment: "ticari", basePrice: 95e4, minYear: 2008, maxYear: 2021, fuels: ["dizel"], weight: 4 }
];
var COLORS = [
  "Beyaz",
  "Siyah",
  "Gri",
  "G\xFCm\xFC\u015F",
  "K\u0131rm\u0131z\u0131",
  "Lacivert",
  "Mavi",
  "Bordo",
  "Ye\u015Fil",
  "Kahverengi"
];

// src/data/names.ts
var FIRST_NAMES = [
  "Ahmet",
  "Mehmet",
  "Mustafa",
  "Ali",
  "H\xFCseyin",
  "Hasan",
  "\u0130brahim",
  "Osman",
  "Yusuf",
  "Murat",
  "\xD6mer",
  "Ramazan",
  "Halil",
  "S\xFCleyman",
  "Abdullah",
  "Emre",
  "Burak",
  "Serkan",
  "Volkan",
  "Tolga",
  "Kemal",
  "Cemal",
  "Selim",
  "Erkan",
  "Fatma",
  "Ay\u015Fe",
  "Emine",
  "Hatice",
  "Zeynep",
  "Elif",
  "Meryem",
  "\u015Eerife",
  "Sultan",
  "Hanife",
  "Merve",
  "Esra",
  "B\xFC\u015Fra",
  "Seda",
  "Gamze",
  "Derya",
  "Tuncay",
  "\u015E\xFCkr\xFC",
  "Necati",
  "Cevdet",
  "Bahattin",
  "Nurettin",
  "Sad\u0131k",
  "Veli"
];
var LAST_NAMES = [
  "Y\u0131lmaz",
  "Kaya",
  "Demir",
  "\u015Eahin",
  "\xC7elik",
  "Y\u0131ld\u0131z",
  "Y\u0131ld\u0131r\u0131m",
  "\xD6zt\xFCrk",
  "Ayd\u0131n",
  "\xD6zdemir",
  "Arslan",
  "Do\u011Fan",
  "K\u0131l\u0131\xE7",
  "Aslan",
  "\xC7etin",
  "Kara",
  "Ko\xE7",
  "Kurt",
  "\xD6zkan",
  "\u015Eim\u015Fek",
  "Polat",
  "Korkmaz",
  "\xC7ak\u0131r",
  "Erdo\u011Fan",
  "G\xFCne\u015F",
  "Ak\u0131n",
  "Ate\u015F",
  "Bulut",
  "Turan",
  "Avc\u0131",
  "Sar\u0131",
  "G\xFCler",
  "Ta\u015F",
  "Aksoy",
  "Bal",
  "Keskin",
  "Tekin",
  "Karaca",
  "S\xF6nmez",
  "U\xE7ar"
];
var CUSTOMER_EMOJIS = ["\u{1F9D4}", "\u{1F468}", "\u{1F469}", "\u{1F474}", "\u{1F475}", "\u{1F9D1}", "\u{1F468}\u200D\u{1F9B0}", "\u{1F469}\u200D\u{1F9B1}", "\u{1F9D3}", "\u{1F468}\u200D\u{1F9B3}"];
var GALLERY_SUFFIXES = ["Otomotiv", "Oto Galeri", "Motors", "Auto", "Oto Pazar\u0131"];

// src/game/rng.ts
function rand(min, max) {
  return min + Math.random() * (max - min);
}
function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickWeighted(arr, weightFn) {
  const total = arr.reduce((s, t) => s + weightFn(t), 0);
  let r = Math.random() * total;
  for (const t of arr) {
    r -= weightFn(t);
    if (r <= 0) return t;
  }
  return arr[arr.length - 1];
}
function chance(p) {
  return Math.random() < p;
}
var idCounter = 0;
function uid(prefix) {
  idCounter++;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}
function roundMoney(n, step = 1e3) {
  return Math.round(n / step) * step;
}

// src/game/faults.ts
var FAULT_TEMPLATES = [
  { part: "motor", label: "Motor ya\u011F yak\u0131yor", costPct: [3, 6], valuePct: [5, 9], drivable: true, driveHint: "Egzozdan mavi duman geliyor, ya\u011F kokusu var..." },
  { part: "motor", label: "Motor tekliyor (ate\u015Fleme sorunu)", costPct: [1, 3], valuePct: [3, 6], drivable: true, driveHint: "Motor ara ara tekliyor, \xE7eki\u015Ften d\xFC\u015F\xFCyor!" },
  { part: "motor", label: "Hararet sorunu (termostat/radyat\xF6r)", costPct: [1.5, 3], valuePct: [3, 6], drivable: true, driveHint: "Hararet g\xF6stergesi y\xFCkseliyor!" },
  { part: "motor", label: "Triger seti \xF6mr\xFCn\xFC doldurmu\u015F", costPct: [1, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Motordan t\u0131k\u0131rt\u0131 sesi geliyor..." },
  { part: "sanziman", label: "\u015Eanz\u0131man vites atlat\u0131yor", costPct: [3, 7], valuePct: [5, 10], drivable: true, driveHint: "Vites ge\xE7i\u015Flerinde sert vuruntu hissediliyor!" },
  { part: "sanziman", label: "Debriyaj balatas\u0131 bitmi\u015F", costPct: [1.5, 3], valuePct: [2, 5], drivable: true, driveHint: "Debriyaj kavram\u0131yor, devir y\xFCkseliyor ama h\u0131z artm\u0131yor..." },
  { part: "fren", label: "Fren balata ve diskleri bitik", costPct: [0.8, 1.8], valuePct: [1.5, 3], drivable: true, driveHint: "Frenler \xE7ok zay\u0131f, ge\xE7 yava\u015Fl\u0131yor!" },
  { part: "fren", label: "ABS ar\u0131zas\u0131", costPct: [1, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Sert frende tekerlek kilitleniyor, ABS devreye girmiyor!" },
  { part: "suspansiyon", label: "Amortis\xF6rler patlak", costPct: [1.2, 2.5], valuePct: [2, 4], drivable: true, driveHint: "Ara\xE7 yat\u0131yor, virajda sallan\u0131yor..." },
  { part: "suspansiyon", label: "Rot-balans bozuk, ara\xE7 \xE7ekiyor", costPct: [0.4, 1], valuePct: [1, 2.5], drivable: true, driveHint: "Direksiyon bir tarafa \xE7ekiyor!" },
  { part: "lastik", label: "Lastikler \xF6mr\xFCn\xFC doldurmu\u015F", costPct: [0.8, 1.5], valuePct: [1, 2], drivable: true, driveHint: "Lastikler kay\u0131yor, yol tutu\u015F \xE7ok k\xF6t\xFC..." },
  { part: "aku", label: "Ak\xFC zay\u0131f, mar\u015F g\xFC\xE7 al\u0131yor", costPct: [0.3, 0.6], valuePct: [0.5, 1], drivable: true, driveHint: "Mar\u015F zor bast\u0131, ak\xFC zay\u0131f g\xF6r\xFCn\xFCyor..." },
  { part: "klima", label: "Klima so\u011Futmuyor (kompres\xF6r)", costPct: [0.8, 2], valuePct: [1, 2.5], drivable: true, driveHint: "Klimay\u0131 a\xE7t\u0131n\u0131z ama s\u0131cak hava \xFCfl\xFCyor..." }
];
function makeFault(basePrice, part) {
  const candidates = part ? FAULT_TEMPLATES.filter((f) => f.part === part) : FAULT_TEMPLATES;
  const t = candidates[Math.floor(Math.random() * candidates.length)];
  const cost = roundMoney(basePrice * rand(t.costPct[0], t.costPct[1]) / 100, 500);
  const valueHit = roundMoney(basePrice * rand(t.valuePct[0], t.valuePct[1]) / 100, 500);
  return {
    id: uid("flt"),
    part: t.part,
    label: t.label,
    repairCost: Math.max(2e3, cost),
    valueHit: Math.max(2500, valueHit),
    drivable: t.drivable,
    driveHint: t.driveHint
  };
}

// src/game/valuation.ts
var CURRENT_YEAR = 2026;
var PART_WEIGHTS = {
  motor: 0.32,
  sanziman: 0.2,
  fren: 0.12,
  suspansiyon: 0.12,
  lastik: 0.08,
  aku: 0.06,
  klima: 0.1
};
function expectedKm(year) {
  return Math.max(5e3, (CURRENT_YEAR - year) * 17e3);
}
function carValue(car, modifiers = [], day = 0) {
  let v = car.basePrice;
  const age = CURRENT_YEAR - car.year;
  v *= Math.max(0.12, Math.pow(0.925, age));
  const exp = expectedKm(car.year);
  const kmRatio = car.km / exp;
  if (kmRatio > 1) v *= Math.max(0.72, 1 - (kmRatio - 1) * 0.18);
  else v *= Math.min(1.12, 1 + (1 - kmRatio) * 0.1);
  let cond = 0;
  for (const k of PART_KEYS) cond += car.parts[k] * PART_WEIGHTS[k];
  v *= 0.65 + cond / 100 * 0.39;
  v *= 1 - car.paintedPanels * 0.012 - car.changedPanels * 0.03;
  if (car.tramer > 0) {
    const ratio = Math.min(0.5, car.tramer / Math.max(1, v));
    v *= 1 - ratio * 0.45;
  }
  for (const f of [...car.hiddenFaults, ...car.knownFaults]) v -= f.valueHit;
  if (car.cosmetics.seatCover) v += Math.min(25e3, v * 0.015);
  if (car.cosmetics.rims) v += Math.min(35e3, v * 0.02);
  if (car.cosmetics.multimedia) v += Math.min(2e4, v * 0.012);
  if (car.cosmetics.tint) v += Math.min(8e3, v * 5e-3);
  if (car.cosmetics.ceramic) v += Math.min(3e4, v * 0.018);
  v *= 0.96 + car.cleanliness / 100 * 0.06;
  for (const m of modifiers) {
    if (m.segment === car.segment && m.untilDay >= day) v *= m.factor;
  }
  return Math.max(3e4, Math.round(v / 1e3) * 1e3);
}
function perceivedValue(car, modifiers = [], day = 0) {
  const noHidden = { ...car, hiddenFaults: [] };
  return carValue(noHidden, modifiers, day);
}

// src/game/carFactory.ts
function randomPersonName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
function generateCar() {
  const def = pickWeighted(MODELS, (m) => m.weight);
  const year = randInt(def.minYear, Math.min(def.maxYear, 2026));
  const exp = expectedKm(year);
  const km2 = Math.max(1e3, Math.min(465e3, Math.round(exp * rand(0.5, 1.7))));
  const wearBase = rand(45, 98);
  const parts = {};
  for (const k of PART_KEYS) {
    parts[k] = Math.round(Math.min(100, Math.max(15, wearBase + rand(-18, 12))));
  }
  const paintedPanels = chance(0.55) ? randInt(1, 5) : 0;
  const changedPanels = chance(0.25) ? randInt(1, 3) : 0;
  const tramer = paintedPanels + changedPanels > 0 && chance(0.7) ? roundMoney(def.basePrice * rand(5e-3, 0.06), 500) : 0;
  const car = {
    id: uid("car"),
    brand: def.brand,
    model: def.model,
    segment: def.segment,
    year,
    km: km2,
    color: pick(COLORS),
    fuel: pick(def.fuels),
    gear: def.segment === "klasik" ? "manuel" : chance(0.5) ? "otomatik" : "manuel",
    basePrice: def.basePrice,
    parts,
    paintedPanels,
    changedPanels,
    tramer,
    hiddenFaults: [],
    knownFaults: [],
    cosmetics: {
      seatCover: false,
      rims: chance(0.15),
      multimedia: chance(0.2),
      tint: chance(0.25),
      ceramic: false
    },
    cleanliness: randInt(35, 90)
  };
  const faultChance = wearBase < 60 ? 0.75 : wearBase < 75 ? 0.45 : 0.2;
  if (chance(faultChance)) {
    car.hiddenFaults.push(makeFault(def.basePrice));
    if (chance(0.35)) car.hiddenFaults.push(makeFault(def.basePrice));
  }
  car.hiddenFaults = car.hiddenFaults.filter(
    (f, i, arr) => arr.findIndex((g) => g.label === f.label) === i
  );
  return car;
}
function generateListing(day, preferCity) {
  const car = generateCar();
  const value = carValue(car);
  const sellerType = chance(0.7) ? "sahibinden" : "galeriden";
  const mood = chance(0.2) ? "acil" : chance(0.65) ? "normal" : "sabirli";
  const perceived = carValue({ ...car, hiddenFaults: [] });
  let askMult;
  if (mood === "acil") askMult = rand(0.82, 0.95);
  else if (mood === "sabirli") askMult = rand(1.05, 1.25);
  else askMult = rand(0.95, 1.12);
  if (sellerType === "galeriden") askMult += 0.05;
  const askingPrice = roundMoney(perceived * askMult, 5e3);
  const minMult = mood === "acil" ? rand(0.85, 0.92) : mood === "sabirli" ? rand(0.93, 0.97) : rand(0.88, 0.95);
  const minPrice = roundMoney(askingPrice * minMult, 1e3);
  const sellerName = sellerType === "galeriden" ? `${pick(LAST_NAMES)} ${pick(GALLERY_SUFFIXES)}` : randomPersonName();
  return {
    id: uid("lst"),
    car,
    cityPlate: preferCity ?? pick(CITIES).plate,
    sellerName,
    sellerType,
    sellerMood: mood,
    askingPrice,
    minPrice,
    honest: chance(0.75),
    expiresDay: day + randInt(2, 6),
    expertised: false,
    testDriven: false,
    negotiationDead: false
  };
}

// src/game/facilities.ts
var FACILITY_DEFS = [
  {
    key: "showroom",
    name: "Vitrin (Showroom)",
    emoji: "\u{1F3E2}",
    desc: "Galerinin kalbi. Seviyesi artt\u0131k\xE7a daha fazla arac\u0131 vitrine dizebilirsiniz.",
    levels: [
      { cost: 0, income: 0, effect: "4 ara\xE7 kapasitesi" },
      { cost: 3e5, income: 0, effect: "6 ara\xE7 kapasitesi" },
      { cost: 6e5, income: 0, effect: "8 ara\xE7 kapasitesi" },
      { cost: 12e5, income: 0, effect: "12 ara\xE7 kapasitesi" }
    ]
  },
  {
    key: "atolye",
    name: "Tamirhane",
    emoji: "\u{1F527}",
    desc: "Kendi tamirhaneniz. Yoksa i\u015Fler d\u0131\u015F sanayiye %30 zaml\u0131 yapt\u0131r\u0131l\u0131r!",
    levels: [
      { cost: 15e4, income: 0, effect: "Normal fiyatla tamir (d\u0131\u015F sanayi zamm\u0131 kalkar)" },
      { cost: 4e5, income: 0, effect: "T\xFCm at\xF6lye i\u015Fleri %10 indirimli" },
      { cost: 9e5, income: 0, effect: "%20 indirim + i\u015Fler 1 g\xFCn daha h\u0131zl\u0131" }
    ]
  },
  {
    key: "yikama",
    name: "Oto Y\u0131kama",
    emoji: "\u{1F9FD}",
    desc: "D\u0131\u015Far\u0131dan m\xFC\u015Fteri al\u0131r, sizin ara\xE7lar\u0131 da her g\xFCn parlat\u0131r.",
    levels: [
      { cost: 2e5, income: 4e3, effect: "G\xFCnl\xFCk gelir + ara\xE7lara her g\xFCn +4 temizlik" },
      { cost: 45e4, income: 9e3, effect: "Gelir artar + her g\xFCn +8 temizlik" },
      { cost: 9e5, income: 15e3, effect: "Gelir artar + her g\xFCn +12 temizlik" }
    ]
  },
  {
    key: "parca",
    name: "Yedek Par\xE7a D\xFCkkan\u0131",
    emoji: "\u{1F6DE}",
    desc: "Par\xE7a sat\u0131\u015F\u0131ndan gelir; kendi tamirlerinize de par\xE7a maliyeti indirimi.",
    levels: [
      { cost: 25e4, income: 6e3, effect: "G\xFCnl\xFCk gelir + tamirlerde %5 indirim" },
      { cost: 55e4, income: 13e3, effect: "Gelir artar + %10 indirim" },
      { cost: 11e5, income: 22e3, effect: "Gelir artar + %15 indirim" }
    ]
  },
  {
    key: "kafeterya",
    name: "Kafeterya",
    emoji: "\u2615",
    desc: "\xC7ay ikram edilen m\xFC\u015Fteri masadan kalkamaz: daha c\xF6mert pazarl\u0131k eder.",
    levels: [
      { cost: 12e4, income: 2e3, effect: "M\xFC\u015Fteriler %1,5 daha c\xF6mert" },
      { cost: 3e5, income: 5e3, effect: "%3 c\xF6mertlik + m\xFC\u015Fteri sabr\u0131 +1 tur" }
    ]
  },
  {
    key: "pompa",
    name: "Akaryak\u0131t Pompas\u0131",
    emoji: "\u26FD",
    desc: "Yoldan ge\xE7en yak\u0131t al\u0131r; kendi seyahatleriniz de ucuzlar.",
    levels: [
      { cost: 6e5, income: 12e3, effect: "G\xFCnl\xFCk gelir + yol masraf\u0131 %5 iner" },
      { cost: 12e5, income: 25e3, effect: "Gelir artar + yol masraf\u0131 %10 iner" },
      { cost: 2e6, income: 4e4, effect: "Gelir artar + yol masraf\u0131 %15 iner" }
    ]
  },
  {
    key: "otopark",
    name: "Ek Otopark",
    emoji: "\u{1F17F}\uFE0F",
    desc: "Arka parseldeki park alan\u0131: her seviye +1 ara\xE7l\u0131k yer a\xE7ar.",
    levels: [
      { cost: 1e5, income: 0, effect: "+1 ara\xE7 kapasitesi" },
      { cost: 25e4, income: 0, effect: "+1 ara\xE7 kapasitesi (toplam +2)" },
      { cost: 5e5, income: 0, effect: "+1 ara\xE7 kapasitesi (toplam +3)" }
    ]
  }
];
function facilityDef(key) {
  const d = FACILITY_DEFS.find((f) => f.key === key);
  if (!d) throw new Error("Bilinmeyen tesis: " + key);
  return d;
}
function facilityLevel(s, key) {
  return s.facilities?.[key] ?? 0;
}
function totalSlots(s) {
  const showroomSlots = [0, 4, 6, 8, 12][facilityLevel(s, "showroom")] ?? 4;
  return showroomSlots + facilityLevel(s, "otopark");
}
function dailyFacilityIncome(s) {
  let total = 0;
  for (const def of FACILITY_DEFS) {
    const lvl = facilityLevel(s, def.key);
    if (lvl > 0) total += def.levels[lvl - 1].income;
  }
  return total;
}
function travelCostMultiplier(s) {
  return 1 - 0.05 * facilityLevel(s, "pompa");
}
function cafeGenerosityBonus(s) {
  return 0.015 * facilityLevel(s, "kafeterya");
}
function cafePatienceBonus(s) {
  return facilityLevel(s, "kafeterya") >= 2 ? 1 : 0;
}
function washDailyCleanBonus(s) {
  return facilityLevel(s, "yikama") * 4;
}

// src/game/customers.ts
function generateCustomer(state, owned) {
  const styles = ["normal", "normal", "siki", "siki", "acele", "titiz"];
  const style = pick(styles);
  const pv = perceivedValue(owned.car, state.marketModifiers, state.day);
  const repBonus = (state.reputation - 50) / 100;
  const hasDanisman = state.staff.some((st) => st.role === "danisman");
  let maxMult;
  switch (style) {
    case "acele":
      maxMult = rand(1, 1.12);
      break;
    case "siki":
      maxMult = rand(0.82, 0.95);
      break;
    case "titiz":
      maxMult = rand(0.92, 1.05);
      break;
    default:
      maxMult = rand(0.9, 1.03);
  }
  maxMult += repBonus * 0.1;
  if (hasDanisman) maxMult += 0.04;
  if (state.level >= 8) maxMult += 0.03;
  maxMult += cafeGenerosityBonus(state);
  const maxPay = roundMoney(pv * maxMult, 1e3);
  const openingOffer = roundMoney(maxPay * rand(0.78, 0.9), 1e3);
  return {
    id: uid("cus"),
    name: randomPersonName(),
    emoji: pick(CUSTOMER_EMOJIS),
    carId: owned.car.id,
    style,
    maxPay,
    patience: (style === "acele" ? 3 : style === "siki" ? 5 : 4) + cafePatienceBonus(state),
    openingOffer,
    leavesDay: state.day + (style === "acele" ? 1 : randInt(1, 3)),
    lastOffer: null,
    gone: false
  };
}
function dailyCustomers(state) {
  const sellable = state.inventory.filter(
    (o) => !o.inTransitUntilDay || o.inTransitUntilDay <= state.day
  );
  if (sellable.length === 0) return [];
  const diffMult = state.difficulty === "kolay" ? 1.3 : state.difficulty === "zor" ? 0.7 : 1;
  const repMult = 0.7 + state.reputation / 80;
  const staffMult = state.staff.some((st) => st.role === "danisman") ? 1.4 : 1;
  const fameMult = state.level >= 12 ? 1.25 : 1;
  const base = Math.min(4, sellable.length) * 0.8 * diffMult * repMult * staffMult * fameMult;
  const out = [];
  let n = Math.floor(base);
  if (chance(base - n)) n++;
  n = Math.min(5, n);
  for (let i = 0; i < n; i++) {
    out.push(generateCustomer(state, pick(sellable)));
  }
  return out;
}

// src/game/events.ts
function applyDailyEvents(s) {
  const log2 = (e) => s.log.unshift({ day: s.day, ...e });
  if (chance(0.18) && s.marketModifiers.length < 2) {
    const segments = ["ekonomi", "orta", "ust", "suv", "ticari", "klasik"];
    const seg = pick(segments);
    const up = chance(0.5);
    const factor = up ? rand(1.06, 1.15) : rand(0.86, 0.94);
    const days = randInt(2, 4);
    const mod = {
      segment: seg,
      factor: Math.round(factor * 100) / 100,
      untilDay: s.day + days,
      label: up ? `${SEGMENT_LABELS[seg]} segmentine talep artt\u0131 (%${Math.round((factor - 1) * 100)} de\u011Fer art\u0131\u015F\u0131, ${days} g\xFCn)` : `${SEGMENT_LABELS[seg]} segmentinde durgunluk (%${Math.round((1 - factor) * 100)} de\u011Fer kayb\u0131, ${days} g\xFCn)`
    };
    s.marketModifiers.push(mod);
    log2({ text: `\u{1F4C8} Piyasa: ${mod.label}`, kind: "olay" });
  }
  const inGarage = s.inventory.filter(
    (o) => !o.inTransitUntilDay || o.inTransitUntilDay <= s.day
  );
  if (inGarage.length > 0 && chance(0.22)) {
    const o = pick(inGarage);
    const car = o.car;
    if (car.hiddenFaults.length > 0 && chance(0.6)) {
      const f = car.hiddenFaults[0];
      car.hiddenFaults = car.hiddenFaults.slice(1);
      car.knownFaults = [...car.knownFaults, f];
      log2({
        text: `\u{1F527} ${car.brand} ${car.model} ar\u0131za verdi: ${f.label}. (Tamir: ~${f.repairCost.toLocaleString("tr-TR")} \u20BA)`,
        kind: "uyari"
      });
    } else if (chance(0.5)) {
      const f = makeFault(car.basePrice);
      if (!car.knownFaults.some((k) => k.label === f.label)) {
        car.knownFaults = [...car.knownFaults, f];
        const part = pick(PART_KEYS);
        car.parts[part] = Math.max(10, car.parts[part] - randInt(10, 25));
        log2({
          text: `\u26A0\uFE0F ${car.brand} ${car.model} bozuldu: ${f.label}. M\xFC\u015Fteriye b\xF6yle satmak zor olur.`,
          kind: "uyari"
        });
      }
    }
  }
  const hasDetayci = s.staff.some((st) => st.role === "detayci");
  const washBonus = washDailyCleanBonus(s);
  for (const o of s.inventory) {
    let delta = hasDetayci ? 5 : -randInt(1, 4);
    delta += washBonus;
    o.car.cleanliness = Math.max(10, Math.min(100, o.car.cleanliness + delta));
  }
  if (chance(0.08)) {
    const small = [
      "Kom\u015Fu galerici \xE7ay i\xE7meye geldi, piyasa dedikodusu yapt\u0131n\u0131z.",
      "Belediye yolu kaz\u0131yor, galerinin \xF6n\xFC toz i\xE7inde kald\u0131.",
      "Yerel gazete galerinizden 'g\xFCvenilir esnaf' diye bahsetti.",
      "Mahallenin \xE7ocuklar\u0131 vitrindeki arabalar\u0131n foto\u011Fraf\u0131n\u0131 \xE7ekti."
    ];
    log2({ text: `\u2615 ${pick(small)}`, kind: "info" });
  }
  if (chance(0.05) && s.reputation < 95) {
    s.reputation = Math.min(100, s.reputation + 2);
    log2({ text: "\u{1F31F} Memnun bir m\xFC\u015Fteriniz sizi arkada\u015Flar\u0131na \xF6nerdi. \u0130tibar +2", kind: "olay" });
  }
  s.marketModifiers = s.marketModifiers.filter((m) => m.untilDay >= s.day);
}
function weeklyExpense(s) {
  const base = s.difficulty === "kolay" ? 25e3 : s.difficulty === "zor" ? 6e4 : 4e4;
  const taxPerk = s.level >= 20 ? 0.85 : 1;
  return roundMoney((base + s.gallerySlots * 5e3) * taxPerk);
}

// src/game/bank.ts
var MAX_ACTIVE_LOANS = 2;
function makeLoan(offer) {
  const totalDebt = roundMoney(offer.principal * (1 + offer.interestPct / 100));
  return {
    id: uid("loan"),
    name: offer.name,
    principal: offer.principal,
    totalDebt,
    remaining: totalDebt,
    dailyPayment: roundMoney(totalDebt / offer.termDays, 100),
    takenDay: 0
    // reducer doldurur
  };
}
function canTakeLoan(state, offer) {
  if (state.loans.length >= MAX_ACTIVE_LOANS) return "En fazla 2 aktif krediniz olabilir.";
  if (state.reputation < offer.minReputation)
    return `Banka bu kredi i\xE7in en az ${offer.minReputation} itibar istiyor.`;
  if (state.loans.some((l) => l.name === offer.name)) return "Bu krediden zaten aktif bir tane var.";
  return null;
}

// src/game/auction.ts
var AUCTION_PERIOD = 5;
function generateAuction(day) {
  const count = randInt(3, 5);
  const cars = [];
  const startPrices = [];
  for (let i = 0; i < count; i++) {
    const car = generateCar();
    car.cleanliness = Math.max(15, car.cleanliness - 20);
    cars.push(car);
    startPrices.push(roundMoney(perceivedValue(car) * rand(0.45, 0.58), 5e3));
  }
  return {
    day,
    cityPlate: pick(CITIES).plate,
    cars,
    startPrices,
    resolved: []
  };
}

// src/game/rivals.ts
var RIVAL_NAMES = [
  { name: "\u015Eahin Oto", emoji: "\u{1F985}" },
  { name: "Kartal Motors", emoji: "\u{1F699}" },
  { name: "Anadolu Otomotiv", emoji: "\u{1F402}" },
  { name: "Y\u0131ld\u0131z Garaj", emoji: "\u2B50" },
  { name: "Bo\u011Fazi\xE7i Auto", emoji: "\u{1F309}" },
  { name: "Toros Oto Pazar\u0131", emoji: "\u{1F3D4}\uFE0F" },
  { name: "H\u0131zl\u0131 Hasan Galeri", emoji: "\u26A1" },
  { name: "Pa\u015Fa Otomotiv", emoji: "\u{1F3A9}" }
];
function generateRivals(homeCity) {
  return RIVAL_NAMES.map((r) => {
    let city = pick(CITIES).plate;
    if (city === homeCity) city = city === 34 ? 6 : 34;
    return {
      id: uid("rvl"),
      name: r.name,
      emoji: r.emoji,
      cityPlate: city,
      skill: Math.round(rand(0.6, 1.5) * 100) / 100,
      wealth: roundMoney(rand(-3e4, 35e4), 1e3),
      carsSold: randInt(1, 25),
      reputation: randInt(30, 85),
      lastDelta: 0
    };
  });
}
function updateRivals(s) {
  const logs = [];
  for (const r of s.rivals) {
    const p = 0.35 + r.skill * 0.25;
    let sales = 0;
    if (chance(p)) sales++;
    if (chance(p * 0.4)) sales++;
    let delta = 0;
    for (let i = 0; i < sales; i++) {
      if (chance(0.12)) {
        delta -= roundMoney(rand(5e3, 45e3), 1e3);
      } else {
        delta += roundMoney(rand(8e3, 95e3) * r.skill, 1e3);
      }
    }
    if (sales === 0) delta -= roundMoney(rand(2e3, 8e3), 500);
    r.wealth += delta;
    r.carsSold += sales;
    r.lastDelta = delta;
    r.reputation = Math.max(20, Math.min(95, r.reputation + randInt(-1, 1)));
    if (delta > 16e4) {
      logs.push(`\u{1F3C1} ${r.emoji} ${r.name} bug\xFCn rekor bir sat\u0131\u015Fa imza att\u0131! Piyasa konu\u015Fuyor...`);
    }
  }
  if (chance(0.05) && s.rivals.length > 0) {
    const r = pick(s.rivals);
    const hit = roundMoney(rand(3e4, 12e4), 1e3);
    r.wealth -= hit;
    r.lastDelta -= hit;
    logs.push(`\u{1F4C9} ${r.emoji} ${r.name} ar\u0131zal\u0131 ara\xE7 satt\u0131\u011F\u0131 i\xE7in m\xFC\u015Fterisine tazminat \xF6dedi!`);
  }
  return logs;
}
function playerRank(s) {
  return 1 + s.rivals.filter((r) => r.wealth > s.stats.totalProfit).length;
}

// src/game/career.ts
function xpNeeded(level) {
  return Math.round(500 * Math.pow(level, 1.35) / 50) * 50;
}
var TITLE_STEPS = [
  [20, "Galeri \u0130mparatoru"],
  [18, "Otomotiv Patronu"],
  [16, "Ulusal Marka"],
  [14, "B\xF6lge Devi"],
  [12, "\u0130l Me\u015Fhuru"],
  [10, "Oto Baronu"],
  [9, "Piyasa Bilirki\u015Fisi"],
  [8, "Usta Galerici"],
  [7, "Pazarl\u0131k Kurdu"],
  [6, "G\xFCvenilir Sat\u0131c\u0131"],
  [5, "Sanayi Esnaf\u0131"],
  [4, "Pazarl\u0131k\xE7\u0131"],
  [3, "Mahalle Esnaf\u0131"],
  [2, "Acemi Galerici"],
  [1, "\xC7aylak"]
];
function titleFor(level) {
  if (level > 20) return `Otomotiv Efsanesi ${level - 20}`;
  const t = TITLE_STEPS.find(([min]) => level >= min);
  return t ? t[1] : "\xC7aylak";
}
function levelReward(level) {
  return roundMoney(2e4 + level * 15e3, 1e3);
}
var PERKS = [
  { level: 3, emoji: "\u{1F50D}", label: "Ekspertiz anla\u015Fmas\u0131: ekspertiz \xFCcreti 4.000 \u2192 3.000 \u20BA" },
  { level: 5, emoji: "\u26FD", label: "Yak\u0131t kart\u0131: yol masraflar\u0131 %15 indirimli" },
  { level: 8, emoji: "\u{1F5E3}\uFE0F", label: "\u0130kna kabiliyeti: m\xFC\u015Fteriler %3 daha c\xF6mert \xF6der" },
  { level: 10, emoji: "\u{1F527}", label: "Sanayi dostu: at\xF6lye i\u015Fleri %10 indirimli" },
  { level: 12, emoji: "\u{1F31F}", label: "\xDCnl\xFC galeri: her g\xFCn daha fazla m\xFC\u015Fteri u\u011Frar" },
  { level: 15, emoji: "\u{1F528}", label: "Mezat locas\u0131: mezat ara\xE7lar\u0131n\u0131n nakliyesi yar\u0131 fiyat" },
  { level: 20, emoji: "\u{1F9FE}", label: "Vergi avukat\u0131: haftal\u0131k giderler %15 d\xFC\u015Fer" }
];
function addXp(s, amount) {
  s.xp += Math.max(0, Math.round(amount));
  while (s.xp >= xpNeeded(s.level)) {
    s.xp -= xpNeeded(s.level);
    s.level += 1;
    const bonus = levelReward(s.level);
    s.money += bonus;
    s.reputation = Math.min(100, s.reputation + 1);
    s.log.unshift({
      day: s.day,
      text: `\u2B06\uFE0F SEV\u0130YE ATLADINIZ! Seviye ${s.level} \u2014 "${titleFor(s.level)}". \xD6d\xFCl: ${bonus.toLocaleString("tr-TR")} \u20BA + itibar`,
      amount: bonus,
      kind: "olay"
    });
    const perk = PERKS.find((p) => p.level === s.level);
    if (perk) {
      s.log.unshift({
        day: s.day,
        text: `\u{1F513} Yeni ayr\u0131cal\u0131k a\xE7\u0131ld\u0131: ${perk.emoji} ${perk.label}`,
        kind: "olay"
      });
    }
  }
}
var ACHIEVEMENTS = [
  { id: "satis", emoji: "\u{1F91D}", name: "Sat\u0131\u015F Ustas\u0131", unit: "sat\u0131\u015F", thresholds: [1, 5, 15, 40, 100], metric: (s) => s.stats.carsSold },
  { id: "alim", emoji: "\u{1F6D2}", name: "Koleksiyoncu", unit: "al\u0131m", thresholds: [1, 5, 15, 40, 100], metric: (s) => s.stats.carsBought },
  { id: "kar", emoji: "\u{1F4B0}", name: "K\xE2r Makinesi", unit: "\u20BA k\xE2r", thresholds: [1e5, 5e5, 2e6, 5e6, 15e6], metric: (s) => Math.max(0, s.stats.totalProfit) },
  { id: "gezgin", emoji: "\u{1F5FA}\uFE0F", name: "Anadolu Gezgini", unit: "il", thresholds: [3, 10, 25, 50, 81], finite: true, metric: (s) => s.stats.citiesVisited.length },
  { id: "mezat", emoji: "\u{1F528}", name: "Mezat Kurdu", unit: "mezat", thresholds: [1, 3, 10, 25, 60], metric: (s) => s.stats.auctionsWon },
  { id: "tamir", emoji: "\u{1F527}", name: "Usta Eller", unit: "i\u015F", thresholds: [5, 15, 40, 100, 250], metric: (s) => s.stats.repairsDone },
  { id: "yol", emoji: "\u{1F6E3}\uFE0F", name: "Yol Canavar\u0131", unit: "km", thresholds: [1e3, 5e3, 2e4, 5e4, 12e4], metric: (s) => s.stats.kmTraveled },
  { id: "tesis", emoji: "\u{1F3D7}\uFE0F", name: "Tesis Kral\u0131", unit: "seviye", thresholds: [2, 5, 9, 14, 19], finite: true, metric: (s) => Object.values(s.facilities ?? {}).reduce((a, b) => a + b, 0) }
];
function thresholdFor(def, tier) {
  if (tier < def.thresholds.length) return def.thresholds[tier];
  if (def.finite) return null;
  const last = def.thresholds[def.thresholds.length - 1];
  return Math.round(last * Math.pow(2.2, tier - def.thresholds.length + 1));
}
function tierReward(tier) {
  return {
    money: roundMoney(2e4 * Math.pow(tier + 1, 1.5), 1e3),
    xp: 100 * (tier + 1)
  };
}
function checkMilestones(s) {
  for (const def of ACHIEVEMENTS) {
    let tier = s.achievements[def.id] ?? 0;
    let threshold = thresholdFor(def, tier);
    const value = def.metric(s);
    while (threshold !== null && value >= threshold) {
      const reward = tierReward(tier);
      s.money += reward.money;
      s.log.unshift({
        day: s.day,
        text: `\u{1F396}\uFE0F BA\u015EARIM: ${def.emoji} ${def.name} ${romanTier(tier + 1)} (${threshold.toLocaleString("tr-TR")} ${def.unit}) \u2014 \xD6d\xFCl: ${reward.money.toLocaleString("tr-TR")} \u20BA + ${reward.xp} XP`,
        amount: reward.money,
        kind: "olay"
      });
      addXp(s, reward.xp);
      tier += 1;
      s.achievements[def.id] = tier;
      threshold = thresholdFor(def, tier);
    }
  }
}
function romanTier(n) {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
  return n <= 10 ? romans[n - 1] : `${n}`;
}

// src/game/state.tsx
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var PART_KEYS_FOR_DAMAGE = ["fren", "suspansiyon", "lastik", "motor"];
var SAVE_VERSION = 1;
var TRAVEL_COST_PER_KM = 9;
var TRANSPORT_COST_PER_KM = 14;
var EXPERTISE_COST = 4e3;
var MAX_LISTINGS = 42;
function travelCostFor(km2, level, facilityMult = 1) {
  const base = km2 * TRAVEL_COST_PER_KM * (level >= 5 ? 0.85 : 1) * facilityMult;
  return Math.round(base / 100) * 100;
}
function expertiseCostFor(level) {
  return level >= 3 ? 3e3 : EXPERTISE_COST;
}
function auctionTransportFor(km2, level) {
  const base = km2 * TRANSPORT_COST_PER_KM * (level >= 15 ? 0.5 : 1);
  return Math.round(base / 100) * 100;
}
function freshListings(day, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(generateListing(day));
  return out;
}
function newGameState(playerName, galleryName, homeCity, difficulty) {
  const money = difficulty === "kolay" ? 25e5 : difficulty === "zor" ? 9e5 : 15e5;
  const base = {
    version: SAVE_VERSION,
    started: true,
    playerName,
    galleryName,
    homeCity,
    currentCity: homeCity,
    difficulty,
    day: 1,
    hour: 8,
    money,
    reputation: 50,
    gallerySlots: 4,
    inventory: [],
    listings: [],
    customers: [],
    jobs: [],
    marketModifiers: [],
    loans: [],
    staff: [],
    auction: null,
    rivals: generateRivals(homeCity),
    facilities: { showroom: 1 },
    log: [
      {
        day: 1,
        text: `\u{1F389} ${galleryName} kap\u0131lar\u0131n\u0131 a\xE7t\u0131! Bol kazan\xE7lar ${playerName} usta.`,
        kind: "info"
      }
    ],
    stats: {
      carsBought: 0,
      carsSold: 0,
      totalProfit: 0,
      bestFlip: 0,
      auctionsWon: 0,
      repairsDone: 0,
      kmTraveled: 0,
      citiesVisited: [homeCity]
    },
    xp: 0,
    level: 1,
    achievements: {},
    rngSeed: Date.now()
  };
  base.listings = freshListings(1, 30);
  return base;
}
var emptyState = {
  version: SAVE_VERSION,
  started: false,
  playerName: "",
  galleryName: "",
  homeCity: 34,
  currentCity: 34,
  difficulty: "normal",
  day: 1,
  hour: 8,
  money: 0,
  reputation: 50,
  gallerySlots: 4,
  inventory: [],
  listings: [],
  customers: [],
  jobs: [],
  marketModifiers: [],
  loans: [],
  staff: [],
  auction: null,
  rivals: [],
  facilities: { showroom: 1 },
  log: [],
  stats: {
    carsBought: 0,
    carsSold: 0,
    totalProfit: 0,
    bestFlip: 0,
    auctionsWon: 0,
    repairsDone: 0,
    kmTraveled: 0,
    citiesVisited: []
  },
  xp: 0,
  level: 1,
  achievements: {},
  rngSeed: 0
};
function log(s, e) {
  s.log = [{ day: s.day, ...e }, ...s.log].slice(0, 200);
}
function clone(o) {
  return JSON.parse(JSON.stringify(o));
}
function travelHours(km2) {
  return Math.max(1, Math.round(km2 / 85));
}
function applyAction(state, action) {
  return reducer(state, action);
}
function reducer(state, action) {
  switch (action.type) {
    case "NEW_GAME":
      return newGameState(action.playerName, action.galleryName, action.homeCity, action.difficulty);
    case "RESET":
      return { ...emptyState };
    case "TRAVEL": {
      if (action.plate === state.currentCity) return state;
      const s = clone(state);
      const km2 = roadDistance(s.currentCity, action.plate);
      const cost = travelCostFor(km2, s.level, travelCostMultiplier(s));
      if (s.money < cost) return state;
      const h = travelHours(km2);
      s.money -= cost;
      s.hour = Math.min(24, s.hour + h);
      s.currentCity = action.plate;
      s.stats.kmTraveled += km2;
      if (!s.stats.citiesVisited.includes(action.plate)) {
        s.stats.citiesVisited.push(action.plate);
      }
      log(s, {
        text: `\u{1F697} ${km2} km yol gidildi (${h} saat). Yol masraf\u0131 d\xFC\u015F\xFCld\xFC.`,
        amount: -cost,
        kind: "gider"
      });
      addXp(s, 5);
      checkMilestones(s);
      return s;
    }
    case "EXPERTISE": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      const cost = expertiseCostFor(state.level);
      if (!l || l.expertised || s.money < cost) return state;
      s.money -= cost;
      s.hour = Math.min(24, s.hour + 1);
      addXp(s, 5);
      l.expertised = true;
      const found = [];
      l.car.hiddenFaults = l.car.hiddenFaults.filter((f) => {
        if (chance(0.8)) {
          found.push(f);
          return false;
        }
        return true;
      });
      l.car.knownFaults = [...l.car.knownFaults, ...found];
      log(s, {
        text: found.length > 0 ? `\u{1F50D} Ekspertiz: ${l.car.brand} ${l.car.model} arac\u0131nda ${found.length} sorun tespit edildi!` : `\u{1F50D} Ekspertiz: ${l.car.brand} ${l.car.model} temiz \xE7\u0131kt\u0131.`,
        amount: -cost,
        kind: "gider"
      });
      return s;
    }
    case "TESTDRIVE_DONE": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      if (!l) return state;
      l.testDriven = true;
      s.hour = Math.min(24, s.hour + 1);
      addXp(s, 10);
      const found = l.car.hiddenFaults.filter((f) => action.foundFaultIds.includes(f.id));
      l.car.hiddenFaults = l.car.hiddenFaults.filter((f) => !action.foundFaultIds.includes(f.id));
      l.car.knownFaults = [...l.car.knownFaults, ...found];
      if (action.crashed) {
        const damage = roundMoney(l.car.basePrice * 0.01, 500);
        s.money = Math.max(0, s.money - damage);
        log(s, {
          text: `\u{1F4A5} Test s\xFCr\xFC\u015F\xFCnde kaza yapt\u0131n\u0131z! Sat\u0131c\u0131ya hasar \xF6dendi.`,
          amount: -damage,
          kind: "gider"
        });
      }
      if (found.length > 0) {
        log(s, {
          text: `\u{1F6DE} Test s\xFCr\xFC\u015F\xFC: ${l.car.brand} ${l.car.model} arac\u0131nda ${found.length} sorun fark ettiniz.`,
          kind: "info"
        });
      }
      return s;
    }
    case "SELLER_WALKAWAY": {
      const s = clone(state);
      const l = s.listings.find((x) => x.id === action.listingId);
      if (!l) return state;
      l.negotiationDead = true;
      return s;
    }
    case "BUY": {
      const s = clone(state);
      const li = s.listings.findIndex((x) => x.id === action.listingId);
      if (li < 0) return state;
      const l = s.listings[li];
      const inGarageCount = s.inventory.length;
      if (inGarageCount >= s.gallerySlots) return state;
      const km2 = roadDistance(l.cityPlate, s.homeCity);
      const selfDrive = action.deliver === "sur" && km2 > 0;
      const transport = selfDrive ? 0 : roundMoney(km2 * TRANSPORT_COST_PER_KM, 100);
      const total = action.price + transport;
      if (s.money < total) return state;
      s.money -= total;
      s.hour = Math.min(24, s.hour + 1);
      const owned = {
        car: l.car,
        boughtPrice: action.price,
        boughtDay: s.day,
        totalSpent: total,
        askingPrice: roundMoney(carValue({ ...l.car, hiddenFaults: [] }, s.marketModifiers, s.day) * 1.08, 5e3),
        inTransitUntilDay: !selfDrive && km2 > 250 ? s.day + 1 : void 0
      };
      s.inventory.push(owned);
      s.listings.splice(li, 1);
      s.stats.carsBought++;
      if (selfDrive) {
        const car = owned.car;
        s.currentCity = s.homeCity;
        s.hour = Math.min(24, s.hour + travelHours(km2));
        s.stats.kmTraveled += km2;
        if (!s.stats.citiesVisited.includes(s.homeCity)) s.stats.citiesVisited.push(s.homeCity);
        car.km += km2;
        const found = action.drive?.foundFaultIds ?? [];
        const learned = car.hiddenFaults.filter((f) => found.includes(f.id));
        car.hiddenFaults = car.hiddenFaults.filter((f) => !found.includes(f.id));
        car.knownFaults = [...car.knownFaults, ...learned];
        let extra2 = 0;
        let note = "";
        if (action.drive?.brokeDown) {
          const tow2 = roundMoney(Math.max(3e3, km2 * 12), 500);
          extra2 += tow2;
          note += ` Yolda kald\u0131n\u0131z, \xE7ekici: ${tow2.toLocaleString("tr-TR")} \u20BA.`;
          if (car.hiddenFaults.length > 0) {
            const f = car.hiddenFaults.shift();
            car.knownFaults.push(f);
            note += ` Sorun: ${f.label}.`;
          }
        }
        if (action.drive?.crashed) {
          const damage = roundMoney(Math.max(5e3, car.basePrice * 0.015), 500);
          extra2 += damage;
          const part = PART_KEYS_FOR_DAMAGE[Math.floor(Math.random() * PART_KEYS_FOR_DAMAGE.length)];
          car.parts[part] = Math.max(10, car.parts[part] - 15);
          car.paintedPanels += 1;
          note += ` Kaza yapt\u0131n\u0131z: ${damage.toLocaleString("tr-TR")} \u20BA hasar, ${PART_LABELS[part]} y\u0131prand\u0131.`;
        }
        s.money -= extra2;
        owned.totalSpent += extra2;
        log(s, {
          text: `\u{1F3C1} ${l.car.year} ${l.car.brand} ${l.car.model} sat\u0131n al\u0131n\u0131p ${km2} km s\xFCr\xFClerek galeriye getirildi (nakliye bedava).${note}${learned.length > 0 ? ` Yolda ${learned.length} ar\u0131za fark ettiniz.` : ""}`,
          amount: -(total + extra2),
          kind: "gider"
        });
        addXp(s, 40 + 30 + Math.floor(km2 / 100));
        checkMilestones(s);
        return s;
      }
      log(s, {
        text: `\u{1F91D} ${l.car.year} ${l.car.brand} ${l.car.model} sat\u0131n al\u0131nd\u0131 (${l.sellerName}).${transport > 0 ? ` Nakliye: ${transport.toLocaleString("tr-TR")} \u20BA.` : ""}${owned.inTransitUntilDay ? " Ara\xE7 yar\u0131n galeride olacak." : ""}`,
        amount: -total,
        kind: "gider"
      });
      addXp(s, 40);
      checkMilestones(s);
      return s;
    }
    case "SET_ASKING": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o) return state;
      o.askingPrice = Math.max(0, Math.round(action.price));
      return s;
    }
    case "START_JOB": {
      const s = clone(state);
      const o = s.inventory.find((x) => x.car.id === action.carId);
      if (!o || s.money < action.job.cost) return state;
      const dup = s.jobs.some(
        (j) => j.carId === action.carId && j.type === action.job.type && j.partKey === action.job.partKey && j.cosmeticKey === action.job.cosmeticKey && j.faultId === action.job.faultId
      );
      if (dup) return state;
      s.money -= action.job.cost;
      s.jobs.push({ id: uid("job"), carId: action.carId, ...action.job });
      log(s, {
        text: `\u{1F527} At\xF6lye i\u015Fi ba\u015Flad\u0131: ${o.car.brand} ${o.car.model} \u2014 ${action.job.label}`,
        amount: -action.job.cost,
        kind: "gider"
      });
      return s;
    }
    case "CUSTOMER_DEAL": {
      const s = clone(state);
      const c = s.customers.find((x) => x.id === action.customerId);
      if (!c) return state;
      const oi = s.inventory.findIndex((x) => x.car.id === c.carId);
      if (oi < 0) return state;
      const o = s.inventory[oi];
      s.money += action.price;
      const profit = action.price - o.totalSpent;
      s.stats.carsSold++;
      s.stats.totalProfit += profit;
      s.stats.bestFlip = Math.max(s.stats.bestFlip, profit);
      s.inventory.splice(oi, 1);
      s.customers = s.customers.filter((x) => x.id !== c.id);
      s.customers = s.customers.filter((x) => x.carId !== c.carId);
      s.jobs = s.jobs.filter((j) => j.carId !== c.carId);
      log(s, {
        text: `\u{1F4B0} ${o.car.year} ${o.car.brand} ${o.car.model}, ${c.name} adl\u0131 m\xFC\u015Fteriye sat\u0131ld\u0131! K\xE2r: ${profit.toLocaleString("tr-TR")} \u20BA`,
        amount: action.price,
        kind: "gelir"
      });
      if (o.car.hiddenFaults.length > 0 && chance(0.25)) {
        const hit = 1 + o.car.hiddenFaults.length;
        s.reputation = Math.max(0, s.reputation - hit);
        log(s, {
          text: `\u{1F620} ${c.name} eve varamadan ara\xE7 ar\u0131za yapt\u0131! Sosyal medyada sizi k\xF6t\xFCledi. \u0130tibar -${hit}`,
          kind: "uyari"
        });
      } else if (o.car.knownFaults.length === 0 && o.car.hiddenFaults.length === 0 && profit > 0) {
        s.reputation = Math.min(100, s.reputation + 6);
        log(s, { text: "\u{1F31F} Sorunsuz sat\u0131\u015F! \u0130tibar +6", kind: "info" });
      } else if (profit > 0) {
        s.reputation = Math.min(100, s.reputation + 3);
        log(s, { text: "\u{1F642} Memnun m\xFC\u015Fteri! \u0130tibar +3", kind: "info" });
      }
      addXp(s, 60 + Math.max(0, Math.floor(profit / 1e4)));
      checkMilestones(s);
      return s;
    }
    case "CUSTOMER_GONE": {
      const s = clone(state);
      const c = s.customers.find((x) => x.id === action.customerId);
      if (!c) return state;
      s.customers = s.customers.filter((x) => x.id !== action.customerId);
      if (action.angry) {
        s.reputation = Math.max(0, s.reputation - 1);
        log(s, { text: `\u{1F612} ${c.name} galeriden memnun ayr\u0131lmad\u0131. \u0130tibar -1`, kind: "uyari" });
      }
      return s;
    }
    case "WHOLESALE": {
      const s = clone(state);
      const oi = s.inventory.findIndex((x) => x.car.id === action.carId);
      if (oi < 0) return state;
      const o = s.inventory[oi];
      const price2 = roundMoney(carValue(o.car, s.marketModifiers, s.day) * 0.78, 1e3);
      s.money += price2;
      const profit = price2 - o.totalSpent;
      s.stats.carsSold++;
      s.stats.totalProfit += profit;
      s.inventory.splice(oi, 1);
      s.customers = s.customers.filter((x) => x.carId !== action.carId);
      s.jobs = s.jobs.filter((j) => j.carId !== action.carId);
      log(s, {
        text: `\u{1F69B} ${o.car.brand} ${o.car.model} toptanc\u0131ya verildi. ${profit >= 0 ? "K\xE2r" : "Zarar"}: ${profit.toLocaleString("tr-TR")} \u20BA`,
        amount: price2,
        kind: profit >= 0 ? "gelir" : "uyari"
      });
      addXp(s, 20);
      checkMilestones(s);
      return s;
    }
    case "BUILD_FACILITY": {
      const s = clone(state);
      const def = facilityDef(action.facility);
      const cur = facilityLevel(s, action.facility);
      if (cur >= def.levels.length) return state;
      const lvl = def.levels[cur];
      if (s.money < lvl.cost) return state;
      s.money -= lvl.cost;
      s.facilities[action.facility] = cur + 1;
      s.gallerySlots = totalSlots(s);
      log(s, {
        text: cur === 0 ? `\u{1F3D7}\uFE0F ${def.emoji} ${def.name} in\u015Fa edildi! ${lvl.effect}.` : `\u{1F3D7}\uFE0F ${def.emoji} ${def.name} Seviye ${cur + 1} oldu! ${lvl.effect}.`,
        amount: -lvl.cost,
        kind: "gider"
      });
      addXp(s, 50 + cur * 25);
      checkMilestones(s);
      return s;
    }
    case "TAKE_LOAN": {
      const s = clone(state);
      if (canTakeLoan(s, action.offer)) return state;
      const loan = makeLoan(action.offer);
      loan.takenDay = s.day;
      s.loans.push(loan);
      s.money += loan.principal;
      log(s, {
        text: `\u{1F3E6} ${loan.name} \xE7ekildi. Geri \xF6deme: ${fmtMoney(loan.totalDebt)} (g\xFCnl\xFCk ${fmtMoney(loan.dailyPayment)} taksit).`,
        amount: loan.principal,
        kind: "gelir"
      });
      return s;
    }
    case "PAYOFF_LOAN": {
      const s = clone(state);
      const loan = s.loans.find((l) => l.id === action.loanId);
      if (!loan || s.money < loan.remaining) return state;
      s.money -= loan.remaining;
      log(s, {
        text: `\u{1F3E6} ${loan.name} erken kapat\u0131ld\u0131. Banka sizi seviyor!`,
        amount: -loan.remaining,
        kind: "gider"
      });
      s.loans = s.loans.filter((l) => l.id !== action.loanId);
      s.reputation = Math.min(100, s.reputation + 1);
      addXp(s, 25);
      return s;
    }
    case "HIRE_STAFF": {
      const s = clone(state);
      if (s.staff.some((st) => st.role === action.role)) return state;
      const def = STAFF_DEFS[action.role];
      s.staff.push({
        id: uid("stf"),
        name: randomPersonName(),
        role: action.role,
        weeklySalary: def.weeklySalary,
        hiredDay: s.day
      });
      const hired = s.staff[s.staff.length - 1];
      log(s, {
        text: `${def.emoji} ${hired.name} i\u015Fe al\u0131nd\u0131 (${def.label}). Haftal\u0131k maa\u015F: ${fmtMoney(def.weeklySalary)}.`,
        kind: "info"
      });
      return s;
    }
    case "FIRE_STAFF": {
      const s = clone(state);
      const st = s.staff.find((x) => x.id === action.staffId);
      if (!st) return state;
      s.staff = s.staff.filter((x) => x.id !== action.staffId);
      log(s, { text: `\u{1F44B} ${st.name} ile yollar ayr\u0131ld\u0131.`, kind: "info" });
      return s;
    }
    case "AUCTION_BUY": {
      const s = clone(state);
      const a = s.auction;
      if (!a || a.day !== s.day || s.currentCity !== a.cityPlate) return state;
      const car = a.cars.find((c) => c.id === action.carId);
      if (!car || a.resolved.includes(car.id)) return state;
      if (s.inventory.length >= s.gallerySlots) return state;
      const km2 = roadDistance(a.cityPlate, s.homeCity);
      const transport = auctionTransportFor(km2, s.level);
      const total = action.price + transport;
      if (s.money < total) return state;
      s.money -= total;
      s.hour = Math.min(24, s.hour + 1);
      s.inventory.push({
        car,
        boughtPrice: action.price,
        boughtDay: s.day,
        totalSpent: total,
        askingPrice: roundMoney(
          carValue({ ...car, hiddenFaults: [] }, s.marketModifiers, s.day) * 1.08,
          5e3
        ),
        inTransitUntilDay: km2 > 250 ? s.day + 1 : void 0
      });
      a.resolved.push(car.id);
      s.stats.carsBought++;
      s.stats.auctionsWon++;
      log(s, {
        text: `\u{1F528} Mezattan ${car.year} ${car.brand} ${car.model} kazan\u0131ld\u0131!${transport > 0 ? ` Nakliye: ${fmtMoney(transport)}.` : ""} Mezat mal\u0131 ekspertizsizdir, s\xFCrprizlere haz\u0131r olun...`,
        amount: -total,
        kind: "gider"
      });
      addXp(s, 60);
      checkMilestones(s);
      return s;
    }
    case "AUCTION_PASS": {
      const s = clone(state);
      const a = s.auction;
      if (!a) return state;
      const car = a.cars.find((c) => c.id === action.carId);
      if (!car || a.resolved.includes(car.id)) return state;
      a.resolved.push(car.id);
      log(s, {
        text: `\u{1F528} Mezatta ${car.brand} ${car.model} rakip galericiye gitti.`,
        kind: "info"
      });
      return s;
    }
    case "END_DAY": {
      const s = clone(state);
      s.day += 1;
      s.hour = 8;
      if (s.day % 7 === 1 && s.day > 1) {
        const exp = weeklyExpense(s);
        const salaries = s.staff.reduce((sum, st) => sum + st.weeklySalary, 0);
        s.money -= exp + salaries;
        log(s, {
          text: salaries > 0 ? "\u{1F3E0} Haftal\u0131k kira, giderler ve maa\u015Flar \xF6dendi." : "\u{1F3E0} Haftal\u0131k kira ve giderler \xF6dendi.",
          amount: -(exp + salaries),
          kind: "gider"
        });
        if (s.money < 0) {
          log(s, {
            text: "\u{1F6A8} Kasan\u0131z eksiye d\xFC\u015Ft\xFC! Ara\xE7 sat\u0131p nakit toplamal\u0131s\u0131n\u0131z (toptanc\u0131 her zaman al\u0131c\u0131d\u0131r).",
            kind: "uyari"
          });
        }
      }
      const shopIncome = dailyFacilityIncome(s);
      if (shopIncome > 0) {
        s.money += shopIncome;
        log(s, {
          text: "\u{1F3EA} Tesisteki d\xFCkkanlar g\xFCnl\xFCk ciroyu kasaya devretti.",
          amount: shopIncome,
          kind: "gelir"
        });
      }
      if (s.loans.length > 0) {
        let totalPay = 0;
        for (const loan of s.loans) {
          const pay = Math.min(loan.dailyPayment, loan.remaining);
          loan.remaining -= pay;
          totalPay += pay;
        }
        s.money -= totalPay;
        log(s, { text: "\u{1F3E6} G\xFCnl\xFCk kredi taksitleri \xF6dendi.", amount: -totalPay, kind: "gider" });
        const finished2 = s.loans.filter((l) => l.remaining <= 0);
        for (const l of finished2) {
          log(s, { text: `\u{1F389} ${l.name} tamamen \xF6dendi!`, kind: "info" });
        }
        s.loans = s.loans.filter((l) => l.remaining > 0);
        if (s.money < 0) {
          s.reputation = Math.max(0, s.reputation - 1);
          log(s, {
            text: "\u{1F6A8} Taksitler kasay\u0131 eksiye d\xFC\u015F\xFCrd\xFC! Banka kara listeye almadan nakit bulun. \u0130tibar -1",
            kind: "uyari"
          });
        }
      }
      const finished = [];
      s.jobs = s.jobs.filter((j) => {
        j.daysLeft -= 1;
        if (j.daysLeft <= 0) {
          finished.push(j);
          return false;
        }
        return true;
      });
      for (const j of finished) {
        const o = s.inventory.find((x) => x.car.id === j.carId);
        if (!o) continue;
        const car = o.car;
        o.totalSpent += 0;
        if (j.type === "repair") {
          if (j.partKey) car.parts[j.partKey] = randInt(95, 100);
          if (j.faultId) {
            car.knownFaults = car.knownFaults.filter((f) => f.id !== j.faultId);
          }
        } else if (j.type === "clean") {
          car.cleanliness = 100;
        } else if (j.type === "cosmetic" && j.cosmeticKey) {
          car.cosmetics[j.cosmeticKey] = true;
          if (j.cosmeticKey === "seatCover") car.cleanliness = Math.min(100, car.cleanliness + 15);
        }
        log(s, { text: `\u2705 At\xF6lye i\u015Fi bitti: ${car.brand} ${car.model} \u2014 ${j.label}`, kind: "info" });
      }
      for (const j of finished) {
        const o = s.inventory.find((x) => x.car.id === j.carId);
        if (o) o.totalSpent += j.cost;
      }
      s.stats.repairsDone += finished.length;
      addXp(s, 5 + finished.length * 15);
      for (const o of s.inventory) {
        if (o.inTransitUntilDay && o.inTransitUntilDay <= s.day) {
          o.inTransitUntilDay = void 0;
          log(s, { text: `\u{1F69A} ${o.car.brand} ${o.car.model} galeriye ula\u015Ft\u0131.`, kind: "info" });
        }
      }
      s.listings = s.listings.filter((l) => l.expiresDay > s.day && !l.negotiationDead);
      const newCount = Math.min(MAX_LISTINGS - s.listings.length, randInt(7, 12));
      if (newCount > 0) s.listings.push(...freshListings(s.day, newCount));
      const leaving = s.customers.filter((c) => c.leavesDay <= s.day);
      for (const c of leaving) {
        log(s, { text: `\u{1F6B6} ${c.name} beklemekten vazge\xE7ip gitti.`, kind: "info" });
      }
      s.customers = s.customers.filter(
        (c) => c.leavesDay > s.day && s.inventory.some((o) => o.car.id === c.carId)
      );
      const fresh = dailyCustomers(s);
      s.customers.push(...fresh);
      if (fresh.length > 0) {
        log(s, { text: `\u{1F6CE}\uFE0F Bug\xFCn galeriye ${fresh.length} m\xFC\u015Fteri geldi.`, kind: "info" });
      }
      if (s.auction && s.auction.day < s.day) {
        s.auction = null;
      }
      if (!s.auction && (s.day + 1) % AUCTION_PERIOD === 0) {
        s.auction = generateAuction(s.day + 1);
        log(s, {
          text: `\u{1F4E2} Duyuru: YARIN ${cityByPlate(s.auction.cityPlate).name}'de banka mezad\u0131 var! ${s.auction.cars.length} ara\xE7 a\xE7\u0131k art\u0131rmayla sat\u0131lacak. Erken giden ucuza kapat\u0131r.`,
          kind: "olay"
        });
      }
      if (s.auction && s.auction.day === s.day) {
        log(s, {
          text: `\u{1F528} Bug\xFCn ${cityByPlate(s.auction.cityPlate).name}'de mezat g\xFCn\xFC! Kat\u0131lmak i\xE7in oraya gidin (\u0130lanlar sekmesindeki mezat panosuna bak\u0131n).`,
          kind: "olay"
        });
      }
      const rankBefore = playerRank(s);
      const rivalLogs = updateRivals(s);
      for (const t of rivalLogs) log(s, { text: t, kind: "olay" });
      const rankAfter = playerRank(s);
      if (rankAfter < rankBefore) {
        log(s, {
          text: `\u{1F4CA} Ligde y\xFCkseliyorsunuz! Yeni s\u0131ran\u0131z: ${rankAfter}. (${s.rivals.length + 1} galeri aras\u0131nda)`,
          kind: "olay"
        });
      } else if (rankAfter > rankBefore) {
        log(s, {
          text: `\u{1F4CA} Rakipler sizi ge\xE7ti... Yeni s\u0131ran\u0131z: ${rankAfter}. Lig sekmesine g\xF6z at\u0131n.`,
          kind: "info"
        });
      }
      applyDailyEvents(s);
      checkMilestones(s);
      return s;
    }
    default:
      return state;
  }
}
var GameContext = (0, import_react.createContext)({
  state: emptyState,
  dispatch: () => {
  }
});
function fmtMoney(n) {
  return n.toLocaleString("tr-TR") + " \u20BA";
}

// scripts/test-buy-sur.ts
function assert(cond, msg) {
  if (!cond) {
    console.error("\u2717 " + msg);
    process.exitCode = 1;
  } else {
    console.log("\u2713 " + msg);
  }
}
var s0 = newGameState("Test", "Test Motors", 34, "normal");
s0.currentCity = 17;
var listing = generateListing(s0.day, 17);
listing.car.hiddenFaults = [makeFault(listing.car.basePrice, "motor"), makeFault(listing.car.basePrice, "fren")];
var fault0 = listing.car.hiddenFaults[0];
s0.listings = [listing];
var km = roadDistance(17, 34);
var price = 4e5;
var flagLog = (s) => s.log.find((e) => e.text.startsWith("\u{1F3C1}"));
var s1 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "sur", drive: { crashed: false, brokeDown: false, foundFaultIds: [] } });
assert(s1 !== s0, "aksiyon state'i de\u011Fi\u015Ftirdi");
assert(s1.inventory.length === 1, "ara\xE7 envantere girdi");
assert(s1.currentCity === 34, "oyuncu eve (\u0130stanbul) d\xF6nd\xFC");
assert(s0.money - s1.money <= price, `nakliye kesilmedi (gider ${s0.money - s1.money} \u2264 fiyat ${price})`);
assert(s1.inventory[0].totalSpent === price, "arac\u0131n maliyeti sadece al\u0131\u015F fiyat\u0131");
assert(s1.inventory[0].car.km === listing.car.km + km, `araca ${km} km yaz\u0131ld\u0131`);
assert(s1.inventory[0].inTransitUntilDay === void 0, "ara\xE7 hemen galeride (nakliyede de\u011Fil)");
assert(s1.stats.kmTraveled === s0.stats.kmTraveled + km, "kmTraveled istatisti\u011Fi artt\u0131");
assert(!!flagLog(s1) && flagLog(s1).day === s1.day, "bug\xFCnk\xFC \u{1F3C1} defter kayd\u0131 var (sinema atlan\u0131r)");
assert(s1.xp > s0.xp || s1.level > s0.level, "XP kazan\u0131ld\u0131");
var s2 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "sur", drive: { crashed: true, brokeDown: true, foundFaultIds: [fault0.id] } });
var car2 = s2.inventory[0].car;
var tow = Math.max(3e3, km * 12);
var extra = s2.inventory[0].totalSpent - price;
assert(extra >= tow + 5e3, `\xE7ekici (~${tow}) ve kaza hasar\u0131 arac\u0131n maliyetine yaz\u0131ld\u0131 (ek gider ${extra} \u20BA)`);
assert(car2.knownFaults.some((f) => f.id === fault0.id), "yolda fark edilen ar\u0131za bilinen ar\u0131zaya d\xF6n\xFC\u015Ft\xFC");
assert(car2.hiddenFaults.length === 0, "yolda kal\u0131nca kalan gizli ar\u0131za da ortaya \xE7\u0131kt\u0131");
assert(car2.paintedPanels === listing.car.paintedPanels + 1, "kaza boyal\u0131 par\xE7a ekledi");
var l2 = flagLog(s2);
assert(!!l2 && l2.text.includes("\xE7ekici") && l2.text.includes("Kaza"), "\u{1F3C1} defter kayd\u0131 \xE7ekici ve kaza notunu i\xE7eriyor");
assert(s2.inventory[0].totalSpent > price, "ek giderler arac\u0131n toplam maliyetine yaz\u0131ld\u0131");
var s3 = applyAction(s0, { type: "BUY", listingId: listing.id, price, deliver: "nakliye" });
assert(s3.currentCity === 17, "nakliyede oyuncu \xC7anakkale'de kald\u0131");
assert(s3.inventory[0].totalSpent > price, "nakliye \xFCcreti arac\u0131n maliyetine eklendi");
assert(s0.money - s3.money > s0.money - s1.money, "nakliye yolu, kendin s\xFCrmekten daha pahal\u0131");
assert(s3.inventory[0].inTransitUntilDay === s0.day + 1, "uzak ilden nakliye yar\u0131n gelir");
assert(!flagLog(s3), "nakliyede \u{1F3C1} kayd\u0131 yok (sinema oynar)");
console.log(process.exitCode ? "\nBA\u015EARISIZ" : "\nT\xDCM TESTLER GE\xC7T\u0130");
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.min.js:
  (**
   * @license React
   * react-jsx-runtime.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.development.js:
  (**
   * @license React
   * react-jsx-runtime.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
