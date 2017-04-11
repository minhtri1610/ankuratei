(function(w, d, UNDEF) {
  /*-----------------------------------
  * @constant
  * -----------------------------------*/
  var READYSTATECHANGE,


  /*-----------------------------------
  * @variable
  * -----------------------------------*/
  div, ua, dom, event, rollover;


  /*-----------------------------------
  * @share element
  * -----------------------------------*/
  div = d.createElement('div');


  /*-----------------------------------
  * @extend
  * -----------------------------------*/
  function $extend(o) {
    var f = function() {};
    $copyObject(f.prototype, o);
    return new f;
  }

  function $copyObject(o, a) {
    for (var k in a) {
      o.hasOwnProperty(k) || (o[k] = a[k]);
    }
    return o;
  }


  /*-----------------------------------
  *@ua extend
  * -----------------------------------*/
  ua = (function() {
    var _ua,

    na = navigator,
    u = na.userAgent.toLowerCase(),
    p = na.platform.toLowerCase(),
    windows = p ? /win/.test(p) : /win/.test(u),
    mac = p ? /mac/.test(p) : /mac/.test(u),
    sp = new RegExp('(' + [
      'iphone',
      'ipad',
      'ipod',
      'android',
      'dream',
      'cupccake',
      'blackberry',
      'webos',
      'incognito',
      'webmate'
    ].join('|') + ')'),
    name;

    _ua = {
      // os
      _windows: windows,
      _mac: mac,

      // pc browser
      _gecko: false,
      _opera: false,
      _webkit: false,
      _msie: false,

      // smartphone browser
      _iphone: false,     // Apple iPhone
      _ipad: false,       // Apple iPad
      _ipod: false,       // Apple iPod touch
      _android: false,    // 1.5+ Android
      _dream: false,      // Pre 1.5 Android
      _cupccake: false,   // 1.5+ Android
      _blackberry: false, // Storm:9500 9530, Storm v2:9520 9550, Torch:9800
      _webos: false,      // Palm Pre Experimental
      _incognito: false,  // Other iPhone browser
      _webmate: false     // Other iPhone browser
    };

    _ua['_ios'] = /(iphone|ipad|ipod)/.test(u) ? true : false;
    _ua['_sp'] = /(android|iphone|ipad|ipod)/.test(u) ? true : false;

    name = ('ActiveXObject' in w && /msie/.test(u)) ? '_msie' : // ie
      'Components' in w ? '_gecko' : // mozira fx
        'defaultstatus' in w ? '_webkit' : // webki safari,chrome
          (w.opera) ? '_opera' : // opera
            UNDEF; // ?
    _ua[name] = true;

    if (u.match(sp)) {
      name = '_' + RegExp.$1;
      _ua[name] = true;
    }

    //msie version
    _ua['$msieVer'] = function(ver) {
      if (!_ua['_msie']) { return false; }
      var reg = new RegExp('msie (' + ver + ')');
      return reg.test(u) ? true : false;
    };

    return $extend(_ua);
  })();


  /*-----------------------------------
  *@dom Class
  * -----------------------------------*/
  function $(i) {
    return d.getElementById(i);
  }

  function $$(e, t, n) {
    return (n || n === 0) ? e.getElementsByTagName(t)[n] : e.getElementsByTagName(t);
  }

  function $bind(f, b, a) {
    return function(e) { f.apply(b, a || [e]); }
  }

  dom = $extend({
    $: $,
    $$: $$,
    $bind: $bind
  });


  /*-----------------------------------
  *@event Class
  * -----------------------------------*/
  var $addListner,
  $removeListner,
  $ready,
  _cashEvent = [],
  _observeEvent = [],
  _sp_event_name = {
    'mousedown': 'touchstart',
    'mousemove': 'touchmove',
    'mouseup': 'touchend'
  };

  //EventListner check
  (function() {
    if (w.addEventListener) {
      $addListner = function(n, e, f) {
        n.addEventListener(e, f, false);
      }
      $removeListner = function(n, e, f) {
        n.removeEventListener(e, f, false);
      }
    } else if (w.attachEvent) {
      $addListner = function(n, e, f) {
        n.attachEvent('on' + e, f);
      }
      $removeListner = function(n, e, f) {
        n.detachEvent('on' + e, f);
      }
    }
  })();

  /**
  * func: {Function} callback Function
  * bind: {Object} bind Object
  * args: {Array} callback arguments
  * */
  $ready = (function() {
    var _loaded, _buffer, _observe, _event;
    _loaded = false;
    _buffer = [];
    _observe = {};
    _event = 'on' + READYSTATECHANGE;

    /** * DOMLoaded check Function * */
    (function() {
      if ((typeof d.readyState != UNDEF && d.readyState == 'complete') ||
          (typeof d.readyState == UNDEF &&
           (d.getElementsByTagName('body')[0] || d.body))) {
        $complete();
      }else if (!_loaded) {
        if (typeof d.addEventListener != UNDEF) {
          d.addEventListener('DOMContentLoaded', $complete, false);
          _observe.flag = true;
          _observe.handle = 'DOMContentLoaded';
          _observe.func = $complete;
        }
        if (ua._msie) {
          d.attachEvent(_event, function() {
            if (d.readyState == 'complete') {
              d.detachEvent(_event, arguments.callee);
              _observe.flag = true;
              _observe.handle = READYSTATECHANGE;
              _observe.func = arguments.callee;
              $complete();
            }
          });
          if (w == top) { // if not inside an iframe
            (function() {
              if (_loaded) { return; }
              try {
                d.documentElement.doScroll('left');
              }
              catch (e) {
                setTimeout(arguments.callee, 0);
                return;
              }
              $complete();
            })();
          }
        }
        if (ua._webkit) {
          (function() {
            if (_loaded) { return; }
            if (!/loaded|complete/.test(d.readyState)) {
              setTimeout(arguments.callee, 0);
              return;
            }
            $complete();
          })();
        }
      }
    })();

    function $complete() {
      _loaded = true; // DOMLoaded Flag
      for (var i=0, ready; ready=_buffer[i]; i++) {
        ready();
      }
      _observe.flag && $addListner(w, 'unload', $observeEvent);
      _buffer = [];
    }

    function $observeEvent() {
      $removeListner(d, _observe.handle, _observe.func);
      _observe = null;
    }

    return function(o) {
      if (_loaded) { // complete DOM load
        return $bind(o.func, o.bind, o.args)();
      }
      _buffer.push($bind(o.func, o.bind, o.args));
      return false;
    }
  })();

  /**
  * event capture & addEvent function
  * @param {Object} o => {
  *   elem: {HTMLElement}
  *   handle: {String} eventName
  *   func: {Function} callback Function
  *   bind: {Object} bind Object
  *   args: {Array} callback arguments
  *   name: {String} captureName
  * }
  * TODO: hash.
  * */
  function $addEvent(o) {
    var handleName = o.handle,
    func = o.func;

    //smartphone
    if (ua._sp) {
      if (handleName === 'mouseout' ||
          handleName === 'mouseover') {
        return;
      } else if (_sp_event_name.hasOwnProperty(handleName)) {
        handleName = _sp_event_name[handleName];
      }
    }

    //callack Function Object
    func = $eventBind(o.func, o.bind, o.args);
    $addListner(o.elem, handleName, func);
    $observeEvent(o.elem, handleName, func);

    //event cash
    if (handleName !== 'unload' && o.name) {
      _cashEvent[o.name + handleName] = {
        elem: o.elem,
        handle: handleName,
        func: func
      };
    }
  }

  /**
  * event remove & addEvent function
  * @param {String} name => addEvent uniquName.
  * @param {String} type => addEvent handle type.
  * */
  function $addRemove(n, t) {
    var e = _cashEvent[n + t];
    if (e) {
      $removeListner(e.elem, e.handle, e.func);
      delete _cashEvent[n + t];
    } else {
      return;
    }
  }

  function $eventBind(f, b, a) {
    return function(e) {
      e = [$getEvent(e)];
      f && f.apply(b, (a ? a.concat(e) : e));
    }
  }

  function $observeEvent(e, h, f) {
    _observeEvent[_observeEvent.length] = {
      elem: e,
      handle: h,
      func: f
    };
  }

  function $releaseEvent() {
    var i = _observeEvent.length, o;
    for (; i--;) {
      o = _observeEvent[i];
      $removeListner(o.elem, o.handle, o.func);
      _observeEvent[i] = null;
    }
    _observeEvent = null;
  }

  function $getEvent(e) {
    return w.event || e;
  }

  //event releaseEvent
  $addListner(w, 'unload', $releaseEvent);

  event = $extend({
    $ready: $ready,
    $add: $addEvent,
    $remove: $addRemove,
    $addListner: $addListner,
    $removeListner: $removeListner
  });


  /*-----------------------------------
  * @rollover
  * -----------------------------------*/
  rollover = (function() {

    /* variable */
    var _buffer, _running;

    /* config */
    _buffer = {};

    /* method */

    /**
    * id: {
    *   classname: {String}
    *   on: {String}
    *   off: {String}
    *   img: {Boolean}
    *   input: {Boolean}
    * }
    * */
    function $run(o) {
      event.$ready({
        func: $init,
        bind: this,
        args: [o || {}]
      });
    }

    function $init(o) {
      var k, e;
      for (k in o) {
        e = dom.$(k);
        if (!e) { continue; }
        $set(e, k, o[k]);
      }
    }

    function $set(e, k, o) {
      if (_buffer[k]) { return; }
      _buffer[k] = true;

      var img, input, classname, on, off;
      classname = o.classname || '';
      on = o.on + '.';
      off = o.off + '.';
      o.img && $add(dom.$$(e, 'img'), classname, on, off);
      o.input && $add(dom.$$(e, 'input'), classname, on, off);
    }

    function $add(tag, classname, on, off) {
      var i, e, src, pre;
      for (i=0; e=tag[i]; i++) {
        src = e.getAttribute("src");
        if (!src || !src.match(off) || !$classname(e.className, classname)) { continue; }
        pre = new Image();
        pre.src = src.replace(off, on);
        event.$add({
          elem: e,
          handle: 'mouseover',
          func: $event,
          args: [e, off, on],
          bind: this
        });
        event.$add({
          elem: e,
          handle: 'mouseout',
          func: $event,
          args: [e, on, off],
          bind: this
        });
      }
    }

    function $event(e, target, change) {
      var src = e.getAttribute('src');
      e.setAttribute('src', src.replace(target, change));
    }

    function $classname(getCn, setCn) {
      if (!setCn || getCn === setCn) { return 1; }
      return 0;
    }

    function $release() {
      _buffer = null;
    }

    /* extend */
    return $extend({
      $run: $run,
      $release: $release
    });
  }());


  /* release */
  event.$addListner(w, 'unload', function(){
    rollover.$release();
    ua = null;
    dom = null;
    event = null;
    rollover = null;
  });

  /* run */
  rollover.$run({
    wrapper: {
      classname: 'rollover',
      on: '_on',
      off: '_off',
      img: true,
      input: false
    }
  });

}(window, document, 'undefined'));