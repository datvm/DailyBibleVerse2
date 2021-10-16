import { SettingsService } from "../services/SettingsService.js";
export const PageBackgroundName = "page-background";
export class PageBackground extends HTMLElement {
    constructor() {
        super();
        this.video = this.querySelector("video");
        this.bgCover = this.querySelector(".background-cover");
        this.bg = this.querySelector(".background");
        this.isPlayingDefault = true;
        this.shouldFadeCover = true;
        this.video.addEventListener("timeupdate", () => this.onVideoUpdate());
        this.checkSettings();
    }
    setBgCoverOpacity(value) {
        this.style.setProperty("--cover-opacity", value.toString());
    }
    async checkSettings() {
        const bg = await SettingsService.getBgSettingsAsync();
        if (bg.bgImageData) {
            this.removeVideo();
            this.setImage(bg.bgImageData);
            this.isPlayingDefault = false;
        }
        else if (bg.bgVideoData) {
            this.removeImage();
            this.setVideo(bg.bgVideoData);
            this.isPlayingDefault = false;
        }
        else if (!this.isPlayingDefault) {
            this.playDefault();
        }
        const commons = await SettingsService.getCommonSettingsAsync();
        this.setBgCoverOpacity(commons.coverOpacity);
        this.shouldFadeCover = commons.coverFade;
    }
    playDefault() {
        this.isPlayingDefault = true;
        this.setVideo("/img/default-bg.mp4");
    }
    setImage(imageData) {
        const bg = this.bg;
        bg.classList.remove("d-none");
        bg.src = imageData;
    }
    removeImage() {
        const bg = this.bg;
        bg.classList.add("d-none");
        bg.removeAttribute("src");
    }
    setVideo(videoData) {
        const v = this.video;
        v.src = videoData;
        v.classList.remove("d-none");
        v.load();
    }
    removeVideo() {
        const v = this.video;
        v.pause();
        v.removeAttribute("src");
        v.classList.add("d-none");
        v.load();
        this.bgCover.classList.remove("full-cover");
    }
    onVideoUpdate() {
        const pos = this.video.currentTime;
        this.bgCover.classList.toggle("full-cover", this.shouldFadeCover &&
            pos > this.video.duration - 1);
    }
}
