# Sivesh Kommalapati - AI Systems & Full Stack Developer Portfolio

A modern, futuristic portfolio website built with cutting-edge web technologies showcasing AI Systems Engineering and Full Stack Development expertise.

## 🚀 Features

### Design & UI
- **Dark Futuristic Theme**: Premium black-theme design with cyan and purple accents
- **Glassmorphism UI**: Modern frosted glass effect cards with backdrop blur
- **3D Effects**: Interactive 3D animated sphere using Three.js
- **Smooth Animations**: GSAP-powered scroll animations and transitions
- **Particle Background**: Dynamic particle system for enhanced visual appeal
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices

### Interactive Elements
- **Typing Animation**: Dynamic text effect with multiple phrases
- **Glow Effects**: Neon-inspired glowing buttons and text
- **Smooth Scrolling**: Enhanced scroll behavior throughout the site
- **Hover Animations**: Interactive elements with scale and glow effects
- **Mouse Tracking**: 3D sphere responds to mouse movement
- **Mobile Menu**: Hamburger menu for mobile navigation

### Sections Included
1. **Hero Section** - Eye-catching introduction with 3D animation
2. **About** - Career objectives and educational background
3. **Skills** - Comprehensive technical skills categorized
4. **Projects** - Showcase of major projects with tech stacks
5. **Education** - Timeline of academic achievements and certifications
6. **Contact** - Get in touch with contact information and form

## 📁 File Structure

```
portfolio/
├── index.html                 # Main HTML file
├── style.css                  # Complete styling with animations
├── script.js                  # JavaScript for interactivity
├── README.md                  # This file
├── assets/
│   ├── images/               # Project screenshots and images
│   ├── icons/                # Custom icons
│   └── resume.pdf            # Resume download file
└── .gitignore                # Git ignore file
```

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Advanced styling, animations, and responsive design
- **JavaScript (ES6+)**: Modern JavaScript for interactivity

### Libraries & Frameworks
- **Three.js** (v128): 3D graphics and animations
- **GSAP** (v3.12.2): Animation library for scroll effects
- **ScrollTrigger**: GSAP plugin for scroll-triggered animations
- **Font Awesome** (v6.4.0): Icon library
- **Google Fonts**: Poppins, Orbitron, Kanit fonts

### Design System
- **Color Scheme**:
  - Background: #050505 (Deep Black)
  - Card Background: #111111 (Dark Gray)
  - Primary Accent: #00d4ff (Cyan)
  - Secondary Accent: #a855f7 (Purple)
  - Text: #ffffff (White)
  - Border Glow: rgba(0,255,255,0.3)

## 🎨 Key Features Explained

### 3D Animations
- Interactive 3D rotating sphere with particle system
- Responds to mouse movement
- Enhanced lighting with directional lights
- Floating animation effect

### Scroll Animations
- Fade-in effects on page load
- Slide-up animations for cards
- Staggered animations for multiple elements
- Parallax effect on scroll

### Typing Effect
- Cycles through multiple phrases
- Smooth character-by-character typing
- Auto-deletes and moves to next phrase
- 2-second pause between phrases

### Glassmorphism UI
- Semi-transparent backgrounds with backdrop blur
- Glowing borders with cyan accent
- Hover effects with enhanced opacity and glow
- Modern, premium appearance

## 📱 Responsive Breakpoints

- **Desktop**: Full layout with all features
- **Tablet** (≤768px): Optimized grid layouts
- **Mobile** (≤480px): Single column layout, optimized touch targets

## 🚀 Getting Started

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge recommended)
- No server setup required - fully static site

### Installation

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. **Open Locally**
   - Double-click `index.html` to open in browser
   - Or use Live Server (VS Code extension):
     - Right-click `index.html`
     - Select "Open with Live Server"

3. **Deploy**
   - **Netlify**: Drag and drop the folder
   - **GitHub Pages**: Push to repository and enable in settings
   - **Vercel**: Connect Git repository
   - **Traditional Hosting**: Upload all files via FTP

## 📝 Customization Guide

### Update Personal Information

**index.html**:
```html
<!-- Update name -->
<h1 class="hero-title">Hi, I'm <span class="accent">Your Name</span></h1>

<!-- Update contact info -->
<a href="mailto:youremail@example.com">youremail@example.com</a>
<a href="tel:+91-XXXXXXXXXX">+91-XXXXXXXXXX</a>
```

### Modify Typing Phrases

**script.js**:
```javascript
const phrases = [
    'Your Custom Title',
    'Your Custom Role',
    'Your Custom Description'
];
```

### Update Skills

**index.html** - Edit skill categories and tags:
```html
<div class="skill-category glass-effect">
    <h3>Your Category</h3>
    <span class="skill-tag glow">Your Skill</span>
</div>
```

### Add/Edit Projects

**index.html** - Update project cards:
```html
<div class="project-card glass-effect">
    <h3>Project Name</h3>
    <p>Project Description</p>
    <span class="tech-badge">Technology</span>
</div>
```

### Adjust Colors

**style.css** - Modify root variables:
```css
:root {
    --accent-cyan: #00d4ff;
    --accent-purple: #a855f7;
    /* ... other colors */
}
```

## 🎯 Optimization Tips

### Performance
- Lazy load images using the built-in observer
- Minify CSS and JavaScript for production
- Compress images to reduce load time
- Use CDN for external libraries

### SEO
- Update meta tags in `index.html`
- Add descriptive alt text to images
- Ensure semantic HTML structure
- Add structured data (Schema.org)

### Accessibility
- Maintain proper heading hierarchy
- Add aria-labels where needed
- Ensure color contrast meets WCAG standards
- Keyboard navigation support

## 📊 Projects Overview

### 1. Budget Planner Web Application
- **Stack**: React, Spring Boot, MySQL
- **Features**: JWT Authentication, Dashboard, Analytics

### 2. Expense Tracker System
- **Stack**: React, Spring Boot, MySQL, Charts.js
- **Features**: Monthly Reports, Budget Tracking, Category Analytics

### 3. HR Intelligence & Interview Automation
- **Stack**: Python, NLP, ML, React, Spring Boot
- **Features**: Resume Parsing, Candidate Ranking, Automation

## 🔧 Advanced Customization

### Adding New Sections

1. Add section to HTML with unique ID
2. Create corresponding CSS styling
3. Add animation in script.js using GSAP
4. Update navigation menu link

### Custom Animations

Use GSAP in `script.js`:
```javascript
gsap.from('.your-element', {
    scrollTrigger: {
        trigger: '.your-element',
        start: 'top 85%',
    },
    duration: 0.6,
    opacity: 0,
    y: 20
});
```

### Three.js Customization

Modify the `setupThreeJS()` function to:
- Change sphere geometry
- Add more 3D objects
- Adjust particle count
- Modify lighting setup

## 📚 Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [GSAP Documentation](https://greensock.com/gsap/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS-Tricks](https://css-tricks.com/)
- [JavaScript Info](https://javascript.info/)

## 🤝 Contributing

Feel free to fork this portfolio and customize it for your needs!

## 📄 License

This portfolio template is open-source and available for personal and commercial use.

## 💡 Future Enhancements

- [ ] Dark/Light mode toggle
- [ ] Blog section
- [ ] Project filtering
- [ ] AI chatbot assistant
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Progressive Web App (PWA)

## 📞 Support

For questions or issues:
- Email: sivesh@example.com
- LinkedIn: [Your LinkedIn Profile]
- GitHub: [Your GitHub Profile]

---

**Built with ❤️ using modern web technologies**

*Building Intelligent & Scalable Digital Experiences*

Last Updated: 2024
#   S I V E S H  
 #   S I V E S H K O M M A L A P A T I  
 