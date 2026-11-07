// ==================== GOOGLE SIGN-IN ==================== //

/**
 * Stores the currently signed-in Google user data so form fields
 * can be re-populated after each message submission.
 */
let _googleUser = null;

/**
 * Called automatically by Google Identity Services after the user approves.
 * Decodes the JWT credential and fills Name + Email into the contact form.
 */
function handleGoogleSignIn(response) {
    // Decode the JWT payload (base64url)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    _googleUser = {
        name    : payload.name    || '',
        email   : payload.email   || '',
        picture : payload.picture || ''
    };

    // Save immediately so a refresh / redirect still restores the user
    sessionStorage.setItem('_googleUser', JSON.stringify(_googleUser));

    _applyGoogleUser();
}

/**
 * Applies the stored Google user data to the form and switches the UI.
 * Re-applies up to 3 times with increasing delays to defeat async clearing
 * (browser autocomplete, preloader, etc.) that can blank the values after
 * DOMContentLoaded but leave the CSS class in place.
 */
function _applyGoogleUser() {
    if (!_googleUser) return;
    _applyGoogleUserNow();
    // Retry in case something async clears the value after we set it
    setTimeout(() => { if (_googleUser) _applyGoogleUserNow(); }, 250);
    setTimeout(() => { if (_googleUser) _applyGoogleUserNow(); }, 900);
}

function updateGoogleAvatar(picture, name, email) {
    const avatarEl = document.getElementById('google-avatar');
    const fallbackEl = document.getElementById('google-avatar-fallback');
    const initialEl = document.getElementById('google-avatar-initial');

    const displayName = (name || email || 'User').trim();
    const initial = displayName.charAt(0).toUpperCase() || 'U';
    if (initialEl) initialEl.textContent = initial;

    if (!avatarEl) {
        if (fallbackEl) fallbackEl.style.display = 'flex';
        return;
    }

    avatarEl.setAttribute('referrerpolicy', 'no-referrer');
    avatarEl.referrerPolicy = 'no-referrer';
    avatarEl.alt = '';

    const showAvatar = (src) => {
        avatarEl.onload = function () {
            avatarEl.style.display = 'block';
            if (fallbackEl) fallbackEl.style.display = 'none';
        };
        avatarEl.onerror = function () {
            if (src !== 'assets/images/sivesh.jpg') {
                showAvatar('assets/images/sivesh.jpg');
            } else {
                avatarEl.style.display = 'none';
                if (fallbackEl) fallbackEl.style.display = 'flex';
            }
        };
        avatarEl.src = src;
    };

    if (picture && typeof picture === 'string' && (picture.startsWith('https://') || picture.startsWith('data:'))) {
        showAvatar(picture);
    } else {
        showAvatar('assets/images/sivesh.jpg');
    }
}
window.updateGoogleAvatar = updateGoogleAvatar;

/** Synchronously writes the Google user into the form and shows the user card. */
function _applyGoogleUserNow() {
    if (!_googleUser) return;

    const { name, email, picture } = _googleUser;

    // Fill + lock Name field
    const nameInput = document.getElementById('contact-name');
    if (nameInput) {
        nameInput.value = name;
        nameInput.setAttribute('readonly', 'readonly');
        nameInput.classList.add('google-locked');
        // Guard: if anything clears the value while locked, instantly restore it
        if (!nameInput._googleGuard) {
            nameInput._googleGuard = true;
            nameInput.addEventListener('input', () => {
                if (nameInput.classList.contains('google-locked') && _googleUser) {
                    nameInput.value = _googleUser.name;
                }
            });
        }
    }

    // Fill + lock Email field
    const emailInput = document.getElementById('contact-email');
    if (emailInput) {
        emailInput.value = email;
        emailInput.setAttribute('readonly', 'readonly');
        emailInput.classList.add('google-locked');
        if (!emailInput._googleGuard) {
            emailInput._googleGuard = true;
            emailInput.addEventListener('input', () => {
                if (emailInput.classList.contains('google-locked') && _googleUser) {
                    emailInput.value = _googleUser.email;
                }
            });
        }
    }

    // Show user card, hide sign-in button
    const signinBtn = document.querySelector('.g-signin-wrapper');
    const userCard  = document.getElementById('google-user-card');
    const dispName  = document.getElementById('google-display-name');
    const dispEmail = document.getElementById('google-display-email');

    if (signinBtn)  signinBtn.style.display = 'none';
    if (userCard)   userCard.style.display   = 'flex';
    updateGoogleAvatar(picture, name, email);
    if (dispName)   dispName.textContent  = name;
    if (dispEmail)  dispEmail.textContent = email;

    // Jump chat terminal to step 2 if available
    if (window.advanceChatToMessage) {
        window.advanceChatToMessage(name, email);
    }
}

/**
 * Returns true when running on localhost / file:// / 127.x — origins where
 * Google One Tap (FedCM) always returns 403 Forbidden.
 */
function _isLocalOrigin() {
    const h = location.hostname;
    return (
        h === 'localhost' ||
        h === '127.0.0.1' ||
        h.startsWith('192.168.') ||
        h.startsWith('10.') ||
        h === '' // file://
    );
}

// Forward trigger to unified Google Sign-In handler (defined in GOOGLE SIGN-IN section)
function triggerGoogleSignIn() {
    if (window.triggerGoogleSignIn) {
        window.triggerGoogleSignIn();
    }
}
/**
 * Clears the signed-in state completely — used by the ✕ (sign-out) button.
 * Also clears the form fields.
 */
function clearGoogleSignIn() {
    _googleUser = null;

    // Clear and unlock the form fields
    const nameInput  = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    if (nameInput)  { nameInput.value  = ''; nameInput.removeAttribute('readonly'); nameInput.classList.remove('google-locked'); }
    if (emailInput) { emailInput.value = ''; emailInput.removeAttribute('readonly'); emailInput.classList.remove('google-locked'); }

    const signinBtn = document.querySelector('.g-signin-wrapper');
    const userCard  = document.getElementById('google-user-card');
    if (signinBtn) signinBtn.style.display = 'flex';
    if (userCard)  userCard.style.display  = 'none';

    if (window.google && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }

    // Reset chat terminal if available
    if (window.resetChat) {
        window.resetChat();
    }
}

/**
 * Allows the user to sign in with a different Google account.
 * Revokes the current session and re-opens the Google prompt.
 */
function switchGoogleAccount() {
    _googleUser = null;

    // Unlock the form fields so they don't stay locked while a new account is chosen
    const nameInput  = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    if (nameInput)  { nameInput.value  = ''; nameInput.removeAttribute('readonly'); nameInput.classList.remove('google-locked'); }
    if (emailInput) { emailInput.value = ''; emailInput.removeAttribute('readonly'); emailInput.classList.remove('google-locked'); }

    // Clear displayed user card
    const signinBtn = document.querySelector('.g-signin-wrapper');
    const userCard  = document.getElementById('google-user-card');
    if (signinBtn) signinBtn.style.display = 'flex';
    if (userCard)  userCard.style.display  = 'none';

    if (window.google && google.accounts) {
        google.accounts.id.disableAutoSelect();
    }
}

/**
 * Hook called after a successful form submission.
 * If a Google user is still stored, re-fills the form fields
 * so the user can send another message without re-authenticating.
 */
function refillGoogleUserAfterSubmit() {
    if (_googleUser) {
        // Small timeout lets the form reset first
        setTimeout(() => _applyGoogleUser(), 100);
    }
}

// ==================== READ MORE TOGGLE ==================== //

function toggleInternshipExpand(expandId, btnId) {
    const expand = document.getElementById(expandId);
    const btn = document.getElementById(btnId);
    const isOpen = expand.style.display !== 'none';

    if (isOpen) {
        expand.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-chevron-down"></i> Read more';
    } else {
        expand.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-chevron-up"></i> Read less';
    }
}

// ==================== STATIC SUBTITLE ==================== //
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('.typing-effect');
    if (typingElement) typingElement.textContent = 'Full Stack Java Developer';

    // ── Restore Google user after web3forms redirect / page reload ────────────
    // Delay slightly so browser autocomplete has already run — this prevents
    // autocomplete from overwriting our values after we set them.
    const savedUser = sessionStorage.getItem('_googleUser');
    if (savedUser) {
        try {
            _googleUser = JSON.parse(savedUser);
            // Immediate apply + retries inside _applyGoogleUser handle the rest
            _applyGoogleUser();
        } catch (e) {
            sessionStorage.removeItem('_googleUser');
        }
    }

    // ── Intercept form submit to persist Google user across the redirect ──────
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            if (_googleUser) {
                // Save again right before submit (belt + suspenders)
                sessionStorage.setItem('_googleUser', JSON.stringify(_googleUser));
            }
        });
    }
});

// ==================== SMOOTH SCROLL ==================== //
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// ==================== NAVIGATION SCROLL HIGHLIGHT ==================== //
document.addEventListener('scroll', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});


// Three.js hero sphere removed (motion UI disabled)

// GSAP scroll animations, parallax, and IntersectionObserver animations removed (motion UI disabled)

// ==================== SMOOTH SCROLL LINKS ==================== //
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'instant',
                block: 'start'
            });
        }
    });
});

// ==================== PERFORMANCE OPTIMIZATION ==================== //
// Lazy load images (if you add image elements later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// Log for debugging (remove in production)
console.log('Portfolio loaded successfully!');
console.log('Welcome to Sivesh Kommalapati\'s Portfolio');

// ==================== READ MORE TOGGLE ==================== //
function toggleReadMore(contentId, btnElement) {
    const content = document.getElementById(contentId);
    if (!content) return;

    const isExpanded = content.classList.contains('expanded');

    if (isExpanded) {
        content.classList.remove('expanded');
        btnElement.classList.remove('expanded');
        btnElement.innerHTML = 'Read More <i class="fas fa-chevron-down"></i>';
    } else {
        content.classList.add('expanded');
        btnElement.classList.add('expanded');
        btnElement.innerHTML = 'Read Less <i class="fas fa-chevron-up"></i>';
    }
}

// 3D moving background (Three.js) removed (motion UI disabled)

// Initialize UI and Mobile Nav
function initUI() {
    // Mobile Navigation Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
}

// ==================== PRELOADER ==================== //
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    document.body.style.overflow = 'hidden';

    let progress = 0;
    const progressFill = document.querySelector('.progress-bar-fill');
    const progressPercent = document.querySelector('.progress-percent');

    // Simulate loading
    const loadingInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 3) + 1; // Snappy progress

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.style.overflow = '';

                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 400);
            }, 300);
        }

        if (progressFill && progressPercent) {
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
        }

    }, 55); // Snappy interval (55ms)
}

// Execute immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initUI();
        initContactForm();
    });
} else {
    initPreloader();
    initUI();
    initContactForm();
}

// ==================== CONTACT FORM AJAX ==================== //
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Security Firewall rate limit & bot check
        if (window.SecurityFirewall) {
            const rateCheck = window.SecurityFirewall.checkRateLimit();
            if (!rateCheck.allowed) {
                alert(`Security Notice: ${rateCheck.message}`);
                return;
            }
            window.SecurityFirewall.recordSubmission();
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const data = await response.json();

            if (data.success) {
                submitBtn.textContent = 'Message Sent Successfully!';
                submitBtn.style.background = '#059669'; // Green success color
                submitBtn.style.borderColor = '#059669';
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.disabled = false;
                }, 5000);
            } else {
                console.error("Form error:", data);
                submitBtn.textContent = 'Error: Check console';
                submitBtn.style.background = '#DC2626'; // Red error color
                submitBtn.style.borderColor = '#DC2626';

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.disabled = false;
                }, 5000);
            }
        } catch (error) {
            console.error("Network error:", error);
            submitBtn.textContent = 'Network Error';

            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 3000);
        }
    });
}

// Contact 3D AI ball (Three.js) removed (motion UI disabled)

// ==================== WELCOME TOAST LOGIC ==================== //
window.addEventListener('load', () => {
    // Initialize VanillaTilt for 3D elements
    if (typeof VanillaTilt !== 'undefined') {
        // Disabled VanillaTilt on .contact-form to prevent hover flickering glitches
        // VanillaTilt.init(document.querySelectorAll(".contact-form"), {
        //     max: 3,
        //     speed: 400,
        //     glare: true,
        //     "max-glare": 0.05,
        //     perspective: 1000
        // });
    }

    // Show first toast shortly after page load
    setTimeout(() => {
        const toast1 = document.getElementById('welcome-toast-1');
        const toast2 = document.getElementById('welcome-toast-2');
        
        if (toast1) {
            toast1.classList.add('show');

            // Hide first toast after 4 seconds
            setTimeout(() => {
                toast1.classList.remove('show');
                
                // Show second toast 1.5 seconds after the first hides
                setTimeout(() => {
                    if (toast2) {
                        toast2.classList.add('show');
                        // Hide second toast after 4.5 seconds
                        setTimeout(() => {
                            toast2.classList.remove('show');
                        }, 4500);
                    }
                }, 1500);
                
            }, 4000);
        }
    }, 2500);
});

// ==================== THEME TOGGLE LOGIC ==================== //
function initThemeToggle() {
    const themeBtn = document.getElementById('theme-btn');
    const themeIcon = document.getElementById('theme-icon');
    if (!themeBtn || !themeIcon) return;

    // Always start in dark mode — clear any stale light-mode preference
    localStorage.removeItem('portfolio-theme');
    document.body.classList.remove('light-mode');
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');

    themeBtn.addEventListener('click', () => {
        themeBtn.classList.add('animating');
        setTimeout(() => {
            document.body.classList.toggle('light-mode');
            const isLightMode = document.body.classList.contains('light-mode');
            if (isLightMode) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
                localStorage.setItem('portfolio-theme', 'light');
            } else {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
                localStorage.setItem('portfolio-theme', 'dark');
            }
            setTimeout(() => { themeBtn.classList.remove('animating'); }, 50);
        }, 250);
    });
}

// Initialize theme toggle
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
    initThemeToggle();
}

// ==================== VISITOR COUNTER LOGIC ==================== //
function initVisitorCounter() {
    const visitorCountEl = document.getElementById('visitor-count');
    if (!visitorCountEl) return;

    const API_BASE = 'https://countapi.mileshilliard.com/api/v1';
    const COUNTER_KEY = 'kommalapati_sivesh_portfolio_visits_v1';
    const FALLBACK_BASE = 0;

    // Retrieve cached value. If it was previously set to old 1420+ base, reset to 0
    let stored = localStorage.getItem('sivesh_cached_visitors');
    let cachedCount = stored ? parseInt(stored, 10) : FALLBACK_BASE;
    if (isNaN(cachedCount) || cachedCount >= 1420) {
        cachedCount = FALLBACK_BASE;
        localStorage.setItem('sivesh_cached_visitors', '0');
    }

    // Always start visual counter display from 0
    visitorCountEl.textContent = '0';

    // Only increment once per browser session; subsequent refreshes query current value
    const hasCountedSession = sessionStorage.getItem('sivesh_session_counted');
    const endpoint = hasCountedSession
        ? `${API_BASE}/get/${COUNTER_KEY}`
        : `${API_BASE}/hit/${COUNTER_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch(endpoint, { signal: controller.signal })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            return response.json();
        })
        .then(data => {
            clearTimeout(timeoutId);
            if (data && typeof data.value === 'number') {
                const finalCount = data.value;
                localStorage.setItem('sivesh_cached_visitors', finalCount);
                sessionStorage.setItem('sivesh_session_counted', 'true');
                animateVisitorCount(visitorCountEl, 0, finalCount);
            } else {
                animateVisitorCount(visitorCountEl, 0, cachedCount);
            }
        })
        .catch(err => {
            clearTimeout(timeoutId);
            // Fallback for offline/ad-blocker scenarios: increment locally if new session
            if (!hasCountedSession) {
                const nextCount = cachedCount + 1;
                localStorage.setItem('sivesh_cached_visitors', nextCount);
                sessionStorage.setItem('sivesh_session_counted', 'true');
                animateVisitorCount(visitorCountEl, 0, nextCount);
            } else {
                animateVisitorCount(visitorCountEl, 0, cachedCount);
            }
        });
}

function animateVisitorCount(element, start, end) {
    if (!element) return;
    if (start === end) {
        element.textContent = end.toLocaleString();
        return;
    }
    const duration = 1200;
    const startTime = performance.now();
    const diff = end - start;

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        const current = Math.floor(start + diff * ease);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = end.toLocaleString();
        }
    }
    requestAnimationFrame(step);
}

// Initialize visitor counter
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorCounter);
} else {
    initVisitorCounter();
}

// ==================== AI CHAT TERMINAL LOGIC ==================== //
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    const hiddenPurpose = document.getElementById('hidden-purpose');
    const hiddenName = document.getElementById('hidden-name');
    const hiddenEmail = document.getElementById('hidden-email');
    const hiddenMessage = document.getElementById('hidden-message');
    
    const hcaptchaContainer = document.getElementById('hcaptcha-container');
    const captchaSendBtn = document.getElementById('captcha-send-btn');
    
    let chatStep = 0;

    if (!chatInput || !chatSendBtn || !chatMessages) return;

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
        if (!isUser) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-robot';
            const span = document.createElement('span');
            span.textContent = text;
            msgDiv.appendChild(icon);
            msgDiv.appendChild(document.createTextNode(' '));
            msgDiv.appendChild(span);
        } else {
            msgDiv.textContent = text;
        }
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    window.advanceChatToMessage = function(name, email) {
        if (chatStep >= 3) return;
        hiddenName.value = name;
        hiddenEmail.value = email;
        
        if (chatStep === 0) {
            // They haven't provided purpose yet
            chatStep = 0; 
            setTimeout(() => {
                addMessage(`Thank you for connecting with Google, ${name.split(' ')[0]}! Could you please share the purpose of your message?`);
            }, 600);
        } else {
            chatStep = 3; // Jump straight to message step
            chatInput.placeholder = "Please write your message for Sivesh...";
            setTimeout(() => {
                addMessage(`Thank you for connecting with Google, ${name.split(' ')[0]}! Please feel free to write your message for Sivesh below.`);
            }, 600);
        }
    };

    window.resetChat = function() {
        chatStep = 0;
        if(hiddenPurpose) hiddenPurpose.value = '';
        hiddenName.value = '';
        hiddenEmail.value = '';
        hiddenMessage.value = '';
        chatInput.disabled = false;
        chatSendBtn.disabled = false;
        chatInput.style.display = 'block';
        chatSendBtn.style.display = 'block';
        if(hcaptchaContainer) hcaptchaContainer.style.display = 'none';
        
        chatInput.placeholder = "Please share the purpose of your message...";
        chatMessages.innerHTML = `<div class="chat-msg bot-msg">
            <i class="fas fa-robot"></i> <span>Hello! I am Sivesh's virtual assistant. I would be delighted to help you get in touch with him. May I please know the purpose of your message?</span>
        </div>`;
    };

    function handleChatSend() {
        let text = chatInput.value.trim();
        if (!text) return;
        if (text.length > 1000) text = text.slice(0, 1000);
        
        // Security Firewall payload inspection & data leak prevention
        if (window.SecurityFirewall) {
            const check = window.SecurityFirewall.inspect(text, 'chat');
            if (!check.valid) {
                addMessage(`🛡️ Security Alert: ${check.reason}`);
                chatInput.value = '';
                return;
            }
        }

        // Add user message to UI
        addMessage(text, true);
        chatInput.value = '';

        if (chatStep === 0) {
            // Save Purpose
            if(hiddenPurpose) hiddenPurpose.value = text.slice(0, 200);
            
            if (hiddenName.value && hiddenEmail.value) {
                // If signed in with Google
                chatStep = 3;
                chatInput.placeholder = "Please write your message for Sivesh...";
                setTimeout(() => {
                    addMessage(`Thank you so much! Please feel free to write your message for Sivesh below.`);
                }, 600);
            } else {
                chatInput.placeholder = "Please enter your name...";
                setTimeout(() => {
                    addMessage(`Thank you! May I kindly ask for your name?`);
                }, 600);
                chatStep++;
            }
        } else if (chatStep === 1) {
            // Save Name
            hiddenName.value = text.slice(0, 100);
            chatInput.placeholder = "Please enter your email address...";
            setTimeout(() => {
                addMessage(`It is a pleasure to meet you, ${hiddenName.value}! Could you please share your email address so Sivesh can reach back out to you?`);
            }, 600);
            chatStep++;
        } else if (chatStep === 2) {
            // Validate Email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
                setTimeout(() => {
                    addMessage(`Could you please double-check your email address? It looks like there might be a typo.`);
                }, 600);
                return; // Do not advance chatStep
            }
            // Save Email
            hiddenEmail.value = text;
            chatInput.placeholder = "Please write your message for Sivesh...";
            setTimeout(() => {
                addMessage(`Thank you so much! Please feel free to write your message for Sivesh below.`);
            }, 600);
            chatStep++;
        } else if (chatStep >= 3) {
            // Save Message (whether it's the first one or an additional one)
            hiddenMessage.value = text.slice(0, 2000);
            chatInput.style.display = 'none';
            chatSendBtn.style.display = 'none';
            
            if (chatStep === 3) {
                setTimeout(() => {
                    addMessage(`We are almost done! Could you please complete the quick verification below so I can send your message?`);
                    if (hcaptchaContainer) hcaptchaContainer.style.display = 'flex';
                }, 600);
                chatStep = 4;
            } else {
                // Additional message after submit
                setTimeout(() => {
                    addMessage(`Kindly complete the verification once more to send your additional message.`);
                    if (hcaptchaContainer) hcaptchaContainer.style.display = 'flex';
                    if (window.hcaptcha) {
                        try { hcaptcha.reset(); } catch(e) {}
                    }
                }, 600);
                chatStep = 4;
            }
        }
    }
    
    function submitFormAjax() {
        // Security Firewall rate limiting & anti-flood guard
        if (window.SecurityFirewall) {
            const rateCheck = window.SecurityFirewall.checkRateLimit();
            if (!rateCheck.allowed) {
                addMessage(`🛡️ Security Notice: ${rateCheck.message}`);
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                if (captchaSendBtn) captchaSendBtn.disabled = false;
                return;
            }
            window.SecurityFirewall.recordSubmission();
        }

        chatInput.placeholder = "Sending your message...";
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        if (captchaSendBtn) captchaSendBtn.disabled = true;
        
        setTimeout(() => {
            if (chatStep === 4) {
                addMessage(`Thank you! Sending your message to Sivesh now...`);
            } else {
                addMessage(`Sending your additional message to Sivesh...`);
            }
            
            // Submit via Web3Forms AJAX
            const formElement = document.getElementById('contact-form');
            const formData = new FormData(formElement);
            
            // Honeypot bot protection check
            if (formData.get('botcheck')) {
                console.warn('Bot submission blocked');
                return;
            }
            
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    addMessage('Your message has been sent successfully! Sivesh will receive it shortly, and an email confirmation is on its way to you. If there is anything else you would like to add, please feel free to type it below.');
                    chatStep = 5;
                    if(hcaptchaContainer) hcaptchaContainer.style.display = 'none';
                    chatInput.style.display = 'block';
                    chatSendBtn.style.display = 'block';
                } else {
                    addMessage('I apologize, but something went wrong while sending. Could you please try again?');
                }
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                if (captchaSendBtn) captchaSendBtn.disabled = false;
                chatInput.placeholder = "Please type any additional message...";
                chatInput.focus();
                
                // Refill google user if applicable
                if (window.refillGoogleUserAfterSubmit) {
                    window.refillGoogleUserAfterSubmit();
                }
            })
            .catch(error => {
                addMessage('I apologize, a network error occurred. Please check your connection and try again.');
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                if (captchaSendBtn) captchaSendBtn.disabled = false;
                chatInput.placeholder = "Please write your message for Sivesh...";
                chatInput.style.display = 'block';
                chatSendBtn.style.display = 'block';
                if(hcaptchaContainer) hcaptchaContainer.style.display = 'none';
                chatStep = 3; // Let them retry sending the message step
            });
            
        }, 600);
    }
    
    if (captchaSendBtn) {
        captchaSendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Optional: You could check if h-captcha-response is present in the form data
            const formElement = document.getElementById('contact-form');
            const formData = new FormData(formElement);
            if (!formData.get('h-captcha-response')) {
                addMessage(`Could you please complete the verification checkbox above first?`);
                return;
            }
            submitFormAjax();
        });
    }

    chatSendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleChatSend();
    });
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop the form from submitting early
            handleChatSend();
        }
    });
    
    // Call resetChat initially to set the right placeholder and message
    setTimeout(() => {
        // Only run this if we are not already at a higher step (e.g. from Google Sign-In fast path)
        if (chatStep === 0 && !hiddenName.value) {
            chatInput.placeholder = "Please share the purpose of your message...";
            if (chatMessages) {
                chatMessages.innerHTML = `<div class="chat-msg bot-msg">
                    <i class="fas fa-robot"></i> <span>Hello! I am Sivesh's virtual assistant. I would be delighted to help you get in touch with him. May I please know the purpose of your message?</span>
                </div>`;
            }
        }
    }, 100);
});

// ==================== GOOGLE SIGN-IN ==================== //
let googleTokenClient = null;
let isGoogleSigningIn = false;

function initGoogleSignIn() {
    if (window.google && google.accounts && google.accounts.oauth2) {
        try {
            googleTokenClient = google.accounts.oauth2.initTokenClient({
                client_id: '323113584930-qff55p96cturm9gdk1k3vki075o7h8dg.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
                callback: (tokenResponse) => {
                    isGoogleSigningIn = false;
                    restoreGoogleSignInBtn();
                    if (tokenResponse && tokenResponse.access_token) {
                        fetchUserInfo(tokenResponse.access_token);
                    } else if (tokenResponse && tokenResponse.error) {
                        console.warn('[Google Auth Error]:', tokenResponse.error);
                        handleGoogleAuthError(tokenResponse.error);
                    }
                },
                error_callback: (err) => {
                    isGoogleSigningIn = false;
                    restoreGoogleSignInBtn();
                    console.warn('[Google Auth Error Callback]:', err);
                    if (err && (err.type === 'popup_closed' || err.type === 'popup_blocked_by_browser')) {
                        return; // User closed popup or browser blocked popup
                    }
                    handleGoogleAuthError(err ? (err.type || err.message) : 'error');
                }
            });
        } catch (e) {
            console.error('Failed to init Google Token Client:', e);
        }
    } else {
        setTimeout(initGoogleSignIn, 150);
    }
}
initGoogleSignIn();

function handleGoogleAuthError(errType) {
    const currentOrigin = window.location.origin;
    if (errType === 'origin_mismatch' || errType === 'access_denied') {
        alert(`Google Sign-In Authorization Notice:\n\nYour domain (${currentOrigin}) is not registered under "Authorized JavaScript origins" in Google Cloud Console.\n\nPlease add ${currentOrigin} to your Google Cloud Console Credentials.`);
    }
}

function restoreGoogleSignInBtn(text = 'Continue with Google') {
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        const span = btn.querySelector('span');
        if (span) span.textContent = text;
    }
}

function fetchUserInfo(accessToken) {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to retrieve profile from Google');
        return res.json();
    })
    .then(payload => {
        console.log('Google authentication verified successfully.');
        
        _googleUser = {
            name: payload.name || '',
            email: payload.email || '',
            picture: payload.picture || ''
        };
        sessionStorage.setItem('_googleUser', JSON.stringify(_googleUser));

        const emailInput = document.getElementById('hidden-email');
        const nameInput = document.getElementById('hidden-name');
        if (emailInput) emailInput.value = payload.email;
        if (nameInput) nameInput.value = payload.name;
        
        const signInWrapper = document.querySelector('.g-signin-wrapper');
        const userCard = document.getElementById('google-user-card');
        
        if (signInWrapper) signInWrapper.style.display = 'none';
        if (userCard) {
            userCard.style.display = 'flex';
            updateGoogleAvatar(payload.picture, payload.name, payload.email);
            const nameEl = document.getElementById('google-display-name');
            if (nameEl) nameEl.textContent = payload.name || '';
            const emailEl = document.getElementById('google-display-email');
            if (emailEl) emailEl.textContent = payload.email || '';
        }

        // Jump chat terminal to step 2 if available
        if (window.advanceChatToMessage) {
            window.advanceChatToMessage(payload.name, payload.email);
        }
    })
    .catch(err => {
        console.error("Error fetching user info:", err);
        restoreGoogleSignInBtn();
    });
}

window.triggerGoogleSignIn = function() {
    if (isGoogleSigningIn) return;

    if (!googleTokenClient && window.google && google.accounts && google.accounts.oauth2) {
        initGoogleSignIn();
    }

    if (googleTokenClient) {
        const btn = document.getElementById('google-signin-btn');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.75';
            btn.style.cursor = 'wait';
            const span = btn.querySelector('span');
            if (span) span.textContent = 'Connecting...';
        }
        isGoogleSigningIn = true;
        try {
            googleTokenClient.requestAccessToken({ prompt: 'select_account' });
        } catch (e) {
            isGoogleSigningIn = false;
            restoreGoogleSignInBtn();
            console.error("Error launching Google popup:", e);
        }

        // Safety fallback timer to restore button if popup abandoned
        setTimeout(() => {
            if (isGoogleSigningIn) {
                isGoogleSigningIn = false;
                restoreGoogleSignInBtn();
            }
        }, 15000);
    } else {
        alert("Google Sign-In is still loading. Please check your internet connection or try again in a few seconds.");
    }
};

window.clearGoogleSignIn = function() {
    _googleUser = null;
    sessionStorage.removeItem('_googleUser');

    const emailInput = document.getElementById('hidden-email');
    const nameInput = document.getElementById('hidden-name');
    if (emailInput) emailInput.value = '';
    if (nameInput) nameInput.value = '';

    const contactName = document.getElementById('contact-name');
    const contactEmail = document.getElementById('contact-email');
    if (contactName) {
        contactName.removeAttribute('readonly');
        contactName.classList.remove('google-locked');
        contactName.value = '';
    }
    if (contactEmail) {
        contactEmail.removeAttribute('readonly');
        contactEmail.classList.remove('google-locked');
        contactEmail.value = '';
    }
    
    const signInWrapper = document.querySelector('.g-signin-wrapper');
    const userCard = document.getElementById('google-user-card');
    const avatarEl = document.getElementById('google-avatar');
    const fallbackEl = document.getElementById('google-avatar-fallback');
    
    if (signInWrapper) signInWrapper.style.display = 'block';
    if (userCard) userCard.style.display = 'none';
    if (avatarEl) {
        avatarEl.src = '';
        avatarEl.style.display = 'none';
    }
    if (fallbackEl) fallbackEl.style.display = 'none';

    // Reset chat terminal if available
    if (window.resetChat) {
        window.resetChat();
    }
};

window.switchGoogleAccount = function() {
    clearGoogleSignIn();
    triggerGoogleSignIn();
};


// -- Dynamic Version Fetcher -------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    fetch('version.json')
        .then(response => response.json())
        .then(data => {
            const versionEl = document.getElementById('app-version-display');
            if (versionEl && data.version) {
                versionEl.textContent = data.version;
            }
        })
        .catch(err => console.error('Error fetching version:', err));
});


// -- Double-tap support for mobile/touch devices on clickable preview images --
document.addEventListener('DOMContentLoaded', () => {
    let lastTap = 0;
    const clickableImages = document.querySelectorAll('.clickable-preview');
    clickableImages.forEach(img => {
        img.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 350 && tapLength > 0) {
                const url = img.getAttribute('data-url') || 'https://secure-vault-delta-virid.vercel.app/';
                window.open(url, '_blank', 'noopener,noreferrer');
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    });
});
