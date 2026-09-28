/* =========================================================
   CUSTOM CURSOR
========================================================= */

const cursor =
    document.querySelector(".cursor");

const cursorDot =
    document.querySelector(".cursor-dot");


let mouseX = window.innerWidth / 2;

let mouseY = window.innerHeight / 2;

let cursorX = mouseX;

let cursorY = mouseY;


document.addEventListener(
    "mousemove",
    function(event) {

        mouseX = event.clientX;

        mouseY = event.clientY;

    }
);


function animateCursor() {

    cursorX +=
        (mouseX - cursorX) * .15;

    cursorY +=
        (mouseY - cursorY) * .15;


    if(cursor) {

        cursor.style.left =
            cursorX + "px";

        cursor.style.top =
            cursorY + "px";

    }


    if(cursorDot) {

        cursorDot.style.left =
            mouseX + "px";

        cursorDot.style.top =
            mouseY + "px";

    }


    requestAnimationFrame(
        animateCursor
    );

}


animateCursor();


/* =========================================================
   PANDA EYE TRACKING
========================================================= */

const panda =
    document.querySelector(
        ".panda-character"
    );


const pupils =
    document.querySelectorAll(
        ".pupil"
    );


const pandaStage =
    document.querySelector(
        ".panda-stage"
    );


document.addEventListener(
    "mousemove",
    function(event) {

        if(!panda) return;


        const pandaRect =
            panda.getBoundingClientRect();


        const pandaCenterX =
            pandaRect.left +
            pandaRect.width / 2;


        const pandaCenterY =
            pandaRect.top +
            pandaRect.height / 3;


        const dx =
            event.clientX -
            pandaCenterX;


        const dy =
            event.clientY -
            pandaCenterY;


        /*
         * Limit the eye movement.
         * This keeps the panda looking natural.
         */

        const maxMove = 8;


        let eyeX =
            Math.max(
                -maxMove,
                Math.min(
                    maxMove,
                    dx / 45
                )
            );


        let eyeY =
            Math.max(
                -maxMove,
                Math.min(
                    maxMove,
                    dy / 55
                )
            );


        pupils.forEach(
            function(pupil) {

                pupil.style.transform =
                    `
                    translate(
                        calc(-50% + ${eyeX}px),
                        calc(-50% + ${eyeY}px)
                    )
                    `;

            }
        );


        /*
         * Slight head movement.
         */

        const head =
            document.querySelector(
                ".panda-head"
            );


        if(head) {

            const headX =
                Math.max(
                    -4,
                    Math.min(
                        4,
                        dx / 150
                    )
                );


            const headY =
                Math.max(
                    -3,
                    Math.min(
                        3,
                        dy / 180
                    )
                );


            head.style.transform =
                `
                translateX(-50%)
                translate(
                    ${headX}px,
                    ${headY}px
                )
                `;

        }

    }
);


/* =========================================================
   PANDA CHEWING
========================================================= */

const pandaCharacter =
    document.querySelector(
        ".panda-character"
    );


function chewingAnimation() {

    if(!pandaCharacter) return;


    pandaCharacter.classList.add(
        "chewing"
    );


    setTimeout(
        function() {

            pandaCharacter.classList.remove(
                "chewing"
            );

        },
        250
    );

}


/*
 * Panda chews continuously,
 * but not at robotic intervals.
 */

setInterval(
    chewingAnimation,
    1300
);


/* =========================================================
   BLINKING
========================================================= */

const eyes =
    document.querySelectorAll(
        ".eye"
    );


function pandaBlink() {

    eyes.forEach(
        function(eye) {

            eye.style.transform =
                "translateX(-50%) scaleY(.08)";

        }
    );


    setTimeout(
        function() {

            eyes.forEach(
                function(eye) {

                    eye.style.transform =
                        "translateX(-50%) scaleY(1)";

                }
            );

        },
        150
    );

}


/*
 * Natural-looking random blink.
 */

function randomBlink() {

    pandaBlink();


    const nextBlink =
        2500 +
        Math.random() * 3500;


    setTimeout(
        randomBlink,
        nextBlink
    );

}


setTimeout(
    randomBlink,
    2500
);


/* =========================================================
   PANDA SUBTLE CURSOR RESPONSE
========================================================= */

document.addEventListener(
    "mousemove",
    function(event) {

        if(!pandaStage) return;


        const rect =
            pandaStage.getBoundingClientRect();


        const centerX =
            rect.left +
            rect.width / 2;


        const centerY =
            rect.top +
            rect.height / 2;


        const dx =
            event.clientX -
            centerX;


        const dy =
            event.clientY -
            centerY;


        /*
         * Tiny body movement.
         */

        const moveX =
            Math.max(
                -5,
                Math.min(
                    5,
                    dx / 300
                )
            );


        const moveY =
            Math.max(
                -3,
                Math.min(
                    3,
                    dy / 350
                )
            );


        pandaCharacter.style.setProperty(
            "--mouse-x",
            `${moveX}px`
        );


        pandaCharacter.style.setProperty(
            "--mouse-y",
            `${moveY}px`
        );

    }
);


/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton =
    document.querySelector(
        ".menu-button"
    );


const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );


if(menuButton && mobileMenu) {

    menuButton.addEventListener(
        "click",
        function() {

            mobileMenu.classList.toggle(
                "open"
            );

        }
    );


    mobileMenu
        .querySelectorAll("a")
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    function() {

                        mobileMenu.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ACTIVE NAVIGATION
========================================================= */

const navLinks =
    document.querySelectorAll(
        ".nav-link"
    );


const sections =
    document.querySelectorAll(
        "section[id]"
    );


function updateNavigation() {

    let current = "";


    sections.forEach(
        function(section) {

            const top =
                section.offsetTop;


            if(
                window.scrollY >=
                top - 250
            ) {

                current =
                    section.id;

            }

        }
    );


    navLinks.forEach(
        function(link) {

            link.classList.remove(
                "active"
            );


            if(
                link.getAttribute("href") ===
                "#" + current
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );

}


window.addEventListener(
    "scroll",
    updateNavigation
);


updateNavigation();


/* =========================================================
   CARD TILT
========================================================= */

const cards =
    document.querySelectorAll(
        ".project-card, .skill-card"
    );


cards.forEach(
    function(card) {

        card.addEventListener(
            "mousemove",
            function(event) {

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
                    centerY) * -2;


                const rotateY =
                    ((x - centerX) /
                    centerX) * 2;


                card.style.transform =
                    `
                    perspective(900px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateY(-6px)
                    `;

            }
        );


        card.addEventListener(
            "mouseleave",
            function() {

                card.style.transform = "";

            }
        );

    }
);


/* =========================================================
   BUTTON MAGNETIC EFFECT
========================================================= */

const buttons =
    document.querySelectorAll(
        ".button, .contact-button"
    );


buttons.forEach(
    function(button) {

        button.addEventListener(
            "mousemove",
            function(event) {

                const rect =
                    button.getBoundingClientRect();


                const x =
                    event.clientX -
                    rect.left -
                    rect.width / 2;


                const y =
                    event.clientY -
                    rect.top -
                    rect.height / 2;


                button.style.transform =
                    `
                    translate(
                        ${x * .08}px,
                        ${y * .08}px
                    )
                    `;

            }
        );


        button.addEventListener(
            "mouseleave",
            function() {

                button.style.transform = "";

            }
        );

    }
);