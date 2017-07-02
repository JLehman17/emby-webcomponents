﻿define(['layoutManager', 'dom', 'css!./emby-scrollbuttons', 'registerElement', 'paper-icon-button-light'], function (layoutManager, dom) {
    'use strict';

    var EmbyScrollButtonsPrototype = Object.create(HTMLDivElement.prototype);

    EmbyScrollButtonsPrototype.createdCallback = function () {

    };

    function getScrollButtonContainerHtml(direction) {

        var html = '';

        var hide = direction === 'left' ? ' hide' : '';
        html += '<div class="scrollbuttoncontainer scrollbuttoncontainer-' + direction + hide + '">';

        var icon = direction === 'left' ? '&#xE5CB;' : '&#xE5CC;';

        html += '<button type="button" is="paper-icon-button-light" data-ripple="false" data-direction="' + direction + '" class="emby-scrollbuttons-scrollbutton">';
        html += '<i class="md-icon">' + icon + '</i>';
        html += '</button>';

        html += '</div>';

        return html;
    }

    function getScrollPosition(parent) {

        if (parent.getScrollPosition) {
            return parent.getScrollPosition();
        }

        var pageXOffset = parent.pageXOffset;
        if (pageXOffset !== undefined) {
            return pageXOffset;
        }

        var scrollLeft = parent.scrollLeft;
        if (scrollLeft !== undefined) {
            return scrollLeft;
        }

        return 0;
    }

    function onScrolledToPosition(scrollButtons, pos) {

        if (pos > 0) {
            scrollButtons.scrollButtonsLeft.classList.remove('hide');
        } else {
            scrollButtons.scrollButtonsLeft.classList.add('hide');
        }
        console.log(pos);
    }

    function onScroll(e) {

        var scrollButtons = this;
        var scroller = this.scroller;
        var pos = getScrollPosition(scroller);

        onScrolledToPosition(scrollButtons, pos);
    }

    function getStyleValue(style, name) {

        var value = style.getPropertyValue(name);

        if (!value) {
            return 0;
        }

        value = value.replace('px', '');

        if (!value) {
            return 0;
        }

        value = parseInt(value);
        if (isNaN(value)) {
            return 0;
        }

        return value;
    }

    function getScrollSize(elem) {

        var scrollSize = elem.offsetWidth;

        var style = window.getComputedStyle(elem, null);

        var paddingLeft = getStyleValue(style, 'padding-left');

        if (paddingLeft) {
            scrollSize -= paddingLeft;
        }
        var paddingRight = getStyleValue(style, 'padding-right');

        if (paddingRight) {
            scrollSize -= paddingRight;
        }

        var slider = elem.getScrollSlider();
        style = window.getComputedStyle(slider, null);

        paddingLeft = getStyleValue(style, 'padding-left');

        if (paddingLeft) {
            scrollSize -= paddingLeft;
        }
        paddingRight = getStyleValue(style, 'padding-right');

        if (paddingRight) {
            scrollSize -= paddingRight;
        }

        return scrollSize;
    }

    function onScrollButtonClick(e) {

        var parent = dom.parentWithAttribute(this, 'is', 'emby-scroller');

        var direction = this.getAttribute('data-direction');

        var scrollSize = getScrollSize(parent);

        var pos = getScrollPosition(parent);
        var newPos;

        if (direction === 'left') {
            newPos = Math.max(0, pos - scrollSize);
        } else {
            newPos = pos + scrollSize;
        }

        parent.scrollToPosition(newPos, false);
    }

    EmbyScrollButtonsPrototype.attachedCallback = function () {

        var parent = dom.parentWithAttribute(this, 'is', 'emby-scroller');
        this.scroller = parent;

        parent.classList.add('emby-scrollbuttons-scroller');

        this.innerHTML = getScrollButtonContainerHtml('left') + getScrollButtonContainerHtml('right');

        var scrollEventName = parent.getScrollEventName ? parent.getScrollEventName() : 'scroll';

        var scrollHandler = onScroll.bind(this);
        this.scrollHandler = scrollHandler;
        this.scrollEventName = scrollEventName;

        var buttons = this.querySelectorAll('.emby-scrollbuttons-scrollbutton');
        buttons[0].addEventListener('click', onScrollButtonClick);
        buttons[1].addEventListener('click', onScrollButtonClick);

        buttons = this.querySelectorAll('.scrollbuttoncontainer');
        this.scrollButtonsLeft = buttons[0];
        this.scrollButtonsRight = buttons[1];

        dom.addEventListener(parent, scrollEventName, scrollHandler, {
            capture: false,
            passive: true
        });
    };

    EmbyScrollButtonsPrototype.detachedCallback = function () {

        var parent = this.scroller;
        this.scroller = null;

        var scrollHandler = this.scrollHandler;
        var scrollEventName = this.scrollEventName;

        if (parent && scrollHandler) {
            dom.removeEventListener(parent, scrollEventName, scrollHandler, {
                capture: false,
                passive: true
            });
        }

        this.scrollHandler = null;
        this.scrollEventName = null;
        this.scrollButtonsLeft = null;
        this.scrollButtonsRight = null;
    };

    document.registerElement('emby-scrollbuttons', {
        prototype: EmbyScrollButtonsPrototype,
        extends: 'div'
    });
});