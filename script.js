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

let timeLeft = 600;
let timerStarted = false;
let testFinished = false;
let timerInterval = null;

let mistakes = 0;
let keystrokes = 0;
let correctKeystrokes = 0;
let wrongKeystrokes = 0;


// -----------------------------------------
// TIMER
// -----------------------------------------

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

    }, 1000);
}


function updateTimer() {

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


// -----------------------------------------
// TYPING
// -----------------------------------------

typingBox.addEventListener("keydown", function (event) {

    if (testFinished) {
        event.preventDefault();
        return;
    }

    // Start timer on first key
    startTimer();


    // Block Backspace
    if (event.key === "Backspace") {
        event.preventDefault();
        return;
    }


    // Block Delete
    if (event.key === "Delete") {
        event.preventDefault();
        return;
    }


    // Block Ctrl+A
    if (event.ctrlKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        return;
    }


    // Block Ctrl+C
    if (event.ctrlKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        return;
    }


    // Block Ctrl+X
    if (event.ctrlKey && event.key.toLowerCase() === "x") {
        event.preventDefault();
        return;
    }


    // Block Ctrl+V
    if (event.ctrlKey && event.key.toLowerCase() === "v") {
        event.preventDefault();
        return;
    }


    // Block Ctrl+Z
    if (event.ctrlKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        return;
    }


    // Block arrow keys
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
    ) {
        event.preventDefault();
        return;
    }


    // Block Home / End
    if (
        event.key === "Home" ||
        event.key === "End" ||
        event.key === "PageUp" ||
        event.key === "PageDown"
    ) {
        event.preventDefault();
        return;
    }


    // Only count normal typing keys
    if (event.key.length === 1 || event.key === "Enter" || event.key === "Tab") {

        keystrokes++;

        const typedText = typingBox.value;
        const currentPosition = typedText.length - 1;

        if (currentPosition >= 0) {

            const typedCharacter = typedText[currentPosition];
            const correctCharacter = passage[currentPosition];

            if (typedCharacter === correctCharacter) {
                correctKeystrokes++;
            } else {
                mistakes++;
                wrongKeystrokes++;
            }
        }

        updateLiveResults();
    }

});


// -----------------------------------------
// PREVENT MOUSE EDITING
// -----------------------------------------

typingBox.addEventListener("mousedown", function () {

    if (typingBox.value.length > 0) {
        typingBox.setSelectionRange(
            typingBox.value.length,
            typingBox.value.length
        );
    }

});


typingBox.addEventListener("click", function () {

    typingBox.setSelectionRange(
        typingBox.value.length,
        typingBox.value.length
    );

});


typingBox.addEventListener("select", function () {

    typingBox.setSelectionRange(
        typingBox.value.length,
        typingBox.value.length
    );

});


// -----------------------------------------
// BLOCK RIGHT CLICK
// -----------------------------------------

document.addEventListener("contextmenu", function (event) {

    event.preventDefault();

});


// -----------------------------------------
// BLOCK COPY / CUT / PASTE
// -----------------------------------------

document.addEventListener("copy", function (event) {
    event.preventDefault();
});

document.addEventListener("cut", function (event) {
    event.preventDefault();
});

document.addEventListener("paste", function (event) {
    event.preventDefault();
});


// -----------------------------------------
// LIVE RESULTS
// -----------------------------------------

function updateLiveResults() {

    const typedText = typingBox.value;

    const words = typedText.trim() === ""
        ? 0
        : typedText.trim().split(/\s+/).length;


    const accuracy = keystrokes === 0
        ? 100
        : (correctKeystrokes / keystrokes) * 100;


    const elapsedSeconds = 600 - timeLeft;

    let speed = 0;

    if (elapsedSeconds > 0) {

        speed =
            (words / elapsedSeconds) * 60;

    }


    mistakesElement.textContent = mistakes;

    keystrokesElement.textContent = keystrokes;

    wordsElement.textContent = words;

    accuracyElement.textContent =
        accuracy.toFixed(2) + "%";

    speedElement.textContent =
        speed.toFixed(2) + " WPM";

}


// -----------------------------------------
// FINISH TEST
// -----------------------------------------

finishBtn.addEventListener("click", function () {

    finishTest();

});


function finishTest() {

    if (testFinished) {
        return;
    }

    testFinished = true;

    clearInterval(timerInterval);

    typingBox.disabled = true;

    finishBtn.disabled = true;


    const typedText = typingBox.value;

    const words = typedText.trim() === ""
        ? 0
        : typedText.trim().split(/\s+/).length;


    const accuracy = keystrokes === 0
        ? 100
        : (correctKeystrokes / keystrokes) * 100;


    const elapsedSeconds =
        Math.max(1, 600 - timeLeft);


    const speed =
        (words / elapsedSeconds) * 60;


    // -----------------------------------------
    // MARKS
    // -----------------------------------------

    let marks = 20 - (mistakes * 0.25);

    if (marks < 0) {
        marks = 0;
    }


    // -----------------------------------------
    // SHOW RESULT
    // -----------------------------------------

    finalSpeed.textContent =
        speed.toFixed(2);

    finalAccuracy.textContent =
        accuracy.toFixed(2);

    finalMistakes.textContent =
        mistakes;

    finalWords.textContent =
        words;

    finalKeystrokes.textContent =
        keystrokes;

    finalCorrect.textContent =
        correctKeystrokes;

    finalWrong.textContent =
        wrongKeystrokes;

    finalMarks.textContent =
        marks.toFixed(2);


    resultBox.style.display = "block";

    resultBox.scrollIntoView({
        behavior: "smooth"
    });

}


// -----------------------------------------
// INITIAL TIMER
// -----------------------------------------

updateTimer();
updateLiveResults();
