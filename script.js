```javascript
// ==========================================
// TYPING TEST - FINAL SCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

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
    // CHECK ELEMENTS
    // ==========================================

    if (!typingBox || !timerElement) {

        alert("Typing Test elements not found. Please check index.html.");

        return;
    }


    // ==========================================
    // PASSAGE
    // ==========================================

    const passage =
        passageElement
            ? passageElement.innerText
                .replace(/\s+/g, " ")
                .trim()
            : "";


    // ==========================================
    // TIMER SETTINGS
    // ==========================================

    const TOTAL_SECONDS = 600;

    let secondsLeft = TOTAL_SECONDS;

    let timer = null;

    let started = false;

    let finished = false;


    // ==========================================
    // TIMER DISPLAY
    // ==========================================

    function showTime() {

        const minutes =
            Math.floor(secondsLeft / 60);

        const seconds =
            secondsLeft % 60;


        timerElement.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");
    }


    // ==========================================
    // START TIMER
    // ==========================================

    function startTimer() {

        if (started || finished) {
            return;
        }


        started = true;


        timer = setInterval(function () {

            if (finished) {

                clearInterval(timer);

                return;
            }


            secondsLeft--;


            showTime();


            updateResults();


            if (secondsLeft <= 0) {

                secondsLeft = 0;

                showTime();

                finishTest();

            }

        }, 1000);
    }


    // ==========================================
    // GET WORDS
    // ==========================================

    function getWords(text) {

        if (!text.trim()) {
            return [];
        }


        return text
            .trim()
            .split(/\s+/)
            .filter(Boolean);
    }


    // ==========================================
    // WORD COMPARISON
    // ==========================================

    function compareWords(original, typed) {

        const originalWords =
            getWords(original);

        const typedWords =
            getWords(typed);


        if (typedWords.length === 0) {
            return 0;
        }


        const rows =
            originalWords.length + 1;

        const cols =
            typedWords.length + 1;


        const dp =
            Array.from(
                { length: rows },
                function () {
                    return Array(cols).fill(0);
                }
            );


        for (let i = 0; i < rows; i++) {
            dp[i][0] = i;
        }


        for (let j = 0; j < cols; j++) {
            dp[0][j] = j;
        }


        for (let i = 1; i < rows; i++) {

            for (let j = 1; j < cols; j++) {

                const same =
                    originalWords[i - 1] ===
                    typedWords[j - 1];


                const replace =
                    dp[i - 1][j - 1] +
                    (same ? 0 : 1);


                const remove =
                    dp[i - 1][j] + 1;


                const insert =
                    dp[i][j - 1] + 1;


                dp[i][j] =
                    Math.min(
                        replace,
                        remove,
                        insert
                    );
            }
        }


        return dp[
            originalWords.length
        ][
            typedWords.length
        ];
    }


    // ==========================================
    // MISTAKES
    // ==========================================

    function calculateMistakes(typed) {

        if (!typed || typed.length === 0) {
            return 0;
        }


        // Only compare the portion typed so far.
        const originalPart =
            passage.substring(
                0,
                Math.max(
                    typed.length,
                    1
                )
            );


        let mistakes =
            compareWords(
                originalPart,
                typed
            );


        // Do not allow live mistakes to become
        // huge because the student has only
        // typed a small portion.

        if (mistakes < 0) {
            mistakes = 0;
        }


        return mistakes;
    }


    // ==========================================
    // UPDATE RESULTS
    // ==========================================

    function updateResults() {

        const typed =
            typingBox.value;


        const typedWords =
            getWords(typed).length;


        const typedCharacters =
            typed.length;


        const mistakes =
            calculateMistakes(typed);


        let correct =
            typedCharacters -
            mistakes;


        if (correct < 0) {
            correct = 0;
        }


        let accuracy = 100;


        if (typedCharacters > 0) {

            accuracy =
                (
                    correct /
                    typedCharacters
                ) * 100;


            if (accuracy > 100) {
                accuracy = 100;
            }


            if (accuracy < 0) {
                accuracy = 0;
            }
        }


        const elapsed =
            TOTAL_SECONDS -
            secondsLeft;


        let wpm = 0;


        if (elapsed > 0) {

            wpm =
                (
                    typedWords /
                    elapsed
                ) * 60;
        }


        mistakesElement.textContent =
            mistakes;


        keystrokesElement.textContent =
            typedCharacters;


        wordsElement.textContent =
            typedWords;


        accuracyElement.textContent =
            accuracy.toFixed(2) +
            "%";


        speedElement.textContent =
            wpm.toFixed(2) +
            " WPM";
    }


    // ==========================================
    // INPUT EVENT
    // ==========================================

    typingBox.addEventListener(
        "input",
        function () {

            if (
                !started &&
                typingBox.value.length > 0
            ) {

                startTimer();

            }


            updateResults();

        }
    );


    // ==========================================
    // KEYBOARD RESTRICTIONS
    // ==========================================

    typingBox.addEventListener(
        "keydown",
        function (event) {

            if (finished) {

                event.preventDefault();

                return;
            }


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


            // Ctrl / Command OFF
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
    // COPY / CUT / PASTE OFF
    // ==========================================

    document.addEventListener(
        "copy",
        function (event) {

            event.preventDefault();

        }
    );


    document.addEventListener(
        "cut",
        function (event) {

            event.preventDefault();

        }
    );


    document.addEventListener(
        "paste",
        function (event) {

            event.preventDefault();

        }
    );


    // ==========================================
    // RIGHT CLICK OFF
    // ==========================================

    document.addEventListener(
        "contextmenu",
        function (event) {

            event.preventDefault();

        }
    );


    // ==========================================
    // FINISH TEST
    // ==========================================

    function finishTest() {

        if (finished) {
            return;
        }


        finished = true;


        clearInterval(timer);


        typingBox.disabled = true;

        finishBtn.disabled = true;


        const typed =
            typingBox.value;


        const typedWords =
            getWords(typed).length;


        const typedCharacters =
            typed.length;


        const mistakes =
            calculateMistakes(typed);


        const correct =
            Math.max(
                0,
                typedCharacters -
                mistakes
            );


        const wrong =
            mistakes;


        let accuracy = 100;


        if (typedCharacters > 0) {

            accuracy =
                (
                    correct /
                    typedCharacters
                ) * 100;


            accuracy =
                Math.max(
                    0,
                    Math.min(
                        100,
                        accuracy
                    )
                );
        }


        const elapsed =
            Math.max(
                1,
                TOTAL_SECONDS -
                secondsLeft
            );


        const wpm =
            (
                typedWords /
                elapsed
            ) * 60;


        // ======================================
        // MARKING
        // ======================================

        let marks =
            20 -
            (
                mistakes *
                0.25
            );


        if (marks < 0) {
            marks = 0;
        }


        // ======================================
        // RESULT
        // ======================================

        finalSpeed.textContent =
            wpm.toFixed(2);


        finalAccuracy.textContent =
            accuracy.toFixed(2) +
            "%";


        finalMistakes.textContent =
            mistakes;


        finalWords.textContent =
            typedWords;


        finalKeystrokes.textContent =
            typedCharacters;


        finalCorrect.textContent =
            correct;


        finalWrong.textContent =
            wrong;


        finalMarks.textContent =
            marks.toFixed(2);


        resultBox.style.display =
            "block";
    }


    // ==========================================
    // BUTTON
    // ==========================================

    finishBtn.addEventListener(
        "click",
        finishTest
    );


    // ==========================================
    // INITIAL
    // ==========================================

    showTime();

    updateResults();

});
```
