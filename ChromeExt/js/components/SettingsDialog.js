import { SettingsService } from "../services/SettingsService.js";
export const SettingsDialogName = "settings-dialog";
export const BgChangedEvent = "bg-changed";
export const BgCoverOpChanged = "bg-cover-op-changed";
export const BgCoverFadeChanged = "bg-cover-fade-changed";
export const ClockSettingsChanged = "clock-changed";
export const ClockSettingsChanging = "clock-color-changing";
export const VerseSettingsChanged = "verse-changed";
export const VerseSettingsChanging = "verse-changing";
export class SettingsDialog extends HTMLElement {
    constructor() {
        super();
        this.querySelectorAll("[data-loc]").forEach(el => {
            el.innerHTML = el.getAttribute("data-loc").loc();
        });
        this.querySelector(".btn-close").addEventListener("click", () => this.close());
        this.querySelectorAll("[data-bg]").forEach(el => el.addEventListener("click", () => this.onBgButtonClick(el)));
        this.txtBgCoverOp = this.querySelector("#txt-bg-opacity");
        this.txtBgCoverOp.addEventListener("input", () => this.onOpacityChanging());
        this.txtBgCoverOp.addEventListener("change", () => this.onOpacityChanged());
        this.chkBgFade = this.querySelector("#chk-bg-fade");
        this.chkBgFade.addEventListener("change", () => this.onBgFadeOptChanged());
        this.chkClockSecond = this.querySelector("#chk-clock-second");
        this.chkClockSecond.addEventListener("change", () => this.onClockSecondChanged());
        const optClockFormats = this.querySelectorAll("[data-clock-format]");
        optClockFormats.forEach(opt => opt.addEventListener("change", () => this.onClockFormatChanged(opt)));
        this.txtClockColor = this.querySelector("#txt-clock-color");
        this.addLiveSettingListeners(this.txtClockColor, ClockSettingsChanging, "--text-color", () => this.onClockColorChanged());
        this.txtClockShadow = this.querySelector("#txt-clock-shadow");
        this.addLiveSettingListeners(this.txtClockShadow, ClockSettingsChanging, "--shadow-color", () => this.onClockShadowChanged());
        this.txtVerseColor = this.querySelector("#txt-verse-color");
        this.addLiveSettingListeners(this.txtVerseColor, VerseSettingsChanging, "--text-color", () => this.onVerseColorChanged());
        this.txtVerseShadow = this.querySelector("#txt-verse-shadow");
        this.addLiveSettingListeners(this.txtVerseShadow, VerseSettingsChanging, "--shadow-color", () => this.onVerseShadowChanged());
        this.cboBibleLang = this.querySelector("#cbo-bible-lang");
        this.cboBibleVersion = this.querySelector("#cbo-bible-version");
        this.chkShowVersion = this.querySelector("#chk-show-version");
        this.chkShowVersion.addEventListener("change", () => this.onShowVersionChanged());
        this.chkShowCopy = this.querySelector("#chk-show-copy");
        this.chkShowCopy.addEventListener("change", () => this.onShowCopyChanged());
        this.setLink("github", "https://github.com/datvm/DailyBibleVerse2");
        this.setLink("bgm", "https://www.biblegateway.com/");
    }
    async onShowVersionChanged() {
        const value = this.chkShowVersion.checked;
        await SettingsService.setCommonSettingsAsync({
            showBibleVersion: value,
        });
        await this.dispatchEv(VerseSettingsChanged, 0);
    }
    async onShowCopyChanged() {
        const value = this.chkShowCopy.checked;
        await SettingsService.setCommonSettingsAsync({
            showCopyButton: value,
        });
        await this.dispatchEv(VerseSettingsChanged, 0);
    }
    setLink(name, url) {
        const a = this.querySelector(`[data-link='${name}']`);
        if (!a) {
            return;
        }
        a.setAttribute("target", "_blank");
        a.setAttribute("href", url);
    }
    async showAsync() {
        const commons = await SettingsService.getCommonSettingsAsync();
        this.txtBgCoverOp.value = commons.coverOpacity.toString();
        this.chkBgFade.checked = commons.coverFade;
        this.txtClockColor.value = commons.clockTextColor;
        this.txtClockShadow.value = commons.clockShadowColor;
        this.txtVerseColor.value = commons.verseTextColor;
        this.txtVerseShadow.value = commons.verseShadowColor;
        this.chkClockSecond.checked = commons.clockShowSecond;
        this.querySelector(`[data-clock-format="${commons.clockFormat}"]`).checked = true;
        this.chkShowVersion.checked = commons.showBibleVersion;
        this.chkShowCopy.checked = commons.showCopyButton;
        await this.initBibleSelectorsAsync(commons.bibleVersion);
        this.classList.add("show");
    }
    async initBibleSelectorsAsync(selectingVersion) {
        const langs = await SettingsService.getBibleVersionsAsync();
        if (this.cboBibleLang.childElementCount == 0) {
            const langFrag = new DocumentFragment();
            for (const lang of langs) {
                const opt = document.createElement("option");
                opt.value = opt.text = lang.name;
                opt.info = lang;
                opt.selected = !!lang.items.find(q => q.id == selectingVersion);
                langFrag.appendChild(opt);
            }
            this.cboBibleLang.appendChild(langFrag);
            this.cboBibleLang.addEventListener("change", () => {
                const lang = this.cboBibleLang.selectedOptions[0].info;
                this.onLangSelected(lang);
            });
            this.cboBibleVersion.addEventListener("change", () => this.onBibleVersionSelected());
        }
        let selectingLang = null;
        for (let lang of langs) {
            for (let version of lang.items) {
                if (version.id == selectingVersion) {
                    selectingLang = lang;
                    break;
                }
            }
            if (selectingLang) {
                break;
            }
        }
        this.onLangSelected(selectingLang, selectingVersion);
    }
    onLangSelected(lang, selectingVersion) {
        const cbo = this.cboBibleVersion;
        const frag = new DocumentFragment();
        for (let version of lang.items) {
            const opt = document.createElement("option");
            opt.text = version.name;
            opt.value = version.id;
            opt.selected = version.id == selectingVersion;
            frag.appendChild(opt);
        }
        cbo.innerHTML = "";
        cbo.appendChild(frag);
        if (!selectingVersion) {
            this.onBibleVersionSelected();
        }
    }
    async onBibleVersionSelected() {
        const version = this.cboBibleVersion.value;
        await SettingsService.setCommonSettingsAsync({
            bibleVersion: version,
        });
        this.dispatchEv(VerseSettingsChanged, 0);
    }
    close() {
        this.classList.remove("show");
    }
    addLiveSettingListeners(txt, evName, changingProp, updateFn) {
        txt.addEventListener("input", () => this.onLiveSettingChanging(evName, changingProp, txt));
        txt.addEventListener("change", updateFn);
    }
    onLiveSettingChanging(evName, prop, input) {
        this.dispatchEv(evName, {
            prop,
            value: input.value,
        });
    }
    async onClockColorChanged() {
        await SettingsService.setCommonSettingsAsync({
            clockTextColor: this.txtClockColor.value,
        });
        this.dispatchEv(ClockSettingsChanged, 0);
    }
    async onClockShadowChanged() {
        await SettingsService.setCommonSettingsAsync({
            clockShadowColor: this.txtClockShadow.value,
        });
        this.dispatchEv(ClockSettingsChanged, 0);
    }
    async onVerseColorChanged() {
        await SettingsService.setCommonSettingsAsync({
            verseTextColor: this.txtVerseColor.value,
        });
        this.dispatchEv(VerseSettingsChanged, 0);
    }
    async onVerseShadowChanged() {
        await SettingsService.setCommonSettingsAsync({
            verseShadowColor: this.txtVerseShadow.value,
        });
        this.dispatchEv(VerseSettingsChanged, 0);
    }
    async onClockFormatChanged(el) {
        if (!el.checked) {
            return;
        }
        const format = Number(el.getAttribute("data-clock-format"));
        await SettingsService.setCommonSettingsAsync({
            clockFormat: format,
        });
        this.dispatchEv(ClockSettingsChanged, 0);
    }
    dispatchEv(name, data) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            cancelable: true,
            detail: data,
        }));
    }
    async onBgFadeOptChanged() {
        var enabled = this.chkBgFade.checked;
        await SettingsService.setCommonSettingsAsync({
            coverFade: enabled,
        });
        this.dispatchEv(BgCoverFadeChanged, enabled);
    }
    async onClockSecondChanged() {
        await SettingsService.setCommonSettingsAsync({
            clockShowSecond: this.chkClockSecond.checked,
        });
        this.dispatchEv(ClockSettingsChanged, 0);
    }
    onOpacityChanging() {
        this.dispatchEv(BgCoverOpChanged, Number(this.txtBgCoverOp.value));
    }
    async onOpacityChanged() {
        const value = Number(this.txtBgCoverOp.value);
        this.dispatchEv(BgCoverOpChanged, value);
        SettingsService.setCommonSettingsAsync({
            coverOpacity: value,
        });
    }
    async onBgButtonClick(el) {
        const opt = el.getAttribute("data-bg");
        switch (opt) {
            case "Default":
                await SettingsService.setBgSettingsAsync({});
                break;
            case "Image":
            case "Video":
                await this.pickBgFileAsync(opt);
                break;
        }
        this.dispatchEv(BgChangedEvent, 0);
    }
    async pickBgFileAsync(type) {
        const file = await this.pickFileAsync(type == "Image" ? "image/*" :
            "video/*");
        if (!file) {
            return;
        }
        const dataUrl = await this.readAsDataUrlAsync(file);
        const bg = {};
        bg[type == "Image" ? "bgImageData" : "bgVideoData"] = dataUrl;
        await SettingsService.setBgSettingsAsync(bg);
    }
    readAsDataUrlAsync(file) {
        return new Promise((r, rej) => {
            const reader = new FileReader();
            reader.onload = () => r(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(file);
        });
    }
    pickFileAsync(accept) {
        return new Promise(r => {
            const txt = document.createElement("input");
            txt.type = "file";
            txt.accept = accept;
            txt.addEventListener("change", () => r(txt.files[0]));
            txt.click();
        });
    }
}
