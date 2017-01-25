require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (process){
(function() {
  'use strict';

  var inNodeJS = false;
  if (typeof process !== 'undefined' && !process.browser) {
    inNodeJS = true;
    var request = require('request'.trim()); //prevents browserify from bundling the module
  }

  var supportsCORS = false;
  var inLegacyIE = false;
  try {
    var testXHR = new XMLHttpRequest();
    if (typeof testXHR.withCredentials !== 'undefined') {
      supportsCORS = true;
    } else {
      if ('XDomainRequest' in window) {
        supportsCORS = true;
        inLegacyIE = true;
      }
    }
  } catch (e) { }

  // Create a simple indexOf function for support
  // of older browsers.  Uses native indexOf if 
  // available.  Code similar to underscores.
  // By making a separate function, instead of adding
  // to the prototype, we will not break bad for loops
  // in older browsers
  var indexOfProto = Array.prototype.indexOf;
  var ttIndexOf = function(array, item) {
    var i = 0, l = array.length;
    
    if (indexOfProto && array.indexOf === indexOfProto) {
      return array.indexOf(item);
    }
    
    for (; i < l; i++) {
      if (array[i] === item) {
        return i;
      }
    }
    return -1;
  };
  
  /*
    Initialize with Tabletop.init( { key: '0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc' } )
      OR!
    Initialize with Tabletop.init( { key: 'https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&key=0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc&output=html&widget=true' } )
      OR!
    Initialize with Tabletop.init('0AjAPaAU9MeLFdHUxTlJiVVRYNGRJQnRmSnQwTlpoUXc')
  */

  var Tabletop = function(options) {
    // Make sure Tabletop is being used as a constructor no matter what.
    if(!this || !(this instanceof Tabletop)) {
      return new Tabletop(options);
    }
    
    if(typeof(options) === 'string') {
      options = { key : options };
    }

    this.callback = options.callback;
    this.wanted = options.wanted || [];
    this.key = options.key;
    this.simpleSheet = !!options.simpleSheet;
    this.parseNumbers = !!options.parseNumbers;
    this.wait = !!options.wait;
    this.reverse = !!options.reverse;
    this.postProcess = options.postProcess;
    this.debug = !!options.debug;
    this.query = options.query || '';
    this.orderby = options.orderby;
    this.endpoint = options.endpoint || 'https://spreadsheets.google.com';
    this.singleton = !!options.singleton;
    this.simpleUrl = !!(options.simpleUrl || options.simple_url); //jshint ignore:line
    this.callbackContext = options.callbackContext;
    // Default to on, unless there's a proxy, in which case it's default off
    this.prettyColumnNames = typeof(options.prettyColumnNames) === 'undefined' ? !options.proxy : options.prettyColumnNames;
    
    if(typeof(options.proxy) !== 'undefined') {
      // Remove trailing slash, it will break the app
      this.endpoint = options.proxy.replace(/\/$/,'');
      this.simpleUrl = true;
      this.singleton = true;
      // Let's only use CORS (straight JSON request) when
      // fetching straight from Google
      supportsCORS = false;
    }
    
    this.parameterize = options.parameterize || false;
    
    if (this.singleton) {
      if (typeof(Tabletop.singleton) !== 'undefined') {
        this.log('WARNING! Tabletop singleton already defined');
      }
      Tabletop.singleton = this;
    }
    
    /* Be friendly about what you accept */
    if (/key=/.test(this.key)) {
      this.log('You passed an old Google Docs url as the key! Attempting to parse.');
      this.key = this.key.match('key=(.*?)(&|#|$)')[1];
    }

    if (/pubhtml/.test(this.key)) {
      this.log('You passed a new Google Spreadsheets url as the key! Attempting to parse.');
      this.key = this.key.match('d\\/(.*?)\\/pubhtml')[1];
    }
    
    if(/spreadsheets\/d/.test(this.key)) {
      this.log('You passed the most recent version of Google Spreadsheets url as the key! Attempting to parse.');
      this.key = this.key.match('d\\/(.*?)\/')[1];
    }

    if (!this.key) {
      this.log('You need to pass Tabletop a key!');
      return;
    }

    this.log('Initializing with key ' + this.key);

    this.models = {};
    this.modelNames = [];
    this.model_names = this.modelNames; //jshint ignore:line

    this.baseJsonPath = '/feeds/worksheets/' + this.key + '/public/basic?alt=';

    if (inNodeJS || supportsCORS) {
      this.baseJsonPath += 'json';
    } else {
      this.baseJsonPath += 'json-in-script';
    }
    
    if(!this.wait) {
      this.fetch();
    }
  };

  // A global storage for callbacks.
  Tabletop.callbacks = {};

  // Backwards compatibility.
  Tabletop.init = function(options) {
    return new Tabletop(options);
  };

  Tabletop.sheets = function() {
    this.log('Times have changed! You\'ll want to use var tabletop = Tabletop.init(...); tabletop.sheets(...); instead of Tabletop.sheets(...)');
  };

  Tabletop.prototype = {

    fetch: function(callback) {
      if (typeof(callback) !== 'undefined') {
        this.callback = callback;
      }
      this.requestData(this.baseJsonPath, this.loadSheets);
    },
    
    /*
      This will call the environment appropriate request method.
      
      In browser it will use JSON-P, in node it will use request()
    */
    requestData: function(path, callback) {
      this.log('Requesting', path);

      if (inNodeJS) {
        this.serverSideFetch(path, callback);
      } else {
        //CORS only works in IE8/9 across the same protocol
        //You must have your server on HTTPS to talk to Google, or it'll fall back on injection
        var protocol = this.endpoint.split('//').shift() || 'http';
        if (supportsCORS && (!inLegacyIE || protocol === location.protocol)) {
          this.xhrFetch(path, callback);
        } else {
          this.injectScript(path, callback);
        }
      }
    },

    /*
      Use Cross-Origin XMLHttpRequest to get the data in browsers that support it.
    */
    xhrFetch: function(path, callback) {
      //support IE8's separate cross-domain object
      var xhr = inLegacyIE ? new XDomainRequest() : new XMLHttpRequest();
      xhr.open('GET', this.endpoint + path);
      var self = this;
      xhr.onload = function() {
        var json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch (e) {
          console.error(e);
        }
        callback.call(self, json);
      };
      xhr.send();
    },
    
    /*
      Insert the URL into the page as a script tag. Once it's loaded the spreadsheet data
      it triggers the callback. This helps you avoid cross-domain errors
      http://code.google.com/apis/gdata/samples/spreadsheet_sample.html

      Let's be plain-Jane and not use jQuery or anything.
    */
    injectScript: function(path, callback) {
      var script = document.createElement('script');
      var callbackName;
      
      if (this.singleton) {
        if (callback === this.loadSheets) {
          callbackName = 'Tabletop.singleton.loadSheets';
        } else if (callback === this.loadSheet) {
          callbackName = 'Tabletop.singleton.loadSheet';
        }
      } else {
        var self = this;
        callbackName = 'tt' + (+new Date()) + (Math.floor(Math.random()*100000));
        // Create a temp callback which will get removed once it has executed,
        // this allows multiple instances of Tabletop to coexist.
        Tabletop.callbacks[ callbackName ] = function () {
          var args = Array.prototype.slice.call( arguments, 0 );
          callback.apply(self, args);
          script.parentNode.removeChild(script);
          delete Tabletop.callbacks[callbackName];
        };
        callbackName = 'Tabletop.callbacks.' + callbackName;
      }
      
      var url = path + '&callback=' + callbackName;
      
      if (this.simpleUrl) {
        // We've gone down a rabbit hole of passing injectScript the path, so let's
        // just pull the sheet_id out of the path like the least efficient worker bees
        if(path.indexOf('/list/') !== -1) {
          script.src = this.endpoint + '/' + this.key + '-' + path.split('/')[4];
        } else {
          script.src = this.endpoint + '/' + this.key;
        }
      } else {
        script.src = this.endpoint + url;
      }
      
      if (this.parameterize) {
        script.src = this.parameterize + encodeURIComponent(script.src);
      }

      this.log('Injecting', script.src);

      document.getElementsByTagName('script')[0].parentNode.appendChild(script);
    },
    
    /* 
      This will only run if tabletop is being run in node.js
    */
    serverSideFetch: function(path, callback) {
      var self = this;

      this.log('Fetching', this.endpoint + path);
      request({url: this.endpoint + path, json: true}, function(err, resp, body) {
        if (err) {
          return console.error(err);
        }
        callback.call(self, body);
      });
    },

    /* 
      Is this a sheet you want to pull?
      If { wanted: ["Sheet1"] } has been specified, only Sheet1 is imported
      Pulls all sheets if none are specified
    */
    isWanted: function(sheetName) {
      if (this.wanted.length === 0) {
        return true;
      } else {
        return (ttIndexOf(this.wanted, sheetName) !== -1);
      }
    },
    
    /*
      What gets send to the callback
      if simpleSheet === true, then don't return an array of Tabletop.this.models,
      only return the first one's elements
    */
    data: function() {
      // If the instance is being queried before the data's been fetched
      // then return undefined.
      if (this.modelNames.length === 0) {
        return undefined;
      }
      if (this.simpleSheet) {
        if (this.modelNames.length > 1 && this.debug) {
          this.log('WARNING You have more than one sheet but are using simple sheet mode! Don\'t blame me when something goes wrong.');
        }
        return this.models[this.modelNames[0]].all();
      } else {
        return this.models;
      }
    },

    /*
      Add another sheet to the wanted list
    */
    addWanted: function(sheet) {
      if(ttIndexOf(this.wanted, sheet) === -1) {
        this.wanted.push(sheet);
      }
    },
    
    /*
      Load all worksheets of the spreadsheet, turning each into a Tabletop Model.
      Need to use injectScript because the worksheet view that you're working from
      doesn't actually include the data. The list-based feed (/feeds/list/key..) does, though.
      Calls back to loadSheet in order to get the real work done.

      Used as a callback for the worksheet-based JSON
    */
    loadSheets: function(data) {
      var i, ilen;
      var toLoad = [];
      this.googleSheetName = data.feed.title.$t;
      this.foundSheetNames = [];

      for (i = 0, ilen = data.feed.entry.length; i < ilen ; i++) {
        this.foundSheetNames.push(data.feed.entry[i].title.$t);
        // Only pull in desired sheets to reduce loading
        if (this.isWanted(data.feed.entry[i].content.$t)) {
          var linkIdx = data.feed.entry[i].link.length-1;
          var sheetId = data.feed.entry[i].link[linkIdx].href.split('/').pop();
          var jsonPath = '/feeds/list/' + this.key + '/' + sheetId + '/public/values?alt=';
          if (inNodeJS || supportsCORS) {
            jsonPath += 'json';
          } else {
            jsonPath += 'json-in-script';
          }
          if (this.query) {
            // Query Language Reference (0.7)
            jsonPath += '&tq=' + this.query;
          }
          if (this.orderby) {
            jsonPath += '&orderby=column:' + this.orderby.toLowerCase();
          }
          if (this.reverse) {
            jsonPath += '&reverse=true';
          }
          toLoad.push(jsonPath);
        }
      }

      this.sheetsToLoad = toLoad.length;
      for(i = 0, ilen = toLoad.length; i < ilen; i++) {
        this.requestData(toLoad[i], this.loadSheet);
      }
    },

    /*
      Access layer for the this.models
      .sheets() gets you all of the sheets
      .sheets('Sheet1') gets you the sheet named Sheet1
    */
    sheets: function(sheetName) {
      if (typeof sheetName === 'undefined') {
        return this.models;
      } else {
        if (typeof(this.models[sheetName]) === 'undefined') {
          // alert( "Can't find " + sheetName );
          return;
        } else {
          return this.models[sheetName];
        }
      }
    },

    sheetReady: function(model) {
      this.models[model.name] = model;
      if (ttIndexOf(this.modelNames, model.name) === -1) {
        this.modelNames.push(model.name);
      }
      
      this.sheetsToLoad--;
      if (this.sheetsToLoad === 0) {
        this.doCallback();
      }
    },
    
    /*
      Parse a single list-based worksheet, turning it into a Tabletop Model

      Used as a callback for the list-based JSON
    */
    loadSheet: function(data) {
      var that = this;
      new Tabletop.Model({ 
        data: data, 
        parseNumbers: this.parseNumbers,
        postProcess: this.postProcess,
        tabletop: this,
        prettyColumnNames: this.prettyColumnNames,
        onReady: function() {
          that.sheetReady(this);
        } 
      });
    },

    /*
      Execute the callback upon loading! Rely on this.data() because you might
        only request certain pieces of data (i.e. simpleSheet mode)
      Tests this.sheetsToLoad just in case a race condition happens to show up
    */
    doCallback: function() {
      if(this.sheetsToLoad === 0) {
        this.callback.apply(this.callbackContext || this, [this.data(), this]);
      }
    },

    log: function() {
      if(this.debug) {
        if(typeof console !== 'undefined' && typeof console.log !== 'undefined') {
          Function.prototype.apply.apply(console.log, [console, arguments]);
        }
      }
    }

  };

  /*
    Tabletop.Model stores the attribute names and parses the worksheet data
      to turn it into something worthwhile

    Options should be in the format { data: XXX }, with XXX being the list-based worksheet
  */
  Tabletop.Model = function(options) {
    var i, j, ilen, jlen;
    this.columnNames = [];
    this.column_names = this.columnNames; // jshint ignore:line
    this.name = options.data.feed.title.$t;
    this.tabletop = options.tabletop;
    this.elements = [];
    this.onReady = options.onReady;
    this.raw = options.data; // A copy of the sheet's raw data, for accessing minutiae

    if (typeof(options.data.feed.entry) === 'undefined') {
      options.tabletop.log('Missing data for ' + this.name + ', make sure you didn\'t forget column headers');
      this.originalColumns = [];
      this.elements = [];
      this.onReady.call(this);
      return;
    }
    
    for (var key in options.data.feed.entry[0]){
      if (/^gsx/.test(key)) {
        this.columnNames.push(key.replace('gsx$',''));
      }
    }

    this.originalColumns = this.columnNames;
    this.original_columns = this.originalColumns; // jshint ignore:line
    
    for (i = 0, ilen =  options.data.feed.entry.length ; i < ilen; i++) {
      var source = options.data.feed.entry[i];
      var element = {};
      for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
        var cell = source['gsx$' + this.columnNames[j]];
        if (typeof(cell) !== 'undefined') {
          if (options.parseNumbers && cell.$t !== '' && !isNaN(cell.$t)) {
            element[this.columnNames[j]] = +cell.$t;
          } else {
            element[this.columnNames[j]] = cell.$t;
          }
        } else {
          element[this.columnNames[j]] = '';
        }
      }
      if (element.rowNumber === undefined) {
        element.rowNumber = i + 1;
      }
        
      if (options.postProcess) {
        options.postProcess(element);
      }
        
      this.elements.push(element);
    }
    
    if (options.prettyColumnNames) {
      this.fetchPrettyColumns();
    } else {
      this.onReady.call(this);
    }
  };

  Tabletop.Model.prototype = {
    /*
      Returns all of the elements (rows) of the worksheet as objects
    */
    all: function() {
      return this.elements;
    },
    
    fetchPrettyColumns: function() {
      if (!this.raw.feed.link[3]) {
        return this.ready();
      }
        
      var cellurl = this.raw.feed.link[3].href.replace('/feeds/list/', '/feeds/cells/').replace('https://spreadsheets.google.com', '');
      var that = this;
      this.tabletop.requestData(cellurl, function(data) {
        that.loadPrettyColumns(data);
      });
    },
    
    ready: function() {
      this.onReady.call(this);
    },
    
    /*
     * Store column names as an object
     * with keys of Google-formatted "columnName"
     * and values of human-readable "Column name"
     */
    loadPrettyColumns: function(data) {
      var prettyColumns = {};

      var columnNames = this.columnNames;

      var i = 0;
      var l = columnNames.length;

      for (; i < l; i++) {
        if (typeof data.feed.entry[i].content.$t !== 'undefined') {
          prettyColumns[columnNames[i]] = data.feed.entry[i].content.$t;
        } else {
          prettyColumns[columnNames[i]] = columnNames[i];
        }
      }

      this.prettyColumns = prettyColumns;
      this.pretty_columns = this.prettyColumns; // jshint ignore:line
      this.prettifyElements();
      this.ready();
    },
    
    /*
     * Go through each row, substitutiting
     * Google-formatted "columnName"
     * with human-readable "Column name"
     */
    prettifyElements: function() {
      var prettyElements = [],
          orderedPrettyNames = [],
          i, j, ilen, jlen;

      for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
        orderedPrettyNames.push(this.prettyColumns[this.columnNames[j]]);
      }

      for (i = 0, ilen = this.elements.length; i < ilen; i++) {
        var newElement = {};
        for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
          var newColumnName = this.prettyColumns[this.columnNames[j]];
          newElement[newColumnName] = this.elements[i][this.columnNames[j]];
        }
        prettyElements.push(newElement);
      }
      this.elements = prettyElements;
      this.columnNames = orderedPrettyNames;
    },

    /*
      Return the elements as an array of arrays, instead of an array of objects
    */
    toArray: function() {
      var array = [],
          i, j, ilen, jlen;
      for (i = 0, ilen = this.elements.length; i < ilen; i++) {
        var row = [];
        for (j = 0, jlen = this.columnNames.length; j < jlen ; j++) {
          row.push(this.elements[i][ this.columnNames[j]]);
        }
        array.push(row);
      }
      
      return array;
    }
  };

  if(typeof module !== 'undefined' && module.exports) { //don't just use inNodeJS, we may be in Browserify
    module.exports = Tabletop;
  } else if (typeof define === 'function' && define.amd) {
    define(function () {
      return Tabletop;
    });
  } else {
    window.Tabletop = Tabletop;
  }

})();
}).call(this,require('_process'))

},{"_process":1}],"npm":[function(require,module,exports){
exports.Tabletop = require('tabletop');


},{"tabletop":2}],"sheet":[function(require,module,exports){
var Tabletop;

Tabletop = require('npm').Tabletop;

exports.Sheet = (function() {
  function Sheet(options) {
    this._key = options.key;
    this.get = (function(_this) {
      return function(callback) {
        return Tabletop.init({
          key: _this._key,
          simpleSheet: true,
          callback: function(data, sheet) {
            return callback(data, sheet);
          }
        });
      };
    })(this);
  }

  return Sheet;

})();


},{"npm":"npm"}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvc2hlZXQuY29mZmVlIiwiLi4vbW9kdWxlcy9ucG0uY29mZmVlIiwiLi4vbm9kZV9tb2R1bGVzL3RhYmxldG9wL3NyYy90YWJsZXRvcC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInsgVGFibGV0b3AgfSA9IHJlcXVpcmUgJ25wbSdcblxuXG5jbGFzcyBleHBvcnRzLlNoZWV0XG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucykgLT5cbiAgICBAX2tleSA9IG9wdGlvbnMua2V5XG5cbiAgICBAZ2V0ID0gKGNhbGxiYWNrKSA9PlxuICAgICAgVGFibGV0b3AuaW5pdCB7XG4gICAgICAgIGtleTogQF9rZXlcbiAgICAgICAgc2ltcGxlU2hlZXQ6IHRydWVcbiAgICAgICAgY2FsbGJhY2s6IChkYXRhLCBzaGVldCkgPT5cbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZGF0YSwgc2hlZXQpXG4gICAgICB9XG4iLCJleHBvcnRzLlRhYmxldG9wID0gcmVxdWlyZSAndGFibGV0b3AnXG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgaW5Ob2RlSlMgPSBmYWxzZTtcbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAhcHJvY2Vzcy5icm93c2VyKSB7XG4gICAgaW5Ob2RlSlMgPSB0cnVlO1xuICAgIHZhciByZXF1ZXN0ID0gcmVxdWlyZSgncmVxdWVzdCcudHJpbSgpKTsgLy9wcmV2ZW50cyBicm93c2VyaWZ5IGZyb20gYnVuZGxpbmcgdGhlIG1vZHVsZVxuICB9XG5cbiAgdmFyIHN1cHBvcnRzQ09SUyA9IGZhbHNlO1xuICB2YXIgaW5MZWdhY3lJRSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciB0ZXN0WEhSID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgaWYgKHR5cGVvZiB0ZXN0WEhSLndpdGhDcmVkZW50aWFscyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHN1cHBvcnRzQ09SUyA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgnWERvbWFpblJlcXVlc3QnIGluIHdpbmRvdykge1xuICAgICAgICBzdXBwb3J0c0NPUlMgPSB0cnVlO1xuICAgICAgICBpbkxlZ2FjeUlFID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGUpIHsgfVxuXG4gIC8vIENyZWF0ZSBhIHNpbXBsZSBpbmRleE9mIGZ1bmN0aW9uIGZvciBzdXBwb3J0XG4gIC8vIG9mIG9sZGVyIGJyb3dzZXJzLiAgVXNlcyBuYXRpdmUgaW5kZXhPZiBpZiBcbiAgLy8gYXZhaWxhYmxlLiAgQ29kZSBzaW1pbGFyIHRvIHVuZGVyc2NvcmVzLlxuICAvLyBCeSBtYWtpbmcgYSBzZXBhcmF0ZSBmdW5jdGlvbiwgaW5zdGVhZCBvZiBhZGRpbmdcbiAgLy8gdG8gdGhlIHByb3RvdHlwZSwgd2Ugd2lsbCBub3QgYnJlYWsgYmFkIGZvciBsb29wc1xuICAvLyBpbiBvbGRlciBicm93c2Vyc1xuICB2YXIgaW5kZXhPZlByb3RvID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2Y7XG4gIHZhciB0dEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSkge1xuICAgIHZhciBpID0gMCwgbCA9IGFycmF5Lmxlbmd0aDtcbiAgICBcbiAgICBpZiAoaW5kZXhPZlByb3RvICYmIGFycmF5LmluZGV4T2YgPT09IGluZGV4T2ZQcm90bykge1xuICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSk7XG4gICAgfVxuICAgIFxuICAgIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbiAgfTtcbiAgXG4gIC8qXG4gICAgSW5pdGlhbGl6ZSB3aXRoIFRhYmxldG9wLmluaXQoIHsga2V5OiAnMEFqQVBhQVU5TWVMRmRIVXhUbEppVlZSWU5HUkpRblJtU25Rd1RscG9VWGMnIH0gKVxuICAgICAgT1IhXG4gICAgSW5pdGlhbGl6ZSB3aXRoIFRhYmxldG9wLmluaXQoIHsga2V5OiAnaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXQvcHViP2hsPWVuX1VTJmhsPWVuX1VTJmtleT0wQWpBUGFBVTlNZUxGZEhVeFRsSmlWVlJZTkdSSlFuUm1TblF3VGxwb1VYYyZvdXRwdXQ9aHRtbCZ3aWRnZXQ9dHJ1ZScgfSApXG4gICAgICBPUiFcbiAgICBJbml0aWFsaXplIHdpdGggVGFibGV0b3AuaW5pdCgnMEFqQVBhQVU5TWVMRmRIVXhUbEppVlZSWU5HUkpRblJtU25Rd1RscG9VWGMnKVxuICAqL1xuXG4gIHZhciBUYWJsZXRvcCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAvLyBNYWtlIHN1cmUgVGFibGV0b3AgaXMgYmVpbmcgdXNlZCBhcyBhIGNvbnN0cnVjdG9yIG5vIG1hdHRlciB3aGF0LlxuICAgIGlmKCF0aGlzIHx8ICEodGhpcyBpbnN0YW5jZW9mIFRhYmxldG9wKSkge1xuICAgICAgcmV0dXJuIG5ldyBUYWJsZXRvcChvcHRpb25zKTtcbiAgICB9XG4gICAgXG4gICAgaWYodHlwZW9mKG9wdGlvbnMpID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsga2V5IDogb3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHRoaXMuY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuICAgIHRoaXMud2FudGVkID0gb3B0aW9ucy53YW50ZWQgfHwgW107XG4gICAgdGhpcy5rZXkgPSBvcHRpb25zLmtleTtcbiAgICB0aGlzLnNpbXBsZVNoZWV0ID0gISFvcHRpb25zLnNpbXBsZVNoZWV0O1xuICAgIHRoaXMucGFyc2VOdW1iZXJzID0gISFvcHRpb25zLnBhcnNlTnVtYmVycztcbiAgICB0aGlzLndhaXQgPSAhIW9wdGlvbnMud2FpdDtcbiAgICB0aGlzLnJldmVyc2UgPSAhIW9wdGlvbnMucmV2ZXJzZTtcbiAgICB0aGlzLnBvc3RQcm9jZXNzID0gb3B0aW9ucy5wb3N0UHJvY2VzcztcbiAgICB0aGlzLmRlYnVnID0gISFvcHRpb25zLmRlYnVnO1xuICAgIHRoaXMucXVlcnkgPSBvcHRpb25zLnF1ZXJ5IHx8ICcnO1xuICAgIHRoaXMub3JkZXJieSA9IG9wdGlvbnMub3JkZXJieTtcbiAgICB0aGlzLmVuZHBvaW50ID0gb3B0aW9ucy5lbmRwb2ludCB8fCAnaHR0cHM6Ly9zcHJlYWRzaGVldHMuZ29vZ2xlLmNvbSc7XG4gICAgdGhpcy5zaW5nbGV0b24gPSAhIW9wdGlvbnMuc2luZ2xldG9uO1xuICAgIHRoaXMuc2ltcGxlVXJsID0gISEob3B0aW9ucy5zaW1wbGVVcmwgfHwgb3B0aW9ucy5zaW1wbGVfdXJsKTsgLy9qc2hpbnQgaWdub3JlOmxpbmVcbiAgICB0aGlzLmNhbGxiYWNrQ29udGV4dCA9IG9wdGlvbnMuY2FsbGJhY2tDb250ZXh0O1xuICAgIC8vIERlZmF1bHQgdG8gb24sIHVubGVzcyB0aGVyZSdzIGEgcHJveHksIGluIHdoaWNoIGNhc2UgaXQncyBkZWZhdWx0IG9mZlxuICAgIHRoaXMucHJldHR5Q29sdW1uTmFtZXMgPSB0eXBlb2Yob3B0aW9ucy5wcmV0dHlDb2x1bW5OYW1lcykgPT09ICd1bmRlZmluZWQnID8gIW9wdGlvbnMucHJveHkgOiBvcHRpb25zLnByZXR0eUNvbHVtbk5hbWVzO1xuICAgIFxuICAgIGlmKHR5cGVvZihvcHRpb25zLnByb3h5KSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBzbGFzaCwgaXQgd2lsbCBicmVhayB0aGUgYXBwXG4gICAgICB0aGlzLmVuZHBvaW50ID0gb3B0aW9ucy5wcm94eS5yZXBsYWNlKC9cXC8kLywnJyk7XG4gICAgICB0aGlzLnNpbXBsZVVybCA9IHRydWU7XG4gICAgICB0aGlzLnNpbmdsZXRvbiA9IHRydWU7XG4gICAgICAvLyBMZXQncyBvbmx5IHVzZSBDT1JTIChzdHJhaWdodCBKU09OIHJlcXVlc3QpIHdoZW5cbiAgICAgIC8vIGZldGNoaW5nIHN0cmFpZ2h0IGZyb20gR29vZ2xlXG4gICAgICBzdXBwb3J0c0NPUlMgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJpemUgPSBvcHRpb25zLnBhcmFtZXRlcml6ZSB8fCBmYWxzZTtcbiAgICBcbiAgICBpZiAodGhpcy5zaW5nbGV0b24pIHtcbiAgICAgIGlmICh0eXBlb2YoVGFibGV0b3Auc2luZ2xldG9uKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhpcy5sb2coJ1dBUk5JTkchIFRhYmxldG9wIHNpbmdsZXRvbiBhbHJlYWR5IGRlZmluZWQnKTtcbiAgICAgIH1cbiAgICAgIFRhYmxldG9wLnNpbmdsZXRvbiA9IHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qIEJlIGZyaWVuZGx5IGFib3V0IHdoYXQgeW91IGFjY2VwdCAqL1xuICAgIGlmICgva2V5PS8udGVzdCh0aGlzLmtleSkpIHtcbiAgICAgIHRoaXMubG9nKCdZb3UgcGFzc2VkIGFuIG9sZCBHb29nbGUgRG9jcyB1cmwgYXMgdGhlIGtleSEgQXR0ZW1wdGluZyB0byBwYXJzZS4nKTtcbiAgICAgIHRoaXMua2V5ID0gdGhpcy5rZXkubWF0Y2goJ2tleT0oLio/KSgmfCN8JCknKVsxXTtcbiAgICB9XG5cbiAgICBpZiAoL3B1Ymh0bWwvLnRlc3QodGhpcy5rZXkpKSB7XG4gICAgICB0aGlzLmxvZygnWW91IHBhc3NlZCBhIG5ldyBHb29nbGUgU3ByZWFkc2hlZXRzIHVybCBhcyB0aGUga2V5ISBBdHRlbXB0aW5nIHRvIHBhcnNlLicpO1xuICAgICAgdGhpcy5rZXkgPSB0aGlzLmtleS5tYXRjaCgnZFxcXFwvKC4qPylcXFxcL3B1Ymh0bWwnKVsxXTtcbiAgICB9XG4gICAgXG4gICAgaWYoL3NwcmVhZHNoZWV0c1xcL2QvLnRlc3QodGhpcy5rZXkpKSB7XG4gICAgICB0aGlzLmxvZygnWW91IHBhc3NlZCB0aGUgbW9zdCByZWNlbnQgdmVyc2lvbiBvZiBHb29nbGUgU3ByZWFkc2hlZXRzIHVybCBhcyB0aGUga2V5ISBBdHRlbXB0aW5nIHRvIHBhcnNlLicpO1xuICAgICAgdGhpcy5rZXkgPSB0aGlzLmtleS5tYXRjaCgnZFxcXFwvKC4qPylcXC8nKVsxXTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMua2V5KSB7XG4gICAgICB0aGlzLmxvZygnWW91IG5lZWQgdG8gcGFzcyBUYWJsZXRvcCBhIGtleSEnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmxvZygnSW5pdGlhbGl6aW5nIHdpdGgga2V5ICcgKyB0aGlzLmtleSk7XG5cbiAgICB0aGlzLm1vZGVscyA9IHt9O1xuICAgIHRoaXMubW9kZWxOYW1lcyA9IFtdO1xuICAgIHRoaXMubW9kZWxfbmFtZXMgPSB0aGlzLm1vZGVsTmFtZXM7IC8vanNoaW50IGlnbm9yZTpsaW5lXG5cbiAgICB0aGlzLmJhc2VKc29uUGF0aCA9ICcvZmVlZHMvd29ya3NoZWV0cy8nICsgdGhpcy5rZXkgKyAnL3B1YmxpYy9iYXNpYz9hbHQ9JztcblxuICAgIGlmIChpbk5vZGVKUyB8fCBzdXBwb3J0c0NPUlMpIHtcbiAgICAgIHRoaXMuYmFzZUpzb25QYXRoICs9ICdqc29uJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNlSnNvblBhdGggKz0gJ2pzb24taW4tc2NyaXB0JztcbiAgICB9XG4gICAgXG4gICAgaWYoIXRoaXMud2FpdCkge1xuICAgICAgdGhpcy5mZXRjaCgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBBIGdsb2JhbCBzdG9yYWdlIGZvciBjYWxsYmFja3MuXG4gIFRhYmxldG9wLmNhbGxiYWNrcyA9IHt9O1xuXG4gIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBUYWJsZXRvcC5pbml0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgVGFibGV0b3Aob3B0aW9ucyk7XG4gIH07XG5cbiAgVGFibGV0b3Auc2hlZXRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2coJ1RpbWVzIGhhdmUgY2hhbmdlZCEgWW91XFwnbGwgd2FudCB0byB1c2UgdmFyIHRhYmxldG9wID0gVGFibGV0b3AuaW5pdCguLi4pOyB0YWJsZXRvcC5zaGVldHMoLi4uKTsgaW5zdGVhZCBvZiBUYWJsZXRvcC5zaGVldHMoLi4uKScpO1xuICB9O1xuXG4gIFRhYmxldG9wLnByb3RvdHlwZSA9IHtcblxuICAgIGZldGNoOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgaWYgKHR5cGVvZihjYWxsYmFjaykgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgIH1cbiAgICAgIHRoaXMucmVxdWVzdERhdGEodGhpcy5iYXNlSnNvblBhdGgsIHRoaXMubG9hZFNoZWV0cyk7XG4gICAgfSxcbiAgICBcbiAgICAvKlxuICAgICAgVGhpcyB3aWxsIGNhbGwgdGhlIGVudmlyb25tZW50IGFwcHJvcHJpYXRlIHJlcXVlc3QgbWV0aG9kLlxuICAgICAgXG4gICAgICBJbiBicm93c2VyIGl0IHdpbGwgdXNlIEpTT04tUCwgaW4gbm9kZSBpdCB3aWxsIHVzZSByZXF1ZXN0KClcbiAgICAqL1xuICAgIHJlcXVlc3REYXRhOiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5sb2coJ1JlcXVlc3RpbmcnLCBwYXRoKTtcblxuICAgICAgaWYgKGluTm9kZUpTKSB7XG4gICAgICAgIHRoaXMuc2VydmVyU2lkZUZldGNoKHBhdGgsIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vQ09SUyBvbmx5IHdvcmtzIGluIElFOC85IGFjcm9zcyB0aGUgc2FtZSBwcm90b2NvbFxuICAgICAgICAvL1lvdSBtdXN0IGhhdmUgeW91ciBzZXJ2ZXIgb24gSFRUUFMgdG8gdGFsayB0byBHb29nbGUsIG9yIGl0J2xsIGZhbGwgYmFjayBvbiBpbmplY3Rpb25cbiAgICAgICAgdmFyIHByb3RvY29sID0gdGhpcy5lbmRwb2ludC5zcGxpdCgnLy8nKS5zaGlmdCgpIHx8ICdodHRwJztcbiAgICAgICAgaWYgKHN1cHBvcnRzQ09SUyAmJiAoIWluTGVnYWN5SUUgfHwgcHJvdG9jb2wgPT09IGxvY2F0aW9uLnByb3RvY29sKSkge1xuICAgICAgICAgIHRoaXMueGhyRmV0Y2gocGF0aCwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuaW5qZWN0U2NyaXB0KHBhdGgsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKlxuICAgICAgVXNlIENyb3NzLU9yaWdpbiBYTUxIdHRwUmVxdWVzdCB0byBnZXQgdGhlIGRhdGEgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGl0LlxuICAgICovXG4gICAgeGhyRmV0Y2g6IGZ1bmN0aW9uKHBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICAvL3N1cHBvcnQgSUU4J3Mgc2VwYXJhdGUgY3Jvc3MtZG9tYWluIG9iamVjdFxuICAgICAgdmFyIHhociA9IGluTGVnYWN5SUUgPyBuZXcgWERvbWFpblJlcXVlc3QoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHRoaXMuZW5kcG9pbnQgKyBwYXRoKTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGpzb247XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAganNvbiA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwganNvbik7XG4gICAgICB9O1xuICAgICAgeGhyLnNlbmQoKTtcbiAgICB9LFxuICAgIFxuICAgIC8qXG4gICAgICBJbnNlcnQgdGhlIFVSTCBpbnRvIHRoZSBwYWdlIGFzIGEgc2NyaXB0IHRhZy4gT25jZSBpdCdzIGxvYWRlZCB0aGUgc3ByZWFkc2hlZXQgZGF0YVxuICAgICAgaXQgdHJpZ2dlcnMgdGhlIGNhbGxiYWNrLiBUaGlzIGhlbHBzIHlvdSBhdm9pZCBjcm9zcy1kb21haW4gZXJyb3JzXG4gICAgICBodHRwOi8vY29kZS5nb29nbGUuY29tL2FwaXMvZ2RhdGEvc2FtcGxlcy9zcHJlYWRzaGVldF9zYW1wbGUuaHRtbFxuXG4gICAgICBMZXQncyBiZSBwbGFpbi1KYW5lIGFuZCBub3QgdXNlIGpRdWVyeSBvciBhbnl0aGluZy5cbiAgICAqL1xuICAgIGluamVjdFNjcmlwdDogZnVuY3Rpb24ocGF0aCwgY2FsbGJhY2spIHtcbiAgICAgIHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgIHZhciBjYWxsYmFja05hbWU7XG4gICAgICBcbiAgICAgIGlmICh0aGlzLnNpbmdsZXRvbikge1xuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHRoaXMubG9hZFNoZWV0cykge1xuICAgICAgICAgIGNhbGxiYWNrTmFtZSA9ICdUYWJsZXRvcC5zaW5nbGV0b24ubG9hZFNoZWV0cyc7XG4gICAgICAgIH0gZWxzZSBpZiAoY2FsbGJhY2sgPT09IHRoaXMubG9hZFNoZWV0KSB7XG4gICAgICAgICAgY2FsbGJhY2tOYW1lID0gJ1RhYmxldG9wLnNpbmdsZXRvbi5sb2FkU2hlZXQnO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGNhbGxiYWNrTmFtZSA9ICd0dCcgKyAoK25ldyBEYXRlKCkpICsgKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMDAwMDApKTtcbiAgICAgICAgLy8gQ3JlYXRlIGEgdGVtcCBjYWxsYmFjayB3aGljaCB3aWxsIGdldCByZW1vdmVkIG9uY2UgaXQgaGFzIGV4ZWN1dGVkLFxuICAgICAgICAvLyB0aGlzIGFsbG93cyBtdWx0aXBsZSBpbnN0YW5jZXMgb2YgVGFibGV0b3AgdG8gY29leGlzdC5cbiAgICAgICAgVGFibGV0b3AuY2FsbGJhY2tzWyBjYWxsYmFja05hbWUgXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDAgKTtcbiAgICAgICAgICBjYWxsYmFjay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpO1xuICAgICAgICAgIGRlbGV0ZSBUYWJsZXRvcC5jYWxsYmFja3NbY2FsbGJhY2tOYW1lXTtcbiAgICAgICAgfTtcbiAgICAgICAgY2FsbGJhY2tOYW1lID0gJ1RhYmxldG9wLmNhbGxiYWNrcy4nICsgY2FsbGJhY2tOYW1lO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgdXJsID0gcGF0aCArICcmY2FsbGJhY2s9JyArIGNhbGxiYWNrTmFtZTtcbiAgICAgIFxuICAgICAgaWYgKHRoaXMuc2ltcGxlVXJsKSB7XG4gICAgICAgIC8vIFdlJ3ZlIGdvbmUgZG93biBhIHJhYmJpdCBob2xlIG9mIHBhc3NpbmcgaW5qZWN0U2NyaXB0IHRoZSBwYXRoLCBzbyBsZXQnc1xuICAgICAgICAvLyBqdXN0IHB1bGwgdGhlIHNoZWV0X2lkIG91dCBvZiB0aGUgcGF0aCBsaWtlIHRoZSBsZWFzdCBlZmZpY2llbnQgd29ya2VyIGJlZXNcbiAgICAgICAgaWYocGF0aC5pbmRleE9mKCcvbGlzdC8nKSAhPT0gLTEpIHtcbiAgICAgICAgICBzY3JpcHQuc3JjID0gdGhpcy5lbmRwb2ludCArICcvJyArIHRoaXMua2V5ICsgJy0nICsgcGF0aC5zcGxpdCgnLycpWzRdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNjcmlwdC5zcmMgPSB0aGlzLmVuZHBvaW50ICsgJy8nICsgdGhpcy5rZXk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNjcmlwdC5zcmMgPSB0aGlzLmVuZHBvaW50ICsgdXJsO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAodGhpcy5wYXJhbWV0ZXJpemUpIHtcbiAgICAgICAgc2NyaXB0LnNyYyA9IHRoaXMucGFyYW1ldGVyaXplICsgZW5jb2RlVVJJQ29tcG9uZW50KHNjcmlwdC5zcmMpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxvZygnSW5qZWN0aW5nJywgc2NyaXB0LnNyYyk7XG5cbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXS5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgfSxcbiAgICBcbiAgICAvKiBcbiAgICAgIFRoaXMgd2lsbCBvbmx5IHJ1biBpZiB0YWJsZXRvcCBpcyBiZWluZyBydW4gaW4gbm9kZS5qc1xuICAgICovXG4gICAgc2VydmVyU2lkZUZldGNoOiBmdW5jdGlvbihwYXRoLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICB0aGlzLmxvZygnRmV0Y2hpbmcnLCB0aGlzLmVuZHBvaW50ICsgcGF0aCk7XG4gICAgICByZXF1ZXN0KHt1cmw6IHRoaXMuZW5kcG9pbnQgKyBwYXRoLCBqc29uOiB0cnVlfSwgZnVuY3Rpb24oZXJyLCByZXNwLCBib2R5KSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgYm9keSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLyogXG4gICAgICBJcyB0aGlzIGEgc2hlZXQgeW91IHdhbnQgdG8gcHVsbD9cbiAgICAgIElmIHsgd2FudGVkOiBbXCJTaGVldDFcIl0gfSBoYXMgYmVlbiBzcGVjaWZpZWQsIG9ubHkgU2hlZXQxIGlzIGltcG9ydGVkXG4gICAgICBQdWxscyBhbGwgc2hlZXRzIGlmIG5vbmUgYXJlIHNwZWNpZmllZFxuICAgICovXG4gICAgaXNXYW50ZWQ6IGZ1bmN0aW9uKHNoZWV0TmFtZSkge1xuICAgICAgaWYgKHRoaXMud2FudGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAodHRJbmRleE9mKHRoaXMud2FudGVkLCBzaGVldE5hbWUpICE9PSAtMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKlxuICAgICAgV2hhdCBnZXRzIHNlbmQgdG8gdGhlIGNhbGxiYWNrXG4gICAgICBpZiBzaW1wbGVTaGVldCA9PT0gdHJ1ZSwgdGhlbiBkb24ndCByZXR1cm4gYW4gYXJyYXkgb2YgVGFibGV0b3AudGhpcy5tb2RlbHMsXG4gICAgICBvbmx5IHJldHVybiB0aGUgZmlyc3Qgb25lJ3MgZWxlbWVudHNcbiAgICAqL1xuICAgIGRhdGE6IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gSWYgdGhlIGluc3RhbmNlIGlzIGJlaW5nIHF1ZXJpZWQgYmVmb3JlIHRoZSBkYXRhJ3MgYmVlbiBmZXRjaGVkXG4gICAgICAvLyB0aGVuIHJldHVybiB1bmRlZmluZWQuXG4gICAgICBpZiAodGhpcy5tb2RlbE5hbWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc2ltcGxlU2hlZXQpIHtcbiAgICAgICAgaWYgKHRoaXMubW9kZWxOYW1lcy5sZW5ndGggPiAxICYmIHRoaXMuZGVidWcpIHtcbiAgICAgICAgICB0aGlzLmxvZygnV0FSTklORyBZb3UgaGF2ZSBtb3JlIHRoYW4gb25lIHNoZWV0IGJ1dCBhcmUgdXNpbmcgc2ltcGxlIHNoZWV0IG1vZGUhIERvblxcJ3QgYmxhbWUgbWUgd2hlbiBzb21ldGhpbmcgZ29lcyB3cm9uZy4nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlbHNbdGhpcy5tb2RlbE5hbWVzWzBdXS5hbGwoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVscztcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLypcbiAgICAgIEFkZCBhbm90aGVyIHNoZWV0IHRvIHRoZSB3YW50ZWQgbGlzdFxuICAgICovXG4gICAgYWRkV2FudGVkOiBmdW5jdGlvbihzaGVldCkge1xuICAgICAgaWYodHRJbmRleE9mKHRoaXMud2FudGVkLCBzaGVldCkgPT09IC0xKSB7XG4gICAgICAgIHRoaXMud2FudGVkLnB1c2goc2hlZXQpO1xuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLypcbiAgICAgIExvYWQgYWxsIHdvcmtzaGVldHMgb2YgdGhlIHNwcmVhZHNoZWV0LCB0dXJuaW5nIGVhY2ggaW50byBhIFRhYmxldG9wIE1vZGVsLlxuICAgICAgTmVlZCB0byB1c2UgaW5qZWN0U2NyaXB0IGJlY2F1c2UgdGhlIHdvcmtzaGVldCB2aWV3IHRoYXQgeW91J3JlIHdvcmtpbmcgZnJvbVxuICAgICAgZG9lc24ndCBhY3R1YWxseSBpbmNsdWRlIHRoZSBkYXRhLiBUaGUgbGlzdC1iYXNlZCBmZWVkICgvZmVlZHMvbGlzdC9rZXkuLikgZG9lcywgdGhvdWdoLlxuICAgICAgQ2FsbHMgYmFjayB0byBsb2FkU2hlZXQgaW4gb3JkZXIgdG8gZ2V0IHRoZSByZWFsIHdvcmsgZG9uZS5cblxuICAgICAgVXNlZCBhcyBhIGNhbGxiYWNrIGZvciB0aGUgd29ya3NoZWV0LWJhc2VkIEpTT05cbiAgICAqL1xuICAgIGxvYWRTaGVldHM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBpLCBpbGVuO1xuICAgICAgdmFyIHRvTG9hZCA9IFtdO1xuICAgICAgdGhpcy5nb29nbGVTaGVldE5hbWUgPSBkYXRhLmZlZWQudGl0bGUuJHQ7XG4gICAgICB0aGlzLmZvdW5kU2hlZXROYW1lcyA9IFtdO1xuXG4gICAgICBmb3IgKGkgPSAwLCBpbGVuID0gZGF0YS5mZWVkLmVudHJ5Lmxlbmd0aDsgaSA8IGlsZW4gOyBpKyspIHtcbiAgICAgICAgdGhpcy5mb3VuZFNoZWV0TmFtZXMucHVzaChkYXRhLmZlZWQuZW50cnlbaV0udGl0bGUuJHQpO1xuICAgICAgICAvLyBPbmx5IHB1bGwgaW4gZGVzaXJlZCBzaGVldHMgdG8gcmVkdWNlIGxvYWRpbmdcbiAgICAgICAgaWYgKHRoaXMuaXNXYW50ZWQoZGF0YS5mZWVkLmVudHJ5W2ldLmNvbnRlbnQuJHQpKSB7XG4gICAgICAgICAgdmFyIGxpbmtJZHggPSBkYXRhLmZlZWQuZW50cnlbaV0ubGluay5sZW5ndGgtMTtcbiAgICAgICAgICB2YXIgc2hlZXRJZCA9IGRhdGEuZmVlZC5lbnRyeVtpXS5saW5rW2xpbmtJZHhdLmhyZWYuc3BsaXQoJy8nKS5wb3AoKTtcbiAgICAgICAgICB2YXIganNvblBhdGggPSAnL2ZlZWRzL2xpc3QvJyArIHRoaXMua2V5ICsgJy8nICsgc2hlZXRJZCArICcvcHVibGljL3ZhbHVlcz9hbHQ9JztcbiAgICAgICAgICBpZiAoaW5Ob2RlSlMgfHwgc3VwcG9ydHNDT1JTKSB7XG4gICAgICAgICAgICBqc29uUGF0aCArPSAnanNvbic7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGpzb25QYXRoICs9ICdqc29uLWluLXNjcmlwdCc7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLnF1ZXJ5KSB7XG4gICAgICAgICAgICAvLyBRdWVyeSBMYW5ndWFnZSBSZWZlcmVuY2UgKDAuNylcbiAgICAgICAgICAgIGpzb25QYXRoICs9ICcmdHE9JyArIHRoaXMucXVlcnk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLm9yZGVyYnkpIHtcbiAgICAgICAgICAgIGpzb25QYXRoICs9ICcmb3JkZXJieT1jb2x1bW46JyArIHRoaXMub3JkZXJieS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5yZXZlcnNlKSB7XG4gICAgICAgICAgICBqc29uUGF0aCArPSAnJnJldmVyc2U9dHJ1ZSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvTG9hZC5wdXNoKGpzb25QYXRoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnNoZWV0c1RvTG9hZCA9IHRvTG9hZC5sZW5ndGg7XG4gICAgICBmb3IoaSA9IDAsIGlsZW4gPSB0b0xvYWQubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVxdWVzdERhdGEodG9Mb2FkW2ldLCB0aGlzLmxvYWRTaGVldCk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qXG4gICAgICBBY2Nlc3MgbGF5ZXIgZm9yIHRoZSB0aGlzLm1vZGVsc1xuICAgICAgLnNoZWV0cygpIGdldHMgeW91IGFsbCBvZiB0aGUgc2hlZXRzXG4gICAgICAuc2hlZXRzKCdTaGVldDEnKSBnZXRzIHlvdSB0aGUgc2hlZXQgbmFtZWQgU2hlZXQxXG4gICAgKi9cbiAgICBzaGVldHM6IGZ1bmN0aW9uKHNoZWV0TmFtZSkge1xuICAgICAgaWYgKHR5cGVvZiBzaGVldE5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVscztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5tb2RlbHNbc2hlZXROYW1lXSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gYWxlcnQoIFwiQ2FuJ3QgZmluZCBcIiArIHNoZWV0TmFtZSApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5tb2RlbHNbc2hlZXROYW1lXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzaGVldFJlYWR5OiBmdW5jdGlvbihtb2RlbCkge1xuICAgICAgdGhpcy5tb2RlbHNbbW9kZWwubmFtZV0gPSBtb2RlbDtcbiAgICAgIGlmICh0dEluZGV4T2YodGhpcy5tb2RlbE5hbWVzLCBtb2RlbC5uYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgdGhpcy5tb2RlbE5hbWVzLnB1c2gobW9kZWwubmFtZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHRoaXMuc2hlZXRzVG9Mb2FkLS07XG4gICAgICBpZiAodGhpcy5zaGVldHNUb0xvYWQgPT09IDApIHtcbiAgICAgICAgdGhpcy5kb0NhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvKlxuICAgICAgUGFyc2UgYSBzaW5nbGUgbGlzdC1iYXNlZCB3b3Jrc2hlZXQsIHR1cm5pbmcgaXQgaW50byBhIFRhYmxldG9wIE1vZGVsXG5cbiAgICAgIFVzZWQgYXMgYSBjYWxsYmFjayBmb3IgdGhlIGxpc3QtYmFzZWQgSlNPTlxuICAgICovXG4gICAgbG9hZFNoZWV0OiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICBuZXcgVGFibGV0b3AuTW9kZWwoeyBcbiAgICAgICAgZGF0YTogZGF0YSwgXG4gICAgICAgIHBhcnNlTnVtYmVyczogdGhpcy5wYXJzZU51bWJlcnMsXG4gICAgICAgIHBvc3RQcm9jZXNzOiB0aGlzLnBvc3RQcm9jZXNzLFxuICAgICAgICB0YWJsZXRvcDogdGhpcyxcbiAgICAgICAgcHJldHR5Q29sdW1uTmFtZXM6IHRoaXMucHJldHR5Q29sdW1uTmFtZXMsXG4gICAgICAgIG9uUmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHRoYXQuc2hlZXRSZWFkeSh0aGlzKTtcbiAgICAgICAgfSBcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvKlxuICAgICAgRXhlY3V0ZSB0aGUgY2FsbGJhY2sgdXBvbiBsb2FkaW5nISBSZWx5IG9uIHRoaXMuZGF0YSgpIGJlY2F1c2UgeW91IG1pZ2h0XG4gICAgICAgIG9ubHkgcmVxdWVzdCBjZXJ0YWluIHBpZWNlcyBvZiBkYXRhIChpLmUuIHNpbXBsZVNoZWV0IG1vZGUpXG4gICAgICBUZXN0cyB0aGlzLnNoZWV0c1RvTG9hZCBqdXN0IGluIGNhc2UgYSByYWNlIGNvbmRpdGlvbiBoYXBwZW5zIHRvIHNob3cgdXBcbiAgICAqL1xuICAgIGRvQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYodGhpcy5zaGVldHNUb0xvYWQgPT09IDApIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5hcHBseSh0aGlzLmNhbGxiYWNrQ29udGV4dCB8fCB0aGlzLCBbdGhpcy5kYXRhKCksIHRoaXNdKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRoaXMuZGVidWcpIHtcbiAgICAgICAgaWYodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmxvZyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuYXBwbHkoY29uc29sZS5sb2csIFtjb25zb2xlLCBhcmd1bWVudHNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9O1xuXG4gIC8qXG4gICAgVGFibGV0b3AuTW9kZWwgc3RvcmVzIHRoZSBhdHRyaWJ1dGUgbmFtZXMgYW5kIHBhcnNlcyB0aGUgd29ya3NoZWV0IGRhdGFcbiAgICAgIHRvIHR1cm4gaXQgaW50byBzb21ldGhpbmcgd29ydGh3aGlsZVxuXG4gICAgT3B0aW9ucyBzaG91bGQgYmUgaW4gdGhlIGZvcm1hdCB7IGRhdGE6IFhYWCB9LCB3aXRoIFhYWCBiZWluZyB0aGUgbGlzdC1iYXNlZCB3b3Jrc2hlZXRcbiAgKi9cbiAgVGFibGV0b3AuTW9kZWwgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGksIGosIGlsZW4sIGpsZW47XG4gICAgdGhpcy5jb2x1bW5OYW1lcyA9IFtdO1xuICAgIHRoaXMuY29sdW1uX25hbWVzID0gdGhpcy5jb2x1bW5OYW1lczsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgdGhpcy5uYW1lID0gb3B0aW9ucy5kYXRhLmZlZWQudGl0bGUuJHQ7XG4gICAgdGhpcy50YWJsZXRvcCA9IG9wdGlvbnMudGFibGV0b3A7XG4gICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIHRoaXMub25SZWFkeSA9IG9wdGlvbnMub25SZWFkeTtcbiAgICB0aGlzLnJhdyA9IG9wdGlvbnMuZGF0YTsgLy8gQSBjb3B5IG9mIHRoZSBzaGVldCdzIHJhdyBkYXRhLCBmb3IgYWNjZXNzaW5nIG1pbnV0aWFlXG5cbiAgICBpZiAodHlwZW9mKG9wdGlvbnMuZGF0YS5mZWVkLmVudHJ5KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG9wdGlvbnMudGFibGV0b3AubG9nKCdNaXNzaW5nIGRhdGEgZm9yICcgKyB0aGlzLm5hbWUgKyAnLCBtYWtlIHN1cmUgeW91IGRpZG5cXCd0IGZvcmdldCBjb2x1bW4gaGVhZGVycycpO1xuICAgICAgdGhpcy5vcmlnaW5hbENvbHVtbnMgPSBbXTtcbiAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICAgIHRoaXMub25SZWFkeS5jYWxsKHRoaXMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBmb3IgKHZhciBrZXkgaW4gb3B0aW9ucy5kYXRhLmZlZWQuZW50cnlbMF0pe1xuICAgICAgaWYgKC9eZ3N4Ly50ZXN0KGtleSkpIHtcbiAgICAgICAgdGhpcy5jb2x1bW5OYW1lcy5wdXNoKGtleS5yZXBsYWNlKCdnc3gkJywnJykpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMub3JpZ2luYWxDb2x1bW5zID0gdGhpcy5jb2x1bW5OYW1lcztcbiAgICB0aGlzLm9yaWdpbmFsX2NvbHVtbnMgPSB0aGlzLm9yaWdpbmFsQ29sdW1uczsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgXG4gICAgZm9yIChpID0gMCwgaWxlbiA9ICBvcHRpb25zLmRhdGEuZmVlZC5lbnRyeS5sZW5ndGggOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICB2YXIgc291cmNlID0gb3B0aW9ucy5kYXRhLmZlZWQuZW50cnlbaV07XG4gICAgICB2YXIgZWxlbWVudCA9IHt9O1xuICAgICAgZm9yIChqID0gMCwgamxlbiA9IHRoaXMuY29sdW1uTmFtZXMubGVuZ3RoOyBqIDwgamxlbiA7IGorKykge1xuICAgICAgICB2YXIgY2VsbCA9IHNvdXJjZVsnZ3N4JCcgKyB0aGlzLmNvbHVtbk5hbWVzW2pdXTtcbiAgICAgICAgaWYgKHR5cGVvZihjZWxsKSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5wYXJzZU51bWJlcnMgJiYgY2VsbC4kdCAhPT0gJycgJiYgIWlzTmFOKGNlbGwuJHQpKSB7XG4gICAgICAgICAgICBlbGVtZW50W3RoaXMuY29sdW1uTmFtZXNbal1dID0gK2NlbGwuJHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRbdGhpcy5jb2x1bW5OYW1lc1tqXV0gPSBjZWxsLiR0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbGVtZW50W3RoaXMuY29sdW1uTmFtZXNbal1dID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChlbGVtZW50LnJvd051bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGVsZW1lbnQucm93TnVtYmVyID0gaSArIDE7XG4gICAgICB9XG4gICAgICAgIFxuICAgICAgaWYgKG9wdGlvbnMucG9zdFByb2Nlc3MpIHtcbiAgICAgICAgb3B0aW9ucy5wb3N0UHJvY2VzcyhlbGVtZW50KTtcbiAgICAgIH1cbiAgICAgICAgXG4gICAgICB0aGlzLmVsZW1lbnRzLnB1c2goZWxlbWVudCk7XG4gICAgfVxuICAgIFxuICAgIGlmIChvcHRpb25zLnByZXR0eUNvbHVtbk5hbWVzKSB7XG4gICAgICB0aGlzLmZldGNoUHJldHR5Q29sdW1ucygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uUmVhZHkuY2FsbCh0aGlzKTtcbiAgICB9XG4gIH07XG5cbiAgVGFibGV0b3AuTW9kZWwucHJvdG90eXBlID0ge1xuICAgIC8qXG4gICAgICBSZXR1cm5zIGFsbCBvZiB0aGUgZWxlbWVudHMgKHJvd3MpIG9mIHRoZSB3b3Jrc2hlZXQgYXMgb2JqZWN0c1xuICAgICovXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzO1xuICAgIH0sXG4gICAgXG4gICAgZmV0Y2hQcmV0dHlDb2x1bW5zOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5yYXcuZmVlZC5saW5rWzNdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWR5KCk7XG4gICAgICB9XG4gICAgICAgIFxuICAgICAgdmFyIGNlbGx1cmwgPSB0aGlzLnJhdy5mZWVkLmxpbmtbM10uaHJlZi5yZXBsYWNlKCcvZmVlZHMvbGlzdC8nLCAnL2ZlZWRzL2NlbGxzLycpLnJlcGxhY2UoJ2h0dHBzOi8vc3ByZWFkc2hlZXRzLmdvb2dsZS5jb20nLCAnJyk7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB0aGlzLnRhYmxldG9wLnJlcXVlc3REYXRhKGNlbGx1cmwsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhhdC5sb2FkUHJldHR5Q29sdW1ucyhkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgXG4gICAgcmVhZHk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5vblJlYWR5LmNhbGwodGhpcyk7XG4gICAgfSxcbiAgICBcbiAgICAvKlxuICAgICAqIFN0b3JlIGNvbHVtbiBuYW1lcyBhcyBhbiBvYmplY3RcbiAgICAgKiB3aXRoIGtleXMgb2YgR29vZ2xlLWZvcm1hdHRlZCBcImNvbHVtbk5hbWVcIlxuICAgICAqIGFuZCB2YWx1ZXMgb2YgaHVtYW4tcmVhZGFibGUgXCJDb2x1bW4gbmFtZVwiXG4gICAgICovXG4gICAgbG9hZFByZXR0eUNvbHVtbnM6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBwcmV0dHlDb2x1bW5zID0ge307XG5cbiAgICAgIHZhciBjb2x1bW5OYW1lcyA9IHRoaXMuY29sdW1uTmFtZXM7XG5cbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBsID0gY29sdW1uTmFtZXMubGVuZ3RoO1xuXG4gICAgICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGEuZmVlZC5lbnRyeVtpXS5jb250ZW50LiR0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHByZXR0eUNvbHVtbnNbY29sdW1uTmFtZXNbaV1dID0gZGF0YS5mZWVkLmVudHJ5W2ldLmNvbnRlbnQuJHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJldHR5Q29sdW1uc1tjb2x1bW5OYW1lc1tpXV0gPSBjb2x1bW5OYW1lc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnByZXR0eUNvbHVtbnMgPSBwcmV0dHlDb2x1bW5zO1xuICAgICAgdGhpcy5wcmV0dHlfY29sdW1ucyA9IHRoaXMucHJldHR5Q29sdW1uczsgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICB0aGlzLnByZXR0aWZ5RWxlbWVudHMoKTtcbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICB9LFxuICAgIFxuICAgIC8qXG4gICAgICogR28gdGhyb3VnaCBlYWNoIHJvdywgc3Vic3RpdHV0aXRpbmdcbiAgICAgKiBHb29nbGUtZm9ybWF0dGVkIFwiY29sdW1uTmFtZVwiXG4gICAgICogd2l0aCBodW1hbi1yZWFkYWJsZSBcIkNvbHVtbiBuYW1lXCJcbiAgICAgKi9cbiAgICBwcmV0dGlmeUVsZW1lbnRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcmV0dHlFbGVtZW50cyA9IFtdLFxuICAgICAgICAgIG9yZGVyZWRQcmV0dHlOYW1lcyA9IFtdLFxuICAgICAgICAgIGksIGosIGlsZW4sIGpsZW47XG5cbiAgICAgIGZvciAoaiA9IDAsIGpsZW4gPSB0aGlzLmNvbHVtbk5hbWVzLmxlbmd0aDsgaiA8IGpsZW4gOyBqKyspIHtcbiAgICAgICAgb3JkZXJlZFByZXR0eU5hbWVzLnB1c2godGhpcy5wcmV0dHlDb2x1bW5zW3RoaXMuY29sdW1uTmFtZXNbal1dKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMCwgaWxlbiA9IHRoaXMuZWxlbWVudHMubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICAgIHZhciBuZXdFbGVtZW50ID0ge307XG4gICAgICAgIGZvciAoaiA9IDAsIGpsZW4gPSB0aGlzLmNvbHVtbk5hbWVzLmxlbmd0aDsgaiA8IGpsZW4gOyBqKyspIHtcbiAgICAgICAgICB2YXIgbmV3Q29sdW1uTmFtZSA9IHRoaXMucHJldHR5Q29sdW1uc1t0aGlzLmNvbHVtbk5hbWVzW2pdXTtcbiAgICAgICAgICBuZXdFbGVtZW50W25ld0NvbHVtbk5hbWVdID0gdGhpcy5lbGVtZW50c1tpXVt0aGlzLmNvbHVtbk5hbWVzW2pdXTtcbiAgICAgICAgfVxuICAgICAgICBwcmV0dHlFbGVtZW50cy5wdXNoKG5ld0VsZW1lbnQpO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50cyA9IHByZXR0eUVsZW1lbnRzO1xuICAgICAgdGhpcy5jb2x1bW5OYW1lcyA9IG9yZGVyZWRQcmV0dHlOYW1lcztcbiAgICB9LFxuXG4gICAgLypcbiAgICAgIFJldHVybiB0aGUgZWxlbWVudHMgYXMgYW4gYXJyYXkgb2YgYXJyYXlzLCBpbnN0ZWFkIG9mIGFuIGFycmF5IG9mIG9iamVjdHNcbiAgICAqL1xuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFycmF5ID0gW10sXG4gICAgICAgICAgaSwgaiwgaWxlbiwgamxlbjtcbiAgICAgIGZvciAoaSA9IDAsIGlsZW4gPSB0aGlzLmVsZW1lbnRzLmxlbmd0aDsgaSA8IGlsZW47IGkrKykge1xuICAgICAgICB2YXIgcm93ID0gW107XG4gICAgICAgIGZvciAoaiA9IDAsIGpsZW4gPSB0aGlzLmNvbHVtbk5hbWVzLmxlbmd0aDsgaiA8IGpsZW4gOyBqKyspIHtcbiAgICAgICAgICByb3cucHVzaCh0aGlzLmVsZW1lbnRzW2ldWyB0aGlzLmNvbHVtbk5hbWVzW2pdXSk7XG4gICAgICAgIH1cbiAgICAgICAgYXJyYXkucHVzaChyb3cpO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuICB9O1xuXG4gIGlmKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7IC8vZG9uJ3QganVzdCB1c2UgaW5Ob2RlSlMsIHdlIG1heSBiZSBpbiBCcm93c2VyaWZ5XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBUYWJsZXRvcDtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFRhYmxldG9wO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5UYWJsZXRvcCA9IFRhYmxldG9wO1xuICB9XG5cbn0pKCk7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBSUFBO0FEQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBRHBMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUQxbEJBLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLE9BQUEsQ0FBUSxVQUFSOzs7O0FEQW5CLElBQUE7O0FBQUUsV0FBYSxPQUFBLENBQVEsS0FBUjs7QUFHVCxPQUFPLENBQUM7RUFDQyxlQUFDLE9BQUQ7SUFDWCxJQUFDLENBQUEsSUFBRCxHQUFRLE9BQU8sQ0FBQztJQUVoQixJQUFDLENBQUEsR0FBRCxHQUFPLENBQUEsU0FBQSxLQUFBO2FBQUEsU0FBQyxRQUFEO2VBQ0wsUUFBUSxDQUFDLElBQVQsQ0FBYztVQUNaLEdBQUEsRUFBSyxLQUFDLENBQUEsSUFETTtVQUVaLFdBQUEsRUFBYSxJQUZEO1VBR1osUUFBQSxFQUFVLFNBQUMsSUFBRCxFQUFPLEtBQVA7QUFDUixtQkFBTyxRQUFBLENBQVMsSUFBVCxFQUFlLEtBQWY7VUFEQyxDQUhFO1NBQWQ7TUFESztJQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7RUFISSJ9
