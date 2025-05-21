document.querySelectorAll(".lang-link").forEach(link => {
  link.classList.add("activeLink");

});



const BOT_TOKEN = "8103380290:AAFLA2Y9gZv61iO67w7IKeVPivMgj6xyEKs";
const CHAT_ID = "1630974229";

const form = document.getElementById("appointmentForm");

// input-ների ընտրում
const nameInput = form.querySelector('input[name="name"]');
const phoneInput = form.querySelector('input[name="phone"]');
const dateInput = form.querySelector('input[name="date"]');
const timeInput = form.querySelector('input[name="time"]');
const fromInput = form.querySelector('input[name="from_address"]');
const toInput = form.querySelector('input[name="to_address"]');
const messageInput = form.querySelector('textarea[name="message"]');
document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("dateInput");
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${year}-${month}-${day}`;
});
document.addEventListener("DOMContentLoaded", function () {
  const timeInput = document.getElementById("timeInput");
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  timeInput.value = `${hours}:${minutes}`;
});


// validation function
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

function clearError(input) {
  const error = input.parentElement.querySelector(".error-message");
  if (error) {
    error.remove();
  }
  input.classList.remove("input-error");
}

// input-ի գույնի փոփոխում (ժամ և ամսաթիվ)
function setInputColor(input) {
  if (input.value) {
    input.style.color = "#ff954d";
  } else {
    input.style.color = "#6c757d";
  }
}

// հեռախոսի համարում թողնում ենք միայն թվեր
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, ""); // մաքրում ենք տառերը
});

// ժամ և ամսաթիվ input-ների վրա գույնի փոփոխում
[dateInput, timeInput].forEach((input) => {
  input.addEventListener("input", () => setInputColor(input));
});

// էջի բեռնումից հետո էլի ստուգենք գույները
window.addEventListener("load", () => {
  [dateInput, timeInput].forEach((input) => setInputColor(input));
});

// form-ի ուղարկման ժամանակ
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // մաքրում ենք հին սխալները
  [nameInput, phoneInput, dateInput, timeInput, fromInput, toInput].forEach(
    (input) => clearError(input)
  );

  let hasError = false;

  // ստուգումներ
  if (!nameInput.value.trim()) {
    showError(nameInput, "Խնդրում ենք լրացնել անունը։");
    hasError = true;
  }
  const phoneRegex = /^(?:\+?374|0)([1-9][0-9])\d{6}$|^(?:\+?7|8)?9\d{9}$/;
  console.log(phoneRegex.test(phoneInput.value), 'phoneRegex.test(phoneInput.value)')

  if (!phoneRegex.test(phoneInput.value)) {
    console.log(1111);
    showError(phoneInput, "Հեռախոսահամարը սխալ է։");
    hasError = true;
  }

  if (!dateInput.value) {
    showError(dateInput, "Խնդրում ենք ընտրել ամսաթիվ։");
    hasError = true;
  } else {
    // ստուգում ենք ամսաթիվը
    const today = new Date();
    today.setHours(0, 0, 0, 0); // միայն օրն ենք հաշվում
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

  if (hasError) {
    return;
  }

  // եթե ամեն ինչ նորմալ ա՝ ուղարկում ենք
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
        alert("Ваши данные были успешно отправлены. Мы свяжемся с вами в ближайшее время.");
      })

      form.reset();
      [dateInput, timeInput].forEach((input) => setInputColor(input));
    })
    .catch((err) => {
      console.error("Սխալ:", err);
      alert("Произошла ошибка при отправке сообщения. Пожалуйста, попробуйте снова.");
    });
}
);







