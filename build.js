import fs from 'node:fs';
import path from 'node:path';

const adJson = (() => {
  if (fs.existsSync('ad.json')) {
    return JSON.parse(fs.readFileSync('ad.json', { encoding: 'utf-8' }));
  } else {
    return JSON.parse(process.env.AD_JSON || '{}');
  }
})();
const isAdActive = process.env.AD_ENABLED ? process.env.AD_ENABLED.toLowerCase() === 'true' : false;
const ageRestrictType = process.env.AD_AGE_RESTRICT_TYPE ? (['general', 'restrict'].includes(process.env.AD_AGE_RESTRICT_TYPE) ? process.env.AD_AGE_RESTRICT_TYPE : 'general') : 'general'; // 'general' or 'restrict'

const replaceText = [
  ['<!-- AD - Admax -->',
    '<section id="ads_admax" class="text-center">\n' +
    adJson[ageRestrictType].admaxWide.map(e => `        <script data-cfasync="false" src="https://adm.shinobi.jp/${e}"></script>`).join('\n') +
    '\n      </section>'],
  ['<!-- AD - Admax (square) -->',
    '<section id="ads_admax_square" class="text-center">\n' +
    adJson[ageRestrictType].admaxSquare.map(e => `        <script data-cfasync="false" src="https://adm.shinobi.jp/${e}"></script>`).join('\n') +
    '\n      </section>'],
  ['<!-- AD - AADS -->',
    '<section id="ads_aads" class="text-center">\n' +
    adJson[ageRestrictType].aadsWide.map(e => `        <div id="frame" style="width: 100%; margin: auto; position: relative"><iframe data-aa="${e}" src="https://acceptable.a-ads.com/${e}/?size=Adaptive&background_color=transparent" style="border: 0; padding: 0; width: 100%; height: auto; overflow: hidden; display: block; margin: auto"></iframe></div>`).join('\n') +
    '\n      </section>'],
  ['<!-- AD - Admax (inter) -->',
    `<script data-cfasync="false" src="https://adm.shinobi.jp/${adJson[ageRestrictType].admaxInter}"></script>`],
];

function copyFiles(srcPath, destPath) {
  const stats = fs.statSync(srcPath);

  if (stats.isDirectory()) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    const files = fs.readdirSync(srcPath);
    for (const file of files) {
      const srcFilePath = path.join(srcPath, file);
      const destFilePath = path.join(destPath, file);
      copyFiles(srcFilePath, destFilePath);
    }
  } else {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied: ${srcPath} -> ${destPath}`);
  }
}

function applyAd(filePath) {
  if (path.extname(filePath) !== '.html') return;

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  for (const [from, to] of replaceText) {
    if (content.includes(from)) {
      content = content.replace(from, to);
      modified = true;
      console.log(`Replaced text in: ${filePath}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function main() {
  const srcDir = 'src';
  const destDir = 'build';

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log(`Created ${destDir} directory`);
  }

  console.log('Copying files from src to build...');
  copyFiles(srcDir, destDir);

  if (isAdActive) {
    console.log('Applying text replacements to HTML files...');
    function processFiles(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          processFiles(filePath);
        } else {
          applyAd(filePath);
        }
      }
    }
    processFiles(destDir);
  }

  console.log('Build process completed!');
}

main();
