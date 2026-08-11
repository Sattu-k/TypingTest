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


// ==========================================
// ORIGINAL PASSAGE INFORMATION
// ==========================================

const originalWords = passage
    .split(/\s+/)
    .filter(Boolean);

const originalWordCount = originalWords.length;
const originalKeystrokes = passage.length;


// ==========================================
// TIMER
// ==========================================

let timeLeft = 600;
let timerStarted = false;
let finished = false;
let timer = null;

function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


function startTimer() {

    if (timerStarted || finished) {
        return;
    }

    timerStarted = true;

    timer = setInterval(() => {

        if (timeLeft <= 0) {

            finishTest();

            return;
        }

        timeLeft--;

        updateTimer();
        updateLive();

    }, 1000);
}


// ==========================================
// GET TYPED WORDS
// ==========================================

function getTypedWords() {

    const text = typingBox.value.trim();

    if (!text) {
        return [];
    }

    return text.split(/\s+/).filter(Boolean);
}


// ==========================================
// CLEAN WORD FOR SPELLING COMPARISON
// ==========================================

function cleanWord(word) {

    return word
        .toLowerCase()
        .replace(/^[^\p{L}\p{N}]+/u, "")
        .replace(/[^\p{L}\p{N}]+$/u, "");
}


// ==========================================
// WORD DIFFERENCE
// ==========================================

function wordDifference(a, b) {

    const aa = cleanWord(a);
    const bb = cleanWord(b);

    return aa !== bb;
}


// ==========================================
// FIND WORD ALIGNMENT
// ==========================================

function calculateWordMistakes(original, typed) {

    const n = original.length;
    const m = typed.length;

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

            const substitution =
                dp[i - 1][j - 1] +
                (wordDifference(
                    original[i - 1],
                    typed[j - 1]
                ) ? 1 : 0);

            const deletion =
                dp[i - 1][j] + 1;

            const insertion =
                dp[i][j - 1] + 1;

            dp[i][j] =
                Math.min(
                    substitution,
                    deletion,
                    insertion
                );
        }
    }

    return dp[n][m];
}


// ==========================================
// PUNCTUATION MISTAKES
// ==========================================

function getPunctuation(word) {

    return word
        .replace(/[A-Za-z0-9]/g, "");
}


function punctuationMistakes(original, typed) {

    const n = original.length;
    const m = typed.length;

    const count = Math.min(n, m);

    let mistakes = 0;

    for (let i = 0; i < count; i++) {

        const originalPunctuation =
            getPunctuation(original[i]);

        const typedPunctuation =
            getPunctuation(typed[i]);

        if (
            originalPunctuation !==
            typedPunctuation
        ) {

            // Only count punctuation
            // when the word itself is otherwise
            // the same.
            if (
                cleanWord(original[i]) ===
                cleanWord(typed[i])
            ) {
                mistakes++;
            }
        }
    }

    return mistakes;
}


// ==========================================
// CAPITALIZATION MISTAKES
// ==========================================

function capitalizationMistakes(original, typed) {

    const count =
        Math.min(
            original.length,
            typed.length
        );

    let mistakes = 0;

    for (let i = 0; i < count; i++) {

        const originalClean =
            cleanWord(original[i]);

        const typedClean =
            cleanWord(typed[i]);

        if (
            originalClean === typedClean &&
            original[i] !== typed[i]
        ) {

            mistakes++;
        }
    }

    return mistakes;
}


// ==========================================
// SPACE MISTAKES
// ==========================================

function countSpaceMistakes(originalText, typedText) {

    /*
       We count spaces only when the typed text
       has a different number of spaces.

       This prevents every following word from
       becoming a mistake.
    */

    const originalSpaces =
        (originalText.match(/\s/g) || []).length;

    const typedSpaces =
        (typedText.match(/\s/g) || []).length;

    return Math.abs(
        originalSpaces - typedSpaces
    );
}


// ==========================================
// TOTAL MISTAKES
// ==========================================

function calculateMistakes() {

    const typedText =
        typingBox.value;

    const typedWords =
        getTypedWords();


    // Main word comparison
    const wordErrors =
        calculateWordMistakes(
            originalWords,
            typedWords
        );


    /*
       IMPORTANT:
       Punctuation and capitalization are only
       added for words which already match.

       This avoids double counting.
    */

    let extraErrors = 0;

    const common =
        Math.min(
            originalWords.length,
            typedWords.length
        );


    for (let i = 0; i < common; i++) {

        const originalClean =
            cleanWord(originalWords[i]);

        const typedClean =
            cleanWord(typedWords[i]);


        // Only check punctuation/capitalization
        // when spelling is correct.
        if (
            originalClean === typedClean
        ) {

            const originalP =
                getPunctuation(
                    originalWords[i]
                );

            const typedP =
                getPunctuation(
                    typedWords[i]
                );

            if (originalP !== typedP) {
                extraErrors++;
            }


            if (
                originalWords[i] !==
                typedWords[i]
            ) {

                // Don't count punctuation twice
                if (
                    originalP === typedP
                ) {
                    extraErrors++;
                }
            }
        }
    }


    /*
       Space difference is treated separately.
       However, if word count is different,
       don't add all space differences as separate
       errors because missing/extra words already
       represent the structural error.
    */

    let spaceErrors = 0;

    if (
        originalWords.length ===
        typedWords.length
    ) {

        spaceErrors =
            countSpaceMistakes(
                passage,
                typedText
            );
    }


    return Math.max(
        0,
        wordErrors +
        extraErrors +
        spaceErrors
    );
}


// ==========================================
// MARKS
// ==========================================

function calculateMarks(mistakes) {

    // 80 or more = FAIL
    if (mistakes >= 80) {
        return 0;
    }

    return Math.max(
        0,
        20 - (mistakes * 0.25)
    );
}


// ==========================================
// LIVE RESULT
// ==========================================

function updateLive() {

    const typedText =
        typingBox.value;

    const typedWords =
        getTypedWords();

    const mistakes =
        calculateMistakes();

    const typedKeystrokes =
        typedText.length;


    const elapsed =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords.length / elapsed) * 60;


    /*
       Accuracy is based on mistakes against
       typed words, not keystrokes.
    */

    let accuracy = 100;

    if (typedWords.length > 0) {

        accuracy =
            Math.max(
                0,
                ((typedWords.length - mistakes) /
                typedWords.length) * 100
            );
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
// KEYBOARD CONTROL
// ==========================================

typingBox.addEventListener(
    "keydown",
    function(event) {

        if (finished) {

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


        // Copy / paste / cut / undo OFF
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
// MOUSE EDITING OFF
// ==========================================

typingBox.addEventListener(
    "mousedown",
    function() {

        setTimeout(() => {

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
// COPY / CUT / PASTE / RIGHT CLICK OFF
// ==========================================

document.addEventListener(
    "copy",
    event => event.preventDefault()
);

document.addEventListener(
    "cut",
    event => event.preventDefault()
);

document.addEventListener(
    "paste",
    event => event.preventDefault()
);

document.addEventListener(
    "contextmenu",
    event => event.preventDefault()
);


// ==========================================
// FINISH
// ==========================================

finishBtn.addEventListener(
    "click",
    finishTest
);


function finishTest() {

    if (finished) {
        return;
    }

    finished = true;

    clearInterval(timer);

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

    const marks =
        calculateMarks(mistakes);


    const elapsed =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords.length / elapsed) * 60;


    let accuracy = 100;

    if (typedWords.length > 0) {

        accuracy =
            Math.max(
                0,
                ((typedWords.length - mistakes) /
                typedWords.length) * 100
            );
    }


    // ======================================
    // DISPLAY FINAL RESULT
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
        Math.max(
            0,
            typedWords.length - mistakes
        );

    finalWrong.textContent =
        mistakes;

    finalMarks.textContent =
        marks.toFixed(2);


    showStatistics(
        typedWords.length,
        typedKeystrokes,
        mistakes,
        marks
    );


    resultBox.style.display =
        "block";

    resultBox.scrollIntoView({
        behavior: "smooth"
    });
}


// ==========================================
// RESULT STATISTICS
// ==========================================

function showStatistics(
    typedWords,
    typedKeystrokes,
    mistakes,
    marks
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
            "20px";

        box.style.background =
            "#f5f5f5";

        box.style.borderRadius =
            "8px";

        resultBox.appendChild(box);
    }


    const status =
        mistakes >= 80
            ? "FAIL"
            : "PASS";


    box.innerHTML = `

        <h3>Final Test Details</h3>

        <p>
            Passage Words:
            <strong>${originalWordCount}</strong>
        </p>

        <p>
            Passage Keystrokes:
            <strong>${originalKeystrokes}</strong>
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

        <p>
            Marks:
            <strong>${marks.toFixed(2)} / 20</strong>
        </p>

        <p>
            Status:
            <strong>${status}</strong>
        </p>

    `;
}


// ==========================================
// START
// ==========================================

updateTimer();
updateLive();
