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
    const avatar    = document.getElementById('google-avatar');
    const dispName  = document.getElementById('google-display-name');
    const dispEmail = document.getElementById('google-display-email');

    if (signinBtn)  signinBtn.style.display = 'none';
    if (userCard)   userCard.style.display   = 'flex';
    if (avatar)     avatar.src = (picture && typeof picture === 'string' && picture.startsWith('https://')) ? picture : '';
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

let _isGoogleSignInLoading = false;
let _googleTokenClient = null;
let _googleSignInTimeout = null;

function _initGoogleClient() {
    const CLIENT_ID = '323113584930-qff55p96cturm9gdk1k3vki075o7h8dg.apps.googleusercontent.com';
    if (window.google && google.accounts && google.accounts.oauth2) {
        _googleTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: 'openid profile email',
            callback: (tokenResponse) => {
                clearTimeout(_googleSignInTimeout);
                _restoreGoogleSignInBtn();
                if (tokenResponse.error) {
                    console.error('[GSI] OAuth2 token error:', tokenResponse.error);
                    return;
                }
                // Exchange access token for user profile via Google's userinfo endpoint
                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
                })
                .then(r => r.json())
                .then(info => {
                    _googleUser = {
                        name    : info.name    || '',
                        email   : info.email   || '',
                        picture : info.picture || ''
                    };
                    _applyGoogleUser();
                })
                .catch(err => {
                    console.error('[GSI] userinfo fetch failed:', err);
                    alert('Could not retrieve your Google profile. Please try again.');
                });
            }
        });
    }
}

function _restoreGoogleSignInBtn(text = null) {
    _isGoogleSignInLoading = false;
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
        btn.disabled = false;
        const span = btn.querySelector('span');
        if (span) {
            span.innerHTML = text || btn._originalText || 'Continue with Google';
        }
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

/**
 * Triggers Google sign-in.
 * Opens the OAuth2 popup directly on user click.
 */
function triggerGoogleSignIn() {
    if (_isGoogleSignInLoading) return;

    if (!window.google || !google.accounts) {
        alert('Google Sign-In is still loading. Please wait a moment and try again.');
        return;
    }

    if (!_googleTokenClient) {
        _initGoogleClient();
    }

    if (!_googleTokenClient) {
        alert('Google Sign-In could not be initialized.');
        return;
    }

    // Call requestAccessToken IMMEDIATELY in the click stack to prevent popup blockers
    _googleTokenClient.requestAccessToken({ prompt: 'select_account' });

    // Then update the DOM
    const btn = document.getElementById('google-signin-btn');
    if (btn) {
        btn.disabled = true;
        const span = btn.querySelector('span');
        if (span) {
            if (!btn._originalText) btn._originalText = span.innerHTML;
            span.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
    }
    _isGoogleSignInLoading = true;

    // Reset button after 12 seconds to "Try again" if stuck
    clearTimeout(_googleSignInTimeout);
    _googleSignInTimeout = setTimeout(() => {
        if (_isGoogleSignInLoading) {
            _restoreGoogleSignInBtn('Try again');
        }
    }, 12000);
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
        progress += Math.floor(Math.random() * 4) + 1; // Slower increment (1 to 4)

        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);

            setTimeout(() => {
                preloader.classList.add('fade-out');
                document.body.style.overflow = '';

                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 800); // Wait a bit longer at 100%
        }

        if (progressFill && progressPercent) {
            progressFill.style.width = `${progress}%`;
            progressPercent.textContent = `${progress}%`;
        }

    }, 150); // Slower interval (150ms)
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

    // Only count once per browser session (not on every refresh)
    if (!sessionStorage.getItem('counted')) {
        let count = parseInt(localStorage.getItem('sivesh_visitors') || '0', 10);
        count += 1;
        localStorage.setItem('sivesh_visitors', count);
        sessionStorage.setItem('counted', 'true');
    }

    const count = parseInt(localStorage.getItem('sivesh_visitors') || '0', 10);
    visitorCountEl.textContent = count;
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
                addMessage(`Thanks for signing in with Google, ${name.split(' ')[0]}! What is the purpose of your message?`);
            }, 600);
        } else {
            chatStep = 3; // Jump straight to message step
            chatInput.placeholder = "Type your message...";
            setTimeout(() => {
                addMessage(`Thanks for signing in with Google, ${name.split(' ')[0]}! What message would you like to send Sivesh?`);
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
        
        chatInput.placeholder = "Type your purpose...";
        chatMessages.innerHTML = `<div class="chat-msg bot-msg">
            <i class="fas fa-robot"></i> <span>Hi! I'm Sivesh's virtual assistant. I can help you leave a message. First, what is the purpose of your message?</span>
        </div>`;
    };

    function handleChatSend() {
        let text = chatInput.value.trim();
        if (!text) return;
        if (text.length > 1000) text = text.slice(0, 1000);
        
        // Add user message to UI
        addMessage(text, true);
        chatInput.value = '';

        if (chatStep === 0) {
            // Save Purpose
            if(hiddenPurpose) hiddenPurpose.value = text.slice(0, 200);
            
            if (hiddenName.value && hiddenEmail.value) {
                // If signed in with Google
                chatStep = 3;
                chatInput.placeholder = "Type your message...";
                setTimeout(() => {
                    addMessage(`Got it! What message would you like to send Sivesh?`);
                }, 600);
            } else {
                chatInput.placeholder = "Type your name...";
                setTimeout(() => {
                    addMessage(`Got it! And what is your name?`);
                }, 600);
                chatStep++;
            }
        } else if (chatStep === 1) {
            // Save Name
            hiddenName.value = text.slice(0, 100);
            chatInput.placeholder = "Type your email...";
            setTimeout(() => {
                addMessage(`Nice to meet you, ${hiddenName.value}! What's the best email to reach you at?`);
            }, 600);
            chatStep++;
        } else if (chatStep === 2) {
            // Validate Email
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
                setTimeout(() => {
                    addMessage(`Hmm, that doesn't look like a valid email. Could you please provide a correct email address?`);
                }, 600);
                return; // Do not advance chatStep
            }
            // Save Email
            hiddenEmail.value = text;
            chatInput.placeholder = "Type your message...";
            setTimeout(() => {
                addMessage(`Got it! What message would you like to send Sivesh?`);
            }, 600);
            chatStep++;
        } else if (chatStep >= 3) {
            // Save Message (whether it's the first one or an additional one)
            hiddenMessage.value = text.slice(0, 2000);
            chatInput.style.display = 'none';
            chatSendBtn.style.display = 'none';
            
            if (chatStep === 3) {
                setTimeout(() => {
                    addMessage(`Almost done! Please verify you are human before sending.`);
                    if (hcaptchaContainer) hcaptchaContainer.style.display = 'flex';
                }, 600);
                chatStep = 4;
            } else {
                // Additional message after submit
                setTimeout(() => {
                    addMessage(`Please verify you are human again to send another message.`);
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
        chatInput.placeholder = "Sending message...";
        chatInput.disabled = true;
        chatSendBtn.disabled = true;
        if (captchaSendBtn) captchaSendBtn.disabled = true;
        
        setTimeout(() => {
            if (chatStep === 4) {
                addMessage(`Perfect. Sending your message to Sivesh now...`);
            } else {
                addMessage(`Sending your additional message...`);
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
                    addMessage('Message sent successfully! You will also receive an email confirmation. If you have anything else to add, just type it below.');
                    chatStep = 5;
                    if(hcaptchaContainer) hcaptchaContainer.style.display = 'none';
                    chatInput.style.display = 'block';
                    chatSendBtn.style.display = 'block';
                } else {
                    addMessage('Oops, something went wrong. Please try sending it again.');
                }
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                if (captchaSendBtn) captchaSendBtn.disabled = false;
                chatInput.placeholder = "Type another message...";
                chatInput.focus();
                
                // Refill google user if applicable
                if (window.refillGoogleUserAfterSubmit) {
                    window.refillGoogleUserAfterSubmit();
                }
            })
            .catch(error => {
                addMessage('Oops, a network error occurred. Please check your connection and try again.');
                chatInput.disabled = false;
                chatSendBtn.disabled = false;
                if (captchaSendBtn) captchaSendBtn.disabled = false;
                chatInput.placeholder = "Type your message...";
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
                addMessage(`Please complete the captcha verification first.`);
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
            chatInput.placeholder = "Type your purpose...";
            if (chatMessages) {
                chatMessages.innerHTML = `<div class="chat-msg bot-msg">
                    <i class="fas fa-robot"></i> <span>Hi! I'm Sivesh's virtual assistant. I can help you leave a message. First, what is the purpose of your message?</span>
                </div>`;
            }
        }
    }, 100);
});

// ==================== GOOGLE SIGN-IN ==================== //
let googleTokenClient;

function initGoogleSignIn() {
    if (window.google && google.accounts && google.accounts.oauth2) {
        googleTokenClient = google.accounts.oauth2.initTokenClient({
            client_id: '323113584930-qff55p96cturm9gdk1k3vki075o7h8dg.apps.googleusercontent.com',
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    fetchUserInfo(tokenResponse.access_token);
                }
            }
        });
    } else {
        setTimeout(initGoogleSignIn, 100);
    }
}
initGoogleSignIn();

function fetchUserInfo(accessToken) {
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(payload => {
        console.log('Google Sign-In successful:', payload.email);
        
        const emailInput = document.getElementById('hidden-email');
        const nameInput = document.getElementById('hidden-name');
        if (emailInput) emailInput.value = payload.email;
        if (nameInput) nameInput.value = payload.name;
        
        const signInWrapper = document.querySelector('.g-signin-wrapper');
        const userCard = document.getElementById('google-user-card');
        
        if (signInWrapper) signInWrapper.style.display = 'none';
        if (userCard) {
            userCard.style.display = 'flex';
            const avatarEl = document.getElementById('google-avatar');
            if (avatarEl) {
                avatarEl.src = (payload.picture && typeof payload.picture === 'string' && payload.picture.startsWith('https://')) ? payload.picture : '';
            }
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
    .catch(err => console.error("Error fetching user info:", err));
}

window.triggerGoogleSignIn = function() {
    if (googleTokenClient) {
        googleTokenClient.requestAccessToken();
    } else {
        alert("Google Sign-In is still loading or unavailable.");
    }
};

window.clearGoogleSignIn = function() {
    _googleUser = null;
    sessionStorage.removeItem('_googleUser');

    const emailInput = document.getElementById('hidden-email');
    const nameInput = document.getElementById('hidden-name');
    if (emailInput) emailInput.value = '';
    if (nameInput) nameInput.value = '';
    
    const signInWrapper = document.querySelector('.g-signin-wrapper');
    const userCard = document.getElementById('google-user-card');
    
    if (signInWrapper) signInWrapper.style.display = 'block';
    if (userCard) userCard.style.display = 'none';

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
