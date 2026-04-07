const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'backend', 'src');

const layout = {
  features: {
    auth: {
      controllers: ['authController.js'],
      routes: ['authRoutes.js']
    },
    admin: {
      controllers: ['adminController.js'],
      routes: ['adminRoutes.js']
    },
    hr: {
      controllers: ['hrController.js'],
      routes: ['hrRoutes.js']
    },
    employee: {
      controllers: ['employeeController.js'],
      routes: ['employeeRoutes.js']
    },
    chat: {
      controllers: ['chatController.js'],
      routes: ['chatRoutes.js'],
      models: ['Chat.js']
    },
    user: {
      controllers: ['userController.js'],
      routes: ['userRoutes.js'],
      models: ['User.js']
    },
    aadhaar: {
      controllers: ['aadhaarController.js'],
      routes: ['aadhaarRoutes.js']
    },
    debug: {
      controllers: ['debugController.js'],
      routes: ['debugRoutes.js']
    }
  },
  shared: {
    models: ['EmployeeDocuments.js', 'Notification.js'],
    middlewares: ['auth.js', 'errorHandler.js', 'upload.js'],
    services: ['cloudinary.js', 'socket.js'],
    utils: ['sendEmail.js']
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
['controllers', 'middlewares', 'models', 'routes', 'services', 'utils'].forEach(d => traverse(path.join(srcDir, d)));

// 2. Compute new paths
const fileMap = {}; 

for (const [feature, types] of Object.entries(layout.features)) {
  for (const [type, files] of Object.entries(types)) {
    for (const file of files) {
      if (oldPaths[file]) {
        fileMap[oldPaths[file]] = path.join(srcDir, 'features', feature, file);
      }
    }
  }
}

for (const [folder, files] of Object.entries(layout.shared)) {
  for (const file of files) {
    if (oldPaths[file]) {
      fileMap[oldPaths[file]] = path.join(srcDir, 'core', folder, file);
    }
  }
}

// 3. Move files
function ensureDir(p) {
  const d = path.dirname(p);
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

console.log("Moving backend files...");
for (const [oldP, newP] of Object.entries(fileMap)) {
  ensureDir(newP);
  fs.renameSync(oldP, newP);
}

fileMap[path.join(srcDir, 'server.js')] = path.join(srcDir, 'server.js');
fileMap[path.join(srcDir, 'app.js')] = path.join(srcDir, 'app.js');

// 4. Update imports
console.log("Fixing imports...");

function getRelativePath(from, to) {
  const fromDir = path.dirname(from);
  let rel = path.relative(fromDir, to).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel.replace(/\.js$/, '');
}

const allNewPaths = Object.values(fileMap);

for (const newPath of allNewPaths) {
  if (!fs.existsSync(newPath)) continue;
  let content = fs.readFileSync(newPath, 'utf8');
  let changed = false;

  for (const [oldP, targetNewP] of Object.entries(fileMap)) {
    const filenameNoExt = path.parse(oldP).name;
    const filenameRegex = new RegExp(`require\\s*\\(['"]([^'"]*\\b${filenameNoExt}(\\.js)?)['"]\\)`, 'g');
    
    content = content.replace(filenameRegex, (match, p1) => {
      const correctRelative = getRelativePath(newPath, targetNewP);
      changed = true;
      return `require('${correctRelative}')`;
    });
  }

  if (changed) {
    fs.writeFileSync(newPath, content);
  }
}

// Clean up old directories
['controllers', 'middlewares', 'models', 'routes', 'services', 'utils'].forEach(d => {
  const dir = path.join(srcDir, d);
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
});

console.log("Backend refactor completed!");
