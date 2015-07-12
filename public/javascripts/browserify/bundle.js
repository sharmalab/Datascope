(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],2:[function(require,module,exports){
exports.createdStores = [];

exports.createdActions = [];

exports.reset = function() {
    while(exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};

},{}],3:[function(require,module,exports){
var _ = require('./utils'),
    maker = require('./joins').instanceJoinCreator;

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function(listenable) {
        var i = 0, j, listener, listenables;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listenables = [].concat(this.subscriptions[i].listenable);
            for (j = 0; j < listenables.length; j++){
                listener = listenables[j];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function(listenables){
        for(var key in listenables){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(listenables[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function(listenable){
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (listenable.hasListener && listenable.hasListener(this)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function(listenable, callback, defaultCallback) {
        var desub, unsubscriber, subscriptionobj, subs = this.subscriptions = this.subscriptions || [];
        _.throwIf(this.validateListening(listenable));
        this.fetchDefaultData(listenable, defaultCallback);
        desub = listenable.listen(this[callback]||callback, this);
        unsubscriber = function() {
            var index = subs.indexOf(subscriptionobj);
            _.throwIf(index === -1,'Tried to remove listen already gone from subscriptions list!');
            subs.splice(index, 1);
            desub();
        };
        subscriptionobj = {
            stop: unsubscriber,
            listenable: listenable
        };
        subs.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function(listenable){
        var sub, i = 0, subs = this.subscriptions || [];
        for(;i < subs.length; i++){
            sub = subs[i];
            if (sub.listenable === listenable){
                sub.stop();
                _.throwIf(subs.indexOf(sub)!==-1,'Failed to remove listen from subscriptions list!');
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     */
    stopListeningToAll: function(){
        var remaining, subs = this.subscriptions || [];
        while((remaining=subs.length)){
            subs[0].stop();
            _.throwIf(subs.length!==remaining-1,'Failed to remove listen from subscriptions list!');
        }
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getDefaultData` method.
     * @param {Action|Store} listenable The publisher we want to get default data from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchDefaultData: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getDefaultData)) {
            data = listenable.getDefaultData();
            if (data && _.isFunction(data.then)) {
                data.then(function() {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the last emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinTrailing: maker("last"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with the first emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinLeading: maker("first"),

    /**
     * The callback will be called once all listenables have triggered at least once.
     * It will be invoked with all emission from each listenable.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinConcat: maker("all"),

    /**
     * The callback will be called once all listenables have triggered.
     * If a callback triggers twice before that happens, an error is thrown.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is an array of listenables
     */
    joinStrict: maker("strict"),
};


},{"./joins":10,"./utils":13}],4:[function(require,module,exports){
var _ = require('./utils'),
    ListenerMethods = require('./ListenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `ListenerMethods` mixin and takes care of teardown of subscriptions.
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: ListenerMethods.stopListeningToAll

}, ListenerMethods);

},{"./ListenerMethods":3,"./utils":13}],5:[function(require,module,exports){
var _ = require('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        }, me = this;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function() {
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments,me = this;
        _.nextTick(function() {
            me.trigger.apply(me, args);
        });
    }
};

},{"./utils":13}],6:[function(require,module,exports){
var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        componentDidMount: function(){
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};

},{"../src":9,"./utils":13}],7:[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1};

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var d in definition){
        if (!allowed[d] && Reflux.PublisherMethods[d]) {
            throw new Error("Cannot override API method " + d +
                " in action creation. Use another method name or override it on Reflux.PublisherMethods instead."
            );
        }
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    },Reflux.PublisherMethods,definition);

    var functor = function() {
        functor[functor.sync?"trigger":"triggerAsync"].apply(functor, arguments);
    };

    _.extend(functor,context);

    Keep.createdActions.push(functor);

    return functor;

};

},{"../src":9,"./Keep":2,"./utils":13}],8:[function(require,module,exports){
var _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1};

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `ListenerMethods` and `PublisherMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var d in definition){
        if (!allowed[d] && (Reflux.PublisherMethods[d] || Reflux.ListenerMethods[d])){
            throw new Error("Cannot override API method " + d + 
                " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            arr = [].concat(this.listenables);
            for(;i < arr.length;i++){
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, Reflux.ListenerMethods, Reflux.PublisherMethods, definition);

    var store = new Store();
    Keep.createdStores.push(store);

    return store;
};

},{"../src":9,"./Keep":2,"./utils":13}],9:[function(require,module,exports){
exports.ListenerMethods = require('./ListenerMethods');

exports.PublisherMethods = require('./PublisherMethods');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.connect = require('./connect');

exports.ListenerMixin = require('./ListenerMixin');

exports.listenTo = require('./listenTo');

exports.listenToMany = require('./listenToMany');


var maker = require('./joins').staticJoinCreator;

exports.joinTrailing = exports.all = maker("last"); // Reflux.all alias for backward compatibility

exports.joinLeading = maker("first");

exports.joinStrict = maker("strict");

exports.joinConcat = maker("all");


/**
 * Convenience function for creating a set of actions
 *
 * @param actionNames the names for the actions to be created
 * @returns an object with actions of corresponding action names
 */
exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = exports.createAction();
    }
    return actions;
};

/**
 * Sets the eventmitter that Reflux uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./Keep');

},{"./Keep":2,"./ListenerMethods":3,"./ListenerMixin":4,"./PublisherMethods":5,"./connect":6,"./createAction":7,"./createStore":8,"./joins":10,"./listenTo":11,"./listenToMany":12,"./utils":13}],10:[function(require,module,exports){
/**
 * Internal module used to create static and instance join methods
 */

var slice = Array.prototype.slice,
    _ = require("./utils"),
    createStore = require("./createStore"),
    strategyMethodNames = {
        strict: "joinStrict",
        first: "joinLeading",
        last: "joinTrailing",
        all: "joinConcat"
    };

/**
 * Used in `index.js` to create the static join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} A static function which returns a store with a join listen on the given listenables using the given strategy
 */
exports.staticJoinCreator = function(strategy){
    return function(/* listenables... */) {
        var listenables = slice.call(arguments);
        return createStore({
            init: function(){
                this[strategyMethodNames[strategy]].apply(this,listenables.concat("triggerAsync"));
            }
        });
    };
};

/**
 * Used in `ListenerMethods.js` to create the instance join methods
 * @param {String} strategy Which strategy to use when tracking listenable trigger arguments
 * @returns {Function} An instance method which sets up a join listen on the given listenables using the given strategy
 */
exports.instanceJoinCreator = function(strategy){
    return function(/* listenables..., callback*/){
        _.throwIf(arguments.length < 3,'Cannot create a join with less than 2 listenables!');
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            join = {
                numberOfListenables: numberOfListenables,
                callback: this[callback]||callback,
                listener: this,
                strategy: strategy
            }, i, cancels = [], subobj;
        for (i = 0; i < numberOfListenables; i++) {
            _.throwIf(this.validateListening(listenables[i]));
        }
        for (i = 0; i < numberOfListenables; i++) {
            cancels.push(listenables[i].listen(newListener(i,join),this));
        }
        reset(join);
        subobj = {listenable: listenables};
        subobj.stop = makeStopper(subobj,cancels,this);
        this.subscriptions = (this.subscriptions || []).concat(subobj);
        return subobj;
    };
};

// ---- internal join functions ----

function makeStopper(subobj,cancels,context){
    return function() {
        var i, subs = context.subscriptions;
            index = (subs ? subs.indexOf(subobj) : -1);
        _.throwIf(index === -1,'Tried to remove join already gone from subscriptions list!');
        for(i=0;i < cancels.length; i++){
            cancels[i]();
        }
        subs.splice(index, 1);
    };
}

function reset(join) {
    join.listenablesEmitted = new Array(join.numberOfListenables);
    join.args = new Array(join.numberOfListenables);
}

function newListener(i,join) {
    return function() {
        var callargs = slice.call(arguments);
        if (join.listenablesEmitted[i]){
            switch(join.strategy){
                case "strict": throw new Error("Strict join failed because listener triggered twice.");
                case "last": join.args[i] = callargs; break;
                case "all": join.args[i].push(callargs);
            }
        } else {
            join.listenablesEmitted[i] = true;
            join.args[i] = (join.strategy==="all"?[callargs]:callargs);
        }
        emitIfAllListenablesEmitted(join);
    };
}

function emitIfAllListenablesEmitted(join) {
    for (var i = 0; i < join.numberOfListenables; i++) {
        if (!join.listenablesEmitted[i]) {
            return;
        }
    }
    join.callback.apply(join.listener,join.args);
    reset(join);
}

},{"./createStore":8,"./utils":13}],11:[function(require,module,exports){
var Reflux = require('../src');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `ListenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"../src":9}],12:[function(require,module,exports){
var Reflux = require('../src');

/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method. This version is used
 * to automatically set up a `listenToMany` call.
 *
 * @param {Object} listenables An object of listenables
 * @returns {Object} An object to be used as a mixin, which sets up the listeners for the given listenables.
 */
module.exports = function(listenables){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `ListenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenToMany!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            this.listenToMany(listenables);
        },
        /**
         * Cleans up all listener previously registered.
         */
        componentWillUnmount: Reflux.ListenerMethods.stopListeningToAll
    };
};

},{"../src":9}],13:[function(require,module,exports){
/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
 * order to remove the dependency
 */
var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = require('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.callbackName = function(string){
    return "on"+string.charAt(0).toUpperCase()+string.slice(1);
};

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i<keys.length;i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

exports.isArguments = function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      (toString.call(value) === '[object Arguments]' || (hasOwnProperty.call(value, 'callee' && !propertyIsEnumerable.call(value, 'callee')))) || false;
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};

},{"eventemitter3":1}],14:[function(require,module,exports){

var filteredData = {};
var queryFilter = {};
var dataTable;
var AppActions = require("./actions/AppActions.jsx");
var AppStore = require("./stores/AppStore.jsx");
var Reflux = require('reflux');

var InteractiveFilters = require("./components/InteractiveFilters.jsx");
var Visualizations = require("./components/Visualizations.jsx");


var Dashboard = React.createClass({displayName: "Dashboard",
        mixins: [Reflux.connect(AppStore,"currData")], // will set up listenTo call and then do this.setState("messages",data)
        //mixins: [Reflux.connect(A,"messages")], // will set up listenTo call and then do this.setState("messages",data)
        componentDidMount: function(){      
            var self=this;    

            self.unsubscribe = AppStore.listen(self.onFilter);

            d3.json("config/interactiveFilters.json", function(err, data) {

                if(err) {
                    console.log(err);
                    return;
                }
                interactiveFilters = data;
                d3.json("config/visualization.json", function(err, data) {

                    if(err) {
                        console.log(err);
                        return;
                    }
                    visualization = data;   
                    AppActions.refresh(queryFilter); //Initial refresh
                    filteredData = AppStore.getData();

                    
                    d3.json("/data?filter={}", function(d) {
                        filteredData = d;
                    
                        //console.log(filteredData);

                        self.setState({
                            interactiveFilters: interactiveFilters,
                            visualization: visualization,
                            currData: filteredData
                        });
                        self.listenTo(AppStore, self.onFilter);
                        dc.renderAll();
                    }.bind(self));
                    

                });

            });
        },
      componentWillMount: function(){
        //console.log(this.unsubscribe)
        console.log("this whole thing")
        if(this.unsubscribe)
            this.unsubscribe();
      },
      getInitialState: function(){
        return {interactiveFilters: null, visualization: null, filter: null};
      },
      handleRefresh: function(filteredData){
        this.setState({currData: filteredData})
      },
      onFilter: function(){



        this.setState({currData: AppStore.getData()});
        dc.renderAll();
        if(dataTable.ajax){  
            dataTable.ajax.reload(); //jquery datatable fix
        }

      },
      render: function(){
        return (
          React.createElement("div", null, 
            React.createElement(InteractiveFilters, {onFilter: this.onFilter, config: this.state.interactiveFilters, currData: this.state.currData}
            ), 
            React.createElement(Visualizations, {config: this.state.visualization, onRefresh: this.handleRefresh, currData: this.state.currData}
            )
          )
        );
      }

});


React.render(React.createElement(Dashboard, null), document.getElementById("main"))

},{"./actions/AppActions.jsx":15,"./components/InteractiveFilters.jsx":17,"./components/Visualizations.jsx":18,"./stores/AppStore.jsx":24,"reflux":9}],15:[function(require,module,exports){
var Reflux = require("reflux");

var AppActions = Reflux.createActions([
	'refresh'
]);

module.exports = AppActions;

},{"reflux":9}],16:[function(require,module,exports){
var queryFilter = {};
var AppActions = require("../actions/AppActions.jsx");
var FilteringAttribute = React.createClass({displayName: "FilteringAttribute",
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering
        var self = this;
        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        //refresh()

                        AppActions.refresh(queryFilter);
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];

                        //here would call the update action
                        //refresh();
                        AppActions.refresh(queryFilter);
                      } else {
                        return;
                      } 
                    }
                },
            filterAll: function() {
                    delete queryFilter[attributeName];

                    AppActions.refresh(queryFilter);
                },
            name: function(){
                    return attributeName;
                }
       
        };
        var group = {
                all: function() {
                    //console.log(AppStore.getData())
                    //return self.props.currData;
                    return self.props.currData[attributeName].values;
                    /*
                    if(AppStore.getData()[attributeName]){
                        return AppStore.getData()[attributeName].values;   
                    }
                    
                    return filteredData[attributeName].values;
                    */
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return self.props.currData[attributeName].values;
                    /*
                    if(AppStore.getData()[attributeName]){
                        return AppStore.getData()[attributeName].values;   
                    }
                    
                    //console.log(AppStore.getData())
                    //return AppStore.getData()[attributeName].values;
                    return filteredData[attributeName].values;
                    */
                }
 
        };

        this.setState({dimension: dim, group: group});

    
    },
    componentDidMount: function(){

        var self = this;
        var visType = this.props.config.visualization.visType;
        var divId = "#dc-"+this.props.config.name;

        var domain = this.props.config.domain || [0,100];

        //Render according to chart-type
        switch(visType){
            case "pieChart":
                var c   = dc.pieChart(divId);
                c.width(250)
                .height(190).dimension(self.state.dimension)
                .group(self.state.group)
                .radius(90)
                .renderLabel(true);
                c.filterHandler(function(dimension, filters){
                  if(filters)
                    dimension.filter(filters);
                  else
                    dimension.filter(null);
                  return filters;
                });
                break;
            case "barChart":
                var c = dc.barChart(divId);
                c.width(250)
                    .height(190).dimension(self.state.dimension)
                    .group(self.state.group)
                    .x(d3.scale.linear().domain(domain))
                    .elasticY(true)
                    .elasticX(true)        
                    .renderLabel(true)

                    c.filterHandler(function(dimension, filter){

                        var begin = $("#filterBeg"+dimension.name());
                        var end = $("#filterEnd"+dimension.name());
                        if(filter.length > 0 && filter.length!=2){
                           filter = filter[0]
                        }
                        begin.val(filter[0]);
                        end.val(filter[1]);
                        dimension.filter(filter);
                        return filter;
                    });
                break;
            case "rowChart":
                var c = dc.rowChart(divId);
                c.width(250)
                .height(190)
                .dimension(self.state.dimension)
                .group(self.state.group)
                .renderLabel(true)
                .elasticX(true)
                .margins({top: 10, right: 20, bottom: 20, left: 20});
                c.filterHandler(function(dimension, filters){
                    if(filters)
                        dimension.filter(filters);
                    else
                        dimension.filter(null);
                    return filters;
                })     
        }
    },    

    render: function(){
        var divId = "dc-"+this.props.config.name;
        if(this.props.full == true){
            return (
                React.createElement("div", {className: "col-md-3"}, 
                    React.createElement("div", {className: "chart-wrapper"}, 
                        React.createElement("div", {className: "chart-title"}, 
                          this.props.config.name
                        ), 
                        React.createElement("div", {className: "chart-stage"}, 
                            React.createElement("div", {id: divId}, " ")
                        ), 
                        React.createElement("div", {className: "chart-notes"}, 
                          "Full view"
                        )
                    )
                )
            )
        } else {
            return (
                React.createElement("div", {className: "col-md-12", onClick: this.fullView}, 
                    React.createElement("div", {className: "chart-wrapper"}, 
                        React.createElement("div", {className: "chart-title"}, 
                          this.props.config.name
                        ), 
                        React.createElement("div", {className: "chart-stage"}, 
                            React.createElement("div", {id: divId}, " ")
                        ), 
                        React.createElement("div", {className: "chart-notes"}, 
                          "Additional description here"
                        )
                    )
                )
            );
        }

    }
});
module.exports = FilteringAttribute;
},{"../actions/AppActions.jsx":15}],17:[function(require,module,exports){
var AppActions = require("../actions/AppActions.jsx");

var    Button          = ReactBootstrap.Button;
//Require app components
var FilteringAttribute = require("./FilteringAttribute.jsx");
var InteractiveFilters = React.createClass({displayName: "InteractiveFilters",      
    getInitialState: function(){

        return {full:false};
    },
    fullView: function(){
        if(this.state.full){
            if(this.state.full == false)
                this.setState({full: true});
            else
                this.setState({full: false});

        }else{

            this.setState({full:true});   
        }
    },
    render: function(){
        var filteringAttributes;

        var self = this;
        if(this.props.config){
            filteringAttributes = this.props.config.map(function(filteringAttribute){
                return (
                    React.createElement(FilteringAttribute, {config: filteringAttribute, currData: self.props.currData, full: self.state.full})
                );
            })    
        } else {
            filteringAttribute = React.createElement("div", null)
        }
        if(this.state.full){
            return(
                React.createElement("div", {className: "col-sm-12 fixed", id: "interactiveFiltersPanel"}, 
                    React.createElement("h4", null, " Filtering Attributes"), 
                     React.createElement(Button, {onClick: this.fullView, id: "interactiveFiltersPanelSlider", bsSize: "xsmall"}, " « "), 

                    React.createElement("div", null, filteringAttributes)
                )
            );   

        } else {
            return(
                React.createElement("div", {className: "col-sm-3 fixed", id: "interactiveFiltersPanel"}, 
                    React.createElement("h4", null, " Filtering Attributes"), 
                     React.createElement(Button, {onClick: this.fullView, id: "interactiveFiltersPanelSlider", bsSize: "xsmall"}, " » "), 

                    React.createElement("div", null, filteringAttributes)
                )
            );            
        }

    }
});

module.exports = InteractiveFilters;
},{"../actions/AppActions.jsx":15,"./FilteringAttribute.jsx":16}],18:[function(require,module,exports){
var Visualization = require("./Visualizations/Visualization.jsx")
var TabbedArea      = ReactBootstrap.TabbedArea,
    TabPane         = ReactBootstrap.TabPane;

var Visualizations = React.createClass({displayName: "Visualizations",
    render: function(){
        var self  = this;

        if(this.props.config){

            var count=0;
            var visualizations = this.props.config.map(function(visualization){

                count++;   
                return(
                    React.createElement(TabPane, {tab: visualization.type, eventKey: count}, 
                        React.createElement(Visualization, {config: visualization, currData: self.props.currData})
                    )
                );            
            });

            return(
                React.createElement("div", {id: "visualization", className: "col-sm-9"}, 
                    React.createElement(TabbedArea, {defaultActiveKey: 1}, 
                        visualizations
                    )
                )
            );

        }
        return (
            React.createElement("div", null)
        );
    }
});

module.exports = Visualizations;
},{"./Visualizations/Visualization.jsx":23}],19:[function(require,module,exports){



var BubbleChart = React.createClass({displayName: "BubbleChart",
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering

        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh()
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                        refresh()
                      } else {
                        return;
                      } 
                    }
            },
            filterAll: function() {
                    delete queryFilter[attributeName];
                    refresh();
            },
            name: function(){
                    return attributeName;
            }
       
        };
        var group = {
                all: function() {
                    return filteredData[attributeName].values;
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return filteredData[attributeName].values;
                }
 
        };

        this.setState({dimension: dim, group: group});
    },
    componentDidMount: function(){
        var config = this.props.config;

        var visualAttributes = this.props.config.attributes;
        var xAttr;
        var yAttr;
        var rAttr;
        var colorAttr;
        for (var i=0; i<visualAttributes.length; i++) {
            attribute = visualAttributes[i];

            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }
            if(attribute.type == "r"){
                rAttr = attribute.name;
            }
            if(attribute.type == "color"){
                colorAttr = attribute.name;
            }    
        }
        visBubbleChart = dc.bubbleChart("#vis");

        visBubbleChart.width(900)
            .height(400)
            .dimension(dimensions["visualization"])
            .group(groups["visualization"])
            .maxBubbleRelativeSize(0.4)       
            .margins({top: 50, right: 50, bottom: 30, left: 40})
            .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
            .colorAccessor(function(d){
                return d.value[colorAttr];
            })
            .radiusValueAccessor(function(d){
                return d.value[rAttr]/100000;
            })
            .keyAccessor(function(d){
                return d.value[xAttr];
            })
            .valueAccessor(function(d){
                return d.value[yAttr];
            })
            .x(d3.scale.linear().domain([0, 100]))
            .y(d3.scale.linear().domain([0, 10]))
            .r(d3.scale.linear().domain([0, 10]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
            .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false


        },
    render: function(){
        return(
            React.createElement("div", {id: "vis"}

            )
        )
    }

});

module.exports = BubbleChart;

},{}],20:[function(require,module,exports){

var DataTable = React.createClass({displayName: "DataTable",
    componentDidMount: function(){


        var self = this;



            var columns = [];   
            var count=0;
            for(var i in self.props.config.attributes){
                columns[count] = {};
                //columns[count]["data"] = self.props.config.attributes[i].name;
                columns[count]["title"] = self.props.config.attributes[i].label || self.props.config.attributes[i].name;
                columns[count]["bSearchable"]= false;
                columns[count]["bSortable"] =false ;
                count++;
            }
            dataTable = $('#vis').DataTable({
                bSort: false,
                bFilter: false,
                aoColumns: columns,
               
                "ajax": "dataTable/next",
                "processing": true,
                "serverSide": true,
                "scrollY": 420,
                "scrollX": true,
                 "pageLength": 100,
                columns: columns

            });   
  

    },
    render: function(){
        var tableAttribtes = [];

         
            return(
                React.createElement("table", {id: "vis", className: "display"}

                )
            );
    }
});

module.exports = DataTable;



var BubbleChart = React.createClass({displayName: "BubbleChart",
    componentWillMount: function(){
     //Initialize crossfilter dimensions and groups before rendering

        var attributeName = this.props.config.name;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh()
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                        refresh()
                      } else {
                        return;
                      } 
                    }
            },
            filterAll: function() {
                    delete queryFilter[attributeName];
                    refresh();
            },
            name: function(){
                    return attributeName;
            }
       
        };
        var group = {
                all: function() {
                    return filteredData[attributeName].values;
                },
                order: function() {
                    return groups[attributeName];
                },
                top: function() {
                    return filteredData[attributeName].values;
                }
 
        };

        this.setState({dimension: dim, group: group});
    },
    componentDidMount: function(){
        var config = this.props.config;

        var visualAttributes = this.props.config.attributes;
        var xAttr;
        var yAttr;
        var rAttr;
        var colorAttr;
        for (var i=0; i<visualAttributes.length; i++) {
            attribute = visualAttributes[i];

            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }
            if(attribute.type == "r"){
                rAttr = attribute.name;
            }
            if(attribute.type == "color"){
                colorAttr = attribute.name;
            }    
        }
        visBubbleChart = dc.bubbleChart("#vis");

        visBubbleChart.width(900)
            .height(400)
            .dimension(dimensions["visualization"])
            .group(groups["visualization"])
            .maxBubbleRelativeSize(0.4)       
            .margins({top: 50, right: 50, bottom: 30, left: 40})
            .colors(colorbrewer.RdYlGn[9]) // (optional) define color function or array for bubbles
            .colorAccessor(function(d){
                return d.value[colorAttr];
            })
            .radiusValueAccessor(function(d){
                return d.value[rAttr]/100000;
            })
            .keyAccessor(function(d){
                return d.value[xAttr];
            })
            .valueAccessor(function(d){
                return d.value[yAttr];
            })
            .x(d3.scale.linear().domain([0, 100]))
            .y(d3.scale.linear().domain([0, 10]))
            .r(d3.scale.linear().domain([0, 10]))
            .elasticY(true)
            .elasticX(true)
            .yAxisPadding(100)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true) // (optional) render horizontal grid lines, :default=false
            .renderVerticalGridLines(true) // (optional) render vertical grid lines, :default=false


        },
    render: function(){
        return(
            React.createElement("div", {id: "vis"}

            )
        )
    }

});

},{}],21:[function(require,module,exports){

var HeatMap = React.createClass({displayName: "HeatMap",
    getInitialState: function(){
        return({dimension: null, group: null})
    },
    componentWillMount: function(){



    },

    componentDidMount: function(){
        var self = this;
        var dim = {
            filter: function(f) {
                if(f) {
                        queryFilter[attributeName] = f;
                        refresh();
                } else {
                      if(queryFilter[attributeName]){
                        delete queryFilter[attributeName];
                        refresh()
                      } else {
                        return;
                      } 
                    }
            },
            filterAll: function() {
                    delete queryFilter[attributeName];
                    refresh();
            },
            name: function(){
                    return attributeName;
            }
        };
        var group = {
            all: function() {

                return self.props.currData["heatMapGroup"].values;
                //return filteredData["heatMapGroup"].values;
            },
            order: function() {
                return groups["heatMapGroup"];
            },
            top: function() {

                return self.props.currData["heatMapGroup"].values;
                //return filteredData["heatMapGroup"].values;
            }
        };

        var config = self.props.config.attributes;
        for (var i=0; i<config.length; i++) {

            attribute = config  [i];
            if(attribute.type == "x"){
                xAttr = attribute.name;
            }
            if(attribute.type == "y"){
                yAttr = attribute.name;
            }    
        }       
        console.log(dim) 

        var heat = dc.heatMap("#heatVis");
        heat.width(45 * 20 + 20)
        .height(45 * 5+260 )
        .dimension(dim)
        .group(group)
        .keyAccessor(function(d) { return +d.key[0]; })
        .valueAccessor(function(d) { return +d.key[1]; })
        .colorAccessor(function(d) { return +d.value; })
        .title(function(d) {
            return "AgeatInitialDiagnosis:   " + d.key[0] + "\n" +
                   "KarnofskyScore:  " + d.key[1] + "\n" +
                   "Total: " + ( + d.value);})
        .colors(["#ffffff","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"])
        .calculateColorDomain(); 
        //heat.render()  
        console.log(heat)

    },
    render: function(){

        //console.log(this.props.config);
        return(
            
            React.createElement("div", {id: "heat"}, 
                React.createElement("h2", null, this.props.config.heading), 
                React.createElement("h4", null, this.props.config.subheading), 
                React.createElement("div", {id: "heatVis"})
             )
        );
    }
});

module.exports = HeatMap;
},{}],22:[function(require,module,exports){

var ImageGrid = React.createClass({displayName: "ImageGrid",
    componentDidMount: function(){
        var self = this;
        var $visualization = d3.select("#imageGrid");

        $activeRecords = $visualization.append("div")
            .attr("id", "activeRecords");
            /*
        $activeRecords.append("div")
            .attr("id", "nActive")
            .text(filteredData["imageGrid"]);
        $activeRecords.append("div")
            .attr("id", "nSize")
            .text(" of "+filteredData["imageGrid"]["size"] + " selected")
            */  


        var $grid = $visualization.append("table")
                        .attr("id", "grid");
        var $tbody = $grid.append("tbody");

        //var rawData = filteredData["visualization"];
        var rawData = [];
        //var filteredData = AppStore.getData();
        console.log("grid...")
        console.log(self.props);
        var filteredData = self.props.currData;

        for(var a in filteredData["imageGrid"]){
            var d = filteredData["imageGrid"][a];
            for(var obj in d){
                var o = d[obj];
                var i = o["image"];
                rawData.push(i);
            }
        }
        var gridData = [];
        while(rawData.length){
            gridData.push(rawData.splice(0,8));
        }

        var rows = $tbody.selectAll("tr")
        .data(gridData)
        .enter()
        .append("tr")
        var cells = rows.selectAll("td")
        .style({"width": "40px"})
        .data(function(d) {
            return d3.values(d);
        })
        .enter()
        .append("td")
        .html(function(d) {
            var img = "<img style='border: 1px solid #fff' width='100' src='"+d+"' />"
            return img;
        });

    },
    componentDidUpdate: function(){
        var self = this;
        var $visualization = d3.select("#imageGrid");
        $visualization.html("")
        $activeRecords = $visualization.append("div")
            .attr("id", "activeRecords");
            /*
        $activeRecords.append("div")
            .attr("id", "nActive")
            .text(filteredData["imageGrid"]);
        $activeRecords.append("div")
            .attr("id", "nSize")
            .text(" of "+filteredData["imageGrid"]["size"] + " selected")
            */  


        var $grid = $visualization.append("table")
                        .attr("id", "grid");
        var $tbody = $grid.append("tbody");

        //var rawData = filteredData["visualization"];
        var rawData = [];
        //var filteredData = AppStore.getData();
        console.log("grid...")
        console.log(self.props);
        var filteredData = self.props.currData;

        for(var a in filteredData["imageGrid"]){
            var d = filteredData["imageGrid"][a];
            for(var obj in d){
                var o = d[obj];
                var i = o["image"];
                rawData.push(i);
            }
        }
        var gridData = [];
        while(rawData.length){
            gridData.push(rawData.splice(0,8));
        }

        var rows = $tbody.selectAll("tr")
        .data(gridData)
        .enter()
        .append("tr")
        var cells = rows.selectAll("td")
        .style({"width": "40px"})
        .data(function(d) {
            return d3.values(d);
        })
        .enter()
        .append("td")
        .html(function(d) {
            var img = "<img style='border: 1px solid #fff' width='100' src='"+d+"' />"
            return img;
        });
    },  
    
    render: function(){
        return(
            React.createElement("div", {id: "imageGrid"})
        );
    }
});

module.exports = ImageGrid;

},{}],23:[function(require,module,exports){
var DataTable = require("./DataTable.jsx"),
    HeatMap = require("./HeatMap.jsx"),
    ImageGrid = require("./ImageGrid.jsx");


var Visualization = React.createClass({displayName: "Visualization",
    render: function(){
        var visType = this.props.config.type;
        var self = this;

        switch(visType) {
            case "dataTable":
                return(
                    React.createElement(DataTable, {config: this.props.config, currData: this.props.currData})
                );
                break;
            case "bubbleChart":
                return(
                    React.createElement("div", null)
                );
                break;
            case "heatMap":
                return(
                    React.createElement(HeatMap, {config: this.props.config, currData: this.props.currData})
                );
            case "imageGrid":
                return(
                    React.createElement(ImageGrid, {config: this.props.config, currData: this.props.currData})
                );
            default:
                return(
                    React.createElement("div", null)
                );
        }         
          
    }

});

module.exports=  Visualization;
},{"./DataTable.jsx":20,"./HeatMap.jsx":21,"./ImageGrid.jsx":22}],24:[function(require,module,exports){
var Reflux = require('reflux');

var AppActions = require('../actions/AppActions.jsx');

var _currentData = {};

var AppStore = Reflux.createStore({

	init: function(){
		console.log("sdfasdf");
		this.listenTo(AppActions.refresh, this.onRefresh);
	},
	onRefresh: function(queryFilter){
		console.log("refreshing.....");
		var filteredData = {};
		var that = this;
	    if(JSON.stringify(queryFilter)) {
	        for (var qf in queryFilter) {
	            if(queryFilter[qf].length === 0) {
	                delete queryFilter[qf];
	            }
	        }
	        d3.json("/data?filter="+JSON.stringify(queryFilter), function (d) {
	            filteredData = d;
	            console.log(filteredData);
	            _currentData = filteredData;

	            /*
	            if(dataTable.ajax){  
	                dataTable.ajax.reload(); //jquery datatable fix
	            }
	            */
	            //dc.renderAll(); //refresh dc charts
	            that.trigger(_currentData); //Trigger the event and pass current state of data
		 
	        });
	        } else {
	            
	        }
		//_currentData = filteredData;
		

	},
	getData: function(){
		return _currentData;
	}

});

module.exports = AppStore;
},{"../actions/AppActions.jsx":15,"reflux":9}]},{},[14,15,16,17,18,19,20,21,22,23,24]);
