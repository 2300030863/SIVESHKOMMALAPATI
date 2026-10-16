# Quick Start Guide

Get your portfolio up and running in 5 minutes!

## 📦 What You Have

Your portfolio includes:
- ✅ Modern futuristic design with dark theme
- ✅ 3D animations and effects
- ✅ Fully responsive layout
- ✅ All major sections (Hero, About, Skills, Projects, Education, Contact)
- ✅ Smooth scroll animations
- ✅ Pre-configured styling and scripts

## 🎯 First Steps (5 minutes)

### Step 1: Open in Browser (1 min)
```bash
# Navigate to portfolio folder and double-click index.html
# Or use Live Server in VS Code
# Right-click index.html → Open with Live Server
```

### Step 2: Customize Personal Info (2 min)

**Edit index.html:**

1. **Name & Title** (Line ~70)
```html
<h1 class="hero-title">
    Hi, I'm <span class="accent">YOUR NAME HERE</span>
</h1>
```

2. **Email** (Line ~245)
```html
<a href="mailto:your-email@example.com">your-email@example.com</a>
```

3. **Phone** (Line ~250)
```html
<a href="tel:+91-YOUR-PHONE">+91-YOUR-PHONE</a>
```

4. **LinkedIn & GitHub** (Lines ~85, ~250, ~258)
```html
<a href="https://linkedin.com/in/your-profile" target="_blank">
<a href="https://github.com/your-profile" target="_blank">
```

### Step 3: Update Typing Phrases (1 min)

**Edit script.js** (Line ~17)
```javascript
const phrases = [
    'Your Job Title',
    'Your Specialty 1',
    'Your Specialty 2',
    'Your Specialty 3'
];
```

### Step 4: Add Your Resume (1 min)

1. Convert your resume to PDF
2. Save as `resume.pdf` in root folder
3. Download button will work automatically!

---

## 🎨 Optional Customizations (Next 15 min)

### Update Colors

**Edit style.css** (Line ~2-12)
```css
:root {
    --accent-cyan: #00d4ff;      /* Main accent color */
    --accent-purple: #a855f7;    /* Secondary color */
    --bg-primary: #050505;        /* Background */
}
```

### Add/Edit Projects

Find in **index.html** around line ~130:
```html
<div class="project-card glass-effect">
    <h3>Your Project Name</h3>
    <p>Your project description</p>
    <div class="project-tech">
        <span class="tech-badge">Technology 1</span>
        <span class="tech-badge">Technology 2</span>
    </div>
</div>
```

### Modify Skills

Find in **index.html** around line ~110:
```html
<div class="skill-category glass-effect">
    <h3>Your Category</h3>
    <div class="skill-list">
        <span class="skill-tag glow">Skill 1</span>
        <span class="skill-tag glow">Skill 2</span>
    </div>
</div>
```

### Add Education Details

Find in **index.html** around line ~165:
```html
<div class="timeline-item glass-effect">
    <div class="timeline-content">
        <h3>Your Degree</h3>
        <p class="timeline-subtitle">Your School (Years)</p>
        <p>Your details here</p>
    </div>
</div>
```

---

## 📁 File Structure Quick Reference

```
portfolio-website/
├── index.html          ← Main file - All content here
├── style.css           ← Styling & animations
├── script.js           ← JavaScript interactions
├── README.md           ← Full documentation
├── DEPLOYMENT.md       ← How to deploy
├── ASSETS_GUIDE.md     ← Adding images
├── assets/
│   ├── images/         ← Add project screenshots here
│   └── icons/          ← Add custom icons here
└── resume.pdf          ← Your resume (optional)
```

---

## 🚀 Deploy in Minutes

### Easiest Way: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Drag your portfolio folder onto Netlify
4. **Done!** Your site is live ✅

**Get a free URL like:** `your-name-portfolio.netlify.app`

### Alternative: GitHub Pages

```bash
# 1. Initialize Git
git init
git add .
git commit -m "Portfolio"

# 2. Create repo "yourusername.github.io"

# 3. Push to GitHub
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main

# 4. Site is live at: https://yourusername.github.io
```

---

## 🎯 Important Customization Locations

| What | Where | Lines |
|------|-------|-------|
| Name & Title | index.html | 70 |
| Typing Phrases | script.js | 17 |
| Email | index.html | 245 |
| LinkedIn Link | index.html | 85 |
| GitHub Link | index.html | 258 |
| Colors | style.css | 2-12 |
| Projects | index.html | 130-190 |
| Skills | index.html | 110-160 |
| Education | index.html | 165-200 |

---

## 📸 Adding Images (Optional)

1. **Create folders** (already done for you):
   - `assets/images/` - for photos
   - `assets/icons/` - for icons

2. **Add images** (JPG or PNG)

3. **Reference in HTML**:
   ```html
   <img src="assets/images/your-image.jpg" alt="Description">
   ```

4. **Optimize** before uploading:
   - Compress at [TinyPNG.com](https://tinypng.com)
   - Max width: 600px
   - Keep under 200KB each

---

## ✅ Pre-Launch Checklist

- [ ] Name updated
- [ ] Email/Phone correct
- [ ] LinkedIn & GitHub links working
- [ ] Skills section matches resume
- [ ] Projects updated with YOUR projects
- [ ] Typing phrases customized
- [ ] Resume PDF added
- [ ] All links work (click and check)
- [ ] Mobile view looks good (press F12)
- [ ] Tested in different browsers

---

## 🔧 Testing Before Launch

### Check in Browser
1. Press **F12** to open Developer Tools
2. Click **mobile icon** (top-left)
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1200px)

### Verify All Features
- [ ] Typing animation works
- [ ] 3D sphere visible and rotating
- [ ] Buttons glow on hover
- [ ] Scroll animations play
- [ ] Mobile menu works
- [ ] All links open correctly
- [ ] No console errors (F12 → Console tab)

---

## 🎓 Learning & Customization

### If you want to learn/modify more:

- **CSS Animations**: Edit `style.css` (look for `@keyframes`)
- **JavaScript Effects**: Edit `script.js` (organized by sections)
- **HTML Content**: Edit `index.html` (all content here)

### Resources
- [CSS-Tricks](https://css-tricks.com/) - CSS tutorials
- [MDN Docs](https://developer.mozilla.org/) - Web development docs
- [Three.js Docs](https://threejs.org/docs/) - 3D effects
- [GSAP Docs](https://greensock.com/gsap/) - Animations

---

## 🚨 Common Issues

**Q: Page looks broken on mobile?**
A: Press F12 in browser, click mobile icon, refresh page.

**Q: 3D sphere not showing?**
A: Check browser console (F12) for errors. Works best in Chrome/Edge.

**Q: Links not working?**
A: Make sure URLs are correct. Example: `https://linkedin.com/in/YOUR_USERNAME`

**Q: Need to add more sections?**
A: Copy an existing section in HTML, update content, add navigation link.

---

## 📞 Quick Support

| Issue | Solution |
|-------|----------|
| Can't open file | Right-click → Open with Browser |
| Styles look broken | Clear cache: Ctrl+Shift+Delete |
| Changes not showing | Hard refresh: Ctrl+Shift+R |
| Mobile looks wrong | Check viewport: Press F12 |
| 3D not visible | Try Chrome instead of IE/Safari |

---

## 🎉 You're Ready!

Your portfolio is ready to impress recruiters! 

### Next Steps:
1. ✅ Customize information
2. ✅ Test in browser
3. ✅ Deploy to Netlify or GitHub Pages
4. ✅ Share with recruiters
5. ✅ Add to LinkedIn

---

## 📚 Full Documentation

For complete guides, see:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `ASSETS_GUIDE.md` - How to add images

---

## 🎯 30-Second Summary

1. **Edit index.html**: Change name, email, links
2. **Edit script.js**: Update typing phrases
3. **Add resume.pdf**: Drop in root folder
4. **Deploy**: Drag to netlify.com
5. **Share**: Get URL and share with everyone!

---

**Good luck with your portfolio! 🚀**

*If you follow these steps, you'll have a professional portfolio live in under 1 hour!*
