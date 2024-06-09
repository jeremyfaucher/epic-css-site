<p>The Epic CSS 11ty theme is a high performance starter blog theme. It uses the Epic CSS utility-first UI library making it light weight and easy to manage.</p>

<p><a href="https://epic-css-11ty-theme.netlify.app/" target="_blank" rel="noopener">Epic CSS 11ty theme demo site.</a></p>

<h2>Features</h2>

<ul>
<li>Out of the box it <a href="https://pagespeed.web.dev/analysis/https-epic-css-11ty-theme-netlify-app/lzi2towjuf?form_factor=mobile" target="_blank" rel="noopener">scores all 100's on the Lighthouse</a> - performance, accessibility, best practices and SEO. You can also see the day to day testing over at <a href="https://eleventy-starters--speedlify.netlify.app/eleventy-starters/" target="_blank" rel="noopener">speedlify:eleventy-starters</a> leader board.</li>
<li>Ready to go blog loop with SEO friendly URLs and an all in one place to manage title's and description's for SEO.</li>
<li>Fully responsive using CSS Grid and Flexbox.</li>
<li>Integrated with the Epic CSS Sass utility first UI library, making it easy to scale, change layouts and colors.</li>
</ul>

<p><a href="https://github.com/jeremyfaucher/epic-css-11ty-theme" target="_blank" rel="noopener">Download/clone Epic CSS 11ty theme from Github</a> by follow the below instructions.</p>

<h2>Clone and run the Epic CSS 11ty theme</h2>

1. Make a project directory and navigate to it if you don't already have one.

    ```sh
    mkdir my-blog-name
    cd my-blog-project
    ```
2. From your new directory folder clone the [Epic CSS 11ty Theme](https://github.com/jeremyfaucher/epic-css-11ty-theme) from GitHub.

    ```sh
    git clone https://github.com/jeremyfaucher/epic-css-11ty-theme.git
    cd epic-css-11ty-theme
    ```

3. Install dependencies

    ```sh
    npm install
    ```
4. Run Eleventy to start the server and follow to the localhost URL http://localhost:8080/.

    ```sh
    npm run start
    ```

    The `npm run start` command will fire up `eleventy --serve` and watch for any changes to your files. Changes will be auto updated in the browser for fast iterating.

    You will see a folder named `my-epic-css` with and index.scss file in `src` folder, where you can customize your Epic CSS integration.

## Build a light version of your CSS

In your Epic CSS 11ty theme project root folder, you will see the `epicConfig.js` file. This is to configure a light build and will correspond with the Epic CSS 11ty theme folder structure.

```js
module.exports = {
    // project source folder where html, nunjucks or php files are
    projectDir: './src',
    // where epic css theme folder lives
    epicThemeDir: './src/my-epic-css',
    // folder and file where project style sheet lives
    projectStyleDir: './src/_includes/style.css'
};
```

In the package.json file you will see the `epic-build` and `epic-light` commands. These are to update the pre-light.css file, and output a light version of the style.css file.

```js
"epic-build": "node ./node_modules/epic-css/src/epic-build.js",
"epic-light": "node ./node_modules/epic-css/src/epic-light.js"
```

3. Run `npm run epic-build` to update the pre-light.css file to your project, that the `epic-light` command can use to compare to your project file results.

4. Then run `npm run epic-light` to search your project files from the `projectDir` and filter out the found classes against pre-light.css class, then build a lightened version of your project style.css.

This will take the current Epic CSS UI library from 1426 lines of CSS down to only 303 lines of CSS for the Epic CSS 11ty theme. This gives you access to all the UI library styles during development and publishing only the styles you use in your project for production.