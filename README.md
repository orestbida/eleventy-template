# ⚡️ simple eleventy-template

This is a starter `template` I made for my own portfolio/blog website, powered by [11ty](https://github.com/11ty/eleventy).

## Demo
- [Netlify](https://github.com/11ty/eleventy)

## Features
- uses **.liquid** files by default
- **Automatic minification** of .html, .xml && .css files
- Automatic generation (rss) **feed.xml** & **sitemap.xml**
- **Sass support** (with automatic compile on save)
- **PWA ready** for caching && offline support
- Previous && next navigation for posts
- Support for **custom date formats** via dateFormat npm package

## Getting Started
1. Clone this repository
    ```
    git clone https://github.com/orestbida/eleventy-starter-r2.git
    ```
2. Navigate to the directory
    ```
    cd eleventy-starter-r2
    ```
3. Install dependencies
    ```
    npm install
    ```
4. Edit _data/metadata.json
5. Run Eleventy with Sass
    ```
    npm run dev
    npm run build