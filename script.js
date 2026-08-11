let timeLeft = 600;
let timerInterval = null;
let testStarted = false;
let finished = false;

const typingBox = document.getElementById("typingBox");
const finishBtn = document.getElementById("finishBtn");
const timerDisplay = document.getElementById("timer");

const mistakesDisplay = document.getElementById("mistakes");
const keystrokesDisplay = document.getElementById("keystrokes");
const wordsDisplay = document.getElementById("words");
const accuracyDisplay = document.getElementById("accuracy");
const speedDisplay = document.getElementById("speed");

const resultBox = document.getElementById("result");

function getPassage() {
    const passage = document.getElementById("passage");

    if (!passage) {
        return "";
    }

    return passage.innerText.trim();
}

function countWords(text) {
    if (!text.trim()) {
        return 0;
    }

    return text.trim().split(/\s+/).filter(Boolean).length;
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(function () {

        timeLeft--;

        updateTimer();

        updateLiveResults();

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            timerInterval = null;

            finishTest();
        }

    }, 1000);
}

function calculateMistakes(original, typed) {

    const originalWords =
        original.split(/\s+/).filter(Boolean);

    const typedWords =
        typed.split(/\s+/).filter(Boolean);

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
        }
        else if (
            originalWords[i] !== typedWords[i]
        ) {
            mistakes++;
        }
    }

    return mistakes;
}

function updateLiveResults() {

    const typed = typingBox.value;

    const passage = getPassage();

    const words = countWords(typed);

    const mistakes =
        calculateMistakes(
            passage,
            typed
        );

    const elapsed =
        600 - timeLeft;

    let wpm = 0;

    if (elapsed > 0) {
        wpm =
            (words / elapsed) * 60;
    }

    let accuracy = 100;

    if (words > 0) {
        accuracy =
            Math.max(
                0,
                100 - (mistakes / words * 100)
            );
    }

    mistakesDisplay.textContent =
        mistakes;

    keystrokesDisplay.textContent =
        typed.length;

    wordsDisplay.textContent =
        words;

    accuracyDisplay.textContent =
        accuracy.toFixed(2) + "%";

    speedDisplay.textContent =
        wpm.toFixed(2) + " WPM";
}

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

finishBtn.addEventListener(
    "click",
    function () {

        finishTest();

    }
);

function calculateMarks(mistakes) {

    if (mistakes >= 80) {
        return 0;
    }

    return Math.max(
        0,
        20 - (mistakes * 0.25)
    );
}

function finishTest() {

    if (finished) {
        return;
    }

    finished = true;

    clearInterval(timerInterval);

    timerInterval = null;

    const typed = typingBox.value;

    const passage = getPassage();

    const mistakes =
        calculateMistakes(
            passage,
            typed
        );

    const typedWords =
        countWords(typed);

    const passageWords =
        countWords(passage);

    const marks =
        calculateMarks(mistakes);

    const elapsed =
        Math.max(
            1,
            600 - timeLeft
        );

    const speed =
        (typedWords / elapsed) * 60;

    const accuracy =
        typed.length === 0
            ? 100
            : Math.max(
                0,
                100 - (mistakes / typedWords * 100)
            );

    document.getElementById("finalSpeed").textContent =
        speed.toFixed(2);

    document.getElementById("finalAccuracy").textContent =
        accuracy.toFixed(2);

    document.getElementById("finalMistakes").textContent =
        mistakes;

    document.getElementById("finalWords").textContent =
        typedWords;

    document.getElementById("finalKeystrokes").textContent =
        typed.length;

    document.getElementById("finalCorrect").textContent =
        Math.max(0, typedWords - mistakes);

    document.getElementById("finalWrong").textContent =
        mistakes;

    document.getElementById("finalMarks").textContent =
        marks.toFixed(2);

    if (document.getElementById("finalPassageWords")) {
        document.getElementById("finalPassageWords").textContent =
            passageWords;
    }

    if (document.getElementById("finalPassageKeystrokes")) {
        document.getElementById("finalPassageKeystrokes").textContent =
            passage.length;
    }

    if (document.getElementById("testStatus")) {

        document.getElementById("testStatus").textContent =
            mistakes >= 80
                ? "FAIL"
                : "PASS";
    }

    resultBox.style.display = "block";
}

updateTimer();
updateLiveResults();
