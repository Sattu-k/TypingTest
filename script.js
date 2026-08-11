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

const passage = passageElement.innerText.trim();

const passageWords = passage
    .split(/\s+/)
    .filter(Boolean);

const passageWordCount = passageWords.length;
const passageKeystrokes = passage.length;

let timeLeft = 600;
let timerStarted = false;
let testFinished = false;
let timerInterval = null;


// ==========================================
// NORMALIZE WORD
// ==========================================

function normalizeWord(word) {
    return word
        .toLowerCase()
        .replace(/[.,!?;:"'()[\]{}]/g, "");
}


// ==========================================
// TOKENIZE TYPED TEXT
// ==========================================

function getTypedWords() {

    const text = typingBox.value.trim();

    if (text === "") {
        return [];
    }

    return text.split(/\s+/).filter(Boolean);
}


// ==========================================
// WORD COMPARISON
// ==========================================

function compareWords(originalWords, typedWords) {

    const n = originalWords.length;
    const m = typedWords.length;

    const dp = Array.from(
        { length: n + 1 },
        () => Array(m + 1).fill(0)
    );

    for (let i = 0; i <= n; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= m; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= n; i++) {

        for (let j = 1; j <= m; j++) {

            const original = normalizeWord(originalWords[i - 1]);
            const typed = normalizeWord(typedWords[j - 1]);

            const cost =
                original === typed ? 0 : 1;

            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[n][m];
}


// ==========================================
// PUNCTUATION + SPACE CHECK
// ==========================================

function punctuationAndSpaceMistakes(
    originalText,
    typedText
) {

    let mistakes = 0;

    const originalWords =
        originalText.split(/\s+/).filter(Boolean);

    const typedWords =
        typedText.split(/\s+/).filter(Boolean);

    const wordCount =
        Math.min(
            originalWords.length,
            typedWords.length
        );

    for (let i = 0; i < wordCount; i++) {

        const originalWord =
            originalWords[i];

        const typedWord =
            typedWords[i];

        const originalPunctuation =
            originalWord.match(/[^A-Za-z0-9]+$/);

        const typedPunctuation =
            typedWord.match(/[^A-Za-z0-9]+$/);

        const originalP =
            originalPunctuation
                ? originalPunctuation[0]
                : "";

        const typedP =
            typedPunctuation
                ? typedPunctuation[0]
                : "";

        if (originalP !== typedP) {
            mistakes++;
        }
    }

    // Check capitalization separately
    for (let i = 0; i < wordCount; i++) {

        const originalWord =
            originalWords[i];

        const typedWord =
            typedWords[i];

        const originalLetters =
            originalWord.replace(
                /[^A-Za-z0-9]/g,
                ""
            );

        const typedLetters =
            typedWord.replace(
                /[^A-Za-z0-9]/g,
                ""
            );

        if (
            originalLetters.toLowerCase() ===
            typedLetters.toLowerCase() &&
            originalLetters !== typedLetters
        ) {
            mistakes++;
        }
    }

    return mistakes;
}


// ==========================================
// TOTAL MISTAKES
// ==========================================

function calculateMistakes() {

    const typedText = typingBox.value;

    const typedWords = getTypedWords();

    // Word-level comparison
    const wordMistakes =
        compareWords(
            passageWords,
            typedWords
        );

    // Punctuation/capitalization
    const punctuationMistakes =
        punctuationAndSpaceMistakes(
            passage,
            typedText
        );

    // Extra / missing spaces
    let spaceMistakes = 0;

    const originalSpaceCount =
        (passage.match(/ /g) || []).length;

    const typedSpaceCount =
        (typedText.match(/ /g) || []).length;

    spaceMistakes =
        Math.abs(
            originalSpaceCount -
            typedSpaceCount
        );

    /*
       Avoid double counting too much:
       space errors are counted separately,
       but the word alignment remains the main
       source of word mistakes.
    */

    const totalMistakes =
        wordMistakes +
        punctuationMistakes +
        spaceMistakes;

    return Math.max(0, totalMistakes);
}


// ==========================================
// MARKS
// ==========================================

function calculateMarks(mistakes) {

    if (mistakes >= 80) {
        return 0;
    }

    const marks =
        20 - (mistakes * 0.25);

    return Math.max(0, marks);
}


// ==========================================
// TIMER
// ==========================================

function updateTimer() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


function startTimer() {

    if (
        timerStarted ||
        testFinished
    ) {
        return;
    }

    timerStarted = true;

    timerInterval =
        setInterval(function() {

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
// LIVE RESULT
// ==========================================

function updateLiveResults() {

    const typedText =
        typingBox.value;

    const typedWords =
        getTypedWords();

    const typedKeystrokes =
        typedText.length;

    const mistakes =
        calculateMistakes();

    const elapsedSeconds =
        Math.max(
            1,
            600 - timeLeft
        );

    const speed =
        (typedWords.length /
        elapsedSeconds) * 60;

    /*
       Accuracy is based on words,
       not raw keystrokes.
    */

    let correctWords =
        Math.max(
            0,
            typedWords.length - mistakes
        );

    let accuracy = 100;

    if (typedWords.length > 0) {

        accuracy =
            (correctWords /
            typedWords.length) * 100;
    }

    mistakesElement.textContent =
        mistakes;

    keystrokesElement.textContent =
        typedKeystrokes;

    wordsElement.textContent =
        typedWords.length;

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
            event.key === "End"
        ) {

            event.preventDefault();

            return;
        }

        // Copy / Paste / Cut / Undo OFF
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
// MOUSE SELECTION OFF
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
        calculateMistakes();


    // Marks
    const marks =
        calculateMarks(mistakes);


    // Correct words approximation
    const correctWords =
        Math.max(
            0,
            typedWords.length - mistakes
        );


    let accuracy = 100;

    if (typedWords.length > 0) {

        accuracy =
            (correctWords /
            typedWords.length) * 100;
    }


    const elapsedSeconds =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords.length /
        elapsedSeconds) * 60;


    // ======================================
    // SHOW RESULT
    // ======================================

    finalSpeed.textContent =
        speed.toFixed(2);

    finalAccuracy.textContent =
        accuracy.toFixed(2);

    finalMistakes.textContent =
        mistakes;

    finalWords.textContent =
        typedWords.length;

    finalKeystrokes.textContent =
        typedKeystrokes;

    finalCorrect.textContent =
        correctWords;

    finalWrong.textContent =
        mistakes;

    finalMarks.textContent =
        marks.toFixed(2);


    showPassageStatistics(
        typedWords.length,
        typedKeystrokes,
        mistakes
    );


    // PASS / FAIL
    showPassFail(mistakes);


    resultBox.style.display =
        "block";

    resultBox.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// PASSAGE STATISTICS
// ==========================================

function showPassageStatistics(
    typedWords,
    typedKeystrokes,
    mistakes
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

        resultBox.appendChild(box);
    }


    box.innerHTML = `

        <h3>Passage Statistics</h3>

        <p>
            Passage Words:
            <strong>${passageWordCount}</strong>
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

        <p>
            Total Mistakes:
            <strong>${mistakes}</strong>
        </p>

    `;
}


// ==========================================
// PASS / FAIL
// ==========================================

function showPassFail(mistakes) {

    let status =
        document.getElementById(
            "testStatus"
        );

    if (!status) {

        status =
            document.createElement("h2");

        status.id =
            "testStatus";

        resultBox.appendChild(status);
    }


    if (mistakes >= 80) {

        status.textContent =
            "FAIL";

    } else {

        status.textContent =
            "PASS";
    }
}


// ==========================================
// INITIALIZE
// ==========================================

updateTimer();

updateLiveResults();
