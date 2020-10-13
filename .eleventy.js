const fs = require("fs");
var htmlmin = require('html-minifier').minify;
const minifyXML = require("minify-xml").minify;
const cssInline = require('css');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const time2read = require('eleventy-plugin-time-to-read');
const dateFormat = require('dateformat');

module.exports = function(eleventyConfig){
  
  /**
   * Enable dataDeepMerge: https://www.11ty.dev/docs/data-deep-merge/
   */
  eleventyConfig.setDataDeepMerge(true);

  // plugins used for blog posts
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(time2read);

  /**
   * Copy everything inside the specified folder AS IS (files inside will not be processed)
   * PASSTHROUGH FILE COPY : https://www.11ty.dev/docs/copy/
   */
  eleventyConfig.addPassthroughCopy({ "_static": "/" });
  
  /**
   * Available collectionApi:
   * getAll()	                  Gets all of the items in arbitrary order.
   * getAllSorted()	            Gets all of the items in order.
   * getFilteredByTag(tagName)	Get all of the items with a specific tag.
   * getFilteredByGlob(glob)  
   */

  /**
   * Create collection of "posts" (based on .md files located in _src/posts/)
   */
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_src/posts/*.md");
  });

  // Create collection of pages
  eleventyConfig.addCollection("pages", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_src/views/*.liquid");
  });

  // Create collection of tags (of all used tags INSIDE POSTS)
  eleventyConfig.addCollection("tagList", collection => {
    const tagsSet = new Set();
    collection.getAll().forEach(item => {
      if (!item.data.tags) return;
      item.data.tags
        .filter(tag => !['navitem'].includes(tag))
        .forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  });

  /**
   * Helper shortcode to import css outside _includes folder
   * Gets .css' files internal style, minifies it and outputs it in the block where it was called 
   * Useful for critical-inline css
   */
  eleventyConfig.addShortcode("cssInclude", function(csspath){
    var style = fs.readFileSync(csspath).toString();
    var ast = cssInline.parse(style, {compress: true, sourcemap: false, inputSourcemaps:false });
    var css = cssInline.stringify(ast);
    return css;
  });

  /**
   * Helper shortcode to import js outside _includes folder
   * Gets .js' files internal style and outputs it in the block where it was called 
   */
  eleventyConfig.addShortcode("jsInclude", function(csspath){
    return fs.readFileSync(csspath).toString();
  });

  /**
   * Get current date and format as per dateFormat npm available formats (for more flexibility)
   * dateFormat: https://www.npmjs.com/package/dateformat
   * liquid-example : {% getCurrentDate ""ddd, dd mmm yyyy hh:MM:ss"" %}
   */
  eleventyConfig.addShortcode("getCurrentDate", function(format){
      try{
        var formattedDate = dateFormat(new Date(), format)
      }catch(ex){
        throw new Error("Oops, UNKNOWN date FORMAT!");
      }
      return formattedDate;
  });

  /**
   * Set date based on a given date (string) parameter and format it as per dateFormat npm available formats
   * dateFormat: https://www.npmjs.com/package/dateformat
   * liquid-example : {% setDate "2020-08-11" "dd mmm yyyy" %}
   */
  eleventyConfig.addShortcode("setDate", function(date, format){
      try{
        var formattedDate = dateFormat(new Date(date), format);
      }catch(ex){
        throw new Error("Oops, UNKNOWN date FORMAT!");
      }
      return formattedDate;
  });

  /**
   * In this starter template each page with "navitem" tag has a "order" property in their own frontmatter
   * This filter is used to order those pages based on their "order" val.
   */
  eleventyConfig.addFilter("sortNavItems", function (values) {
    let vals = [...values];     // this *seems* to prevent collection mutation...
    return vals.sort((a, b) => parseInt(a.data.order) - parseInt(b.data.order));
  });

  eleventyConfig.addFilter("truncateText", function (text, n_chars_allowed) {
    if(typeof text === "string"){
      let new_length = Math.min(text.length, n_chars_allowed);
      let new_string = text.substring(0, Math.min(text.length, n_chars_allowed));
      if( text.length > n_chars_allowed){
        // append truncation marks if string was truncated
        new_string +=" ...";
      }
      return new_string;
    }else{
      throw new Error("text parameter is NOT A STRING");
    }
  });

  // Sorts array by date (accepts array of dates or array of objects with "date" prop.)
  eleventyConfig.addFilter("sortByDate", function (values) {
    var vals = [...values]; // prevent collection mutation
    if (typeof vals[0].date != "undefined"){
      return vals.sort(function (a, b){return new Date(a.date) - new Date(b.date);});
    }
    return vals.sort((a, b) => new Date(a) - new Date(b));
  });

  // Enables custom error404 page in developement
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        bs.addMiddleware("*", (req, res) => {
          const path_404 = '_site/error-pages/404/index.html';
          const content_404 = fs.readFileSync(path_404);
          // Provide the 404 content without redirect.
          res.write(content_404);
          // Add 404 http status code in request header.
          res.writeHead(404);
          res.end();
        });
      }
    }
  });
  
  /**
   * Minify html, css and javascript content inside each .html file
   * Minify all .xml files
   */
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath.endsWith(".html") ) {
      let minified = htmlmin(content, {
        useShortDoctype: false,
        removeComments: true,
        minifyCSS: true,
        minifyJS: {compress: true, mangle: false, keep_fnames:true, ie8:true},
        collapseWhitespace: true
      });
      return minified;
    }

    if( outputPath.endsWith(".xml") ) {
      let minified = minifyXML(content, {
        removeComments: true,
        removeWhitespaceBetweenTags: true,
        collapseWhitespaceInTags: true,
        removeUnusedNamespaces: true,
        ignoreCData: true
      });
      return minified;
    }
    return content;
  });

  return {
    dir: {
      includes: "_includes",
      layouts: "_includes/_layouts",
      data: "_global",
	    input: "_src",
      output: "_site"
    }
  };
}