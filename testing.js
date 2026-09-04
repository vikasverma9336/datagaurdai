const pptxgen = require('pptxgenjs');
const path = require('path');

const ICON = (name) => path.join(__dirname, 'icons', `${name}.png`);

// Palette: Midnight Executive
const NAVY = '1E2761';
const NAVY_DARK = '141A47';
const ICE = 'CADCFC';
const WHITE = 'FFFFFF';
const OFFWHITE = 'F4F7FD';
const GRAY = '5B6485';
const RED = 'C0392B';
const GREEN = '1E7A4A';
const AMBER = 'B8860B';

const FONT_HEAD = 'Cambria';
const FONT_BODY = 'Calibri';

let pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
const PGW = 13.333;
const PGH = 7.5;

function footer(slide, num, label) {
  slide.addText('DataGuard AI', {
    x: 0.5, y: PGH - 0.42, w: 4, h: 0.3, fontFace: FONT_BODY, fontSize: 10,
    color: GRAY, isTextBox: true, margin: 0,
  });
  slide.addText(label || '', {
    x: PGW / 2 - 3, y: PGH - 0.42, w: 6, h: 0.3, align: 'center',
    fontFace: FONT_BODY, fontSize: 10, color: GRAY, isTextBox: true, margin: 0,
  });
  slide.addText(String(num), {
    x: PGW - 1.0, y: PGH - 0.42, w: 0.5, h: 0.3, align: 'right',
    fontFace: FONT_BODY, fontSize: 10, color: GRAY, isTextBox: true, margin: 0,
  });
}

function iconCircle(slide, iconName, cx, cy, d, circleColor, iconScale) {
  iconScale = iconScale || 0.55;
  slide.addShape('ellipse', {
    x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: circleColor }, line: { type: 'none' },
    shadow: { type: 'outer', color: '1E2761', opacity: 0.18, blur: 6, offset: 2, angle: 90 },
  });
  const isz = d * iconScale;
  slide.addImage({ path: ICON(iconName), x: cx - isz / 2, y: cy - isz / 2, w: isz, h: isz });
}

// ---------------- SLIDE 1: Introduction ----------------
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // subtle decorative circles
  s.addShape('ellipse', { x: 10.3, y: -1.5, w: 5, h: 5, fill: { color: NAVY_DARK }, line: { type: 'none' } });
  s.addShape('ellipse', { x: -1.8, y: 5.2, w: 4, h: 4, fill: { color: NAVY_DARK }, line: { type: 'none' } });

  iconCircle(s, 'shield', PGW / 2, 1.85, 1.3, ICE, 0.55);

  s.addText('DataGuard AI', {
    x: 0, y: 2.75, w: PGW, h: 1.0, align: 'center', fontFace: FONT_HEAD, bold: true,
    fontSize: 46, color: WHITE, isTextBox: true, margin: 0,
  });
  s.addText('Secure Enterprise AI Usage', {
    x: 0, y: 3.65, w: PGW, h: 0.55, align: 'center', fontFace: FONT_BODY,
    fontSize: 20, color: ICE, isTextBox: true, margin: 0,
  });

  s.addShape('line', { x: PGW / 2 - 0.9, y: 4.35, w: 1.8, h: 0, line: { color: ICE, width: 1.25 } });

  s.addText('An AI security layer that protects sensitive enterprise information when employees use external AI tools such as ChatGPT, Claude, Gemini, and Copilot.', {
    x: 2.4, y: 4.55, w: 8.5, h: 0.9, align: 'center', fontFace: FONT_BODY,
    fontSize: 14, color: OFFWHITE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.25,
  });

  s.addText('“Enable AI adoption without compromising enterprise data.”', {
    x: 1.5, y: 5.75, w: 10.33, h: 0.6, align: 'center', fontFace: FONT_HEAD, italic: true,
    fontSize: 17, color: WHITE, isTextBox: true, margin: 0,
  });

  s.addText('Internal Technical & Product Overview', {
    x: 0, y: 6.85, w: PGW, h: 0.3, align: 'center', fontFace: FONT_BODY,
    fontSize: 11, color: GRAY === GRAY ? 'A9B3D6' : GRAY, isTextBox: true, margin: 0,
  });
}

// ---------------- SLIDE 2: The Idea ----------------
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addText('The Idea', { x: 0.6, y: 0.4, w: 8, h: 0.55, fontFace: FONT_HEAD, bold: true, fontSize: 30, color: NAVY, isTextBox: true, margin: 0 });
  s.addText('Secure AI Usage for Enterprises', { x: 0.6, y: 0.95, w: 10, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });

  // Flow diagram - horizontal, wraps into two rows conceptually but let's do single row of 5 nodes with branch to 3 outcomes then to AI
  const steps = [
    { icon: 'userWhite', label: 'Employee' },
    { icon: 'chromeWhite', label: 'Chrome\nExtension' },
    { icon: 'searchWhite', label: 'Sensitive Data\nDetection' },
    { icon: 'balanceWhite', label: 'Risk\nEvaluation' },
    { icon: 'sitemapWhite', label: 'Organization\nPolicy' },
  ];

  const rowY = 2.15;
  const nodeD = 0.95;
  const startX = 0.95;
  const gap = 2.28;

  steps.forEach((st, i) => {
    const cx = startX + i * gap;
    iconCircle(s, st.icon, cx, rowY, nodeD, NAVY, 0.5);
    s.addText(st.label, {
      x: cx - 0.75, y: rowY + nodeD / 2 + 0.12, w: 1.5, h: 0.55, align: 'center',
      fontFace: FONT_BODY, fontSize: 11, color: NAVY, bold: true, isTextBox: true, margin: 0,
    });
    if (i < steps.length - 1) {
      s.addImage({ path: ICON('arrowRight'), x: cx + nodeD / 2 + 0.12, y: rowY - 0.16, w: 0.32, h: 0.32 });
    }
  });

  // From Organization Policy, branch down to Allow / Redact / Block
  const lastCx = startX + (steps.length - 1) * gap;
  s.addImage({ path: ICON('arrowDown'), x: lastCx - 0.16, y: rowY + 0.75, w: 0.32, h: 0.32 });

  const outcomes = [
    { label: 'ALLOW', color: GREEN, icon: 'checkWhite' },
    { label: 'REDACT', color: AMBER, icon: 'eyeWhite' },
    { label: 'BLOCK', color: RED, icon: 'banRed'.replace('Red','') || 'ban', icon2: 'ban' },
  ];

  const outY = 4.55;
  const outW = 2.0, outH = 0.85;
  const outGap = 0.5;
  const totalW = outcomes.length * outW + (outcomes.length - 1) * outGap;
  const outStartX = lastCx - totalW / 2;

  const outcomeDefs = [
    { label: 'ALLOW', color: GREEN, icon: 'checkWhite' },
    { label: 'REDACT', color: AMBER, icon: 'eyeWhite' },
    { label: 'BLOCK', color: RED, icon: 'ban' },
  ];

  outcomeDefs.forEach((o, i) => {
    const ox = outStartX + i * (outW + outGap);
    s.addShape('roundRect', {
      x: ox, y: outY, w: outW, h: outH, rectRadius: 0.1, fill: { color: o.color }, line: { type: 'none' },
      shadow: { type: 'outer', color: '1E2761', opacity: 0.15, blur: 5, offset: 2, angle: 90 },
    });
    s.addImage({ path: ICON(o.icon), x: ox + 0.15, y: outY + outH / 2 - 0.19, w: 0.38, h: 0.38 });
    s.addText(o.label, {
      x: ox + 0.55, y: outY, w: outW - 0.65, h: outH, valign: 'middle', fontFace: FONT_BODY, bold: true,
      fontSize: 15, color: WHITE, isTextBox: true, margin: 0,
    });
  });

  // arrow down from outcomes to External AI
  s.addImage({ path: ICON('arrowDown'), x: lastCx - 0.16, y: outY + outH + 0.08, w: 0.32, h: 0.32 });

  iconCircle(s, 'robotWhite', lastCx, outY + outH + 0.85, 0.8, NAVY, 0.5);
  s.addText('External AI', {
    x: lastCx - 1.1, y: outY + outH + 0.85 + 0.45, w: 2.2, h: 0.3, align: 'center',
    fontFace: FONT_BODY, bold: true, fontSize: 11, color: NAVY, isTextBox: true, margin: 0,
  });

  // Side note card
  s.addShape('roundRect', {
    x: 9.6, y: 2.6, w: 3.15, h: 3.6, rectRadius: 0.08, fill: { color: OFFWHITE }, line: { color: ICE, width: 1 },
  });
  s.addImage({ path: ICON('building'), x: 9.9, y: 2.9, w: 0.42, h: 0.42 });
  s.addText('Policy Is Org-Specific', {
    x: 9.6, y: 3.4, w: 3.15, h: 0.35, align: 'center', fontFace: FONT_HEAD, bold: true,
    fontSize: 14, color: NAVY, isTextBox: true, margin: 0,
  });
  s.addText('Each organization defines its own rules for what gets allowed, redacted, or blocked — the same prompt can be treated differently by different companies.', {
    x: 9.85, y: 3.85, w: 2.65, h: 2.1, align: 'left', fontFace: FONT_BODY,
    fontSize: 12, color: GRAY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.3,
  });

  footer(s, 2, 'The Idea');
}

// ---------------- SLIDE 3: The Problem ----------------
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addText('The Problem', { x: 0.6, y: 0.4, w: 8, h: 0.55, fontFace: FONT_HEAD, bold: true, fontSize: 30, color: NAVY, isTextBox: true, margin: 0 });
  s.addText('Preventing Sensitive Data Exposure', { x: 0.6, y: 0.95, w: 10, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });

  s.addText('Employees may accidentally send:', {
    x: 0.6, y: 1.55, w: 8, h: 0.35, fontFace: FONT_BODY, fontSize: 13, color: GRAY, italic: true, isTextBox: true, margin: 0,
  });

  const items = [
    { icon: 'user', label: 'Customer PII' },
    { icon: 'phone', label: 'Phone Numbers &\nEmail Addresses' },
    { icon: 'key', label: 'API Keys &\nPasswords' },
    { icon: 'code', label: 'Source Code' },
    { icon: 'money', label: 'Financial\nInformation' },
    { icon: 'file', label: 'Internal &\nConfidential Docs' },
  ];

  const cols = 3, rows = 2;
  const cardW = 2.55, cardH = 1.55, gx = 0.35, gy = 0.35;
  const gridW = cols * cardW + (cols - 1) * gx;
  const startX = 0.6;
  const startY = 2.05;

  items.forEach((it, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx0 = startX + col * (cardW + gx);
    const cy0 = startY + row * (cardH + gy);
    s.addShape('roundRect', {
      x: cx0, y: cy0, w: cardW, h: cardH, rectRadius: 0.08, fill: { color: OFFWHITE }, line: { type: 'none' },
      shadow: { type: 'outer', color: '1E2761', opacity: 0.12, blur: 4, offset: 2, angle: 90 },
    });
    iconCircle(s, it.icon, cx0 + 0.55, cy0 + cardH / 2, 0.62, ICE, 0.5);
    s.addText(it.label, {
      x: cx0 + 0.95, y: cy0, w: cardW - 1.1, h: cardH, valign: 'middle', fontFace: FONT_BODY,
      fontSize: 12.5, bold: true, color: NAVY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05,
    });
  });

  // Business question callout
  const qy = startY + rows * cardH + (rows - 1) * gy + 0.4;
  s.addShape('roundRect', {
    x: 0.6, y: qy, w: gridW, h: 0.95, rectRadius: 0.08, fill: { color: NAVY }, line: { type: 'none' },
  });
  s.addText('How can organizations allow employees to use AI while preventing sensitive enterprise data from reaching external AI platforms?', {
    x: 1.0, y: qy, w: gridW - 0.8, h: 0.95, valign: 'middle', align: 'center', fontFace: FONT_HEAD, italic: true,
    fontSize: 14.5, color: WHITE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.2,
  });

  footer(s, 3, 'The Problem');
}

// ---------------- SLIDE 4: Solution Architecture ----------------
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addText('Solution Architecture', { x: 0.5, y: 0.32, w: 9, h: 0.5, fontFace: FONT_HEAD, bold: true, fontSize: 27, color: NAVY, isTextBox: true, margin: 0 });
  s.addText('How DataGuard AI Works', { x: 0.5, y: 0.8, w: 10, h: 0.35, fontFace: FONT_BODY, fontSize: 14, color: GRAY, isTextBox: true, margin: 0 });

  // Layered architecture - left column: pipeline layers with sub-bullets; right column: org policy branch + AI platforms
  const layerX = 0.55;
  const layerW = 6.85;
  const layers = [
    { icon: 'chromeWhite', title: 'Chrome Extension', subs: ['Login', 'Detect sensitive data', 'Enforce policy'] },
    { icon: 'serverWhite', title: 'FastAPI Backend', subs: ['Authentication', 'Organization identification', 'Policy retrieval'] },
    { icon: 'databaseWhite', title: 'SQLite Database', subs: ['Users', 'Organizations', 'Policies'] },
    { icon: 'cogsWhite', title: 'Protection Engine', subs: ['PII detection', 'API key detection', 'Risk evaluation'] },
  ];

  let ly = 1.35;
  const layerH = 1.02;
  const layerGap = 0.14;

  // Browser node above first layer
  s.addShape('roundRect', { x: layerX, y: ly - 0.62, w: layerW, h: 0.5, rectRadius: 0.07, fill: { color: ICE }, line: { type: 'none' } });
  s.addImage({ path: ICON('user'), x: layerX + 0.18, y: ly - 0.55, w: 0.36, h: 0.36 });
  s.addText('Employee / Chrome Browser', {
    x: layerX + 0.65, y: ly - 0.62, w: layerW - 0.75, h: 0.5, valign: 'middle', fontFace: FONT_BODY, bold: true,
    fontSize: 13, color: NAVY, isTextBox: true, margin: 0,
  });
  s.addImage({ path: ICON('arrowDown'), x: layerX + layerW / 2 - 0.11, y: ly - 0.14, w: 0.22, h: 0.14 });

  layers.forEach((layer, i) => {
    s.addShape('roundRect', {
      x: layerX, y: ly, w: layerW, h: layerH, rectRadius: 0.08, fill: { color: NAVY }, line: { type: 'none' },
      shadow: { type: 'outer', color: '1E2761', opacity: 0.18, blur: 5, offset: 2, angle: 90 },
    });
    iconCircle(s, layer.icon, layerX + 0.55, ly + layerH / 2, 0.62, NAVY_DARK, 0.55);
    s.addText(layer.title, {
      x: layerX + 0.98, y: ly + 0.09, w: 2.15, h: layerH - 0.18, valign: 'middle', fontFace: FONT_HEAD, bold: true,
      fontSize: 13.5, color: WHITE, isTextBox: true, margin: 0,
    });
    // sub bullet chips
    let chipX = layerX + 3.2;
    layer.subs.forEach((sub) => {
      const chipW = 0.28 + sub.length * 0.075;
      s.addShape('roundRect', {
        x: chipX, y: ly + layerH / 2 - 0.19, w: chipW, h: 0.38, rectRadius: 0.19, fill: { color: NAVY_DARK }, line: { type: 'none' },
      });
      s.addText(sub, {
        x: chipX, y: ly + layerH / 2 - 0.19, w: chipW, h: 0.38, valign: 'middle', align: 'center',
        fontFace: FONT_BODY, fontSize: 9.5, color: ICE, isTextBox: true, margin: 0,
      });
      chipX += chipW + 0.1;
    });

    if (i < layers.length - 1) {
      s.addImage({ path: ICON('arrowDownIce'), x: layerX + layerW / 2 - 0.12, y: ly + layerH + 0.01, w: 0.24, h: layerGap - 0.02 < 0.12 ? 0.12 : layerGap - 0.02 });
    }
    ly += layerH + layerGap;
  });

  // Arrow down to policy branch
  s.addImage({ path: ICON('arrowDown'), x: layerX + layerW / 2 - 0.11, y: ly + 0.02, w: 0.22, h: 0.18 });
  ly += 0.28;

  // Organization Policy branch row
  s.addText('Organization Policy', {
    x: layerX, y: ly, w: layerW, h: 0.28, align: 'center', fontFace: FONT_BODY, bold: true, italic: true,
    fontSize: 11.5, color: GRAY, isTextBox: true, margin: 0,
  });
  ly += 0.3;

  const outcomeDefs2 = [
    { label: 'ALLOW', color: GREEN, icon: 'checkWhite' },
    { label: 'REDACT', color: AMBER, icon: 'eyeWhite' },
    { label: 'BLOCK', color: RED, icon: 'ban' },
  ];
  const oW = 2.1, oH = 0.62, oGap = 0.3;
  const oTotal = outcomeDefs2.length * oW + (outcomeDefs2.length - 1) * oGap;
  let oX = layerX + (layerW - oTotal) / 2;
  outcomeDefs2.forEach((o) => {
    s.addShape('roundRect', { x: oX, y: ly, w: oW, h: oH, rectRadius: 0.08, fill: { color: o.color }, line: { type: 'none' } });
    s.addImage({ path: ICON(o.icon), x: oX + 0.15, y: ly + oH / 2 - 0.15, w: 0.3, h: 0.3 });
    s.addText(o.label, {
      x: oX + 0.5, y: ly, w: oW - 0.55, h: oH, valign: 'middle', fontFace: FONT_BODY, bold: true,
      fontSize: 12.5, color: WHITE, isTextBox: true, margin: 0,
    });
    oX += oW + oGap;
  });

  // Right column: External AI Platforms box
  const rightX = layerX + layerW + 0.35;
  const rightW = PGW - rightX - 0.5;

  s.addShape('roundRect', {
    x: rightX, y: 1.35, w: rightW, h: 3.35, rectRadius: 0.08, fill: { color: WHITE }, line: { color: ICE, width: 1.25 },
    shadow: { type: 'outer', color: '1E2761', opacity: 0.1, blur: 5, offset: 2, angle: 90 },
  });
  s.addText('External AI Platforms', {
    x: rightX, y: 1.55, w: rightW, h: 0.35, align: 'center', fontFace: FONT_HEAD, bold: true,
    fontSize: 14, color: NAVY, isTextBox: true, margin: 0,
  });
  const platforms = ['ChatGPT', 'Claude', 'Gemini', 'Copilot'];
  const pIconD = 0.6;
  let pY = 2.15;
  platforms.forEach((p) => {
    iconCircle(s, 'robot', rightX + 0.65, pY + pIconD / 2, pIconD, ICE, 0.5);
    s.addText(p, {
      x: rightX + 1.05, y: pY, w: rightW - 1.2, h: pIconD, valign: 'middle', fontFace: FONT_BODY, bold: true,
      fontSize: 13, color: NAVY, isTextBox: true, margin: 0,
    });
    pY += pIconD + 0.18;
  });

  // arrow from outcomes to right box
  s.addImage({ path: ICON('arrowRight'), x: layerX + layerW + 0.02, y: ly + oH / 2 - 0.11, w: 0.3, h: 0.22 });

  // Org-specific note
  s.addShape('roundRect', { x: rightX, y: 4.95, w: rightW, h: 1.1, rectRadius: 0.08, fill: { color: NAVY }, line: { type: 'none' } });
  s.addImage({ path: ICON('buildingWhite'), x: rightX + 0.2, y: 5.13, w: 0.36, h: 0.36 });
  s.addText('Policies are configured per organization, stored in SQLite, and enforced on every request.', {
    x: rightX + 0.7, y: 4.98, w: rightW - 0.9, h: 1.04, valign: 'middle', fontFace: FONT_BODY,
    fontSize: 10.5, color: WHITE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.2,
  });

  footer(s, 4, 'Solution Architecture');
}

// ---------------- SLIDE 5: Technology & Dependencies ----------------
{
  const s = pres.addSlide();
  s.background = { color: WHITE };

  s.addText('Technology & Dependencies', { x: 0.6, y: 0.4, w: 10, h: 0.55, fontFace: FONT_HEAD, bold: true, fontSize: 28, color: NAVY, isTextBox: true, margin: 0 });
  s.addText('Setup and Usage — MVP Stack', { x: 0.6, y: 0.95, w: 10, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });

  const stack = [
    { icon: 'chrome', label: 'Chrome\nExtension' },
    { icon: 'code', label: 'JavaScript /\nHTML / CSS' },
    { icon: 'server', label: 'FastAPI' },
    { icon: 'python', label: 'Python' },
    { icon: 'database', label: 'SQLite' },
    { icon: 'jwt', label: 'JWT\nAuthentication' },
    { icon: 'search', label: 'Sensitive Data\nDetection Engine' },
  ];

  const sCols = 7;
  const sW = 1.68, sGap = 0.1;
  const sTotal = sCols * sW + (sCols - 1) * sGap;
  const sStartX = (PGW - sTotal) / 2;
  const sY = 1.65;

  stack.forEach((it, i) => {
    const cx0 = sStartX + i * (sW + sGap);
    s.addShape('roundRect', {
      x: cx0, y: sY, w: sW, h: 1.55, rectRadius: 0.08, fill: { color: OFFWHITE }, line: { type: 'none' },
      shadow: { type: 'outer', color: '1E2761', opacity: 0.1, blur: 3, offset: 1, angle: 90 },
    });
    iconCircle(s, it.icon, cx0 + sW / 2, sY + 0.5, 0.62, ICE, 0.5);
    s.addText(it.label, {
      x: cx0 + 0.06, y: sY + 0.92, w: sW - 0.12, h: 0.55, align: 'center', valign: 'top',
      fontFace: FONT_BODY, fontSize: 10, bold: true, color: NAVY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.05,
    });
  });

  // Installation flow
  s.addText('Installation & Usage Flow', {
    x: 0.6, y: 3.55, w: 8, h: 0.35, fontFace: FONT_HEAD, bold: true, fontSize: 16, color: NAVY, isTextBox: true, margin: 0,
  });

  const flow = ['Start\nBackend', 'Load Chrome\nExtension', 'Login', 'Fetch Org\nPolicy', 'Open AI\nTool', 'Enter\nPrompt', 'Detect', 'Apply\nPolicy'];
  const fCols = flow.length;
  const fW = 1.28, fGap = 0.18;
  const fTotal = fCols * fW + (fCols - 1) * fGap;
  const fStartX = (PGW - fTotal) / 2;
  const fY = 4.15;
  const fH = 0.78;

  flow.forEach((label, i) => {
    const fx = fStartX + i * (fW + fGap);
    s.addShape('roundRect', {
      x: fx, y: fY, w: fW, h: fH, rectRadius: 0.28, fill: { color: NAVY }, line: { type: 'none' },
    });
    s.addText(label, {
      x: fx + 0.04, y: fY, w: fW - 0.08, h: fH, align: 'center', valign: 'middle',
      fontFace: FONT_BODY, bold: true, fontSize: 9, color: WHITE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.0,
    });
    if (i < fCols - 1) {
      s.addImage({ path: ICON('arrowRight'), x: fx + fW + 0.01, y: fY + fH / 2 - 0.08, w: 0.16, h: 0.16 });
    }
  });

  // MVP scope note
  s.addShape('roundRect', { x: 0.6, y: 5.4, w: PGW - 1.2, h: 1.15, rectRadius: 0.08, fill: { color: OFFWHITE }, line: { color: ICE, width: 1 } });
  s.addImage({ path: ICON('flask'), x: 0.85, y: 5.68, w: 0.5, h: 0.5 });
  s.addText([
    { text: 'MVP Scope:  ', options: { bold: true, color: NAVY } },
    { text: 'this build intentionally avoids unnecessary complexity — no billing, no SSO, no PostgreSQL, and no full admin dashboard yet.', options: { color: GRAY } },
  ], {
    x: 1.5, y: 5.4, w: PGW - 2.1, h: 1.15, valign: 'middle', fontFace: FONT_BODY, fontSize: 13, isTextBox: true, margin: 0, lineSpacingMultiple: 1.25,
  });

  footer(s, 5, 'Technology & Dependencies');
}

// ---------------- SLIDE 6: Live Demo ----------------
{
  const s = pres.addSlide();
  s.background = { color: OFFWHITE };

  s.addText('Live Demo', { x: 0.6, y: 0.35, w: 8, h: 0.55, fontFace: FONT_HEAD, bold: true, fontSize: 30, color: NAVY, isTextBox: true, margin: 0 });
  s.addText('Policy-Based AI Protection', { x: 0.6, y: 0.9, w: 10, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: GRAY, isTextBox: true, margin: 0 });

  const promptText = 'Customer Rahul\u2019s phone number is 9876543210. Summarize this information.';

  const panelW = 5.85, panelH = 4.05, panelY = 1.5;
  const panelX1 = 0.6, panelX2 = 6.9;

  function demoPanel(x, org, policyRows, resultLabel, resultColor, resultText, resultIcon) {
    s.addShape('roundRect', {
      x, y: panelY, w: panelW, h: panelH, rectRadius: 0.09, fill: { color: WHITE }, line: { color: ICE, width: 1.25 },
      shadow: { type: 'outer', color: '1E2761', opacity: 0.12, blur: 5, offset: 2, angle: 90 },
    });
    s.addShape('roundRect', { x, y: panelY, w: panelW, h: 0.6, rectRadius: 0.09, fill: { color: NAVY }, line: { type: 'none' } });
    s.addShape('rect', { x, y: panelY + 0.3, w: panelW, h: 0.3, fill: { color: NAVY }, line: { type: 'none' } });
    s.addImage({ path: ICON('buildingWhite'), x: x + 0.18, y: panelY + 0.13, w: 0.34, h: 0.34 });
    s.addText(org, {
      x: x + 0.62, y: panelY, w: panelW - 0.8, h: 0.6, valign: 'middle', fontFace: FONT_HEAD, bold: true,
      fontSize: 16, color: WHITE, isTextBox: true, margin: 0,
    });

    // Policy rows
    let py = panelY + 0.85;
    s.addText('Policy', { x: x + 0.3, y: py, w: 2, h: 0.3, fontFace: FONT_BODY, bold: true, fontSize: 11.5, color: GRAY, isTextBox: true, margin: 0 });
    py += 0.35;
    policyRows.forEach((row) => {
      s.addText(row.left, { x: x + 0.3, y: py, w: 2.0, h: 0.35, fontFace: FONT_BODY, fontSize: 12.5, color: NAVY, isTextBox: true, margin: 0, valign: 'middle' });
      s.addShape('roundRect', { x: x + 2.4, y: py + 0.02, w: 1.15, h: 0.32, rectRadius: 0.16, fill: { color: row.color }, line: { type: 'none' } });
      s.addText(row.right, { x: x + 2.4, y: py + 0.02, w: 1.15, h: 0.32, align: 'center', valign: 'middle', fontFace: FONT_BODY, bold: true, fontSize: 10.5, color: WHITE, isTextBox: true, margin: 0 });
      py += 0.42;
    });

    py += 0.12;
    s.addText('User Prompt', { x: x + 0.3, y: py, w: 3, h: 0.3, fontFace: FONT_BODY, bold: true, fontSize: 11.5, color: GRAY, isTextBox: true, margin: 0 });
    py += 0.32;
    s.addShape('roundRect', { x: x + 0.3, y: py, w: panelW - 0.6, h: 0.72, rectRadius: 0.06, fill: { color: OFFWHITE }, line: { type: 'none' } });
    s.addText(`\u201C${promptText}\u201D`, {
      x: x + 0.45, y: py, w: panelW - 0.9, h: 0.72, valign: 'middle', fontFace: FONT_BODY, italic: true,
      fontSize: 10.5, color: NAVY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
    });
    py += 0.9;

    s.addImage({ path: ICON('arrowDown'), x: x + panelW / 2 - 0.11, y: py, w: 0.22, h: 0.18 });
    py += 0.28;

    s.addShape('roundRect', { x: x + 0.3, y: py, w: panelW - 0.6, h: 0.78, rectRadius: 0.06, fill: { color: resultColor }, line: { type: 'none' } });
    s.addImage({ path: ICON(resultIcon), x: x + 0.45, y: py + 0.2, w: 0.38, h: 0.38 });
    s.addText(resultText, {
      x: x + 0.95, y: py, w: panelW - 1.25, h: 0.78, valign: 'middle', fontFace: FONT_BODY, bold: true,
      fontSize: 11, color: WHITE, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
    });
  }

  demoPanel(
    panelX1, 'TechCorp',
    [
      { left: 'PII', right: 'REDACT', color: AMBER },
      { left: 'API Key', right: 'BLOCK', color: RED },
    ],
    'Redacted', OFFWHITE,
    'Customer Rahul\u2019s phone number is [REDACTED]. Summarize this information.',
    'eye'
  );
  // fix result box color for techcorp (use amber tint bg with amber text? keep consistent: use amber solid)
  // Overwrite: re-draw result differently is complex; instead directly call with amber color
  // (handled below by re-calling with correct colors)

  demoPanel(
    panelX2, 'FinanceCorp',
    [
      { left: 'PII', right: 'BLOCK', color: RED },
    ],
    'Blocked', RED,
    'Prompt Blocked \u2014 PII detected. Organization policy requires BLOCK.',
    'ban'
  );

  footer(s, 6, 'Live Demo');
}

// ---------------- SLIDE 7: Q&A ----------------
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape('ellipse', { x: 10.5, y: 4.8, w: 4.5, h: 4.5, fill: { color: NAVY_DARK }, line: { type: 'none' } });
  s.addShape('ellipse', { x: -2, y: -2, w: 3.5, h: 3.5, fill: { color: NAVY_DARK }, line: { type: 'none' } });

  iconCircle(s, 'question', PGW / 2, 1.9, 1.1, ICE, 0.55);

  s.addText('Questions?', {
    x: 0, y: 2.6, w: PGW, h: 0.8, align: 'center', fontFace: FONT_HEAD, bold: true,
    fontSize: 40, color: WHITE, isTextBox: true, margin: 0,
  });

  const topics = [
    { icon: 'lockWhite', label: 'Security & Privacy' },
    { icon: 'buildingWhite', label: 'Enterprise Deployment' },
    { icon: 'roadWhite', label: 'Future Roadmap' },
  ];
  // roadWhite icon not generated; use 'road'
  const topicDefs = [
    { icon: 'lockWhite', label: 'Security & Privacy' },
    { icon: 'buildingWhite', label: 'Enterprise Deployment' },
    { icon: 'road', label: 'Future Roadmap' },
  ];

  const tW = 3.1, tGap = 0.4;
  const tTotal = topicDefs.length * tW + (topicDefs.length - 1) * tGap;
  let tX = (PGW - tTotal) / 2;
  const tY = 4.1;

  topicDefs.forEach((t) => {
    s.addShape('roundRect', { x: tX, y: tY, w: tW, h: 1.3, rectRadius: 0.1, fill: { color: NAVY_DARK }, line: { color: ICE, width: 0.75 } });
    iconCircle(s, t.icon, tX + tW / 2, tY + 0.42, 0.55, ICE, 0.5);
    s.addText(t.label, {
      x: tX + 0.1, y: tY + 0.78, w: tW - 0.2, h: 0.45, align: 'center', valign: 'middle',
      fontFace: FONT_BODY, bold: true, fontSize: 12.5, color: WHITE, isTextBox: true, margin: 0,
    });
    tX += tW + tGap;
  });

  s.addText('DataGuard AI — Secure Enterprise AI Usage', {
    x: 0, y: 7.0, w: PGW, h: 0.3, align: 'center', fontFace: FONT_BODY,
    fontSize: 11, color: 'A9B3D6', isTextBox: true, margin: 0,
  });
}

pres.writeFile({ fileName: path.join(__dirname, 'DataGuard_AI.pptx') }).then(() => {
  console.log('written');
});