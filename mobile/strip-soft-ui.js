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

        // Replace border radius
        content = content.replace(/borderRadius:\s*\d+,?/g, 'borderRadius: 0,');
        content = content.replace(/borderTopLeftRadius:\s*\d+,?/g, 'borderTopLeftRadius: 0,');
        content = content.replace(/borderTopRightRadius:\s*\d+,?/g, 'borderTopRightRadius: 0,');
        content = content.replace(/borderBottomLeftRadius:\s*\d+,?/g, 'borderBottomLeftRadius: 0,');
        content = content.replace(/borderBottomRightRadius:\s*\d+,?/g, 'borderBottomRightRadius: 0,');

        // Remove shadows
        content = content.replace(/shadowColor:\s*[^,}]+,?\s*/g, '');
        content = content.replace(/shadowOpacity:\s*[^,}]+,?\s*/g, '');
        content = content.replace(/shadowRadius:\s*[^,}]+,?\s*/g, '');
        content = content.replace(/shadowOffset:\s*\{[^}]+\},?\s*/g, '');
        content = content.replace(/elevation:\s*[^,}]+,?\s*/g, '');

        fs.writeFileSync(filePath, content, 'utf8');
      }
    });
  });
}

processFiles();
