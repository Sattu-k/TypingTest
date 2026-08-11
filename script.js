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
// ORIGINAL PASSAGE
// ==========================================

const passage = passageElement.innerText.trim();


// ==========================================
// PASSAGE STATISTICS
// ==========================================

const passageWords = passage
    .split(/\s+/)
    .filter(Boolean)
    .length;

const passageKeystrokes = passage.length;


// ==========================================
// TEST VARIABLES
// ==========================================

let timeLeft = 600;
let timerStarted = false;
let testFinished = false;
let timerInterval = null;


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
// TOKEN COMPARISON
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

    for (let i = 0; i < rows; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j < cols; j++) {
        dp[0][j] = j;
    }


    for (let i = 1; i < rows; i++) {

        for (let j = 1; j < cols; j++) {

            const originalToken = a[i - 1];
            const typedToken = b[j - 1];

            let substitutionCost;


            // Exact same token
            if (
                originalToken.type === typedToken.type &&
                originalToken.value === typedToken.value
            ) {

                substitutionCost = 0;

            }

            // Two words: wrong word = 1 mistake
            else if (
                originalToken.type === "word" &&
                typedToken.type === "word"
            ) {

                substitutionCost = 1;

            }

            // Spaces: different space = 1 mistake
            else if (
                originalToken.type === "space" &&
                typedToken.type === "space"
            ) {

                substitutionCost = 1;

            }

            // Punctuation difference = 1
            else {

                substitutionCost = 1;

            }


            const replace =
                dp[i - 1][j - 1] +
                substitutionCost;

            const deleteToken =
                dp[i - 1][j] + 1;

            const insertToken =
                dp[i][j - 1] + 1;


            dp[i][j] = Math.min(
                replace,
                deleteToken,
                insertToken
            );
        }
    }


    return dp[a.length][b.length];
}


// ==========================================
// TYPED WORD COUNT
// ==========================================

function getTypedWords() {

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
// TIMER
// ==========================================

function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


function startTimer() {

    if (timerStarted || testFinished) {
        return;
    }

    timerStarted = true;

    timerInterval = setInterval(function () {

        if (timeLeft <= 0) {

            finishTest();

            return;
        }

        timeLeft--;

        updateTimer();

        updateLiveResults();

    }, 1000);
}


// ==========================================
// LIVE CALCULATION
// ==========================================

function updateLiveResults() {

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


    // Number of matching keystrokes approximation
    const correctKeystrokes =
        Math.max(
            0,
            typedKeystrokes - mistakes
        );


    let accuracy = 100;

    if (typedKeystrokes > 0) {

        accuracy =
            (correctKeystrokes /
            typedKeystrokes) * 100;

    }


    const elapsedSeconds =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords /
        elapsedSeconds) * 60;


    mistakesElement.textContent =
        mistakes;

    keystrokesElement.textContent =
        typedKeystrokes;

    wordsElement.textContent =
        typedWords;

    accuracyElement.textContent =
        accuracy.toFixed(2) + "%";

    speedElement.textContent =
        speed.toFixed(2) + " WPM";
}


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


        startTimer();


        // Backspace OFF
        if (event.key === "Backspace") {

            event.preventDefault();

            return;
        }


        // Delete OFF
        if (event.key === "Delete") {

            event.preventDefault();

            return;
        }


        // Arrow keys OFF
        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            return;
        }


        // Home / End OFF
        if (
            event.key === "Home" ||
            event.key === "End" ||
            event.key === "PageUp" ||
            event.key === "PageDown"
        ) {

            event.preventDefault();

            return;
        }


        // Ctrl / Command shortcuts OFF
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
// MOUSE EDITING / SELECTION OFF
// ==========================================

typingBox.addEventListener(
    "mousedown",
    function() {

        setTimeout(function() {

            typingBox.setSelectionRange(
                typingBox.value.length,
                typingBox.value.length
            );

        }, 0);

    }
);


typingBox.addEventListener(
    "click",
    function() {

        typingBox.setSelectionRange(
            typingBox.value.length,
            typingBox.value.length
        );

    }
);


typingBox.addEventListener(
    "select",
    function() {

        typingBox.setSelectionRange(
            typingBox.value.length,
            typingBox.value.length
        );

    }
);


// ==========================================
// RIGHT CLICK OFF
// ==========================================

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);


// ==========================================
// COPY / CUT / PASTE OFF
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
// FINISH BUTTON
// ==========================================

finishBtn.addEventListener(
    "click",
    function() {

        finishTest();

    }
);


// ==========================================
// FINISH TEST
// ==========================================

function finishTest() {

    if (testFinished) {
        return;
    }

    testFinished = true;

    clearInterval(timerInterval);

    typingBox.disabled = true;

    finishBtn.disabled = true;


    const typedText =
        typingBox.value;


    const typedWords =
        getTypedWords();


    const typedKeystrokes =
        typedText.length;


    const mistakes =
        compareTokens(
            passage,
            typedText
        );


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

    }


    const elapsedSeconds =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords /
        elapsedSeconds) * 60;


    // ======================================
    // MARK CALCULATION
    // ======================================

    let marks =
        20 - (mistakes * 0.25);


    if (marks < 0) {
        marks = 0;
    }


    // ======================================
    // DISPLAY RESULT
    // ======================================

    finalSpeed.textContent =
        speed.toFixed(2);


    finalAccuracy.textContent =
        accuracy.toFixed(2);


    finalMistakes.textContent =
        mistakes;


    finalWords.textContent =
        typedWords;


    finalKeystrokes.textContent =
        typedKeystrokes;


    finalCorrect.textContent =
        correctKeystrokes;


    finalWrong.textContent =
        wrongKeystrokes;


    finalMarks.textContent =
        marks.toFixed(2);


    // ======================================
    // PASSAGE STATISTICS
    // ======================================

    showPassageStatistics(
        typedWords,
        typedKeystrokes
    );


    resultBox.style.display =
        "block";


    resultBox.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// SHOW PASSAGE STATISTICS
// ==========================================

function showPassageStatistics(
    typedWords,
    typedKeystrokes
) {

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

        box.style.background =
            "#f5f5f5";

        box.style.borderRadius =
            "8px";

        resultBox.insertBefore(
            box,
            resultBox.children[1]
        );

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
