let currentPassage = 0;

const TEST_TIME = 600; // 10 minutes

let timeLeft = TEST_TIME;
let timerInterval = null;
let testStarted = false;
let finished = false;


// ================================
// ELEMENTS
// ================================

const typingBox = document.getElementById("typingBox");
const finishBtn = document.getElementById("finishBtn");

const passageSelect = document.getElementById("passageSelect");
const passageBox = document.getElementById("passage");
const passageTitle = document.getElementById("passageTitle");

const timerDisplay = document.getElementById("timer");

const mistakesDisplay = document.getElementById("mistakes");
const keystrokesDisplay = document.getElementById("keystrokes");
const wordsDisplay = document.getElementById("words");
const accuracyDisplay = document.getElementById("accuracy");
const speedDisplay = document.getElementById("speed");

const resultBox = document.getElementById("result");

const finalSpeed = document.getElementById("finalSpeed");
const finalAccuracy = document.getElementById("finalAccuracy");
const finalMistakes = document.getElementById("finalMistakes");
const finalWords = document.getElementById("finalWords");
const finalKeystrokes = document.getElementById("finalKeystrokes");
const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");
const finalMarks = document.getElementById("finalMarks");

const finalPassageWords =
    document.getElementById("finalPassageWords");

const finalPassageKeystrokes =
    document.getElementById("finalPassageKeystrokes");

const testStatus =
    document.getElementById("testStatus");


// ================================
// GET CURRENT PASSAGE
// ================================

function getCurrentPassage() {

    if (
        typeof passages === "undefined" ||
        !passages[currentPassage]
    ) {
        return "";
    }

    return passages[currentPassage];
}


// ================================
// COUNT WORDS
// ================================

function countWords(text) {

    if (!text || !text.trim()) {
        return 0;
    }

    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}


// ================================
// TIMER DISPLAY
// ================================

function updateTimerDisplay() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// ================================
// START TIMER
// ================================

function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(() => {

        if (timeLeft > 0) {

            timeLeft--;

            updateTimerDisplay();

            updateLiveResults();
        }

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            finishTest();
        }

    }, 1000);
}


// ================================
// RESET TEST
// ================================

function resetTest() {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = TEST_TIME;

    testStarted = false;

    finished = false;

    typingBox.value = "";

    resultBox.style.display = "none";

    typingBox.disabled = false;

    finishBtn.disabled = false;

    updateTimerDisplay();

    updateLiveResults();
}


// ================================
// NORMALIZE TEXT
// ================================

function normalizeText(text) {

    return text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();
}


// ================================
// WORD TOKENIZER
// ================================

function getWords(text) {

    const cleanText = normalizeText(text);

    if (!cleanText) {
        return [];
    }

    return cleanText
        .split(/\s+/)
        .filter(Boolean);
}


// ================================
// MISTAKE CALCULATION
// ================================
//
// One wrong / missing / extra word = 1 mistake.
// Punctuation and spelling differences
// inside a word are also treated as 1 mistake.
//
// Example:
// correct: court
// typed:   cout
// = 1 mistake
//
// correct: court
// typed:   courtx
// = 1 mistake
//
// extra word = 1 mistake
// missing word = 1 mistake
//

function calculateMistakes(original, typed) {

    const originalWords = getWords(original);
    const typedWords = getWords(typed);

    let mistakes = 0;

    const maxLength = Math.max(
        originalWords.length,
        typedWords.length
    );

    for (let i = 0; i < maxLength; i++) {

        const originalWord =
            originalWords[i];

        const typedWord =
            typedWords[i];

        // Missing word
        if (typedWord === undefined) {

            mistakes++;

            continue;
        }

        // Extra word
        if (originalWord === undefined) {

            mistakes++;

            continue;
        }

        // Wrong word / spelling /
        // punctuation difference
        if (originalWord !== typedWord) {

            mistakes++;
        }
    }

    return mistakes;
}


// ================================
// ACCURACY
// ================================

function calculateAccuracy(
    original,
    typed
) {

    const originalWords =
        getWords(original);

    const typedWords =
        getWords(typed);

    if (typedWords.length === 0) {
        return 100;
    }

    let correctWords = 0;

    const maxLength =
        Math.max(
            originalWords.length,
            typedWords.length
        );

    for (let i = 0; i < maxLength; i++) {

        if (
            originalWords[i] !== undefined &&
            typedWords[i] !== undefined &&
            originalWords[i] === typedWords[i]
        ) {

            correctWords++;
        }
    }

    const accuracy =
        (correctWords / typedWords.length) * 100;

    return Math.max(
        0,
        Math.min(100, accuracy)
    );
}


// ================================
// LIVE RESULTS
// ================================

function updateLiveResults() {

    const original =
        getCurrentPassage();

    const typed =
        typingBox.value;

    const typedWords =
        countWords(typed);

    const mistakes =
        calculateMistakes(
            original,
            typed
        );

    const accuracy =
        calculateAccuracy(
            original,
            typed
        );

    const elapsed =
        TEST_TIME - timeLeft;

    let wpm = 0;

    if (elapsed > 0) {

        wpm =
            (typedWords / elapsed) * 60;
    }

    mistakesDisplay.textContent =
        mistakes;

    keystrokesDisplay.textContent =
        typed.length;

    wordsDisplay.textContent =
        typedWords;

    accuracyDisplay.textContent =
        accuracy.toFixed(2) + "%";

    speedDisplay.textContent =
        wpm.toFixed(2) + " WPM";
}


// ================================
// START WHEN USER TYPES
// ================================

typingBox.addEventListener(
    "input",
    function () {

        if (finished) {
            return;
        }

        if (!testStarted) {

            testStarted = true;

            startTimer();
        }

        updateLiveResults();
    }
);


// ================================
// MARK CALCULATION
// ================================
//
// 0 mistakes  = 20 marks
// 40 mistakes = 10 marks
// 41 mistakes = 9.75 marks
// 79 mistakes = 0.25 marks
// 80 mistakes = 0 marks
//
// Every mistake = -0.25 marks
//

function calculateMarks(mistakes) {

    if (mistakes >= 80) {
        return 0;
    }

    const marks =
        20 - (mistakes * 0.25);

    return Math.max(
        0,
        marks
    );
}


// ================================
// FINISH TEST
// ================================

function finishTest() {

    if (finished) {
        return;
    }

    finished = true;

    clearInterval(timerInterval);

    timerInterval = null;

    const original =
        getCurrentPassage();

    const typed =
        typingBox.value;

    const passageWords =
        countWords(original);

    const passageKeystrokes =
        original.length;

    const typedWords =
        countWords(typed);

    const typedKeystrokes =
        typed.length;

    const mistakes =
        calculateMistakes(
            original,
            typed
        );

    const accuracy =
        calculateAccuracy(
            original,
            typed
        );

    const elapsed =
        Math.max(
            1,
            TEST_TIME - timeLeft
        );

    const speed =
        (typedWords / elapsed) * 60;

    const marks =
        calculateMarks(mistakes);

    const correctWords =
        Math.max(
            0,
            typedWords - mistakes
        );

    const wrongWords =
        mistakes;


    // ================================
    // SHOW RESULT
    // ================================

    finalPassageWords.textContent =
        passageWords;

    finalPassageKeystrokes.textContent =
        passageKeystrokes;

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
        correctWords;

    finalWrong.textContent =
        wrongWords;

    finalMarks.textContent =
        marks.toFixed(2);


    // ================================
    // PASS / FAIL
    // ================================

    if (mistakes >= 80) {

        testStatus.textContent =
            "FAIL";

    } else {

        testStatus.textContent =
            "PASS";
    }


    resultBox.style.display =
        "block";

    typingBox.disabled = true;
}


// ================================
// FINISH BUTTON
// ================================

finishBtn.addEventListener(
    "click",
    function () {

        finishTest();

    }
);


// ================================
// PASSAGE CHANGE
// ================================

passageSelect.addEventListener(
    "change",
    function () {

        currentPassage =
            Number(this.value);

        loadPassage(
            currentPassage
        );

        resetTest();
    }
);


// ================================
// LOAD PASSAGE
// ================================

function loadPassage(index) {

    if (
        typeof passages === "undefined" ||
        !passages[index]
    ) {
        passageBox.textContent =
            "Passage not found.";

        return;
    }

    passageBox.textContent =
        passages[index];

    passageTitle.textContent =
        "PASSAGE-" + (index + 1);

    document.title =
        "Typing Test - Passage " +
        (index + 1);
}


// ================================
// INITIALIZE
// ================================

loadPassage(0);

updateTimerDisplay();

updateLiveResults();
