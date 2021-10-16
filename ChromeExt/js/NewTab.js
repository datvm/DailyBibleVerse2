import { BibleVersePanel, BibleVersePanelName } from "./components/BibleVersePanel.js";
import { ClockPanel, ClockPanelName } from "./components/ClockPanel.js";
import { PageBackground, PageBackgroundName } from "./components/PageBackground.js";
import { BgChangedEvent, BgCoverFadeChanged, BgCoverOpChanged, ClockSettingsChanged, ClockSettingsChanging, SettingsDialog, SettingsDialogName, VerseSettingsChanged, VerseSettingsChanging } from "./components/SettingsDialog.js";
class NewTabPage {
    async init() {
        this.registerComponents();
        const btnSettings = document.querySelector(".btn-settings");
        btnSettings.title = "Settings".loc();
        btnSettings.addEventListener("click", () => this.onSettingsButtonClick());
        const diag = this.diagSettings;
        diag.addEventListener(BgChangedEvent, () => this.pnlPageBg.checkSettings());
        diag.addEventListener(BgCoverOpChanged, (ev) => this.pnlPageBg.setBgCoverOpacity(ev.detail));
        diag.addEventListener(BgCoverFadeChanged, (ev) => this.pnlPageBg.shouldFadeCover = ev.detail);
        diag.addEventListener(ClockSettingsChanged, () => this.pnlClock.checkSettings());
        diag.addEventListener(ClockSettingsChanging, (ev) => this.pnlClock.applyTempSettings(ev.detail));
        diag.addEventListener(VerseSettingsChanged, () => this.pnlVerse.checkSettingsAsync());
        diag.addEventListener(VerseSettingsChanging, (ev) => this.pnlVerse.applyTempSettings(ev.detail));
        this.localize();
    }
    localize() {
        document.querySelectorAll("[data-title-loc]").forEach(el => {
            const key = el.getAttribute("data-title-loc");
            el.setAttribute("title", key.loc());
        });
    }
    onSettingsButtonClick() {
        this.diagSettings.showAsync();
    }
    registerComponents() {
        customElements.define(ClockPanelName, ClockPanel);
        this.pnlClock = document.querySelector(ClockPanelName);
        customElements.define(BibleVersePanelName, BibleVersePanel);
        this.pnlVerse = document.querySelector(BibleVersePanelName);
        customElements.define(PageBackgroundName, PageBackground);
        this.pnlPageBg = document.querySelector(PageBackgroundName);
        customElements.define(SettingsDialogName, SettingsDialog);
        this.diagSettings = document.querySelector("settings-dialog");
    }
}
new NewTabPage().init();
