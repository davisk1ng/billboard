# billboard

A lightweight **digital billboard** built with plain HTML, CSS, and JavaScript.

## What it does

- shows a **public noticeboard layout** for posters and announcements
- supports an **Are.na-based update workflow**
- gives simple instructions so other users can update the board without editing code

## How to connect your Are.na channel

1. Open `config.js`
2. Replace:
   ```js
   arenaChannel: "your-arena-channel-slug"
   ```
   with your real public channel slug
3. Save the file
4. Open `index.html` in a browser, or serve the folder locally

## How other users update the billboard

1. Open the shared **Are.na** channel
2. Add a new image, poster, or announcement link
3. Refresh the website to show the latest content

## Local preview

You can preview the site by opening `index.html` directly in your browser.

If you prefer, you can also use a simple static server or a VS Code extension such as **Live Server**.
