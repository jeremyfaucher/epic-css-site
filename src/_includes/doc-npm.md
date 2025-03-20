<p>Follow the instruction below to add to any project using node.js and the <a href="https://www.npmjs.com/package/epic-css" target="_blank" rel="noopener">epic-css node.js package</a>.</p>

<p>Or use with the pre-integrated <a href="https://github.com/jeremyfaucher/epic-css-11ty-theme" target="_blank" rel="noopener">Epic CSS 11ty theme</a> by cloning from Github.</p>

## NPM custom install

1. **Install dependencies**:
    ```
    npm install sass
    npm install epic-css
    ``` 
    This will install Sass and Epic CSS in your `package.json` file as dependencies.

2. **Add script command:**

    In your package.json file add the `epic-compile` command.

    ```
    "epic-compile": "sass --style expanded --source-map --embed-sources --no-error-css --quiet src/my-epic-css/index.scss:src/_includes/style.css"
    ```

    To use, run `npm run epic-compile`. This will build your style sheet based on the directory input and output for this folder structure or adjust as needed.

    ```
    my-project/
        ├── src/
        │   └── _include/
        │       └── styles.css 
        │   └── my-epic-css/
        │       └── index.scss 
        ├── node_modules/
        ├── package.json
        └── README.md
    ```

3. **Import the Epic CSS library:**

    Add a folder in the `src` folder or your projects main folder and give it a name of your choice like `my-epic-css`. Then create `index.scss` file and add the imports like this:

    ```
    @import  "../../node_modules/epic-css/src/index";
    ```
    or individually like:
    ```
    @import  "../../node_modules/epic-css/src/_variables";
    @import  "../../node_modules/epic-css/src/_base";
    @import  "../../node_modules/epic-css/src/_fontramp";
    @import  "../../node_modules/epic-css/src/_colors";
    @import  "../../node_modules/epic-css/src/_images";
    @import  "../../node_modules/epic-css/src/grid";
    @import  "../../node_modules/epic-css/src/_spacers";
    ```

## Remove any styles that are not in your project from .css build

1. Add `epicConfig.js` file to the root of your project where your package.json lives.

    ```js
    module.exports = {
    // Project source folder where HTML, Nunjucks, or PHP files are located from root
    projectDir: './src',
    // Where your epic CSS theme lives from root
    epicThemeDir: './src/my-epic-css',
    // The directory where your CSS file will be saved
    projectStyleDir: './src/_includes',
    // The name of the final CSS file
    outputFileName: 'style.css'
    };
    ```

2. Add the following commands as of version 0.3.0

    ```js
    "epic-light": "node ./node_modules/epic-css/src/epic-light.js",
    "epic-build": "node ./node_modules/epic-css/src/epic-build.js"
    ```

3. Run `npm run epic-build` to do a quick start and add a pre-light.css to your project Epic CSS theme folder.

4. Then run `npm run epic-light` to search your project file from the projectDir and filter the found classes against the pre-light.css and build lightened version of your project styles.css.  