# Customization Quick Reference

Fast lookup for common customization tasks.

## 🎨 Color Theme

All colors controlled in **style.css** (lines 2-12):

```css
:root {
    --bg-primary: #050505;           /* Main background - Dark black */
    --bg-secondary: #111111;         /* Card background - Dark gray */
    --bg-tertiary: #1a1a1a;          /* Tertiary background */
    --accent-cyan: #00d4ff;          /* Main accent - Bright cyan */
    --accent-purple: #a855f7;        /* Secondary accent - Purple */
    --text-primary: #ffffff;         /* Main text - White */
    --text-secondary: #b0b0b0;       /* Secondary text - Light gray */
    --border-glow: rgba(0,255,255,0.3); /* Border glow effect */
}
```

### Color Ideas
| Theme | Accent 1 | Accent 2 | Use Case |
|-------|----------|----------|----------|
| Ocean | #0ea5e9 | #06b6d4 | Tech/Cool |
| Fire | #ff6b35 | #ee5a24 | Creative/Bold |
| Forest | #10b981 | #059669 | Nature/Eco |
| Cosmic | #8b5cf6 | #d946ef | Space/Modern |

## 📝 Content Changes

### Hero Section
**File**: `index.html` (lines 65-95)

```html
<!-- Name -->
<h1 class="hero-title">
    Hi, I'm <span class="accent">CHANGE NAME</span>
</h1>

<!-- Subtitle (animated by script.js) -->
<!-- Auto-updates based on typing phrases in script.js -->

<!-- Description -->
<p class="hero-description">
    YOUR DESCRIPTION HERE
</p>
```

### About Section
**File**: `index.html` (lines 104-123)

Update the three cards with your info:
- Career Objective
- Education details
- Expertise areas

### Skills Section
**File**: `index.html` (lines 130-167)

Add/remove skills in categories:
```html
<span class="skill-tag glow">Your Skill</span>
```

### Projects Section
**File**: `index.html` (lines 178-240)

Each project has:
- Title
- Description
- Tech stack (badges)
- Features list

### Education Timeline
**File**: `index.html` (lines 252-283)

Add degrees, certifications, achievements

### Contact Section
**File**: `index.html` (lines 292-320)

Update contact info and form

---

## 🎬 Typing Animation Phrases

**File**: `script.js` (lines 17-23)

```javascript
const phrases = [
    'Phrase 1 - Shows for 2 seconds',
    'Phrase 2 - Auto-rotates',
    'Phrase 3',
    'Phrase 4'
];
```

**Current phrases** (for reference):
```
AI Systems & Full Stack Developer
Building Intelligent Solutions
Passionate Problem Solver
Tech Innovator
Full Stack Engineer
```

---

## 🎨 Font Changes

**File**: `style.css` (lines 14-22)

```css
h1, h2, h3 {
    font-family: 'Orbitron', sans-serif;  /* Heading font */
}

body {
    font-family: 'Poppins', sans-serif;   /* Body font */
}
```

### Popular Font Combinations
| Heading | Body | Style |
|---------|------|-------|
| Orbitron | Poppins | Modern/Tech |
| Playfair | Lato | Elegant |
| Bebas | Roboto | Bold/Strong |
| Oswald | Open Sans | Clean |

**Add fonts to `index.html` head:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
```

---

## 🌀 Animation Speed

**File**: `style.css`

### Transition Speed
```css
:root {
    --transition: all 0.3s ease;  /* Change 0.3s to desired speed */
}
```
- `0.1s` - Very fast
- `0.3s` - Default (recommended)
- `0.6s` - Slow
- `1s` - Very slow

### Specific Animation Speeds
```css
/* Scroll animations - script.js */
gsap.from(element, {
    duration: 0.6,  /* Change this */
    /* ... */
});

/* Typing speed - script.js line 38 */
setTimeout(typeEffect, 100);  /* milliseconds between characters */
```

---

## 📱 Responsive Breakpoints

**File**: `style.css` (end of file)

```css
/* Tablet (and below) */
@media (max-width: 768px) {
    /* Tablet styles */
}

/* Mobile (and below) */
@media (max-width: 480px) {
    /* Mobile styles */
}
```

Modify breakpoints:
```css
/* Custom breakpoints */
@media (max-width: 1000px) { /* Desktop/Tablet */
@media (max-width: 600px) {  /* Tablet/Mobile */
@media (max-width: 400px) {  /* Small phones */
```

---

## 🔗 Navigation Links

**File**: `index.html` (lines 17-24)

```html
<a href="#home" class="nav-link">Home</a>
<a href="#about" class="nav-link">About</a>
<a href="#skills" class="nav-link">Skills</a>
<a href="#projects" class="nav-link">Projects</a>
<a href="#education" class="nav-link">Education</a>
<a href="#contact" class="nav-link">Contact</a>
```

Each section has matching ID:
```html
<section id="home"> ... </section>
<section id="about"> ... </section>
```

---

## 🔘 Button Styles

**File**: `style.css` (lines 171-194)

### Primary Button (Cyan)
```css
.btn-primary {
    background: var(--accent-cyan);
    color: var(--bg-primary);
    border-color: var(--accent-cyan);
}
```

### Secondary Button (Outline)
```css
.btn-secondary {
    background: transparent;
    color: var(--accent-cyan);
    border-color: var(--accent-cyan);
}
```

### Custom Button
```css
.btn-custom {
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
    border: none;
    /* ... */
}
```

---

## 💬 Form Styling

**File**: `style.css` (lines 431-455)

Input styling:
```css
.form-group input,
.form-group textarea {
    background: rgba(255, 255, 255, 0.05);  /* Background opacity */
    border: 1px solid var(--border-glow);   /* Border color */
    /* ... */
}
```

---

## 3D Sphere Customization

**File**: `script.js` (lines 118-140)

```javascript
// Change sphere color
const materialSphere = new THREE.MeshPhongMaterial({
    color: 0x00d4ff,          /* HEX color */
    emissive: 0x00a8cc,       /* Glow color */
    wireframe: false,         /* true = wireframe effect */
    shininess: 100            /* Reflection */
});

// Change particle count
const particlesCount = 200;   /* More = denser particles */

// Adjust rotation speed
sphere.rotation.x += 0.001;   /* Increase for faster rotation */
sphere.rotation.y += 0.002;   /* Y-axis rotation */
```

---

## 🎯 Section Styling

### Glass Effect Cards
```css
.glass-effect {
    background: rgba(255, 255, 255, 0.05);  /* Opacity: 0.05 = more transparent */
    backdrop-filter: blur(10px);             /* Blur strength */
    border: 1px solid var(--border-glow);
}
```

Adjust transparency: `0.03` to `0.10` (lower = more transparent)

### Section Title
```css
.section-title {
    font-size: 2.5rem;                       /* Title size */
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
    /* Gradient direction and colors */
}
```

---

## 🎨 Glow Effects

**File**: `style.css`

### Button Glow
```css
.btn-primary:hover {
    box-shadow: 0 0 30px rgba(0, 212, 255, 0.6);  /* Adjust color/intensity */
}
```

### Skill Tag Glow
```css
@keyframes glow-pulse {
    0%, 100% {
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
    }
    50% {
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.6);
    }
}
```

### Customize Glow Color
Replace `rgba(0, 212, 255, ...)` with:
- Purple: `rgba(168, 85, 247, ...)`
- Orange: `rgba(255, 140, 0, ...)`
- Green: `rgba(16, 185, 129, ...)`

---

## 📐 Spacing & Padding

**File**: `style.css`

### Section Padding
```css
section {
    padding: 6rem 0;  /* Change 6rem for more/less space */
}
```

### Container Padding
```css
.container {
    padding: 0 2rem;  /* Change 2rem for side padding */
}
```

### Gaps in Grids
```css
.skills-grid {
    gap: 2rem;  /* Space between items */
}
```

---

## 🔠 Typography Sizes

**File**: `style.css`

```css
h1 { font-size: 3.5rem; }   /* Large heading */
h2 { font-size: 2.5rem; }   /* Section title */
h3 { font-size: 1.3rem; }   /* Card title */
p  { font-size: 1rem; }     /* Body text */
```

Quick reference:
- `1rem` = 16px (default)
- `1.5rem` = 24px
- `2rem` = 32px
- `2.5rem` = 40px
- `3rem` = 48px

---

## 🖼️ Adding Images

### Hero Section
```html
<!-- Add profile image -->
<div class="hero-canvas" id="canvas-container">
    <img src="assets/images/profile.jpg" alt="Profile">
</div>
```

### Project Cards
```html
<img src="assets/images/project-1.jpg" alt="Budget Planner" class="project-image">
```

### About Section
```html
<img src="assets/images/about.jpg" alt="About Me" class="about-image">
```

---

## 🔗 Social Media Links

**File**: `index.html`

Update these URLs:

```html
<!-- Line 85-92 -->
<a href="https://linkedin.com/in/YOUR_USERNAME" target="_blank">
<a href="https://github.com/YOUR_USERNAME" target="_blank">
<a href="https://twitter.com/YOUR_USERNAME" target="_blank">

<!-- Line 250 -->
<a href="https://linkedin.com/in/YOUR_USERNAME" target="_blank">LinkedIn</a>

<!-- Line 257 -->
<a href="https://github.com/YOUR_USERNAME" target="_blank">GitHub</a>
```

---

## 📋 Contact Information

**File**: `index.html` (lines 245-258)

```html
<!-- Email -->
<a href="mailto:your-email@gmail.com">your-email@gmail.com</a>

<!-- Phone -->
<a href="tel:+91-XXXXXXXXXX">+91-XXXXXXXXXX</a>

<!-- Resume Download -->
<a href="assets/resume.pdf" download class="btn btn-primary">Download Resume</a>
```

---

## 🎯 Quick Find & Replace

Use **Find & Replace** (Ctrl+H) in your code editor:

| Find | Replace | Where |
|------|---------|-------|
| `Sivesh Kommalapati` | Your Name | index.html |
| `sivesh@example.com` | Your Email | index.html |
| `+91-XXXXXXXXXX` | Your Phone | index.html |
| `linkedin.com/in/sivesh-kommalapati` | Your LinkedIn | index.html |
| `github.com/sivesh-kommalapati` | Your GitHub | index.html |

---

## 🚨 Important Notes

- Always backup before making major changes
- Test changes in browser (F12)
- Use Ctrl+Z to undo mistakes
- Keep class names when editing HTML
- Don't delete opening/closing tags
- Maintain file indentation for readability

---

## 💡 Pro Tips

1. **Live Preview**: Use Live Server for instant changes
2. **Color Picker**: Use online color picker tools
3. **Responsive Testing**: Press F12 and toggle device toolbar
4. **Copy & Paste**: Duplicate sections to add more projects/skills
5. **Animation Testing**: Slow down animations while developing (easier to tweak)

---

## 📞 Common Customizations Checklist

- [ ] Changed name in hero section
- [ ] Updated email/phone
- [ ] Updated LinkedIn/GitHub links
- [ ] Modified typing phrases
- [ ] Added/removed skills
- [ ] Updated projects
- [ ] Added resume.pdf
- [ ] Changed accent colors (optional)
- [ ] Updated fonts (optional)
- [ ] Added profile image (optional)

---

**Happy Customizing! 🎨**

*Remember: Small changes make a big difference. Start simple and build from there.*
