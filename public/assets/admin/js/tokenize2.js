/*!
 * Tokenize2 v0.4-beta (https://github.com/zellerda/Tokenize2)
 * Copyright 2016 David Zeller.
 * Licensed under the new BSD license
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function (root, jQuery) {
            if (jQuery === undefined) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if (typeof window !== 'undefined') {
                    jQuery = require('jquery');
                } else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    /**
     * Tokenize2 constructor.
     *
     * @param {object} element
     * @param {object} options
     * @constructor
     */
    var Tokenize2 = function (element, options) {

        this.control = false;
        this.element = $(element);
        this.options = $.extend({}, Tokenize2.DEFAULTS, options);

        this.options.tabIndex = this.options.tabIndex === -1 ? 0 : this.options.tabIndex;
        this.options.sortable = this.options.tokensMaxItems === 1 ? false : this.options.sortable;

        this.bind();
        this.trigger('tokenize:load');

    };

    /**
     * Keycodes constants
     *
     * @type {object}
     */
    var KEYS = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        ARROW_UP: 38,
        ARROW_DOWN: 40,
        CTRL: 17,
        MAJ: 16
    };

    Tokenize2.VERSION = '0.3-beta';
    Tokenize2.DEBOUNCE = null;
    Tokenize2.DEFAULTS = {
        tokensMaxItems: 0,
        tokensAllowCustom: false,
        dropdownMaxItems: 10,
        searchMinLength: 0,
        searchFromStart: true,
        searchHighlight: true,
        delimiter: ',',
        dataSource: 'select',
        debounce: 0,
        placeholder: false,
        sortable: false,
        tabIndex: 0
    };

    /**
     * Trigger an event
     *
     * @see $.trigger
     */
    Tokenize2.prototype.trigger = function (event, data, elem, onlyHandlers) {

        this.element.trigger(event, data, elem, onlyHandlers);

    };

    /**
     * Bind events
     */
    Tokenize2.prototype.bind = function () {

        this.element.on('tokenize:load', {}, $.proxy(function () { this.init() }, this))
            .on('tokenize:clear', {}, $.proxy(function () { this.clear() }, this))
            .on('tokenize:remap', {}, $.proxy(function () { this.remap() }, this))
            .on('tokenize:select', {}, $.proxy(function (e, c) { this.focus(c) }, this))
            .on('tokenize:deselect', {}, $.proxy(function () { this.blur() }, this))
            .on('tokenize:search', {}, $.proxy(function (e, v) { this.find(v) }, this))
            .on('tokenize:paste', {}, $.proxy(function () { this.paste() }, this))
            .on('tokenize:dropdown:up', {}, $.proxy(function () { this.dropdownSelectionMove(-1) }, this))
            .on('tokenize:dropdown:down', {}, $.proxy(function () { this.dropdownSelectionMove(1) }, this))
            .on('tokenize:dropdown:clear', {}, $.proxy(function () { this.dropdownClear() }, this))
            .on('tokenize:dropdown:show', {}, $.proxy(function () { this.dropdownShow() }, this))
            .on('tokenize:dropdown:hide', {}, $.proxy(function () { this.dropdownHide() }, this))
            .on('tokenize:dropdown:fill', {}, $.proxy(function (e, i) { this.dropdownFill(i) }, this))
            .on('tokenize:dropdown:itemAdd', {}, $.proxy(function (e, i) { this.dropdownAddItem(i) }, this))
            .on('tokenize:keypress', {}, $.proxy(function (e, routedEvent) { this.keypress(routedEvent) }, this))
            .on('tokenize:keydown', {}, $.proxy(function (e, routedEvent) { this.keydown(routedEvent) }, this))
            .on('tokenize:keyup', {}, $.proxy(function (e, routedEvent) { this.keyup(routedEvent) }, this))
            .on('tokenize:tokens:reorder', {}, $.proxy(function () { this.reorder() }, this))
            .on('tokenize:tokens:add', {}, $.proxy(function (e, v, t, c) { this.tokenAdd(v, t, c) }, this))
            .on('tokenize:tokens:remove', {}, $.proxy(function (e, v) { this.tokenRemove(v) }, this));

    };

    /**
     * Init function
     */
    Tokenize2.prototype.init = function () {

        this.id = this.guid();
        this.element.hide();

        if (!this.element.attr('multiple')) {
            console.error('Attribute multiple is missing, tokenize2 can be buggy !')
        }

        this.dropdown = undefined;
        this.searchContainer = $('<li class="token-search" />');
        this.input = $('<input autocomplete="off" />')
            .on('keydown', {}, $.proxy(function (e) { this.trigger('tokenize:keydown', [e]) }, this))
            .on('keypress', {}, $.proxy(function (e) { this.trigger('tokenize:keypress', [e]) }, this))
            .on('keyup', {}, $.proxy(function (e) { this.trigger('tokenize:keyup', [e]) }, this))
            .on('focus', {}, $.proxy(function () {
                if (this.input.val().length > 0) {
                    this.trigger('tokenize:search', [this.input.val()]);
                }
            }, this))
            .on('paste', {}, $.proxy(function () {
                if (this.options.tokensAllowCustom) {
                    setTimeout($.proxy(function () {
                        this.trigger('tokenize:paste');
                    }, this), 10);
                }
            }, this));

        this.tokensContainer = $('<ul class="tokens-container form-control" />')
            .addClass(this.element.attr('data-class'))
            .attr('tabindex', this.options.tabIndex)
            .append(this.searchContainer.append(this.input));

        if (this.options.placeholder !== false) {
            this.placeholder = $('<li class="placeholder" />').html(this.options.placeholder);
            this.tokensContainer.prepend(this.placeholder);
            this.element.on('tokenize:tokens:add tokenize:remap tokenize:select tokenize:deselect tokenize:tokens:remove', $.proxy(function () {
                if (this.container.hasClass('focus') || $('li.token', this.tokensContainer).length > 0 || this.input.val().length > 0) {
                    this.placeholder.hide();
                } else {
                    this.placeholder.show();
                }
            }, this));
        }

        this.container = $('<div class="tokenize" />').attr('id', this.id);
        this.container.append(this.tokensContainer).insertAfter(this.element);
        this.container.focusin($.proxy(function (e) {
            this.trigger('tokenize:select', [($(e.target)[0] == this.tokensContainer[0])])
        }, this))
            .focusout($.proxy(function () {
                this.trigger('tokenize:deselect')
            }, this));

        if (this.options.tokensMaxItems === 1) {
            this.container.addClass('single');
        }

        if (this.options.sortable) {
            if (typeof $.ui != 'undefined') {
                this.container.addClass('sortable');
                this.tokensContainer.sortable({
                    items: 'li.token',
                    cursor: 'move',
                    placeholder: 'token shadow',
                    forcePlaceholderSize: true,
                    update: $.proxy(function () {
                        this.trigger('tokenize:tokens:reorder');
                    }, this),
                    start: $.proxy(function () {
                        this.searchContainer.hide();
                    }, this),
                    stop: $.proxy(function () {
                        this.searchContainer.show();
                    }, this)
                });
            } else {
                this.options.sortable = false;
                console.error('jQuery UI is not loaded, sortable option has been disabled');
            }
        }

        this.element
            .on('tokenize:tokens:add tokenize:tokens:remove', $.proxy(function () {
                if (this.options.tokensMaxItems > 0 && $('li.token', this.tokensContainer).length >= this.options.tokensMaxItems) {
                    this.searchContainer.hide();
                } else {
                    this.searchContainer.show();
                }
            }, this))
            .on('tokenize:keydown tokenize:keyup tokenize:loaded', $.proxy(function () {
                this.scaleInput();
            }, this));

        this.trigger('tokenize:remap');
        this.trigger('tokenize:tokens:reorder');
        this.trigger('tokenize:loaded');

    };

    /**
     * Reorder tokens in the select
     */
    Tokenize2.prototype.reorder = function () {

        if (this.options.sortable) {
            var previous, current;
            $.each(this.tokensContainer.sortable('toArray', { attribute: 'data-value' }), $.proxy(function (k, v) {
                current = $('option[value="' + v + '"]', this.element);
                if (previous == undefined) {
                    current.prependTo(this.element);
                } else {
                    previous.after(current);
                }
                previous = current;
            }, this));
        }

    };

    /**
     * Transform clipboard item to tokens
     */
    Tokenize2.prototype.paste = function () {

        var $pattern = new RegExp(this.escapeRegex(Array.isArray(this.options.delimiter) ? this.options.delimiter.join('|') : this.options.delimiter), 'ig');

        if ($pattern.test(this.input.val())) {
            $.each(this.input.val().split($pattern), $.proxy(function (_, value) {
                this.trigger('tokenize:tokens:add', [value, null, true]);
            }, this))
        }

    };

    /**
     * Add token
     *
     * If text is empty text = value
     *
     * @param {string} value
     * @param {string} text
     * @param {boolean} force
     * @returns {Tokenize2}
     */
    Tokenize2.prototype.tokenAdd = function (value, text, force) {

        value = this.escape(value);
        text = text || value;
        force = force || false;
        this.resetInput();

        // Check if token is empty
        if (value === undefined || value === '') {
            this.trigger('tokenize:tokens:error:empty');
            return this;
        }

        // Check if max number of token is reached
        if (this.options.tokensMaxItems > 0 && $('li.token', this.tokensContainer).length >= this.options.tokensMaxItems) {
            this.trigger('tokenize:tokens:error:max');
            return this;
        }

        // Check duplicate token
        if ($('li.token[data-value="' + value + '"]', this.tokensContainer).length > 0) {
            this.trigger('tokenize:tokens:error:duplicate', [value, text]);
            return this;
        }

        if ($('option[value="' + value + '"]', this.element).length) {
            $('option[value="' + value + '"]', this.element).attr('selected', 'selected').prop('selected', true);
        } else if (force) {
            this.element.append($('<option selected />').val(value).html(text));
        } else if (this.options.tokensAllowCustom) {
            this.element.append($('<option selected data-type="custom" />').val(value).html(text));
        } else {
            this.trigger('tokenize:tokens:error:notokensAllowCustom');
            return this;
        }

        $('<li class="token" />')
            .attr('data-value', value)
            .append('<span>' + text + '</span>')
            .prepend($('<a class="dismiss" />').html('&#215;').on('mousedown touchstart', {}, $.proxy(function (e) {
                e.preventDefault();
                this.trigger('tokenize:tokens:remove', [value]);
            }, this)))
            .insertBefore(this.searchContainer);

        this.trigger('tokenize:dropdown:hide');

        return this;

    };

    /**
     * Remove token
     *
     * @param {string} v
     * @returns {Tokenize2}
     */
    Tokenize2.prototype.tokenRemove = function (v) {

        var $item = $('option[value="' + v + '"]', this.element);

        if ($item.attr('data-type') === 'custom') {
            $item.remove();
        } else {
            $item.removeAttr('selected').prop('selected', false);
        }

        $('li.token[data-value="' + v + '"]', this.tokensContainer).remove();

        this.trigger('tokenize:tokens:reorder');
        return this;

    };

    /**
     * Refresh tokens reflecting selected options
     *
     * @returns {Tokenize2}
     */
    Tokenize2.prototype.remap = function () {

        var $selected = $('option:selected', this.element);
        $selected.each($.proxy(function (v, t) {
            this.trigger('tokenize:tokens:add', [$(t).val(), $(t).html(), false]);
        }, this));

        return this;

    };

    /**
     * Focus
     *
     * @param {boolean} container
     */
    Tokenize2.prototype.focus = function (container) {

        if (container) {
            this.input.focus();
        }

        this.container.addClass('focus');

    };

    /**
     * Blur
     */
    Tokenize2.prototype.blur = function () {

        if (this.isDropdownOpen()) {
            this.trigger('tokenize:dropdown:hide');
        }
        this.container.removeClass('focus');
        this.resetPending();

    };

    /**
     * Keydown
     *
     * @param {object} e
     */
    Tokenize2.prototype.keydown = function (e) {

        if (e.type === 'keydown') {
            switch (e.keyCode) {
                case KEYS.BACKSPACE:
                    if (this.input.val().length < 1) {
                        e.preventDefault();
                        if ($('li.token.pending-delete', this.tokensContainer).length > 0) {
                            this.trigger('tokenize:tokens:remove', [$('li.token.pending-delete', this.tokensContainer).first().attr('data-value')]);
                        } else {
                            var $token = $('li.token:last', this.tokensContainer);
                            if ($token.length > 0) {
                                this.trigger('tokenize:tokens:markForDelete', [$token.attr('data-value')]);
                                $token.addClass('pending-delete');
                            }
                        }
                        this.trigger('tokenize:dropdown:hide');
                    }
                    break;

                case KEYS.TAB:
                case KEYS.ENTER:
                    this.pressedDelimiter(e);
                    break;

                case KEYS.ESCAPE:
                    this.resetPending();
                    break;

                case KEYS.ARROW_UP:
                    e.preventDefault();
                    this.trigger('tokenize:dropdown:up');
                    break;

                case KEYS.ARROW_DOWN:
                    e.preventDefault();
                    this.trigger('tokenize:dropdown:down');
                    break;

                case KEYS.CTRL:
                    this.control = true;
                    break;

                default:
                    this.resetPending();
                    break;

            }
        } else {
            e.preventDefault();
        }

    };

    /**
     * Keyup
     *
     * @param {object} e
     */
    Tokenize2.prototype.keyup = function (e) {

        if (e.type === 'keyup') {
            switch (e.keyCode) {
                case KEYS.TAB:
                case KEYS.ENTER:
                case KEYS.ESCAPE:
                case KEYS.ARROW_UP:
                case KEYS.ARROW_DOWN:
                case KEYS.MAJ:
                    break;
                case KEYS.CTRL:
                    this.control = false;
                    break;
                case KEYS.BACKSPACE:
                default:
                    if (this.input.val().length > 0) {
                        this.trigger('tokenize:search', [this.input.val()]);
                    } else {
                        this.trigger('tokenize:dropdown:hide');
                    }
                    break;
            }
        } else {
            e.preventDefault();
        }

    };

    /**
     * Keypress
     *
     * @param {object} e
     */
    Tokenize2.prototype.keypress = function (e) {

        if (e.type === 'keypress') {
            var $delimiter = false;

            if (Array.isArray(this.options.delimiter)) {
                if (this.options.delimiter.indexOf(String.fromCharCode(e.which)) >= 0) {
                    $delimiter = true;
                }
            } else {
                if (String.fromCharCode(e.which) == this.options.delimiter) {
                    $delimiter = true;
                }
            }

            if ($delimiter) {
                this.pressedDelimiter(e);
            }
        } else {
            e.preventDefault();
        }

    };

    Tokenize2.prototype.pressedDelimiter = function (e) {

        this.resetPending();
        if (this.isDropdownOpen() && $('li.active', this.dropdown).length > 0 && this.control === false) {
            e.preventDefault();
            $('li.active a', this.dropdown).trigger('mousedown');
        } else {
            if (this.input.val().length > 0) {
                e.preventDefault();
                this.trigger('tokenize:tokens:add', [this.input.val()]);
            }
        }

    };

    /**
     * Search value
     *
     * @param {string} v
     */
    Tokenize2.prototype.find = function (v) {

        if (v.length < this.options.searchMinLength) {
            this.trigger('tokenize:dropdown:hide');
            return false;
        }

        this.lastSearchTerms = v;

        if (this.options.dataSource === 'select') {
            this.dataSourceLocal(v);
        } else if (typeof this.options.dataSource === 'function') {
            this.options.dataSource(v, this);
        } else {
            this.dataSourceRemote(v);
        }

    };

    /**
     * Gets data from ajax
     *
     * @param {string} search
     */
    Tokenize2.prototype.dataSourceRemote = function (search) {

        this.debounce($.proxy(function () {
            if (this.xhr !== undefined) {
                this.xhr.abort();
            }
            this.xhr = $.ajax(this.options.dataSource, {
                data: { search: search },
                dataType: 'json',
                success: $.proxy(function (data) {
                    var $items = [];
                    $.each(data, function (k, v) {
                        $items.push(v);
                    });
                    this.trigger('tokenize:dropdown:fill', [$items]);
                }, this)
            });
        }, this), this.options.debounce);

    };

    /**
     * Gets data from select
     *
     * @param {string} search
     */
    Tokenize2.prototype.dataSourceLocal = function (search) {

        var $searchString = this.transliteration(search);
        var $items = [];
        var $pattern = (this.options.searchFromStart ? '^' : '') + this.escapeRegex($searchString);
        var $regexp = new RegExp($pattern, 'i');
        var $this = this;

        $('option', this.element)
            .not(':selected, :disabled')
            .each(function () {
                if ($regexp.test($this.transliteration($(this).html()))) {
                    $items.push({ value: $(this).attr('value'), text: $(this).html() });
                }
            });

        this.trigger('tokenize:dropdown:fill', [$items]);

    };

    /**
     * Debounce method for ajax request
     *
     * @param {function} func
     * @param {number} threshold
     */
    Tokenize2.prototype.debounce = function (func, threshold) {

        var $args = arguments;
        var $delayed = $.proxy(function () {
            func.apply(this, $args);
            this.debounceTimeout = undefined;
        }, this);

        if (this.debounceTimeout !== undefined) {
            clearTimeout(this.debounceTimeout);
        }

        this.debounceTimeout = setTimeout($delayed, threshold || 0);

    };

    /**
     * Show dropdown
     */
    Tokenize2.prototype.dropdownShow = function () {

        if (!this.isDropdownOpen()) {
            $('.tokenize-dropdown').remove();
            this.dropdown = $('<div class="tokenize-dropdown dropdown"><ul class="dropdown-menu" /></div>').attr('data-related', this.id);
            $('body').append(this.dropdown);
            this.dropdown.show();
            $(window).on('resize scroll', {}, $.proxy(function () { this.dropdownMove() }, this)).trigger('resize');
            this.trigger('tokenize:dropdown:shown');
        }

    };

    /**
     * Hide dropdown
     */
    Tokenize2.prototype.dropdownHide = function () {

        if (this.isDropdownOpen()) {
            $(window).off('resize scroll');
            this.dropdown.remove();
            this.dropdown = undefined;
            this.trigger('tokenize:dropdown:hidden');
        }

    };

    /**
     * Clear dropdown
     */
    Tokenize2.prototype.dropdownClear = function () {

        this.dropdown.find('.dropdown-menu li').remove();

    };

    /**
     * Fill dropdown with options
     *
     * @param {object} items
     */
    Tokenize2.prototype.dropdownFill = function (items) {

        if (items && items.length > 0) {
            this.trigger('tokenize:dropdown:show');
            this.trigger('tokenize:dropdown:clear');

            $.each(items, $.proxy(function (k, v) {
                if ($('li.dropdown-item', this.dropdown).length <= this.options.dropdownMaxItems) {
                    this.trigger('tokenize:dropdown:itemAdd', [v]);
                }
            }, this));

            if ($('li.active', this.dropdown).length < 1) {
                $('li:first', this.dropdown).addClass('active');
            }

            if ($('li.dropdown-item', this.dropdown).length < 1) {
                this.trigger('tokenize:dropdown:hide');
            } else {
                this.trigger('tokenize:dropdown:filled');
            }
        } else {
            this.trigger('tokenize:dropdown:hide');
        }

        // Fix the dropdown position when page start scroll
        $(window).trigger('resize');

    };

    /**
     * Move selection through dropdown items
     * @param {int} d
     */
    Tokenize2.prototype.dropdownSelectionMove = function (d) {

        if ($('li.active', this.dropdown).length > 0) {
            if (!$('li.active', this.dropdown).is('li:' + (d > 0 ? 'last-child' : 'first-child'))) {
                var $active = $('li.active', this.dropdown);
                $active.removeClass('active');
                if (d > 0) {
                    $active.next().addClass('active');
                } else {
                    $active.prev().addClass('active');
                }
            } else {
                $('li.active', this.dropdown).removeClass('active');
                $('li:' + (d > 0 ? 'first-child' : 'last-child'), this.dropdown).addClass('active');
            }
        } else {
            $('li:first', this.dropdown).addClass('active');
        }

    };

    /**
     * Add dropdown item
     *
     * @param {object} item
     */
    Tokenize2.prototype.dropdownAddItem = function (item) {

        if (this.isDropdownOpen()) {
            var $li = $('<li class="dropdown-item" />').html(this.dropdownItemFormat(item))
                .on('mouseover', $.proxy(function (e) {
                    e.preventDefault();
                    e.target = this.fixTarget(e.target);
                    $('li', this.dropdown).removeClass('active');
                    $(e.target).parent().addClass('active');
                }, this)).on('mouseout', $.proxy(function () {
                    $('li', this.dropdown).removeClass('active');
                }, this)).on('mousedown touchstart', $.proxy(function (e) {
                    e.preventDefault();
                    e.target = this.fixTarget(e.target);
                    this.trigger('tokenize:tokens:add', [$(e.target).attr('data-value'), $(e.target).attr('data-text'), true]);
                }, this));
            if ($('li.token[data-value="' + $li.find('a').attr('data-value') + '"]', this.tokensContainer).length < 1) {
                this.dropdown.find('.dropdown-menu').append($li);
                this.trigger('tokenize:dropdown:itemAdded', [item]);
            }
        }

    };

    /**
     * Fix target for hover and click event on dropdown items
     *
     * @param {string} target
     * @returns {string}
     */
    Tokenize2.prototype.fixTarget = function (target) {

        if (!$(target).data('value')) {
            target = $(target).find('a');
            if (!$(target).data('value')) {
                target = $(target).parents('[data-value]').get(0);
            }
        }
        return target;

    };

    /**
     * Format dropdown item
     *
     * @param {object} item
     * @returns {object|jQuery}
     */
    Tokenize2.prototype.dropdownItemFormat = function (item) {

        var $display = '';
        if (this.options.searchHighlight) {
            var $regex = new RegExp((this.options.searchFromStart ? '^' : '') + '(' + this.escapeRegex(this.transliteration(this.lastSearchTerms)) + ')', 'gi');
            $display = item.text.replace($regex, '<span class="tokenize-highlight">$1</span>');
        } else {
            $display = item.text;
        }

        return $('<a />').html($display).attr({
            'data-value': item.value,
            'data-text': item.text
        });

    };

    /**
     * Move dropdown according tokens container
     */
    Tokenize2.prototype.dropdownMove = function () {

        var $position = this.tokensContainer.offset();
        var $height = this.tokensContainer.outerHeight();
        var $width = this.tokensContainer.outerWidth();

        this.dropdown.css({
            top: $position.top + $height,
            left: $position.left - $(window).scrollLeft(),
            width: $width
        });

    };

    /**
     * Returns the current status of the dropdown
     *
     * @returns {boolean}
     */
    Tokenize2.prototype.isDropdownOpen = function () {

        return (this.dropdown !== undefined);

    };

    /**
     * Clear control
     *
     * @returns {Tokenize2}
     */
    Tokenize2.prototype.clear = function () {

        $.each($('li.token', this.tokensContainer), $.proxy(function (e, item) {
            this.trigger('tokenize:tokens:remove', [$(item).attr('data-value')]);
        }, this));

        this.trigger('tokenize:dropdown:hide');

        return this;

    };

    /**
     * Reset pending delete tokens
     */
    Tokenize2.prototype.resetPending = function () {

        var $token = $('li.pending-delete:last', this.tokensContainer);

        if ($token.length > 0) {
            this.trigger('tokenize:tokens:cancelDelete', [$token.attr('data-value')]);
            $token.removeClass('pending-delete');
        }

    };

    /**
     * Scale input
     */
    Tokenize2.prototype.scaleInput = function () {

        if (!this.ctx) {
            this.ctx = document.createElement('canvas').getContext('2d');
        }

        var $width, $tokensContainerWidth;

        this.ctx.font = this.input.css('font-style') + ' ' +
            this.input.css('font-variant') + ' ' +
            this.input.css('font-weight') + ' ' +
            Math.ceil(parseFloat(this.input.css('font-size'))) + 'px ' +
            this.input.css('font-family');

        $width = Math.round(this.ctx.measureText(this.input.val() + 'M').width) + Math.ceil(parseFloat(this.searchContainer.css('margin-left'))) + Math.ceil(parseFloat(this.searchContainer.css('margin-right')));
        $tokensContainerWidth = this.tokensContainer.width() -
            (
                Math.ceil(parseFloat(this.tokensContainer.css('border-left-width'))) + Math.ceil(parseFloat(this.tokensContainer.css('border-right-width')) +
                    Math.ceil(parseFloat(this.tokensContainer.css('padding-left'))) + Math.ceil(parseFloat(this.tokensContainer.css('padding-right'))))
            );

        if ($width >= $tokensContainerWidth) {
            $width = $tokensContainerWidth;
        }

        this.searchContainer.width($width);
        this.ctx.restore();

    };

    /**
     * Reset input
     */
    Tokenize2.prototype.resetInput = function () {

        this.input.val('');
        this.scaleInput();

    };

    /**
     * Escape string
     *
     * @param {string} string
     * @returns {string}
     */
    Tokenize2.prototype.escape = function (string) {

        var $escaping = document.createElement('div');
        $escaping.innerHTML = string;
        string = ($escaping.textContent || $escaping.innerText || '');
        return String(string).replace(/["]/g, function () {
            return '\"';
        });

    };

    /**
     * Escape regex
     *
     * @param {string} value
     * @returns {string}
     */
    Tokenize2.prototype.escapeRegex = function (value) {

        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");

    };

    /**
     * Generates guid
     *
     * @returns {string}
     */
    Tokenize2.prototype.guid = function () {

        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();

    };

    /**
     * Retrieve tokens value to an array
     *
     * @returns {Array}
     */
    Tokenize2.prototype.toArray = function () {

        var $output = [];
        $("option:selected", this.element).each(function () {
            $output.push($(this).val());
        });
        return $output;

    };

    Tokenize2.prototype.transliteration = function (text) {
        var diacritics = {
            '\u24B6': 'A',
            '\uFF21': 'A',
            '\u00C0': 'A',
            '\u00C1': 'A',
            '\u00C2': 'A',
            '\u1EA6': 'A',
            '\u1EA4': 'A',
            '\u1EAA': 'A',
            '\u1EA8': 'A',
            '\u00C3': 'A',
            '\u0100': 'A',
            '\u0102': 'A',
            '\u1EB0': 'A',
            '\u1EAE': 'A',
            '\u1EB4': 'A',
            '\u1EB2': 'A',
            '\u0226': 'A',
            '\u01E0': 'A',
            '\u00C4': 'A',
            '\u01DE': 'A',
            '\u1EA2': 'A',
            '\u00C5': 'A',
            '\u01FA': 'A',
            '\u01CD': 'A',
            '\u0200': 'A',
            '\u0202': 'A',
            '\u1EA0': 'A',
            '\u1EAC': 'A',
            '\u1EB6': 'A',
            '\u1E00': 'A',
            '\u0104': 'A',
            '\u023A': 'A',
            '\u2C6F': 'A',
            '\uA732': 'AA',
            '\u00C6': 'AE',
            '\u01FC': 'AE',
            '\u01E2': 'AE',
            '\uA734': 'AO',
            '\uA736': 'AU',
            '\uA738': 'AV',
            '\uA73A': 'AV',
            '\uA73C': 'AY',
            '\u24B7': 'B',
            '\uFF22': 'B',
            '\u1E02': 'B',
            '\u1E04': 'B',
            '\u1E06': 'B',
            '\u0243': 'B',
            '\u0182': 'B',
            '\u0181': 'B',
            '\u24B8': 'C',
            '\uFF23': 'C',
            '\u0106': 'C',
            '\u0108': 'C',
            '\u010A': 'C',
            '\u010C': 'C',
            '\u00C7': 'C',
            '\u1E08': 'C',
            '\u0187': 'C',
            '\u023B': 'C',
            '\uA73E': 'C',
            '\u24B9': 'D',
            '\uFF24': 'D',
            '\u1E0A': 'D',
            '\u010E': 'D',
            '\u1E0C': 'D',
            '\u1E10': 'D',
            '\u1E12': 'D',
            '\u1E0E': 'D',
            '\u0110': 'D',
            '\u018B': 'D',
            '\u018A': 'D',
            '\u0189': 'D',
            '\uA779': 'D',
            '\u01F1': 'DZ',
            '\u01C4': 'DZ',
            '\u01F2': 'Dz',
            '\u01C5': 'Dz',
            '\u24BA': 'E',
            '\uFF25': 'E',
            '\u00C8': 'E',
            '\u00C9': 'E',
            '\u00CA': 'E',
            '\u1EC0': 'E',
            '\u1EBE': 'E',
            '\u1EC4': 'E',
            '\u1EC2': 'E',
            '\u1EBC': 'E',
            '\u0112': 'E',
            '\u1E14': 'E',
            '\u1E16': 'E',
            '\u0114': 'E',
            '\u0116': 'E',
            '\u00CB': 'E',
            '\u1EBA': 'E',
            '\u011A': 'E',
            '\u0204': 'E',
            '\u0206': 'E',
            '\u1EB8': 'E',
            '\u1EC6': 'E',
            '\u0228': 'E',
            '\u1E1C': 'E',
            '\u0118': 'E',
            '\u1E18': 'E',
            '\u1E1A': 'E',
            '\u0190': 'E',
            '\u018E': 'E',
            '\u24BB': 'F',
            '\uFF26': 'F',
            '\u1E1E': 'F',
            '\u0191': 'F',
            '\uA77B': 'F',
            '\u24BC': 'G',
            '\uFF27': 'G',
            '\u01F4': 'G',
            '\u011C': 'G',
            '\u1E20': 'G',
            '\u011E': 'G',
            '\u0120': 'G',
            '\u01E6': 'G',
            '\u0122': 'G',
            '\u01E4': 'G',
            '\u0193': 'G',
            '\uA7A0': 'G',
            '\uA77D': 'G',
            '\uA77E': 'G',
            '\u24BD': 'H',
            '\uFF28': 'H',
            '\u0124': 'H',
            '\u1E22': 'H',
            '\u1E26': 'H',
            '\u021E': 'H',
            '\u1E24': 'H',
            '\u1E28': 'H',
            '\u1E2A': 'H',
            '\u0126': 'H',
            '\u2C67': 'H',
            '\u2C75': 'H',
            '\uA78D': 'H',
            '\u24BE': 'I',
            '\uFF29': 'I',
            '\u00CC': 'I',
            '\u00CD': 'I',
            '\u00CE': 'I',
            '\u0128': 'I',
            '\u012A': 'I',
            '\u012C': 'I',
            '\u0130': 'I',
            '\u00CF': 'I',
            '\u1E2E': 'I',
            '\u1EC8': 'I',
            '\u01CF': 'I',
            '\u0208': 'I',
            '\u020A': 'I',
            '\u1ECA': 'I',
            '\u012E': 'I',
            '\u1E2C': 'I',
            '\u0197': 'I',
            '\u24BF': 'J',
            '\uFF2A': 'J',
            '\u0134': 'J',
            '\u0248': 'J',
            '\u24C0': 'K',
            '\uFF2B': 'K',
            '\u1E30': 'K',
            '\u01E8': 'K',
            '\u1E32': 'K',
            '\u0136': 'K',
            '\u1E34': 'K',
            '\u0198': 'K',
            '\u2C69': 'K',
            '\uA740': 'K',
            '\uA742': 'K',
            '\uA744': 'K',
            '\uA7A2': 'K',
            '\u24C1': 'L',
            '\uFF2C': 'L',
            '\u013F': 'L',
            '\u0139': 'L',
            '\u013D': 'L',
            '\u1E36': 'L',
            '\u1E38': 'L',
            '\u013B': 'L',
            '\u1E3C': 'L',
            '\u1E3A': 'L',
            '\u0141': 'L',
            '\u023D': 'L',
            '\u2C62': 'L',
            '\u2C60': 'L',
            '\uA748': 'L',
            '\uA746': 'L',
            '\uA780': 'L',
            '\u01C7': 'LJ',
            '\u01C8': 'Lj',
            '\u24C2': 'M',
            '\uFF2D': 'M',
            '\u1E3E': 'M',
            '\u1E40': 'M',
            '\u1E42': 'M',
            '\u2C6E': 'M',
            '\u019C': 'M',
            '\u24C3': 'N',
            '\uFF2E': 'N',
            '\u01F8': 'N',
            '\u0143': 'N',
            '\u00D1': 'N',
            '\u1E44': 'N',
            '\u0147': 'N',
            '\u1E46': 'N',
            '\u0145': 'N',
            '\u1E4A': 'N',
            '\u1E48': 'N',
            '\u0220': 'N',
            '\u019D': 'N',
            '\uA790': 'N',
            '\uA7A4': 'N',
            '\u01CA': 'NJ',
            '\u01CB': 'Nj',
            '\u24C4': 'O',
            '\uFF2F': 'O',
            '\u00D2': 'O',
            '\u00D3': 'O',
            '\u00D4': 'O',
            '\u1ED2': 'O',
            '\u1ED0': 'O',
            '\u1ED6': 'O',
            '\u1ED4': 'O',
            '\u00D5': 'O',
            '\u1E4C': 'O',
            '\u022C': 'O',
            '\u1E4E': 'O',
            '\u014C': 'O',
            '\u1E50': 'O',
            '\u1E52': 'O',
            '\u014E': 'O',
            '\u022E': 'O',
            '\u0230': 'O',
            '\u00D6': 'O',
            '\u022A': 'O',
            '\u1ECE': 'O',
            '\u0150': 'O',
            '\u01D1': 'O',
            '\u020C': 'O',
            '\u020E': 'O',
            '\u01A0': 'O',
            '\u1EDC': 'O',
            '\u1EDA': 'O',
            '\u1EE0': 'O',
            '\u1EDE': 'O',
            '\u1EE2': 'O',
            '\u1ECC': 'O',
            '\u1ED8': 'O',
            '\u01EA': 'O',
            '\u01EC': 'O',
            '\u00D8': 'O',
            '\u01FE': 'O',
            '\u0186': 'O',
            '\u019F': 'O',
            '\uA74A': 'O',
            '\uA74C': 'O',
            '\u01A2': 'OI',
            '\uA74E': 'OO',
            '\u0222': 'OU',
            '\u24C5': 'P',
            '\uFF30': 'P',
            '\u1E54': 'P',
            '\u1E56': 'P',
            '\u01A4': 'P',
            '\u2C63': 'P',
            '\uA750': 'P',
            '\uA752': 'P',
            '\uA754': 'P',
            '\u24C6': 'Q',
            '\uFF31': 'Q',
            '\uA756': 'Q',
            '\uA758': 'Q',
            '\u024A': 'Q',
            '\u24C7': 'R',
            '\uFF32': 'R',
            '\u0154': 'R',
            '\u1E58': 'R',
            '\u0158': 'R',
            '\u0210': 'R',
            '\u0212': 'R',
            '\u1E5A': 'R',
            '\u1E5C': 'R',
            '\u0156': 'R',
            '\u1E5E': 'R',
            '\u024C': 'R',
            '\u2C64': 'R',
            '\uA75A': 'R',
            '\uA7A6': 'R',
            '\uA782': 'R',
            '\u24C8': 'S',
            '\uFF33': 'S',
            '\u1E9E': 'S',
            '\u015A': 'S',
            '\u1E64': 'S',
            '\u015C': 'S',
            '\u1E60': 'S',
            '\u0160': 'S',
            '\u1E66': 'S',
            '\u1E62': 'S',
            '\u1E68': 'S',
            '\u0218': 'S',
            '\u015E': 'S',
            '\u2C7E': 'S',
            '\uA7A8': 'S',
            '\uA784': 'S',
            '\u24C9': 'T',
            '\uFF34': 'T',
            '\u1E6A': 'T',
            '\u0164': 'T',
            '\u1E6C': 'T',
            '\u021A': 'T',
            '\u0162': 'T',
            '\u1E70': 'T',
            '\u1E6E': 'T',
            '\u0166': 'T',
            '\u01AC': 'T',
            '\u01AE': 'T',
            '\u023E': 'T',
            '\uA786': 'T',
            '\uA728': 'TZ',
            '\u24CA': 'U',
            '\uFF35': 'U',
            '\u00D9': 'U',
            '\u00DA': 'U',
            '\u00DB': 'U',
            '\u0168': 'U',
            '\u1E78': 'U',
            '\u016A': 'U',
            '\u1E7A': 'U',
            '\u016C': 'U',
            '\u00DC': 'U',
            '\u01DB': 'U',
            '\u01D7': 'U',
            '\u01D5': 'U',
            '\u01D9': 'U',
            '\u1EE6': 'U',
            '\u016E': 'U',
            '\u0170': 'U',
            '\u01D3': 'U',
            '\u0214': 'U',
            '\u0216': 'U',
            '\u01AF': 'U',
            '\u1EEA': 'U',
            '\u1EE8': 'U',
            '\u1EEE': 'U',
            '\u1EEC': 'U',
            '\u1EF0': 'U',
            '\u1EE4': 'U',
            '\u1E72': 'U',
            '\u0172': 'U',
            '\u1E76': 'U',
            '\u1E74': 'U',
            '\u0244': 'U',
            '\u24CB': 'V',
            '\uFF36': 'V',
            '\u1E7C': 'V',
            '\u1E7E': 'V',
            '\u01B2': 'V',
            '\uA75E': 'V',
            '\u0245': 'V',
            '\uA760': 'VY',
            '\u24CC': 'W',
            '\uFF37': 'W',
            '\u1E80': 'W',
            '\u1E82': 'W',
            '\u0174': 'W',
            '\u1E86': 'W',
            '\u1E84': 'W',
            '\u1E88': 'W',
            '\u2C72': 'W',
            '\u24CD': 'X',
            '\uFF38': 'X',
            '\u1E8A': 'X',
            '\u1E8C': 'X',
            '\u24CE': 'Y',
            '\uFF39': 'Y',
            '\u1EF2': 'Y',
            '\u00DD': 'Y',
            '\u0176': 'Y',
            '\u1EF8': 'Y',
            '\u0232': 'Y',
            '\u1E8E': 'Y',
            '\u0178': 'Y',
            '\u1EF6': 'Y',
            '\u1EF4': 'Y',
            '\u01B3': 'Y',
            '\u024E': 'Y',
            '\u1EFE': 'Y',
            '\u24CF': 'Z',
            '\uFF3A': 'Z',
            '\u0179': 'Z',
            '\u1E90': 'Z',
            '\u017B': 'Z',
            '\u017D': 'Z',
            '\u1E92': 'Z',
            '\u1E94': 'Z',
            '\u01B5': 'Z',
            '\u0224': 'Z',
            '\u2C7F': 'Z',
            '\u2C6B': 'Z',
            '\uA762': 'Z',
            '\u24D0': 'a',
            '\uFF41': 'a',
            '\u1E9A': 'a',
            '\u00E0': 'a',
            '\u00E1': 'a',
            '\u00E2': 'a',
            '\u1EA7': 'a',
            '\u1EA5': 'a',
            '\u1EAB': 'a',
            '\u1EA9': 'a',
            '\u00E3': 'a',
            '\u0101': 'a',
            '\u0103': 'a',
            '\u1EB1': 'a',
            '\u1EAF': 'a',
            '\u1EB5': 'a',
            '\u1EB3': 'a',
            '\u0227': 'a',
            '\u01E1': 'a',
            '\u00E4': 'a',
            '\u01DF': 'a',
            '\u1EA3': 'a',
            '\u00E5': 'a',
            '\u01FB': 'a',
            '\u01CE': 'a',
            '\u0201': 'a',
            '\u0203': 'a',
            '\u1EA1': 'a',
            '\u1EAD': 'a',
            '\u1EB7': 'a',
            '\u1E01': 'a',
            '\u0105': 'a',
            '\u2C65': 'a',
            '\u0250': 'a',
            '\uA733': 'aa',
            '\u00E6': 'ae',
            '\u01FD': 'ae',
            '\u01E3': 'ae',
            '\uA735': 'ao',
            '\uA737': 'au',
            '\uA739': 'av',
            '\uA73B': 'av',
            '\uA73D': 'ay',
            '\u24D1': 'b',
            '\uFF42': 'b',
            '\u1E03': 'b',
            '\u1E05': 'b',
            '\u1E07': 'b',
            '\u0180': 'b',
            '\u0183': 'b',
            '\u0253': 'b',
            '\u24D2': 'c',
            '\uFF43': 'c',
            '\u0107': 'c',
            '\u0109': 'c',
            '\u010B': 'c',
            '\u010D': 'c',
            '\u00E7': 'c',
            '\u1E09': 'c',
            '\u0188': 'c',
            '\u023C': 'c',
            '\uA73F': 'c',
            '\u2184': 'c',
            '\u24D3': 'd',
            '\uFF44': 'd',
            '\u1E0B': 'd',
            '\u010F': 'd',
            '\u1E0D': 'd',
            '\u1E11': 'd',
            '\u1E13': 'd',
            '\u1E0F': 'd',
            '\u0111': 'd',
            '\u018C': 'd',
            '\u0256': 'd',
            '\u0257': 'd',
            '\uA77A': 'd',
            '\u01F3': 'dz',
            '\u01C6': 'dz',
            '\u24D4': 'e',
            '\uFF45': 'e',
            '\u00E8': 'e',
            '\u00E9': 'e',
            '\u00EA': 'e',
            '\u1EC1': 'e',
            '\u1EBF': 'e',
            '\u1EC5': 'e',
            '\u1EC3': 'e',
            '\u1EBD': 'e',
            '\u0113': 'e',
            '\u1E15': 'e',
            '\u1E17': 'e',
            '\u0115': 'e',
            '\u0117': 'e',
            '\u00EB': 'e',
            '\u1EBB': 'e',
            '\u011B': 'e',
            '\u0205': 'e',
            '\u0207': 'e',
            '\u1EB9': 'e',
            '\u1EC7': 'e',
            '\u0229': 'e',
            '\u1E1D': 'e',
            '\u0119': 'e',
            '\u1E19': 'e',
            '\u1E1B': 'e',
            '\u0247': 'e',
            '\u025B': 'e',
            '\u01DD': 'e',
            '\u24D5': 'f',
            '\uFF46': 'f',
            '\u1E1F': 'f',
            '\u0192': 'f',
            '\uA77C': 'f',
            '\u24D6': 'g',
            '\uFF47': 'g',
            '\u01F5': 'g',
            '\u011D': 'g',
            '\u1E21': 'g',
            '\u011F': 'g',
            '\u0121': 'g',
            '\u01E7': 'g',
            '\u0123': 'g',
            '\u01E5': 'g',
            '\u0260': 'g',
            '\uA7A1': 'g',
            '\u1D79': 'g',
            '\uA77F': 'g',
            '\u24D7': 'h',
            '\uFF48': 'h',
            '\u0125': 'h',
            '\u1E23': 'h',
            '\u1E27': 'h',
            '\u021F': 'h',
            '\u1E25': 'h',
            '\u1E29': 'h',
            '\u1E2B': 'h',
            '\u1E96': 'h',
            '\u0127': 'h',
            '\u2C68': 'h',
            '\u2C76': 'h',
            '\u0265': 'h',
            '\u0195': 'hv',
            '\u24D8': 'i',
            '\uFF49': 'i',
            '\u00EC': 'i',
            '\u00ED': 'i',
            '\u00EE': 'i',
            '\u0129': 'i',
            '\u012B': 'i',
            '\u012D': 'i',
            '\u00EF': 'i',
            '\u1E2F': 'i',
            '\u1EC9': 'i',
            '\u01D0': 'i',
            '\u0209': 'i',
            '\u020B': 'i',
            '\u1ECB': 'i',
            '\u012F': 'i',
            '\u1E2D': 'i',
            '\u0268': 'i',
            '\u0131': 'i',
            '\u24D9': 'j',
            '\uFF4A': 'j',
            '\u0135': 'j',
            '\u01F0': 'j',
            '\u0249': 'j',
            '\u24DA': 'k',
            '\uFF4B': 'k',
            '\u1E31': 'k',
            '\u01E9': 'k',
            '\u1E33': 'k',
            '\u0137': 'k',
            '\u1E35': 'k',
            '\u0199': 'k',
            '\u2C6A': 'k',
            '\uA741': 'k',
            '\uA743': 'k',
            '\uA745': 'k',
            '\uA7A3': 'k',
            '\u24DB': 'l',
            '\uFF4C': 'l',
            '\u0140': 'l',
            '\u013A': 'l',
            '\u013E': 'l',
            '\u1E37': 'l',
            '\u1E39': 'l',
            '\u013C': 'l',
            '\u1E3D': 'l',
            '\u1E3B': 'l',
            '\u017F': 'l',
            '\u0142': 'l',
            '\u019A': 'l',
            '\u026B': 'l',
            '\u2C61': 'l',
            '\uA749': 'l',
            '\uA781': 'l',
            '\uA747': 'l',
            '\u01C9': 'lj',
            '\u24DC': 'm',
            '\uFF4D': 'm',
            '\u1E3F': 'm',
            '\u1E41': 'm',
            '\u1E43': 'm',
            '\u0271': 'm',
            '\u026F': 'm',
            '\u24DD': 'n',
            '\uFF4E': 'n',
            '\u01F9': 'n',
            '\u0144': 'n',
            '\u00F1': 'n',
            '\u1E45': 'n',
            '\u0148': 'n',
            '\u1E47': 'n',
            '\u0146': 'n',
            '\u1E4B': 'n',
            '\u1E49': 'n',
            '\u019E': 'n',
            '\u0272': 'n',
            '\u0149': 'n',
            '\uA791': 'n',
            '\uA7A5': 'n',
            '\u01CC': 'nj',
            '\u24DE': 'o',
            '\uFF4F': 'o',
            '\u00F2': 'o',
            '\u00F3': 'o',
            '\u00F4': 'o',
            '\u1ED3': 'o',
            '\u1ED1': 'o',
            '\u1ED7': 'o',
            '\u1ED5': 'o',
            '\u00F5': 'o',
            '\u1E4D': 'o',
            '\u022D': 'o',
            '\u1E4F': 'o',
            '\u014D': 'o',
            '\u1E51': 'o',
            '\u1E53': 'o',
            '\u014F': 'o',
            '\u022F': 'o',
            '\u0231': 'o',
            '\u00F6': 'o',
            '\u022B': 'o',
            '\u1ECF': 'o',
            '\u0151': 'o',
            '\u01D2': 'o',
            '\u020D': 'o',
            '\u020F': 'o',
            '\u01A1': 'o',
            '\u1EDD': 'o',
            '\u1EDB': 'o',
            '\u1EE1': 'o',
            '\u1EDF': 'o',
            '\u1EE3': 'o',
            '\u1ECD': 'o',
            '\u1ED9': 'o',
            '\u01EB': 'o',
            '\u01ED': 'o',
            '\u00F8': 'o',
            '\u01FF': 'o',
            '\u0254': 'o',
            '\uA74B': 'o',
            '\uA74D': 'o',
            '\u0275': 'o',
            '\u01A3': 'oi',
            '\u0223': 'ou',
            '\uA74F': 'oo',
            '\u24DF': 'p',
            '\uFF50': 'p',
            '\u1E55': 'p',
            '\u1E57': 'p',
            '\u01A5': 'p',
            '\u1D7D': 'p',
            '\uA751': 'p',
            '\uA753': 'p',
            '\uA755': 'p',
            '\u24E0': 'q',
            '\uFF51': 'q',
            '\u024B': 'q',
            '\uA757': 'q',
            '\uA759': 'q',
            '\u24E1': 'r',
            '\uFF52': 'r',
            '\u0155': 'r',
            '\u1E59': 'r',
            '\u0159': 'r',
            '\u0211': 'r',
            '\u0213': 'r',
            '\u1E5B': 'r',
            '\u1E5D': 'r',
            '\u0157': 'r',
            '\u1E5F': 'r',
            '\u024D': 'r',
            '\u027D': 'r',
            '\uA75B': 'r',
            '\uA7A7': 'r',
            '\uA783': 'r',
            '\u24E2': 's',
            '\uFF53': 's',
            '\u00DF': 's',
            '\u015B': 's',
            '\u1E65': 's',
            '\u015D': 's',
            '\u1E61': 's',
            '\u0161': 's',
            '\u1E67': 's',
            '\u1E63': 's',
            '\u1E69': 's',
            '\u0219': 's',
            '\u015F': 's',
            '\u023F': 's',
            '\uA7A9': 's',
            '\uA785': 's',
            '\u1E9B': 's',
            '\u24E3': 't',
            '\uFF54': 't',
            '\u1E6B': 't',
            '\u1E97': 't',
            '\u0165': 't',
            '\u1E6D': 't',
            '\u021B': 't',
            '\u0163': 't',
            '\u1E71': 't',
            '\u1E6F': 't',
            '\u0167': 't',
            '\u01AD': 't',
            '\u0288': 't',
            '\u2C66': 't',
            '\uA787': 't',
            '\uA729': 'tz',
            '\u24E4': 'u',
            '\uFF55': 'u',
            '\u00F9': 'u',
            '\u00FA': 'u',
            '\u00FB': 'u',
            '\u0169': 'u',
            '\u1E79': 'u',
            '\u016B': 'u',
            '\u1E7B': 'u',
            '\u016D': 'u',
            '\u00FC': 'u',
            '\u01DC': 'u',
            '\u01D8': 'u',
            '\u01D6': 'u',
            '\u01DA': 'u',
            '\u1EE7': 'u',
            '\u016F': 'u',
            '\u0171': 'u',
            '\u01D4': 'u',
            '\u0215': 'u',
            '\u0217': 'u',
            '\u01B0': 'u',
            '\u1EEB': 'u',
            '\u1EE9': 'u',
            '\u1EEF': 'u',
            '\u1EED': 'u',
            '\u1EF1': 'u',
            '\u1EE5': 'u',
            '\u1E73': 'u',
            '\u0173': 'u',
            '\u1E77': 'u',
            '\u1E75': 'u',
            '\u0289': 'u',
            '\u24E5': 'v',
            '\uFF56': 'v',
            '\u1E7D': 'v',
            '\u1E7F': 'v',
            '\u028B': 'v',
            '\uA75F': 'v',
            '\u028C': 'v',
            '\uA761': 'vy',
            '\u24E6': 'w',
            '\uFF57': 'w',
            '\u1E81': 'w',
            '\u1E83': 'w',
            '\u0175': 'w',
            '\u1E87': 'w',
            '\u1E85': 'w',
            '\u1E98': 'w',
            '\u1E89': 'w',
            '\u2C73': 'w',
            '\u24E7': 'x',
            '\uFF58': 'x',
            '\u1E8B': 'x',
            '\u1E8D': 'x',
            '\u24E8': 'y',
            '\uFF59': 'y',
            '\u1EF3': 'y',
            '\u00FD': 'y',
            '\u0177': 'y',
            '\u1EF9': 'y',
            '\u0233': 'y',
            '\u1E8F': 'y',
            '\u00FF': 'y',
            '\u1EF7': 'y',
            '\u1E99': 'y',
            '\u1EF5': 'y',
            '\u01B4': 'y',
            '\u024F': 'y',
            '\u1EFF': 'y',
            '\u24E9': 'z',
            '\uFF5A': 'z',
            '\u017A': 'z',
            '\u1E91': 'z',
            '\u017C': 'z',
            '\u017E': 'z',
            '\u1E93': 'z',
            '\u1E95': 'z',
            '\u01B6': 'z',
            '\u0225': 'z',
            '\u0240': 'z',
            '\u2C6C': 'z',
            '\uA763': 'z',
            '\u0386': '\u0391',
            '\u0388': '\u0395',
            '\u0389': '\u0397',
            '\u038A': '\u0399',
            '\u03AA': '\u0399',
            '\u038C': '\u039F',
            '\u038E': '\u03A5',
            '\u03AB': '\u03A5',
            '\u038F': '\u03A9',
            '\u03AC': '\u03B1',
            '\u03AD': '\u03B5',
            '\u03AE': '\u03B7',
            '\u03AF': '\u03B9',
            '\u03CA': '\u03B9',
            '\u0390': '\u03B9',
            '\u03CC': '\u03BF',
            '\u03CD': '\u03C5',
            '\u03CB': '\u03C5',
            '\u03B0': '\u03C5',
            '\u03C9': '\u03C9',
            '\u03C2': '\u03C3'
        };

        var $match = function (a) {
            return diacritics[a] || a;
        };

        return text.replace(/[^\u0000-\u007E]/g, $match);
    };

    /**
     * Tokenize plugin main function
     *
     * @param {object} options
     * @returns {object|Tokenize2|Array}
     */
    function Plugin(options) {

        var $items = [];
        this.filter('select').each(function () {
            var $this = $(this);
            var $data = $this.data('tokenize2');
            var $options = typeof options == 'object' && options;
            if (!$data) {
                $this.data('tokenize2', new Tokenize2(this, $options));
            }
            $items.push($this.data('tokenize2'));
        });

        if ($items.length > 1) {
            return $items;
        } else {
            return $items[0];
        }
    }

    var old = $.fn.tokenize2;

    /**
     * jQuery plugin entry
     */
    $.fn.tokenize2 = Plugin;
    $.fn.tokenize2.Constructor = Tokenize2;
    $.fn.tokenize2.noConflict = function () {
        $.fn.tokenize2 = old;
        return this;
    }

}));