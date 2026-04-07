const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const layout = {
  features: {
    auth: {
      pages: ['Login.jsx', 'SetupPassword.jsx']
    },
    admin: {
      pages: ['AdminDashboard.jsx', 'AdminCreateUser.jsx']
    },
    hr: {
      pages: ['HRDashboard.jsx']
    },
    employee: {
      pages: ['EmployeeDashboard.jsx', 'Guide.jsx']
    },
    chat: {
      pages: ['ChatPage.jsx'],
      components: ['ChatBox.jsx']
    },
    common: {
      pages: ['Profile.jsx', 'Documentation.jsx']
    }
  },
  shared: {
    components: ['NavBar.jsx', 'Footer.jsx', 'DocumentCard.jsx', 'FileUpload.jsx'],
    context: ['AuthContext.jsx', 'ThemeContext.jsx'],
    services: ['api.js']
  }
};

// 1. Locate all files
const oldPaths = {}; // filename -> old absolute path

function traverse(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) traverse(full);
    else oldPaths[item] = full;
  }
}
traverse(path.join(srcDir, 'pages'));
traverse(path.join(srcDir, 'components'));
traverse(path.join(srcDir, 'context'));
traverse(path.join(srcDir, 'services'));

// 2. Compute new paths
const fileMap = {}; // oldPath -> newPath

for (const [feature, folders] of Object.entries(layout.features)) {
  for (const [folder, files] of Object.entries(folders)) {
    for (const file of files) {
      if (oldPaths[file]) {
        fileMap[oldPaths[file]] = path.join(srcDir, 'features', feature, folder, file);
      }
    }
  }
}

for (const [folder, files] of Object.entries(layout.shared)) {
  for (const file of files) {
    if (oldPaths[file]) {
      fileMap[oldPaths[file]] = path.join(srcDir, 'shared', folder, file);
    }
  }
}

// 3. Move files
function ensureDir(p) {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

console.log("Moving frontend files...");
for (const [oldP, newP] of Object.entries(fileMap)) {
  ensureDir(newP);
  fs.renameSync(oldP, newP);
}

// Add App.jsx to the map so we can fix imports inside it
fileMap[path.join(srcDir, 'App.jsx')] = path.join(srcDir, 'App.jsx');
fileMap[path.join(srcDir, 'main.jsx')] = path.join(srcDir, 'main.jsx');

// 4. Update imports
console.log("Fixing imports...");

function getRelativePath(from, to) {
  const fromDir = path.dirname(from);
  let rel = path.relative(fromDir, to).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  // Remove extension for JS/JSX
  return rel.replace(/\.jsx?$/, '');
}

const allNewPaths = Object.values(fileMap);

for (const newPath of allNewPaths) {
  if (!fs.existsSync(newPath)) continue;
  let content = fs.readFileSync(newPath, 'utf8');
  let changed = false;

  // We look for imports like `from '../components/NavBar'`
  // Instead of complex AST, we can just replace known filenames via Regex.
  // Since we know all explicitly moved files:
  for (const [oldP, targetNewP] of Object.entries(fileMap)) {
    const filenameNoExt = path.parse(oldP).name;
    const filenameRegex = new RegExp(`from\\s+['"]([^'"]*\\b${filenameNoExt}(\\.jsx?)?)['"]`, 'g');
    
    content = content.replace(filenameRegex, (match, p1) => {
      // p1 is the relative path they used
      const correctRelative = getRelativePath(newPath, targetNewP);
      changed = true;
      return `from '${correctRelative}'`;
    });
  }

  if (changed) {
    fs.writeFileSync(newPath, content);
  }
}

console.log("Frontend refactor completed!");
