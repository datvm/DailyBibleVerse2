declare type ObjDict = { [key: string]: any };

const bgImageData = "bgImageData";
const bgVideoData = "bgVideoData";

const commonSettings = "commons";

let versionsCache: IBibleLang[] = null;

export class SettingsService {

    static async getBibleVersionsAsync() {
        if (versionsCache === null) {
            versionsCache = await fetch("/versions.json").then(r => r.json());
        }

        return versionsCache;
    }

    static async getCommonSettingsAsync(): Promise<ICommonSettings> {
        let result = (await this.getAsync([commonSettings]))[commonSettings];
        if (!result) { result = {}; };

        this.setDefaultValues(result);

        return result;
    }

    private static setDefaultValues(settings: ICommonSettings) {
        if (settings.coverOpacity == undefined) { settings.coverOpacity = .2; }
        if (settings.coverFade == undefined) { settings.coverFade = true; }

        if (settings.clockFormat == undefined) { settings.clockFormat = 0; }
        if (settings.clockShowSecond == undefined) { settings.clockShowSecond = false; }
        if (settings.clockTextColor == undefined) { settings.clockTextColor = "#000000"; }
        if (settings.clockShadowColor == undefined) { settings.clockShadowColor = "#009DFF"; }

        if (settings.showCopyButton == undefined) { settings.showCopyButton = true; }
        if (settings.showBibleVersion == undefined) { settings.showBibleVersion = true; }
        if (settings.bibleVersion == undefined) { settings.bibleVersion = "NIV"; }
        if (settings.verseTextColor == undefined) { settings.verseTextColor = "#FFFFFF"; }
        if (settings.verseShadowColor == undefined) { settings.verseShadowColor = "#FFFFFF"; }
    }

    static async setCommonSettingsAsync(settings: ICommonSettings) {
        const curr: any = await this.getCommonSettingsAsync();
        for (let key in settings) {
            curr[key] = (settings as any)[key];
        }

        await this.setSingleAsync(commonSettings, curr);
    }

    static async getBgSettingsAsync(): Promise<IBackground> {
        return this.getAsync([bgImageData, bgVideoData]);
    }

    static async setBgSettingsAsync(bg: IBackground) {
        await this.setAsync(bg);
        if (bg.bgImageData) {
            await this.removeAsync([bgVideoData]);
        } else if (bg.bgVideoData) {
            await this.removeAsync([bgImageData]);
        } else {
            await this.removeAsync([bgVideoData, bgImageData]);
        }
    }

    static getAsync(keys: string[]): Promise<ObjDict> {
        return new Promise<ObjDict>(r => {
            if (!this.checkStorage) { r({}); };

            chrome.storage.local.get(keys, r);
        });
    }

    static async setSingleAsync<T = any>(key: string, value: T) {
        const obj: any = {};
        obj[key] = value;

        await this.setAsync(obj);
    }

    static setAsync(obj: any): Promise<boolean> {
        return new Promise<boolean>(async r => {
            if (!await this.ensureStoragePerm()) {
                r(false);
                return;
            }

            chrome.storage.local.set(obj, () => r(true));
        });
    }

    static removeAsync(keys: string[]): Promise<boolean> {
        return new Promise<boolean>(async r => {
            if (!await this.ensureStoragePerm()) {
                r(false);
                return;
            }

            chrome.storage.local.remove(keys, () => r(true));
        });
    }

    static ensureStoragePerm() {
        return new Promise<boolean>(r => {
            chrome.permissions.contains({
                permissions: ["storage", "unlimitedStorage"],
            }, (hasPerm) => {
                if (hasPerm) {
                    r(true);
                } else {
                    chrome.permissions.request({
                        permissions: ["storage", "unlimitedStorage"],
                    }, r);
                }
            });
        });

    }

    static get checkStorage() {
        return typeof (chrome.storage?.local) != "undefined";
    }

    static clearAsync() {
        chrome.storage.local.clear();
    }

}

export interface ICommonSettings {

    coverOpacity?: number;
    coverFade?: boolean;

    clockFormat?: number;
    clockShowSecond?: boolean;
    clockTextColor?: string;
    clockShadowColor?: string;

    showBibleVersion?: boolean;
    showCopyButton?: boolean;
    bibleVersion?: string;
    verseTextColor?: string;
    verseShadowColor?: string;
}

export interface IBackground {

    bgImageData?: string;
    bgVideoData?: string;

}

export interface IBibleLang {
    name: string;
    items: IBibleVersion[];
}

export interface IBibleVersion {

    id: string;
    name: string;

}