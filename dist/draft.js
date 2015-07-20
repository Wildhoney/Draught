(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global define:false */
/**
 * Copyright 2015 Craig Campbell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Mousetrap is a simple keyboard shortcut library for Javascript with
 * no external dependencies
 *
 * @version 1.5.3
 * @url craig.is/killing/mice
 */
(function(window, document, undefined) {

    /**
     * mapping of special keycodes to their corresponding keys
     *
     * everything in this dictionary cannot use keypress events
     * so it has to be here to map to the correct keycodes for
     * keyup/keydown events
     *
     * @type {Object}
     */
    var _MAP = {
        8: 'backspace',
        9: 'tab',
        13: 'enter',
        16: 'shift',
        17: 'ctrl',
        18: 'alt',
        20: 'capslock',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'ins',
        46: 'del',
        91: 'meta',
        93: 'meta',
        224: 'meta'
    };

    /**
     * mapping for special characters so they can support
     *
     * this dictionary is only used incase you want to bind a
     * keyup or keydown event to one of these keys
     *
     * @type {Object}
     */
    var _KEYCODE_MAP = {
        106: '*',
        107: '+',
        109: '-',
        110: '.',
        111 : '/',
        186: ';',
        187: '=',
        188: ',',
        189: '-',
        190: '.',
        191: '/',
        192: '`',
        219: '[',
        220: '\\',
        221: ']',
        222: '\''
    };

    /**
     * this is a mapping of keys that require shift on a US keypad
     * back to the non shift equivelents
     *
     * this is so you can use keyup events with these keys
     *
     * note that this will only work reliably on US keyboards
     *
     * @type {Object}
     */
    var _SHIFT_MAP = {
        '~': '`',
        '!': '1',
        '@': '2',
        '#': '3',
        '$': '4',
        '%': '5',
        '^': '6',
        '&': '7',
        '*': '8',
        '(': '9',
        ')': '0',
        '_': '-',
        '+': '=',
        ':': ';',
        '\"': '\'',
        '<': ',',
        '>': '.',
        '?': '/',
        '|': '\\'
    };

    /**
     * this is a list of special strings you can use to map
     * to modifier keys when you specify your keyboard shortcuts
     *
     * @type {Object}
     */
    var _SPECIAL_ALIASES = {
        'option': 'alt',
        'command': 'meta',
        'return': 'enter',
        'escape': 'esc',
        'plus': '+',
        'mod': /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl'
    };

    /**
     * variable to store the flipped version of _MAP from above
     * needed to check if we should use keypress or not when no action
     * is specified
     *
     * @type {Object|undefined}
     */
    var _REVERSE_MAP;

    /**
     * loop through the f keys, f1 to f19 and add them to the map
     * programatically
     */
    for (var i = 1; i < 20; ++i) {
        _MAP[111 + i] = 'f' + i;
    }

    /**
     * loop through to map numbers on the numeric keypad
     */
    for (i = 0; i <= 9; ++i) {
        _MAP[i + 96] = i;
    }

    /**
     * cross browser add event method
     *
     * @param {Element|HTMLDocument} object
     * @param {string} type
     * @param {Function} callback
     * @returns void
     */
    function _addEvent(object, type, callback) {
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
            return;
        }

        object.attachEvent('on' + type, callback);
    }

    /**
     * takes the event and returns the key character
     *
     * @param {Event} e
     * @return {string}
     */
    function _characterFromEvent(e) {

        // for keypress events we should return the character as is
        if (e.type == 'keypress') {
            var character = String.fromCharCode(e.which);

            // if the shift key is not pressed then it is safe to assume
            // that we want the character to be lowercase.  this means if
            // you accidentally have caps lock on then your key bindings
            // will continue to work
            //
            // the only side effect that might not be desired is if you
            // bind something like 'A' cause you want to trigger an
            // event when capital A is pressed caps lock will no longer
            // trigger the event.  shift+a will though.
            if (!e.shiftKey) {
                character = character.toLowerCase();
            }

            return character;
        }

        // for non keypress events the special maps are needed
        if (_MAP[e.which]) {
            return _MAP[e.which];
        }

        if (_KEYCODE_MAP[e.which]) {
            return _KEYCODE_MAP[e.which];
        }

        // if it is not in the special map

        // with keydown and keyup events the character seems to always
        // come in as an uppercase character whether you are pressing shift
        // or not.  we should make sure it is always lowercase for comparisons
        return String.fromCharCode(e.which).toLowerCase();
    }

    /**
     * checks if two arrays are equal
     *
     * @param {Array} modifiers1
     * @param {Array} modifiers2
     * @returns {boolean}
     */
    function _modifiersMatch(modifiers1, modifiers2) {
        return modifiers1.sort().join(',') === modifiers2.sort().join(',');
    }

    /**
     * takes a key event and figures out what the modifiers are
     *
     * @param {Event} e
     * @returns {Array}
     */
    function _eventModifiers(e) {
        var modifiers = [];

        if (e.shiftKey) {
            modifiers.push('shift');
        }

        if (e.altKey) {
            modifiers.push('alt');
        }

        if (e.ctrlKey) {
            modifiers.push('ctrl');
        }

        if (e.metaKey) {
            modifiers.push('meta');
        }

        return modifiers;
    }

    /**
     * prevents default for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _preventDefault(e) {
        if (e.preventDefault) {
            e.preventDefault();
            return;
        }

        e.returnValue = false;
    }

    /**
     * stops propogation for this event
     *
     * @param {Event} e
     * @returns void
     */
    function _stopPropagation(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
            return;
        }

        e.cancelBubble = true;
    }

    /**
     * determines if the keycode specified is a modifier key or not
     *
     * @param {string} key
     * @returns {boolean}
     */
    function _isModifier(key) {
        return key == 'shift' || key == 'ctrl' || key == 'alt' || key == 'meta';
    }

    /**
     * reverses the map lookup so that we can look for specific keys
     * to see what can and can't use keypress
     *
     * @return {Object}
     */
    function _getReverseMap() {
        if (!_REVERSE_MAP) {
            _REVERSE_MAP = {};
            for (var key in _MAP) {

                // pull out the numeric keypad from here cause keypress should
                // be able to detect the keys from the character
                if (key > 95 && key < 112) {
                    continue;
                }

                if (_MAP.hasOwnProperty(key)) {
                    _REVERSE_MAP[_MAP[key]] = key;
                }
            }
        }
        return _REVERSE_MAP;
    }

    /**
     * picks the best action based on the key combination
     *
     * @param {string} key - character for key
     * @param {Array} modifiers
     * @param {string=} action passed in
     */
    function _pickBestAction(key, modifiers, action) {

        // if no action was picked in we should try to pick the one
        // that we think would work best for this key
        if (!action) {
            action = _getReverseMap()[key] ? 'keydown' : 'keypress';
        }

        // modifier keys don't work as expected with keypress,
        // switch to keydown
        if (action == 'keypress' && modifiers.length) {
            action = 'keydown';
        }

        return action;
    }

    /**
     * Converts from a string key combination to an array
     *
     * @param  {string} combination like "command+shift+l"
     * @return {Array}
     */
    function _keysFromString(combination) {
        if (combination === '+') {
            return ['+'];
        }

        combination = combination.replace(/\+{2}/g, '+plus');
        return combination.split('+');
    }

    /**
     * Gets info for a specific key combination
     *
     * @param  {string} combination key combination ("command+s" or "a" or "*")
     * @param  {string=} action
     * @returns {Object}
     */
    function _getKeyInfo(combination, action) {
        var keys;
        var key;
        var i;
        var modifiers = [];

        // take the keys from this pattern and figure out what the actual
        // pattern is all about
        keys = _keysFromString(combination);

        for (i = 0; i < keys.length; ++i) {
            key = keys[i];

            // normalize key names
            if (_SPECIAL_ALIASES[key]) {
                key = _SPECIAL_ALIASES[key];
            }

            // if this is not a keypress event then we should
            // be smart about using shift keys
            // this will only work for US keyboards however
            if (action && action != 'keypress' && _SHIFT_MAP[key]) {
                key = _SHIFT_MAP[key];
                modifiers.push('shift');
            }

            // if this key is a modifier then add it to the list of modifiers
            if (_isModifier(key)) {
                modifiers.push(key);
            }
        }

        // depending on what the key combination is
        // we will try to pick the best event for it
        action = _pickBestAction(key, modifiers, action);

        return {
            key: key,
            modifiers: modifiers,
            action: action
        };
    }

    function _belongsTo(element, ancestor) {
        if (element === null || element === document) {
            return false;
        }

        if (element === ancestor) {
            return true;
        }

        return _belongsTo(element.parentNode, ancestor);
    }

    function Mousetrap(targetElement) {
        var self = this;

        targetElement = targetElement || document;

        if (!(self instanceof Mousetrap)) {
            return new Mousetrap(targetElement);
        }

        /**
         * element to attach key events to
         *
         * @type {Element}
         */
        self.target = targetElement;

        /**
         * a list of all the callbacks setup via Mousetrap.bind()
         *
         * @type {Object}
         */
        self._callbacks = {};

        /**
         * direct map of string combinations to callbacks used for trigger()
         *
         * @type {Object}
         */
        self._directMap = {};

        /**
         * keeps track of what level each sequence is at since multiple
         * sequences can start out with the same sequence
         *
         * @type {Object}
         */
        var _sequenceLevels = {};

        /**
         * variable to store the setTimeout call
         *
         * @type {null|number}
         */
        var _resetTimer;

        /**
         * temporary state where we will ignore the next keyup
         *
         * @type {boolean|string}
         */
        var _ignoreNextKeyup = false;

        /**
         * temporary state where we will ignore the next keypress
         *
         * @type {boolean}
         */
        var _ignoreNextKeypress = false;

        /**
         * are we currently inside of a sequence?
         * type of action ("keyup" or "keydown" or "keypress") or false
         *
         * @type {boolean|string}
         */
        var _nextExpectedAction = false;

        /**
         * resets all sequence counters except for the ones passed in
         *
         * @param {Object} doNotReset
         * @returns void
         */
        function _resetSequences(doNotReset) {
            doNotReset = doNotReset || {};

            var activeSequences = false,
                key;

            for (key in _sequenceLevels) {
                if (doNotReset[key]) {
                    activeSequences = true;
                    continue;
                }
                _sequenceLevels[key] = 0;
            }

            if (!activeSequences) {
                _nextExpectedAction = false;
            }
        }

        /**
         * finds all callbacks that match based on the keycode, modifiers,
         * and action
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event|Object} e
         * @param {string=} sequenceName - name of the sequence we are looking for
         * @param {string=} combination
         * @param {number=} level
         * @returns {Array}
         */
        function _getMatches(character, modifiers, e, sequenceName, combination, level) {
            var i;
            var callback;
            var matches = [];
            var action = e.type;

            // if there are no events related to this keycode
            if (!self._callbacks[character]) {
                return [];
            }

            // if a modifier key is coming up on its own we should allow it
            if (action == 'keyup' && _isModifier(character)) {
                modifiers = [character];
            }

            // loop through all callbacks for the key that was pressed
            // and see if any of them match
            for (i = 0; i < self._callbacks[character].length; ++i) {
                callback = self._callbacks[character][i];

                // if a sequence name is not specified, but this is a sequence at
                // the wrong level then move onto the next match
                if (!sequenceName && callback.seq && _sequenceLevels[callback.seq] != callback.level) {
                    continue;
                }

                // if the action we are looking for doesn't match the action we got
                // then we should keep going
                if (action != callback.action) {
                    continue;
                }

                // if this is a keypress event and the meta key and control key
                // are not pressed that means that we need to only look at the
                // character, otherwise check the modifiers as well
                //
                // chrome will not fire a keypress if meta or control is down
                // safari will fire a keypress if meta or meta+shift is down
                // firefox will fire a keypress if meta or control is down
                if ((action == 'keypress' && !e.metaKey && !e.ctrlKey) || _modifiersMatch(modifiers, callback.modifiers)) {

                    // when you bind a combination or sequence a second time it
                    // should overwrite the first one.  if a sequenceName or
                    // combination is specified in this call it does just that
                    //
                    // @todo make deleting its own method?
                    var deleteCombo = !sequenceName && callback.combo == combination;
                    var deleteSequence = sequenceName && callback.seq == sequenceName && callback.level == level;
                    if (deleteCombo || deleteSequence) {
                        self._callbacks[character].splice(i, 1);
                    }

                    matches.push(callback);
                }
            }

            return matches;
        }

        /**
         * actually calls the callback function
         *
         * if your callback function returns false this will use the jquery
         * convention - prevent default and stop propogation on the event
         *
         * @param {Function} callback
         * @param {Event} e
         * @returns void
         */
        function _fireCallback(callback, e, combo, sequence) {

            // if this event should not happen stop here
            if (self.stopCallback(e, e.target || e.srcElement, combo, sequence)) {
                return;
            }

            if (callback(e, combo) === false) {
                _preventDefault(e);
                _stopPropagation(e);
            }
        }

        /**
         * handles a character key event
         *
         * @param {string} character
         * @param {Array} modifiers
         * @param {Event} e
         * @returns void
         */
        self._handleKey = function(character, modifiers, e) {
            var callbacks = _getMatches(character, modifiers, e);
            var i;
            var doNotReset = {};
            var maxLevel = 0;
            var processedSequenceCallback = false;

            // Calculate the maxLevel for sequences so we can only execute the longest callback sequence
            for (i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].seq) {
                    maxLevel = Math.max(maxLevel, callbacks[i].level);
                }
            }

            // loop through matching callbacks for this key event
            for (i = 0; i < callbacks.length; ++i) {

                // fire for all sequence callbacks
                // this is because if for example you have multiple sequences
                // bound such as "g i" and "g t" they both need to fire the
                // callback for matching g cause otherwise you can only ever
                // match the first one
                if (callbacks[i].seq) {

                    // only fire callbacks for the maxLevel to prevent
                    // subsequences from also firing
                    //
                    // for example 'a option b' should not cause 'option b' to fire
                    // even though 'option b' is part of the other sequence
                    //
                    // any sequences that do not match here will be discarded
                    // below by the _resetSequences call
                    if (callbacks[i].level != maxLevel) {
                        continue;
                    }

                    processedSequenceCallback = true;

                    // keep a list of which sequences were matches for later
                    doNotReset[callbacks[i].seq] = 1;
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo, callbacks[i].seq);
                    continue;
                }

                // if there were no sequence matches but we are still here
                // that means this is a regular match so we should fire that
                if (!processedSequenceCallback) {
                    _fireCallback(callbacks[i].callback, e, callbacks[i].combo);
                }
            }

            // if the key you pressed matches the type of sequence without
            // being a modifier (ie "keyup" or "keypress") then we should
            // reset all sequences that were not matched by this event
            //
            // this is so, for example, if you have the sequence "h a t" and you
            // type "h e a r t" it does not match.  in this case the "e" will
            // cause the sequence to reset
            //
            // modifier keys are ignored because you can have a sequence
            // that contains modifiers such as "enter ctrl+space" and in most
            // cases the modifier key will be pressed before the next key
            //
            // also if you have a sequence such as "ctrl+b a" then pressing the
            // "b" key will trigger a "keypress" and a "keydown"
            //
            // the "keydown" is expected when there is a modifier, but the
            // "keypress" ends up matching the _nextExpectedAction since it occurs
            // after and that causes the sequence to reset
            //
            // we ignore keypresses in a sequence that directly follow a keydown
            // for the same character
            var ignoreThisKeypress = e.type == 'keypress' && _ignoreNextKeypress;
            if (e.type == _nextExpectedAction && !_isModifier(character) && !ignoreThisKeypress) {
                _resetSequences(doNotReset);
            }

            _ignoreNextKeypress = processedSequenceCallback && e.type == 'keydown';
        };

        /**
         * handles a keydown event
         *
         * @param {Event} e
         * @returns void
         */
        function _handleKeyEvent(e) {

            // normalize e.which for key events
            // @see http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            if (typeof e.which !== 'number') {
                e.which = e.keyCode;
            }

            var character = _characterFromEvent(e);

            // no character found then stop
            if (!character) {
                return;
            }

            // need to use === for the character check because the character can be 0
            if (e.type == 'keyup' && _ignoreNextKeyup === character) {
                _ignoreNextKeyup = false;
                return;
            }

            self.handleKey(character, _eventModifiers(e), e);
        }

        /**
         * called to set a 1 second timeout on the specified sequence
         *
         * this is so after each key press in the sequence you have 1 second
         * to press the next key before you have to start over
         *
         * @returns void
         */
        function _resetSequenceTimer() {
            clearTimeout(_resetTimer);
            _resetTimer = setTimeout(_resetSequences, 1000);
        }

        /**
         * binds a key sequence to an event
         *
         * @param {string} combo - combo specified in bind call
         * @param {Array} keys
         * @param {Function} callback
         * @param {string=} action
         * @returns void
         */
        function _bindSequence(combo, keys, callback, action) {

            // start off by adding a sequence level record for this combination
            // and setting the level to 0
            _sequenceLevels[combo] = 0;

            /**
             * callback to increase the sequence level for this sequence and reset
             * all other sequences that were active
             *
             * @param {string} nextAction
             * @returns {Function}
             */
            function _increaseSequence(nextAction) {
                return function() {
                    _nextExpectedAction = nextAction;
                    ++_sequenceLevels[combo];
                    _resetSequenceTimer();
                };
            }

            /**
             * wraps the specified callback inside of another function in order
             * to reset all sequence counters as soon as this sequence is done
             *
             * @param {Event} e
             * @returns void
             */
            function _callbackAndReset(e) {
                _fireCallback(callback, e, combo);

                // we should ignore the next key up if the action is key down
                // or keypress.  this is so if you finish a sequence and
                // release the key the final key will not trigger a keyup
                if (action !== 'keyup') {
                    _ignoreNextKeyup = _characterFromEvent(e);
                }

                // weird race condition if a sequence ends with the key
                // another sequence begins with
                setTimeout(_resetSequences, 10);
            }

            // loop through keys one at a time and bind the appropriate callback
            // function.  for any key leading up to the final one it should
            // increase the sequence. after the final, it should reset all sequences
            //
            // if an action is specified in the original bind call then that will
            // be used throughout.  otherwise we will pass the action that the
            // next key in the sequence should match.  this allows a sequence
            // to mix and match keypress and keydown events depending on which
            // ones are better suited to the key provided
            for (var i = 0; i < keys.length; ++i) {
                var isFinal = i + 1 === keys.length;
                var wrappedCallback = isFinal ? _callbackAndReset : _increaseSequence(action || _getKeyInfo(keys[i + 1]).action);
                _bindSingle(keys[i], wrappedCallback, action, combo, i);
            }
        }

        /**
         * binds a single keyboard combination
         *
         * @param {string} combination
         * @param {Function} callback
         * @param {string=} action
         * @param {string=} sequenceName - name of sequence if part of sequence
         * @param {number=} level - what part of the sequence the command is
         * @returns void
         */
        function _bindSingle(combination, callback, action, sequenceName, level) {

            // store a direct mapped reference for use with Mousetrap.trigger
            self._directMap[combination + ':' + action] = callback;

            // make sure multiple spaces in a row become a single space
            combination = combination.replace(/\s+/g, ' ');

            var sequence = combination.split(' ');
            var info;

            // if this pattern is a sequence of keys then run through this method
            // to reprocess each pattern one key at a time
            if (sequence.length > 1) {
                _bindSequence(combination, sequence, callback, action);
                return;
            }

            info = _getKeyInfo(combination, action);

            // make sure to initialize array if this is the first time
            // a callback is added for this key
            self._callbacks[info.key] = self._callbacks[info.key] || [];

            // remove an existing match if there is one
            _getMatches(info.key, info.modifiers, {type: info.action}, sequenceName, combination, level);

            // add this call back to the array
            // if it is a sequence put it at the beginning
            // if not put it at the end
            //
            // this is important because the way these are processed expects
            // the sequence ones to come first
            self._callbacks[info.key][sequenceName ? 'unshift' : 'push']({
                callback: callback,
                modifiers: info.modifiers,
                action: info.action,
                seq: sequenceName,
                level: level,
                combo: combination
            });
        }

        /**
         * binds multiple combinations to the same callback
         *
         * @param {Array} combinations
         * @param {Function} callback
         * @param {string|undefined} action
         * @returns void
         */
        self._bindMultiple = function(combinations, callback, action) {
            for (var i = 0; i < combinations.length; ++i) {
                _bindSingle(combinations[i], callback, action);
            }
        };

        // start!
        _addEvent(targetElement, 'keypress', _handleKeyEvent);
        _addEvent(targetElement, 'keydown', _handleKeyEvent);
        _addEvent(targetElement, 'keyup', _handleKeyEvent);
    }

    /**
     * binds an event to mousetrap
     *
     * can be a single key, a combination of keys separated with +,
     * an array of keys, or a sequence of keys separated by spaces
     *
     * be sure to list the modifier keys first to make sure that the
     * correct key ends up getting bound (the last key in the pattern)
     *
     * @param {string|Array} keys
     * @param {Function} callback
     * @param {string=} action - 'keypress', 'keydown', or 'keyup'
     * @returns void
     */
    Mousetrap.prototype.bind = function(keys, callback, action) {
        var self = this;
        keys = keys instanceof Array ? keys : [keys];
        self._bindMultiple.call(self, keys, callback, action);
        return self;
    };

    /**
     * unbinds an event to mousetrap
     *
     * the unbinding sets the callback function of the specified key combo
     * to an empty function and deletes the corresponding key in the
     * _directMap dict.
     *
     * TODO: actually remove this from the _callbacks dictionary instead
     * of binding an empty function
     *
     * the keycombo+action has to be exactly the same as
     * it was defined in the bind method
     *
     * @param {string|Array} keys
     * @param {string} action
     * @returns void
     */
    Mousetrap.prototype.unbind = function(keys, action) {
        var self = this;
        return self.bind.call(self, keys, function() {}, action);
    };

    /**
     * triggers an event that has already been bound
     *
     * @param {string} keys
     * @param {string=} action
     * @returns void
     */
    Mousetrap.prototype.trigger = function(keys, action) {
        var self = this;
        if (self._directMap[keys + ':' + action]) {
            self._directMap[keys + ':' + action]({}, keys);
        }
        return self;
    };

    /**
     * resets the library back to its initial state.  this is useful
     * if you want to clear out the current keyboard shortcuts and bind
     * new ones - for example if you switch to another page
     *
     * @returns void
     */
    Mousetrap.prototype.reset = function() {
        var self = this;
        self._callbacks = {};
        self._directMap = {};
        return self;
    };

    /**
     * should we stop this event before firing off callbacks
     *
     * @param {Event} e
     * @param {Element} element
     * @return {boolean}
     */
    Mousetrap.prototype.stopCallback = function(e, element) {
        var self = this;

        // if the element has the class "mousetrap" then no need to stop
        if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
            return false;
        }

        if (_belongsTo(element, self.target)) {
            return false;
        }

        // stop for input, select, and textarea
        return element.tagName == 'INPUT' || element.tagName == 'SELECT' || element.tagName == 'TEXTAREA' || element.isContentEditable;
    };

    /**
     * exposes _handleKey publicly so it can be overwritten by extensions
     */
    Mousetrap.prototype.handleKey = function() {
        var self = this;
        return self._handleKey.apply(self, arguments);
    };

    /**
     * Init the global mousetrap functions
     *
     * This method is needed to allow the global mousetrap functions to work
     * now that mousetrap is a constructor function.
     */
    Mousetrap.init = function() {
        var documentMousetrap = Mousetrap(document);
        for (var method in documentMousetrap) {
            if (method.charAt(0) !== '_') {
                Mousetrap[method] = (function(method) {
                    return function() {
                        return documentMousetrap[method].apply(documentMousetrap, arguments);
                    };
                } (method));
            }
        }
    };

    Mousetrap.init();

    // expose mousetrap to the global object
    window.Mousetrap = Mousetrap;

    // expose as a common js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Mousetrap;
    }

    // expose mousetrap as an AMD module
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Mousetrap;
        });
    }
}) (window, document);

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersMiddleman = require('./helpers/Middleman');

var _helpersMiddleman2 = _interopRequireDefault(_helpersMiddleman);

var _helpersSymbols = require('./helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

var _helpersBoundingBox = require('./helpers/BoundingBox');

var _helpersBoundingBox2 = _interopRequireDefault(_helpersBoundingBox);

var _helpersPolyfills = require('./helpers/Polyfills');

var _helpersInvocator = require('./helpers/Invocator');

var _helpersInvocator2 = _interopRequireDefault(_helpersInvocator);

var _helpersMapper = require('./helpers/Mapper');

var _helpersMapper2 = _interopRequireDefault(_helpersMapper);

/**
 * @module Draft
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Draft = (function () {

    /**
     * @constructor
     * @param {HTMLElement} element
     * @param {Object} [options={}]
     * @return {Draft}
     */

    function Draft(element) {
        var _this = this;

        var options = arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Draft);

        this[_helpersSymbols2['default'].SHAPES] = [];
        this[_helpersSymbols2['default'].OPTIONS] = (Object.assign || _helpersPolyfills.objectAssign)(this.options(), options);
        var middleman = this[_helpersSymbols2['default'].MIDDLEMAN] = new _helpersMiddleman2['default'](this);
        this[_helpersSymbols2['default'].BOUNDING_BOX] = new _helpersBoundingBox2['default'](middleman);

        // Render the SVG component using the defined options.
        var width = this[_helpersSymbols2['default'].OPTIONS].documentWidth;
        var height = this[_helpersSymbols2['default'].OPTIONS].documentHeight;
        var svg = this[_helpersSymbols2['default'].SVG] = d3.select(element).attr('width', width).attr('height', height);

        var stopPropagation = function stopPropagation() {
            return d3.event.stopPropagation();
        };
        this[_helpersSymbols2['default'].LAYERS] = {
            shapes: svg.append('g').attr('class', 'shapes').on('click', stopPropagation),
            boundingBox: svg.append('g').attr('class', 'bounding').on('click', stopPropagation),
            resize: svg.append('g').attr('class', 'resize').on('click', stopPropagation)
        };

        // Deselect all shapes when the canvas is clicked.
        svg.on('click', function () {

            if (!middleman.preventDeselect()) {
                _this.deselect();
            }

            middleman.preventDeselect(false);
        });
    }

    _createClass(Draft, [{
        key: 'add',

        /**
         * @method add
         * @param {Shape|String} shape
         * @return {Shape}
         */
        value: function add(shape) {

            // Resolve the shape name to the shape object, if the user has passed the shape
            // as a string.
            shape = typeof shape === 'string' ? (0, _helpersMapper2['default'])(shape) : shape;

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            shapes.push(shape);

            // Put the interface for interacting with Draft into the shape object.
            shape[_helpersSymbols2['default'].MIDDLEMAN] = this[_helpersSymbols2['default'].MIDDLEMAN];
            _helpersInvocator2['default'].did('add', shape);

            return shape;
        }
    }, {
        key: 'remove',

        /**
         * @method remove
         * @param {Shape} shape
         * @return {Number}
         */
        value: function remove(shape) {

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            var index = shapes.indexOf(shape);

            shapes.splice(index, 1);
            _helpersInvocator2['default'].did('remove', shape);

            return shapes.length;
        }
    }, {
        key: 'clear',

        /**
         * @method clear
         * @return {Number}
         */
        value: function clear() {

            var shapes = this[_helpersSymbols2['default'].SHAPES];
            _helpersInvocator2['default'].did('remove', shapes);
            shapes.length = 0;

            return shapes.length;
        }
    }, {
        key: 'all',

        /**
         * @method all
         * @return {Array}
         */
        value: function all() {
            return this[_helpersSymbols2['default'].SHAPES];
        }
    }, {
        key: 'select',

        /**
         * @method select
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function select() {
            var shapes = arguments[0] === undefined ? this.all() : arguments[0];

            _helpersInvocator2['default'].did('select', shapes);
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].boundingBox);
        }
    }, {
        key: 'deselect',

        /**
         * @method deselect
         * @param {Array} [shapes=this.all()]
         * @return {void}
         */
        value: function deselect() {
            var shapes = arguments[0] === undefined ? this.all() : arguments[0];

            _helpersInvocator2['default'].did('deselect', shapes);
            this[_helpersSymbols2['default'].BOUNDING_BOX].drawBoundingBox(this.selected(), this[_helpersSymbols2['default'].LAYERS].boundingBox);
        }
    }, {
        key: 'selected',

        /**
         * @method selected
         * @return {Array}
         */
        value: function selected() {
            return this.all().filter(function (shape) {
                return shape.isSelected();
            });
        }
    }, {
        key: 'options',

        /**
         * @method options
         * @return {Object}
         */
        value: function options() {

            return this[_helpersSymbols2['default'].OPTIONS] || {
                documentHeight: '100%',
                documentWidth: '100%',
                gridSize: 10,
                handleRadius: 22,
                defaultMoveStep: 1,
                shiftMoveStep: 10
            };
        }
    }]);

    return Draft;
})();

(function ($window) {

    'use strict';

    if ($window) {

        // Export draft if the `window` object is available.
        $window.Draft = Draft;
    }
})(window);

// Export for use in ES6 applications.
exports['default'] = Draft;
module.exports = exports['default'];

},{"./helpers/BoundingBox":7,"./helpers/Invocator":8,"./helpers/Mapper":10,"./helpers/Middleman":11,"./helpers/Polyfills":12,"./helpers/Symbols":13}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbols = require('../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Ability = (function () {
  function Ability() {
    _classCallCheck(this, Ability);
  }

  _createClass(Ability, [{
    key: 'shape',

    /**
     * @method shape
     * @return {Ability}
     */
    value: function shape() {
      return this[_helpersSymbols2['default'].SHAPE];
    }
  }, {
    key: 'middleman',

    /**
     * @method middleman
     * @return {Middleman}
     */
    value: function middleman() {
      return this.shape()[_helpersSymbols2['default'].MIDDLEMAN];
    }
  }]);

  return Ability;
})();

exports['default'] = Ability;
module.exports = exports['default'];

},{"../helpers/Symbols":13}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _helpersSymbols = require('./../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Resizable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Resizable = (function (_Ability) {

    /**
     * @constructor
     * @return {Resizable}
     */

    function Resizable() {
        _classCallCheck(this, Resizable);

        _get(Object.getPrototypeOf(Resizable.prototype), 'constructor', this).call(this);
        this.edges = {};
    }

    _inherits(Resizable, _Ability);

    _createClass(Resizable, [{
        key: 'didSelect',

        /**
         * @method didSelect
         * @return {void}
         */
        value: function didSelect() {
            this.RADIUS = this.middleman().options().handleRadius;
            this.reattachHandles();
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this.detachHandles();
        }
    }, {
        key: 'reattachHandles',

        /**
         * @method reattachHandles
         * @return {void}
         */
        value: function reattachHandles() {
            this.detachHandles();
            this.attachHandles();
        }
    }, {
        key: 'attachHandles',

        /**
         * @method attachHandles
         * @return {void}
         */
        value: function attachHandles() {
            var _this = this;

            var shape = this.shape();
            var layer = this.middleman().layers().resize;
            this.layer = layer.append('g');

            var x = shape.attr('x');
            var y = shape.attr('y');
            var width = shape.attr('width');
            var height = shape.attr('height');

            var edgeMap = {
                topLeft: { x: x, y: y },
                topMiddle: { x: x + width / 2, y: y },
                topRight: { x: x + width, y: y },
                leftMiddle: { x: x, y: y + height / 2 },
                bottomLeft: { x: x, y: y + height },
                bottomMiddle: { x: x + width / 2, y: y + height },
                bottomRight: { x: x + width, y: y + height },
                rightMiddle: { x: x + width, y: y + height / 2 }
            };

            Object.keys(edgeMap).forEach(function (key) {

                var edge = edgeMap[key];
                var dragBehaviour = _this.drag(shape, key);

                _this.edges[key] = _this.layer.append('image').attr('xlink:href', 'images/handle-main.png').attr('x', edge.x - _this.RADIUS / 2).attr('y', edge.y - _this.RADIUS / 2).attr('stroke', 'red').attr('stroke-width', 3).attr('width', _this.RADIUS).attr('height', _this.RADIUS).on('click', function () {
                    return d3.event.stopPropagation();
                }).call(d3.behavior.drag().on('dragstart', dragBehaviour.start).on('drag', dragBehaviour.drag).on('dragend', dragBehaviour.end));
            });
        }
    }, {
        key: 'detachHandles',

        /**
         * @method detachHandles
         * @return {void}
         */
        value: function detachHandles() {

            if (this.layer) {
                this.layer.remove();
            }
        }
    }, {
        key: 'popUnique',

        /**
         * @method popUnique
         * @param {Array} items
         * @return {Number}
         */
        value: function popUnique(items) {

            var counts = {};

            for (var index = 0; index < items.length; index++) {
                var num = items[index];
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }

            var unique = Object.keys(counts).filter(function (key) {
                return counts[key] === 1;
            });

            return unique.length ? Number(unique[0]) : items[0];
        }
    }, {
        key: 'rearrangeHandles',

        /**
         * @method rearrangeHandles
         * @param {String} currentKey
         * @return {void}
         */
        value: function rearrangeHandles(currentKey) {
            var _this2 = this;

            var coords = [];
            var regExp = /(?=[A-Z])/;
            var dimensions = Object.keys(this.edges);

            dimensions.forEach(function (key) {

                // Package all of the coordinates up into a more simple `coords` object for brevity.
                var edge = _this2.edges[key];
                coords[key] = { x: Number(edge.attr('x')), y: Number(edge.attr('y')) };
            });

            /**
             * @property cornerPositions
             * @type {{top: Number, right: Number, bottom: Number, left: Number}}
             */
            var cornerPositions = {

                // Find the coordinate that doesn't match the others, which means that is the coordinate that is currently
                // being modified without any conditional statements.
                top: this.popUnique([coords.topLeft.y, coords.topMiddle.y, coords.topRight.y]),
                right: this.popUnique([coords.topRight.x, coords.rightMiddle.x, coords.bottomRight.x]),
                bottom: this.popUnique([coords.bottomLeft.y, coords.bottomMiddle.y, coords.bottomRight.y]),
                left: this.popUnique([coords.topLeft.x, coords.leftMiddle.x, coords.bottomLeft.x])

            };

            /**
             * @constant middlePositions
             * @type {{topMiddle: number, rightMiddle: number, bottomMiddle: number, leftMiddle: number}}
             */
            var middlePositions = {

                // All of these middle positions are relative to the corner positions above.
                topMiddle: (cornerPositions.left + cornerPositions.right) / 2,
                rightMiddle: (cornerPositions.top + cornerPositions.bottom) / 2,
                bottomMiddle: (cornerPositions.left + cornerPositions.right) / 2,
                leftMiddle: (cornerPositions.top + cornerPositions.bottom) / 2

            };

            dimensions.forEach(function (key) {

                if (currentKey !== key) {

                    var parts = key.split(regExp).map(function (key) {
                        return key.toLowerCase();
                    });

                    if (parts[1] === 'middle') {

                        if (key === 'topMiddle' || key === 'bottomMiddle') {
                            _this2.edges[key].attr('y', cornerPositions[parts[0]]);
                            _this2.edges[key].attr('x', middlePositions[key]);
                            return;
                        }

                        _this2.edges[key].attr('y', middlePositions[key]);
                        _this2.edges[key].attr('x', cornerPositions[parts[0]]);
                        return;
                    }

                    _this2.edges[key].attr('y', cornerPositions[parts[0]]);
                    _this2.edges[key].attr('x', cornerPositions[parts[1]]);
                }
            });
        }
    }, {
        key: 'drag',

        /**
         * @method drag
         * @param {Shape} shape
         * @param {String} key
         * @return {{start: Function, drag: Function, end: Function}}
         */
        value: function drag(shape, key) {

            var middleman = this.middleman();
            var handles = this.layer;
            var radius = this.RADIUS;
            var reattachHandles = this.reattachHandles.bind(this);
            var rearrangeHandles = this.rearrangeHandles.bind(this);
            var boundingBoxLayer = middleman[_helpersSymbols2['default'].DRAFT][_helpersSymbols2['default'].LAYERS].boundingBox;
            var startX = undefined,
                startY = undefined,
                ratio = undefined;

            return {

                /**
                 * @method start
                 * @return {{x: Number, y: Number}}
                 */
                start: function start() {

                    middleman.boundingBox().bBox.remove();
                    middleman.preventDeselect(true);

                    var handle = d3.select(this).classed('dragging', true);
                    ratio = shape.attr('width') / shape.attr('height');

                    startX = d3.event.sourceEvent.pageX - parseInt(handle.attr('x'));
                    startY = d3.event.sourceEvent.pageY - parseInt(handle.attr('y'));

                    return { x: startX, y: startY };
                },

                /**
                 * @method drag
                 * @return {{x: Number, y: Number}}
                 */
                drag: function drag() {

                    var options = middleman.options();
                    var handle = d3.select(this);
                    var moveX = d3.event.sourceEvent.pageX - startX;
                    var moveY = d3.event.sourceEvent.pageY - startY;
                    var finalX = Math.ceil(moveX / options.gridSize) * options.gridSize;
                    var finalY = Math.ceil(moveY / options.gridSize) * options.gridSize;

                    if (key !== 'topMiddle' && key !== 'bottomMiddle') {
                        handle.attr('x', finalX);
                    }

                    if (key !== 'rightMiddle' && key !== 'leftMiddle') {
                        handle.attr('y', finalY);
                    }

                    rearrangeHandles(key);

                    var bBox = handles.node().getBBox();
                    shape.attr('x', bBox.x + radius / 2).attr('y', bBox.y + radius / 2).attr('height', bBox.height - radius).attr('width', bBox.width - radius);

                    return { x: finalX, y: finalY };
                },

                /**
                 * @method end
                 * @return {void}
                 */
                end: function end() {
                    middleman.boundingBox().drawBoundingBox(middleman.selected(), boundingBoxLayer);
                    middleman.preventDeselect(false);
                    reattachHandles();
                }

            };
        }
    }]);

    return Resizable;
})(_Ability3['default']);

exports['default'] = Resizable;
module.exports = exports['default'];

},{"./../helpers/Symbols":13,"./Ability":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Ability2 = require('./Ability');

var _Ability3 = _interopRequireDefault(_Ability2);

var _helpersSymbols = require('./../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

/**
 * @module Draft
 * @submodule Selectable
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Selectable = (function (_Ability) {
    function Selectable() {
        _classCallCheck(this, Selectable);

        _get(Object.getPrototypeOf(Selectable.prototype), 'constructor', this).apply(this, arguments);
    }

    _inherits(Selectable, _Ability);

    _createClass(Selectable, [{
        key: 'didAdd',

        /**
         * @method didAdd
         * @return {void}
         */
        value: function didAdd() {
            var _this = this;

            var element = this.shape()[_helpersSymbols2['default'].ELEMENT];
            element.on('click', this.handleClick.bind(this));
            element.call(d3.behavior.drag().on('drag', function () {
                return _this.handleDrag();
            }));
        }
    }, {
        key: 'handleDrag',

        /**
         * @method handleDrag
         * @return {Object}
         */
        value: function handleDrag() {

            this.handleClick();

            var middleman = this.shape()[_helpersSymbols2['default'].MIDDLEMAN];
            middleman.preventDeselect(true);

            // Create a fake event to drag the shape with an override X and Y value.
            var event = new MouseEvent('mousedown', { bubbles: true, cancelable: false });
            event.overrideX = d3.event.sourceEvent.pageX;
            event.overrideY = d3.event.sourceEvent.pageY;

            var bBox = middleman.boundingBox().bBox.node();
            bBox.dispatchEvent(event);
            return event;
        }
    }, {
        key: 'handleClick',

        /**
         * @method handleClick
         * @return {void}
         */
        value: function handleClick() {

            var keyMap = this.middleman()[_helpersSymbols2['default'].KEY_MAP];

            if (this.shape().isSelected()) {

                if (!keyMap.multiSelect) {

                    // Deselect all others and select only the current shape.
                    return void this.middleman().deselect({ exclude: this.shape() });
                }

                // Deselect the shape if it's currently selected.
                return void this.middleman().deselect({ include: this.shape() });
            }

            if (!keyMap.multiSelect) {

                // Deselect all shapes except for the current.
                this.middleman().deselect({ exclude: this.shape() });
            }

            this.middleman().select({ include: this.shape() });
        }
    }]);

    return Selectable;
})(_Ability3['default']);

exports['default'] = Selectable;
module.exports = exports['default'];

},{"./../helpers/Symbols":13,"./Ability":3}],6:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Attributes
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

/*
 * @method setAttribute
 * @param {Array} element
 * @param {String} name
 * @param {*} value
 * @return {void}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = function (element, name, value) {

    'use strict';

    switch (name) {

        case 'x':
            var y = element.datum().y || 0;
            return void element.attr('transform', 'translate(' + value + ', ' + y + ')');

        case 'y':
            var x = element.datum().x || 0;
            return void element.attr('transform', 'translate(' + x + ', ' + value + ')');

    }

    element.attr(name, value);
};

module.exports = exports['default'];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mousetrap = require('mousetrap');

var _mousetrap2 = _interopRequireDefault(_mousetrap);

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @module Draft
 * @submodule BoundingBox
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var BoundingBox = (function () {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {BoundingBox}
     */

    function BoundingBox(middleman) {
        _classCallCheck(this, BoundingBox);

        this[_Symbols2['default'].MIDDLEMAN] = middleman;
        this.listenToKeyboardEvents();
    }

    _createClass(BoundingBox, [{
        key: 'listenToKeyboardEvents',

        /**
         * @method listenToKeyboardEvents
         * @return {void}
         */
        value: function listenToKeyboardEvents() {
            var _this = this;

            /**
             * @method moveBy
             * @param {Object} event
             * @param {Number} x
             * @param {Number} y
             * @return {void}
             */
            var moveBy = function moveBy(event, x, y) {
                event.preventDefault();
                _this.moveSelectedBy(x, y, true);
            };

            var options = this[_Symbols2['default'].MIDDLEMAN].options();
            var defaultMoveStep = options.defaultMoveStep;
            var shiftMoveStep = options.shiftMoveStep;

            _mousetrap2['default'].bind('left', function (event) {
                return moveBy(event, -defaultMoveStep, 0);
            });
            _mousetrap2['default'].bind('right', function (event) {
                return moveBy(event, defaultMoveStep, 0);
            });
            _mousetrap2['default'].bind('up', function (event) {
                return moveBy(event, 0, -defaultMoveStep);
            });
            _mousetrap2['default'].bind('down', function (event) {
                return moveBy(event, 0, defaultMoveStep);
            });

            _mousetrap2['default'].bind('shift+left', function (event) {
                return moveBy(event, -shiftMoveStep, 0);
            });
            _mousetrap2['default'].bind('shift+right', function (event) {
                return moveBy(event, shiftMoveStep, 0);
            });
            _mousetrap2['default'].bind('shift+up', function (event) {
                return moveBy(event, 0, -shiftMoveStep);
            });
            _mousetrap2['default'].bind('shift+down', function (event) {
                return moveBy(event, 0, shiftMoveStep);
            });
        }
    }, {
        key: 'handleClick',

        /**
         * @method handleClick
         * @return {void}
         */
        value: function handleClick() {

            var middleman = this[_Symbols2['default'].MIDDLEMAN];
            d3.event.stopPropagation();

            if (middleman.preventDeselect()) {
                middleman.preventDeselect(false);
                return;
            }

            var mouseX = d3.event.pageX;
            var mouseY = d3.event.pageY;

            this.bBox.attr('pointer-events', 'none');
            var element = document.elementFromPoint(mouseX, mouseY);
            this.bBox.attr('pointer-events', 'all');

            if (middleman.fromElement(element)) {
                var _event = new MouseEvent('click', { bubbles: true, cancelable: false });
                element.dispatchEvent(_event);
            }
        }
    }, {
        key: 'drawBoundingBox',

        /**
         * @method drawBoundingBox
         * @param {Array} selected
         * @param {Object} layer
         * @return {void}
         */
        value: function drawBoundingBox(selected, layer) {
            var _d3$behavior$drag$on$on,
                _d3$behavior$drag$on,
                _d3$behavior$drag,
                _this2 = this;

            if (this.bBox) {
                this.bBox.remove();
            }

            if (selected.length === 0) {
                return;
            }

            var model = { minX: Number.MAX_VALUE, minY: Number.MAX_VALUE,
                maxX: Number.MIN_VALUE, maxY: Number.MIN_VALUE };

            /**
             * Responsible for computing the collective bounding box, based on all of the bounding boxes
             * from the current selected shapes.
             *
             * @method compute
             * @param {Array} bBoxes
             * @return {void}
             */
            var compute = function compute(bBoxes) {
                model.minX = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.x;
                })));
                model.minY = Math.min.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.y;
                })));
                model.maxX = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.x + d.width;
                })));
                model.maxY = Math.max.apply(Math, _toConsumableArray(bBoxes.map(function (d) {
                    return d.y + d.height;
                })));
            };

            // Compute the collective bounding box.
            compute(selected.map(function (shape) {
                return shape.boundingBox();
            }));

            this.bBox = layer.append('rect').datum(model).classed('drag-box', true).attr('x', function (d) {
                return d.minX;
            }).attr('y', function (d) {
                return d.minY;
            }).attr('width', function (d) {
                return d.maxX - d.minX;
            }).attr('height', function (d) {
                return d.maxY - d.minY;
            }).on('click', this.handleClick.bind(this));

            var dragStart = ['dragstart', function () {
                return _this2.dragStart();
            }];
            var drag = ['drag', function () {
                return _this2.drag();
            }];
            var dragEnd = ['dragend', function () {
                return _this2.dragEnd();
            }];

            this.bBox.call((_d3$behavior$drag$on$on = (_d3$behavior$drag$on = (_d3$behavior$drag = d3.behavior.drag()).on.apply(_d3$behavior$drag, dragStart)).on.apply(_d3$behavior$drag$on, drag)).on.apply(_d3$behavior$drag$on$on, dragEnd));
        }
    }, {
        key: 'dragStart',

        /**
         * @method dragStart
         * @param {Number} [x=null]
         * @param {Number} [y=null]
         * @return {void}
         */
        value: function dragStart() {
            var x = arguments[0] === undefined ? null : arguments[0];
            var y = arguments[1] === undefined ? null : arguments[1];

            var sX = Number(this.bBox.attr('x'));
            var sY = Number(this.bBox.attr('y'));

            this.start = {
                x: x !== null ? x : (d3.event.sourceEvent.overrideX || d3.event.sourceEvent.pageX) - sX,
                y: y !== null ? y : (d3.event.sourceEvent.overrideY || d3.event.sourceEvent.pageY) - sY
            };

            this.move = {
                start: { x: sX, y: sY },
                end: {}
            };
        }
    }, {
        key: 'drag',

        /**
         * @method drag
         * @param {Number} [x=null]
         * @param {Number} [y=null]
         * @param {Number} [multipleOf=this[Symbols.MIDDLEMAN].options().gridSize]
         * @return {void}
         */
        value: function drag() {
            var x = arguments[0] === undefined ? null : arguments[0];
            var y = arguments[1] === undefined ? null : arguments[1];
            var multipleOf = arguments[2] === undefined ? this[_Symbols2['default'].MIDDLEMAN].options().gridSize : arguments[2];

            this[_Symbols2['default'].MIDDLEMAN].preventDeselect(true);

            x = x !== null ? x : d3.event.sourceEvent.pageX;
            y = y !== null ? y : d3.event.sourceEvent.pageY;

            var mX = x - this.start.x,
                mY = y - this.start.y,
                eX = Math.ceil(mX / multipleOf) * multipleOf,
                eY = Math.ceil(mY / multipleOf) * multipleOf;

            this.bBox.datum().x = eX;
            this.bBox.datum().y = eY;

            this.bBox.attr('x', eX);
            this.bBox.attr('y', eY);

            this.move.end = { x: eX, y: eY };
        }
    }, {
        key: 'dragEnd',

        /**
         * @method dragEnd
         * @return {void}
         */
        value: function dragEnd() {

            var eX = this.move.end.x - this.move.start.x;
            var eY = this.move.end.y - this.move.start.y;

            if (isNaN(eX) || isNaN(eY)) {
                return;
            }

            // Move each shape by the delta between the start and end points.
            this.moveSelectedBy(eX, eY);
        }
    }, {
        key: 'moveSelectedBy',

        /**
         * @method moveSelectedBy
         * @param {Number} x
         * @param {Number} y
         * @param {Boolean} [moveBBox=false]
         * @return {void}
         */
        value: function moveSelectedBy(x, y) {
            var _this3 = this;

            var moveBBox = arguments[2] === undefined ? false : arguments[2];

            this[_Symbols2['default'].MIDDLEMAN].selected().forEach(function (shape) {

                var currentX = shape.attr('x');
                var currentY = shape.attr('y');
                var moveX = currentX + x;
                var moveY = currentY + y;

                shape.attr('x', moveX).attr('y', moveY);
                shape.attr('x', moveX).attr('y', moveY);
                shape.didMove();

                if (moveBBox) {
                    _this3.bBox.attr('x', moveX).attr('y', moveY);
                    _this3.bBox.attr('x', moveX).attr('y', moveY);
                }
            });
        }
    }]);

    return BoundingBox;
})();

exports['default'] = BoundingBox;
module.exports = exports['default'];

},{"./Symbols":13,"mousetrap":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @method tryInvoke
 * @param {Object} context
 * @param {String} functionName
 * @param {Array} options
 * @return {Boolean}
 */
var tryInvoke = function tryInvoke(context, functionName) {

    'use strict';

    for (var _len = arguments.length, options = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        options[_key - 2] = arguments[_key];
    }

    if (typeof context[functionName] === 'function') {
        context[functionName].apply(context, options);
        return true;
    }

    return false;
};

/**
 * @method capitalize
 * @param {String} name
 * @return {string}
 */
var capitalize = function capitalize(name) {

    'use strict';

    return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * @module Draft
 * @submodule Invocator
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports['default'] = (function () {

    'use strict';

    return {

        /**
         * @method did
         * @param {String} type
         * @param {Array|Shape} shapes
         * @return {Boolean}
         */
        did: function did(type, shapes) {

            shapes = Array.isArray(shapes) ? shapes : [shapes];

            return shapes.every(function (shape) {
                return tryInvoke(shape, 'did' + capitalize(type));
            });
        },

        /**
         * @method includeExclude
         * @param {Draft} draft
         * @param {Function} fn
         * @param {Object} [options={}]
         * @return {void}
         */
        includeExclude: function includeExclude(draft, fn) {
            var options = arguments[2] === undefined ? {} : arguments[2];

            var include = options.include || undefined;
            var exclude = options.exclude || undefined;
            var middleman = draft[_Symbols2['default'].MIDDLEMAN];

            /**
             * @method allExcluding
             * @param {Array} excluding
             * @return {Array}
             */
            var allExcluding = function allExcluding(excluding) {

                excluding = Array.isArray(excluding) ? excluding : [excluding];

                return middleman.all().filter(function (shape) {
                    return ! ~excluding.indexOf(shape);
                });
            };

            if (include) {
                return void fn.apply(draft, [include]);
            }

            if (!exclude) {
                return void fn.apply(draft);
            }

            fn.apply(draft, [allExcluding(exclude)]);
        }

    };
})();

module.exports = exports['default'];

},{"./Symbols":13}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mousetrap = require('mousetrap');

var _mousetrap2 = _interopRequireDefault(_mousetrap);

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

/**
 * @module Draft
 * @submodule KeyBindings
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var KeyBindings = (function () {

    /**
     * @constructor
     * @param {Middleman} middleman
     * @return {KeyBindings}
     */

    function KeyBindings(middleman) {
        _classCallCheck(this, KeyBindings);

        var keyMap = middleman[_Symbols2['default'].KEY_MAP];
        this[_Symbols2['default'].MIDDLEMAN] = middleman;

        // Default kep mappings
        keyMap.multiSelect = false;
        keyMap.aspectRatio = false;

        // Listen for changes to the key map.
        this.attachBindings(keyMap);
    }

    _createClass(KeyBindings, [{
        key: 'attachBindings',

        /**
         * @method attachBindings
         * @param {Object} keyMap
         * @return {void}
         */
        value: function attachBindings(keyMap) {
            var _this = this;

            // Select all of the available shapes.
            _mousetrap2['default'].bind('mod+a', function () {
                return _this[_Symbols2['default'].MIDDLEMAN].select();
            });

            // Multi-selecting shapes.
            _mousetrap2['default'].bind('mod', function () {
                return keyMap.multiSelect = true;
            }, 'keydown');
            _mousetrap2['default'].bind('mod', function () {
                return keyMap.multiSelect = false;
            }, 'keyup');

            // Maintain aspect ratios when resizing.
            _mousetrap2['default'].bind('shift', function () {
                return keyMap.aspectRatio = true;
            }, 'keydown');
            _mousetrap2['default'].bind('shift', function () {
                return keyMap.aspectRatio = false;
            }, 'keyup');
        }
    }]);

    return KeyBindings;
})();

exports['default'] = KeyBindings;
module.exports = exports['default'];

},{"./Symbols":13,"mousetrap":1}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersThrow = require('../helpers/Throw');

var _helpersThrow2 = _interopRequireDefault(_helpersThrow);

var _shapesRectangle = require('../shapes/Rectangle');

var _shapesRectangle2 = _interopRequireDefault(_shapesRectangle);

/**
 * @module Draft
 * @submodule Mapper
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

exports['default'] = function (name) {

    'use strict';

    var map = {
        rectangle: _shapesRectangle2['default']
    };

    return typeof map[name] !== 'undefined' ? new map[name]() : new _helpersThrow2['default']('Cannot map "' + name + '" to a shape object');
};

module.exports = exports['default'];

},{"../helpers/Throw":14,"../shapes/Rectangle":15}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _Symbols = require('./Symbols');

var _Symbols2 = _interopRequireDefault(_Symbols);

var _KeyBindings = require('./KeyBindings');

var _KeyBindings2 = _interopRequireDefault(_KeyBindings);

var _Invocator = require('./Invocator');

var _Invocator2 = _interopRequireDefault(_Invocator);

/**
 * @module Draft
 * @submodule Middleman
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Middleman = (function () {

    /**
     * @constructor
     * @param {Draft} draft
     * @return {Middleman}
     */

    function Middleman(draft) {
        _classCallCheck(this, Middleman);

        this[_Symbols2['default'].DRAFT] = draft;
        this[_Symbols2['default'].KEY_MAP] = {};
        this[_Symbols2['default'].CAN_DESELECT] = false;

        new _KeyBindings2['default'](this);
    }

    _createClass(Middleman, [{
        key: 'd3',

        /**
         * @method d3
         * @return {Object}
         */
        value: function d3() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].SVG];
        }
    }, {
        key: 'layers',

        /**
         * @method layers
         * @return {Object}
         */
        value: function layers() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].LAYERS];
        }
    }, {
        key: 'options',

        /**
         * @method options
         * @return {Object}
         */
        value: function options() {
            return this[_Symbols2['default'].DRAFT].options();
        }
    }, {
        key: 'keyMap',

        /**
         * @method keyMap
         * @return {Object}
         */
        value: function keyMap() {
            return this[_Symbols2['default'].KEY_MAP];
        }
    }, {
        key: 'select',

        /**
         * @method select
         * @param {Object} options
         * @return {void}
         */
        value: function select(options) {
            _Invocator2['default'].includeExclude(this[_Symbols2['default'].DRAFT], this[_Symbols2['default'].DRAFT].select, options);
        }
    }, {
        key: 'deselect',

        /**
         * @method deselect
         * @param {Object} options
         * @return {void}
         */
        value: function deselect(options) {
            _Invocator2['default'].includeExclude(this[_Symbols2['default'].DRAFT], this[_Symbols2['default'].DRAFT].deselect, options);
        }
    }, {
        key: 'all',

        /**
         * @method all
         * @return {Array}
         */
        value: function all() {
            return this[_Symbols2['default'].DRAFT].all();
        }
    }, {
        key: 'selected',

        /**
         * @method selected
         * @return {Array}
         */
        value: function selected() {
            return this[_Symbols2['default'].DRAFT].selected();
        }
    }, {
        key: 'fromElement',

        /**
         * @method fromElement
         * @param {HTMLElement} element
         * @return {Shape}
         */
        value: function fromElement(element) {

            return this.all().filter(function (shape) {
                return element === shape[_Symbols2['default'].ELEMENT].node();
            })[0];
        }
    }, {
        key: 'preventDeselect',

        /**
         * @method preventDeselect
         * @param {Boolean} [value=undefined]
         */
        value: function preventDeselect(value) {

            if (typeof value === 'undefined') {
                return this[_Symbols2['default'].CAN_DESELECT];
            }

            this[_Symbols2['default'].CAN_DESELECT] = value;
        }
    }, {
        key: 'boundingBox',

        /**
         * @method boundingBox
         * @return {BoundingBox}
         */
        value: function boundingBox() {
            return this[_Symbols2['default'].DRAFT][_Symbols2['default'].BOUNDING_BOX];
        }
    }]);

    return Middleman;
})();

exports['default'] = Middleman;
module.exports = exports['default'];

},{"./Invocator":8,"./KeyBindings":9,"./Symbols":13}],12:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Polyfills
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.objectAssign = objectAssign;

function objectAssign(target) {

    "use strict";

    if (target === undefined || target === null) {
        throw new TypeError("Cannot convert first argument to object");
    }

    var to = Object(target);

    for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (nextSource === undefined || nextSource === null) {
            continue;
        }
        nextSource = Object(nextSource);

        var keysArray = Object.keys(Object(nextSource));

        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
            }
        }
    }

    return to;
}

},{}],13:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Symbols
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports['default'] = {
    DRAFT: Symbol('draft'),
    SVG: Symbol('svg'),
    ELEMENT: Symbol('element'),
    IS_SELECTED: Symbol('isSelected'),
    ATTRIBUTES: Symbol('attributes'),
    MIDDLEMAN: Symbol('middleman'),
    SHAPE: Symbol('shape'),
    SHAPES: Symbol('shapes'),
    LAYERS: Symbol('layers'),
    GROUP: Symbol('group'),
    BOUNDING_BOX: Symbol('boundingBox'),
    OPTIONS: Symbol('options'),
    ABILITIES: Symbol('abilities'),
    KEY_MAP: Symbol('keyMap'),
    CAN_DESELECT: Symbol('canDeselect')
};
module.exports = exports['default'];

},{}],14:[function(require,module,exports){
/**
 * @module Draft
 * @submodule Throw
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Throw =

/**
 * @constructor
 * @param {String} message
 * @return {Throw}
 */
function Throw(message) {
  _classCallCheck(this, Throw);

  throw new Error("Draft.js: " + message + ".");
};

exports["default"] = Throw;
module.exports = exports["default"];

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _Shape2 = require('./Shape');

var _Shape3 = _interopRequireDefault(_Shape2);

/**
 * @module Draft
 * @submodule Rectangle
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Rectangle = (function (_Shape) {
    function Rectangle() {
        _classCallCheck(this, Rectangle);

        _get(Object.getPrototypeOf(Rectangle.prototype), 'constructor', this).apply(this, arguments);
    }

    _inherits(Rectangle, _Shape);

    _createClass(Rectangle, [{
        key: 'tagName',

        /**
         * @method tagName
         * @return {String}
         */
        value: function tagName() {
            return 'rect';
        }
    }, {
        key: 'defaultAttributes',

        /**
         * @method defaultAttributes
         * @return {Object}
         */
        value: function defaultAttributes() {

            return {
                fill: 'blue',
                height: 100,
                width: 100,
                x: 0,
                y: 0
            };
        }
    }]);

    return Rectangle;
})(_Shape3['default']);

exports['default'] = Rectangle;
module.exports = exports['default'];

},{"./Shape":16}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersSymbols = require('../helpers/Symbols');

var _helpersSymbols2 = _interopRequireDefault(_helpersSymbols);

var _helpersThrow = require('../helpers/Throw');

var _helpersThrow2 = _interopRequireDefault(_helpersThrow);

var _helpersPolyfills = require('../helpers/Polyfills');

var _helpersAttributes = require('../helpers/Attributes');

var _helpersAttributes2 = _interopRequireDefault(_helpersAttributes);

var _helpersInvocator = require('../helpers/Invocator');

var _helpersInvocator2 = _interopRequireDefault(_helpersInvocator);

var _abilitiesSelectable = require('../abilities/Selectable');

var _abilitiesSelectable2 = _interopRequireDefault(_abilitiesSelectable);

var _abilitiesResizable = require('../abilities/Resizable');

var _abilitiesResizable2 = _interopRequireDefault(_abilitiesResizable);

/**
 * @module Draft
 * @submodule Shape
 * @author Adam Timberlake
 * @link https://github.com/Wildhoney/Draft
 */

var Shape = (function () {

    /**
     * @constructor
     * @param {Object} [attributes={}]
     * @return {Shape}
     */

    function Shape() {
        var attributes = arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Shape);

        this[_helpersSymbols2['default'].ATTRIBUTES] = attributes;
    }

    _createClass(Shape, [{
        key: 'tagName',

        /**
         * @method tagName
         * @throws {Error} Will throw an exception if the `tagName` method hasn't been defined on the child object.
         * @return {void}
         */
        value: function tagName() {
            new _helpersThrow2['default']('Tag name must be defined for a shape using the `tagName` method');
        }
    }, {
        key: 'isSelected',

        /**
         * @method isSelected
         * @return {Boolean}
         */
        value: function isSelected() {
            return this[_helpersSymbols2['default'].IS_SELECTED];
        }
    }, {
        key: 'attr',

        /**
         * @method attr
         * @param {String} name
         * @param {*} [value=undefined]
         * @return {Shape|*}
         */
        value: function attr(name, value) {

            if (typeof value === 'undefined') {
                return this[_helpersSymbols2['default'].ELEMENT].datum()[name];
            }

            this[_helpersSymbols2['default'].ELEMENT].datum()[name] = value;
            (0, _helpersAttributes2['default'])(this[_helpersSymbols2['default'].ELEMENT], name, value);

            return this;
        }
    }, {
        key: 'didAdd',

        /**
         * @method didAdd
         * @return {void}
         */
        value: function didAdd() {
            var _this = this;

            var layer = this[_helpersSymbols2['default'].MIDDLEMAN].layers().shapes;
            var attributes = (0, _helpersPolyfills.objectAssign)(this.defaultAttributes(), this[_helpersSymbols2['default'].ATTRIBUTES]);
            this[_helpersSymbols2['default'].GROUP] = layer.append('g');
            this[_helpersSymbols2['default'].ELEMENT] = this[_helpersSymbols2['default'].GROUP].append(this.tagName()).datum({});

            // Assign each attribute from the default attributes defined on the shape, as well as those defined
            // by the user when instantiating the shape.
            Object.keys(attributes).forEach(function (key) {
                return _this.attr(key, attributes[key]);
            });

            var abilities = {
                selectable: new _abilitiesSelectable2['default'](),
                resizable: new _abilitiesResizable2['default']()
            };

            Object.keys(abilities).forEach(function (key) {

                // Add the shape object into each ability instance, and invoke the `didAdd` method.
                var ability = abilities[key];
                ability[_helpersSymbols2['default'].SHAPE] = _this;
                _helpersInvocator2['default'].did('add', ability);
            });

            this[_helpersSymbols2['default'].ABILITIES] = abilities;
        }
    }, {
        key: 'didRemove',

        /**
         * @method didRemove
         * @return {void}
         */
        value: function didRemove() {}
    }, {
        key: 'didMove',

        /**
         * @method didMove
         * @return {void}
         */
        value: function didMove() {
            this[_helpersSymbols2['default'].ABILITIES].resizable.reattachHandles();
        }
    }, {
        key: 'didSelect',

        /**
         * @method didSelect
         * @return {void}
         */
        value: function didSelect() {
            this[_helpersSymbols2['default'].IS_SELECTED] = true;
            this[_helpersSymbols2['default'].ABILITIES].resizable.didSelect();
        }
    }, {
        key: 'didDeselect',

        /**
         * @method didDeselect
         * @return {void}
         */
        value: function didDeselect() {
            this[_helpersSymbols2['default'].IS_SELECTED] = false;
            this[_helpersSymbols2['default'].ABILITIES].resizable.didDeselect();
        }
    }, {
        key: 'boundingBox',

        /**
         * @method boundingBox
         * @return {Object}
         */
        value: function boundingBox() {

            var hasBBox = typeof this[_helpersSymbols2['default'].GROUP].node().getBBox === 'function';

            return hasBBox ? this[_helpersSymbols2['default'].GROUP].node().getBBox() : {
                height: this.attr('height'),
                width: this.attr('width'),
                x: this.attr('x'),
                y: this.attr('y')
            };
        }
    }, {
        key: 'defaultAttributes',

        /**
         * @method defaultAttributes
         * @return {Object}
         */
        value: function defaultAttributes() {
            return {};
        }
    }]);

    return Shape;
})();

exports['default'] = Shape;
module.exports = exports['default'];

},{"../abilities/Resizable":4,"../abilities/Selectable":5,"../helpers/Attributes":6,"../helpers/Invocator":8,"../helpers/Polyfills":12,"../helpers/Symbols":13,"../helpers/Throw":14}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvbW91c2V0cmFwL21vdXNldHJhcC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9EcmFmdC5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvQWJpbGl0eS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9hYmlsaXRpZXMvUmVzaXphYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2FiaWxpdGllcy9TZWxlY3RhYmxlLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvQXR0cmlidXRlcy5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9oZWxwZXJzL0JvdW5kaW5nQm94LmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvSW52b2NhdG9yLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvS2V5QmluZGluZ3MuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NYXBwZXIuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9NaWRkbGVtYW4uanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9Qb2x5ZmlsbHMuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvaGVscGVycy9TeW1ib2xzLmpzIiwiL1VzZXJzL2F0aW1iZXJsYWtlL1dlYnJvb3QvRHJhZnQvc3JjL2hlbHBlcnMvVGhyb3cuanMiLCIvVXNlcnMvYXRpbWJlcmxha2UvV2Vicm9vdC9EcmFmdC9zcmMvc2hhcGVzL1JlY3RhbmdsZS5qcyIsIi9Vc2Vycy9hdGltYmVybGFrZS9XZWJyb290L0RyYWZ0L3NyYy9zaGFwZXMvU2hhcGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztnQ0M3L0IyQixxQkFBcUI7Ozs7OEJBQ3JCLG1CQUFtQjs7OztrQ0FDbkIsdUJBQXVCOzs7O2dDQUN2QixxQkFBcUI7O2dDQUNyQixxQkFBcUI7Ozs7NkJBQ3JCLGtCQUFrQjs7Ozs7Ozs7OztJQU92QyxLQUFLOzs7Ozs7Ozs7QUFRSSxhQVJULEtBQUssQ0FRSyxPQUFPLEVBQWdCOzs7WUFBZCxPQUFPLGdDQUFHLEVBQUU7OzhCQVIvQixLQUFLOztBQVVILFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBUyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sc0JBcEIzQyxZQUFZLENBb0IrQyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN0RixZQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQU0sa0NBQWMsSUFBSSxDQUFDLENBQUM7QUFDOUUsWUFBSSxDQUFDLDRCQUFRLFlBQVksQ0FBQyxHQUFHLG9DQUFnQixTQUFTLENBQUMsQ0FBQzs7O0FBR3hELFlBQU0sS0FBSyxHQUFJLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUM7QUFDbkQsWUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDLGNBQWMsQ0FBQztBQUNwRCxZQUFNLEdBQUcsR0FBTSxJQUFJLENBQUMsNEJBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxHLFlBQU0sZUFBZSxHQUFHLFNBQWxCLGVBQWU7bUJBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7U0FBQSxDQUFDO0FBQ3pELFlBQUksQ0FBQyw0QkFBUSxNQUFNLENBQUMsR0FBSTtBQUNwQixrQkFBTSxFQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztBQUNqRix1QkFBVyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztBQUNuRixrQkFBTSxFQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQztTQUNwRixDQUFDOzs7QUFHRixXQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxZQUFNOztBQUVsQixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtBQUM5QixzQkFBSyxRQUFRLEVBQUUsQ0FBQzthQUNuQjs7QUFFRCxxQkFBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUVwQyxDQUFDLENBQUM7S0FFTjs7aUJBdENDLEtBQUs7Ozs7Ozs7O2VBNkNKLGFBQUMsS0FBSyxFQUFFOzs7O0FBSVAsaUJBQUssR0FBRyxBQUFDLE9BQU8sS0FBSyxLQUFLLFFBQVEsR0FBSSxnQ0FBTyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUM7O0FBRTVELGdCQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsNEJBQVEsTUFBTSxDQUFDLENBQUM7QUFDcEMsa0JBQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7OztBQUduQixpQkFBSyxDQUFDLDRCQUFRLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyw0QkFBUSxTQUFTLENBQUMsQ0FBQztBQUNuRCwwQ0FBVSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUU1QixtQkFBTyxLQUFLLENBQUM7U0FFaEI7Ozs7Ozs7OztlQU9LLGdCQUFDLEtBQUssRUFBRTs7QUFFVixnQkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLGdCQUFNLEtBQUssR0FBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVyQyxrQkFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDeEIsMENBQVUsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFL0IsbUJBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUV4Qjs7Ozs7Ozs7ZUFNSSxpQkFBRzs7QUFFSixnQkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLDRCQUFRLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLDBDQUFVLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEMsa0JBQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUVsQixtQkFBTyxNQUFNLENBQUMsTUFBTSxDQUFDO1NBRXhCOzs7Ozs7OztlQU1FLGVBQUc7QUFDRixtQkFBTyxJQUFJLENBQUMsNEJBQVEsTUFBTSxDQUFDLENBQUM7U0FDL0I7Ozs7Ozs7OztlQU9LLGtCQUFzQjtnQkFBckIsTUFBTSxnQ0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFOztBQUN0QiwwQ0FBVSxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLGdCQUFJLENBQUMsNEJBQVEsWUFBWSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsNEJBQVEsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakc7Ozs7Ozs7OztlQU9PLG9CQUFzQjtnQkFBckIsTUFBTSxnQ0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFOztBQUN4QiwwQ0FBVSxHQUFHLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLGdCQUFJLENBQUMsNEJBQVEsWUFBWSxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsNEJBQVEsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDakc7Ozs7Ozs7O2VBTU8sb0JBQUc7QUFDUCxtQkFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSzt1QkFBSyxLQUFLLENBQUMsVUFBVSxFQUFFO2FBQUEsQ0FBQyxDQUFDO1NBQzNEOzs7Ozs7OztlQU1NLG1CQUFHOztBQUVOLG1CQUFPLElBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsSUFBSTtBQUM1Qiw4QkFBYyxFQUFFLE1BQU07QUFDdEIsNkJBQWEsRUFBRSxNQUFNO0FBQ3JCLHdCQUFRLEVBQUUsRUFBRTtBQUNaLDRCQUFZLEVBQUUsRUFBRTtBQUNoQiwrQkFBZSxFQUFFLENBQUM7QUFDbEIsNkJBQWEsRUFBRSxFQUFFO2FBQ3BCLENBQUM7U0FFTDs7O1dBaEpDLEtBQUs7OztBQW9KWCxDQUFDLFVBQUMsT0FBTyxFQUFLOztBQUVWLGdCQUFZLENBQUM7O0FBRWIsUUFBSSxPQUFPLEVBQUU7OztBQUdULGVBQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0tBRXpCO0NBRUosQ0FBQSxDQUFFLE1BQU0sQ0FBQyxDQUFDOzs7cUJBR0ksS0FBSzs7Ozs7Ozs7Ozs7Ozs7Ozs4QkM5S0Esb0JBQW9COzs7Ozs7Ozs7OztJQVFuQixPQUFPO1dBQVAsT0FBTzswQkFBUCxPQUFPOzs7ZUFBUCxPQUFPOzs7Ozs7O1dBTW5CLGlCQUFHO0FBQ0osYUFBTyxJQUFJLENBQUMsNEJBQVEsS0FBSyxDQUFDLENBQUM7S0FDOUI7Ozs7Ozs7O1dBTVEscUJBQUc7QUFDUixhQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyw0QkFBUSxTQUFTLENBQUMsQ0FBQztLQUMxQzs7O1NBaEJnQixPQUFPOzs7cUJBQVAsT0FBTzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDUlIsV0FBVzs7Ozs4QkFDWCxzQkFBc0I7Ozs7Ozs7Ozs7O0lBUXJCLFNBQVM7Ozs7Ozs7QUFNZixhQU5NLFNBQVMsR0FNWjs4QkFORyxTQUFTOztBQU90QixtQ0FQYSxTQUFTLDZDQU9kO0FBQ1IsWUFBSSxDQUFDLEtBQUssR0FBSSxFQUFFLENBQUM7S0FDcEI7O2NBVGdCLFNBQVM7O2lCQUFULFNBQVM7Ozs7Ozs7ZUFlakIscUJBQUc7QUFDUixnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO0FBQ3RELGdCQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7U0FDMUI7Ozs7Ozs7O2VBTVUsdUJBQUc7QUFDVixnQkFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCOzs7Ozs7OztlQU1jLDJCQUFHO0FBQ2QsZ0JBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUNyQixnQkFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3hCOzs7Ozs7OztlQU1ZLHlCQUFHOzs7QUFFWixnQkFBTSxLQUFLLEdBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVCLGdCQUFNLEtBQUssR0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ2hELGdCQUFJLENBQUMsS0FBSyxHQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRWpDLGdCQUFNLENBQUMsR0FBUSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLGdCQUFNLENBQUMsR0FBUSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLGdCQUFNLEtBQUssR0FBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ25DLGdCQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztBQUVwQyxnQkFBTSxPQUFPLEdBQUc7QUFDWix1QkFBTyxFQUFPLEVBQUUsQ0FBQyxFQUFELENBQUMsRUFBbUIsQ0FBQyxFQUFELENBQUMsRUFBRTtBQUN2Qyx5QkFBUyxFQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBSSxLQUFLLEdBQUcsQ0FBQyxBQUFDLEVBQUUsQ0FBQyxFQUFELENBQUMsRUFBRTtBQUN2Qyx3QkFBUSxFQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQVEsQ0FBQyxFQUFELENBQUMsRUFBRTtBQUN2QywwQkFBVSxFQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBZ0IsQ0FBQyxFQUFFLENBQUMsR0FBSSxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDekQsMEJBQVUsRUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQWdCLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFO0FBQ25ELDRCQUFZLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFJLEtBQUssR0FBRyxDQUFDLEFBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRTtBQUNuRCwyQkFBVyxFQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUU7QUFDbkQsMkJBQVcsRUFBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFRLENBQUMsRUFBRSxDQUFDLEdBQUksTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO2FBQzVELENBQUM7O0FBRUYsa0JBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLOztBQUVsQyxvQkFBTSxJQUFJLEdBQVksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLG9CQUFNLGFBQWEsR0FBRyxNQUFLLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7O0FBRTVDLHNCQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFLLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQ2YsSUFBSSxDQUFDLFlBQVksRUFBRSx3QkFBd0IsQ0FBQyxDQUM1QyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUksTUFBSyxNQUFNLEdBQUcsQ0FBQyxBQUFDLENBQUMsQ0FDckMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFJLE1BQUssTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDLENBQ3JDLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQ3JCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBSyxNQUFNLENBQUMsQ0FDMUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFLLE1BQU0sQ0FBQyxDQUMzQixFQUFFLENBQUMsT0FBTyxFQUFFOzJCQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFO2lCQUFBLENBQUMsQ0FDN0MsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQ25CLEVBQUUsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUNwQyxFQUFFLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FDOUIsRUFBRSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzthQUV0RSxDQUFDLENBQUM7U0FFTjs7Ozs7Ozs7ZUFNWSx5QkFBRzs7QUFFWixnQkFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1osb0JBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDdkI7U0FFSjs7Ozs7Ozs7O2VBT1EsbUJBQUMsS0FBSyxFQUFFOztBQUViLGdCQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWxCLGlCQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRTtBQUMvQyxvQkFBTSxHQUFHLEdBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLHNCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25EOztBQUVELGdCQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBSztBQUMvQyx1QkFBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCLENBQUMsQ0FBQzs7QUFFSCxtQkFBTyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FFdkQ7Ozs7Ozs7OztlQU9lLDBCQUFDLFVBQVUsRUFBRTs7O0FBRXpCLGdCQUFNLE1BQU0sR0FBTyxFQUFFLENBQUM7QUFDdEIsZ0JBQU0sTUFBTSxHQUFPLFdBQVcsQ0FBQztBQUMvQixnQkFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTNDLHNCQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLOzs7QUFHeEIsb0JBQU0sSUFBSSxHQUFJLE9BQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLHNCQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBRTFFLENBQUMsQ0FBQzs7Ozs7O0FBTUgsZ0JBQU0sZUFBZSxHQUFHOzs7O0FBSXBCLG1CQUFHLEVBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFLLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkYscUJBQUssRUFBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRixzQkFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFGLG9CQUFJLEVBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFLLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7O2FBRTVGLENBQUM7Ozs7OztBQU1GLGdCQUFNLGVBQWUsR0FBRzs7O0FBR3BCLHlCQUFTLEVBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUEsR0FBSSxDQUFDO0FBQ2hFLDJCQUFXLEVBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUEsR0FBSSxDQUFDO0FBQ2hFLDRCQUFZLEVBQUUsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUEsR0FBSSxDQUFDO0FBQ2hFLDBCQUFVLEVBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUEsR0FBSSxDQUFDOzthQUVuRSxDQUFDOztBQUVGLHNCQUFVLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFLOztBQUV4QixvQkFBSSxVQUFVLEtBQUssR0FBRyxFQUFFOztBQUVwQix3QkFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxHQUFHOytCQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7cUJBQUEsQ0FBQyxDQUFDOztBQUU5RCx3QkFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFOztBQUV2Qiw0QkFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxjQUFjLEVBQUU7QUFDL0MsbUNBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsbUNBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsbUNBQU87eUJBQ1Y7O0FBRUQsK0JBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEQsK0JBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsK0JBQU87cUJBRVY7O0FBRUQsMkJBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckQsMkJBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBRXhEO2FBRUosQ0FBQyxDQUFDO1NBRU47Ozs7Ozs7Ozs7ZUFRRyxjQUFDLEtBQUssRUFBRSxHQUFHLEVBQUU7O0FBRWIsZ0JBQU0sU0FBUyxHQUFVLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUMxQyxnQkFBTSxPQUFPLEdBQVksSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQyxnQkFBTSxNQUFNLEdBQWEsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNyQyxnQkFBTSxlQUFlLEdBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDekQsZ0JBQU0sZ0JBQWdCLEdBQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM5RCxnQkFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsNEJBQVEsS0FBSyxDQUFDLENBQUMsNEJBQVEsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDO0FBQzlFLGdCQUFJLE1BQU0sWUFBQTtnQkFBRSxNQUFNLFlBQUE7Z0JBQUUsS0FBSyxZQUFBLENBQUM7O0FBRTFCLG1CQUFPOzs7Ozs7QUFNSCxxQkFBSyxFQUFFLFNBQVMsS0FBSyxHQUFHOztBQUVwQiw2QkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0Qyw2QkFBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFaEMsd0JBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN6RCx5QkFBSyxHQUFVLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFFMUQsMEJBQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNqRSwwQkFBTSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUVqRSwyQkFBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO2lCQUVuQzs7Ozs7O0FBTUQsb0JBQUksRUFBRSxTQUFTLElBQUksR0FBRzs7QUFFbEIsd0JBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQyx3QkFBTSxNQUFNLEdBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQyx3QkFBTSxLQUFLLEdBQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLE1BQU0sQUFBQyxDQUFDO0FBQ3RELHdCQUFNLEtBQUssR0FBTSxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxBQUFDLENBQUM7QUFDdEQsd0JBQU0sTUFBTSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ3ZFLHdCQUFNLE1BQU0sR0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzs7QUFFdkUsd0JBQUksR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssY0FBYyxFQUFFO0FBQy9DLDhCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDNUI7O0FBRUQsd0JBQUksR0FBRyxLQUFLLGFBQWEsSUFBSSxHQUFHLEtBQUssWUFBWSxFQUFFO0FBQy9DLDhCQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDNUI7O0FBRUQsb0NBQWdCLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXRCLHdCQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdEMseUJBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUksTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFJLE1BQU0sR0FBRyxDQUFDLEFBQUMsQ0FBQyxDQUNqRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDOztBQUU5RSwyQkFBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDO2lCQUVuQzs7Ozs7O0FBTUQsbUJBQUcsRUFBRSxTQUFTLEdBQUcsR0FBRztBQUNoQiw2QkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUNoRiw2QkFBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxtQ0FBZSxFQUFFLENBQUM7aUJBQ3JCOzthQUVKLENBQUM7U0FFTDs7O1dBclJnQixTQUFTOzs7cUJBQVQsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JDVFYsV0FBVzs7Ozs4QkFDWCxzQkFBc0I7Ozs7Ozs7Ozs7O0lBUXJCLFVBQVU7YUFBVixVQUFVOzhCQUFWLFVBQVU7O21DQUFWLFVBQVU7OztjQUFWLFVBQVU7O2lCQUFWLFVBQVU7Ozs7Ozs7ZUFNckIsa0JBQUc7OztBQUVMLGdCQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsNEJBQVEsT0FBTyxDQUFDLENBQUM7QUFDOUMsbUJBQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakQsbUJBQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO3VCQUFNLE1BQUssVUFBVSxFQUFFO2FBQUEsQ0FBQyxDQUFDLENBQUM7U0FFeEU7Ozs7Ozs7O2VBTVMsc0JBQUc7O0FBRVQsZ0JBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFbkIsZ0JBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyw0QkFBUSxTQUFTLENBQUMsQ0FBQztBQUNsRCxxQkFBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7O0FBR2hDLGdCQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2hGLGlCQUFLLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztBQUM3QyxpQkFBSyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7O0FBRTdDLGdCQUFNLElBQUksR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pELGdCQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFCLG1CQUFPLEtBQUssQ0FBQztTQUVoQjs7Ozs7Ozs7ZUFNVSx1QkFBRzs7QUFFVixnQkFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxDQUFDOztBQUVqRCxnQkFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUU7O0FBRTNCLG9CQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTs7O0FBR3JCLDJCQUFPLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2lCQUVwRTs7O0FBR0QsdUJBQU8sS0FBSyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7YUFFcEU7O0FBRUQsZ0JBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFOzs7QUFHckIsb0JBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQzthQUV4RDs7QUFFRCxnQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBRXREOzs7V0FuRWdCLFVBQVU7OztxQkFBVixVQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUJDS2hCLFVBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUs7O0FBRXJDLGdCQUFZLENBQUM7O0FBRWIsWUFBUSxJQUFJOztBQUVSLGFBQUssR0FBRztBQUNKLGdCQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxtQkFBTyxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxpQkFBZSxLQUFLLFVBQUssQ0FBQyxPQUFJLENBQUM7O0FBQUEsQUFFdkUsYUFBSyxHQUFHO0FBQ0osZ0JBQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2pDLG1CQUFPLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLGlCQUFlLENBQUMsVUFBSyxLQUFLLE9BQUksQ0FBQzs7QUFBQSxLQUUxRTs7QUFFRCxXQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztDQUU3Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5QkNoQ3FCLFdBQVc7Ozs7dUJBQ1gsV0FBVzs7Ozs7Ozs7Ozs7SUFRWixXQUFXOzs7Ozs7OztBQU9qQixhQVBNLFdBQVcsQ0FPaEIsU0FBUyxFQUFFOzhCQVBOLFdBQVc7O0FBU3hCLFlBQUksQ0FBQyxxQkFBUSxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDcEMsWUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7S0FFakM7O2lCQVpnQixXQUFXOzs7Ozs7O2VBa0JOLGtDQUFHOzs7Ozs7Ozs7O0FBU3JCLGdCQUFNLE1BQU0sR0FBRyxTQUFULE1BQU0sQ0FBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBSztBQUM1QixxQkFBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZCLHNCQUFLLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25DLENBQUM7O0FBRUYsZ0JBQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxxQkFBUSxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxRCxnQkFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQztBQUNoRCxnQkFBTSxhQUFhLEdBQUssT0FBTyxDQUFDLGFBQWEsQ0FBQzs7QUFFOUMsbUNBQVUsSUFBSSxDQUFDLE1BQU0sRUFBRyxVQUFDLEtBQUs7dUJBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7YUFBQSxDQUFDLENBQUM7QUFDdkUsbUNBQVUsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFDLEtBQUs7dUJBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO2FBQUEsQ0FBQyxDQUFDO0FBQ3RFLG1DQUFVLElBQUksQ0FBQyxJQUFJLEVBQUssVUFBQyxLQUFLO3VCQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDO2FBQUEsQ0FBQyxDQUFDO0FBQ3ZFLG1DQUFVLElBQUksQ0FBQyxNQUFNLEVBQUcsVUFBQyxLQUFLO3VCQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLGVBQWUsQ0FBQzthQUFBLENBQUMsQ0FBQzs7QUFFdEUsbUNBQVUsSUFBSSxDQUFDLFlBQVksRUFBRyxVQUFDLEtBQUs7dUJBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7YUFBQSxDQUFDLENBQUM7QUFDM0UsbUNBQVUsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFDLEtBQUs7dUJBQUssTUFBTSxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO2FBQUEsQ0FBQyxDQUFDO0FBQzFFLG1DQUFVLElBQUksQ0FBQyxVQUFVLEVBQUssVUFBQyxLQUFLO3VCQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDO2FBQUEsQ0FBQyxDQUFDO0FBQzNFLG1DQUFVLElBQUksQ0FBQyxZQUFZLEVBQUcsVUFBQyxLQUFLO3VCQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLGFBQWEsQ0FBQzthQUFBLENBQUMsQ0FBQztTQUU3RTs7Ozs7Ozs7ZUFNVSx1QkFBRzs7QUFFVixnQkFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHFCQUFRLFNBQVMsQ0FBQyxDQUFDO0FBQzFDLGNBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7O0FBRTNCLGdCQUFJLFNBQVMsQ0FBQyxlQUFlLEVBQUUsRUFBRTtBQUM3Qix5QkFBUyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyx1QkFBTzthQUNWOztBQUVELGdCQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztBQUM5QixnQkFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7O0FBRTlCLGdCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN6QyxnQkFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMxRCxnQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRXhDLGdCQUFJLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDaEMsb0JBQU0sTUFBSyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDNUUsdUJBQU8sQ0FBQyxhQUFhLENBQUMsTUFBSyxDQUFDLENBQUM7YUFDaEM7U0FDSjs7Ozs7Ozs7OztlQVFjLHlCQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUU7Ozs7OztBQUU3QixnQkFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1gsb0JBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDdEI7O0FBRUQsZ0JBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDdkIsdUJBQU87YUFDVjs7QUFFRCxnQkFBTSxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVM7QUFDOUMsb0JBQUksRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Ozs7Ozs7Ozs7QUFVakUsZ0JBQU0sT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLE1BQU0sRUFBSztBQUN4QixxQkFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFBLENBQVIsSUFBSSxxQkFBUSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQzsyQkFBSyxDQUFDLENBQUMsQ0FBQztpQkFBQSxDQUFDLEVBQUMsQ0FBQztBQUNqRCxxQkFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFBLENBQVIsSUFBSSxxQkFBUSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQzsyQkFBSyxDQUFDLENBQUMsQ0FBQztpQkFBQSxDQUFDLEVBQUMsQ0FBQztBQUNqRCxxQkFBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxNQUFBLENBQVIsSUFBSSxxQkFBUSxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQzsyQkFBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLO2lCQUFBLENBQUMsRUFBQyxDQUFDO0FBQzNELHFCQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLE1BQUEsQ0FBUixJQUFJLHFCQUFRLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxDQUFDOzJCQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU07aUJBQUEsQ0FBQyxFQUFDLENBQUM7YUFDL0QsQ0FBQzs7O0FBR0YsbUJBQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSzt1QkFBSyxLQUFLLENBQUMsV0FBVyxFQUFFO2FBQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXRELGdCQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQ2QsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUNaLE9BQU8sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQ3pCLElBQUksQ0FBQyxHQUFHLEVBQVEsVUFBQyxDQUFDO3VCQUFLLENBQUMsQ0FBQyxJQUFJO2FBQUEsQ0FBRSxDQUMvQixJQUFJLENBQUMsR0FBRyxFQUFRLFVBQUMsQ0FBQzt1QkFBSyxDQUFDLENBQUMsSUFBSTthQUFBLENBQUUsQ0FDL0IsSUFBSSxDQUFDLE9BQU8sRUFBSSxVQUFDLENBQUM7dUJBQUssQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSTthQUFBLENBQUUsQ0FDeEMsSUFBSSxDQUFDLFFBQVEsRUFBRyxVQUFDLENBQUM7dUJBQUssQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSTthQUFBLENBQUUsQ0FDeEMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztBQUUzRCxnQkFBTSxTQUFTLEdBQUcsQ0FBQyxXQUFXLEVBQUU7dUJBQU0sT0FBSyxTQUFTLEVBQUU7YUFBQSxDQUFDLENBQUM7QUFDeEQsZ0JBQU0sSUFBSSxHQUFRLENBQUMsTUFBTSxFQUFPO3VCQUFNLE9BQUssSUFBSSxFQUFFO2FBQUEsQ0FBQyxDQUFDO0FBQ25ELGdCQUFNLE9BQU8sR0FBSyxDQUFDLFNBQVMsRUFBSTt1QkFBTSxPQUFLLE9BQU8sRUFBRTthQUFBLENBQUMsQ0FBQzs7QUFFdEQsZ0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLDJCQUFBLHdCQUFBLHFCQUFBLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUMsRUFBRSxNQUFBLG9CQUFJLFNBQVMsQ0FBQyxFQUFDLEVBQUUsTUFBQSx1QkFBSSxJQUFJLENBQUMsRUFBQyxFQUFFLE1BQUEsMEJBQUksT0FBTyxDQUFDLENBQUMsQ0FBQztTQUVsRjs7Ozs7Ozs7OztlQVFRLHFCQUFxQjtnQkFBcEIsQ0FBQyxnQ0FBRyxJQUFJO2dCQUFFLENBQUMsZ0NBQUcsSUFBSTs7QUFFeEIsZ0JBQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLGdCQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFdkMsZ0JBQUksQ0FBQyxLQUFLLEdBQUc7QUFDVCxpQkFBQyxFQUFFLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFBLEdBQUksRUFBRTtBQUN6RixpQkFBQyxFQUFFLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFBLEdBQUksRUFBRTthQUM1RixDQUFDOztBQUVGLGdCQUFJLENBQUMsSUFBSSxHQUFHO0FBQ1IscUJBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtBQUN2QixtQkFBRyxFQUFJLEVBQUc7YUFDYixDQUFDO1NBRUw7Ozs7Ozs7Ozs7O2VBU0csZ0JBQThFO2dCQUE3RSxDQUFDLGdDQUFHLElBQUk7Z0JBQUUsQ0FBQyxnQ0FBRyxJQUFJO2dCQUFFLFVBQVUsZ0NBQUcsSUFBSSxDQUFDLHFCQUFRLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVE7O0FBRTVFLGdCQUFJLENBQUMscUJBQVEsU0FBUyxDQUFDLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUU5QyxhQUFDLEdBQUcsQUFBQyxDQUFDLEtBQUssSUFBSSxHQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7QUFDbEQsYUFBQyxHQUFHLEFBQUMsQ0FBQyxLQUFLLElBQUksR0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDOztBQUVsRCxnQkFBTSxFQUFFLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFDO2dCQUN2QixFQUFFLEdBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFDO2dCQUN2QixFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLEdBQUcsVUFBVTtnQkFDNUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQzs7QUFFbkQsZ0JBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUN6QixnQkFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUV6QixnQkFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3hCLGdCQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXhCLGdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO1NBRXBDOzs7Ozs7OztlQU1NLG1CQUFHOztBQUVOLGdCQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQy9DLGdCQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOztBQUUvQyxnQkFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3hCLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUUvQjs7Ozs7Ozs7Ozs7ZUFTYSx3QkFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFvQjs7O2dCQUFsQixRQUFRLGdDQUFHLEtBQUs7O0FBRWpDLGdCQUFJLENBQUMscUJBQVEsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFLOztBQUVsRCxvQkFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQyxvQkFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqQyxvQkFBTSxLQUFLLEdBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQztBQUM5QixvQkFBTSxLQUFLLEdBQU0sUUFBUSxHQUFHLENBQUMsQ0FBQzs7QUFFOUIscUJBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMscUJBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDeEMscUJBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFaEIsb0JBQUksUUFBUSxFQUFFO0FBQ1YsMkJBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM1QywyQkFBSyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUMvQzthQUVKLENBQUMsQ0FBQztTQUVOOzs7V0FsT2dCLFdBQVc7OztxQkFBWCxXQUFXOzs7Ozs7Ozs7Ozs7dUJDVFosV0FBVzs7Ozs7Ozs7Ozs7QUFTL0IsSUFBTSxTQUFTLEdBQUcsU0FBWixTQUFTLENBQUksT0FBTyxFQUFFLFlBQVksRUFBaUI7O0FBRXJELGdCQUFZLENBQUM7O3NDQUY0QixPQUFPO0FBQVAsZUFBTzs7O0FBSWhELFFBQUksT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssVUFBVSxFQUFFO0FBQzdDLGVBQU8sQ0FBQyxZQUFZLE9BQUMsQ0FBckIsT0FBTyxFQUFrQixPQUFPLENBQUMsQ0FBQztBQUNsQyxlQUFPLElBQUksQ0FBQztLQUNmOztBQUVELFdBQU8sS0FBSyxDQUFDO0NBRWhCLENBQUM7Ozs7Ozs7QUFPRixJQUFNLFVBQVUsR0FBRyxTQUFiLFVBQVUsQ0FBSSxJQUFJLEVBQUs7O0FBRXpCLGdCQUFZLENBQUM7O0FBRWIsV0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Q0FFdkQsQ0FBQzs7Ozs7Ozs7O3FCQVFhLENBQUMsWUFBTTs7QUFFbEIsZ0JBQVksQ0FBQzs7QUFFYixXQUFPOzs7Ozs7OztBQVFILFdBQUcsRUFBQSxhQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7O0FBRWQsa0JBQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVuRCxtQkFBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQzNCLHVCQUFPLFNBQVMsQ0FBQyxLQUFLLFVBQVEsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFHLENBQUM7YUFDckQsQ0FBQyxDQUFDO1NBRU47Ozs7Ozs7OztBQVNELHNCQUFjLEVBQUEsd0JBQUMsS0FBSyxFQUFFLEVBQUUsRUFBZ0I7Z0JBQWQsT0FBTyxnQ0FBRyxFQUFFOztBQUVsQyxnQkFBTSxPQUFPLEdBQUssT0FBTyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUM7QUFDL0MsZ0JBQU0sT0FBTyxHQUFLLE9BQU8sQ0FBQyxPQUFPLElBQUksU0FBUyxDQUFDO0FBQy9DLGdCQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMscUJBQVEsU0FBUyxDQUFDLENBQUM7Ozs7Ozs7QUFPM0MsZ0JBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFJLFNBQVMsRUFBSzs7QUFFaEMseUJBQVMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztBQUUvRCx1QkFBTyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ3JDLDJCQUFPLEVBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNyQyxDQUFDLENBQUM7YUFFTixDQUFDOztBQUVGLGdCQUFJLE9BQU8sRUFBRTtBQUNULHVCQUFPLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQzFDOztBQUVELGdCQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1YsdUJBQU8sS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQy9COztBQUVELGNBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUU1Qzs7S0FFSixDQUFDO0NBRUwsQ0FBQSxFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozt5QkN6R2tCLFdBQVc7Ozs7dUJBQ1gsV0FBVzs7Ozs7Ozs7Ozs7SUFRWixXQUFXOzs7Ozs7OztBQU9qQixhQVBNLFdBQVcsQ0FPaEIsU0FBUyxFQUFFOzhCQVBOLFdBQVc7O0FBU3hCLFlBQU0sTUFBTSxHQUFjLFNBQVMsQ0FBQyxxQkFBUSxPQUFPLENBQUMsQ0FBQztBQUNyRCxZQUFJLENBQUMscUJBQVEsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDOzs7QUFHcEMsY0FBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDM0IsY0FBTSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7OztBQUczQixZQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBRS9COztpQkFuQmdCLFdBQVc7Ozs7Ozs7O2VBMEJkLHdCQUFDLE1BQU0sRUFBRTs7OztBQUduQixtQ0FBVSxJQUFJLENBQUMsT0FBTyxFQUFFO3VCQUFNLE1BQUsscUJBQVEsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFO2FBQUEsQ0FBQyxDQUFDOzs7QUFHaEUsbUNBQVUsSUFBSSxDQUFDLEtBQUssRUFBSTt1QkFBTSxNQUFNLENBQUMsV0FBVyxHQUFHLElBQUk7YUFBQSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3BFLG1DQUFVLElBQUksQ0FBQyxLQUFLLEVBQUk7dUJBQU0sTUFBTSxDQUFDLFdBQVcsR0FBRyxLQUFLO2FBQUEsRUFBRSxPQUFPLENBQUMsQ0FBQzs7O0FBR25FLG1DQUFVLElBQUksQ0FBQyxPQUFPLEVBQUU7dUJBQU0sTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJO2FBQUEsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUNwRSxtQ0FBVSxJQUFJLENBQUMsT0FBTyxFQUFFO3VCQUFNLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSzthQUFBLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FFdEU7OztXQXZDZ0IsV0FBVzs7O3FCQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs0QkNUVixrQkFBa0I7Ozs7K0JBQ2xCLHFCQUFxQjs7Ozs7Ozs7Ozs7cUJBUTVCLFVBQUMsSUFBSSxFQUFLOztBQUVyQixnQkFBWSxDQUFDOztBQUViLFFBQU0sR0FBRyxHQUFHO0FBQ1IsaUJBQVMsOEJBQVc7S0FDdkIsQ0FBQzs7QUFFRixXQUFPLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUNmLCtDQUF5QixJQUFJLHlCQUFzQixDQUFDO0NBRWpHOzs7Ozs7Ozs7Ozs7Ozs7Ozt1QkNwQnVCLFdBQVc7Ozs7MkJBQ1gsZUFBZTs7Ozt5QkFDZixhQUFhOzs7Ozs7Ozs7OztJQVFoQixTQUFTOzs7Ozs7OztBQU9mLGFBUE0sU0FBUyxDQU9kLEtBQUssRUFBRTs4QkFQRixTQUFTOztBQVN0QixZQUFJLENBQUMscUJBQVEsS0FBSyxDQUFDLEdBQVUsS0FBSyxDQUFDO0FBQ25DLFlBQUksQ0FBQyxxQkFBUSxPQUFPLENBQUMsR0FBUSxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLHFCQUFRLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQzs7QUFFbkMscUNBQWdCLElBQUksQ0FBQyxDQUFDO0tBRXpCOztpQkFmZ0IsU0FBUzs7Ozs7OztlQXFCeEIsY0FBRztBQUNELG1CQUFPLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxxQkFBUSxHQUFHLENBQUMsQ0FBQztTQUMzQzs7Ozs7Ozs7ZUFNSyxrQkFBRztBQUNMLG1CQUFPLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxxQkFBUSxNQUFNLENBQUMsQ0FBQztTQUM5Qzs7Ozs7Ozs7ZUFNTSxtQkFBRztBQUNOLG1CQUFPLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN4Qzs7Ozs7Ozs7ZUFNSyxrQkFBRztBQUNMLG1CQUFPLElBQUksQ0FBQyxxQkFBUSxPQUFPLENBQUMsQ0FBQztTQUNoQzs7Ozs7Ozs7O2VBT0ssZ0JBQUMsT0FBTyxFQUFFO0FBQ1osbUNBQVUsY0FBYyxDQUFDLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMscUJBQVEsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3RGOzs7Ozs7Ozs7ZUFPTyxrQkFBQyxPQUFPLEVBQUU7QUFDZCxtQ0FBVSxjQUFjLENBQUMsSUFBSSxDQUFDLHFCQUFRLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDeEY7Ozs7Ozs7O2VBTUUsZUFBRztBQUNGLG1CQUFPLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNwQzs7Ozs7Ozs7ZUFNTyxvQkFBRztBQUNQLG1CQUFPLElBQUksQ0FBQyxxQkFBUSxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN6Qzs7Ozs7Ozs7O2VBT1UscUJBQUMsT0FBTyxFQUFFOztBQUVqQixtQkFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBSyxFQUFLO0FBQ2hDLHVCQUFPLE9BQU8sS0FBSyxLQUFLLENBQUMscUJBQVEsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDcEQsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBRVQ7Ozs7Ozs7O2VBTWMseUJBQUMsS0FBSyxFQUFFOztBQUVuQixnQkFBSSxPQUFPLEtBQUssS0FBSyxXQUFXLEVBQUU7QUFDOUIsdUJBQU8sSUFBSSxDQUFDLHFCQUFRLFlBQVksQ0FBQyxDQUFDO2FBQ3JDOztBQUVELGdCQUFJLENBQUMscUJBQVEsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBRXRDOzs7Ozs7OztlQU1VLHVCQUFHO0FBQ1YsbUJBQU8sSUFBSSxDQUFDLHFCQUFRLEtBQUssQ0FBQyxDQUFDLHFCQUFRLFlBQVksQ0FBQyxDQUFDO1NBQ3BEOzs7V0FwSGdCLFNBQVM7OztxQkFBVCxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7UUNKZCxZQUFZLEdBQVosWUFBWTs7QUFBckIsU0FBUyxZQUFZLENBQUMsTUFBTSxFQUFFOztBQUVqQyxnQkFBWSxDQUFDOztBQUViLFFBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO0FBQ3pDLGNBQU0sSUFBSSxTQUFTLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUNsRTs7QUFFRCxRQUFJLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRXhCLFNBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZDLFlBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixZQUFJLFVBQVUsS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtBQUNqRCxxQkFBUztTQUNaO0FBQ0Qsa0JBQVUsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRWhDLFlBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7O0FBRWhELGFBQUssSUFBSSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsR0FBRyxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUU7QUFDMUUsZ0JBQUksT0FBTyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNuQyxnQkFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNoRSxnQkFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDdkMsa0JBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDckM7U0FDSjtLQUNKOztBQUVELFdBQU8sRUFBRSxDQUFDO0NBRWI7Ozs7Ozs7Ozs7Ozs7O3FCQzlCYztBQUNYLFNBQUssRUFBUyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzdCLE9BQUcsRUFBVyxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQzNCLFdBQU8sRUFBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQy9CLGVBQVcsRUFBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ2xDLGNBQVUsRUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ2xDLGFBQVMsRUFBSyxNQUFNLENBQUMsV0FBVyxDQUFDO0FBQ2pDLFNBQUssRUFBUyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzdCLFVBQU0sRUFBUSxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzlCLFVBQU0sRUFBUSxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQzlCLFNBQUssRUFBUyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzdCLGdCQUFZLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQztBQUNuQyxXQUFPLEVBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUMvQixhQUFTLEVBQUssTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUNqQyxXQUFPLEVBQU8sTUFBTSxDQUFDLFFBQVEsQ0FBQztBQUM5QixnQkFBWSxFQUFFLE1BQU0sQ0FBQyxhQUFhLENBQUM7Q0FDdEM7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ2hCb0IsS0FBSzs7Ozs7OztBQU9YLFNBUE0sS0FBSyxDQU9WLE9BQU8sRUFBRTt3QkFQSixLQUFLOztBQVFsQixRQUFNLElBQUksS0FBSyxnQkFBYyxPQUFPLE9BQUksQ0FBQztDQUM1Qzs7cUJBVGdCLEtBQUs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQ05SLFNBQVM7Ozs7Ozs7Ozs7O0lBUU4sU0FBUzthQUFULFNBQVM7OEJBQVQsU0FBUzs7bUNBQVQsU0FBUzs7O2NBQVQsU0FBUzs7aUJBQVQsU0FBUzs7Ozs7OztlQU1uQixtQkFBRztBQUNOLG1CQUFPLE1BQU0sQ0FBQztTQUNqQjs7Ozs7Ozs7ZUFNZ0IsNkJBQUc7O0FBRWhCLG1CQUFPO0FBQ0gsb0JBQUksRUFBRSxNQUFNO0FBQ1osc0JBQU0sRUFBRSxHQUFHO0FBQ1gscUJBQUssRUFBRSxHQUFHO0FBQ1YsaUJBQUMsRUFBRSxDQUFDO0FBQ0osaUJBQUMsRUFBRSxDQUFDO2FBQ1AsQ0FBQztTQUVMOzs7V0F4QmdCLFNBQVM7OztxQkFBVCxTQUFTOzs7Ozs7Ozs7Ozs7Ozs7OzhCQ1JILG9CQUFvQjs7Ozs0QkFDcEIsa0JBQWtCOzs7O2dDQUNsQixzQkFBc0I7O2lDQUN0Qix1QkFBdUI7Ozs7Z0NBQ3ZCLHNCQUFzQjs7OzttQ0FDdEIseUJBQXlCOzs7O2tDQUN6Qix3QkFBd0I7Ozs7Ozs7Ozs7O0lBUTlCLEtBQUs7Ozs7Ozs7O0FBT1gsYUFQTSxLQUFLLEdBT087WUFBakIsVUFBVSxnQ0FBRyxFQUFFOzs4QkFQVixLQUFLOztBQVFsQixZQUFJLENBQUMsNEJBQVEsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDO0tBQ3pDOztpQkFUZ0IsS0FBSzs7Ozs7Ozs7ZUFnQmYsbUJBQUc7QUFDTiwwQ0FBVSxpRUFBaUUsQ0FBQyxDQUFDO1NBQ2hGOzs7Ozs7OztlQU1TLHNCQUFHO0FBQ1QsbUJBQU8sSUFBSSxDQUFDLDRCQUFRLFdBQVcsQ0FBQyxDQUFDO1NBQ3BDOzs7Ozs7Ozs7O2VBUUcsY0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFOztBQUVkLGdCQUFJLE9BQU8sS0FBSyxLQUFLLFdBQVcsRUFBRTtBQUM5Qix1QkFBTyxJQUFJLENBQUMsNEJBQVEsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDOUM7O0FBRUQsZ0JBQUksQ0FBQyw0QkFBUSxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDNUMsZ0RBQWEsSUFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFakQsbUJBQU8sSUFBSSxDQUFDO1NBRWY7Ozs7Ozs7O2VBTUssa0JBQUc7OztBQUVMLGdCQUFNLEtBQUssR0FBYSxJQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0FBQ2hFLGdCQUFNLFVBQVUsR0FBUSxzQkFsRXhCLFlBQVksRUFrRXlCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksQ0FBQyw0QkFBUSxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3pGLGdCQUFJLENBQUMsNEJBQVEsS0FBSyxDQUFDLEdBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQyxnQkFBSSxDQUFDLDRCQUFRLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyw0QkFBUSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDOzs7O0FBSTdFLGtCQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUc7dUJBQUssTUFBSyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUFBLENBQUMsQ0FBQzs7QUFFMUUsZ0JBQU0sU0FBUyxHQUFJO0FBQ2YsMEJBQVUsRUFBRSxzQ0FBZ0I7QUFDNUIseUJBQVMsRUFBRyxxQ0FBZTthQUM5QixDQUFDOztBQUVGLGtCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEdBQUcsRUFBSzs7O0FBR3BDLG9CQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0IsdUJBQU8sQ0FBQyw0QkFBUSxLQUFLLENBQUMsUUFBTyxDQUFDO0FBQzlCLDhDQUFVLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFFakMsQ0FBQyxDQUFDOztBQUVILGdCQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDO1NBRXZDOzs7Ozs7OztlQU1RLHFCQUFHLEVBQUc7Ozs7Ozs7O2VBTVIsbUJBQUc7QUFDTixnQkFBSSxDQUFDLDRCQUFRLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUN2RDs7Ozs7Ozs7ZUFNUSxxQkFBRztBQUNSLGdCQUFJLENBQUMsNEJBQVEsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLGdCQUFJLENBQUMsNEJBQVEsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2pEOzs7Ozs7OztlQU1VLHVCQUFHO0FBQ1YsZ0JBQUksQ0FBQyw0QkFBUSxXQUFXLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbEMsZ0JBQUksQ0FBQyw0QkFBUSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDbkQ7Ozs7Ozs7O2VBTVUsdUJBQUc7O0FBRVYsZ0JBQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxDQUFDLDRCQUFRLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sS0FBSyxVQUFVLENBQUM7O0FBRXpFLG1CQUFPLE9BQU8sR0FBRyxJQUFJLENBQUMsNEJBQVEsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUc7QUFDcEQsc0JBQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzQixxQkFBSyxFQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQzFCLGlCQUFDLEVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDdEIsaUJBQUMsRUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzthQUN6QixDQUFDO1NBRUw7Ozs7Ozs7O2VBTWdCLDZCQUFHO0FBQ2hCLG1CQUFPLEVBQUUsQ0FBQztTQUNiOzs7V0F2SWdCLEtBQUs7OztxQkFBTCxLQUFLIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFsIGRlZmluZTpmYWxzZSAqL1xuLyoqXG4gKiBDb3B5cmlnaHQgMjAxNSBDcmFpZyBDYW1wYmVsbFxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICpcbiAqIE1vdXNldHJhcCBpcyBhIHNpbXBsZSBrZXlib2FyZCBzaG9ydGN1dCBsaWJyYXJ5IGZvciBKYXZhc2NyaXB0IHdpdGhcbiAqIG5vIGV4dGVybmFsIGRlcGVuZGVuY2llc1xuICpcbiAqIEB2ZXJzaW9uIDEuNS4zXG4gKiBAdXJsIGNyYWlnLmlzL2tpbGxpbmcvbWljZVxuICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKSB7XG5cbiAgICAvKipcbiAgICAgKiBtYXBwaW5nIG9mIHNwZWNpYWwga2V5Y29kZXMgdG8gdGhlaXIgY29ycmVzcG9uZGluZyBrZXlzXG4gICAgICpcbiAgICAgKiBldmVyeXRoaW5nIGluIHRoaXMgZGljdGlvbmFyeSBjYW5ub3QgdXNlIGtleXByZXNzIGV2ZW50c1xuICAgICAqIHNvIGl0IGhhcyB0byBiZSBoZXJlIHRvIG1hcCB0byB0aGUgY29ycmVjdCBrZXljb2RlcyBmb3JcbiAgICAgKiBrZXl1cC9rZXlkb3duIGV2ZW50c1xuICAgICAqXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICB2YXIgX01BUCA9IHtcbiAgICAgICAgODogJ2JhY2tzcGFjZScsXG4gICAgICAgIDk6ICd0YWInLFxuICAgICAgICAxMzogJ2VudGVyJyxcbiAgICAgICAgMTY6ICdzaGlmdCcsXG4gICAgICAgIDE3OiAnY3RybCcsXG4gICAgICAgIDE4OiAnYWx0JyxcbiAgICAgICAgMjA6ICdjYXBzbG9jaycsXG4gICAgICAgIDI3OiAnZXNjJyxcbiAgICAgICAgMzI6ICdzcGFjZScsXG4gICAgICAgIDMzOiAncGFnZXVwJyxcbiAgICAgICAgMzQ6ICdwYWdlZG93bicsXG4gICAgICAgIDM1OiAnZW5kJyxcbiAgICAgICAgMzY6ICdob21lJyxcbiAgICAgICAgMzc6ICdsZWZ0JyxcbiAgICAgICAgMzg6ICd1cCcsXG4gICAgICAgIDM5OiAncmlnaHQnLFxuICAgICAgICA0MDogJ2Rvd24nLFxuICAgICAgICA0NTogJ2lucycsXG4gICAgICAgIDQ2OiAnZGVsJyxcbiAgICAgICAgOTE6ICdtZXRhJyxcbiAgICAgICAgOTM6ICdtZXRhJyxcbiAgICAgICAgMjI0OiAnbWV0YSdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogbWFwcGluZyBmb3Igc3BlY2lhbCBjaGFyYWN0ZXJzIHNvIHRoZXkgY2FuIHN1cHBvcnRcbiAgICAgKlxuICAgICAqIHRoaXMgZGljdGlvbmFyeSBpcyBvbmx5IHVzZWQgaW5jYXNlIHlvdSB3YW50IHRvIGJpbmQgYVxuICAgICAqIGtleXVwIG9yIGtleWRvd24gZXZlbnQgdG8gb25lIG9mIHRoZXNlIGtleXNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdmFyIF9LRVlDT0RFX01BUCA9IHtcbiAgICAgICAgMTA2OiAnKicsXG4gICAgICAgIDEwNzogJysnLFxuICAgICAgICAxMDk6ICctJyxcbiAgICAgICAgMTEwOiAnLicsXG4gICAgICAgIDExMSA6ICcvJyxcbiAgICAgICAgMTg2OiAnOycsXG4gICAgICAgIDE4NzogJz0nLFxuICAgICAgICAxODg6ICcsJyxcbiAgICAgICAgMTg5OiAnLScsXG4gICAgICAgIDE5MDogJy4nLFxuICAgICAgICAxOTE6ICcvJyxcbiAgICAgICAgMTkyOiAnYCcsXG4gICAgICAgIDIxOTogJ1snLFxuICAgICAgICAyMjA6ICdcXFxcJyxcbiAgICAgICAgMjIxOiAnXScsXG4gICAgICAgIDIyMjogJ1xcJydcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogdGhpcyBpcyBhIG1hcHBpbmcgb2Yga2V5cyB0aGF0IHJlcXVpcmUgc2hpZnQgb24gYSBVUyBrZXlwYWRcbiAgICAgKiBiYWNrIHRvIHRoZSBub24gc2hpZnQgZXF1aXZlbGVudHNcbiAgICAgKlxuICAgICAqIHRoaXMgaXMgc28geW91IGNhbiB1c2Uga2V5dXAgZXZlbnRzIHdpdGggdGhlc2Uga2V5c1xuICAgICAqXG4gICAgICogbm90ZSB0aGF0IHRoaXMgd2lsbCBvbmx5IHdvcmsgcmVsaWFibHkgb24gVVMga2V5Ym9hcmRzXG4gICAgICpcbiAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAqL1xuICAgIHZhciBfU0hJRlRfTUFQID0ge1xuICAgICAgICAnfic6ICdgJyxcbiAgICAgICAgJyEnOiAnMScsXG4gICAgICAgICdAJzogJzInLFxuICAgICAgICAnIyc6ICczJyxcbiAgICAgICAgJyQnOiAnNCcsXG4gICAgICAgICclJzogJzUnLFxuICAgICAgICAnXic6ICc2JyxcbiAgICAgICAgJyYnOiAnNycsXG4gICAgICAgICcqJzogJzgnLFxuICAgICAgICAnKCc6ICc5JyxcbiAgICAgICAgJyknOiAnMCcsXG4gICAgICAgICdfJzogJy0nLFxuICAgICAgICAnKyc6ICc9JyxcbiAgICAgICAgJzonOiAnOycsXG4gICAgICAgICdcXFwiJzogJ1xcJycsXG4gICAgICAgICc8JzogJywnLFxuICAgICAgICAnPic6ICcuJyxcbiAgICAgICAgJz8nOiAnLycsXG4gICAgICAgICd8JzogJ1xcXFwnXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHRoaXMgaXMgYSBsaXN0IG9mIHNwZWNpYWwgc3RyaW5ncyB5b3UgY2FuIHVzZSB0byBtYXBcbiAgICAgKiB0byBtb2RpZmllciBrZXlzIHdoZW4geW91IHNwZWNpZnkgeW91ciBrZXlib2FyZCBzaG9ydGN1dHNcbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgdmFyIF9TUEVDSUFMX0FMSUFTRVMgPSB7XG4gICAgICAgICdvcHRpb24nOiAnYWx0JyxcbiAgICAgICAgJ2NvbW1hbmQnOiAnbWV0YScsXG4gICAgICAgICdyZXR1cm4nOiAnZW50ZXInLFxuICAgICAgICAnZXNjYXBlJzogJ2VzYycsXG4gICAgICAgICdwbHVzJzogJysnLFxuICAgICAgICAnbW9kJzogL01hY3xpUG9kfGlQaG9uZXxpUGFkLy50ZXN0KG5hdmlnYXRvci5wbGF0Zm9ybSkgPyAnbWV0YScgOiAnY3RybCdcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogdmFyaWFibGUgdG8gc3RvcmUgdGhlIGZsaXBwZWQgdmVyc2lvbiBvZiBfTUFQIGZyb20gYWJvdmVcbiAgICAgKiBuZWVkZWQgdG8gY2hlY2sgaWYgd2Ugc2hvdWxkIHVzZSBrZXlwcmVzcyBvciBub3Qgd2hlbiBubyBhY3Rpb25cbiAgICAgKiBpcyBzcGVjaWZpZWRcbiAgICAgKlxuICAgICAqIEB0eXBlIHtPYmplY3R8dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHZhciBfUkVWRVJTRV9NQVA7XG5cbiAgICAvKipcbiAgICAgKiBsb29wIHRocm91Z2ggdGhlIGYga2V5cywgZjEgdG8gZjE5IGFuZCBhZGQgdGhlbSB0byB0aGUgbWFwXG4gICAgICogcHJvZ3JhbWF0aWNhbGx5XG4gICAgICovXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCAyMDsgKytpKSB7XG4gICAgICAgIF9NQVBbMTExICsgaV0gPSAnZicgKyBpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGxvb3AgdGhyb3VnaCB0byBtYXAgbnVtYmVycyBvbiB0aGUgbnVtZXJpYyBrZXlwYWRcbiAgICAgKi9cbiAgICBmb3IgKGkgPSAwOyBpIDw9IDk7ICsraSkge1xuICAgICAgICBfTUFQW2kgKyA5Nl0gPSBpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNyb3NzIGJyb3dzZXIgYWRkIGV2ZW50IG1ldGhvZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtFbGVtZW50fEhUTUxEb2N1bWVudH0gb2JqZWN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfYWRkRXZlbnQob2JqZWN0LCB0eXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAob2JqZWN0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9iamVjdC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvYmplY3QuYXR0YWNoRXZlbnQoJ29uJyArIHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB0YWtlcyB0aGUgZXZlbnQgYW5kIHJldHVybnMgdGhlIGtleSBjaGFyYWN0ZXJcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gX2NoYXJhY3RlckZyb21FdmVudChlKSB7XG5cbiAgICAgICAgLy8gZm9yIGtleXByZXNzIGV2ZW50cyB3ZSBzaG91bGQgcmV0dXJuIHRoZSBjaGFyYWN0ZXIgYXMgaXNcbiAgICAgICAgaWYgKGUudHlwZSA9PSAna2V5cHJlc3MnKSB7XG4gICAgICAgICAgICB2YXIgY2hhcmFjdGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKTtcblxuICAgICAgICAgICAgLy8gaWYgdGhlIHNoaWZ0IGtleSBpcyBub3QgcHJlc3NlZCB0aGVuIGl0IGlzIHNhZmUgdG8gYXNzdW1lXG4gICAgICAgICAgICAvLyB0aGF0IHdlIHdhbnQgdGhlIGNoYXJhY3RlciB0byBiZSBsb3dlcmNhc2UuICB0aGlzIG1lYW5zIGlmXG4gICAgICAgICAgICAvLyB5b3UgYWNjaWRlbnRhbGx5IGhhdmUgY2FwcyBsb2NrIG9uIHRoZW4geW91ciBrZXkgYmluZGluZ3NcbiAgICAgICAgICAgIC8vIHdpbGwgY29udGludWUgdG8gd29ya1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIHRoZSBvbmx5IHNpZGUgZWZmZWN0IHRoYXQgbWlnaHQgbm90IGJlIGRlc2lyZWQgaXMgaWYgeW91XG4gICAgICAgICAgICAvLyBiaW5kIHNvbWV0aGluZyBsaWtlICdBJyBjYXVzZSB5b3Ugd2FudCB0byB0cmlnZ2VyIGFuXG4gICAgICAgICAgICAvLyBldmVudCB3aGVuIGNhcGl0YWwgQSBpcyBwcmVzc2VkIGNhcHMgbG9jayB3aWxsIG5vIGxvbmdlclxuICAgICAgICAgICAgLy8gdHJpZ2dlciB0aGUgZXZlbnQuICBzaGlmdCthIHdpbGwgdGhvdWdoLlxuICAgICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyID0gY2hhcmFjdGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjaGFyYWN0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmb3Igbm9uIGtleXByZXNzIGV2ZW50cyB0aGUgc3BlY2lhbCBtYXBzIGFyZSBuZWVkZWRcbiAgICAgICAgaWYgKF9NQVBbZS53aGljaF0pIHtcbiAgICAgICAgICAgIHJldHVybiBfTUFQW2Uud2hpY2hdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9LRVlDT0RFX01BUFtlLndoaWNoXSkge1xuICAgICAgICAgICAgcmV0dXJuIF9LRVlDT0RFX01BUFtlLndoaWNoXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGl0IGlzIG5vdCBpbiB0aGUgc3BlY2lhbCBtYXBcblxuICAgICAgICAvLyB3aXRoIGtleWRvd24gYW5kIGtleXVwIGV2ZW50cyB0aGUgY2hhcmFjdGVyIHNlZW1zIHRvIGFsd2F5c1xuICAgICAgICAvLyBjb21lIGluIGFzIGFuIHVwcGVyY2FzZSBjaGFyYWN0ZXIgd2hldGhlciB5b3UgYXJlIHByZXNzaW5nIHNoaWZ0XG4gICAgICAgIC8vIG9yIG5vdC4gIHdlIHNob3VsZCBtYWtlIHN1cmUgaXQgaXMgYWx3YXlzIGxvd2VyY2FzZSBmb3IgY29tcGFyaXNvbnNcbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkudG9Mb3dlckNhc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjaGVja3MgaWYgdHdvIGFycmF5cyBhcmUgZXF1YWxcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IG1vZGlmaWVyczFcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBtb2RpZmllcnMyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgZnVuY3Rpb24gX21vZGlmaWVyc01hdGNoKG1vZGlmaWVyczEsIG1vZGlmaWVyczIpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVyczEuc29ydCgpLmpvaW4oJywnKSA9PT0gbW9kaWZpZXJzMi5zb3J0KCkuam9pbignLCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRha2VzIGEga2V5IGV2ZW50IGFuZCBmaWd1cmVzIG91dCB3aGF0IHRoZSBtb2RpZmllcnMgYXJlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9ldmVudE1vZGlmaWVycyhlKSB7XG4gICAgICAgIHZhciBtb2RpZmllcnMgPSBbXTtcblxuICAgICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3NoaWZ0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS5hbHRLZXkpIHtcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdhbHQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKCdjdHJsJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZS5tZXRhS2V5KSB7XG4gICAgICAgICAgICBtb2RpZmllcnMucHVzaCgnbWV0YScpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1vZGlmaWVycztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwcmV2ZW50cyBkZWZhdWx0IGZvciB0aGlzIGV2ZW50XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9wcmV2ZW50RGVmYXVsdChlKSB7XG4gICAgICAgIGlmIChlLnByZXZlbnREZWZhdWx0KSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBlLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc3RvcHMgcHJvcG9nYXRpb24gZm9yIHRoaXMgZXZlbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgZnVuY3Rpb24gX3N0b3BQcm9wYWdhdGlvbihlKSB7XG4gICAgICAgIGlmIChlLnN0b3BQcm9wYWdhdGlvbikge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGUuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBkZXRlcm1pbmVzIGlmIHRoZSBrZXljb2RlIHNwZWNpZmllZCBpcyBhIG1vZGlmaWVyIGtleSBvciBub3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfaXNNb2RpZmllcihrZXkpIHtcbiAgICAgICAgcmV0dXJuIGtleSA9PSAnc2hpZnQnIHx8IGtleSA9PSAnY3RybCcgfHwga2V5ID09ICdhbHQnIHx8IGtleSA9PSAnbWV0YSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV2ZXJzZXMgdGhlIG1hcCBsb29rdXAgc28gdGhhdCB3ZSBjYW4gbG9vayBmb3Igc3BlY2lmaWMga2V5c1xuICAgICAqIHRvIHNlZSB3aGF0IGNhbiBhbmQgY2FuJ3QgdXNlIGtleXByZXNzXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZnVuY3Rpb24gX2dldFJldmVyc2VNYXAoKSB7XG4gICAgICAgIGlmICghX1JFVkVSU0VfTUFQKSB7XG4gICAgICAgICAgICBfUkVWRVJTRV9NQVAgPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBfTUFQKSB7XG5cbiAgICAgICAgICAgICAgICAvLyBwdWxsIG91dCB0aGUgbnVtZXJpYyBrZXlwYWQgZnJvbSBoZXJlIGNhdXNlIGtleXByZXNzIHNob3VsZFxuICAgICAgICAgICAgICAgIC8vIGJlIGFibGUgdG8gZGV0ZWN0IHRoZSBrZXlzIGZyb20gdGhlIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIGlmIChrZXkgPiA5NSAmJiBrZXkgPCAxMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKF9NQVAuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBfUkVWRVJTRV9NQVBbX01BUFtrZXldXSA9IGtleTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9SRVZFUlNFX01BUDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBwaWNrcyB0aGUgYmVzdCBhY3Rpb24gYmFzZWQgb24gdGhlIGtleSBjb21iaW5hdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSAtIGNoYXJhY3RlciBmb3Iga2V5XG4gICAgICogQHBhcmFtIHtBcnJheX0gbW9kaWZpZXJzXG4gICAgICogQHBhcmFtIHtzdHJpbmc9fSBhY3Rpb24gcGFzc2VkIGluXG4gICAgICovXG4gICAgZnVuY3Rpb24gX3BpY2tCZXN0QWN0aW9uKGtleSwgbW9kaWZpZXJzLCBhY3Rpb24pIHtcblxuICAgICAgICAvLyBpZiBubyBhY3Rpb24gd2FzIHBpY2tlZCBpbiB3ZSBzaG91bGQgdHJ5IHRvIHBpY2sgdGhlIG9uZVxuICAgICAgICAvLyB0aGF0IHdlIHRoaW5rIHdvdWxkIHdvcmsgYmVzdCBmb3IgdGhpcyBrZXlcbiAgICAgICAgaWYgKCFhY3Rpb24pIHtcbiAgICAgICAgICAgIGFjdGlvbiA9IF9nZXRSZXZlcnNlTWFwKClba2V5XSA/ICdrZXlkb3duJyA6ICdrZXlwcmVzcyc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtb2RpZmllciBrZXlzIGRvbid0IHdvcmsgYXMgZXhwZWN0ZWQgd2l0aCBrZXlwcmVzcyxcbiAgICAgICAgLy8gc3dpdGNoIHRvIGtleWRvd25cbiAgICAgICAgaWYgKGFjdGlvbiA9PSAna2V5cHJlc3MnICYmIG1vZGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFjdGlvbiA9ICdrZXlkb3duJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhY3Rpb247XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgZnJvbSBhIHN0cmluZyBrZXkgY29tYmluYXRpb24gdG8gYW4gYXJyYXlcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gY29tYmluYXRpb24gbGlrZSBcImNvbW1hbmQrc2hpZnQrbFwiXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gX2tleXNGcm9tU3RyaW5nKGNvbWJpbmF0aW9uKSB7XG4gICAgICAgIGlmIChjb21iaW5hdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgICByZXR1cm4gWycrJ107XG4gICAgICAgIH1cblxuICAgICAgICBjb21iaW5hdGlvbiA9IGNvbWJpbmF0aW9uLnJlcGxhY2UoL1xcK3syfS9nLCAnK3BsdXMnKTtcbiAgICAgICAgcmV0dXJuIGNvbWJpbmF0aW9uLnNwbGl0KCcrJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBpbmZvIGZvciBhIHNwZWNpZmljIGtleSBjb21iaW5hdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBjb21iaW5hdGlvbiBrZXkgY29tYmluYXRpb24gKFwiY29tbWFuZCtzXCIgb3IgXCJhXCIgb3IgXCIqXCIpXG4gICAgICogQHBhcmFtICB7c3RyaW5nPX0gYWN0aW9uXG4gICAgICogQHJldHVybnMge09iamVjdH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBfZ2V0S2V5SW5mbyhjb21iaW5hdGlvbiwgYWN0aW9uKSB7XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIG1vZGlmaWVycyA9IFtdO1xuXG4gICAgICAgIC8vIHRha2UgdGhlIGtleXMgZnJvbSB0aGlzIHBhdHRlcm4gYW5kIGZpZ3VyZSBvdXQgd2hhdCB0aGUgYWN0dWFsXG4gICAgICAgIC8vIHBhdHRlcm4gaXMgYWxsIGFib3V0XG4gICAgICAgIGtleXMgPSBfa2V5c0Zyb21TdHJpbmcoY29tYmluYXRpb24pO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBrZXkgPSBrZXlzW2ldO1xuXG4gICAgICAgICAgICAvLyBub3JtYWxpemUga2V5IG5hbWVzXG4gICAgICAgICAgICBpZiAoX1NQRUNJQUxfQUxJQVNFU1trZXldKSB7XG4gICAgICAgICAgICAgICAga2V5ID0gX1NQRUNJQUxfQUxJQVNFU1trZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIG5vdCBhIGtleXByZXNzIGV2ZW50IHRoZW4gd2Ugc2hvdWxkXG4gICAgICAgICAgICAvLyBiZSBzbWFydCBhYm91dCB1c2luZyBzaGlmdCBrZXlzXG4gICAgICAgICAgICAvLyB0aGlzIHdpbGwgb25seSB3b3JrIGZvciBVUyBrZXlib2FyZHMgaG93ZXZlclxuICAgICAgICAgICAgaWYgKGFjdGlvbiAmJiBhY3Rpb24gIT0gJ2tleXByZXNzJyAmJiBfU0hJRlRfTUFQW2tleV0pIHtcbiAgICAgICAgICAgICAgICBrZXkgPSBfU0hJRlRfTUFQW2tleV07XG4gICAgICAgICAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3NoaWZ0Jyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoaXMga2V5IGlzIGEgbW9kaWZpZXIgdGhlbiBhZGQgaXQgdG8gdGhlIGxpc3Qgb2YgbW9kaWZpZXJzXG4gICAgICAgICAgICBpZiAoX2lzTW9kaWZpZXIoa2V5KSkge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVycy5wdXNoKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZXBlbmRpbmcgb24gd2hhdCB0aGUga2V5IGNvbWJpbmF0aW9uIGlzXG4gICAgICAgIC8vIHdlIHdpbGwgdHJ5IHRvIHBpY2sgdGhlIGJlc3QgZXZlbnQgZm9yIGl0XG4gICAgICAgIGFjdGlvbiA9IF9waWNrQmVzdEFjdGlvbihrZXksIG1vZGlmaWVycywgYWN0aW9uKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICBtb2RpZmllcnM6IG1vZGlmaWVycyxcbiAgICAgICAgICAgIGFjdGlvbjogYWN0aW9uXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2JlbG9uZ3NUbyhlbGVtZW50LCBhbmNlc3Rvcikge1xuICAgICAgICBpZiAoZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSBkb2N1bWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IGFuY2VzdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfYmVsb25nc1RvKGVsZW1lbnQucGFyZW50Tm9kZSwgYW5jZXN0b3IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIE1vdXNldHJhcCh0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICB0YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudCB8fCBkb2N1bWVudDtcblxuICAgICAgICBpZiAoIShzZWxmIGluc3RhbmNlb2YgTW91c2V0cmFwKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBNb3VzZXRyYXAodGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogZWxlbWVudCB0byBhdHRhY2gga2V5IGV2ZW50cyB0b1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7RWxlbWVudH1cbiAgICAgICAgICovXG4gICAgICAgIHNlbGYudGFyZ2V0ID0gdGFyZ2V0RWxlbWVudDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogYSBsaXN0IG9mIGFsbCB0aGUgY2FsbGJhY2tzIHNldHVwIHZpYSBNb3VzZXRyYXAuYmluZCgpXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICBzZWxmLl9jYWxsYmFja3MgPSB7fTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogZGlyZWN0IG1hcCBvZiBzdHJpbmcgY29tYmluYXRpb25zIHRvIGNhbGxiYWNrcyB1c2VkIGZvciB0cmlnZ2VyKClcbiAgICAgICAgICpcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICovXG4gICAgICAgIHNlbGYuX2RpcmVjdE1hcCA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBrZWVwcyB0cmFjayBvZiB3aGF0IGxldmVsIGVhY2ggc2VxdWVuY2UgaXMgYXQgc2luY2UgbXVsdGlwbGVcbiAgICAgICAgICogc2VxdWVuY2VzIGNhbiBzdGFydCBvdXQgd2l0aCB0aGUgc2FtZSBzZXF1ZW5jZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIF9zZXF1ZW5jZUxldmVscyA9IHt9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiB2YXJpYWJsZSB0byBzdG9yZSB0aGUgc2V0VGltZW91dCBjYWxsXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtudWxsfG51bWJlcn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBfcmVzZXRUaW1lcjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogdGVtcG9yYXJ5IHN0YXRlIHdoZXJlIHdlIHdpbGwgaWdub3JlIHRoZSBuZXh0IGtleXVwXG4gICAgICAgICAqXG4gICAgICAgICAqIEB0eXBlIHtib29sZWFufHN0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgIHZhciBfaWdub3JlTmV4dEtleXVwID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIHRlbXBvcmFyeSBzdGF0ZSB3aGVyZSB3ZSB3aWxsIGlnbm9yZSB0aGUgbmV4dCBrZXlwcmVzc1xuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgICAgICovXG4gICAgICAgIHZhciBfaWdub3JlTmV4dEtleXByZXNzID0gZmFsc2U7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGFyZSB3ZSBjdXJyZW50bHkgaW5zaWRlIG9mIGEgc2VxdWVuY2U/XG4gICAgICAgICAqIHR5cGUgb2YgYWN0aW9uIChcImtleXVwXCIgb3IgXCJrZXlkb3duXCIgb3IgXCJrZXlwcmVzc1wiKSBvciBmYWxzZVxuICAgICAgICAgKlxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbnxzdHJpbmd9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgX25leHRFeHBlY3RlZEFjdGlvbiA9IGZhbHNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiByZXNldHMgYWxsIHNlcXVlbmNlIGNvdW50ZXJzIGV4Y2VwdCBmb3IgdGhlIG9uZXMgcGFzc2VkIGluXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBkb05vdFJlc2V0XG4gICAgICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIF9yZXNldFNlcXVlbmNlcyhkb05vdFJlc2V0KSB7XG4gICAgICAgICAgICBkb05vdFJlc2V0ID0gZG9Ob3RSZXNldCB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIGFjdGl2ZVNlcXVlbmNlcyA9IGZhbHNlLFxuICAgICAgICAgICAgICAgIGtleTtcblxuICAgICAgICAgICAgZm9yIChrZXkgaW4gX3NlcXVlbmNlTGV2ZWxzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvTm90UmVzZXRba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVTZXF1ZW5jZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgX3NlcXVlbmNlTGV2ZWxzW2tleV0gPSAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZVNlcXVlbmNlcykge1xuICAgICAgICAgICAgICAgIF9uZXh0RXhwZWN0ZWRBY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBmaW5kcyBhbGwgY2FsbGJhY2tzIHRoYXQgbWF0Y2ggYmFzZWQgb24gdGhlIGtleWNvZGUsIG1vZGlmaWVycyxcbiAgICAgICAgICogYW5kIGFjdGlvblxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gY2hhcmFjdGVyXG4gICAgICAgICAqIEBwYXJhbSB7QXJyYXl9IG1vZGlmaWVyc1xuICAgICAgICAgKiBAcGFyYW0ge0V2ZW50fE9iamVjdH0gZVxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZz19IHNlcXVlbmNlTmFtZSAtIG5hbWUgb2YgdGhlIHNlcXVlbmNlIHdlIGFyZSBsb29raW5nIGZvclxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZz19IGNvbWJpbmF0aW9uXG4gICAgICAgICAqIEBwYXJhbSB7bnVtYmVyPX0gbGV2ZWxcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gX2dldE1hdGNoZXMoY2hhcmFjdGVyLCBtb2RpZmllcnMsIGUsIHNlcXVlbmNlTmFtZSwgY29tYmluYXRpb24sIGxldmVsKSB7XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjaztcbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gW107XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gZS50eXBlO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbm8gZXZlbnRzIHJlbGF0ZWQgdG8gdGhpcyBrZXljb2RlXG4gICAgICAgICAgICBpZiAoIXNlbGYuX2NhbGxiYWNrc1tjaGFyYWN0ZXJdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiBhIG1vZGlmaWVyIGtleSBpcyBjb21pbmcgdXAgb24gaXRzIG93biB3ZSBzaG91bGQgYWxsb3cgaXRcbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT0gJ2tleXVwJyAmJiBfaXNNb2RpZmllcihjaGFyYWN0ZXIpKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZXJzID0gW2NoYXJhY3Rlcl07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCBhbGwgY2FsbGJhY2tzIGZvciB0aGUga2V5IHRoYXQgd2FzIHByZXNzZWRcbiAgICAgICAgICAgIC8vIGFuZCBzZWUgaWYgYW55IG9mIHRoZW0gbWF0Y2hcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzZWxmLl9jYWxsYmFja3NbY2hhcmFjdGVyXS5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gc2VsZi5fY2FsbGJhY2tzW2NoYXJhY3Rlcl1baV07XG5cbiAgICAgICAgICAgICAgICAvLyBpZiBhIHNlcXVlbmNlIG5hbWUgaXMgbm90IHNwZWNpZmllZCwgYnV0IHRoaXMgaXMgYSBzZXF1ZW5jZSBhdFxuICAgICAgICAgICAgICAgIC8vIHRoZSB3cm9uZyBsZXZlbCB0aGVuIG1vdmUgb250byB0aGUgbmV4dCBtYXRjaFxuICAgICAgICAgICAgICAgIGlmICghc2VxdWVuY2VOYW1lICYmIGNhbGxiYWNrLnNlcSAmJiBfc2VxdWVuY2VMZXZlbHNbY2FsbGJhY2suc2VxXSAhPSBjYWxsYmFjay5sZXZlbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgYWN0aW9uIHdlIGFyZSBsb29raW5nIGZvciBkb2Vzbid0IG1hdGNoIHRoZSBhY3Rpb24gd2UgZ290XG4gICAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBzaG91bGQga2VlcCBnb2luZ1xuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24gIT0gY2FsbGJhY2suYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYSBrZXlwcmVzcyBldmVudCBhbmQgdGhlIG1ldGEga2V5IGFuZCBjb250cm9sIGtleVxuICAgICAgICAgICAgICAgIC8vIGFyZSBub3QgcHJlc3NlZCB0aGF0IG1lYW5zIHRoYXQgd2UgbmVlZCB0byBvbmx5IGxvb2sgYXQgdGhlXG4gICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBvdGhlcndpc2UgY2hlY2sgdGhlIG1vZGlmaWVycyBhcyB3ZWxsXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBjaHJvbWUgd2lsbCBub3QgZmlyZSBhIGtleXByZXNzIGlmIG1ldGEgb3IgY29udHJvbCBpcyBkb3duXG4gICAgICAgICAgICAgICAgLy8gc2FmYXJpIHdpbGwgZmlyZSBhIGtleXByZXNzIGlmIG1ldGEgb3IgbWV0YStzaGlmdCBpcyBkb3duXG4gICAgICAgICAgICAgICAgLy8gZmlyZWZveCB3aWxsIGZpcmUgYSBrZXlwcmVzcyBpZiBtZXRhIG9yIGNvbnRyb2wgaXMgZG93blxuICAgICAgICAgICAgICAgIGlmICgoYWN0aW9uID09ICdrZXlwcmVzcycgJiYgIWUubWV0YUtleSAmJiAhZS5jdHJsS2V5KSB8fCBfbW9kaWZpZXJzTWF0Y2gobW9kaWZpZXJzLCBjYWxsYmFjay5tb2RpZmllcnMpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiB5b3UgYmluZCBhIGNvbWJpbmF0aW9uIG9yIHNlcXVlbmNlIGEgc2Vjb25kIHRpbWUgaXRcbiAgICAgICAgICAgICAgICAgICAgLy8gc2hvdWxkIG92ZXJ3cml0ZSB0aGUgZmlyc3Qgb25lLiAgaWYgYSBzZXF1ZW5jZU5hbWUgb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gY29tYmluYXRpb24gaXMgc3BlY2lmaWVkIGluIHRoaXMgY2FsbCBpdCBkb2VzIGp1c3QgdGhhdFxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBAdG9kbyBtYWtlIGRlbGV0aW5nIGl0cyBvd24gbWV0aG9kP1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsZXRlQ29tYm8gPSAhc2VxdWVuY2VOYW1lICYmIGNhbGxiYWNrLmNvbWJvID09IGNvbWJpbmF0aW9uO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsZXRlU2VxdWVuY2UgPSBzZXF1ZW5jZU5hbWUgJiYgY2FsbGJhY2suc2VxID09IHNlcXVlbmNlTmFtZSAmJiBjYWxsYmFjay5sZXZlbCA9PSBsZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlbGV0ZUNvbWJvIHx8IGRlbGV0ZVNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9jYWxsYmFja3NbY2hhcmFjdGVyXS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBtYXRjaGVzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogYWN0dWFsbHkgY2FsbHMgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICAgICAqXG4gICAgICAgICAqIGlmIHlvdXIgY2FsbGJhY2sgZnVuY3Rpb24gcmV0dXJucyBmYWxzZSB0aGlzIHdpbGwgdXNlIHRoZSBqcXVlcnlcbiAgICAgICAgICogY29udmVudGlvbiAtIHByZXZlbnQgZGVmYXVsdCBhbmQgc3RvcCBwcm9wb2dhdGlvbiBvbiB0aGUgZXZlbnRcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBfZmlyZUNhbGxiYWNrKGNhbGxiYWNrLCBlLCBjb21ibywgc2VxdWVuY2UpIHtcblxuICAgICAgICAgICAgLy8gaWYgdGhpcyBldmVudCBzaG91bGQgbm90IGhhcHBlbiBzdG9wIGhlcmVcbiAgICAgICAgICAgIGlmIChzZWxmLnN0b3BDYWxsYmFjayhlLCBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQsIGNvbWJvLCBzZXF1ZW5jZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjayhlLCBjb21ibykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgX3ByZXZlbnREZWZhdWx0KGUpO1xuICAgICAgICAgICAgICAgIF9zdG9wUHJvcGFnYXRpb24oZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogaGFuZGxlcyBhIGNoYXJhY3RlciBrZXkgZXZlbnRcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IGNoYXJhY3RlclxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBtb2RpZmllcnNcbiAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBzZWxmLl9oYW5kbGVLZXkgPSBmdW5jdGlvbihjaGFyYWN0ZXIsIG1vZGlmaWVycywgZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrcyA9IF9nZXRNYXRjaGVzKGNoYXJhY3RlciwgbW9kaWZpZXJzLCBlKTtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGRvTm90UmVzZXQgPSB7fTtcbiAgICAgICAgICAgIHZhciBtYXhMZXZlbCA9IDA7XG4gICAgICAgICAgICB2YXIgcHJvY2Vzc2VkU2VxdWVuY2VDYWxsYmFjayA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIG1heExldmVsIGZvciBzZXF1ZW5jZXMgc28gd2UgY2FuIG9ubHkgZXhlY3V0ZSB0aGUgbG9uZ2VzdCBjYWxsYmFjayBzZXF1ZW5jZVxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3NbaV0uc2VxKSB7XG4gICAgICAgICAgICAgICAgICAgIG1heExldmVsID0gTWF0aC5tYXgobWF4TGV2ZWwsIGNhbGxiYWNrc1tpXS5sZXZlbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggbWF0Y2hpbmcgY2FsbGJhY2tzIGZvciB0aGlzIGtleSBldmVudFxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7ICsraSkge1xuXG4gICAgICAgICAgICAgICAgLy8gZmlyZSBmb3IgYWxsIHNlcXVlbmNlIGNhbGxiYWNrc1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgYmVjYXVzZSBpZiBmb3IgZXhhbXBsZSB5b3UgaGF2ZSBtdWx0aXBsZSBzZXF1ZW5jZXNcbiAgICAgICAgICAgICAgICAvLyBib3VuZCBzdWNoIGFzIFwiZyBpXCIgYW5kIFwiZyB0XCIgdGhleSBib3RoIG5lZWQgdG8gZmlyZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBjYWxsYmFjayBmb3IgbWF0Y2hpbmcgZyBjYXVzZSBvdGhlcndpc2UgeW91IGNhbiBvbmx5IGV2ZXJcbiAgICAgICAgICAgICAgICAvLyBtYXRjaCB0aGUgZmlyc3Qgb25lXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrc1tpXS5zZXEpIHtcblxuICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IGZpcmUgY2FsbGJhY2tzIGZvciB0aGUgbWF4TGV2ZWwgdG8gcHJldmVudFxuICAgICAgICAgICAgICAgICAgICAvLyBzdWJzZXF1ZW5jZXMgZnJvbSBhbHNvIGZpcmluZ1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBmb3IgZXhhbXBsZSAnYSBvcHRpb24gYicgc2hvdWxkIG5vdCBjYXVzZSAnb3B0aW9uIGInIHRvIGZpcmVcbiAgICAgICAgICAgICAgICAgICAgLy8gZXZlbiB0aG91Z2ggJ29wdGlvbiBiJyBpcyBwYXJ0IG9mIHRoZSBvdGhlciBzZXF1ZW5jZVxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyBhbnkgc2VxdWVuY2VzIHRoYXQgZG8gbm90IG1hdGNoIGhlcmUgd2lsbCBiZSBkaXNjYXJkZWRcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVsb3cgYnkgdGhlIF9yZXNldFNlcXVlbmNlcyBjYWxsXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFja3NbaV0ubGV2ZWwgIT0gbWF4TGV2ZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc2VkU2VxdWVuY2VDYWxsYmFjayA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8ga2VlcCBhIGxpc3Qgb2Ygd2hpY2ggc2VxdWVuY2VzIHdlcmUgbWF0Y2hlcyBmb3IgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgZG9Ob3RSZXNldFtjYWxsYmFja3NbaV0uc2VxXSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIF9maXJlQ2FsbGJhY2soY2FsbGJhY2tzW2ldLmNhbGxiYWNrLCBlLCBjYWxsYmFja3NbaV0uY29tYm8sIGNhbGxiYWNrc1tpXS5zZXEpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGVyZSB3ZXJlIG5vIHNlcXVlbmNlIG1hdGNoZXMgYnV0IHdlIGFyZSBzdGlsbCBoZXJlXG4gICAgICAgICAgICAgICAgLy8gdGhhdCBtZWFucyB0aGlzIGlzIGEgcmVndWxhciBtYXRjaCBzbyB3ZSBzaG91bGQgZmlyZSB0aGF0XG4gICAgICAgICAgICAgICAgaWYgKCFwcm9jZXNzZWRTZXF1ZW5jZUNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIF9maXJlQ2FsbGJhY2soY2FsbGJhY2tzW2ldLmNhbGxiYWNrLCBlLCBjYWxsYmFja3NbaV0uY29tYm8pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgdGhlIGtleSB5b3UgcHJlc3NlZCBtYXRjaGVzIHRoZSB0eXBlIG9mIHNlcXVlbmNlIHdpdGhvdXRcbiAgICAgICAgICAgIC8vIGJlaW5nIGEgbW9kaWZpZXIgKGllIFwia2V5dXBcIiBvciBcImtleXByZXNzXCIpIHRoZW4gd2Ugc2hvdWxkXG4gICAgICAgICAgICAvLyByZXNldCBhbGwgc2VxdWVuY2VzIHRoYXQgd2VyZSBub3QgbWF0Y2hlZCBieSB0aGlzIGV2ZW50XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gdGhpcyBpcyBzbywgZm9yIGV4YW1wbGUsIGlmIHlvdSBoYXZlIHRoZSBzZXF1ZW5jZSBcImggYSB0XCIgYW5kIHlvdVxuICAgICAgICAgICAgLy8gdHlwZSBcImggZSBhIHIgdFwiIGl0IGRvZXMgbm90IG1hdGNoLiAgaW4gdGhpcyBjYXNlIHRoZSBcImVcIiB3aWxsXG4gICAgICAgICAgICAvLyBjYXVzZSB0aGUgc2VxdWVuY2UgdG8gcmVzZXRcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBtb2RpZmllciBrZXlzIGFyZSBpZ25vcmVkIGJlY2F1c2UgeW91IGNhbiBoYXZlIGEgc2VxdWVuY2VcbiAgICAgICAgICAgIC8vIHRoYXQgY29udGFpbnMgbW9kaWZpZXJzIHN1Y2ggYXMgXCJlbnRlciBjdHJsK3NwYWNlXCIgYW5kIGluIG1vc3RcbiAgICAgICAgICAgIC8vIGNhc2VzIHRoZSBtb2RpZmllciBrZXkgd2lsbCBiZSBwcmVzc2VkIGJlZm9yZSB0aGUgbmV4dCBrZXlcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBhbHNvIGlmIHlvdSBoYXZlIGEgc2VxdWVuY2Ugc3VjaCBhcyBcImN0cmwrYiBhXCIgdGhlbiBwcmVzc2luZyB0aGVcbiAgICAgICAgICAgIC8vIFwiYlwiIGtleSB3aWxsIHRyaWdnZXIgYSBcImtleXByZXNzXCIgYW5kIGEgXCJrZXlkb3duXCJcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyB0aGUgXCJrZXlkb3duXCIgaXMgZXhwZWN0ZWQgd2hlbiB0aGVyZSBpcyBhIG1vZGlmaWVyLCBidXQgdGhlXG4gICAgICAgICAgICAvLyBcImtleXByZXNzXCIgZW5kcyB1cCBtYXRjaGluZyB0aGUgX25leHRFeHBlY3RlZEFjdGlvbiBzaW5jZSBpdCBvY2N1cnNcbiAgICAgICAgICAgIC8vIGFmdGVyIGFuZCB0aGF0IGNhdXNlcyB0aGUgc2VxdWVuY2UgdG8gcmVzZXRcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyB3ZSBpZ25vcmUga2V5cHJlc3NlcyBpbiBhIHNlcXVlbmNlIHRoYXQgZGlyZWN0bHkgZm9sbG93IGEga2V5ZG93blxuICAgICAgICAgICAgLy8gZm9yIHRoZSBzYW1lIGNoYXJhY3RlclxuICAgICAgICAgICAgdmFyIGlnbm9yZVRoaXNLZXlwcmVzcyA9IGUudHlwZSA9PSAna2V5cHJlc3MnICYmIF9pZ25vcmVOZXh0S2V5cHJlc3M7XG4gICAgICAgICAgICBpZiAoZS50eXBlID09IF9uZXh0RXhwZWN0ZWRBY3Rpb24gJiYgIV9pc01vZGlmaWVyKGNoYXJhY3RlcikgJiYgIWlnbm9yZVRoaXNLZXlwcmVzcykge1xuICAgICAgICAgICAgICAgIF9yZXNldFNlcXVlbmNlcyhkb05vdFJlc2V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgX2lnbm9yZU5leHRLZXlwcmVzcyA9IHByb2Nlc3NlZFNlcXVlbmNlQ2FsbGJhY2sgJiYgZS50eXBlID09ICdrZXlkb3duJztcbiAgICAgICAgfTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaGFuZGxlcyBhIGtleWRvd24gZXZlbnRcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtFdmVudH0gZVxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBfaGFuZGxlS2V5RXZlbnQoZSkge1xuXG4gICAgICAgICAgICAvLyBub3JtYWxpemUgZS53aGljaCBmb3Iga2V5IGV2ZW50c1xuICAgICAgICAgICAgLy8gQHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQyODU2MjcvamF2YXNjcmlwdC1rZXljb2RlLXZzLWNoYXJjb2RlLXV0dGVyLWNvbmZ1c2lvblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlLndoaWNoICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGUud2hpY2ggPSBlLmtleUNvZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBjaGFyYWN0ZXIgPSBfY2hhcmFjdGVyRnJvbUV2ZW50KGUpO1xuXG4gICAgICAgICAgICAvLyBubyBjaGFyYWN0ZXIgZm91bmQgdGhlbiBzdG9wXG4gICAgICAgICAgICBpZiAoIWNoYXJhY3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbmVlZCB0byB1c2UgPT09IGZvciB0aGUgY2hhcmFjdGVyIGNoZWNrIGJlY2F1c2UgdGhlIGNoYXJhY3RlciBjYW4gYmUgMFxuICAgICAgICAgICAgaWYgKGUudHlwZSA9PSAna2V5dXAnICYmIF9pZ25vcmVOZXh0S2V5dXAgPT09IGNoYXJhY3Rlcikge1xuICAgICAgICAgICAgICAgIF9pZ25vcmVOZXh0S2V5dXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuaGFuZGxlS2V5KGNoYXJhY3RlciwgX2V2ZW50TW9kaWZpZXJzKGUpLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBjYWxsZWQgdG8gc2V0IGEgMSBzZWNvbmQgdGltZW91dCBvbiB0aGUgc3BlY2lmaWVkIHNlcXVlbmNlXG4gICAgICAgICAqXG4gICAgICAgICAqIHRoaXMgaXMgc28gYWZ0ZXIgZWFjaCBrZXkgcHJlc3MgaW4gdGhlIHNlcXVlbmNlIHlvdSBoYXZlIDEgc2Vjb25kXG4gICAgICAgICAqIHRvIHByZXNzIHRoZSBuZXh0IGtleSBiZWZvcmUgeW91IGhhdmUgdG8gc3RhcnQgb3ZlclxuICAgICAgICAgKlxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBfcmVzZXRTZXF1ZW5jZVRpbWVyKCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KF9yZXNldFRpbWVyKTtcbiAgICAgICAgICAgIF9yZXNldFRpbWVyID0gc2V0VGltZW91dChfcmVzZXRTZXF1ZW5jZXMsIDEwMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGJpbmRzIGEga2V5IHNlcXVlbmNlIHRvIGFuIGV2ZW50XG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21ibyAtIGNvbWJvIHNwZWNpZmllZCBpbiBiaW5kIGNhbGxcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0ga2V5c1xuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZz19IGFjdGlvblxuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBfYmluZFNlcXVlbmNlKGNvbWJvLCBrZXlzLCBjYWxsYmFjaywgYWN0aW9uKSB7XG5cbiAgICAgICAgICAgIC8vIHN0YXJ0IG9mZiBieSBhZGRpbmcgYSBzZXF1ZW5jZSBsZXZlbCByZWNvcmQgZm9yIHRoaXMgY29tYmluYXRpb25cbiAgICAgICAgICAgIC8vIGFuZCBzZXR0aW5nIHRoZSBsZXZlbCB0byAwXG4gICAgICAgICAgICBfc2VxdWVuY2VMZXZlbHNbY29tYm9dID0gMDtcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBjYWxsYmFjayB0byBpbmNyZWFzZSB0aGUgc2VxdWVuY2UgbGV2ZWwgZm9yIHRoaXMgc2VxdWVuY2UgYW5kIHJlc2V0XG4gICAgICAgICAgICAgKiBhbGwgb3RoZXIgc2VxdWVuY2VzIHRoYXQgd2VyZSBhY3RpdmVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV4dEFjdGlvblxuICAgICAgICAgICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBfaW5jcmVhc2VTZXF1ZW5jZShuZXh0QWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBfbmV4dEV4cGVjdGVkQWN0aW9uID0gbmV4dEFjdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgKytfc2VxdWVuY2VMZXZlbHNbY29tYm9dO1xuICAgICAgICAgICAgICAgICAgICBfcmVzZXRTZXF1ZW5jZVRpbWVyKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB3cmFwcyB0aGUgc3BlY2lmaWVkIGNhbGxiYWNrIGluc2lkZSBvZiBhbm90aGVyIGZ1bmN0aW9uIGluIG9yZGVyXG4gICAgICAgICAgICAgKiB0byByZXNldCBhbGwgc2VxdWVuY2UgY291bnRlcnMgYXMgc29vbiBhcyB0aGlzIHNlcXVlbmNlIGlzIGRvbmVcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0V2ZW50fSBlXG4gICAgICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGZ1bmN0aW9uIF9jYWxsYmFja0FuZFJlc2V0KGUpIHtcbiAgICAgICAgICAgICAgICBfZmlyZUNhbGxiYWNrKGNhbGxiYWNrLCBlLCBjb21ibyk7XG5cbiAgICAgICAgICAgICAgICAvLyB3ZSBzaG91bGQgaWdub3JlIHRoZSBuZXh0IGtleSB1cCBpZiB0aGUgYWN0aW9uIGlzIGtleSBkb3duXG4gICAgICAgICAgICAgICAgLy8gb3Iga2V5cHJlc3MuICB0aGlzIGlzIHNvIGlmIHlvdSBmaW5pc2ggYSBzZXF1ZW5jZSBhbmRcbiAgICAgICAgICAgICAgICAvLyByZWxlYXNlIHRoZSBrZXkgdGhlIGZpbmFsIGtleSB3aWxsIG5vdCB0cmlnZ2VyIGEga2V5dXBcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uICE9PSAna2V5dXAnKSB7XG4gICAgICAgICAgICAgICAgICAgIF9pZ25vcmVOZXh0S2V5dXAgPSBfY2hhcmFjdGVyRnJvbUV2ZW50KGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHdlaXJkIHJhY2UgY29uZGl0aW9uIGlmIGEgc2VxdWVuY2UgZW5kcyB3aXRoIHRoZSBrZXlcbiAgICAgICAgICAgICAgICAvLyBhbm90aGVyIHNlcXVlbmNlIGJlZ2lucyB3aXRoXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChfcmVzZXRTZXF1ZW5jZXMsIDEwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbG9vcCB0aHJvdWdoIGtleXMgb25lIGF0IGEgdGltZSBhbmQgYmluZCB0aGUgYXBwcm9wcmlhdGUgY2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGZ1bmN0aW9uLiAgZm9yIGFueSBrZXkgbGVhZGluZyB1cCB0byB0aGUgZmluYWwgb25lIGl0IHNob3VsZFxuICAgICAgICAgICAgLy8gaW5jcmVhc2UgdGhlIHNlcXVlbmNlLiBhZnRlciB0aGUgZmluYWwsIGl0IHNob3VsZCByZXNldCBhbGwgc2VxdWVuY2VzXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gaWYgYW4gYWN0aW9uIGlzIHNwZWNpZmllZCBpbiB0aGUgb3JpZ2luYWwgYmluZCBjYWxsIHRoZW4gdGhhdCB3aWxsXG4gICAgICAgICAgICAvLyBiZSB1c2VkIHRocm91Z2hvdXQuICBvdGhlcndpc2Ugd2Ugd2lsbCBwYXNzIHRoZSBhY3Rpb24gdGhhdCB0aGVcbiAgICAgICAgICAgIC8vIG5leHQga2V5IGluIHRoZSBzZXF1ZW5jZSBzaG91bGQgbWF0Y2guICB0aGlzIGFsbG93cyBhIHNlcXVlbmNlXG4gICAgICAgICAgICAvLyB0byBtaXggYW5kIG1hdGNoIGtleXByZXNzIGFuZCBrZXlkb3duIGV2ZW50cyBkZXBlbmRpbmcgb24gd2hpY2hcbiAgICAgICAgICAgIC8vIG9uZXMgYXJlIGJldHRlciBzdWl0ZWQgdG8gdGhlIGtleSBwcm92aWRlZFxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzRmluYWwgPSBpICsgMSA9PT0ga2V5cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIHdyYXBwZWRDYWxsYmFjayA9IGlzRmluYWwgPyBfY2FsbGJhY2tBbmRSZXNldCA6IF9pbmNyZWFzZVNlcXVlbmNlKGFjdGlvbiB8fCBfZ2V0S2V5SW5mbyhrZXlzW2kgKyAxXSkuYWN0aW9uKTtcbiAgICAgICAgICAgICAgICBfYmluZFNpbmdsZShrZXlzW2ldLCB3cmFwcGVkQ2FsbGJhY2ssIGFjdGlvbiwgY29tYm8sIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGJpbmRzIGEgc2luZ2xlIGtleWJvYXJkIGNvbWJpbmF0aW9uXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjb21iaW5hdGlvblxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZz19IGFjdGlvblxuICAgICAgICAgKiBAcGFyYW0ge3N0cmluZz19IHNlcXVlbmNlTmFtZSAtIG5hbWUgb2Ygc2VxdWVuY2UgaWYgcGFydCBvZiBzZXF1ZW5jZVxuICAgICAgICAgKiBAcGFyYW0ge251bWJlcj19IGxldmVsIC0gd2hhdCBwYXJ0IG9mIHRoZSBzZXF1ZW5jZSB0aGUgY29tbWFuZCBpc1xuICAgICAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBfYmluZFNpbmdsZShjb21iaW5hdGlvbiwgY2FsbGJhY2ssIGFjdGlvbiwgc2VxdWVuY2VOYW1lLCBsZXZlbCkge1xuXG4gICAgICAgICAgICAvLyBzdG9yZSBhIGRpcmVjdCBtYXBwZWQgcmVmZXJlbmNlIGZvciB1c2Ugd2l0aCBNb3VzZXRyYXAudHJpZ2dlclxuICAgICAgICAgICAgc2VsZi5fZGlyZWN0TWFwW2NvbWJpbmF0aW9uICsgJzonICsgYWN0aW9uXSA9IGNhbGxiYWNrO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgbXVsdGlwbGUgc3BhY2VzIGluIGEgcm93IGJlY29tZSBhIHNpbmdsZSBzcGFjZVxuICAgICAgICAgICAgY29tYmluYXRpb24gPSBjb21iaW5hdGlvbi5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cbiAgICAgICAgICAgIHZhciBzZXF1ZW5jZSA9IGNvbWJpbmF0aW9uLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICB2YXIgaW5mbztcblxuICAgICAgICAgICAgLy8gaWYgdGhpcyBwYXR0ZXJuIGlzIGEgc2VxdWVuY2Ugb2Yga2V5cyB0aGVuIHJ1biB0aHJvdWdoIHRoaXMgbWV0aG9kXG4gICAgICAgICAgICAvLyB0byByZXByb2Nlc3MgZWFjaCBwYXR0ZXJuIG9uZSBrZXkgYXQgYSB0aW1lXG4gICAgICAgICAgICBpZiAoc2VxdWVuY2UubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIF9iaW5kU2VxdWVuY2UoY29tYmluYXRpb24sIHNlcXVlbmNlLCBjYWxsYmFjaywgYWN0aW9uKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluZm8gPSBfZ2V0S2V5SW5mbyhjb21iaW5hdGlvbiwgYWN0aW9uKTtcblxuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRvIGluaXRpYWxpemUgYXJyYXkgaWYgdGhpcyBpcyB0aGUgZmlyc3QgdGltZVxuICAgICAgICAgICAgLy8gYSBjYWxsYmFjayBpcyBhZGRlZCBmb3IgdGhpcyBrZXlcbiAgICAgICAgICAgIHNlbGYuX2NhbGxiYWNrc1tpbmZvLmtleV0gPSBzZWxmLl9jYWxsYmFja3NbaW5mby5rZXldIHx8IFtdO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgYW4gZXhpc3RpbmcgbWF0Y2ggaWYgdGhlcmUgaXMgb25lXG4gICAgICAgICAgICBfZ2V0TWF0Y2hlcyhpbmZvLmtleSwgaW5mby5tb2RpZmllcnMsIHt0eXBlOiBpbmZvLmFjdGlvbn0sIHNlcXVlbmNlTmFtZSwgY29tYmluYXRpb24sIGxldmVsKTtcblxuICAgICAgICAgICAgLy8gYWRkIHRoaXMgY2FsbCBiYWNrIHRvIHRoZSBhcnJheVxuICAgICAgICAgICAgLy8gaWYgaXQgaXMgYSBzZXF1ZW5jZSBwdXQgaXQgYXQgdGhlIGJlZ2lubmluZ1xuICAgICAgICAgICAgLy8gaWYgbm90IHB1dCBpdCBhdCB0aGUgZW5kXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gdGhpcyBpcyBpbXBvcnRhbnQgYmVjYXVzZSB0aGUgd2F5IHRoZXNlIGFyZSBwcm9jZXNzZWQgZXhwZWN0c1xuICAgICAgICAgICAgLy8gdGhlIHNlcXVlbmNlIG9uZXMgdG8gY29tZSBmaXJzdFxuICAgICAgICAgICAgc2VsZi5fY2FsbGJhY2tzW2luZm8ua2V5XVtzZXF1ZW5jZU5hbWUgPyAndW5zaGlmdCcgOiAncHVzaCddKHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgbW9kaWZpZXJzOiBpbmZvLm1vZGlmaWVycyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IGluZm8uYWN0aW9uLFxuICAgICAgICAgICAgICAgIHNlcTogc2VxdWVuY2VOYW1lLFxuICAgICAgICAgICAgICAgIGxldmVsOiBsZXZlbCxcbiAgICAgICAgICAgICAgICBjb21ibzogY29tYmluYXRpb25cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGJpbmRzIG11bHRpcGxlIGNvbWJpbmF0aW9ucyB0byB0aGUgc2FtZSBjYWxsYmFja1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBjb21iaW5hdGlvbnNcbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgICAgICogQHBhcmFtIHtzdHJpbmd8dW5kZWZpbmVkfSBhY3Rpb25cbiAgICAgICAgICogQHJldHVybnMgdm9pZFxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZi5fYmluZE11bHRpcGxlID0gZnVuY3Rpb24oY29tYmluYXRpb25zLCBjYWxsYmFjaywgYWN0aW9uKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbWJpbmF0aW9ucy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIF9iaW5kU2luZ2xlKGNvbWJpbmF0aW9uc1tpXSwgY2FsbGJhY2ssIGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3RhcnQhXG4gICAgICAgIF9hZGRFdmVudCh0YXJnZXRFbGVtZW50LCAna2V5cHJlc3MnLCBfaGFuZGxlS2V5RXZlbnQpO1xuICAgICAgICBfYWRkRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleWRvd24nLCBfaGFuZGxlS2V5RXZlbnQpO1xuICAgICAgICBfYWRkRXZlbnQodGFyZ2V0RWxlbWVudCwgJ2tleXVwJywgX2hhbmRsZUtleUV2ZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBiaW5kcyBhbiBldmVudCB0byBtb3VzZXRyYXBcbiAgICAgKlxuICAgICAqIGNhbiBiZSBhIHNpbmdsZSBrZXksIGEgY29tYmluYXRpb24gb2Yga2V5cyBzZXBhcmF0ZWQgd2l0aCArLFxuICAgICAqIGFuIGFycmF5IG9mIGtleXMsIG9yIGEgc2VxdWVuY2Ugb2Yga2V5cyBzZXBhcmF0ZWQgYnkgc3BhY2VzXG4gICAgICpcbiAgICAgKiBiZSBzdXJlIHRvIGxpc3QgdGhlIG1vZGlmaWVyIGtleXMgZmlyc3QgdG8gbWFrZSBzdXJlIHRoYXQgdGhlXG4gICAgICogY29ycmVjdCBrZXkgZW5kcyB1cCBnZXR0aW5nIGJvdW5kICh0aGUgbGFzdCBrZXkgaW4gdGhlIHBhdHRlcm4pXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xBcnJheX0ga2V5c1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHBhcmFtIHtzdHJpbmc9fSBhY3Rpb24gLSAna2V5cHJlc3MnLCAna2V5ZG93bicsIG9yICdrZXl1cCdcbiAgICAgKiBAcmV0dXJucyB2b2lkXG4gICAgICovXG4gICAgTW91c2V0cmFwLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24oa2V5cywgY2FsbGJhY2ssIGFjdGlvbikge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGtleXMgPSBrZXlzIGluc3RhbmNlb2YgQXJyYXkgPyBrZXlzIDogW2tleXNdO1xuICAgICAgICBzZWxmLl9iaW5kTXVsdGlwbGUuY2FsbChzZWxmLCBrZXlzLCBjYWxsYmFjaywgYWN0aW9uKTtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHVuYmluZHMgYW4gZXZlbnQgdG8gbW91c2V0cmFwXG4gICAgICpcbiAgICAgKiB0aGUgdW5iaW5kaW5nIHNldHMgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIG9mIHRoZSBzcGVjaWZpZWQga2V5IGNvbWJvXG4gICAgICogdG8gYW4gZW1wdHkgZnVuY3Rpb24gYW5kIGRlbGV0ZXMgdGhlIGNvcnJlc3BvbmRpbmcga2V5IGluIHRoZVxuICAgICAqIF9kaXJlY3RNYXAgZGljdC5cbiAgICAgKlxuICAgICAqIFRPRE86IGFjdHVhbGx5IHJlbW92ZSB0aGlzIGZyb20gdGhlIF9jYWxsYmFja3MgZGljdGlvbmFyeSBpbnN0ZWFkXG4gICAgICogb2YgYmluZGluZyBhbiBlbXB0eSBmdW5jdGlvblxuICAgICAqXG4gICAgICogdGhlIGtleWNvbWJvK2FjdGlvbiBoYXMgdG8gYmUgZXhhY3RseSB0aGUgc2FtZSBhc1xuICAgICAqIGl0IHdhcyBkZWZpbmVkIGluIHRoZSBiaW5kIG1ldGhvZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8QXJyYXl9IGtleXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWN0aW9uXG4gICAgICogQHJldHVybnMgdm9pZFxuICAgICAqL1xuICAgIE1vdXNldHJhcC5wcm90b3R5cGUudW5iaW5kID0gZnVuY3Rpb24oa2V5cywgYWN0aW9uKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHNlbGYuYmluZC5jYWxsKHNlbGYsIGtleXMsIGZ1bmN0aW9uKCkge30sIGFjdGlvbik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIHRyaWdnZXJzIGFuIGV2ZW50IHRoYXQgaGFzIGFscmVhZHkgYmVlbiBib3VuZFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZz19IGFjdGlvblxuICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgKi9cbiAgICBNb3VzZXRyYXAucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihrZXlzLCBhY3Rpb24pIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5fZGlyZWN0TWFwW2tleXMgKyAnOicgKyBhY3Rpb25dKSB7XG4gICAgICAgICAgICBzZWxmLl9kaXJlY3RNYXBba2V5cyArICc6JyArIGFjdGlvbl0oe30sIGtleXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiByZXNldHMgdGhlIGxpYnJhcnkgYmFjayB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gIHRoaXMgaXMgdXNlZnVsXG4gICAgICogaWYgeW91IHdhbnQgdG8gY2xlYXIgb3V0IHRoZSBjdXJyZW50IGtleWJvYXJkIHNob3J0Y3V0cyBhbmQgYmluZFxuICAgICAqIG5ldyBvbmVzIC0gZm9yIGV4YW1wbGUgaWYgeW91IHN3aXRjaCB0byBhbm90aGVyIHBhZ2VcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHZvaWRcbiAgICAgKi9cbiAgICBNb3VzZXRyYXAucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5fY2FsbGJhY2tzID0ge307XG4gICAgICAgIHNlbGYuX2RpcmVjdE1hcCA9IHt9O1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogc2hvdWxkIHdlIHN0b3AgdGhpcyBldmVudCBiZWZvcmUgZmlyaW5nIG9mZiBjYWxsYmFja3NcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXZlbnR9IGVcbiAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxuICAgICAqL1xuICAgIE1vdXNldHJhcC5wcm90b3R5cGUuc3RvcENhbGxiYWNrID0gZnVuY3Rpb24oZSwgZWxlbWVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgLy8gaWYgdGhlIGVsZW1lbnQgaGFzIHRoZSBjbGFzcyBcIm1vdXNldHJhcFwiIHRoZW4gbm8gbmVlZCB0byBzdG9wXG4gICAgICAgIGlmICgoJyAnICsgZWxlbWVudC5jbGFzc05hbWUgKyAnICcpLmluZGV4T2YoJyBtb3VzZXRyYXAgJykgPiAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF9iZWxvbmdzVG8oZWxlbWVudCwgc2VsZi50YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdG9wIGZvciBpbnB1dCwgc2VsZWN0LCBhbmQgdGV4dGFyZWFcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQudGFnTmFtZSA9PSAnSU5QVVQnIHx8IGVsZW1lbnQudGFnTmFtZSA9PSAnU0VMRUNUJyB8fCBlbGVtZW50LnRhZ05hbWUgPT0gJ1RFWFRBUkVBJyB8fCBlbGVtZW50LmlzQ29udGVudEVkaXRhYmxlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBleHBvc2VzIF9oYW5kbGVLZXkgcHVibGljbHkgc28gaXQgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IGV4dGVuc2lvbnNcbiAgICAgKi9cbiAgICBNb3VzZXRyYXAucHJvdG90eXBlLmhhbmRsZUtleSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHJldHVybiBzZWxmLl9oYW5kbGVLZXkuYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5pdCB0aGUgZ2xvYmFsIG1vdXNldHJhcCBmdW5jdGlvbnNcbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIG5lZWRlZCB0byBhbGxvdyB0aGUgZ2xvYmFsIG1vdXNldHJhcCBmdW5jdGlvbnMgdG8gd29ya1xuICAgICAqIG5vdyB0aGF0IG1vdXNldHJhcCBpcyBhIGNvbnN0cnVjdG9yIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIE1vdXNldHJhcC5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkb2N1bWVudE1vdXNldHJhcCA9IE1vdXNldHJhcChkb2N1bWVudCk7XG4gICAgICAgIGZvciAodmFyIG1ldGhvZCBpbiBkb2N1bWVudE1vdXNldHJhcCkge1xuICAgICAgICAgICAgaWYgKG1ldGhvZC5jaGFyQXQoMCkgIT09ICdfJykge1xuICAgICAgICAgICAgICAgIE1vdXNldHJhcFttZXRob2RdID0gKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnRNb3VzZXRyYXBbbWV0aG9kXS5hcHBseShkb2N1bWVudE1vdXNldHJhcCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IChtZXRob2QpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBNb3VzZXRyYXAuaW5pdCgpO1xuXG4gICAgLy8gZXhwb3NlIG1vdXNldHJhcCB0byB0aGUgZ2xvYmFsIG9iamVjdFxuICAgIHdpbmRvdy5Nb3VzZXRyYXAgPSBNb3VzZXRyYXA7XG5cbiAgICAvLyBleHBvc2UgYXMgYSBjb21tb24ganMgbW9kdWxlXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gTW91c2V0cmFwO1xuICAgIH1cblxuICAgIC8vIGV4cG9zZSBtb3VzZXRyYXAgYXMgYW4gQU1EIG1vZHVsZVxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIE1vdXNldHJhcDtcbiAgICAgICAgfSk7XG4gICAgfVxufSkgKHdpbmRvdywgZG9jdW1lbnQpO1xuIiwiaW1wb3J0IE1pZGRsZW1hbiAgICAgIGZyb20gJy4vaGVscGVycy9NaWRkbGVtYW4nO1xuaW1wb3J0IFN5bWJvbHMgICAgICAgIGZyb20gJy4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBCb3VuZGluZ0JveCAgICBmcm9tICcuL2hlbHBlcnMvQm91bmRpbmdCb3gnO1xuaW1wb3J0IHtvYmplY3RBc3NpZ259IGZyb20gJy4vaGVscGVycy9Qb2x5ZmlsbHMnO1xuaW1wb3J0IGludm9jYXRvciAgICAgIGZyb20gJy4vaGVscGVycy9JbnZvY2F0b3InO1xuaW1wb3J0IG1hcHBlciAgICAgICAgIGZyb20gJy4vaGVscGVycy9NYXBwZXInO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmNsYXNzIERyYWZ0IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG4gICAgICogQHJldHVybiB7RHJhZnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLlNIQVBFU10gICAgICAgPSBbXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk9QVElPTlNdICAgICAgPSAoT2JqZWN0LmFzc2lnbiB8fCBvYmplY3RBc3NpZ24pKHRoaXMub3B0aW9ucygpLCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QgbWlkZGxlbWFuICAgICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSAgICA9IG5ldyBNaWRkbGVtYW4odGhpcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdID0gbmV3IEJvdW5kaW5nQm94KG1pZGRsZW1hbik7XG5cbiAgICAgICAgLy8gUmVuZGVyIHRoZSBTVkcgY29tcG9uZW50IHVzaW5nIHRoZSBkZWZpbmVkIG9wdGlvbnMuXG4gICAgICAgIGNvbnN0IHdpZHRoICA9IHRoaXNbU3ltYm9scy5PUFRJT05TXS5kb2N1bWVudFdpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzW1N5bWJvbHMuT1BUSU9OU10uZG9jdW1lbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHN2ZyAgICA9IHRoaXNbU3ltYm9scy5TVkddID0gZDMuc2VsZWN0KGVsZW1lbnQpLmF0dHIoJ3dpZHRoJywgd2lkdGgpLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgICAgY29uc3Qgc3RvcFByb3BhZ2F0aW9uID0gKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5MQVlFUlNdICA9IHtcbiAgICAgICAgICAgIHNoYXBlczogICAgICBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnc2hhcGVzJykub24oJ2NsaWNrJywgc3RvcFByb3BhZ2F0aW9uKSxcbiAgICAgICAgICAgIGJvdW5kaW5nQm94OiBzdmcuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAnYm91bmRpbmcnKS5vbignY2xpY2snLCBzdG9wUHJvcGFnYXRpb24pLFxuICAgICAgICAgICAgcmVzaXplOiAgICAgIHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdyZXNpemUnKS5vbignY2xpY2snLCBzdG9wUHJvcGFnYXRpb24pXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRGVzZWxlY3QgYWxsIHNoYXBlcyB3aGVuIHRoZSBjYW52YXMgaXMgY2xpY2tlZC5cbiAgICAgICAgc3ZnLm9uKCdjbGljaycsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKCFtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhZGRcbiAgICAgKiBAcGFyYW0ge1NoYXBlfFN0cmluZ30gc2hhcGVcbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBhZGQoc2hhcGUpIHtcblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBzaGFwZSBuYW1lIHRvIHRoZSBzaGFwZSBvYmplY3QsIGlmIHRoZSB1c2VyIGhhcyBwYXNzZWQgdGhlIHNoYXBlXG4gICAgICAgIC8vIGFzIGEgc3RyaW5nLlxuICAgICAgICBzaGFwZSA9ICh0eXBlb2Ygc2hhcGUgPT09ICdzdHJpbmcnKSA/IG1hcHBlcihzaGFwZSkgOiBzaGFwZTtcblxuICAgICAgICBjb25zdCBzaGFwZXMgPSB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICAgICAgc2hhcGVzLnB1c2goc2hhcGUpO1xuXG4gICAgICAgIC8vIFB1dCB0aGUgaW50ZXJmYWNlIGZvciBpbnRlcmFjdGluZyB3aXRoIERyYWZ0IGludG8gdGhlIHNoYXBlIG9iamVjdC5cbiAgICAgICAgc2hhcGVbU3ltYm9scy5NSURETEVNQU5dID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGludm9jYXRvci5kaWQoJ2FkZCcsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGU7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHJlbW92ZShzaGFwZSkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlcyA9IHRoaXNbU3ltYm9scy5TSEFQRVNdO1xuICAgICAgICBjb25zdCBpbmRleCAgPSBzaGFwZXMuaW5kZXhPZihzaGFwZSk7XG5cbiAgICAgICAgc2hhcGVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlKTtcblxuICAgICAgICByZXR1cm4gc2hhcGVzLmxlbmd0aDtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgY2xlYXJcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9XG4gICAgICovXG4gICAgY2xlYXIoKSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGVzID0gdGhpc1tTeW1ib2xzLlNIQVBFU107XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3JlbW92ZScsIHNoYXBlcyk7XG4gICAgICAgIHNoYXBlcy5sZW5ndGggPSAwO1xuXG4gICAgICAgIHJldHVybiBzaGFwZXMubGVuZ3RoO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhbGxcbiAgICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICAgKi9cbiAgICBhbGwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuU0hBUEVTXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtzaGFwZXM9dGhpcy5hbGwoKV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdChzaGFwZXMgPSB0aGlzLmFsbCgpKSB7XG4gICAgICAgIGludm9jYXRvci5kaWQoJ3NlbGVjdCcsIHNoYXBlcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdLmRyYXdCb3VuZGluZ0JveCh0aGlzLnNlbGVjdGVkKCksIHRoaXNbU3ltYm9scy5MQVlFUlNdLmJvdW5kaW5nQm94KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlc2VsZWN0XG4gICAgICogQHBhcmFtIHtBcnJheX0gW3NoYXBlcz10aGlzLmFsbCgpXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGVzZWxlY3Qoc2hhcGVzID0gdGhpcy5hbGwoKSkge1xuICAgICAgICBpbnZvY2F0b3IuZGlkKCdkZXNlbGVjdCcsIHNoYXBlcyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5CT1VORElOR19CT1hdLmRyYXdCb3VuZGluZ0JveCh0aGlzLnNlbGVjdGVkKCksIHRoaXNbU3ltYm9scy5MQVlFUlNdLmJvdW5kaW5nQm94KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNlbGVjdGVkXG4gICAgICogQHJldHVybiB7QXJyYXl9XG4gICAgICovXG4gICAgc2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHNoYXBlLmlzU2VsZWN0ZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBvcHRpb25zXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIG9wdGlvbnMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5PUFRJT05TXSB8fCB7XG4gICAgICAgICAgICBkb2N1bWVudEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgZG9jdW1lbnRXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgZ3JpZFNpemU6IDEwLFxuICAgICAgICAgICAgaGFuZGxlUmFkaXVzOiAyMixcbiAgICAgICAgICAgIGRlZmF1bHRNb3ZlU3RlcDogMSxcbiAgICAgICAgICAgIHNoaWZ0TW92ZVN0ZXA6IDEwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn1cblxuKCgkd2luZG93KSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICgkd2luZG93KSB7XG5cbiAgICAgICAgLy8gRXhwb3J0IGRyYWZ0IGlmIHRoZSBgd2luZG93YCBvYmplY3QgaXMgYXZhaWxhYmxlLlxuICAgICAgICAkd2luZG93LkRyYWZ0ID0gRHJhZnQ7XG5cbiAgICB9XG5cbn0pKHdpbmRvdyk7XG5cbi8vIEV4cG9ydCBmb3IgdXNlIGluIEVTNiBhcHBsaWNhdGlvbnMuXG5leHBvcnQgZGVmYXVsdCBEcmFmdDsiLCJpbXBvcnQgU3ltYm9scyBmcm9tICcuLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWJpbGl0eSB7XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHNoYXBlXG4gICAgICogQHJldHVybiB7QWJpbGl0eX1cbiAgICAgKi9cbiAgICBzaGFwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5TSEFQRV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtNaWRkbGVtYW59XG4gICAgICovXG4gICAgbWlkZGxlbWFuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgUmVzaXphYmxlXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNpemFibGUgZXh0ZW5kcyBBYmlsaXR5IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEByZXR1cm4ge1Jlc2l6YWJsZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5lZGdlcyAgPSB7fTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZFNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkU2VsZWN0KCkge1xuICAgICAgICB0aGlzLlJBRElVUyA9IHRoaXMubWlkZGxlbWFuKCkub3B0aW9ucygpLmhhbmRsZVJhZGl1cztcbiAgICAgICAgdGhpcy5yZWF0dGFjaEhhbmRsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZERlc2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWREZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCByZWF0dGFjaEhhbmRsZXNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHJlYXR0YWNoSGFuZGxlcygpIHtcbiAgICAgICAgdGhpcy5kZXRhY2hIYW5kbGVzKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0YWNoSGFuZGxlc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgYXR0YWNoSGFuZGxlcygpIHtcblxuICAgICAgICBjb25zdCBzaGFwZSAgPSB0aGlzLnNoYXBlKCk7XG4gICAgICAgIGNvbnN0IGxheWVyICA9IHRoaXMubWlkZGxlbWFuKCkubGF5ZXJzKCkucmVzaXplO1xuICAgICAgICB0aGlzLmxheWVyICAgPSBsYXllci5hcHBlbmQoJ2cnKTtcblxuICAgICAgICBjb25zdCB4ICAgICAgPSBzaGFwZS5hdHRyKCd4Jyk7XG4gICAgICAgIGNvbnN0IHkgICAgICA9IHNoYXBlLmF0dHIoJ3knKTtcbiAgICAgICAgY29uc3Qgd2lkdGggID0gc2hhcGUuYXR0cignd2lkdGgnKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gc2hhcGUuYXR0cignaGVpZ2h0Jyk7XG5cbiAgICAgICAgY29uc3QgZWRnZU1hcCA9IHtcbiAgICAgICAgICAgIHRvcExlZnQ6ICAgICAgeyB4LCAgICAgICAgICAgICAgICAgIHkgfSxcbiAgICAgICAgICAgIHRvcE1pZGRsZTogICAgeyB4OiB4ICsgKHdpZHRoIC8gMiksIHkgfSxcbiAgICAgICAgICAgIHRvcFJpZ2h0OiAgICAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHkgfSxcbiAgICAgICAgICAgIGxlZnRNaWRkbGU6ICAgeyB4OiB4LCAgICAgICAgICAgICAgIHk6IHkgKyAoaGVpZ2h0IC8gMikgfSxcbiAgICAgICAgICAgIGJvdHRvbUxlZnQ6ICAgeyB4OiB4LCAgICAgICAgICAgICAgIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIGJvdHRvbU1pZGRsZTogeyB4OiB4ICsgKHdpZHRoIC8gMiksIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIGJvdHRvbVJpZ2h0OiAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHk6IHkgKyBoZWlnaHQgfSxcbiAgICAgICAgICAgIHJpZ2h0TWlkZGxlOiAgeyB4OiB4ICsgd2lkdGgsICAgICAgIHk6IHkgKyAoaGVpZ2h0IC8gMikgfVxuICAgICAgICB9O1xuXG4gICAgICAgIE9iamVjdC5rZXlzKGVkZ2VNYXApLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCBlZGdlICAgICAgICAgID0gZWRnZU1hcFtrZXldO1xuICAgICAgICAgICAgY29uc3QgZHJhZ0JlaGF2aW91ciA9IHRoaXMuZHJhZyhzaGFwZSwga2V5KTtcblxuICAgICAgICAgICAgdGhpcy5lZGdlc1trZXldID0gdGhpcy5sYXllci5hcHBlbmQoJ2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneGxpbms6aHJlZicsICdpbWFnZXMvaGFuZGxlLW1haW4ucG5nJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigneCcsIGVkZ2UueCAtICh0aGlzLlJBRElVUyAvIDIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JywgZWRnZS55IC0gKHRoaXMuUkFESVVTIC8gMikpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdyZWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHRoaXMuUkFESVVTKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCB0aGlzLlJBRElVUylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2NsaWNrJywgKCkgPT4gZDMuZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZDMuYmVoYXZpb3IuZHJhZygpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZHJhZ3N0YXJ0JywgZHJhZ0JlaGF2aW91ci5zdGFydClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdkcmFnJywgZHJhZ0JlaGF2aW91ci5kcmFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2RyYWdlbmQnLCBkcmFnQmVoYXZpb3VyLmVuZCkpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXRhY2hIYW5kbGVzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXRhY2hIYW5kbGVzKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmxheWVyKSB7XG4gICAgICAgICAgICB0aGlzLmxheWVyLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHBvcFVuaXF1ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zXG4gICAgICogQHJldHVybiB7TnVtYmVyfVxuICAgICAqL1xuICAgIHBvcFVuaXF1ZShpdGVtcykge1xuXG4gICAgICAgIGNvbnN0IGNvdW50cyA9IHt9O1xuXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBpdGVtcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIGNvbnN0IG51bSAgID0gaXRlbXNbaW5kZXhdO1xuICAgICAgICAgICAgY291bnRzW251bV0gPSBjb3VudHNbbnVtXSA/IGNvdW50c1tudW1dICsgMSA6IDE7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1bmlxdWUgPSBPYmplY3Qua2V5cyhjb3VudHMpLmZpbHRlcigoa2V5KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY291bnRzW2tleV0gPT09IDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB1bmlxdWUubGVuZ3RoID8gTnVtYmVyKHVuaXF1ZVswXSkgOiBpdGVtc1swXTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgcmVhcnJhbmdlSGFuZGxlc1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBjdXJyZW50S2V5XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICByZWFycmFuZ2VIYW5kbGVzKGN1cnJlbnRLZXkpIHtcblxuICAgICAgICBjb25zdCBjb29yZHMgICAgID0gW107XG4gICAgICAgIGNvbnN0IHJlZ0V4cCAgICAgPSAvKD89W0EtWl0pLztcbiAgICAgICAgY29uc3QgZGltZW5zaW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZWRnZXMpO1xuXG4gICAgICAgIGRpbWVuc2lvbnMuZm9yRWFjaCgoa2V5KSA9PiB7XG5cbiAgICAgICAgICAgIC8vIFBhY2thZ2UgYWxsIG9mIHRoZSBjb29yZGluYXRlcyB1cCBpbnRvIGEgbW9yZSBzaW1wbGUgYGNvb3Jkc2Agb2JqZWN0IGZvciBicmV2aXR5LlxuICAgICAgICAgICAgY29uc3QgZWRnZSAgPSB0aGlzLmVkZ2VzW2tleV07XG4gICAgICAgICAgICBjb29yZHNba2V5XSA9IHsgeDogTnVtYmVyKGVkZ2UuYXR0cigneCcpKSwgeTogTnVtYmVyKGVkZ2UuYXR0cigneScpKSB9O1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcHJvcGVydHkgY29ybmVyUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wOiBOdW1iZXIsIHJpZ2h0OiBOdW1iZXIsIGJvdHRvbTogTnVtYmVyLCBsZWZ0OiBOdW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgY29ybmVyUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBjb29yZGluYXRlIHRoYXQgZG9lc24ndCBtYXRjaCB0aGUgb3RoZXJzLCB3aGljaCBtZWFucyB0aGF0IGlzIHRoZSBjb29yZGluYXRlIHRoYXQgaXMgY3VycmVudGx5XG4gICAgICAgICAgICAvLyBiZWluZyBtb2RpZmllZCB3aXRob3V0IGFueSBjb25kaXRpb25hbCBzdGF0ZW1lbnRzLlxuICAgICAgICAgICAgdG9wOiAgICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueSwgICAgY29vcmRzLnRvcE1pZGRsZS55LCAgICBjb29yZHMudG9wUmlnaHQueV0pLFxuICAgICAgICAgICAgcmlnaHQ6ICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcFJpZ2h0LngsICAgY29vcmRzLnJpZ2h0TWlkZGxlLngsICBjb29yZHMuYm90dG9tUmlnaHQueF0pLFxuICAgICAgICAgICAgYm90dG9tOiB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLmJvdHRvbUxlZnQueSwgY29vcmRzLmJvdHRvbU1pZGRsZS55LCBjb29yZHMuYm90dG9tUmlnaHQueV0pLFxuICAgICAgICAgICAgbGVmdDogICB0aGlzLnBvcFVuaXF1ZShbY29vcmRzLnRvcExlZnQueCwgICAgY29vcmRzLmxlZnRNaWRkbGUueCwgICBjb29yZHMuYm90dG9tTGVmdC54XSlcblxuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAY29uc3RhbnQgbWlkZGxlUG9zaXRpb25zXG4gICAgICAgICAqIEB0eXBlIHt7dG9wTWlkZGxlOiBudW1iZXIsIHJpZ2h0TWlkZGxlOiBudW1iZXIsIGJvdHRvbU1pZGRsZTogbnVtYmVyLCBsZWZ0TWlkZGxlOiBudW1iZXJ9fVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbWlkZGxlUG9zaXRpb25zID0ge1xuXG4gICAgICAgICAgICAvLyBBbGwgb2YgdGhlc2UgbWlkZGxlIHBvc2l0aW9ucyBhcmUgcmVsYXRpdmUgdG8gdGhlIGNvcm5lciBwb3NpdGlvbnMgYWJvdmUuXG4gICAgICAgICAgICB0b3BNaWRkbGU6ICAgIChjb3JuZXJQb3NpdGlvbnMubGVmdCArIGNvcm5lclBvc2l0aW9ucy5yaWdodCkgLyAyLFxuICAgICAgICAgICAgcmlnaHRNaWRkbGU6ICAoY29ybmVyUG9zaXRpb25zLnRvcCArIGNvcm5lclBvc2l0aW9ucy5ib3R0b20pIC8gMixcbiAgICAgICAgICAgIGJvdHRvbU1pZGRsZTogKGNvcm5lclBvc2l0aW9ucy5sZWZ0ICsgY29ybmVyUG9zaXRpb25zLnJpZ2h0KSAvIDIsXG4gICAgICAgICAgICBsZWZ0TWlkZGxlOiAgIChjb3JuZXJQb3NpdGlvbnMudG9wICsgY29ybmVyUG9zaXRpb25zLmJvdHRvbSkgLyAyXG5cbiAgICAgICAgfTtcblxuICAgICAgICBkaW1lbnNpb25zLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoY3VycmVudEtleSAhPT0ga2V5KSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdChyZWdFeHApLm1hcChrZXkgPT4ga2V5LnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzWzFdID09PSAnbWlkZGxlJykge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICd0b3BNaWRkbGUnIHx8IGtleSA9PT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzBdXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIG1pZGRsZVBvc2l0aW9uc1trZXldKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd5JywgbWlkZGxlUG9zaXRpb25zW2tleV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneCcsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmVkZ2VzW2tleV0uYXR0cigneScsIGNvcm5lclBvc2l0aW9uc1twYXJ0c1swXV0pO1xuICAgICAgICAgICAgICAgIHRoaXMuZWRnZXNba2V5XS5hdHRyKCd4JywgY29ybmVyUG9zaXRpb25zW3BhcnRzWzFdXSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1xuICAgICAqIEBwYXJhbSB7U2hhcGV9IHNoYXBlXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgICAqIEByZXR1cm4ge3tzdGFydDogRnVuY3Rpb24sIGRyYWc6IEZ1bmN0aW9uLCBlbmQ6IEZ1bmN0aW9ufX1cbiAgICAgKi9cbiAgICBkcmFnKHNoYXBlLCBrZXkpIHtcblxuICAgICAgICBjb25zdCBtaWRkbGVtYW4gICAgICAgID0gdGhpcy5taWRkbGVtYW4oKTtcbiAgICAgICAgY29uc3QgaGFuZGxlcyAgICAgICAgICA9IHRoaXMubGF5ZXI7XG4gICAgICAgIGNvbnN0IHJhZGl1cyAgICAgICAgICAgPSB0aGlzLlJBRElVUztcbiAgICAgICAgY29uc3QgcmVhdHRhY2hIYW5kbGVzICA9IHRoaXMucmVhdHRhY2hIYW5kbGVzLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IHJlYXJyYW5nZUhhbmRsZXMgICAgID0gdGhpcy5yZWFycmFuZ2VIYW5kbGVzLmJpbmQodGhpcyk7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94TGF5ZXIgPSBtaWRkbGVtYW5bU3ltYm9scy5EUkFGVF1bU3ltYm9scy5MQVlFUlNdLmJvdW5kaW5nQm94O1xuICAgICAgICBsZXQgc3RhcnRYLCBzdGFydFksIHJhdGlvO1xuXG4gICAgICAgIHJldHVybiB7XG5cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQG1ldGhvZCBzdGFydFxuICAgICAgICAgICAgICogQHJldHVybiB7e3g6IE51bWJlciwgeTogTnVtYmVyfX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3RhcnQ6IGZ1bmN0aW9uIHN0YXJ0KCkge1xuXG4gICAgICAgICAgICAgICAgbWlkZGxlbWFuLmJvdW5kaW5nQm94KCkuYkJveC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KHRydWUpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlID0gZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoJ2RyYWdnaW5nJywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmF0aW8gICAgICAgID0gc2hhcGUuYXR0cignd2lkdGgnKSAvIHNoYXBlLmF0dHIoJ2hlaWdodCcpO1xuXG4gICAgICAgICAgICAgICAgc3RhcnRYID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVggLSBwYXJzZUludChoYW5kbGUuYXR0cigneCcpKTtcbiAgICAgICAgICAgICAgICBzdGFydFkgPSBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWSAtIHBhcnNlSW50KGhhbmRsZS5hdHRyKCd5JykpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgeDogc3RhcnRYLCB5OiBzdGFydFkgfTtcblxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgICAgICAgICAqIEByZXR1cm4ge3t4OiBOdW1iZXIsIHk6IE51bWJlcn19XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGRyYWc6IGZ1bmN0aW9uIGRyYWcoKSB7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gbWlkZGxlbWFuLm9wdGlvbnMoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGUgID0gZDMuc2VsZWN0KHRoaXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vdmVYICAgPSAoZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVggLSBzdGFydFgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vdmVZICAgPSAoZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVkgLSBzdGFydFkpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbmFsWCAgPSBNYXRoLmNlaWwobW92ZVggLyBvcHRpb25zLmdyaWRTaXplKSAqIG9wdGlvbnMuZ3JpZFNpemU7XG4gICAgICAgICAgICAgICAgY29uc3QgZmluYWxZICA9IE1hdGguY2VpbChtb3ZlWSAvIG9wdGlvbnMuZ3JpZFNpemUpICogb3B0aW9ucy5ncmlkU2l6ZTtcblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICd0b3BNaWRkbGUnICYmIGtleSAhPT0gJ2JvdHRvbU1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3gnLCBmaW5hbFgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChrZXkgIT09ICdyaWdodE1pZGRsZScgJiYga2V5ICE9PSAnbGVmdE1pZGRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlLmF0dHIoJ3knLCBmaW5hbFkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlYXJyYW5nZUhhbmRsZXMoa2V5KTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb25zdCBiQm94ID0gaGFuZGxlcy5ub2RlKCkuZ2V0QkJveCgpO1xuICAgICAgICAgICAgICAgIHNoYXBlLmF0dHIoJ3gnLCBiQm94LnggKyAocmFkaXVzIC8gMikpLmF0dHIoJ3knLCBiQm94LnkgKyAocmFkaXVzIC8gMikpXG4gICAgICAgICAgICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgYkJveC5oZWlnaHQgLSByYWRpdXMpLmF0dHIoJ3dpZHRoJywgYkJveC53aWR0aCAtIHJhZGl1cyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4geyB4OiBmaW5hbFgsIHk6IGZpbmFsWSB9O1xuXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgZW5kXG4gICAgICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBlbmQ6IGZ1bmN0aW9uIGVuZCgpIHtcbiAgICAgICAgICAgICAgICBtaWRkbGVtYW4uYm91bmRpbmdCb3goKS5kcmF3Qm91bmRpbmdCb3gobWlkZGxlbWFuLnNlbGVjdGVkKCksIGJvdW5kaW5nQm94TGF5ZXIpO1xuICAgICAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJlYXR0YWNoSGFuZGxlcygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgQWJpbGl0eSBmcm9tICcuL0FiaWxpdHknO1xuaW1wb3J0IFN5bWJvbHMgZnJvbSAnLi8uLi9oZWxwZXJzL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2VsZWN0YWJsZVxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0YWJsZSBleHRlbmRzIEFiaWxpdHkge1xuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWRBZGRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRpZEFkZCgpIHtcblxuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuRUxFTUVOVF07XG4gICAgICAgIGVsZW1lbnQub24oJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgZWxlbWVudC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbignZHJhZycsICgpID0+IHRoaXMuaGFuZGxlRHJhZygpKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGhhbmRsZURyYWdcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgaGFuZGxlRHJhZygpIHtcblxuICAgICAgICB0aGlzLmhhbmRsZUNsaWNrKCk7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpcy5zaGFwZSgpW1N5bWJvbHMuTUlERExFTUFOXTtcbiAgICAgICAgbWlkZGxlbWFuLnByZXZlbnREZXNlbGVjdCh0cnVlKTtcblxuICAgICAgICAvLyBDcmVhdGUgYSBmYWtlIGV2ZW50IHRvIGRyYWcgdGhlIHNoYXBlIHdpdGggYW4gb3ZlcnJpZGUgWCBhbmQgWSB2YWx1ZS5cbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTW91c2VFdmVudCgnbW91c2Vkb3duJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgZXZlbnQub3ZlcnJpZGVYID0gZDMuZXZlbnQuc291cmNlRXZlbnQucGFnZVg7XG4gICAgICAgIGV2ZW50Lm92ZXJyaWRlWSA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIGNvbnN0IGJCb3ggPSBtaWRkbGVtYW4uYm91bmRpbmdCb3goKS5iQm94Lm5vZGUoKTtcbiAgICAgICAgYkJveC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3Qga2V5TWFwID0gdGhpcy5taWRkbGVtYW4oKVtTeW1ib2xzLktFWV9NQVBdO1xuXG4gICAgICAgIGlmICh0aGlzLnNoYXBlKCkuaXNTZWxlY3RlZCgpKSB7XG5cbiAgICAgICAgICAgIGlmICgha2V5TWFwLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgICAgICAvLyBEZXNlbGVjdCBhbGwgb3RoZXJzIGFuZCBzZWxlY3Qgb25seSB0aGUgY3VycmVudCBzaGFwZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gdm9pZCB0aGlzLm1pZGRsZW1hbigpLmRlc2VsZWN0KHsgZXhjbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IHRoZSBzaGFwZSBpZiBpdCdzIGN1cnJlbnRseSBzZWxlY3RlZC5cbiAgICAgICAgICAgIHJldHVybiB2b2lkIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBpbmNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgha2V5TWFwLm11bHRpU2VsZWN0KSB7XG5cbiAgICAgICAgICAgIC8vIERlc2VsZWN0IGFsbCBzaGFwZXMgZXhjZXB0IGZvciB0aGUgY3VycmVudC5cbiAgICAgICAgICAgIHRoaXMubWlkZGxlbWFuKCkuZGVzZWxlY3QoeyBleGNsdWRlOiB0aGlzLnNoYXBlKCkgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWlkZGxlbWFuKCkuc2VsZWN0KHsgaW5jbHVkZTogdGhpcy5zaGFwZSgpIH0pO1xuXG4gICAgfVxuXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEF0dHJpYnV0ZXNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cblxuLypcbiAqIEBtZXRob2Qgc2V0QXR0cmlidXRlXG4gKiBAcGFyYW0ge0FycmF5fSBlbGVtZW50XG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7dm9pZH1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQsIG5hbWUsIHZhbHVlKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgY29uc3QgeSA9IGVsZW1lbnQuZGF0dW0oKS55IHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCBlbGVtZW50LmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt2YWx1ZX0sICR7eX0pYCk7XG5cbiAgICAgICAgY2FzZSAneSc6XG4gICAgICAgICAgICBjb25zdCB4ID0gZWxlbWVudC5kYXR1bSgpLnggfHwgMDtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIGVsZW1lbnQuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3ZhbHVlfSlgKTtcblxuICAgIH1cblxuICAgIGVsZW1lbnQuYXR0cihuYW1lLCB2YWx1ZSk7XG5cbn07IiwiaW1wb3J0IE1vdXNldHJhcCBmcm9tICdtb3VzZXRyYXAnO1xuaW1wb3J0IFN5bWJvbHMgICBmcm9tICcuL1N5bWJvbHMnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgQm91bmRpbmdCb3hcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJvdW5kaW5nQm94IHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7TWlkZGxlbWFufSBtaWRkbGVtYW5cbiAgICAgKiBAcmV0dXJuIHtCb3VuZGluZ0JveH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihtaWRkbGVtYW4pIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXSA9IG1pZGRsZW1hbjtcbiAgICAgICAgdGhpcy5saXN0ZW5Ub0tleWJvYXJkRXZlbnRzKCk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGxpc3RlblRvS2V5Ym9hcmRFdmVudHNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGxpc3RlblRvS2V5Ym9hcmRFdmVudHMoKSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBtZXRob2QgbW92ZUJ5XG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0geVxuICAgICAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAgICAgKi9cbiAgICAgICAgY29uc3QgbW92ZUJ5ID0gKGV2ZW50LCB4LCB5KSA9PiB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5tb3ZlU2VsZWN0ZWRCeSh4LCB5LCB0cnVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBvcHRpb25zICAgICAgICAgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCk7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRNb3ZlU3RlcCA9IG9wdGlvbnMuZGVmYXVsdE1vdmVTdGVwO1xuICAgICAgICBjb25zdCBzaGlmdE1vdmVTdGVwICAgPSBvcHRpb25zLnNoaWZ0TW92ZVN0ZXA7XG5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ2xlZnQnLCAgKGV2ZW50KSA9PiBtb3ZlQnkoZXZlbnQsIC1kZWZhdWx0TW92ZVN0ZXAsIDApKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3JpZ2h0JywgKGV2ZW50KSA9PiBtb3ZlQnkoZXZlbnQsIGRlZmF1bHRNb3ZlU3RlcCwgMCkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgndXAnLCAgICAoZXZlbnQpID0+IG1vdmVCeShldmVudCwgMCwgLWRlZmF1bHRNb3ZlU3RlcCkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnZG93bicsICAoZXZlbnQpID0+IG1vdmVCeShldmVudCwgMCwgZGVmYXVsdE1vdmVTdGVwKSk7XG5cbiAgICAgICAgTW91c2V0cmFwLmJpbmQoJ3NoaWZ0K2xlZnQnLCAgKGV2ZW50KSA9PiBtb3ZlQnkoZXZlbnQsIC1zaGlmdE1vdmVTdGVwLCAwKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCtyaWdodCcsIChldmVudCkgPT4gbW92ZUJ5KGV2ZW50LCBzaGlmdE1vdmVTdGVwLCAwKSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdzaGlmdCt1cCcsICAgIChldmVudCkgPT4gbW92ZUJ5KGV2ZW50LCAwLCAtc2hpZnRNb3ZlU3RlcCkpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQrZG93bicsICAoZXZlbnQpID0+IG1vdmVCeShldmVudCwgMCwgc2hpZnRNb3ZlU3RlcCkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBoYW5kbGVDbGlja1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgaGFuZGxlQ2xpY2soKSB7XG5cbiAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gdGhpc1tTeW1ib2xzLk1JRERMRU1BTl07XG4gICAgICAgIGQzLmV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4ucHJldmVudERlc2VsZWN0KCkpIHtcbiAgICAgICAgICAgIG1pZGRsZW1hbi5wcmV2ZW50RGVzZWxlY3QoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW91c2VYID0gZDMuZXZlbnQucGFnZVg7XG4gICAgICAgIGNvbnN0IG1vdXNlWSA9IGQzLmV2ZW50LnBhZ2VZO1xuXG4gICAgICAgIHRoaXMuYkJveC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdub25lJyk7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KG1vdXNlWCwgbW91c2VZKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3BvaW50ZXItZXZlbnRzJywgJ2FsbCcpO1xuXG4gICAgICAgIGlmIChtaWRkbGVtYW4uZnJvbUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ2NsaWNrJywgeyBidWJibGVzOiB0cnVlLCBjYW5jZWxhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYXdCb3VuZGluZ0JveFxuICAgICAqIEBwYXJhbSB7QXJyYXl9IHNlbGVjdGVkXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGxheWVyXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmF3Qm91bmRpbmdCb3goc2VsZWN0ZWQsIGxheWVyKSB7XG5cbiAgICAgICAgaWYgKHRoaXMuYkJveCkge1xuICAgICAgICAgICAgdGhpcy5iQm94LnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdGVkLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbW9kZWwgPSB7IG1pblg6IE51bWJlci5NQVhfVkFMVUUsIG1pblk6IE51bWJlci5NQVhfVkFMVUUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhYOiBOdW1iZXIuTUlOX1ZBTFVFLCBtYXhZOiBOdW1iZXIuTUlOX1ZBTFVFIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlc3BvbnNpYmxlIGZvciBjb21wdXRpbmcgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LCBiYXNlZCBvbiBhbGwgb2YgdGhlIGJvdW5kaW5nIGJveGVzXG4gICAgICAgICAqIGZyb20gdGhlIGN1cnJlbnQgc2VsZWN0ZWQgc2hhcGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAbWV0aG9kIGNvbXB1dGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gYkJveGVzXG4gICAgICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBjb21wdXRlID0gKGJCb3hlcykgPT4ge1xuICAgICAgICAgICAgbW9kZWwubWluWCA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCkpO1xuICAgICAgICAgICAgbW9kZWwubWluWSA9IE1hdGgubWluKC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueSkpO1xuICAgICAgICAgICAgbW9kZWwubWF4WCA9IE1hdGgubWF4KC4uLmJCb3hlcy5tYXAoKGQpID0+IGQueCArIGQud2lkdGgpKTtcbiAgICAgICAgICAgIG1vZGVsLm1heFkgPSBNYXRoLm1heCguLi5iQm94ZXMubWFwKChkKSA9PiBkLnkgKyBkLmhlaWdodCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGNvbGxlY3RpdmUgYm91bmRpbmcgYm94LlxuICAgICAgICBjb21wdXRlKHNlbGVjdGVkLm1hcCgoc2hhcGUpID0+IHNoYXBlLmJvdW5kaW5nQm94KCkpKTtcblxuICAgICAgICB0aGlzLmJCb3ggPSBsYXllci5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5kYXR1bShtb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAuY2xhc3NlZCgnZHJhZy1ib3gnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd4JywgICAgICAoKGQpID0+IGQubWluWCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3knLCAgICAgICgoZCkgPT4gZC5taW5ZKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAgKChkKSA9PiBkLm1heFggLSBkLm1pblgpKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAoKGQpID0+IGQubWF4WSAtIGQubWluWSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKSk7XG5cbiAgICAgICAgY29uc3QgZHJhZ1N0YXJ0ID0gWydkcmFnc3RhcnQnLCAoKSA9PiB0aGlzLmRyYWdTdGFydCgpXTtcbiAgICAgICAgY29uc3QgZHJhZyAgICAgID0gWydkcmFnJywgICAgICAoKSA9PiB0aGlzLmRyYWcoKV07XG4gICAgICAgIGNvbnN0IGRyYWdFbmQgICA9IFsnZHJhZ2VuZCcsICAgKCkgPT4gdGhpcy5kcmFnRW5kKCldO1xuXG4gICAgICAgIHRoaXMuYkJveC5jYWxsKGQzLmJlaGF2aW9yLmRyYWcoKS5vbiguLi5kcmFnU3RhcnQpLm9uKC4uLmRyYWcpLm9uKC4uLmRyYWdFbmQpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZHJhZ1N0YXJ0XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt4PW51bGxdXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IFt5PW51bGxdXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkcmFnU3RhcnQoeCA9IG51bGwsIHkgPSBudWxsKSB7XG5cbiAgICAgICAgY29uc3Qgc1ggPSBOdW1iZXIodGhpcy5iQm94LmF0dHIoJ3gnKSk7XG4gICAgICAgIGNvbnN0IHNZID0gTnVtYmVyKHRoaXMuYkJveC5hdHRyKCd5JykpO1xuXG4gICAgICAgIHRoaXMuc3RhcnQgPSB7XG4gICAgICAgICAgICB4OiAoeCAhPT0gbnVsbCkgPyB4IDogKGQzLmV2ZW50LnNvdXJjZUV2ZW50Lm92ZXJyaWRlWCB8fCBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWCkgLSBzWCxcbiAgICAgICAgICAgIHk6ICh5ICE9PSBudWxsKSA/IHkgOiAoZDMuZXZlbnQuc291cmNlRXZlbnQub3ZlcnJpZGVZIHx8IGQzLmV2ZW50LnNvdXJjZUV2ZW50LnBhZ2VZKSAtIHNZXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb3ZlID0ge1xuICAgICAgICAgICAgc3RhcnQ6IHsgeDogc1gsIHk6IHNZIH0sXG4gICAgICAgICAgICBlbmQ6ICAgeyB9XG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3g9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3k9bnVsbF1cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW211bHRpcGxlT2Y9dGhpc1tTeW1ib2xzLk1JRERMRU1BTl0ub3B0aW9ucygpLmdyaWRTaXplXVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZHJhZyh4ID0gbnVsbCwgeSA9IG51bGwsIG11bHRpcGxlT2YgPSB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5vcHRpb25zKCkuZ3JpZFNpemUpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5wcmV2ZW50RGVzZWxlY3QodHJ1ZSk7XG5cbiAgICAgICAgeCA9ICh4ICE9PSBudWxsKSA/IHggOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWDtcbiAgICAgICAgeSA9ICh5ICE9PSBudWxsKSA/IHkgOiBkMy5ldmVudC5zb3VyY2VFdmVudC5wYWdlWTtcblxuICAgICAgICBjb25zdCBtWCA9ICh4IC0gdGhpcy5zdGFydC54KSxcbiAgICAgICAgICAgICAgbVkgPSAoeSAtIHRoaXMuc3RhcnQueSksXG4gICAgICAgICAgICAgIGVYID0gTWF0aC5jZWlsKG1YIC8gbXVsdGlwbGVPZikgKiBtdWx0aXBsZU9mLFxuICAgICAgICAgICAgICBlWSA9IE1hdGguY2VpbChtWSAvIG11bHRpcGxlT2YpICogbXVsdGlwbGVPZjtcblxuICAgICAgICB0aGlzLmJCb3guZGF0dW0oKS54ID0gZVg7XG4gICAgICAgIHRoaXMuYkJveC5kYXR1bSgpLnkgPSBlWTtcblxuICAgICAgICB0aGlzLmJCb3guYXR0cigneCcsIGVYKTtcbiAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3knLCBlWSk7XG5cbiAgICAgICAgdGhpcy5tb3ZlLmVuZCA9IHsgeDogZVgsIHk6IGVZIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRyYWdFbmRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGRyYWdFbmQoKSB7XG5cbiAgICAgICAgY29uc3QgZVggPSB0aGlzLm1vdmUuZW5kLnggLSB0aGlzLm1vdmUuc3RhcnQueDtcbiAgICAgICAgY29uc3QgZVkgPSB0aGlzLm1vdmUuZW5kLnkgLSB0aGlzLm1vdmUuc3RhcnQueTtcblxuICAgICAgICBpZiAoaXNOYU4oZVgpIHx8IGlzTmFOKGVZKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTW92ZSBlYWNoIHNoYXBlIGJ5IHRoZSBkZWx0YSBiZXR3ZWVuIHRoZSBzdGFydCBhbmQgZW5kIHBvaW50cy5cbiAgICAgICAgdGhpcy5tb3ZlU2VsZWN0ZWRCeShlWCwgZVkpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBtb3ZlU2VsZWN0ZWRCeVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFttb3ZlQkJveD1mYWxzZV1cbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIG1vdmVTZWxlY3RlZEJ5KHgsIHksIG1vdmVCQm94ID0gZmFsc2UpIHtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuTUlERExFTUFOXS5zZWxlY3RlZCgpLmZvckVhY2goKHNoYXBlKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gc2hhcGUuYXR0cigneCcpO1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFkgPSBzaGFwZS5hdHRyKCd5Jyk7XG4gICAgICAgICAgICBjb25zdCBtb3ZlWCAgICA9IGN1cnJlbnRYICsgeDtcbiAgICAgICAgICAgIGNvbnN0IG1vdmVZICAgID0gY3VycmVudFkgKyB5O1xuXG4gICAgICAgICAgICBzaGFwZS5hdHRyKCd4JywgbW92ZVgpLmF0dHIoJ3knLCBtb3ZlWSk7XG4gICAgICAgICAgICBzaGFwZS5hdHRyKCd4JywgbW92ZVgpLmF0dHIoJ3knLCBtb3ZlWSk7XG4gICAgICAgICAgICBzaGFwZS5kaWRNb3ZlKCk7XG5cbiAgICAgICAgICAgIGlmIChtb3ZlQkJveCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYkJveC5hdHRyKCd4JywgbW92ZVgpLmF0dHIoJ3knLCBtb3ZlWSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iQm94LmF0dHIoJ3gnLCBtb3ZlWCkuYXR0cigneScsIG1vdmVZKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgIH1cblxufSIsImltcG9ydCBTeW1ib2xzIGZyb20gJy4vU3ltYm9scyc7XG5cbi8qKlxuICogQG1ldGhvZCB0cnlJbnZva2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcGFyYW0ge1N0cmluZ30gZnVuY3Rpb25OYW1lXG4gKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5jb25zdCB0cnlJbnZva2UgPSAoY29udGV4dCwgZnVuY3Rpb25OYW1lLCAuLi5vcHRpb25zKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0eXBlb2YgY29udGV4dFtmdW5jdGlvbk5hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNvbnRleHRbZnVuY3Rpb25OYW1lXSguLi5vcHRpb25zKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuXG59O1xuXG4vKipcbiAqIEBtZXRob2QgY2FwaXRhbGl6ZVxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuY29uc3QgY2FwaXRhbGl6ZSA9IChuYW1lKSA9PiB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zbGljZSgxKTtcblxufTtcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEludm9jYXRvclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKCgpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQG1ldGhvZCBkaWRcbiAgICAgICAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICAgICAgICogQHBhcmFtIHtBcnJheXxTaGFwZX0gc2hhcGVzXG4gICAgICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICAgICAqL1xuICAgICAgICBkaWQodHlwZSwgc2hhcGVzKSB7XG5cbiAgICAgICAgICAgIHNoYXBlcyA9IEFycmF5LmlzQXJyYXkoc2hhcGVzKSA/IHNoYXBlcyA6IFtzaGFwZXNdO1xuXG4gICAgICAgICAgICByZXR1cm4gc2hhcGVzLmV2ZXJ5KChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnlJbnZva2Uoc2hhcGUsIGBkaWQke2NhcGl0YWxpemUodHlwZSl9YCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbWV0aG9kIGluY2x1ZGVFeGNsdWRlXG4gICAgICAgICAqIEBwYXJhbSB7RHJhZnR9IGRyYWZ0XG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cbiAgICAgICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgICAgICovXG4gICAgICAgIGluY2x1ZGVFeGNsdWRlKGRyYWZ0LCBmbiwgb3B0aW9ucyA9IHt9KSB7XG5cbiAgICAgICAgICAgIGNvbnN0IGluY2x1ZGUgICA9IG9wdGlvbnMuaW5jbHVkZSB8fCB1bmRlZmluZWQ7XG4gICAgICAgICAgICBjb25zdCBleGNsdWRlICAgPSBvcHRpb25zLmV4Y2x1ZGUgfHwgdW5kZWZpbmVkO1xuICAgICAgICAgICAgY29uc3QgbWlkZGxlbWFuID0gZHJhZnRbU3ltYm9scy5NSURETEVNQU5dO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIEBtZXRob2QgYWxsRXhjbHVkaW5nXG4gICAgICAgICAgICAgKiBAcGFyYW0ge0FycmF5fSBleGNsdWRpbmdcbiAgICAgICAgICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBhbGxFeGNsdWRpbmcgPSAoZXhjbHVkaW5nKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBleGNsdWRpbmcgPSBBcnJheS5pc0FycmF5KGV4Y2x1ZGluZykgPyBleGNsdWRpbmcgOiBbZXhjbHVkaW5nXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtaWRkbGVtYW4uYWxsKCkuZmlsdGVyKChzaGFwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIX5leGNsdWRpbmcuaW5kZXhPZihzaGFwZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChpbmNsdWRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZvaWQgZm4uYXBwbHkoZHJhZnQsIFtpbmNsdWRlXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZXhjbHVkZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2b2lkIGZuLmFwcGx5KGRyYWZ0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm4uYXBwbHkoZHJhZnQsIFthbGxFeGNsdWRpbmcoZXhjbHVkZSldKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KSgpOyIsImltcG9ydCBNb3VzZXRyYXAgZnJvbSAnbW91c2V0cmFwJztcbmltcG9ydCBTeW1ib2xzICAgZnJvbSAnLi9TeW1ib2xzJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIEtleUJpbmRpbmdzXG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXlCaW5kaW5ncyB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge01pZGRsZW1hbn0gbWlkZGxlbWFuXG4gICAgICogQHJldHVybiB7S2V5QmluZGluZ3N9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IobWlkZGxlbWFuKSB7XG5cbiAgICAgICAgY29uc3Qga2V5TWFwICAgICAgICAgICAgPSBtaWRkbGVtYW5bU3ltYm9scy5LRVlfTUFQXTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLk1JRERMRU1BTl0gPSBtaWRkbGVtYW47XG5cbiAgICAgICAgLy8gRGVmYXVsdCBrZXAgbWFwcGluZ3NcbiAgICAgICAga2V5TWFwLm11bHRpU2VsZWN0ID0gZmFsc2U7XG4gICAgICAgIGtleU1hcC5hc3BlY3RSYXRpbyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgY2hhbmdlcyB0byB0aGUga2V5IG1hcC5cbiAgICAgICAgdGhpcy5hdHRhY2hCaW5kaW5ncyhrZXlNYXApO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBhdHRhY2hCaW5kaW5nc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXlNYXBcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIGF0dGFjaEJpbmRpbmdzKGtleU1hcCkge1xuXG4gICAgICAgIC8vIFNlbGVjdCBhbGwgb2YgdGhlIGF2YWlsYWJsZSBzaGFwZXMuXG4gICAgICAgIE1vdXNldHJhcC5iaW5kKCdtb2QrYScsICgpID0+IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLnNlbGVjdCgpKTtcblxuICAgICAgICAvLyBNdWx0aS1zZWxlY3Rpbmcgc2hhcGVzLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiBrZXlNYXAubXVsdGlTZWxlY3QgPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnbW9kJywgICAoKSA9PiBrZXlNYXAubXVsdGlTZWxlY3QgPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICAgICAgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvcyB3aGVuIHJlc2l6aW5nLlxuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiBrZXlNYXAuYXNwZWN0UmF0aW8gPSB0cnVlLCAna2V5ZG93bicpO1xuICAgICAgICBNb3VzZXRyYXAuYmluZCgnc2hpZnQnLCAoKSA9PiBrZXlNYXAuYXNwZWN0UmF0aW8gPSBmYWxzZSwgJ2tleXVwJyk7XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgVGhyb3cgICAgIGZyb20gJy4uL2hlbHBlcnMvVGhyb3cnO1xuaW1wb3J0IFJlY3RhbmdsZSBmcm9tICcuLi9zaGFwZXMvUmVjdGFuZ2xlJztcblxuLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIE1hcHBlclxuICogQGF1dGhvciBBZGFtIFRpbWJlcmxha2VcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9XaWxkaG9uZXkvRHJhZnRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgKG5hbWUpID0+IHtcblxuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgY29uc3QgbWFwID0ge1xuICAgICAgICByZWN0YW5nbGU6IFJlY3RhbmdsZVxuICAgIH07XG5cbiAgICByZXR1cm4gdHlwZW9mIG1hcFtuYW1lXSAhPT0gJ3VuZGVmaW5lZCcgPyBuZXcgbWFwW25hbWVdKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBuZXcgVGhyb3coYENhbm5vdCBtYXAgXCIke25hbWV9XCIgdG8gYSBzaGFwZSBvYmplY3RgKTtcblxufTsiLCJpbXBvcnQgU3ltYm9scyAgICAgZnJvbSAnLi9TeW1ib2xzJztcbmltcG9ydCBLZXlCaW5kaW5ncyBmcm9tICcuL0tleUJpbmRpbmdzJztcbmltcG9ydCBpbnZvY2F0b3IgICBmcm9tICcuL0ludm9jYXRvcic7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBNaWRkbGVtYW5cbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pZGRsZW1hbiB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0RyYWZ0fSBkcmFmdFxuICAgICAqIEByZXR1cm4ge01pZGRsZW1hbn1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihkcmFmdCkge1xuXG4gICAgICAgIHRoaXNbU3ltYm9scy5EUkFGVF0gICAgICAgID0gZHJhZnQ7XG4gICAgICAgIHRoaXNbU3ltYm9scy5LRVlfTUFQXSAgICAgID0ge307XG4gICAgICAgIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdID0gZmFsc2U7XG5cbiAgICAgICAgbmV3IEtleUJpbmRpbmdzKHRoaXMpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkM1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBkMygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5TVkddO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgbGF5ZXJzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGxheWVycygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5MQVlFUlNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5vcHRpb25zKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBrZXlNYXBcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAga2V5TWFwKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLktFWV9NQVBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2Qgc2VsZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIHNlbGVjdChvcHRpb25zKSB7XG4gICAgICAgIGludm9jYXRvci5pbmNsdWRlRXhjbHVkZSh0aGlzW1N5bWJvbHMuRFJBRlRdLCB0aGlzW1N5bWJvbHMuRFJBRlRdLnNlbGVjdCwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkZXNlbGVjdChvcHRpb25zKSB7XG4gICAgICAgIGludm9jYXRvci5pbmNsdWRlRXhjbHVkZSh0aGlzW1N5bWJvbHMuRFJBRlRdLCB0aGlzW1N5bWJvbHMuRFJBRlRdLmRlc2VsZWN0LCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGFsbFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIGFsbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF0uYWxsKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBzZWxlY3RlZFxuICAgICAqIEByZXR1cm4ge0FycmF5fVxuICAgICAqL1xuICAgIHNlbGVjdGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkRSQUZUXS5zZWxlY3RlZCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZnJvbUVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gICAgICogQHJldHVybiB7U2hhcGV9XG4gICAgICovXG4gICAgZnJvbUVsZW1lbnQoZWxlbWVudCkge1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFsbCgpLmZpbHRlcigoc2hhcGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50ID09PSBzaGFwZVtTeW1ib2xzLkVMRU1FTlRdLm5vZGUoKTtcbiAgICAgICAgfSlbMF07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHByZXZlbnREZXNlbGVjdFxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3ZhbHVlPXVuZGVmaW5lZF1cbiAgICAgKi9cbiAgICBwcmV2ZW50RGVzZWxlY3QodmFsdWUpIHtcblxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5DQU5fREVTRUxFQ1RdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpc1tTeW1ib2xzLkNBTl9ERVNFTEVDVF0gPSB2YWx1ZTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYm91bmRpbmdCb3hcbiAgICAgKiBAcmV0dXJuIHtCb3VuZGluZ0JveH1cbiAgICAgKi9cbiAgICBib3VuZGluZ0JveCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbU3ltYm9scy5EUkFGVF1bU3ltYm9scy5CT1VORElOR19CT1hdO1xuICAgIH1cblxufSIsIi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBQb2x5ZmlsbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3RBc3NpZ24odGFyZ2V0KSB7XG5cbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgZmlyc3QgYXJndW1lbnQgdG8gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIHRvID0gT2JqZWN0KHRhcmdldCk7XG5cbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaWYgKG5leHRTb3VyY2UgPT09IHVuZGVmaW5lZCB8fCBuZXh0U291cmNlID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBuZXh0U291cmNlID0gT2JqZWN0KG5leHRTb3VyY2UpO1xuXG4gICAgICAgIHZhciBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xuXG4gICAgICAgIGZvciAodmFyIG5leHRJbmRleCA9IDAsIGxlbiA9IGtleXNBcnJheS5sZW5ndGg7IG5leHRJbmRleCA8IGxlbjsgbmV4dEluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XG4gICAgICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobmV4dFNvdXJjZSwgbmV4dEtleSk7XG4gICAgICAgICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xuICAgICAgICAgICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0bztcblxufVxuIiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFN5bWJvbHNcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBEUkFGVDogICAgICAgIFN5bWJvbCgnZHJhZnQnKSxcbiAgICBTVkc6ICAgICAgICAgIFN5bWJvbCgnc3ZnJyksXG4gICAgRUxFTUVOVDogICAgICBTeW1ib2woJ2VsZW1lbnQnKSxcbiAgICBJU19TRUxFQ1RFRDogIFN5bWJvbCgnaXNTZWxlY3RlZCcpLFxuICAgIEFUVFJJQlVURVM6ICAgU3ltYm9sKCdhdHRyaWJ1dGVzJyksXG4gICAgTUlERExFTUFOOiAgICBTeW1ib2woJ21pZGRsZW1hbicpLFxuICAgIFNIQVBFOiAgICAgICAgU3ltYm9sKCdzaGFwZScpLFxuICAgIFNIQVBFUzogICAgICAgU3ltYm9sKCdzaGFwZXMnKSxcbiAgICBMQVlFUlM6ICAgICAgIFN5bWJvbCgnbGF5ZXJzJyksXG4gICAgR1JPVVA6ICAgICAgICBTeW1ib2woJ2dyb3VwJyksXG4gICAgQk9VTkRJTkdfQk9YOiBTeW1ib2woJ2JvdW5kaW5nQm94JyksXG4gICAgT1BUSU9OUzogICAgICBTeW1ib2woJ29wdGlvbnMnKSxcbiAgICBBQklMSVRJRVM6ICAgIFN5bWJvbCgnYWJpbGl0aWVzJyksXG4gICAgS0VZX01BUDogICAgICBTeW1ib2woJ2tleU1hcCcpLFxuICAgIENBTl9ERVNFTEVDVDogU3ltYm9sKCdjYW5EZXNlbGVjdCcpXG59IiwiLyoqXG4gKiBAbW9kdWxlIERyYWZ0XG4gKiBAc3VibW9kdWxlIFRocm93XG4gKiBAYXV0aG9yIEFkYW0gVGltYmVybGFrZVxuICogQGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL1dpbGRob25leS9EcmFmdFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaHJvdyB7XG5cbiAgICAvKipcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgICAqIEByZXR1cm4ge1Rocm93fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEcmFmdC5qczogJHttZXNzYWdlfS5gKTtcbiAgICB9XG5cbn0iLCJpbXBvcnQgU2hhcGUgZnJvbSAnLi9TaGFwZSc7XG5cbi8qKlxuICogQG1vZHVsZSBEcmFmdFxuICogQHN1Ym1vZHVsZSBSZWN0YW5nbGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY3RhbmdsZSBleHRlbmRzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgdGFnTmFtZVxuICAgICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICAgKi9cbiAgICB0YWdOYW1lKCkge1xuICAgICAgICByZXR1cm4gJ3JlY3QnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGVmYXVsdEF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdEF0dHJpYnV0ZXMoKSB7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZpbGw6ICdibHVlJyxcbiAgICAgICAgICAgIGhlaWdodDogMTAwLFxuICAgICAgICAgICAgd2lkdGg6IDEwMCxcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgIH07XG5cbiAgICB9XG5cbn0iLCJpbXBvcnQgU3ltYm9scyAgICAgICAgZnJvbSAnLi4vaGVscGVycy9TeW1ib2xzJztcbmltcG9ydCBUaHJvdyAgICAgICAgICBmcm9tICcuLi9oZWxwZXJzL1Rocm93JztcbmltcG9ydCB7b2JqZWN0QXNzaWdufSBmcm9tICcuLi9oZWxwZXJzL1BvbHlmaWxscyc7XG5pbXBvcnQgc2V0QXR0cmlidXRlICAgZnJvbSAnLi4vaGVscGVycy9BdHRyaWJ1dGVzJztcbmltcG9ydCBpbnZvY2F0b3IgICAgICBmcm9tICcuLi9oZWxwZXJzL0ludm9jYXRvcic7XG5pbXBvcnQgU2VsZWN0YWJsZSAgICAgZnJvbSAnLi4vYWJpbGl0aWVzL1NlbGVjdGFibGUnO1xuaW1wb3J0IFJlc2l6YWJsZSAgICAgIGZyb20gJy4uL2FiaWxpdGllcy9SZXNpemFibGUnO1xuXG4vKipcbiAqIEBtb2R1bGUgRHJhZnRcbiAqIEBzdWJtb2R1bGUgU2hhcGVcbiAqIEBhdXRob3IgQWRhbSBUaW1iZXJsYWtlXG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vV2lsZGhvbmV5L0RyYWZ0XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNoYXBlIHtcblxuICAgIC8qKlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbYXR0cmlidXRlcz17fV1cbiAgICAgKiBAcmV0dXJuIHtTaGFwZX1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihhdHRyaWJ1dGVzID0ge30pIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdID0gYXR0cmlidXRlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRhZ05hbWVcbiAgICAgKiBAdGhyb3dzIHtFcnJvcn0gV2lsbCB0aHJvdyBhbiBleGNlcHRpb24gaWYgdGhlIGB0YWdOYW1lYCBtZXRob2QgaGFzbid0IGJlZW4gZGVmaW5lZCBvbiB0aGUgY2hpbGQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgdGFnTmFtZSgpIHtcbiAgICAgICAgbmV3IFRocm93KCdUYWcgbmFtZSBtdXN0IGJlIGRlZmluZWQgZm9yIGEgc2hhcGUgdXNpbmcgdGhlIGB0YWdOYW1lYCBtZXRob2QnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGlzU2VsZWN0ZWRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzU2VsZWN0ZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzW1N5bWJvbHMuSVNfU0VMRUNURURdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgYXR0clxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9dW5kZWZpbmVkXVxuICAgICAqIEByZXR1cm4ge1NoYXBlfCp9XG4gICAgICovXG4gICAgYXR0cihuYW1lLCB2YWx1ZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tTeW1ib2xzLkVMRU1FTlRdLmRhdHVtKClbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzW1N5bWJvbHMuRUxFTUVOVF0uZGF0dW0oKVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICBzZXRBdHRyaWJ1dGUodGhpc1tTeW1ib2xzLkVMRU1FTlRdLCBuYW1lLCB2YWx1ZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRpZEFkZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkQWRkKCkge1xuXG4gICAgICAgIGNvbnN0IGxheWVyICAgICAgICAgICA9IHRoaXNbU3ltYm9scy5NSURETEVNQU5dLmxheWVycygpLnNoYXBlcztcbiAgICAgICAgY29uc3QgYXR0cmlidXRlcyAgICAgID0gb2JqZWN0QXNzaWduKHRoaXMuZGVmYXVsdEF0dHJpYnV0ZXMoKSwgdGhpc1tTeW1ib2xzLkFUVFJJQlVURVNdKTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkdST1VQXSAgID0gbGF5ZXIuYXBwZW5kKCdnJyk7XG4gICAgICAgIHRoaXNbU3ltYm9scy5FTEVNRU5UXSA9IHRoaXNbU3ltYm9scy5HUk9VUF0uYXBwZW5kKHRoaXMudGFnTmFtZSgpKS5kYXR1bSh7fSk7XG5cbiAgICAgICAgLy8gQXNzaWduIGVhY2ggYXR0cmlidXRlIGZyb20gdGhlIGRlZmF1bHQgYXR0cmlidXRlcyBkZWZpbmVkIG9uIHRoZSBzaGFwZSwgYXMgd2VsbCBhcyB0aG9zZSBkZWZpbmVkXG4gICAgICAgIC8vIGJ5IHRoZSB1c2VyIHdoZW4gaW5zdGFudGlhdGluZyB0aGUgc2hhcGUuXG4gICAgICAgIE9iamVjdC5rZXlzKGF0dHJpYnV0ZXMpLmZvckVhY2goKGtleSkgPT4gdGhpcy5hdHRyKGtleSwgYXR0cmlidXRlc1trZXldKSk7XG5cbiAgICAgICAgY29uc3QgYWJpbGl0aWVzICA9IHtcbiAgICAgICAgICAgIHNlbGVjdGFibGU6IG5ldyBTZWxlY3RhYmxlKCksXG4gICAgICAgICAgICByZXNpemFibGU6ICBuZXcgUmVzaXphYmxlKClcbiAgICAgICAgfTtcblxuICAgICAgICBPYmplY3Qua2V5cyhhYmlsaXRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuXG4gICAgICAgICAgICAvLyBBZGQgdGhlIHNoYXBlIG9iamVjdCBpbnRvIGVhY2ggYWJpbGl0eSBpbnN0YW5jZSwgYW5kIGludm9rZSB0aGUgYGRpZEFkZGAgbWV0aG9kLlxuICAgICAgICAgICAgY29uc3QgYWJpbGl0eSA9IGFiaWxpdGllc1trZXldO1xuICAgICAgICAgICAgYWJpbGl0eVtTeW1ib2xzLlNIQVBFXSA9IHRoaXM7XG4gICAgICAgICAgICBpbnZvY2F0b3IuZGlkKCdhZGQnLCBhYmlsaXR5KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXSA9IGFiaWxpdGllcztcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkUmVtb3ZlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRSZW1vdmUoKSB7IH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkTW92ZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkTW92ZSgpIHtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLnJlYXR0YWNoSGFuZGxlcygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBtZXRob2QgZGlkU2VsZWN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBkaWRTZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSB0cnVlO1xuICAgICAgICB0aGlzW1N5bWJvbHMuQUJJTElUSUVTXS5yZXNpemFibGUuZGlkU2VsZWN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBkaWREZXNlbGVjdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgZGlkRGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXNbU3ltYm9scy5JU19TRUxFQ1RFRF0gPSBmYWxzZTtcbiAgICAgICAgdGhpc1tTeW1ib2xzLkFCSUxJVElFU10ucmVzaXphYmxlLmRpZERlc2VsZWN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG1ldGhvZCBib3VuZGluZ0JveFxuICAgICAqIEByZXR1cm4ge09iamVjdH1cbiAgICAgKi9cbiAgICBib3VuZGluZ0JveCgpIHtcblxuICAgICAgICBjb25zdCBoYXNCQm94ID0gdHlwZW9mIHRoaXNbU3ltYm9scy5HUk9VUF0ubm9kZSgpLmdldEJCb3ggPT09ICdmdW5jdGlvbic7XG5cbiAgICAgICAgcmV0dXJuIGhhc0JCb3ggPyB0aGlzW1N5bWJvbHMuR1JPVVBdLm5vZGUoKS5nZXRCQm94KCkgOiB7XG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuYXR0cignaGVpZ2h0JyksXG4gICAgICAgICAgICB3aWR0aDogIHRoaXMuYXR0cignd2lkdGgnKSxcbiAgICAgICAgICAgIHg6ICAgICAgdGhpcy5hdHRyKCd4JyksXG4gICAgICAgICAgICB5OiAgICAgIHRoaXMuYXR0cigneScpXG4gICAgICAgIH07XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIGRlZmF1bHRBdHRyaWJ1dGVzXG4gICAgICogQHJldHVybiB7T2JqZWN0fVxuICAgICAqL1xuICAgIGRlZmF1bHRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG59Il19
