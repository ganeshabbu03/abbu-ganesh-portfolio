/* ==========================================================================
   MINIMALIST 3D PORTFOLIO LOGIC
   Featuring: Three.js Particles, Scroll Parallax, and AI Generator Simulator
   ========================================================================== */

// --- Global App State ---
const state = {
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    scroll: { y: 0, targetY: 0 },
    windowSize: { width: window.innerWidth, height: window.innerHeight },
    videoCanvasInterval: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    initNavigation();
    initAILab();
    initContactForm();
    initScrollAnimations();
});

// ==========================================================================
// THREE.JS GRAPHICS
// ==========================================================================
let scene, camera, renderer;
let particleSystem;
let wireframeMesh;
let lights = [];

function initThree() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    // 1. Scene & Camera Setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.015);

    camera = new THREE.PerspectiveCamera(60, state.windowSize.width / state.windowSize.height, 0.1, 100);
    camera.position.z = 30;
    camera.position.y = 0;

    // 2. Renderer Setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true // Let CSS background display through
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(state.windowSize.width, state.windowSize.height);
    renderer.setClearColor(0x050505, 0.2);

    // 3. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);
    lights.push(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 100);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);
    lights.push(pointLight2);

    // 4. Create Minimal Particle System
    createParticles();

    // 5. Create Central Geometric Wireframe Mesh
    createWireframeMesh();

    // 6. Event Listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    // 7. Start Animation Loop
    animate();
}

function createParticles() {
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Distribute in a spherical shell or large box
        positions[i * 3] = (Math.random() - 0.5) * 80;     // X
        positions[i * 3 + 1] = (Math.random() - 0.5) * 80; // Y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80; // Z
        
        speeds[i] = 0.02 + Math.random() * 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Minimalist square particle texture (generated programmatically)
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    particleSystem = new THREE.Points(geometry, material);
    particleSystem.userData = { speeds: speeds };
    scene.add(particleSystem);
}

function createWireframeMesh() {
    // Torus Knot creates beautiful clean minimalist geometric lines
    const geometry = new THREE.TorusKnotGeometry(9, 2.5, 120, 12, 3, 4);
    
    // Premium wireframe material
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.06,
        shininess: 90
    });

    wireframeMesh = new THREE.Mesh(geometry, material);
    scene.add(wireframeMesh);
}

function onWindowResize() {
    state.windowSize.width = window.innerWidth;
    state.windowSize.height = window.innerHeight;

    camera.aspect = state.windowSize.width / state.windowSize.height;
    camera.updateProjectionMatrix();

    renderer.setSize(state.windowSize.width, state.windowSize.height);
}

function onMouseMove(event) {
    // Normalize coordinates (-1 to +1)
    state.mouse.targetX = (event.clientX / state.windowSize.width) * 2 - 1;
    state.mouse.targetY = -(event.clientY / state.windowSize.height) * 2 + 1;
}

// 8. Main Loop
function animate() {
    requestAnimationFrame(animate);

    // Smooth Mouse Lerp (Ease out)
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.05;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.05;

    // Smooth Scroll Lerp
    state.scroll.y += (window.scrollY - state.scroll.y) * 0.08;

    // A. Animate Particles (floating slow drift up)
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        const speeds = particleSystem.userData.speeds;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
            positions[i * 3 + 1] += speeds[i] * 0.1; // Drift Y
            
            // Wobble X slightly
            positions[i * 3] += Math.sin(Date.now() * 0.001 + i) * 0.005;

            // Reset particle if it drifts too high
            if (positions[i * 3 + 1] > 40) {
                positions[i * 3 + 1] = -40;
                positions[i * 3] = (Math.random() - 0.5) * 80;
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.rotation.y += 0.0003;
    }

    // B. Rotate and distort wireframe mesh
    if (wireframeMesh) {
        // Base rotation
        wireframeMesh.rotation.x += 0.001;
        wireframeMesh.rotation.y += 0.0015;

        // Interaction rotation based on mouse
        wireframeMesh.rotation.x += state.mouse.y * 0.002;
        wireframeMesh.rotation.y += state.mouse.x * 0.002;

        // Scroll based mesh scale (slight breathe effect)
        const scrollFactor = state.scroll.y / 2000;
        const scaleVal = 1 - Math.min(scrollFactor * 0.2, 0.4);
        wireframeMesh.scale.set(scaleVal, scaleVal, scaleVal);
        
        // Dynamic opacity: make it disappear when scrolling deep into sections to prevent clutter
        wireframeMesh.material.opacity = 0.06 - Math.min(state.scroll.y / 4000, 0.04);
    }

    // C. Camera Scroll Movement (Parallax)
    // Moving camera vertically and depth-wise according to scroll position
    camera.position.y = -state.scroll.y * 0.015;
    camera.position.x = state.mouse.x * 2.5;
    camera.lookAt(0, -state.scroll.y * 0.015, 0);

    // Point lights chase the mouse cursor for dynamic illumination
    if (lights[0]) {
        lights[0].position.x = state.mouse.x * 30 + 10;
        lights[0].position.y = state.mouse.y * 30 - (state.scroll.y * 0.015);
    }

    renderer.render(scene, camera);
}


// ==========================================================================
// NAVIGATION & INTERFACE
// ==========================================================================
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Mobile menu toggle
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            nav.classList.toggle('open');
        });
    }

    // Close menu when clicking links on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggle && nav) {
                navToggle.classList.remove('open');
                nav.classList.remove('open');
            }
        });
    });

    // Intersection Observer to highlight active navigation link
    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Center-weighted threshold
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}


// ==========================================================================
// GENERATIVE AI LAB (Nano Banana & Veo)
// ==========================================================================
function initAILab() {
    const modelSelect = document.getElementById('model-select');
    const promptSelect = document.getElementById('prompt-select');
    const runBtn = document.getElementById('run-gen-btn');
    const termLog = document.getElementById('terminal-log');
    
    const previewStatus = document.getElementById('preview-status');
    const placeholder = document.getElementById('preview-placeholder');
    const previewMedia = document.getElementById('preview-media');
    const previewImg = document.getElementById('preview-img');
    const videoContainer = document.getElementById('video-sim-canvas-container');
    const metaDisplay = document.getElementById('asset-meta-display');

    if (!runBtn) return;

    // Toggle prompt list based on model select
    modelSelect.addEventListener('change', () => {
        logToTerminal(`System: switched target model to ${modelSelect.value === 'nano-banana' ? 'google/nano-banana-pro' : 'google/veo-video-v1'}`);
    });

    runBtn.addEventListener('click', () => {
        const model = modelSelect.value;
        const promptKey = promptSelect.value;
        const promptText = promptSelect.options[promptSelect.selectedIndex].text;

        // Reset previous preview states
        clearInterval(state.videoCanvasInterval);
        placeholder.classList.add('hidden');
        previewMedia.classList.remove('hidden');
        previewImg.classList.add('hidden');
        videoContainer.classList.add('hidden');
        
        previewStatus.textContent = 'GENERATING';
        previewStatus.className = 'preview-status generating';
        
        termLog.innerHTML = ''; // Clear terminal logs
        logToTerminal(`sh ai-asset-generator.sh --model "${model}" --prompt "${promptKey}"`);
        
        // Simulation Logs
        const logs = [
            `[INFO] Handshaking with Google DeepMind API nodes...`,
            `[INFO] Model loaded in memory: ${model === 'nano-banana' ? 'Nano Banana Image Engine' : 'Veo Cinematic Video Engine'}`,
            `[INFO] Parsing token embeddings...`,
            `[INFO] Processing prompts: "${promptText.substring(1, 40)}..."`,
            `[DEBUG] Denoising diffusion steps [5/20]`,
            `[DEBUG] Denoising diffusion steps [12/20]`,
            `[DEBUG] Denoising diffusion steps [19/20]`,
            `[INFO] Finalizing visual rendering passes...`,
            `[INFO] Embedding SynthID invisible watermarking...`,
            `[SUCCESS] Asset successfully compiled.`
        ];

        // Stream logs one by one
        let logIndex = 0;
        const streamInterval = setInterval(() => {
            if (logIndex < logs.length) {
                logToTerminal(logs[logIndex]);
                logIndex++;
            } else {
                clearInterval(streamInterval);
                displayAIAsset(model, promptKey);
            }
        }, 350);
    });

    function logToTerminal(message) {
        const row = document.createElement('div');
        row.textContent = message;
        termLog.appendChild(row);
        termLog.scrollTop = termLog.scrollHeight;
    }

    function displayAIAsset(model, promptKey) {
        previewStatus.textContent = 'COMPLETE';
        previewStatus.className = 'preview-status complete';

        if (model === 'nano-banana') {
            // Load pre-generated images matching key
            let imgSrc = '';
            if (promptKey === 'hero') imgSrc = 'assets/images/neural_network_hero.png';
            else if (promptKey === 'rudra') imgSrc = 'assets/images/rudra_assistant.png';
            else if (promptKey === 'biotech') imgSrc = 'assets/images/biotech_internship.png';

            previewImg.src = imgSrc;
            previewImg.classList.remove('hidden');
            
            metaDisplay.innerHTML = `<span>DIMENSION: 1024x1024</span><span>WATERMARK: SYNTHID_IMAGE_ENABLED</span>`;
        } else {
            // Simulate Veo generated video loop using 2D Canvas
            videoContainer.classList.remove('hidden');
            metaDisplay.innerHTML = `<span>DIMENSION: 1920x1080 (30FPS)</span><span>WATERMARK: SYNTHID_VEO_VIDEO</span>`;
            
            startVeoCanvasSimulation(promptKey);
        }
    }
}

// Draw procedural generative graphics on a canvas to simulate the AI generated video loop
function startVeoCanvasSimulation(promptKey) {
    const canvas = document.getElementById('video-sim-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 480;
    canvas.height = 270;

    let frame = 0;

    function draw() {
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        frame++;

        if (promptKey === 'hero') {
            // Draw floating neural web simulation
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.lineWidth = 1;
            
            const nodes = [];
            const nodeCount = 18;
            for (let i = 0; i < nodeCount; i++) {
                const angle = (i / nodeCount) * Math.PI * 2 + (frame * 0.008);
                const r = 60 + Math.sin(frame * 0.02 + i) * 15;
                const x = canvas.width / 2 + Math.cos(angle) * r;
                const y = canvas.height / 2 + Math.sin(angle) * r;
                nodes.push({ x, y });
            }

            // Draw connection lines
            ctx.beginPath();
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                    if (dist < 100) {
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.4 - dist / 250})`;
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            nodes.forEach(n => {
                ctx.fillStyle = '#ff007f';
                ctx.beginPath();
                ctx.arc(n.x, n.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

        } else if (promptKey === 'rudra') {
            // Draw breathing holographic soundwave orb simulation
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Draw background waves
            ctx.lineWidth = 1.5;
            for (let r = 0; r < 5; r++) {
                const radius = 40 + r * 12 + Math.sin(frame * 0.05 + r) * 6;
                ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 - r * 0.15})`;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // Draw crosshairs
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.beginPath();
                ctx.moveTo(centerX - 100, centerY);
                ctx.lineTo(centerX + 100, centerY);
                ctx.moveTo(centerX, centerY - 100);
                ctx.lineTo(centerX, centerY + 100);
                ctx.stroke();
            }

            // Central core
            const pulse = 15 + Math.sin(frame * 0.1) * 3;
            ctx.fillStyle = 'rgba(255, 0, 127, 0.7)';
            ctx.beginPath();
            ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
            ctx.fill();

        } else if (promptKey === 'biotech') {
            // Draw revolving DNA double helix simulation
            const centerY = canvas.height / 2;
            const helixWidth = 240;
            const startX = (canvas.width - helixWidth) / 2;
            
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 20; i++) {
                const x = startX + (i / 19) * helixWidth;
                const angle = (i * 0.5) + (frame * 0.05);
                const y1 = centerY + Math.sin(angle) * 35;
                const y2 = centerY - Math.sin(angle) * 35;
                
                // Draw connecting bond line
                ctx.strokeStyle = `rgba(0, 255, 102, ${Math.abs(Math.sin(angle)) * 0.3 + 0.15})`;
                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();

                // Draw strands dots
                ctx.fillStyle = '#00f0ff';
                ctx.beginPath();
                ctx.arc(x, y1, 4, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#00ff66';
                ctx.beginPath();
                ctx.arc(x, y2, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    state.videoCanvasInterval = setInterval(draw, 1000 / 30); // 30 FPS
}


// ==========================================================================
// SCROLL REVEAL ANIMATIONS
// ==========================================================================
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // Add fade class to elements
    fadeElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(15px)';
        el.style.transition = `opacity 0.8s var(--ease-custom), transform 0.8s var(--ease-custom)`;
        el.style.transitionDelay = `${index * 0.15}s`;
        
        // Instantly trigger on load
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100);
    });

    // Reveal elements as they scroll into view
    const revealElements = document.querySelectorAll('.project-card, .timeline-item, .achievement-card, .skills-grid');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(25px)';
        el.style.transition = `opacity 1s var(--ease-custom), transform 1s var(--ease-custom)`;
        revealObserver.observe(el);
    });
}


// ==========================================================================
// CONTACT FORM MOCK
// ==========================================================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');

    if (!form || !status) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.form-submit-btn');
        const prevBtnText = submitBtn.textContent;
        
        submitBtn.textContent = 'SENDING...';
        submitBtn.disabled = true;
        
        status.className = 'form-status';
        status.textContent = '';

        setTimeout(() => {
            submitBtn.textContent = prevBtnText;
            submitBtn.disabled = false;
            
            status.className = 'form-status success';
            status.textContent = 'SUCCESS: Message transmitted. Thank you, Abbu will contact you soon.';
            
            form.reset();
        }, 1200);
    });
}
