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


// ========================================
// ORIGINAL PASSAGE
// ========================================

const passage = passageElement.innerText.trim();


// ========================================
// PASSAGE STATISTICS
// ========================================

// Total words in original passage
const passageWords = passage.split(/\s+/).filter(Boolean).length;

// Total keystrokes = every character including spaces
const passageKeystrokes = passage.length;


// ========================================
// TEST VARIABLES
// ========================================

let timeLeft = 600;
let timerStarted = false;
let testFinished = false;
let timerInterval = null;

let mistakes = 0;
let typedKeystrokes = 0;
let correctKeystrokes = 0;
let wrongKeystrokes = 0;


// ========================================
// TIMER
// ========================================

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


// ========================================
// CHECK COMPLETE TYPED TEXT
// ========================================

function calculateMistakes() {

    const typedText = typingBox.value;

    let wrong = 0;
    let correct = 0;

    const maxLength = Math.max(
        typedText.length,
        passage.length
    );

    for (let i = 0; i < maxLength; i++) {

        const typedCharacter = typedText[i];
        const correctCharacter = passage[i];

        if (typedCharacter === correctCharacter) {
            correct++;
        } else {
            wrong++;
        }
    }

    return {
        wrong: wrong,
        correct: correct
    };
}


// ========================================
// GET TYPED WORDS
// ========================================

function getTypedWords() {

    const typedText = typingBox.value.trim();

    if (typedText === "") {
        return 0;
    }

    return typedText.split(/\s+/).filter(Boolean).length;
}


// ========================================
// LIVE RESULTS
// ========================================

function updateLiveResults() {

    const typedText = typingBox.value;

    typedKeystrokes = typedText.length;

    const result = calculateMistakes();

    mistakes = result.wrong;
    correctKeystrokes = result.correct;

    wrongKeystrokes = mistakes;

    const typedWords = getTypedWords();

    let accuracy = 100;

    if (typedKeystrokes > 0) {

        accuracy =
            (correctKeystrokes / typedKeystrokes) * 100;

    }

    const elapsedSeconds =
        Math.max(1, 600 - timeLeft);

    const speed =
        (typedWords / elapsedSeconds) * 60;


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


// ========================================
// KEYBOARD RESTRICTIONS
// ========================================

typingBox.addEventListener("keydown", function(event) {

    if (testFinished) {

        event.preventDefault();
        return;

    }


    // Start timer
    startTimer();


    // Backspace
    if (event.key === "Backspace") {

        event.preventDefault();
        return;

    }


    // Delete
    if (event.key === "Delete") {

        event.preventDefault();
        return;

    }


    // Arrow keys
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
    ) {

        event.preventDefault();
        return;

    }


    // Home / End
    if (
        event.key === "Home" ||
        event.key === "End" ||
        event.key === "PageUp" ||
        event.key === "PageDown"
    ) {

        event.preventDefault();
        return;

    }


    // Ctrl / Command shortcuts
    if (
        event.ctrlKey ||
        event.metaKey
    ) {

        event.preventDefault();
        return;

    }

});


// ========================================
// MOUSE RESTRICTIONS
// ========================================

typingBox.addEventListener("mousedown", function() {

    setTimeout(function() {

        typingBox.setSelectionRange(
            typingBox.value.length,
            typingBox.value.length
        );

    }, 0);

});


typingBox.addEventListener("click", function() {

    typingBox.setSelectionRange(
        typingBox.value.length,
        typingBox.value.length
    );

});


typingBox.addEventListener("select", function() {

    typingBox.setSelectionRange(
        typingBox.value.length,
        typingBox.value.length
    );

});


// ========================================
// BLOCK RIGHT CLICK
// ========================================

document.addEventListener("contextmenu", function(event) {

    event.preventDefault();

});


// ========================================
// BLOCK COPY / CUT / PASTE
// ========================================

document.addEventListener("copy", function(event) {

    event.preventDefault();

});

document.addEventListener("cut", function(event) {

    event.preventDefault();

});

document.addEventListener("paste", function(event) {

    event.preventDefault();

});


// ========================================
// FINISH TEST
// ========================================

finishBtn.addEventListener("click", function() {

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


    // Final calculation
    updateLiveResults();


    const typedWords = getTypedWords();

    const typedText = typingBox.value;

    const typedKeystrokes = typedText.length;


    const result = calculateMistakes();

    const finalMistakeCount = result.wrong;

    const finalCorrectCount = result.correct;


    const finalWrongCount =
        finalMistakeCount;


    // Accuracy
    let accuracy = 100;

    if (typedKeystrokes > 0) {

        accuracy =
            (finalCorrectCount / typedKeystrokes) * 100;

    }


    // Speed
    const elapsedSeconds =
        Math.max(1, 600 - timeLeft);

    const speed =
        (typedWords / elapsedSeconds) * 60;


    // ====================================
    // MARKS
    // ====================================

    let marks =
        20 - (finalMistakeCount * 0.25);

    if (marks < 0) {
        marks = 0;
    }


    // ====================================
    // FINAL RESULT
    // ====================================

    finalSpeed.textContent =
        speed.toFixed(2);

    finalAccuracy.textContent =
        accuracy.toFixed(2);

    finalMistakes.textContent =
        finalMistakeCount;

    finalWords.textContent =
        typedWords;

    finalKeystrokes.textContent =
        typedKeystrokes;

    finalCorrect.textContent =
        finalCorrectCount;

    finalWrong.textContent =
        finalWrongCount;

    finalMarks.textContent =
        marks.toFixed(2);


    // ====================================
    // ADD PASSAGE STATISTICS TO RESULT
    // ====================================

    addPassageStatistics();


    resultBox.style.display = "block";

    resultBox.scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// SHOW PASSAGE STATISTICS
// ========================================

function addPassageStatistics() {

    let passageStats =
        document.getElementById("passageStats");


    if (!passageStats) {

        passageStats =
            document.createElement("div");

        passageStats.id =
            "passageStats";

        passageStats.style.marginTop =
            "20px";

        passageStats.style.padding =
            "15px";

        passageStats.style.background =
            "#f5f5f5";

        passageStats.style.borderRadius =
            "8px";

        resultBox.insertBefore(
            passageStats,
            resultBox.firstChild.nextSibling
        );

    }


    passageStats.innerHTML = `

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
            <strong>${getTypedWords()}</strong>
        </p>

        <p>
            Typed Keystrokes:
            <strong>${typingBox.value.length}</strong>
        </p>

    `;

}


// ========================================
// INITIALIZE
// ========================================

updateTimer();

updateLiveResults();
