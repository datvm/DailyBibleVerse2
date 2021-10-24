import { ICommonSettings, SettingsService } from "../services/SettingsService.js";
import { IClockSettingsChanging } from "./SettingsDialog.js";

export const ClockPanelName = "clock-panel";

export const MONTHS_NAMES = "Months".loc().split(/,/g);
export const GREETINGS = ["Greetings0", "Greetings1", "Greetings2", "Greetings3"].map(q => q.loc());

export class ClockPanel extends HTMLElement {

    private lblTime = this.querySelector(".time");
    private lblDate = this.querySelector(".date");
    private lblGreeting = this.querySelector(".greeting");

    private currSettings: ICommonSettings;

    constructor() {
        super();

        this.checkSettings().then(() => this.updateClock());
    }

    async checkSettings() {
        this.currSettings = await SettingsService.getCommonSettingsAsync();
        this.updateClock(true);
        this.updateAppearance();
    }

    applyTempSettings(temp: IClockSettingsChanging) {
        this.style.setProperty(temp.prop, temp.value);
    }

    updateClock(oneTime = false) {
        try {
            let now = new Date();

            // For Debugging:
            //now = new Date(2020, 1,1,13,5,0);

            const day = this.pad(now.getDate());
            const month = MONTHS_NAMES[now.getMonth()];
            const year = now.getFullYear();

            let hourNum = now.getHours();

            const min = this.pad(now.getMinutes());
            
            let greetingIndex = 3;
            if (hourNum < 5) {
                greetingIndex = 3;
            } else if (hourNum < 12) {
                greetingIndex = 0;
            } else if (hourNum < 18) {
                greetingIndex = 1;
            } else {
                greetingIndex = 2;
            }

            const isPm = hourNum >= 12;
            const clockFormat = this.currSettings?.clockFormat ?? 0;

            if (clockFormat != undefined && clockFormat < 2) {
                if (hourNum > 12) { hourNum -=12; }
                        if (hourNum == 0) { hourNum = 12; }
            }

            const hour = this.pad(hourNum);

            let clockText = `${hour}:${min}`;
            if (this.currSettings?.clockShowSecond) {
                const second = this.pad(now.getSeconds());
                clockText += `:${second}`;
            }

            if (this.currSettings?.clockFormat === 1) {
                clockText += isPm ? " PM" : " AM";
            }

            this.lblTime.innerText = clockText;
            this.lblDate.innerText = `${month} ${day} ${year}`;
            this.lblGreeting.innerText = GREETINGS[greetingIndex];
        } catch (e) {
            console.error(e);
        } finally {
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

    private pad(num: number): string {
        return num < 10 ? "0" + num : num.toString();
    }
}