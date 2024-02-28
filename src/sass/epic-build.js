const fs = require('fs');
const { exec } = require('child_process');

// Get the build folder path from the command-line arguments or use a default value
const buildFolderPath = process.argv[2] || 'src';
const sassFilePath = `${buildFolderPath}/my-epic-css/build/style.css`;

// Function to create the build folder if it doesn't exist
const createBuildFolder = (folderPath) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Build folder created at ${folderPath}`);
  }
};

// Create the build folder if it doesn't exist
createBuildFolder(`${buildFolderPath}/my-epic-css/build`);

// Check if the Sass file exists, if not, create an empty one
if (!fs.existsSync(sassFilePath)) {
  fs.writeFileSync(sassFilePath, '', 'utf8');
  console.log(`Sass file created at ${sassFilePath}`);
}

// Compile Sass file
exec(`sass --style expanded --source-map --embed-sources --no-error-css --quiet ${buildFolderPath}/my-epic-css/index.scss:${sassFilePath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  console.log(`Sass file compiled successfully to ${sassFilePath}`);
  
  // Read the compiled Sass file content
  const sassFileContent = fs.readFileSync(sassFilePath, 'utf8');
  
  // Process the Sass file content (add additional processing here if needed)
  // For example, extract utility classes, merge with existing styles, etc.
  
  // Write the processed content back to the file
  fs.writeFileSync(sassFilePath, sassFileContent, 'utf8');
  
  console.log(`Processed Sass file content written back to ${sassFilePath}`);
});








// const fs = require('fs');
// const sass = require('sass');
// const path = require('path');

// // Function to compile Sass files
// function compileSass(inputFile, outputFile) {
//   return new Promise((resolve, reject) => {
//     sass.render({
//       file: inputFile,
//       outputStyle: 'expanded',
//       sourceMap: true,
//       outFile: outputFile,
//     }, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// }

// // Compile _base.scss file
// const baseSassFile = './src/sass/_base.scss';
// const tempCssFile = path.resolve('./src/_includes/temp-base-styles.css'); // Temporary output file for compiled base styles
// compileSass(baseSassFile, tempCssFile)
//   .then(() => {
//     console.log(`Compiled ${baseSassFile} to ${tempCssFile}`);
    
//     // Read prebuilt stylesheet (existing styles)
//     const prebuiltStylesPath = './src/_includes/style.css';
//     const prebuiltStyles = fs.readFileSync(prebuiltStylesPath, 'utf8');

//     // Read compiled base styles
//     const baseStyles = fs.readFileSync(tempCssFile, 'utf8');

//     // Concatenate base styles with prebuilt styles
//     const newStylesContent = baseStyles + '\n' + prebuiltStyles;

//     // Write the new stylesheet to disk, overwriting the existing styles.css
//     fs.writeFileSync(prebuiltStylesPath, newStylesContent, 'utf8');
//     console.log('Merged base styles with prebuilt styles');

//     // Remove the temporary CSS file
//     fs.unlinkSync(tempCssFile);
//     console.log('Temporary CSS file removed');
//   })
//   .catch(err => {
//     console.error('Error compiling Sass:', err);
//   });
