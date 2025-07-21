// Ակտիվացնում ենք activeLink դասը բոլոր .lang-link էլեմենտների վրա
document.querySelectorAll(".lang-link").forEach(link => {
  link.classList.add("activeLink");
});

const BOT_TOKEN = "8103380290:AAFLA2Y9gZv61iO67w7IKeVPivMgj6xyEKs";
const CHAT_ID = "1630974229";

const form = document.getElementById("appointmentForm");

// Ներառական input-ների ընտրում
const nameInput = form.querySelector('input[name="name"]');
const phoneInput = form.querySelector('input[name="phone"]');
const dateInput = form.querySelector('input[name="date"]');
const timeInput = form.querySelector('input[name="time"]');
const fromInput = form.querySelector('input[name="from_address"]');
const toInput = form.querySelector('input[name="to_address"]');
const messageInput = form.querySelector('textarea[name="message"]');

// Սետափում ենք նախնական ամսաթիվն ու ժամը էջի բեռնումից
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${year}-${month}-${day}`;

  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  timeInput.value = `${hours}:${minutes}`;
});

// Վերահսկող գործառույթ սխալների համար
function showError(input, message) {
  let error = input.parentElement.querySelector(".error-message");
  if (!error) {
    error = document.createElement("div");
    error.className = "error-message";
    input.parentElement.appendChild(error);
  }
  error.innerText = message;
  input.classList.add("input-error");
}

// Սխալի հեռացում
function clearError(input) {
  const error = input.parentElement.querySelector(".error-message");
  if (error) {
    error.remove();
  }
  input.classList.remove("input-error");
}

// Գույնի փոփոխում ըստ արժեքի
function setInputColor(input) {
  if (input.value) {
    input.style.color = "#ff954d";
  } else {
    input.style.color = "#6c757d";
  }
}

// Հեռախոսի համարից հեռացնում ենք ոչ թվային սիմվոլները
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});

// Ժամ և ամսաթվի դաշտերում գույնի փոփոխում
[dateInput, timeInput].forEach((input) => {
  input.addEventListener("input", () => setInputColor(input));
});

// Էջի բեռնվելուց հետո գույների ստուգում
window.addEventListener("load", () => {
  [dateInput, timeInput].forEach((input) => setInputColor(input));
});

// Form submit event
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Հին սխալների հեռացում
  [nameInput, phoneInput, dateInput, timeInput, fromInput, toInput].forEach(
    (input) => clearError(input)
  );

  let hasError = false;

  // Վալիդացիաներ
  if (!nameInput.value.trim()) {
    showError(nameInput, "Խնդրում ենք լրացնել անունը։");
    hasError = true;
  }

  // Հեռախոսահամարի regex (հարցական է, թարմացրու ըստ ցանկության)
  const phoneRegex = /^(?:\+?374|0)([1-9][0-9])\d{6}$|^(?:\+?7|8)?9\d{9}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    showError(phoneInput, "Հեռախոսահամարը սխալ է։");
    hasError = true;
  }

  if (!dateInput.value) {
    showError(dateInput, "Խնդրում ենք ընտրել ամսաթիվ։");
    hasError = true;
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateInput.value);
    if (selectedDate < today) {
      showError(dateInput, "Անցյալ ամսաթիվ ընտրել չեք կարող։");
      hasError = true;
    }
  }

  if (!timeInput.value) {
    showError(timeInput, "Խնդրում ենք ընտրել ժամ։");
    hasError = true;
  }

  if (!fromInput.value.trim()) {
    showError(fromInput, "Խնդրում ենք լրացնել որտեղից վերցնել։");
    hasError = true;
  }

  if (!toInput.value.trim()) {
    showError(toInput, "Խնդրում ենք լրացնել որտեղ տանել։");
    hasError = true;
  }

  if (hasError) return;

  // Տեքստը, որը ուղարկելու ենք Telegram-ին
  const message = `
🚕 Նոր պատվեր:
👤 Անուն: ${nameInput.value}
📞 Հեռախոսահամար: ${phoneInput.value}
📅 Ամսաթիվ: ${dateInput.value}
⏰ Ժամ: ${timeInput.value}
🏠 Որտեղից վերցնել: ${fromInput.value}
🏡 Որտեղ տանել: ${toInput.value}
💬 Մեկնաբանություն: ${messageInput.value || "Չկա"}
`;

  // Ուղարկում Telegram API-ի միջոցով
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Ուղարկվեց ✅", data);

      const successSound = new Audio("audio/success-340660.mp3");
      successSound.volume = 0.7;
      successSound.play().then(() => {
        alert("Ձեր տվյալները հաջողությամբ ուղարկվել են։ Մենք շուտով կապ կհաստատենք Ձեզ հետ։");
      });

      form.reset();
      [dateInput, timeInput].forEach((input) => setInputColor(input));
    })
    .catch((err) => {
      console.error("Սխալ:", err);
      alert("Հաղորդագրությունն ուղարկելու ընթացքում սխալ տեղի ունեցավ։ Խնդրում ենք փորձել կրկին:");
    });
});

// Service Worker գրանցում
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}
