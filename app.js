const VALID_USERNAME = "admin";
const VALID_PASSWORD = "admin123";
const AUTH_KEY = "checkout_auth";

const authPanel = document.getElementById("authPanel");
const appPanel = document.getElementById("appPanel");
const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");
const logoutBtn = document.getElementById("logoutBtn");

const form = document.getElementById("calculatorForm");
const result = document.getElementById("result");
const workedModePanel = document.getElementById("workedMode");
const breakModePanel = document.getElementById("breakMode");
const modeInputs = document.querySelectorAll("input[name='mode']");

function toInt(id) {
    return Number.parseInt(document.getElementById(id).value, 10);
}

function setAuthenticated(isAuthenticated) {
    localStorage.setItem(AUTH_KEY, isAuthenticated ? "1" : "0");
    authPanel.classList.toggle("hidden", isAuthenticated);
    appPanel.classList.toggle("hidden", !isAuthenticated);
    authError.classList.add("hidden");
}

function showError(message) {
    result.classList.add("error");
    result.innerText = message;
}

function resetResult() {
    result.classList.remove("error");
    result.innerText = "--:--";
}

function showLeaveTime(minutesLeft) {
    const leaveTime = new Date(Date.now() + minutesLeft * 60000);
    const formatted = leaveTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
    result.classList.remove("error");
    result.innerText = `Leave at ${formatted}`;
}

function calculateByWorkedTime() {
    const h = toInt("workedHours");
    const m = toInt("workedMinutes");

    if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 8 || m < 0 || m > 59) {
        showError("Use worked hours 0-8 and minutes 0-59.");
        return;
    }

    const workedMinutes = h * 60 + m;
    const totalMinutes = 8 * 60;

    if (workedMinutes > totalMinutes) {
        showError("Worked time cannot be more than 8 hours.");
        return;
    }

    showLeaveTime(totalMinutes - workedMinutes);
}

function calculateByBreaks() {
    const h = toInt("elapsedHours");
    const m = toInt("elapsedMinutes");
    const singleBreak = toInt("singleBreak");
    const breakIncluded = document.getElementById("breakIncluded").checked;

    if (
        Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 8 || m < 0 || m > 59 ||
        Number.isNaN(singleBreak) || singleBreak < 0 || singleBreak > 120
    ) {
        showError("Use valid worked time and break value.");
        return;
    }

    const workedMinutes = h * 60 + m;
    const totalMinutes = 8 * 60;

    if (workedMinutes > totalMinutes) {
        showError("Worked time cannot be more than 8 hours.");
        return;
    }

    const extraBreakMinutes = breakIncluded ? 0 : singleBreak;
    showLeaveTime((totalMinutes - workedMinutes) + extraBreakMinutes);
}

function selectedMode() {
    const selected = document.querySelector("input[name='mode']:checked");
    return selected ? selected.value : "worked";
}

function syncModeUi() {
    const mode = selectedMode();
    workedModePanel.classList.toggle("hidden", mode !== "worked");
    breakModePanel.classList.toggle("hidden", mode !== "breaks");
}

modeInputs.forEach((input) => input.addEventListener("change", syncModeUi));
modeInputs.forEach((input) => input.addEventListener("change", resetResult));

document.querySelectorAll("#calculatorForm input[type='number']").forEach((input) => {
    input.addEventListener("input", function () {
        if (input.value.trim() === "") {
            resetResult();
        }
    });
});
document.getElementById("breakIncluded").addEventListener("change", resetResult);

form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (selectedMode() === "breaks") {
        calculateByBreaks();
    } else {
        calculateByWorkedTime();
    }
});

authForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        setAuthenticated(true);
    } else {
        authError.classList.remove("hidden");
    }
});

logoutBtn.addEventListener("click", function () {
    setAuthenticated(false);
    resetResult();
});

syncModeUi();
setAuthenticated(localStorage.getItem(AUTH_KEY) === "1");
