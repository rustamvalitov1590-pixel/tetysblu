const fs = require('fs');

const path = 'c:/Users/rustava/Downloads/Проекты/tetis-blue-calc/index.html';
let html = fs.readFileSync(path, 'utf8');

// The exact strings to search for
const crmStart = '<section class="neon-card-blue p-5 mt-6 relative rounded-2xl shadow-sm flex flex-col">';
const crmEnd = 'id="exportData"';
const crmEndTag = '</section>';

// Find CRM bounds
let crmIndex = html.indexOf(crmStart);
let crmEndIndex = html.indexOf(crmEndTag, html.indexOf(crmEnd, crmIndex)) + crmEndTag.length;

let crmBlock = html.substring(crmIndex, crmEndIndex);
html = html.substring(0, crmIndex) + html.substring(crmEndIndex);

// Remove mt-6 from CRM block
crmBlock = crmBlock.replace('mt-6 ', '');

// Find Stats bounds
const statsStart = '<!-- Dynamic Stats Summary Panel -->';
const statsEndTag = '</section>';
let statsIndex = html.indexOf(statsStart);
// Finding the correct end tag for stats
// Stats has nested divs, but it ends with </section>
let statsEndIndex = html.indexOf(statsEndTag, html.indexOf('id="statBday"', statsIndex)) + statsEndTag.length;

let statsBlock = html.substring(statsIndex, statsEndIndex);
html = html.substring(0, statsIndex) + html.substring(statsEndIndex);

// Insert before Итоговый расчет
const insertStart = '<!-- Calculated Estimate Summary';
let insertIndex = html.indexOf(insertStart);

let before = html.substring(0, insertIndex);
let after = html.substring(insertIndex);

let newHtml = before + statsBlock + '\n\n                <!-- Export CRM Panel -->\n                ' + crmBlock + '\n\n                ' + after;

fs.writeFileSync(path, newHtml);
console.log('Success');
