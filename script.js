```javascript
// ==========================================
// TYPING TEST SCRIPT
// ==========================================

const passageElement =
    document.getElementById("passage");

const typingBox =
    document.getElementById("typingBox");

const timerElement =
    document.getElementById("timer");

const mistakesElement =
    document.getElementById("mistakes");

const keystrokesElement =
    document.getElementById("keystrokes");

const wordsElement =
    document.getElementById("words");

const accuracyElement =
    document.getElementById("accuracy");

const speedElement =
    document.getElementById("speed");

const finishBtn =
    document.getElementById("finishBtn");

const resultBox =
    document.getElementById("result");

const finalSpeed =
    document.getElementById("finalSpeed");

const finalAccuracy =
    document.getElementById("finalAccuracy");

const finalMistakes =
    document.getElementById("finalMistakes");

const finalWords =
    document.getElementById("finalWords");

const finalKeystrokes =
    document.getElementById("finalKeystrokes");

const finalCorrect =
    document.getElementById("finalCorrect");

const finalWrong =
    document.getElementById("finalWrong");

const finalMarks =
    document.getElementById("finalMarks");


// ==========================================
// PASSAGE
// ==========================================

const passage =
    passageElement.innerText
        .replace(/\s+/g, " ")
        .trim();


// ==========================================
// TIMER
// ==========================================

const TOTAL_TIME = 600;

let timeLeft = TOTAL_TIME;

let timerStarted = false;

let testFinished = false;

let timerInterval = null;


// ==========================================
// WORDS
// ==========================================

function getWords(text) {

    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean);

}


// ==========================================
// WORD COMPARISON
// ==========================================

function compareWords(original, typed) {

    const originalWords =
        getWords(original);

    const typedWords =
        getWords(typed);


    // काहीही type केले नसेल
    if (typedWords.length === 0) {
        return 0;
    }


    const rows =
        originalWords.length + 1;

    const cols =
        typedWords.length + 1;


    const dp =
        Array.from(
            { length: rows },
            () => Array(cols).fill(0)
        );


    for (let i = 0; i < rows; i++) {
        dp[i][0] = i;
    }


    for (let j = 0; j < cols; j++) {
        dp[0][j] = j;
    }


    for (let i = 1; i < rows; i++) {

        for (let j = 1; j < cols; j++) {

            const same =
                originalWords[i - 1] ===
                typedWords[j - 1];


            const replace =
                dp[i - 1][j - 1] +
                (same ? 0 : 1);


            const remove =
                dp[i - 1][j] + 1;


            const insert =
                dp[i][j - 1] + 1;


            dp[i][j] =
                Math.min(
                    replace,
                    remove,
                    insert
                );
        }
    }


    return dp[
        originalWords.length
    ][
        typedWords.length
    ];
}


// ==========================================
// SPACE DIFFERENCE
// ==========================================

function countSpaceMistakes(
    original,
    typed
) {

    if (!typed) {
        return 0;
    }


    const originalSpaces =
        (original.match(/ /g) || []).length;


    const typedSpaces =
        (typed.match(/ /g) || []).length;


    // Space difference
    return Math.abs(
        originalSpaces -
        typedSpaces
    );
}


// ==========================================
// TOTAL MISTAKES
// ==========================================

function calculateMistakes(typed) {

    // Nothing typed = zero mistakes
    if (
        !typed ||
        typed.length === 0
    ) {
        return 0;
    }


    const wordMistakes =
        compareWords(
            passage,
            typed
        );


    const spaceMistakes =
        countSpaceMistakes(
            passage,
            typed
        );


    /*
       Word comparison already handles
       wrong / extra / missing words.

       Space difference handles
       extra / missing spaces.
    */

    return (
        wordMistakes +
        spaceMistakes
    );
}


// ==========================================
// TIMER DISPLAY
// ==========================================

function updateTimer() {

    const minutes =
        Math.floor(
            timeLeft / 60
        );


    const seconds =
        timeLeft % 60;


    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ==========================================
// START TIMER
// ==========================================

function startTimer() {

    if (
        timerStarted ||
        testFinished
    ) {
        return;
    }


    timerStarted = true;


    timerInterval =
        setInterval(() => {

            timeLeft--;


            if (timeLeft <= 0) {

                timeLeft = 0;

                updateTimer();

                finishTest();

                return;
            }


            updateTimer();

            updateLiveResults();

        }, 1000);
}


// ==========================================
// LIVE RESULTS
// ==========================================

function updateLiveResults() {

    const typed =
        typingBox.value;


    const typedWords =
        getWords(typed).length;


    const typedKeys =
        typed.length;


    const mistakes =
        calculateMistakes(
            typed
        );


    const correct =
        Math.max(
            0,
            typedKeys - mistakes
        );


    let accuracy = 100;


    if (typedKeys > 0) {

        accuracy =
            (
                correct /
                typedKeys
            ) * 100;

    }


    const elapsed =
        TOTAL_TIME -
        timeLeft;


    let speed = 0;


    if (elapsed > 0) {

        speed =
            (
                typedWords /
                elapsed
            ) * 60;

    }


    mistakesElement.textContent =
        mistakes;


    keystrokesElement.textContent =
        typedKeys;


    wordsElement.textContent =
        typedWords;


    accuracyElement.textContent =
        accuracy.toFixed(2) +
        "%";


    speedElement.textContent =
        speed.toFixed(2) +
        " WPM";
}


// ==========================================
// TYPING INPUT
// ==========================================

typingBox.addEventListener(
    "input",
    function() {

        if (
            !timerStarted &&
            typingBox.value.length > 0
        ) {

            startTimer();

        }


        updateLiveResults();

    }
);


// ==========================================
// KEYBOARD RESTRICTIONS
// ==========================================

typingBox.addEventListener(
    "keydown",
    function(event) {

        if (testFinished) {

            event.preventDefault();

            return;
        }


        // Backspace disabled
        if (
            event.key === "Backspace"
        ) {

            event.preventDefault();

            return;
        }


        // Delete disabled
        if (
            event.key === "Delete"
        ) {

            event.preventDefault();

            return;
        }


        // Arrow keys disabled
        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            return;
        }


        // Home / End disabled
        if (
            event.key === "Home" ||
            event.key === "End"
        ) {

            event.preventDefault();

            return;
        }


        // Ctrl / Cmd shortcuts disabled
        if (
            event.ctrlKey ||
            event.metaKey
        ) {

            event.preventDefault();

            return;
        }

    }
);


// ==========================================
// COPY / CUT / PASTE
// ==========================================

document.addEventListener(
    "copy",
    function(event) {

        event.preventDefault();

    }
);


document.addEventListener(
    "cut",
    function(event) {

        event.preventDefault();

    }
);


document.addEventListener(
    "paste",
    function(event) {

        event.preventDefault();

    }
);


// ==========================================
// RIGHT CLICK
// ==========================================

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);


// ==========================================
// FINISH BUTTON
// ==========================================

finishBtn.addEventListener(
    "click",
    finishTest
);


// ==========================================
// FINISH TEST
// ==========================================

function finishTest() {

    if (testFinished) {
        return;
    }


    testFinished = true;


    clearInterval(
        timerInterval
    );


    typingBox.disabled = true;

    finishBtn.disabled = true;


    const typed =
        typingBox.value;


    const typedWords =
        getWords(typed).length;


    const typedKeys =
        typed.length;


    const mistakes =
        calculateMistakes(
            typed
        );


    const correct =
        Math.max(
            0,
            typedKeys - mistakes
        );


    const wrong =
        mistakes;


    let accuracy = 100;


    if (typedKeys > 0) {

        accuracy =
            (
                correct /
                typedKeys
            ) * 100;

    }


    const elapsed =
        Math.max(
            1,
            TOTAL_TIME -
            timeLeft
        );


    const speed =
        (
            typedWords /
            elapsed
        ) * 60;


    // ======================================
    // MARKS
    //
    // 1 mistake = -0.25
    // 4 mistakes = 19
    // 60 mistakes = 5
    // ======================================

    let marks =
        20 -
        (
            mistakes *
            0.25
        );


    if (marks < 0) {
        marks = 0;
    }


    finalSpeed.textContent =
        speed.toFixed(2);


    finalAccuracy.textContent =
        accuracy.toFixed(2) +
        "%";


    finalMistakes.textContent =
        mistakes;


    finalWords.textContent =
        typedWords;


    finalKeystrokes.textContent =
        typedKeys;


    finalCorrect.textContent =
        correct;


    finalWrong.textContent =
        wrong;


    finalMarks.textContent =
        marks.toFixed(2);


    resultBox.style.display =
        "block";


    resultBox.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// INITIAL
// ==========================================

updateTimer();

updateLiveResults();
```
