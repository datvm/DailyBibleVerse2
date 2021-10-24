import { SettingsService } from "../services/SettingsService.js";
export const ClockPanelName = "clock-panel";
export const MONTHS_NAMES = "Months".loc().split(/,/g);
export const GREETINGS = ["Greetings0", "Greetings1", "Greetings2", "Greetings3"].map(q => q.loc());
export class ClockPanel extends HTMLElement {
    constructor() {
        super();
        this.lblTime = this.querySelector(".time");
        this.lblDate = this.querySelector(".date");
        this.lblGreeting = this.querySelector(".greeting");
        this.checkSettings().then(() => this.updateClock());
    }
    async checkSettings() {
        this.currSettings = await SettingsService.getCommonSettingsAsync();
        this.updateClock(true);
        this.updateAppearance();
    }
    applyTempSettings(temp) {
        this.style.setProperty(temp.prop, temp.value);
    }
    updateClock(oneTime = false) {
        var _a, _b, _c, _d;
        try {
            let now = new Date();
            const day = this.pad(now.getDate());
            const month = MONTHS_NAMES[now.getMonth()];
            const year = now.getFullYear();
            let hourNum = now.getHours();
            const min = this.pad(now.getMinutes());
            let greetingIndex = 3;
            if (hourNum < 5) {
                greetingIndex = 3;
            }
            else if (hourNum < 12) {
                greetingIndex = 0;
            }
            else if (hourNum < 18) {
                greetingIndex = 1;
            }
            else {
                greetingIndex = 2;
            }
            const isPm = hourNum >= 12;
            const clockFormat = (_b = (_a = this.currSettings) === null || _a === void 0 ? void 0 : _a.clockFormat) !== null && _b !== void 0 ? _b : 0;
            if (clockFormat != undefined && clockFormat < 2) {
                if (hourNum > 12) {
                    hourNum -= 12;
                }
                if (hourNum == 0) {
                    hourNum = 12;
                }
            }
            const hour = this.pad(hourNum);
            let clockText = `${hour}:${min}`;
            if ((_c = this.currSettings) === null || _c === void 0 ? void 0 : _c.clockShowSecond) {
                const second = this.pad(now.getSeconds());
                clockText += `:${second}`;
            }
            if (((_d = this.currSettings) === null || _d === void 0 ? void 0 : _d.clockFormat) === 1) {
                clockText += isPm ? " PM" : " AM";
            }
            this.lblTime.innerText = clockText;
            this.lblDate.innerText = `${month} ${day} ${year}`;
            this.lblGreeting.innerText = GREETINGS[greetingIndex];
        }
        catch (e) {
            console.error(e);
        }
        finally {
            if (!oneTime) {
                window.setTimeout(() => this.updateClock(), 1000);
            }
        }
    }
    updateAppearance() {
        const s = this.currSettings;
        this.style.setProperty("--text-color", s.clockTextColor);
        this.style.setProperty("--shadow-color", s.clockShadowColor);
    }
    pad(num) {
        return num < 10 ? "0" + num : num.toString();
    }
}
