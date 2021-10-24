const bgImageData = "bgImageData";
const bgVideoData = "bgVideoData";
const commonSettings = "commons";
let versionsCache = null;
export class SettingsService {
    static async getBibleVersionsAsync() {
        if (versionsCache === null) {
            versionsCache = await fetch("/versions.json").then(r => r.json());
        }
        return versionsCache;
    }
    static async getCommonSettingsAsync() {
        let result = (await this.getAsync([commonSettings]))[commonSettings];
        if (!result) {
            result = {};
        }
        ;
        this.setDefaultValues(result);
        return result;
    }
    static setDefaultValues(settings) {
        if (settings.coverOpacity == undefined) {
            settings.coverOpacity = .2;
        }
        if (settings.coverFade == undefined) {
            settings.coverFade = true;
        }
        if (settings.clockFormat == undefined) {
            settings.clockFormat = 0;
        }
        if (settings.clockShowSecond == undefined) {
            settings.clockShowSecond = false;
        }
        if (settings.clockTextColor == undefined) {
            settings.clockTextColor = "#000000";
        }
        if (settings.clockShadowColor == undefined) {
            settings.clockShadowColor = "#009DFF";
        }
        if (settings.showCopyButton == undefined) {
            settings.showCopyButton = true;
        }
        if (settings.showBibleVersion == undefined) {
            settings.showBibleVersion = true;
        }
        if (settings.bibleVersion == undefined) {
            settings.bibleVersion = "NIV";
        }
        if (settings.verseTextColor == undefined) {
            settings.verseTextColor = "#FFFFFF";
        }
        if (settings.verseShadowColor == undefined) {
            settings.verseShadowColor = "#FFFFFF";
        }
    }
    static async setCommonSettingsAsync(settings) {
        const curr = await this.getCommonSettingsAsync();
        for (let key in settings) {
            curr[key] = settings[key];
        }
        await this.setSingleAsync(commonSettings, curr);
    }
    static async getBgSettingsAsync() {
        return this.getAsync([bgImageData, bgVideoData]);
    }
    static async setBgSettingsAsync(bg) {
        await this.setAsync(bg);
        if (bg.bgImageData) {
            await this.removeAsync([bgVideoData]);
        }
        else if (bg.bgVideoData) {
            await this.removeAsync([bgImageData]);
        }
        else {
            await this.removeAsync([bgVideoData, bgImageData]);
        }
    }
    static getAsync(keys) {
        return new Promise(r => {
            if (!this.checkStorage) {
                r({});
            }
            ;
            chrome.storage.local.get(keys, r);
        });
    }
    static async setSingleAsync(key, value) {
        const obj = {};
        obj[key] = value;
        await this.setAsync(obj);
    }
    static setAsync(obj) {
        return new Promise(async (r) => {
            if (!await this.ensureStoragePerm()) {
                r(false);
                return;
            }
            chrome.storage.local.set(obj, () => r(true));
        });
    }
    static removeAsync(keys) {
        return new Promise(async (r) => {
            if (!await this.ensureStoragePerm()) {
                r(false);
                return;
            }
            chrome.storage.local.remove(keys, () => r(true));
        });
    }
    static ensureStoragePerm() {
        return new Promise(r => {
            chrome.permissions.contains({
                permissions: ["storage", "unlimitedStorage"],
            }, (hasPerm) => {
                if (hasPerm) {
                    r(true);
                }
                else {
                    chrome.permissions.request({
                        permissions: ["storage", "unlimitedStorage"],
                    }, r);
                }
            });
        });
    }
    static get checkStorage() {
        var _a;
        return typeof ((_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.local) != "undefined";
    }
    static clearAsync() {
        chrome.storage.local.clear();
    }
}
