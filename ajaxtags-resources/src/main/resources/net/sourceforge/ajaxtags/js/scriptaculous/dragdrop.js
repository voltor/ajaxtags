/*global $, $A, $F, $H, $w, Ajax, Class, Effect, Element, Event, Field, Form, Prototype, Sortable */
// script.aculo.us dragdrop.js v1.9.0 with fixes, Thu Dec 23 16:54:48 -0500 2010

// Copyright (c) 2005-2010 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

if (Object.isUndefined(Effect)) {
  throw ("dragdrop.js requires including script.aculo.us' effects.js library");
}

var Droppables = {
  drops: [],

  remove: function(element) {
    this.drops = this.drops.reject(function(d) {
      return d.element == $(element);
    });
  },

  add: function(element) {
    element = $(element);
    var options = Object.extend({
      greedy: true,
      hoverclass: null,
      tree: false
    }, arguments[1] || {});

    // cache containers
    if (options.containment) {
      options._containers = [];
      var containment = options.containment;
      if (Object.isArray(containment)) {
        containment.each(function(c) {
          options._containers.push($(c));
        });
      } else {
        options._containers.push($(containment));
      }
    }

    if (options.accept) {
      options.accept = [options.accept].flatten();
    }

    Element.makePositioned(element); // fix IE
    options.element = element;

    this.drops.push(options);
  },

  findDeepestChild: function(drops) {
    var deepest = drops[0];

    for (var i = 1, len = drops.length; i < len; ++i) {
      if (Element.isParent(drops[i].element, deepest.element)) {
        deepest = drops[i];
      }
    }

    return deepest;
  },

  isContained: function(element, drop) {
    var containmentNode;
    if (drop.tree) {
      containmentNode = element.treeNode;
    } else {
      containmentNode = element.parentNode;
    }
    return drop._containers.detect(function(c) {
      return containmentNode == c;
    });
  },

  isAffected: function(point, element, drop) {
    return ((drop.element != element) &&
    ((!drop._containers) ||
    this.isContained(element, drop)) &&
    ((!drop.accept) ||
    ($w(element.className).detect(function(v) {
      return drop.accept.include(v);
    }))) &&
    Position.within(drop.element, point[0], point[1]));
  },

  deactivate: function(drop) {
    if (drop.hoverclass) {
      Element.removeClassName(drop.element, drop.hoverclass);
    }
    this.last_active = null;
  },

  activate: function(drop) {
    if (drop.hoverclass) {
      Element.addClassName(drop.element, drop.hoverclass);
    }
    this.last_active = drop;
  },

  show: function(point, element) {
    if (!this.drops.length) {
      return;
    }
    var drop, affected = [];

    this.drops.each(function(drop) {
      if (Droppables.isAffected(point, element, drop)) {
        affected.push(drop);
      }
    });

    if (affected.length > 0) {
      drop = Droppables.findDeepestChild(affected);
    }

    if (this.last_active && this.last_active != drop) {
      this.deactivate(this.last_active);
    }
    if (drop) {
      Position.within(drop.element, point[0], point[1]);
      if (drop.onHover) {
        drop.onHover(element, drop.element, Position.overlap(drop.overlap, drop.element));
      }
      if (drop != this.last_active) {
        Droppables.activate(drop);
      }
    }
  },

  fire: function(event, element) {
    if (!this.last_active) {
      return;
    }
    Position.prepare();

    if (this.isAffected([Event.pointerX(event), Event.pointerY(event)], element, this.last_active)) {
      if (this.last_active.onDrop) {
        this.last_active.onDrop(element, this.last_active.element, event);
        return true;
      }
    }
  },

  reset: function() {
    if (this.last_active) {
      this.deactivate(this.last_active);
    }
  }
};

var Draggables = {
  drags: [],
  observers: [],

  register: function(draggable) {
    if (this.drags.length === 0) {
      this.eventMouseUp = this.endDrag.bindAsEventListener(this);
      this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
      this.eventKeypress = this.keyPress.bindAsEventListener(this);

      Event.observe(document, "mouseup", this.eventMouseUp);
      Event.observe(document, "mousemove", this.eventMouseMove);
      Event.observe(document, "keypress", this.eventKeypress);
    }
    this.drags.push(draggable);
  },

  unregister: function(draggable) {
    this.drags = this.drags.reject(function(d) {
      return d == draggable;
    });
    if (this.drags.length === 0) {
      Event.stopObserving(document, "mouseup", this.eventMouseUp);
      Event.stopObserving(document, "mousemove", this.eventMouseMove);
      Event.stopObserving(document, "keypress", this.eventKeypress);
    }
  },

  activate: function(draggable) {
    if (draggable.options.delay) {
      this._timeout = setTimeout((function() {
        Draggables._timeout = null;
        window.focus();
        Draggables.activeDraggable = draggable;
      }).bind(this), draggable.options.delay);
    } else {
      window.focus(); // allows keypress events if window isn't currently focused, fails for Safari
      this.activeDraggable = draggable;
    }
  },

  deactivate: function() {
    this.activeDraggable = null;
  },

  updateDrag: function(event) {
    if (!this.activeDraggable) {
      return;
    }
    var pointer = [Event.pointerX(event), Event.pointerY(event)];
    // Mozilla-based browsers fire successive mousemove events with
    // the same coordinates, prevent needless redrawing (moz bug?)
    if (this._lastPointer && (this._lastPointer.inspect() == pointer.inspect())) {
      return;
    }
    this._lastPointer = pointer;

    this.activeDraggable.updateDrag(event, pointer);
  },

  endDrag: function(event) {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
    if (!this.activeDraggable) {
      return;
    }
    this._lastPointer = null;
    this.activeDraggable.endDrag(event);
    this.activeDraggable = null;
  },

  keyPress: function(event) {
    if (this.activeDraggable) {
      this.activeDraggable.keyPress(event);
    }
  },

  addObserver: function(observer) {
    this.observers.push(observer);
    this._cacheObserverCallbacks();
  },

  removeObserver: function(element) { // element instead of observer fixes mem leaks
    this.observers = this.observers.reject(function(o) {
      return o.element == element;
    });
    this._cacheObserverCallbacks();
  },

  notify: function(eventName, draggable, event) { // 'onStart', 'onEnd', 'onDrag'
    if (this[eventName + 'Count'] > 0) {
      this.observers.each(function(o) {
        if (o[eventName]) {
          o[eventName](eventName, draggable, event);
        }
      });
    }
    if (draggable.options[eventName]) {
      draggable.options[eventName](draggable, event);
    }
  },

  _cacheObserverCallbacks: function() {
    ['onStart', 'onEnd', 'onDrag'].each(function(eventName) {
      Draggables[eventName + 'Count'] = Draggables.observers.select(function(o) {
        return o[eventName];
      }).length;
    });
  }
};

/*--------------------------------------------------------------------------*/

var Draggable = Class.create({
  initialize: function(element) {
    var defaults = {
      handle: false,
      reverteffect: function(element, top_offset, left_offset) {
        var dur = Math.sqrt(Math.abs(top_offset ^ 2) + Math.abs(left_offset ^ 2)) * 0.02;
        new Effect.Move(element, {
          x: -left_offset,
          y: -top_offset,
          duration: dur,
          queue: {
            scope: '_draggable',
            position: 'end'
          }
        });
      },
      endeffect: function(element) {
        var toOpacity = Object.isNumber(element._opacity) ? element._opacity : 1.0;
        new Effect.Opacity(element, {
          duration: 0.2,
          from: 0.7,
          to: toOpacity,
          queue: {
            scope: '_draggable',
            position: 'end'
          },
          afterFinish: function() {
            Draggable._dragging[element] = false;
          }
        });
      },
      zindex: 1000,
      revert: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      snap: false, // false, or xy or [x,y] or function(x,y){ return [x,y] }
      delay: 0
    };

    if (!arguments[1] || Object.isUndefined(arguments[1].endeffect)) {
      Object.extend(defaults, {
        starteffect: function(element) {
          element._opacity = Element.getOpacity(element);
          Draggable._dragging[element] = true;
          new Effect.Opacity(element, {
            duration: 0.2,
            from: element._opacity,
            to: 0.7
          });
        }
      });
    }

    var options = Object.extend(defaults, arguments[1] || {});

    this.element = $(element);

    if (options.handle && Object.isString(options.handle)) {
      this.handle = this.element.down('.' + options.handle, 0);
    }

    if (!this.handle) {
      this.handle = $(options.handle);
    }
    if (!this.handle) {
      this.handle = this.element;
    }

    if (options.scroll && !options.scroll.scrollTo && !options.scroll.outerHTML) {
      options.scroll = $(options.scroll);
      this._isScrollChild = Element.childOf(this.element, options.scroll);
    }

    Element.makePositioned(this.element); // fix IE
    this.options = options;
    this.dragging = false;

    this.eventMouseDown = this.initDrag.bindAsEventListener(this);
    Event.observe(this.handle, "mousedown", this.eventMouseDown);

    Draggables.register(this);
  },

  destroy: function() {
    Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
    Draggables.unregister(this);
  },

  currentDelta: function() {
    return ([parseInt(Element.getStyle(this.element, 'left') || '0', 10), parseInt(Element.getStyle(this.element, 'top') || '0', 10)]);
  },

  initDrag: function(event) {
    if (!Object.isUndefined(Draggable._dragging[this.element]) && Draggable._dragging[this.element]) {
      return;
    }
    if (Event.isLeftClick(event)) {
      // abort on form elements, fixes a Firefox issue
      var src = Event.element(event), tag_name = src.tagName.toUpperCase();
      if (tag_name && (tag_name == 'INPUT' || tag_name == 'SELECT' || tag_name == 'OPTION' || tag_name == 'BUTTON' || tag_name == 'TEXTAREA')) {
        return;
      }

      var pointer = [Event.pointerX(event), Event.pointerY(event)], pos = this.element.cumulativeOffset();
      this.offset = [pointer[0] - pos[0], pointer[1] - pos[1]];

      Draggables.activate(this);
      Event.stop(event);
    }
  },

  startDrag: function(event) {
    this.dragging = true;
    if (!this.delta) {
      this.delta = this.currentDelta();
    }

    if (this.options.zindex) {
      this.originalZ = parseInt(Element.getStyle(this.element, 'z-index') || 0, 10);
      this.element.style.zIndex = this.options.zindex;
    }

    if (this.options.ghosting) {
      this._clone = this.element.cloneNode(true);
      this._originallyAbsolute = (this.element.getStyle('position') == 'absolute');
      if (!this._originallyAbsolute) {
        Position.prepare();
        Element.absolutize(this.element);
      }
      this.element.parentNode.insertBefore(this._clone, this.element);
    }

    var s = this.options.scroll;
    if (s) {
      if (s == window) {
        s = this._getWindowScroll();
      }
      this.originalScrollLeft = s.scrollLeft;
      this.originalScrollTop = s.scrollTop;
    }

    Draggables.notify('onStart', this, event);

    if (this.options.starteffect) {
      this.options.starteffect(this.element);
    }
  },

  updateDrag: function(event, pointer) {
    if (!this.dragging) {
      this.startDrag(event);
    }

    if (!this.options.quiet) {
      Position.prepare();
      Droppables.show(pointer, this.element);
    }

    Draggables.notify('onDrag', this, event);

    this.draw(pointer);
    if (this.options.change) {
      this.options.change(this);
    }

    var s = this.options.scroll;
    if (s) {
      this.stopScrolling();

      var p, sensitivity = this.options.scrollSensitivity;
      if (s == window) {
        s = this._getWindowScroll();
        p = [s.scrollLeft, s.scrollTop];
      } else {
        p = Element.viewportOffset(s).toArray();
        p[0] += s.scrollLeft + Position.deltaX;
        p[1] += s.scrollTop + Position.deltaY;
      }
      p.push(p[0] + s.offsetWidth);
      p.push(p[1] + s.offsetHeight);

      p[0] = pointer[0] - (p[0] + sensitivity);
      p[1] = pointer[1] - (p[1] + sensitivity);
      p[2] = pointer[0] - (p[2] - sensitivity);
      p[3] = pointer[1] - (p[3] - sensitivity);

      var speed = [(p[0] < 0) ? p[0] : ((p[2] > 0) ? p[2] : 0), (p[1] < 0) ? p[1] : ((p[3] > 0) ? p[3] : 0)];
      this.startScrolling(speed);
    }

    // fix AppleWebKit rendering
    if (Prototype.Browser.WebKit) {
      window.scrollBy(0, 0);
    }

    Event.stop(event);
  },

  finishDrag: function(event, success) {
    this.dragging = false;

    if (this.options.quiet) {
      Position.prepare();
      Droppables.show([Event.pointerX(event), Event.pointerY(event)], this.element);
    }

    if (this.options.ghosting) {
      if (!this._originallyAbsolute) {
        Position.prepare();
        Element.relativize(this.element);
      }
      delete this._originallyAbsolute;
      Element.remove(this._clone);
      this._clone = null;
    }

    var dropped = false;
    if (success) {
      dropped = Droppables.fire(event, this.element);
      if (!dropped) {
        dropped = false;
      }
    }
    if (dropped && this.options.onDropped) {
      this.options.onDropped(this.element);
    }
    Draggables.notify('onEnd', this, event);

    var revert = this.options.revert;
    if (revert && Object.isFunction(revert)) {
      revert = revert(this.element);
    }

    var d = this.currentDelta();
    if (revert && this.options.reverteffect) {
      if (dropped == 0 || revert != 'failure') {
        this.options.reverteffect(this.element, d[1] - this.delta[1], d[0] - this.delta[0]);
      }
    } else {
      this.delta = d;
    }

    if (this.options.zindex) {
      this.element.style.zIndex = this.originalZ;
    }

    if (this.options.endeffect) {
      this.options.endeffect(this.element);
    }

    Draggables.deactivate(this);
    Droppables.reset();
  },

  keyPress: function(event) {
    if (event.keyCode != Event.KEY_ESC) {
      return;
    }
    this.finishDrag(event, false);
    Event.stop(event);
  },

  endDrag: function(event) {
    if (!this.dragging) {
      return;
    }
    this.stopScrolling();
    this.finishDrag(event, true);
    Event.stop(event);
  },

  draw: function(point) {
    var pos = this.element.cumulativeOffset(), o = this.options;
    if (o.ghosting) {
      var r = Element.cumulativeScrollOffset(this.element);
      pos[0] += r[0] - Position.deltaX;
      pos[1] += r[1] - Position.deltaY;
    }

    var d = this.currentDelta();
    pos[0] -= d[0];
    pos[1] -= d[1];

    if (o.scroll && (o.scroll != window && this._isScrollChild)) {
      pos[0] -= o.scroll.scrollLeft - this.originalScrollLeft;
      pos[1] -= o.scroll.scrollTop - this.originalScrollTop;
    }

    var p = [point[0] - pos[0] - this.offset[0], point[1] - pos[1] - this.offset[1]];

    if (o.snap) {
      if (Object.isFunction(o.snap)) {
        p = o.snap(p[0], p[1], this);
      } else if (Object.isArray(o.snap)) {
        p[0] = (p[0] / o.snap[0]).round() * o.snap[0];
        p[1] = (p[1] / o.snap[1]).round() * o.snap[1];
      } else {
        p[0] = (p[0] / o.snap).round() * o.snap;
        p[1] = (p[1] / o.snap).round() * o.snap;
      }
    }

    var style = this.element.style;
    if ((!o.constraint) || (o.constraint == 'horizontal')) {
      style.left = p[0] + "px";
    }
    if ((!o.constraint) || (o.constraint == 'vertical')) {
      style.top = p[1] + "px";
    }

    if (style.visibility == "hidden") {
      style.visibility = ""; // fix gecko rendering
    }
  },

  stopScrolling: function() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
      Draggables._lastScrollPointer = null;
    }
  },

  startScrolling: function(speed) {
    if (!(speed[0] || speed[1])) {
      return;
    }
    this.scrollSpeed = [speed[0] * this.options.scrollSpeed, speed[1] * this.options.scrollSpeed];
    this.lastScrolled = new Date();
    this.scrollInterval = setInterval(this.scroll.bind(this), 10);
  },

  scroll: function() {
    var current = new Date(), delta = (current - this.lastScrolled) / 1000, s = this.options.scroll;
    this.lastScrolled = current;
    if (s == window) {
      if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
        s = this._getWindowScroll();
        window.scrollTo(s.scrollLeft + delta * this.scrollSpeed[0], s.scrollTop + delta * this.scrollSpeed[1]);
      }
    } else {
      s.scrollLeft += this.scrollSpeed[0] * delta;
      s.scrollTop += this.scrollSpeed[1] * delta;
    }

    Position.prepare();
    Droppables.show(Draggables._lastPointer, this.element);
    Draggables.notify('onDrag', this);
    if (this._isScrollChild) {
      Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
      Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * delta;
      Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * delta;
      if (Draggables._lastScrollPointer[0] < 0) {
        Draggables._lastScrollPointer[0] = 0;
      }
      if (Draggables._lastScrollPointer[1] < 0) {
        Draggables._lastScrollPointer[1] = 0;
      }
      this.draw(Draggables._lastScrollPointer);
    }

    if (this.options.change) {
      this.options.change(this);
    }
  },

  _getWindowScroll: function() {
    var T, L, W, H, w = window, d = w.document;

    if (d.documentElement && d.documentElement.scrollTop) {
      T = d.documentElement.scrollTop;
      L = d.documentElement.scrollLeft;
    } else if (d.body) {
      T = d.body.scrollTop;
      L = d.body.scrollLeft;
    }
    if (w.innerWidth) {
      W = w.innerWidth;
      H = w.innerHeight;
    } else if (d.documentElement && d.documentElement.clientWidth) {
      W = d.documentElement.clientWidth;
      H = d.documentElement.clientHeight;
    } else {
      W = d.body.offsetWidth;
      H = d.body.offsetHeight;
    }

    return {
      scrollTop: T,
      scrollLeft: L,
      offsetWidth: W,
      offsetHeight: H
    };
  }
});

Draggable._dragging = {};

/*--------------------------------------------------------------------------*/

var SortableObserver = Class.create({
  initialize: function(element, observer) {
    this.element = $(element);
    this.observer = observer;
    this.lastValue = Sortable.serialize(this.element);
  },

  onStart: function() {
    this.lastValue = Sortable.serialize(this.element);
  },

  onEnd: function() {
    Sortable.unmark();
    if (this.lastValue != Sortable.serialize(this.element)) {
      this.observer(this.element);
    }
  }
});

var Sortable = {
  SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,

  sortables: {},

  _findRootElement: function(element) {
    while (element.tagName.toUpperCase() != "BODY") {
      if (element.id && Sortable.sortables[element.id]) {
        return element;
      }
      element = element.parentNode;
    }
  },

  options: function(element) {
    element = Sortable._findRootElement($(element));
    if (!element) {
      return;
    }
    return Sortable.sortables[element.id];
  },

  destroy: function(element) {
    element = $(element);
    var s = Sortable.sortables[element.id];

    if (s) {
      Draggables.removeObserver(s.element);
      s.droppables.each(function(d) {
        Droppables.remove(d);
      });
      s.draggables.invoke('destroy');

      delete Sortable.sortables[s.element.id];
    }
  },

  create: function(element) {
    element = $(element);
    var options = Object.extend({
      element: element,
      tag: 'li', // assumes li children, override with tag: 'tagname'
      dropOnEmpty: false,
      tree: false,
      treeTag: 'ul',
      overlap: 'vertical', // one of 'vertical', 'horizontal'
      constraint: 'vertical', // one of 'vertical', 'horizontal', false
      containment: element, // also takes array of elements (or id's); or false
      handle: false, // or a CSS class
      only: false,
      delay: 0,
      hoverclass: null,
      ghosting: false,
      quiet: false,
      scroll: false,
      scrollSensitivity: 20,
      scrollSpeed: 15,
      format: this.SERIALIZE_RULE,

      // these take arrays of elements or ids and can be
      // used for better initialization performance
      elements: false,
      handles: false,

      onChange: Prototype.emptyFunction,
      onUpdate: Prototype.emptyFunction
    }, arguments[1] || {});

    // clear any old sortable with same element
    this.destroy(element);

    // build options for the draggables
    var options_for_draggable = {
      revert: true,
      quiet: options.quiet,
      scroll: options.scroll,
      scrollSpeed: options.scrollSpeed,
      scrollSensitivity: options.scrollSensitivity,
      delay: options.delay,
      ghosting: options.ghosting,
      constraint: options.constraint,
      handle: options.handle
    };

    if (options.starteffect) {
      options_for_draggable.starteffect = options.starteffect;
    }

    if (options.reverteffect) {
      options_for_draggable.reverteffect = options.reverteffect;
    } else if (options.ghosting) {
      options_for_draggable.reverteffect = function(element) {
        element.style.top = 0;
        element.style.left = 0;
      };
    }

    if (options.endeffect) {
      options_for_draggable.endeffect = options.endeffect;
    }

    if (options.zindex) {
      options_for_draggable.zindex = options.zindex;
    }

    // build options for the droppables
    var options_for_droppable = {
      overlap: options.overlap,
      containment: options.containment,
      tree: options.tree,
      hoverclass: options.hoverclass,
      onHover: Sortable.onHover
    };

    var options_for_tree = {
      onHover: Sortable.onEmptyHover,
      overlap: options.overlap,
      containment: options.containment,
      hoverclass: options.hoverclass
    };

    // fix for gecko engine
    Element.cleanWhitespace(element);

    options.draggables = [];
    options.droppables = [];

    // drop on empty handling
    if (options.dropOnEmpty || options.tree) {
      Droppables.add(element, options_for_tree);
      options.droppables.push(element);
    }

    (options.elements || this.findElements(element, options) || []).each(function(e, i) {
      var handle = options.handles ? $(options.handles[i]) : (options.handle ? $(e).select('.' + options.handle)[0] : e);
      options.draggables.push(new Draggable(e, Object.extend(options_for_draggable, {
        handle: handle
      })));
      Droppables.add(e, options_for_droppable);
      if (options.tree) {
        e.treeNode = element;
      }
      options.droppables.push(e);
    });

    if (options.tree) {
      (Sortable.findTreeElements(element, options) || []).each(function(e) {
        Droppables.add(e, options_for_tree);
        e.treeNode = element;
        options.droppables.push(e);
      });
    }

    // keep reference
    this.sortables[element.identify()] = options;

    // for onupdate
    Draggables.addObserver(new SortableObserver(element, options.onUpdate));

  },

  // return all suitable-for-sortable elements in a guaranteed order
  findElements: function(element, options) {
    return Element.findChildren(element, options.only, options.tree ? true : false, options.tag);
  },

  findTreeElements: function(element, options) {
    return Element.findChildren(element, options.only, options.tree ? true : false, options.treeTag);
  },

  onHover: function(element, dropon, overlap) {
    if (Element.isParent(dropon, element)) {
      return;
    }
    var oldParentNode;

    if (overlap > 0.33 && overlap < 0.66 && Sortable.options(dropon).tree) {
      return;
    } else if (overlap > 0.5) {
      Sortable.mark(dropon, 'before');
      if (dropon.previousSibling != element) {
        oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, dropon);
        if (dropon.parentNode != oldParentNode) {
          Sortable.options(oldParentNode).onChange(element);
        }
        Sortable.options(dropon.parentNode).onChange(element);
      }
    } else {
      Sortable.mark(dropon, 'after');
      var nextElement = dropon.nextSibling || null;
      if (nextElement != element) {
        oldParentNode = element.parentNode;
        element.style.visibility = "hidden"; // fix gecko rendering
        dropon.parentNode.insertBefore(element, nextElement);
        if (dropon.parentNode != oldParentNode) {
          Sortable.options(oldParentNode).onChange(element);
        }
        Sortable.options(dropon.parentNode).onChange(element);
      }
    }
  },

  onEmptyHover: function(element, dropon, overlap) {
    var oldParentNode = element.parentNode;
    var droponOptions = Sortable.options(dropon);

    if (!Element.isParent(dropon, element)) {
      var index;

      var children = Sortable.findElements(dropon, {
        tag: droponOptions.tag,
        only: droponOptions.only
      });
      var child = null;

      if (children) {
        var offset = Element.offsetSize(dropon, droponOptions.overlap) * (1.0 - overlap);

        for (index = 0; index < children.length; index += 1) {
          if (offset - Element.offsetSize(children[index], droponOptions.overlap) >= 0) {
            offset -= Element.offsetSize(children[index], droponOptions.overlap);
          } else if (offset - (Element.offsetSize(children[index], droponOptions.overlap) / 2) >= 0) {
            child = index + 1 < children.length ? children[index + 1] : null;
            break;
          } else {
            child = children[index];
            break;
          }
        }
      }

      dropon.insertBefore(element, child);

      Sortable.options(oldParentNode).onChange(element);
      droponOptions.onChange(element);
    }
  },

  unmark: function() {
    if (Sortable._marker) {
      Sortable._marker.hide();
    }
  },

  mark: function(dropon, position) {
    // mark on ghosting only
    var sortable = Sortable.options(dropon.parentNode);
    if (sortable && !sortable.ghosting) {
      return;
    }

    if (!Sortable._marker) {
      Sortable._marker = ($('dropmarker') || Element.extend(document.createElement('DIV'))).hide().addClassName('dropmarker').setStyle({
        position: 'absolute'
      });
      document.getElementsByTagName("body").item(0).appendChild(Sortable._marker);
    }
    var offsets = dropon.cumulativeOffset();
    Sortable._marker.setStyle({
      left: offsets[0] + 'px',
      top: offsets[1] + 'px'
    });

    if (position == 'after') {
      if (sortable.overlap == 'horizontal') {
        Sortable._marker.setStyle({
          left: (offsets[0] + dropon.clientWidth) + 'px'
        });
      } else {
        Sortable._marker.setStyle({
          top: (offsets[1] + dropon.clientHeight) + 'px'
        });
      }
    }

    Sortable._marker.show();
  },

  _tree: function(element, options, parent) {
    var children = Sortable.findElements(element, options) || [];

    for (var i = 0; i < children.length; ++i) {
      var match = children[i].id.match(options.format);

      if (!match) {
        continue;
      }

      var child = {
        id: encodeURIComponent(match ? match[1] : null),
        element: element,
        parent: parent,
        children: [],
        position: parent.children.length,
        container: $(children[i]).down(options.treeTag)
      };

      /* Get the element containing the children and recurse over it */
      if (child.container) {
        this._tree(child.container, options, child);
      }

      parent.children.push(child);
    }

    return parent;
  },

  tree: function(element) {
    element = $(element);
    var sortableOptions = this.options(element);
    var options = Object.extend({
      tag: sortableOptions.tag,
      treeTag: sortableOptions.treeTag,
      only: sortableOptions.only,
      name: element.id,
      format: sortableOptions.format
    }, arguments[1] || {});

    var root = {
      id: null,
      parent: null,
      children: [],
      container: element,
      position: 0
    };

    return Sortable._tree(element, options, root);
  },

  /* Construct a [i] index for a particular node */
  _constructIndex: function(node) {
    var index = '';
    do {
      if (node.id) {
        index = '[' + node.position + ']' + index;
      }
    } while ((node = node.parent) != null);
    return index;
  },

  sequence: function(element) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[1] || {});

    return $(this.findElements(element, options) || []).map(function(item) {
      return item.id.match(options.format) ? item.id.match(options.format)[1] : '';
    });
  },

  setSequence: function(element, new_sequence) {
    element = $(element);
    var options = Object.extend(this.options(element), arguments[2] || {});

    var nodeMap = {};
    this.findElements(element, options).each(function(n) {
      if (n.id.match(options.format)) {
        nodeMap[n.id.match(options.format)[1]] = [n, n.parentNode];
      }
      n.parentNode.removeChild(n);
    });

    new_sequence.each(function(ident) {
      var n = nodeMap[ident];
      if (n) {
        n[1].appendChild(n[0]);
        delete nodeMap[ident];
      }
    });
  },

  serialize: function(element) {
    element = $(element);
    var options = Object.extend(Sortable.options(element), arguments[1] || {});
    var name = encodeURIComponent((arguments[1] && arguments[1].name) ? arguments[1].name : element.id);

    if (options.tree) {
      return Sortable.tree(element, arguments[1]).children.map(function(item) {
        return [name + Sortable._constructIndex(item) + "[id]=" +
        encodeURIComponent(item.id)].concat(item.children.map(arguments.callee));
      }).flatten().join('&');
    } else {
      return Sortable.sequence(element, arguments[1]).map(function(item) {
        return name + "[]=" + encodeURIComponent(item);
      }).join('&');
    }
  }
};

// Returns true if child is contained within element
Element.isParent = function(child, element) {
  if (!child.parentNode || child == element) {
    return false;
  }
  if (child.parentNode == element) {
    return true;
  }
  return Element.isParent(child.parentNode, element);
};

Element.findChildren = function(element, only, recursive, tagName) {
  if (!element.hasChildNodes()) {
    return null;
  }
  tagName = tagName.toUpperCase();
  if (only) {
    only = [only].flatten();
  }
  var elements = [];
  $A(element.childNodes).each(function(e) {
    if (e.tagName && e.tagName.toUpperCase() == tagName &&
    (!only ||
    (Element.classNames(e).detect(function(v) {
      return only.include(v);
    })))) {
      elements.push(e);
    }
    if (recursive) {
      var grandchildren = Element.findChildren(e, only, recursive, tagName);
      if (grandchildren) {
        elements.push(grandchildren);
      }
    }
  });

  return (elements.length > 0 ? elements.flatten() : []);
};

Element.offsetSize = function(element, type) {
  return element['offset' + ((type == 'vertical' || type == 'height') ? 'Height' : 'Width')];
};
