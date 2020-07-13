import {Observable} from './utils';
import {Geography, Profile, DataBundle} from './dataobjects';

export default class Controller extends Observable {
    constructor(api, config, profileId = 1) {
        super();
        this.config = config
        this.profileId = profileId;
        this.api = api;

        this.state = {
            profileId: profileId,
            // Set if a choropleth is currently active
            // TODO this state should possibly be stored in the mapcontrol
            subindicator: null,
            selectedSubindicator: ''
        }

        const self = this;

        $(window).on('hashchange', () => {
            // On every hash change the render function is called with the new hash.
            // This is how the navigation of our app happens.
            const hash = decodeURI(window.location.hash);
            let parts = hash.split(':')
            let payload = null;

            if (parts[0] == '#geo') {
                payload = self.changeGeography(parts[1])
            } else if (parts[0] == '#logout') {
                self.onLogout();
            } else {
                //if a category nav is clicked, the hash becomes something like #divId, in that case it should behave same as if hash == ''
                const areaCode = this.config.rootGeography;
                payload = self.changeGeography(areaCode)
            }

            self.triggerEvent("hashChange", payload);
            self.onHashChange(payload);
        });
    };

    changeGeography(areaCode) {
        const payload = {
            // TODO need to change this to profileId
            profile: self.profile,
            areaCode: areaCode,
        }

        this.onGeographyChange(payload);
        return payload;
    };

    onLogout() {
        this.triggerEvent("loggingOut");
        this.api.logout().then(e => {
            window.location.hash = '';
            console.log(e);
            this.triggerEvent("loggedOut");
        })
    }

    triggerEvent(event, payload) {
        payload = {
            payload: payload,
            state: this.state
        }
        super.triggerEvent(event, payload);
    };

    triggerHashChange() {
        $(window).trigger('hashchange');
    };

    /**
     * Event handler that is fired when a subindicator in the menu is clicked
     * @param  {[type]} payload [description]
     * payload {
            el: el,     # clicked element
            data: data, # profile data
            subindicators: subindicators, # child geography data for each related subindicator
            obj: obj. # subindicator data
       }
     * @return {[type]}         [description]
     */

    /**
     * Triggered when the rich data drawer is pulled across the screen
     * @param  {[type]} payload [description]
     * @return {[type]}         [description]
     */
    onSubIndicatorClick(payload) {
        const children = payload.subindicators.filter((s) => {
            return s.keys === payload.obj.keys;
        })[0].children;
        const subindicator = {
            indicatorTitle: payload.indicatorTitle,
            children: children,
            selectedSubindicator: payload.obj.keys,
            choropleth_method: payload.obj.choropleth_method,
            subindicatorArr: payload.subindicators,
            parents: payload.parents
        }
        this.state.subindicator = subindicator;
        this.state.selectedSubindicator = payload.obj._keys;

        this.triggerEvent("subindicatorClick", payload);
    };

    onChoroplethFiltered(payload) {
        //update this.state.subindicator with the filtered values
        let subindicator = this.state.subindicator;
        subindicator.subindicatorArr = payload.subindicatorArr;
        subindicator.children = payload.data;
        subindicator.filter = {
            group: payload.selectedGroup,
            value: payload.selectedFilter
        }

        this.state.subindicator = subindicator;

        this.triggerEvent("choroplethFiltered", payload);
    }

    onChoroplethReset() {
        this.triggerEvent('resetChoropleth');
    }

    handleNewProfileChoropleth() {
        if (this.state.subindicator === null) {
            return;
        }

        //this means we need to show choropleth for the new children. update payload.state.subindicator.children and payload.state.subindicator.subindicatorArr
        let indicators = this.state.profile.profile
            .profileData[this.state.subindicator.parents.category]
            .subcategories[this.state.subindicator.parents.subcategory]
            .indicators;

        let subindicatorArr = indicators[this.state.subindicator.parents.indicator].subindicators;

        let selectedSubindicator = subindicatorArr.filter((s) => {
            return s.keys === this.state.subindicator.selectedSubindicator
        })[0];
        let children = selectedSubindicator.children;
        let choropleth_method = selectedSubindicator.choropleth_method;

        this.state.subindicator.selectedSubindicator = selectedSubindicator.keys;
        this.state.subindicator.children = children;
        this.state.subindicator.choropleth_method = choropleth_method;

        const args = {
            data: children,
            subindicatorArr: subindicatorArr,
            indicators: indicators
        }

        this.triggerEvent("newProfileWithChoropleth", args);
    }

    /**
     * Payload includes profile and geography, e.g.
     * {
     *     profile: 1,
     *     geography: WC
     * }
     * @param  {[type]} payload [description]
     * @return {[type]}         [description]
     */
    onHashChange(payload) {
        this.triggerEvent("hashChange", payload);
    };

    onGeographyChange(payload) {
        this.loadProfile(payload, true)
    }


    loadProfile(payload, callRegisterFunction) {
        const self = this;
        this.triggerEvent("loadingNewProfile", payload.areaCode);
        this.api.getProfile(this.profileId, payload.areaCode).then(js => {
            const dataBundle = new DataBundle(js);
            self.state.profile = dataBundle;

            self.triggerEvent("loadedNewProfile", dataBundle);
            // TODO this should be run after all dynamic stuff is run
            // Shouldn't be here
            setTimeout(() => {
                if (callRegisterFunction) {
                    console.log("initialising webflow")
                    Webflow.require('ix2').init()
                    self.registerWebflowEvents();
                }
            }, 600)
        })
    }

    changeHash(areaCode) {
        window.location.hash = `#geo:${areaCode}`;
    }


    onLayerClick(payload) {
        const self = this;
        if (payload.maplocker.locked) {
            console.log("ignoring click from onLayer click")
            return;
        }

        payload.maplocker.lock();

        const areaCode = payload.areaCode;
        this.changeHash(areaCode)

        this.triggerEvent("layerClick", payload);
    };

    onChoropleth(payload) {
        this.triggerEvent("choropleth", payload);
    };

    onLayerMouseOver(payload) {
        this.triggerEvent("layerMouseOver", payload);
    };

    onLayerMouseOut(payload) {
        this.triggerEvent("layerMouseOut", payload);
    };

    onLayerMouseMove(payload) {
        this.triggerEvent("layerMouseMove", payload);
    }

    onLayerLoading(payload) {
        this.triggerEvent("layerLoading", payload);
    };

    onLayerLoaded(payload) {
        payload.mapControl.maplocker.unlock();
        this.triggerEvent("layerLoaded", payload);
    };

    onProfileLoaded(payload) {
        this.state.profile = payload;
        this.triggerEvent("profileLoaded", payload);
    };

    onPrintProfile(payload) {
        let filename = "geography";
        if (this.state.profile != null) {
            filename = this.state.profile.profile.geography.name
        }
        this.triggerEvent("printProfile", filename)
    }

    //Payload is the MapChip Element
    onMapChipRemoved(payload) {
        this.state.subindicator = null;
        this.triggerEvent('mapChipRemoved', payload);
    }

    onThemeSelected(payload) {
        this.triggerEvent('point_tray.theme.selected', payload);
    }

    onThemeUnselected(payload) {
        this.triggerEvent('point_tray.theme.unselected', payload);
    }

    onThemePointLoaded(payload) {
        this.triggerEvent('themeLoaded', payload);
    }

    onCategorySelected(payload) {
        this.triggerEvent('point_tray.category.selected', payload);
    }

    onCategoryUnselected(payload) {
        this.triggerEvent('point_tray.category.unselected', payload);
    }

    onCategoryPointLoading(payload) {
        this.triggerEvent('categoryPointLoading', payload);
    }

    onCategoryPointLoaded(payload) {
        this.triggerEvent('categoryPointLoaded', payload);
    }


    /** When a breadcrumb is clicked. Payload is a location:
     {
         code: 'WC',
         level: 'province',
         name: 'Western Cape'
    }
     */
    /**
     * [onMapChipRemoved description]
     * @param  {[type]} payload [description]
     * @return {[type]}         [description]
     */
    onBreadcrumbSelected(payload) {
        this.triggerEvent('breadcrumbSelected', payload);
        this.changeHash(payload.code)
    }

    /* Search events */
    onSearchBefore(payload) {
        this.triggerEvent("searchBefore", payload)
    }

    onSearchResults(payload) {
        this.triggerEvent("searchResults", payload)
    }

    /**
     * When a search result is clicked
     * {code: WC011, level: municipality, name: Matzikama}
     */
    onSearchResultClick(payload) {
        this.triggerEvent("searchResultClick", payload)
        this.changeHash(payload.code)
    }

    onSearchClear(payload) {
        this.triggerEvent("searchClear", payload)
    }


    /**
     * Payload includes profile and geography, e.g.
     * {
     *     profile: 1,
     *     geography: WC
     * }
     */
    onLoadingGeography(payload) {
        this.triggerEvent("loadingGeography", payload)
    }


    /**
     * Payload includes profile and geography, e.g.
     * {
     *     profile: 1,
     *     geography: [Project object]
     * }
     */
    onLoadedGeography(payload) {
        // Important to trigger loadedGeography before reinitialising Webflow
        // otherwise new elements placed on the page are not recognised by webflow
        //this.triggerEvent("loadedGeography", payload);
        // TODO remove this once the best home is found for it
        Webflow.require('ix2').init()
        this.registerWebflowEvents();
    }

    onLoadingThemes(payload) {
        this.triggerEvent("point_tray.tray.loading_themes", payload);
    }

    onLoadedThemes(payload) {
        this.triggerEvent("point_tray.tray.themes_loaded", payload);
        Webflow.ready();
    }

    onZoomToggled(payload) {
        this.triggerEvent("zoomToggled", payload);
    }

    onMapZoomed(payload) {
        this.triggerEvent("mapZoomed", payload);
    }

    onPreferredChildChange(childLevel) {
        this.state.preferredChild = childLevel;
        this.triggerEvent("preferredChildChange", childLevel);
        // TODO remove SA specfic stuff
        this.config.preferredChildren['municipality'] = [childLevel];

        this.reDrawChildren();
    }

    reDrawChildren = () => {
        let currentLevel = this.state.profile.profile.geography.level;

        if (currentLevel !== 'municipality') {
            return;
        }

        const payload = {
            profile: this.state.profile.profile,
        }

        this.onHashChange(payload, false);
    }

    registerWebflowEvents() {
        const events = ["click", "mouseover", "mouseout"];
        const self = this;
        events.forEach(function (ev) {
            let eventElements = $(`*[data-event=${ev}]`);
            Object.values(eventElements).forEach(el => {
                if (el.attributes == undefined) return;
                const functionAttribute = el.attributes["data-function"];

                if (functionAttribute == undefined) return;
                const functions = functionAttribute.value;

                if (functions == undefined) return;

                functions.split(",").forEach(foo => {
                    const func = self[`on${foo}`];
                    if (func != undefined) {
                        $(el).on(ev, el => func(el))
                    }
                })
            })
        })
    }
}
