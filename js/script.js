/* =========================================================
   THREE.JS
========================================================= */

import * as THREE from "three";

import {
    GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


/* =========================================================
   CUSTOM CURSOR
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

    cursorX += (mouseX - cursorX) * 0.12;
    cursorY += (mouseY - cursorY) * 0.12;

    if (cursor) {
        cursor.style.transform =
            `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }

    if (cursorDot) {
        cursorDot.style.transform =
            `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }

    requestAnimationFrame(animateCursor);
}

animateCursor();


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
   ORBITING CODE / DATA PARTICLES ANIMATION VARIABLES
========================================================= */

const codeSymbols = ["</>", "{ }", "01", "C++", "PY", "JS", "DB", "fn()"];
const orbitingGroup = new THREE.Group();
const codeElements = [];
const particleCount = 20;
const orbitRadius = 1.8;

 // Create clean text textures with zero shadow blur box artifacts
function createTextTexture(text) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas completely transparent
    ctx.clearRect(0, 0, 1024, 1024);

    // Draw crisp text without canvas shadow blur to eliminate square borders
    ctx.font = "bold 60px 'Space Grotesk', monospace";
    ctx.fillStyle = "#ff002b"; 
    ctx.shadowColor = "#ff0062";
    ctx.shadowBlur = 15;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

/* =========================================================
   INITIALIZE CHARACTER
========================================================= */

function initCharacter() {

    if (!characterContainer) return;


    /* -----------------------------------------------------
       SCENE
    ----------------------------------------------------- */

    scene = new THREE.Scene();
    scene.add(orbitingGroup);


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
    renderer.setClearColor(0x000000, 0);

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


    /* =====================================================
       SETUP ORBITING CODE PARTICLES
    ===================================================== */

    for (let i = 0; i < particleCount; i++) {
        const symbol = codeSymbols[i % codeSymbols.length];
        const texture = createTextTexture(symbol);
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0,
            depthWrite: false, // Prevents depth fighting / square box cutting
            blending: THREE.AdditiveBlending
        });

        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.9, 0.9, 0.9);

        const angle = (i / particleCount) * Math.PI * 2;
        const yOffset = (Math.random() - 0.5) * 1.8;
        
        codeElements.push({
            sprite: sprite,
            angle: angle,
            radius: orbitRadius + (Math.random() * 0.4 - 0.2),
            speed: 0.35 + Math.random() * 0.25,
            yPos: yOffset,
            ySpeed: 1.2 + Math.random()
        });

        orbitingGroup.add(sprite);
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
       Animate Orbiting Code Particles
    ----------------------------------------------------- */

    codeElements.forEach((el) => {
        el.angle += el.speed * 0.016; 
        
        el.sprite.position.x = Math.cos(el.angle) * el.radius;
        el.sprite.position.z = Math.sin(el.angle) * el.radius;
        el.sprite.position.y = el.yPos + Math.sin(time * el.ySpeed) * 0.15;
    });


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
        true
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
   ACTIVE NAVIGATION
========================================================= */

const sections =
    document.querySelectorAll("main section");

const navLinks =
    document.querySelectorAll(
        ".nav-links a"
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