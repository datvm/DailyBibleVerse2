import { ICommonSettings, SettingsService } from "../services/SettingsService.js";
import { IClockSettingsChanging } from "./SettingsDialog.js";

const ApiUrl = "https://www.biblegateway.com/votd/get/?format=json&version=";
const CacheKey = "VerseCache";

export const BibleVersePanelName = "bible-verse";

export class BibleVersePanel extends HTMLElement {

    lblVerse = this.querySelector(".verse");
    lnkLink = this.querySelector<HTMLAnchorElement>(".link-ref");
    lblRefContent = this.querySelector(".ref-content");
    lblVersionContainer = this.querySelector(".version");
    lblVersion = this.querySelector(".version-content");
    btnCopy = this.querySelector("#btn-copy-verse");

    constructor() {
        super();

        this.loadFromCache();
        this.checkSettingsAsync();

        this.btnCopy.addEventListener("click", (e) => {
            e.preventDefault();
            this.copy();
        });
    }

    async checkSettingsAsync() {
        const commons = await SettingsService.getCommonSettingsAsync();

        this.btnCopy.classList.toggle("d-none", !commons.showCopyButton);
        this.lblVersionContainer.classList.toggle("d-none", !commons.showBibleVersion);
        this.updateUI(commons);

        await this.loadVerseAsync(commons.bibleVersion);
    }

    updateUI(settings: ICommonSettings) {
        this.style.setProperty("--text-color", settings.verseTextColor);
        this.style.setProperty("--shadow-color", settings.verseShadowColor);
    }

    loadFromCache() {
        let cacheRaw = localStorage.getItem(CacheKey);

        let cache: IVerse;
        if (cacheRaw) {
            cache = JSON.parse(cacheRaw);
        } else {
            cache = { "text": "&ldquo;Consequently, you are no longer foreigners and strangers, but fellow citizens with God&#8217;s people and also members of his household,&rdquo;", "content": "Consequently, you are no longer foreigners and strangers, but fellow citizens with God&#8217;s people and also members of his household,", "display_ref": "Ephesians 2:19", "reference": "Ephesians 2:19", "permalink": "https:\/\/www.biblegateway.com\/passage\/?search=Ephesians%202:19&amp;version=NIV", "copyright": " ", "copyrightlink": "https:\/\/www.biblegateway.com\/versions\/index.php?action=getVersionInfo&amp;vid=31&amp;lang=2", "audiolink": "https:\/\/www.biblegateway.com\/audio\/mclean\/niv\/Eph.2.19", "day": "30", "month": "08", "year": "2021", "version": "New International Version", "version_id": "NIV", "merchandising": "" };
        }

        this.showVerse(cache);
    }

    async copy() {
        const content = `"${this.lblVerse.textContent.trim()}" — ${this.lblRefContent.textContent.trim()}`;

        await navigator.clipboard.writeText(content);
    }

    async loadVerseAsync(version: string) {
        let res = await this.fetchVerseAsync(version);

        if (!res) { return; }

        if (res.error) {
            res = await this.fetchVerseAsync("NIV");

            if (!res || res.error) { return; }
        }

        const votd = res.votd;

        localStorage.setItem(CacheKey, JSON.stringify(votd));

        this.showVerse(votd);
    }

    private async fetchVerseAsync(version: string) {
        const url = ApiUrl + encodeURIComponent(version);
        const res = await fetch(url);

        if (!res.ok) {
            return null;
        }

        return <IVotDRes>await res.json();
    }

    applyTempSettings(temp: IClockSettingsChanging) {
        this.style.setProperty(temp.prop, temp.value);
    }

    showVerse(verse: IVerse) {
        this.lblVerse.innerHTML = verse.content;
        this.lblRefContent.innerHTML = verse.display_ref;
        this.lblVersion.innerHTML = verse.version;
        this.lnkLink.href = verse.permalink.replace(/&amp;/g, "&");
    }

}

export interface IVerse {
    text: string
    content: string
    display_ref: string
    reference: string
    permalink: string
    copyright: string
    copyrightlink: string
    audiolink: string
    day: string
    month: string
    year: string
    version: string
    version_id: string
    merchandising: string
}

export interface IVotDRes {
    votd: IVerse;
    error?: any;
}
