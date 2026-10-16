# Assets Guide for Portfolio

This guide explains how to add images and other assets to your portfolio.

## 📁 Directory Structure

```
assets/
├── images/
│   ├── profile.jpg          # Profile picture for about section
│   ├── project-1.jpg        # Budget Planner screenshot
│   ├── project-2.jpg        # Expense Tracker screenshot
│   ├── project-3.jpg        # HR Automation screenshot
│   └── hero-bg.jpg          # Hero section background (optional)
└── icons/
    ├── react.svg            # React icon
    ├── spring-boot.svg      # Spring Boot icon
    ├── mysql.svg            # MySQL icon
    └── python.svg           # Python icon
```

## 🖼️ Image Guidelines

### Recommended Image Sizes

| Image | Size | Format | Optimization |
|-------|------|--------|-------------|
| Profile Picture | 300x300px | JPG/PNG | Optimized for web |
| Project Screenshots | 600x400px | JPG/PNG | Compressed |
| Tech Icons | 60x60px | SVG/PNG | Vector preferred |
| Hero Background | 1920x1080px | JPG/WebP | Optimized |

### How to Add Images

1. **Profile Picture**
   - Place `profile.jpg` in `assets/images/`
   - Add to HTML (optional enhancement):
   ```html
   <img src="assets/images/profile.jpg" alt="Profile Picture" class="profile-pic">
   ```

2. **Project Screenshots**
   - Save project screenshots (600x400px recommended)
   - Name: `project-1.jpg`, `project-2.jpg`, `project-3.jpg`
   - Update project cards:
   ```html
   <img src="assets/images/project-1.jpg" alt="Budget Planner" class="project-image">
   ```

3. **Tech Icons**
   - Use SVG format for scalability
   - Sources:
     - [DevIcon](https://devicon.dev/)
     - [Font Awesome](https://fontawesome.com/)
     - [Iconify](https://iconify.design/)
   - Save in `assets/icons/`

## 🎨 Image Optimization

### Before Adding to Portfolio

1. **Compress Images**
   - Use [TinyPNG](https://tinypng.com/) for JPG/PNG
   - Use [Svgomg](https://svgomg.net/) for SVG
   - Reduce file size by 50-70%

2. **Resize for Web**
   - Use tools like:
     - [Photopea](https://www.photopea.com/)
     - [ILoveImg](https://www.iloveimg.com/)
     - ImageMagick CLI

3. **Format Selection**
   - **JPG**: Photos, complex images
   - **PNG**: Icons, graphics with transparency
   - **SVG**: Logos, icons (scalable)
   - **WebP**: Modern format (better compression)

### CSS Optimization for Images

Add to `style.css`:
```css
img {
    max-width: 100%;
    height: auto;
    display: block;
}

.project-image {
    width: 100%;
    object-fit: cover;
    border-radius: 10px;
    animation: slide-up 0.6s ease;
}
```

## 📄 Adding Resume

1. **Convert to PDF**
   - Use Google Docs: File → Download → PDF Document
   - Or use Canva, Adobe, or Word

2. **Place File**
   - Save as `resume.pdf` in `assets/` folder
   - Update HTML:
   ```html
   <a href="assets/resume.pdf" download class="btn btn-primary">Download Resume</a>
   ```

3. **File Size**
   - Keep under 500KB
   - Compress if needed using [Smallpdf](https://smallpdf.com/)

## 🎬 Video Guidelines (Optional)

For adding demo videos:

1. **Format**: MP4 (H.264 codec)
2. **Size**: 1280x720px minimum
3. **Duration**: 30-60 seconds per video
4. **Max File Size**: 5-10MB (compressed)

## 🖼️ Adding Images to HTML

### Method 1: Direct Image Tag
```html
<img src="assets/images/project-1.jpg" alt="Project Name" class="project-image">
```

### Method 2: Lazy Loading (Performance)
```html
<img src="placeholder.jpg" data-src="assets/images/project-1.jpg" alt="Project" class="lazy">
```

### Method 3: Picture Element (Responsive)
```html
<picture>
    <source media="(max-width: 768px)" srcset="assets/images/project-1-small.jpg">
    <img src="assets/images/project-1.jpg" alt="Project">
</picture>
```

## 🎨 Icon Resources

### Free Icon Libraries
- **Font Awesome**: [fontawesome.com](https://fontawesome.com/) - Already included!
- **Iconify**: [iconify.design](https://iconify.design/)
- **DevIcon**: [devicon.dev](https://devicon.dev/)
- **Feather Icons**: [feathericons.com](https://feathericons.com/)
- **Material Icons**: [fonts.google.com/icons](https://fonts.google.com/icons)

### Using Font Awesome Icons
Already integrated in `index.html`. Just use:
```html
<i class="fab fa-javascript"></i>
<i class="fas fa-database"></i>
```

## 📊 Image Naming Convention

Use descriptive names in lowercase with hyphens:
```
✓ project-budget-planner.jpg
✓ icon-react-logo.svg
✓ screenshot-dashboard.png

✗ image1.jpg
✗ NewImage.png
✗ project_pic.jpg
```

## 🔍 Image SEO Best Practices

1. **Use Descriptive Alt Text**
   ```html
   <img src="..." alt="Budget Planner application dashboard showing expense tracking">
   ```

2. **Meaningful File Names**
   - Use descriptive names
   - Include keywords when appropriate

3. **Add Image Titles**
   ```html
   <img src="..." alt="..." title="Budget Planner Web Application">
   ```

## 📈 Performance Metrics

After optimization, check:
- **Page Load Time**: < 3 seconds
- **Image Load Time**: < 1 second
- **Total Image Size**: < 2MB

Use [Google PageSpeed Insights](https://pagespeed.web.dev/) to monitor performance.

## 🚀 Deployment Tips

### For Different Platforms

**Netlify/Vercel:**
- Automatic image optimization
- CDN delivery
- Just upload as-is

**GitHub Pages:**
- Keep images under 100MB
- Use relative paths
- Consider using external image hosting for better performance

**Traditional Hosting:**
- Ensure write permissions for image folder
- Use absolute paths
- Set proper MIME types

## 🎯 Quick Checklist

- [ ] All images compressed
- [ ] Correct dimensions for each image type
- [ ] Alt text added to all images
- [ ] File sizes optimized
- [ ] Images organized in proper folders
- [ ] Resume PDF added (if needed)
- [ ] Icons in correct format
- [ ] Path references correct in HTML

## 📚 Additional Resources

- [Google's Image Optimization Guide](https://web.dev/image-optimization/)
- [MDN - Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev - Core Web Vitals](https://web.dev/core-web-vitals/)

---

For questions or issues with assets, refer to the main README.md file.
