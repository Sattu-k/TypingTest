let currentPassage = 0;
let timeLeft = 600;
let timerInterval = null;
let testStarted = false;
let finished = false;

const typingBox = document.getElementById("typingBox");
const finishBtn = document.getElementById("finishBtn");
const passageSelect = document.getElementById("passageSelect");

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


/* ================================
   GET CURRENT PASSAGE
================================ */

function getCurrentPassage() {
    return passages[currentPassage] || "";
}


/* ================================
   WORD COUNT
================================ */

function countWords(text) {

    if (!text.trim()) {
        return 0;
    }

    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}


/* ================================
   TIMER DISPLAY
================================ */

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


/* ================================
   START TIMER
================================ */

function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {

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


/* ================================
   RESET TEST
================================ */

function resetTest() {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = 600;

    testStarted = false;

    finished = false;

    typingBox.value = "";

    resultBox.style.display = "none";

    updateTimerDisplay();

    updateLiveResults();
}


/* ================================
   MISTAKE CALCULATION
================================ */

function calculateMistakes(original, typed) {

    const originalWords =
        original.trim().split(/\s+/).filter(Boolean);

    const typedWords =
        typed.trim().split(/\s+/).filter(Boolean);

    let mistakes = 0;

    const max =
        Math.max(
            originalWords.length,
            typedWords.length
        );

    for (let i = 0; i < max; i++) {

        if (
            originalWords[i] === undefined ||
            typedWords[i] === undefined
        ) {

            mistakes++;

            continue;
        }

        if (
            originalWords[i] !==
            typedWords[i]
        ) {

            mistakes++;

        }
    }

    return mistakes;
}


/* ================================
   ACCURACY
================================ */

function calculateAccuracy(
    typed,
    mistakes
) {

    if (typed.length === 0) {
        return 100;
    }

    const correct =
        Math.max(
            0,
            typed.length - mistakes
        );

    return Math.min(
        100,
        (correct / typed.length) * 100
    );
}


/* ================================
   LIVE RESULTS
================================ */

function updateLiveResults() {

    const typed =
        typingBox.value;

    const typedWords =
        countWords(typed);

    const mistakes =
        calculateMistakes(
            getCurrentPassage(),
            typed
        );

    const accuracy =
        calculateAccuracy(
            typed,
            mistakes
        );

    const elapsed =
        600 - timeLeft;

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


/* ================================
   START WHEN USER TYPES
================================ */

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


/* ================================
   MARKS
================================ */

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


/* ================================
   FINISH TEST
================================ */

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
            typed,
            mistakes
        );

    const elapsed =
        Math.max(
            1,
            600 - timeLeft
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


    if (mistakes >= 80) {

        testStatus.textContent =
            "FAIL";

    } else {

        testStatus.textContent =
            "PASS";

    }


    resultBox.style.display =
        "block";
}


/* ================================
   FINISH BUTTON
================================ */

finishBtn.addEventListener(
    "click",
    function () {

        finishTest();

    }
);


/* ================================
   PASSAGE CHANGE
================================ */

passageSelect.addEventListener(
    "change",
    function () {

        currentPassage =
            Number(this.value);

        resetTest();

    }
);


/* ================================
   INITIALIZE
================================ */

updateTimerDisplay();

updateLiveResults();
