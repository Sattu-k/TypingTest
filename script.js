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



/* ==========================================
   PASSAGE INFORMATION
   ========================================== */

function getPassage() {
    return passages[currentPassage];
}


function getPassageWords(text) {

    return text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);

}


function getPassageWordCount() {

    return getPassageWords(getPassage()).length;

}


function getPassageKeystrokeCount() {

    return getPassage().length;

}



/* ==========================================
   TIMER
   ========================================== */

function updateTimer() {

    const minutes =
        Math.floor(timeLeft / 60);

    const seconds =
        timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


function startTimer() {

    if (timerInterval !== null) {
        return;
    }

    timerInterval = setInterval(() => {

        timeLeft--;

        updateTimer();

        updateLiveResults();

        if (timeLeft <= 0) {

            timeLeft = 0;

            updateTimer();

            finishTest();

        }

    }, 1000);
}



/* ==========================================
   RESET TEST
   ========================================== */

function resetTest() {

    clearInterval(timerInterval);

    timerInterval = null;

    timeLeft = 600;

    testStarted = false;

    finished = false;

    typingBox.value = "";

    resultBox.style.display = "none";

    updateTimer();

    updateLiveResults();

}



/* ==========================================
   WORD COMPARISON
   ========================================== */

/*
   प्रत्येक word compare केला जातो.

   चुकीचा word =
   1 mistake

   Missing word =
   1 mistake

   Extra word =
   1 mistake

   त्यामुळे एकाच चुकीच्या word मधील
   प्रत्येक letter ला वेगळी mistake
   मोजली जाणार नाही.
*/

function calculateMistakes(original, typed) {

    const originalWords =
        getPassageWords(original);

    const typedWords =
        getPassageWords(typed);

    let mistakes = 0;

    const maxLength =
        Math.max(
            originalWords.length,
            typedWords.length
        );


    for (let i = 0; i < maxLength; i++) {

        const originalWord =
            originalWords[i];

        const typedWord =
            typedWords[i];


        // Extra word
        if (originalWord === undefined) {

            mistakes++;

            continue;
        }


        // Missing word
        if (typedWord === undefined) {

            mistakes++;

            continue;
        }


        // Wrong word
        if (originalWord !== typedWord) {

            mistakes++;

        }

    }


    /*
       Space mistakes आणि punctuation mistakes

       शब्द comparison मध्ये punctuation
       आधीच word मध्ये येते.

       त्यामुळे punctuation चुकल्यास
       त्या word ला mistake मिळते.
    */


    // Extra / missing spaces
    mistakes += calculateSpaceMistakes(
        original,
        typed
    );


    return mistakes;
}



/* ==========================================
   SPACE COMPARISON
   ========================================== */

function calculateSpaceMistakes(original, typed) {

    const originalSpaces =
        (original.match(/ /g) || []).length;

    const typedSpaces =
        (typed.match(/ /g) || []).length;


    /*
       फक्त space count difference मोजतो.
       त्यामुळे एका चुकीच्या word मधील
       प्रत्येक character साठी अतिरिक्त
       mistakes तयार होत नाहीत.
    */

    return Math.abs(
        originalSpaces - typedSpaces
    );

}



/* ==========================================
   TYPED WORDS
   ========================================== */

function getTypedWordCount() {

    const text =
        typingBox.value.trim();

    if (text === "") {
        return 0;
    }

    return text
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;

}



/* ==========================================
   ACCURACY
   ========================================== */

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



/* ==========================================
   LIVE RESULTS
   ========================================== */

function updateLiveResults() {

    const typed =
        typingBox.value;

    const typedCharacters =
        typed.length;

    const typedWords =
        getTypedWordCount();


    const mistakes =
        calculateMistakes(
            getPassage(),
            typed
        );


    const accuracy =
        calculateAccuracy(
            typed,
            mistakes
        );


    const elapsedSeconds =
        600 - timeLeft;


    let wpm = 0;


    if (elapsedSeconds > 0) {

        wpm =
            (typedWords / elapsedSeconds) *
            60;

    }


    mistakesDisplay.textContent =
        mistakes;

    keystrokesDisplay.textContent =
        typedCharacters;

    wordsDisplay.textContent =
        typedWords;

    accuracyDisplay.textContent =
        accuracy.toFixed(2) + "%";

    speedDisplay.textContent =
        wpm.toFixed(2) + " WPM";

}



/* ==========================================
   START TYPING
   ========================================== */

typingBox.addEventListener(
    "input",
    function() {

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



/* ==========================================
   MARK CALCULATION
   ========================================== */

function calculateMarks(mistakes) {

    /*
       20 marks maximum

       प्रत्येक mistake = 0.25 mark deduction

       40 mistakes = 10 marks

       41 mistakes = 9.75 marks

       80 mistakes = 0 marks

       80 पेक्षा जास्त = 0 marks
    */

    let marks =
        20 - (mistakes * 0.25);


    if (marks < 0) {
        marks = 0;
    }


    return marks;

}



/* ==========================================
   FINISH TEST
   ========================================== */

function finishTest() {

    if (finished) {
        return;
    }


    finished = true;


    clearInterval(timerInterval);

    timerInterval = null;


    const original =
        getPassage();

    const typed =
        typingBox.value;


    const passageWords =
        getPassageWordCount();


    const passageKeystrokes =
        getPassageKeystrokeCount();


    const typedWords =
        getTypedWordCount();


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


    const elapsedSeconds =
        Math.max(
            1,
            600 - timeLeft
        );


    const speed =
        (typedWords / elapsedSeconds) *
        60;


    const marks =
        calculateMarks(mistakes);


    /*
       Correct / wrong words

       Mistakes word-level आहेत.
    */

    const correctWords =
        Math.max(
            0,
            Math.min(
                typedWords,
                passageWords
            ) - mistakes
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



/* ==========================================
   FINISH BUTTON
   ========================================== */

finishBtn.addEventListener(
    "click",
    function() {

        finishTest();

    }
);



/* ==========================================
   PASSAGE CHANGE
   ========================================== */

passageSelect.addEventListener(
    "change",
    function() {

        currentPassage =
            Number(this.value);

        resetTest();

    }
);



/* ==========================================
   INITIAL SETUP
   ========================================== */

updateTimer();

updateLiveResults();
