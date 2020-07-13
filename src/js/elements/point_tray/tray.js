import {numFmt, Observable, hasElements, ThemeStyle, checkIterate} from '../../utils';
import {Theme} from './theme';

const categoryWrapperClsName = '.point-mapper__h1_content';
const treeLineClsName = '.point-data__h2_line-v';
const wrapperClsName = '.point-mapper-content__list';
const pointDataItemClsName = '.point-mapper__h1';
const categoryItemClsName = '.point-mapper__h2'; //'.point-mapper__h2_wrapper';
const stylesClsName = '.styles';
const loadingClsName = '.point-mapper-content__loading';

export class PointDataTray extends Observable {
    constructor(api, profileId) {
        super();
        this.api = api;
        this.profileId = profileId;

        this.prepareDomElements();
    }

    prepareDomElements() {
        this.treeLineItem = $(treeLineClsName)[0].cloneNode(true);
        this.pointDataItem = $(pointDataItemClsName)[0].cloneNode(true);
        this.categoryItem = $(categoryItemClsName)[0].cloneNode(true);

        this.clearText();
    }

    clearText() {
        $(wrapperClsName).html('');
        $(stylesClsName).find(wrapperClsName).remove(); //need to remove the cloned objects, or js keeps styling the wrong element
    }

    createTheme(datum) {
        const theme = new Theme(datum, this.pointDataItem, this.categoryItem);
        theme.on("point_tray.category.selected", category => this.triggerEvent("point_tray.category.selected", category))
        theme.on("point_tray.category.unselected", category => this.triggerEvent("point_tray.category.unselected", category))
        theme.on("point_tray.theme.selected", theme => this.triggerEvent("point_tray.theme.selected", theme))
        theme.on("point_tray.theme.unselected", theme => this.triggerEvent("point_tray.theme.unselected", theme))

        return theme;
    }

    loadThemes() {
        const self = this;

        self.triggerEvent("point_tray.tray.loading_themes", self);

        self.api.loadThemes(this.profileId).then(data => {
            checkIterate(data.results, themeDatum => {
                let theme = self.createTheme(themeDatum);
                let item = theme.element;

                //append tree
                let treeItem = this.treeLineItem.cloneNode(true);
                $(categoryWrapperClsName, item).append(treeItem);

                ThemeStyle.replaceChildDivWithIcon($(item).find('.point-data__h1_icon'), themeDatum.icon)

                $(loadingClsName).addClass('hidden');
                $(wrapperClsName).append(item);
            })
            self.triggerEvent("point_tray.tray.themes_loaded", data);
        })
    }
}