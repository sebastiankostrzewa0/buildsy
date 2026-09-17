// Buildsy — landing page: obsługa formularza (front-end only, bez backendu)
// Wysyłka realnie odbywa się przez mailto: (otwiera domyślny klient poczty
// użytkownika); dodatkowo każde zgłoszenie jest zapisywane do localStorage
// jako prosty podgląd/log leadów.

(function () {
  "use strict";

  // TODO: podmienić na docelowy adres kontaktowy przed publikacją.
  var CONTACT_EMAIL = "sebastiankostrzewa0@gmail.com";
  var LEADS_STORAGE_KEY = "buildsy_leads";

  document.addEventListener("DOMContentLoaded", function () {
    var mailtoHref = "mailto:" + CONTACT_EMAIL;

    var footerMailLink = document.getElementById("footer-mail-link");
    if (footerMailLink) {
      footerMailLink.href = mailtoHref;
      footerMailLink.textContent = CONTACT_EMAIL;
    }

    var fallbackMailLink = document.getElementById("fallback-mail-link");
    if (fallbackMailLink) {
      fallbackMailLink.href = mailtoHref;
      fallbackMailLink.textContent = CONTACT_EMAIL;
    }

    var form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = {
        name: form.name.value.trim(),
        company: form.company.value.trim(),
        contact: form.contact.value.trim(),
        message: form.message.value.trim(),
        submittedAt: new Date().toISOString(),
      };

      saveLead(data);
      openMailClient(data);
      showSuccess();
      form.reset();
    });

    function saveLead(data) {
      try {
        var existing = JSON.parse(localStorage.getItem(LEADS_STORAGE_KEY) || "[]");
        existing.push(data);
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(existing, null, 2));
      } catch (err) {
        // localStorage może być niedostępny (np. tryb prywatny) — nie blokujemy wysyłki.
        console.warn("Nie udało się zapisać leada lokalnie:", err);
      }
    }

    function openMailClient(data) {
      var subject = "Zapytanie Buildsy" + (data.name ? " — " + data.name : "");
      var bodyLines = [
        "Imię: " + data.name,
        data.company ? "Firma: " + data.company : null,
        "Kontakt: " + data.contact,
        "",
        "Co buduję / czego szukam:",
        data.message,
      ].filter(function (line) {
        return line !== null;
      });

      var mailto =
        "mailto:" +
        CONTACT_EMAIL +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(bodyLines.join("\n"));

      window.location.href = mailto;
    }

    function showSuccess() {
      var formNode = document.getElementById("contact-form");
      var successNode = document.getElementById("form-success");
      // Ustawiamy display inline (nie tylko atrybut [hidden]) — [hidden] ma
      // niższy priorytet niż reguła `.contact-form { display: flex }` z CSS.
      if (formNode) {
        formNode.hidden = true;
        formNode.style.display = "none";
      }
      if (successNode) {
        successNode.hidden = false;
        successNode.style.display = "block";
      }
    }
  });
})();
