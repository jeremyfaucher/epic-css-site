const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const postcss = require('postcss');

// Function to parse HTML and Nunjucks files and extract utility classes
function extractUtilityClasses(rootDir, filePatterns) {
  const utilityClasses = new Set();
  
  // Recursive function to traverse directories and process files
  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDir(filePath);
      } else {
        // Process files based on file patterns
        if (filePatterns.some(pattern => filePath.match(pattern))) {
          const content = fs.readFileSync(filePath, 'utf8');
          const $ = cheerio.load(content);
          $('[class]').each((index, element) => {
            const classes = $(element).attr('class').split(' ');
            classes.forEach(className => {
              if (className.match(/^([a-z]+-)*[a-z0-9]+$/)) {
                utilityClasses.add(className);
              }
            });
          });
        }
      }
    });
  }
  
  // Traverse the root directory
  traverseDir(rootDir);
  
  return Array.from(utilityClasses);
}

// Define root directory and file patterns
const rootDir = process.argv[2] || './src';
const filePatterns = [/\.html$/, /\.njk$/];

// Extract utility classes from the specified directories and file types
const utilityClasses = extractUtilityClasses(rootDir, filePatterns);

// Read Prebuilt stylesheet
const prebuiltStylesPath = `${rootDir}/my-epic-css/build/style.css`; // Adjust this path if necessary
const prebuiltStyles = fs.readFileSync(prebuiltStylesPath, 'utf8');

// Compare classes
const usedClasses = ['body', 'h1', 'h2', 'h3', 'img', 'a', 'ul']; // Manually add the body, h1, and h2 classes
utilityClasses.forEach(className => {
    if (prebuiltStyles.includes(`.${className}`)) {
        usedClasses.push(className);
    }
});

console.log(utilityClasses);

// Parse the CSS using postcss
const root = postcss.parse(prebuiltStyles);
const filteredStyles = [];
root.walkRules(rule => {
    // Check if the rule contains any of the utility classes
    if (usedClasses.some(className => rule.selector.includes(className))) {
        // Check if the parent node is a media query block
        if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'media') {
            // Include the media query block along with the matched rule
            filteredStyles.push(rule.parent.toString());
        }
        // Include the matched rule
        filteredStyles.push(rule.toString());
    }
});

const buildDir = process.argv[3] || '_includes'; // Use '_includes' as the default build directory path
// Join the filtered styles and write them to a new file
const newStylesContent = filteredStyles.join('\n');
fs.writeFileSync(path.join(rootDir, buildDir, 'style.css'), newStylesContent, 'utf8');





// Filter the prebuilt styles to extract only the relevant utility classes and their properties
// const newStyles = [];
// usedClasses.forEach(className => {
//     const regex = new RegExp(`(@media[^{]+{[^}]*${className}[^}]*})|(body[^{]*${className}[^}]*})|(\\.${className}[^{]+{[^}]+})`, 'g');
//     const matches = prebuiltStyles.match(regex);
//     if (matches) {
//         // Log matches for debugging
//         //console.log(`Matches found for class ${className}:`, matches);
        
//         // Add matches to newStyles array
//         newStyles.push(...matches.map(style => {
//             if (style.startsWith('@media') || style.startsWith('body')) {
//                 return style + '}';
//             } else {
//                 return style;
//             }
//         }));
//     }
// });






// Read the styles.css file
// const stylesContent = fs.readFileSync('./src/my-epic-css/build/style.css', 'utf8');

// // Parse the CSS using postcss
// postcss.parse(stylesContent).walkRules(rule => {
//     if (rule.selector === 'body') {
//         console.log(rule.toString());
//     }
// });







// Generate new stylesheet content by joining the extracted styles
// const newStylesContent = newStyles.join('\n');

// // Write the new stylesheet to disk
// const newStylesheetPath = './src/_includes/style-new.css'; // Adjust this path if necessary
// fs.writeFileSync(newStylesheetPath, newStylesContent, 'utf8');

// Export the functionality (if necessary)
// module.exports = {
//   extractUtilityClasses,
//   utilityClasses
// };
