String.prototype.loc = function() {
    return chrome.i18n.getMessage(this) || this;
}