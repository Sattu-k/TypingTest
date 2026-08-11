// ==========================================
// TYPING TEST - script.js
// ==========================================

const passageElement = document.getElementById("passage");
const typingBox = document.getElementById("typingBox");

const timerElement = document.getElementById("timer");
const mistakesElement = document.getElementById("mistakes");
const keystrokesElement = document.getElementById("keystrokes");
const wordsElement = document.getElementById("words");
const accuracyElement = document.getElementById("accuracy");
const speedElement = document.getElementById("speed");

const finishBtn = document.getElementById("finishBtn");
const resultBox = document.getElementById("result");

const finalSpeed = document.getElementById("finalSpeed");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalMistakes = document.getElementById("finalMistakes");
const finalWords = document.getElementById("finalWords");
const finalKeystrokes = document.getElementById("finalKeystrokes");
const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");
const finalMarks = document.getElementById("finalMarks");


// ==========================================
// PASSAGE
// ==========================================

const passage = passageElement
    ? passageElement.innerText.trim()
    : "";


// ==========================================
// TEST SETTINGS
// ==========================================

const TEST_DURATION = 600; // 10 minutes

let timeLeft = TEST_DURATION;
let timerStarted = false;
let testFinished = false;
let timerInterval = null;


// ==========================================
// PASSAGE STATISTICS
// ==========================================

const passageWords = passage
    .split(/\s+/)
    .filter(Boolean)
    .length;

const passageKeystrokes = passage.length;


// ==========================================
// TOKENIZER
// ==========================================

function tokenize(text) {

    const tokens = [];

    const regex = /\s+|[A-Za-z0-9]+|[^A-Za-z0-9\s]/g;

    let match;

    while ((match = regex.exec(text)) !== null) {

        const value = match[0];

        let type;

        if (/^\s+$/.test(value)) {
            type = "space";
        }
        else if (/^[A-Za-z0-9]+$/.test(value)) {
            type = "word";
        }
        else {
            type = "punctuation";
        }

        tokens.push({
            value: value,
            type: type
        });
    }

    return tokens;
}


// ==========================================
// WORD-LEVEL / TOKEN-LEVEL COMPARISON
// ==========================================

function compareTokens(original, typed) {

    const a = tokenize(original);
    const b = tokenize(typed);

    const rows = a.length + 1;
    const cols = b.length + 1;

    const dp = Array.from(
        { length: rows },
        () => Array(cols).fill(0)
    );

    // Missing tokens
    for (let i = 0; i < rows; i++) {
        dp[i][0] = i;
    }

    // Extra tokens
    for (let j = 0; j < cols; j++) {
        dp[0][j] = j;
    }


    for (let i = 1; i < rows; i++) {

        for (let j = 1; j < cols; j++) {

            const originalToken = a[i - 1];
            const typedToken = b[j - 1];

            let cost = 1;

            // Exactly same token
            if (
                originalToken.type === typedToken.type &&
                originalToken.value === typedToken.value
            ) {
                cost = 0;
            }

            // Word -> word
            // Example:
            // good -> bad
            // = 1 mistake
            else if (
                originalToken.type === "word" &&
                typedToken.type === "word"
            ) {
                cost = 1;
            }

            // Space -> space
            // Extra/missing/different space = 1
            else if (
                originalToken.type === "space" &&
                typedToken.type === "space"
            ) {
                cost = 1;
            }

            // Punctuation / character difference
            else {
                cost = 1;
            }


            const replace =
                dp[i - 1][j - 1] + cost;

            const remove =
                dp[i - 1][j] + 1;

            const insert =
                dp[i][j - 1] + 1;


            dp[i][j] = Math.min(
                replace,
                remove,
                insert
            );
        }
    }

    return dp[a.length][b.length];
}


// ==========================================
// WORD COUNT
// ==========================================

function getTypedWords() {

    if (!typingBox) {
        return 0;
    }

    const text = typingBox.value.trim();

    if (text === "") {
        return 0;
    }

    return text
        .split(/\s+/)
        .filter(Boolean)
        .length;
}


// ==========================================
// TIMER DISPLAY
// ==========================================

function updateTimer() {

    if (!timerElement) {
        return;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ==========================================
// START TIMER
// ==========================================

function startTimer() {

    if (timerStarted || testFinished) {
        return;
    }

    timerStarted = true;

    updateTimer();

    timerInterval = setInterval(function () {

        if (testFinished) {
            clearInterval(timerInterval);
            return;
        }

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

    if (!typingBox) {
        return;
    }

    const typedText = typingBox.value;

    const typedKeystrokes =
        typedText.length;

    const typedWords =
        getTypedWords();


    const mistakes =
        compareTokens(
            passage,
            typedText
        );


    // Mistakes are counted as comparison errors.
    const correctKeystrokes =
        Math.max(
            0,
            typedKeystrokes - mistakes
        );


    const wrongKeystrokes =
        mistakes;


    let accuracy = 100;

    if (typedKeystrokes > 0) {

        accuracy =
            (correctKeystrokes /
                typedKeystrokes) * 100;

        accuracy =
            Math.max(
                0,
                Math.min(100, accuracy)
            );
    }


    const elapsedSeconds =
        TEST_DURATION - timeLeft;


    let speed = 0;

    if (elapsedSeconds > 0) {

        speed =
            (typedWords /
                elapsedSeconds) * 60;
    }


    if (mistakesElement) {
        mistakesElement.textContent =
            mistakes;
    }

    if (keystrokesElement) {
        keystrokesElement.textContent =
            typedKeystrokes;
    }

    if (wordsElement) {
        wordsElement.textContent =
            typedWords;
    }

    if (accuracyElement) {
        accuracyElement.textContent =
            accuracy.toFixed(2) + "%";
    }

    if (speedElement) {
        speedElement.textContent =
            speed.toFixed(2) + " WPM";
    }
}


// ==========================================
// KEYBOARD CONTROL
// ==========================================

if (typingBox) {

    typingBox.addEventListener(
        "keydown",
        function(event) {

            if (testFinished) {

                event.preventDefault();

                return;
            }


            // Start timer when first key is pressed
            startTimer();


            // Backspace disabled
            if (event.key === "Backspace") {

                event.preventDefault();

                return;
            }


            // Delete disabled
            if (event.key === "Delete") {

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
                event.key === "End" ||
                event.key === "PageUp" ||
                event.key === "PageDown"
            ) {

                event.preventDefault();

                return;
            }


            // Ctrl / Command shortcuts disabled
            if (
                event.ctrlKey ||
                event.metaKey
            ) {

                event.preventDefault();

                return;
            }

        }
    );


    // Prevent text selection
    typingBox.addEventListener(
        "select",
        function() {

            setTimeout(function() {

                if (!testFinished) {

                    typingBox.setSelectionRange(
                        typingBox.value.length,
                        typingBox.value.length
                    );

                }

            }, 0);

        }
    );


    // Always keep cursor at end
    typingBox.addEventListener(
        "click",
        function() {

            if (!testFinished) {

                typingBox.setSelectionRange(
                    typingBox.value.length,
                    typingBox.value.length
                );

            }

        }
    );


    typingBox.addEventListener(
        "mousedown",
        function() {

            setTimeout(function() {

                if (!testFinished) {

                    typingBox.setSelectionRange(
                        typingBox.value.length,
                        typingBox.value.length
                    );

                }

            }, 0);

        }
    );


    // Update results after typing
    typingBox.addEventListener(
        "input",
        function() {

            if (!timerStarted && typingBox.value.length > 0) {
                startTimer();
            }

            updateLiveResults();

        }
    );
}


// ==========================================
// COPY / CUT / PASTE DISABLED
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
// RIGHT CLICK DISABLED
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

if (finishBtn) {

    finishBtn.addEventListener(
        "click",
        function() {

            finishTest();

        }
    );
}


// ==========================================
// FINISH TEST
// ==========================================

function finishTest() {

    if (testFinished) {
        return;
    }

    testFinished = true;

    clearInterval(timerInterval);


    if (typingBox) {
        typingBox.disabled = true;
    }

    if (finishBtn) {
        finishBtn.disabled = true;
    }


    const typedText =
        typingBox ? typingBox.value : "";


    const typedWords =
        getTypedWords();


    const typedKeystrokes =
        typedText.length;


    // ======================================
    // FINAL MISTAKES
    // ======================================

    const mistakes =
        compareTokens(
            passage,
            typedText
        );


    // ======================================
    // FINAL ACCURACY
    // ======================================

    const correctKeystrokes =
        Math.max(
            0,
            typedKeystrokes - mistakes
        );


    const wrongKeystrokes =
        mistakes;


    let accuracy = 100;

    if (typedKeystrokes > 0) {

        accuracy =
            (correctKeystrokes /
                typedKeystrokes) * 100;

        accuracy =
            Math.max(
                0,
                Math.min(100, accuracy)
            );
    }


    // ======================================
    // FINAL SPEED
    // ======================================

    const elapsedSeconds =
        Math.max(
            1,
            TEST_DURATION - timeLeft
        );


    const speed =
        (typedWords /
            elapsedSeconds) * 60;


    // ======================================
    // MARKS
    //
    // 1 mistake = -0.25
    // 4 mistakes = 19.00
    // 60 mistakes = 5.00
    // ======================================

    let marks =
        20 - (mistakes * 0.25);


    if (marks < 0) {
        marks = 0;
    }


    // ======================================
    // SHOW FINAL RESULTS
    // ======================================

    if (finalSpeed) {

        finalSpeed.textContent =
            speed.toFixed(2);
    }


    if (finalAccuracy) {

        finalAccuracy.textContent =
            accuracy.toFixed(2);
    }


    if (finalMistakes) {

        finalMistakes.textContent =
            mistakes;
    }


    if (finalWords) {

        finalWords.textContent =
            typedWords;
    }


    if (finalKeystrokes) {

        finalKeystrokes.textContent =
            typedKeystrokes;
    }


    if (finalCorrect) {

        finalCorrect.textContent =
            correctKeystrokes;
    }


    if (finalWrong) {

        finalWrong.textContent =
            wrongKeystrokes;
    }


    if (finalMarks) {

        finalMarks.textContent =
            marks.toFixed(2);
    }


    // ======================================
    // PASSAGE STATISTICS
    // ======================================

    showPassageStatistics(
        typedWords,
        typedKeystrokes
    );


    // ======================================
    // SHOW RESULT BOX
    // ======================================

    if (resultBox) {

        resultBox.style.display =
            "block";

        resultBox.scrollIntoView({
            behavior: "smooth"
        });
    }
}


// ==========================================
// PASSAGE STATISTICS
// ==========================================

function showPassageStatistics(
    typedWords,
    typedKeystrokes
) {

    if (!resultBox) {
        return;
    }


    let box =
        document.getElementById(
            "passageStats"
        );


    if (!box) {

        box =
            document.createElement("div");

        box.id =
            "passageStats";

        box.style.marginTop =
            "20px";

        box.style.padding =
            "15px";

        box.style.borderRadius =
            "8px";

        resultBox.appendChild(box);
    }


    box.innerHTML = `

        <h3>Passage Statistics</h3>

        <p>
            Passage Words:
            <strong>${passageWords}</strong>
        </p>

        <p>
            Passage Keystrokes:
            <strong>${passageKeystrokes}</strong>
        </p>

        <p>
            Typed Words:
            <strong>${typedWords}</strong>
        </p>

        <p>
            Typed Keystrokes:
            <strong>${typedKeystrokes}</strong>
        </p>

    `;
}


// ==========================================
// INITIALIZE
// ==========================================

updateTimer();

updateLiveResults();
