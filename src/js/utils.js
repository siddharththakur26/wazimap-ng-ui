import {format as d3format} from 'd3-format';

const queryCache = {};

export class Cache {
    constructor() {
        this.memoryCache = {}

    }

    getItem(key) {
        const val = localStorage.getItem(key);
        if (val != null)
            return JSON.parse(val);

        if (this.memoryCache[key] != undefined)
            return this.memoryCache[key]

        return null;
    }

    setItem(key, val) {
        try {
            localStorage.setItem(key, JSON.stringify(val));
        } catch (err) {
            console.log(`Error using localstorage, reverting to memory cache: ${err}`)
            this.memoryCache[key] = val;
        }
    }
}

const cache = new Cache();

export function getJSON(url, skipCache = true) {

    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = () => {
            if (req.status == 200) {
                const json = JSON.parse(req.response);
                resolve(json);
            } else if (req.status == 401 || request.status == 403) {
                alert("Not logged in")
            } else {
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = () => {
            reject(Error("Network Error"));
        };

        req.send();
    });
}

export function setPopupStyle(clsName) {
    $('.leaflet-popup-close-button').html($('.facility-tooltip__close').html());
    $('.leaflet-popup-close-button').css('padding', 0);
    $('.facility-tooltip__close').css('display', 'none');
    $('.leaflet-popup-content-wrapper').css('border-radius', $('.' + clsName).css('border-radius'));
    $('.leaflet-popup-content-wrapper').css('font-family', $('.' + clsName).css('font-family'));
    $('.leaflet-popup-content-wrapper').css('font-size', $('.' + clsName).css('font-size'));
    $('.leaflet-popup-content').css('margin', $('.' + clsName).css('padding'));
    $('.leaflet-popup-content').css('min-width', $('.' + clsName).css('min-width'));
    $('.leaflet-popup-content').css('display', 'inline-table');
    $('.map__tooltip_value').css('white-space', 'nowrap');

    let popupWidth = 0;
    let chipWidth = 0;
    $('.leaflet-popup-content-wrapper').each(function () {
        //when user hovers over a geo and then another geo, for a moment there are 2 .leaflet-popup-content-wrapper elements
        //get the one with no style tag
        //find a better solution
        if (typeof $(this).find('.map-tooltip__geography-chip').attr('style') === 'undefined') {
            popupWidth = this.clientWidth;
            if (typeof $(this).find('.map-tooltip__geography-chip')[0] !== 'undefined') {
                chipWidth = $(this).find('.map-tooltip__geography-chip')[0].clientWidth;
            }
        }
    });

    let leftOffset = (popupWidth - chipWidth) / 2;
    $('.map-tooltip__geography-chip').css('left', leftOffset);
}

export class ThemeStyle {
    static replaceChildDivWithThemeIcon(themeId, colorElement, iconElement) {
        let iconClass = '.';
        switch (themeId) {
            case 1: //Health theme
                iconClass += 'icon--health';
                break;
            case 2: //Education theme
                iconClass += 'icon--education';
                break;
            case 3: //Labour theme
                iconClass += 'icon--elections';
                break;
            case 4: //Transport theme
                iconClass += 'icon--transport';
                break;
            case 5: //Social theme
                iconClass += 'icon--people';
                break;
            default:
                return false;
        }

        //clear icon element and add icon
        $(iconElement).empty().append($('.styles').find(iconClass).prop('outerHTML'));
        //remove classes
        $(colorElement).removeClass('_1 _2 _3 _4 _5');
        //Add correct color to element which requires it
        $(colorElement).addClass('_' + themeId);

        return true;
    }

    static replaceChildDivWithIcon(element, icon) {
        $(element).empty().append('<i class="material-icons">' + icon + '</i>');
    }
}

export class Observable {
    constructor() {
        this.eventListeners = {}
    }

    on(event, func) {
        if (this.eventListeners[event] == undefined)
            this.eventListeners[event] = [];
        this.eventListeners[event].push(func);
    };

    triggerEvent(event, payload) {
        if (this.eventListeners[event] != undefined) {
            this.eventListeners[event].forEach(listener => {
                listener(payload);
            });
        }
    };

    bubbleEvent(obj, event) {
        obj.on(event, payload => {
            this.triggerEvent(event, payload);
        })

    }

    bubbleEvents(obj, events) {
        events.forEach(event => {
            this.bubbleEvent(obj, event);
        })
    }
}

export const numFmt = d3format(",.2f");
export const numFmtAlt = d3format("~s");
// export const percFmt = x => (x * 100).toFixed(2);
export const percFmt = d3format(".1%")

export function hasElements(arr) {
    if (arr != null && arr != undefined && arr.length > 0)
        return true
    return false;
}

export function checkIterate(arr, func) {
    if (!hasElements(arr))
        return

    arr.forEach((el, i) => {
        func(el, i);
    })
}

