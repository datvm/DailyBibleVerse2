Soli Deo Gloria!

# Installing from the Stores

You can install the extension from [Microsoft Edge Addon Store](https://microsoftedge.microsoft.com/addons/detail/daily-bible-verse/noofbgghmgimloiejmhokmjgaipnnijd) if you are using Microsoft Edge.

The Chrome Store extension is being submitted. I will update the URL when it is approved.

# About The Extension

An extension that replaces your New Tab page with a daily devotional Bible Verse.  With hundreds of Bible versions to select from, you can choose your favorite to display. You can also choose your favorite wallpaper as image or video.

This extension is dedicated to the LORD, and does not include any type of advertisements or tracking. The source code is available freely to everyone who wants to use it for the purpose of glorifying God, the LORD Almighty.

This is the 2nd version of the extension with big changes. Therefore I publish it separately from the old one because very old machines may not be able to run this one. This version includes:

- Daily Bible Verse with customizable Bible versions from many languages. A copy button is now added.

- Customizable background: you can pick a video or photo for your wallpaper now.

- Customizable Clock.

Feel free to fork this repository or post any issue here. Please try not to add any tracking or advertisement if you use this project code.

# Compiling

This extension is developed using TypeScript so there are a few files and folders that should not be included in the final build. I included the `compile-node.js` file in the root folder of the project. You can run it with NodeJS:

```
node .\compile-node.js
```

to create a `bin` folder (so that the built folder is ignored and don't accidentally get to your Git repository) without extra unneeded files.
