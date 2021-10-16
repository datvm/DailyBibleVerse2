import { SettingsService } from "../services/SettingsService.js";

export const PageBackgroundName = "page-background";

export class PageBackground extends HTMLElement {

    video = this.querySelector<HTMLVideoElement>("video");
    bgCover = this.querySelector(".background-cover");
    bg = this.querySelector<HTMLImageElement>(".background");

    isPlayingDefault = true;
    shouldFadeCover = true;

    constructor() {
        super();

        this.video.addEventListener("timeupdate", () => this.onVideoUpdate());
        this.checkSettings();
    }

    setBgCoverOpacity(value: number) {
        this.style.setProperty("--cover-opacity", value.toString());
    }

    async checkSettings() {
        const bg = await SettingsService.getBgSettingsAsync();

        if (bg.bgImageData) {
            this.removeVideo();
            this.setImage(bg.bgImageData);
            this.isPlayingDefault = false;
        } else if (bg.bgVideoData) {
            this.removeImage();
            this.setVideo(bg.bgVideoData);
            this.isPlayingDefault = false;
        } else if (!this.isPlayingDefault) {
            this.playDefault();
        }

        const commons = await SettingsService.getCommonSettingsAsync();
        this.setBgCoverOpacity(commons.coverOpacity);
        this.shouldFadeCover = commons.coverFade;
    }

    private playDefault() {
        this.isPlayingDefault = true;
        this.setVideo("/img/default-bg.mp4");
    }

    private setImage(imageData: string) {
        const bg = this.bg;
        bg.classList.remove("d-none");
        bg.src = imageData;
    }

    private removeImage() {
        const bg = this.bg;
        bg.classList.add("d-none");
        bg.removeAttribute("src");
    }

    private setVideo(videoData: string) {
        const v = this.video;
        v.src = videoData;
        v.classList.remove("d-none");
        v.load();
    }

    private removeVideo() {
        const v = this.video;
        v.pause();
        v.removeAttribute("src");
        v.classList.add("d-none");
        v.load();
        this.bgCover.classList.remove("full-cover");
    }

    onVideoUpdate() {
        const pos = this.video.currentTime;
        this.bgCover.classList.toggle("full-cover",
            this.shouldFadeCover &&
            pos > this.video.duration - 1);
    }

}