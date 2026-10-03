/* =========================================================
   THREE.JS
========================================================= */

import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   GOD-TIER FLUID AMBIENT GLOW CURSOR & CLICK RIPPLE
========================================================= */

const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth trailing interpolation (lerp) for the ambient glow ring
    cursorX += (mouseX - cursorX) * 0.18;
    cursorY += (mouseY - cursorY) * 0.18;

    if (cursor) {
        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }

    if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Click Ripple Shockwave
window.addEventListener("click", (e) => {
    const ripple = document.createElement("div");
    ripple.classList.add("cursor-ripple");
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
});


/* =========================================================
   3D CHARACTER
========================================================= */

const characterContainer =
    document.querySelector("#character3D");

let scene;
let camera;
let renderer;
let character;


/* =========================================================
   CHARACTER SETTINGS
========================================================= */

const MODEL_FRONT_ROTATION = Math.PI; 
const FACE_LEFT_OFFSET = THREE.MathUtils.degToRad(60); 
const CHARACTER_SIZE = 2.35;
const CHARACTER_Y = -0.62;


/* =========================================================
   EYE TRACKING
========================================================= */

const eyeObjects = [];
const eyeData = [];

let targetEyeX = 0;
let targetEyeY = 0;

let currentEyeX = 0;
let currentEyeY = 0;


/* =========================================================
   INITIALIZE CHARACTER
========================================================= */

function initCharacter() {

    if (!characterContainer) return;


    /* -----------------------------------------------------
       SCENE
    ----------------------------------------------------- */

    scene = new THREE.Scene();


    /* -----------------------------------------------------
       CAMERA
    ----------------------------------------------------- */

    camera = new THREE.PerspectiveCamera(
        32,
        characterContainer.clientWidth /
        characterContainer.clientHeight,
        0.1,
        100
    );

    camera.position.set(
        0,
        0.55,
        5.4
    );


    /* -----------------------------------------------------
       RENDERER
    ----------------------------------------------------- */

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
        characterContainer.clientWidth,
        characterContainer.clientHeight
    );

    renderer.outputColorSpace =
        THREE.SRGBColorSpace;

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    characterContainer.appendChild(
        renderer.domElement
    );


    /* =====================================================
       LIGHTING
    ===================================================== */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            2.2
        );

    scene.add(ambientLight);


    /* Main light */

    const mainLight =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );

    mainLight.position.set(
        3,
        5,
        5
    );

    mainLight.castShadow = true;

    scene.add(mainLight);


    /* Purple fill */

    const purpleLight =
        new THREE.PointLight(
            0x9d7cff,
            1.4,
            8
        );

    purpleLight.position.set(
        -3,
        2,
        2
    );

    scene.add(purpleLight);


    /* Cyan rim light */

    const cyanLight =
        new THREE.PointLight(
            0x68e6dc,
            6,
            10
        );

    cyanLight.position.set(
        3,
        1,
        -3
    );

    scene.add(cyanLight);

    /* =========================================================
   GOLDEN ORBITING CODE PARTICLES (Option 3 Style)
========================================================= */

const codeSymbols = ["</>", "{ }", "01", "C++", "PY", "JS", "DB", "fn()"];
const orbitingGroup = new THREE.Group();
const codeElements = [];
const particleCount = 8;
const orbitRadius = 2.6;

// Create high-res textures with warm gold text and amber glow
function createGoldTextTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, 1024, 1024);

    ctx.font = "bold 44px 'Space Grotesk', monospace";
    ctx.fillStyle = "#ffb703"; // Liquid Gold
    ctx.shadowColor = "#f77f00"; // Warm Amber Glow
    ctx.shadowBlur = 18;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}


    /* =====================================================
       LOAD GLB
    ===================================================== */

    const loader = new GLTFLoader();

    loader.load(
        "models/character.glb",

        (gltf) => {

            character = gltf.scene;

            scene.add(character);


            /* =================================================
               INITIAL MODEL ROTATION
            ================================================= */

            character.rotation.set(
                0,
                MODEL_FRONT_ROTATION + FACE_LEFT_OFFSET,
                0
            );


            /* =================================================
               FIND MESHES + EYES
            ================================================= */

            character.traverse((object) => {

                if (object.isMesh) {

                    object.castShadow = true;
                    object.receiveShadow = true;


                    /* -----------------------------------------
                       EYE DETECTION
                    ----------------------------------------- */

                    const name =
                        object.name.toLowerCase();

                    const isEye =
                        name.includes("eye") ||
                        name.includes("eyeball") ||
                        name.includes("eye_l") ||
                        name.includes("eye_r") ||
                        name.includes("lefteye") ||
                        name.includes("righteye") ||
                        name.includes("pupil") ||
                        name.includes("iris");

                    if (isEye) {

                        eyeObjects.push(object);

                        eyeData.push({
                            object: object,
                            rotationX: object.rotation.x,
                            rotationY: object.rotation.y,
                            rotationZ: object.rotation.z
                        });
                    }
                }
            });


            /* =================================================
               CENTER + SCALE MODEL
            ================================================= */

            const box =
                new THREE.Box3().setFromObject(
                    character
                );

            const size =
                box.getSize(
                    new THREE.Vector3()
                );

            const center =
                box.getCenter(
                    new THREE.Vector3()
                );


            /* Move model to origin */

            character.position.sub(center);


            /* Scale */

            const maxDimension =
                Math.max(
                    size.x,
                    size.y,
                    size.z
                );

            const scale =
                CHARACTER_SIZE /
                maxDimension;

            character.scale.setScalar(scale);


            /* Re-center after scaling */

            const scaledBox =
                new THREE.Box3().setFromObject(
                    character
                );

            const scaledCenter =
                scaledBox.getCenter(
                    new THREE.Vector3()
                );

            character.position.sub(
                scaledCenter
            );


            /* =================================================
               FINAL POSITION
            ================================================= */

            character.position.set(
                0,
                CHARACTER_Y,
                0
            );


            /* =================================================
               FINAL FRONT-LEFT ROTATION
            ================================================= */

            character.rotation.set(
                0,
                MODEL_FRONT_ROTATION + FACE_LEFT_OFFSET,
                0
            );


            /* =================================================
               CAMERA
            ================================================= */

            camera.position.set(
                0,
                0.55,
                5.4
            );

            camera.lookAt(
                0,
                0.15,
                0
            );


            console.log(
                "Character loaded successfully"
            );

            console.log(
                "Detected eyes:",
                eyeObjects.length
            );

        },

        /* =====================================================
           LOADING PROGRESS
        ===================================================== */

        (xhr) => {

            if (xhr.total) {

                const percent =
                    (xhr.loaded / xhr.total) * 100;

                console.log(
                    `Character loading: ${percent.toFixed(0)}%`
                );
            }
        },


        /* =====================================================
           ERROR
        ===================================================== */

        (error) => {

            console.error(
                "Error loading character.glb:",
                error
            );
        }
    );


    /* =====================================================
       MOUSE TRACKING
    ===================================================== */

    window.addEventListener(
        "mousemove",
        (event) => {

            const normalizedX =
                (event.clientX /
                    window.innerWidth) *
                    2 -
                1;

            const normalizedY =
                (event.clientY /
                    window.innerHeight) *
                    2 -
                1;


            /*
               Eye movement amount
            */

            targetEyeX =
                normalizedX * 0.28;

            targetEyeY =
                normalizedY * 0.16;
        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        resizeCharacter
    );


    resizeCharacter();

    animateCharacter();
}


/* =========================================================
   CHARACTER ANIMATION
========================================================= */

function animateCharacter() {

    requestAnimationFrame(
        animateCharacter
    );

    const time =
        performance.now() * 0.001;


    /* -----------------------------------------------------
       Smooth eye movement
    ----------------------------------------------------- */

    currentEyeX +=
        (targetEyeX - currentEyeX) * 0.08;

    currentEyeY +=
        (targetEyeY - currentEyeY) * 0.08;


    /* -----------------------------------------------------
       Move eyes
    ----------------------------------------------------- */

    eyeData.forEach((eye) => {

        if (!eye.object) return;


        eye.object.rotation.y =
            eye.rotationY +
            currentEyeX;

        eye.object.rotation.x =
            eye.rotationX -
            currentEyeY;

        eye.object.rotation.z =
            eye.rotationZ;
    });


    /* -----------------------------------------------------
       Gentle floating animation
    ----------------------------------------------------- */

    if (character) {

        character.position.y =
            CHARACTER_Y +
            Math.sin(time * 1.4) * 0.025;
    }


    /* -----------------------------------------------------
       Render
    ----------------------------------------------------- */

    renderer.render(
        scene,
        camera
    );
}


/* =========================================================
   RESIZE CHARACTER
========================================================= */

function resizeCharacter() {

    if (!characterContainer ||
        !camera ||
        !renderer) {
        return;
    }


    const width =
        characterContainer.clientWidth;

    const height =
        characterContainer.clientHeight;


    if (width === 0 || height === 0) {
        return;
    }


    camera.aspect =
        width / height;

    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );
}


/* =========================================================
   START CHARACTER
========================================================= */

initCharacter();


/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton =
    document.querySelector(".menu-button");

const mobileMenu =
    document.querySelector(".mobile-menu");

if (menuButton && mobileMenu) {

    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle(
                "open"
            );
        }
    );
}


/* =========================================================
   ACTIVE NAVIGATION (Fixed selector to match .nav-link)
========================================================= */

const sections =
    document.querySelectorAll("main section");

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );

window.addEventListener(
    "scroll",
    () => {

        let currentSection = "";

        sections.forEach((section) => {

            const sectionTop =
                section.offsetTop - 180;

            if (
                window.scrollY >=
                sectionTop
            ) {

                currentSection =
                    section.getAttribute("id");
            }
        });


        navLinks.forEach((link) => {

            link.classList.remove(
                "active"
            );

            const href =
                link.getAttribute("href");

            if (
                href ===
                `#${currentSection}`
            ) {

                link.classList.add(
                    "active"
                );
            }
        });
    }
);


/* =========================================================
   CARD TILT
========================================================= */

const tiltCards =
    document.querySelectorAll(
        ".project-card, .skill-card"
    );

tiltCards.forEach((card) => {

    card.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                card.getBoundingClientRect();

            const x =
                event.clientX -
                rect.left;

            const y =
                event.clientY -
                rect.top;


            const centerX =
                rect.width / 2;

            const centerY =
                rect.height / 2;


            const rotateX =
                ((y - centerY) /
                    centerY) *
                -3;

            const rotateY =
                ((x - centerX) /
                    centerX) *
                3;


            card.style.transform =
                `perspective(800px)
                 rotateX(${rotateX}deg)
                 rotateY(${rotateY}deg)
                 translateY(-4px)`;
        }
    );


    card.addEventListener(
        "mouseleave",
        () => {

            card.style.transform =
                "";
        }
    );
});


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

const magneticButtons =
    document.querySelectorAll(
        ".button, .contact-button"
    );

magneticButtons.forEach((button) => {

    button.addEventListener(
        "mousemove",
        (event) => {

            const rect =
                button.getBoundingClientRect();

            const x =
                event.clientX -
                (rect.left +
                    rect.width / 2);

            const y =
                event.clientY -
                (rect.top +
                    rect.height / 2);


            button.style.transform =
                `translate(${x * 0.08}px,
                           ${y * 0.08}px)`;
        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            button.style.transform =
                "";
        }
    );
});

/* =========================================================
   1. SPOTLIGHT GLOW CARDS EFFECT
========================================================= */
const glowCards = document.querySelectorAll(".project-card, .skill-card, .about-card");

glowCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });
});


/* =========================================================
   2. INTERACTIVE DEVELOPER TERMINAL (CLI)
========================================================= */
const terminalInput = document.getElementById("terminalInput");
const terminalOutput = document.getElementById("terminalOutput");
const terminalToggle = document.getElementById("terminalToggle");
const terminalWidget = document.getElementById("terminalWidget");

terminalToggle.addEventListener("click", () => {
    terminalWidget.classList.toggle("minimized");
    terminalToggle.textContent = terminalWidget.classList.contains("minimized") ? "+" : "_";
});

if (terminalInput) {
    terminalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const cmd = terminalInput.value.trim().toLowerCase();
            let response = "";

            switch (cmd) {
                case "help":
                    response = "Available commands: <span class='highlight'>about</span>, <span class='highlight'>skills</span>, <span class='highlight'>projects</span>, <span class='highlight'>contact</span>, <span class='highlight'>clear</span>";
                    break;
                case "about":
                    response = "I'm a software developer focused on building modern web apps and immersive digital experiences.";
                    break;
                case "skills":
                    response = "Frontend: HTML, CSS, JS | Backend: Python, Django, SQL, C++, Java";
                    break;
                case "projects":
                    response = "1. Student Management System (Django)<br>2. Interactive Experience<br>3. Developer Playground";
                    break;
                case "contact":
                    response = "Reach out via the contact section or email me directly!";
                    break;
                case "clear":
                    terminalOutput.innerHTML = "";
                    terminalInput.value = "";
                    return;
                default:
                    response = `<span class='error'>Command not found: '${cmd}'</span>. Type 'help' for options.`;
            }

            terminalOutput.innerHTML += `<br>&gt; ${terminalInput.value}<br>${response}`;
            terminalInput.value = "";
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });
}


/* =========================================================
   3. INTERACTIVE PROJECT PREVIEW MODALS
========================================================= */
const projectCards = document.querySelectorAll(".project-card");
const projectModal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");
const modalCategory = document.getElementById("modalCategory");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalTags = document.getElementById("modalTags");

projectCards.forEach((card) => {
    card.addEventListener("click", () => {
        const category = card.querySelector(".project-category")?.textContent || "PROJECT";
        const title = card.querySelector("h3")?.textContent || "Project Title";
        const desc = card.querySelector("p")?.textContent || "Detailed description of the project architecture and features.";
        const tags = Array.from(card.querySelectorAll(".project-tags span")).map(span => span.textContent);

        modalCategory.textContent = category;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalTags.innerHTML = tags.map(tag => `<span>${tag}</span>`).join("");

        projectModal.classList.add("open");
    });
});

if (modalClose) {
    modalClose.addEventListener("click", () => {
        projectModal.classList.remove("open");
    });
}

projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) {
        projectModal.classList.remove("open");
    }
});


/* =========================================================
   4. CINEMATIC SCROLL REVEALS (Intersection Observer)
========================================================= */
const revealElements = document.querySelectorAll(".section-heading, .about-layout, .skills-grid, .projects-grid, .timeline");

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach(el => {
    revealObserver.observe(el);
});

/* =========================================================
   INTERACTIVE CHARACTER SPEECH BUBBLE LOGIC
========================================================= */
const speechBubble = document.getElementById("characterSpeech");

const developerQuotes = [
    "💡 Tip: Type 'help' in the CLI widget!",
    "☕ Fueled by coffee & clean code.",
    "🚀 Always building, learning & shipping.",
    "💻 Check out my projects below!",
    "✨ Thanks for visiting my portfolio!"
];

if (speechBubble) {
    speechBubble.addEventListener("click", () => {
        const randomQuote = developerQuotes[Math.floor(Math.random() * developerQuotes.length)];
        const textSpan = speechBubble.querySelector("span");
        
        textSpan.style.opacity = 0;
        setTimeout(() => {
            textSpan.textContent = randomQuote;
            textSpan.style.opacity = 1;
        }, 200);
    });
}

/* =========================================================
   CINEMATIC PRELOADER LOGIC
========================================================= */
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    const preloaderBar = document.getElementById("preloaderBar");
    const preloaderText = document.getElementById("preloaderText");

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            setTimeout(() => {
                preloader.classList.add("fade-out");
            }, 300);
        }
        if (preloaderBar) preloaderBar.style.width = `${progress}%`;
        if (preloaderText) preloaderText.textContent = `INITIALIZING SYSTEM... ${progress}%`;
    }, 80);
});
