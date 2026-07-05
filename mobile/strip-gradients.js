const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processFiles() {
  const dirs = [
    path.join(__dirname, 'app'),
    path.join(__dirname, 'components')
  ];

  dirs.forEach(dir => {
    walkDir(dir, (filePath) => {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('LinearGradient')) {
          // Remove import
          content = content.replace(/import\s*\{\s*LinearGradient\s*\}\s*from\s*["']expo-linear-gradient["'];?\s*/g, '');

          // Replace tags
          content = content.replace(/<LinearGradient/g, '<View');
          content = content.replace(/<\/LinearGradient>/g, '</View>');

          // Remove LinearGradient specific props
          content = content.replace(/colors=\{[^}]+\}\s*/g, '');
          content = content.replace(/start=\{\{[^}]+\}\}\s*/g, '');
          content = content.replace(/end=\{\{[^}]+\}\}\s*/g, '');

          // If View is not imported from react-native, this could break, 
          // but View is almost universally imported in these files.
          // Let's make sure View is in the react-native import block just in case:
          if (!content.includes('View') && content.includes('react-native')) {
             content = content.replace(/import\s*\{/, 'import { View,');
          }

          fs.writeFileSync(filePath, content, 'utf8');
        }
      }
    });
  });
}

processFiles();
