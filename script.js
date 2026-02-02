// Preloader and Animation Initialization
let slideTimer;

window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("fade-out");

      // Wait for the CSS transition (1s) to finish before starting page logic
      setTimeout(() => {
        startPageAnimations();
      }, 1000);
    }, 3000); // 3-second display time
  } else {
    startPageAnimations();
  }
});

function startPageAnimations() {
  // 1. Trigger initial scroll reveals
  reveal();
  window.addEventListener("scroll", reveal);

  // 2. Start Hero Carousel
  if (slides.length > 0) {
    slideTimer = setInterval(nextSlide, slideInterval);
  }
}

// Hero Carousel Logic
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".dot");
let currentSlide = 0;
const slideInterval = 5000; // 5 seconds

function showSlide(index) {
  if (!slides[index]) return;
  slides.forEach(slide => slide.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));

  slides[index].classList.add("active");
  dots[index].classList.add("active");
  currentSlide = index;
}

function nextSlide() {
  let next = (currentSlide + 1) % slides.length;
  showSlide(next);
}

// Click on dots
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    if (slideTimer) clearInterval(slideTimer);
    showSlide(index);
    slideTimer = setInterval(nextSlide, slideInterval);
  });
});

// Reveal Animations on Scroll
function reveal() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach(element => {
    const windowHeight = window.innerHeight;
    const elementTop = element.getBoundingClientRect().top;
    const elementVisible = 150;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("active");
    }
  });
}

// Remove the old global event listeners and initial calls
// (They are now moved into startPageAnimations)

// Gallery Configuration
const galleryImages = [
  "assets/106A5232.JPG",
  "assets/IMG_5001.JPG",
  "assets/IMG_6067.JPG",
  "assets/IMG_6602.JPG",
  "assets/IMG_7461.JPG",
  "assets/IMG_8768.JPG",
  "assets/Picsart_25-05-24_15-23-56-096.jpg",
  "assets/img1.jpg",
  "assets/img2.jpg",
  "assets/img3.jpg",
  "assets/img4.JPG",
  "assets/img5.JPG"
];

const galleryContainer = document.getElementById("gallery-container");

if (galleryContainer) {
  galleryImages.forEach(src => {
    const div = document.createElement("div");
    div.className = "gallery-item reveal";
    div.innerHTML = `<img src="${src}" alt="Chosen Gallery Image" loading="lazy">`;
    galleryContainer.appendChild(div);
  });
}

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});
// Google Form Submission Handling
let submitted = false;

function handleFormSubmit() {
  const form = document.getElementById('registration-form');
  const message = document.getElementById('form-message');

  if (form && message) {
    form.style.display = 'none';
    message.style.display = 'block';
    message.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Registration Form Persistence & Submission Logic
const regForm = document.getElementById('registration-form');
const formStorageKey = 'chosen_2026_reg_form';

// 1. Load data from localStorage on startup
function loadFormData() {
  const savedData = localStorage.getItem(formStorageKey);
  if (!savedData || !regForm) return;

  try {
    const data = JSON.parse(savedData);
    Object.keys(data).forEach(key => {
      const field = regForm.querySelector(`[name="${key}"]`) || document.getElementById(key);
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = data[key];
        } else {
          field.value = data[key];
        }

        // Handle special cases like the Parish dropdown
        if (key === 'entry.349600665' || key === 'parish_select') {
          const val = data[key];
          // We need to check if the value is 'other' to trigger the toggle
          if (val === 'other' || regForm.querySelector('#other_parish')?.value) {
            // If the element with id 'parish_select' has 'other', toggleOtherParish is called
            const select = document.getElementById('parish_select');
            if (select && select.value === 'other') toggleOtherParish('other');
          }
        }
      }
    });
  } catch (e) {
    console.error("Error loading form data", e);
  }
}

// 2. Save data to localStorage on change
function saveFormData() {
  if (!regForm) return;
  const formData = new FormData(regForm);
  const data = {};

  // Also capture IDs for elements that might have their names swapped (like Parish)
  const inputs = regForm.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const key = input.name || input.id;
    if (!key) return;

    if (input.type === 'checkbox' || input.type === 'radio') {
      data[key] = input.checked;
    } else {
      data[key] = input.value;
    }
  });

  localStorage.setItem(formStorageKey, JSON.stringify(data));
}

// 3. Setup Listeners
if (regForm) {
  // Load existing data
  loadFormData();

  // Listen for inputs
  regForm.addEventListener('input', saveFormData);

  // Handle Submission
  regForm.addEventListener('submit', () => {
    submitted = true;
    localStorage.removeItem(formStorageKey); // Clear storage on submit
  });
}

// Parish Toggle Logic
function toggleOtherParish(value) {
  const otherGroup = document.getElementById('other-parish-group');
  const otherInput = document.getElementById('other_parish');
  const parishSelect = document.getElementById('parish_select');

  if (value === 'other') {
    otherGroup.style.display = 'block';
    otherInput.required = true;
    // Swap name attribute to the text input so it's submitted instead of the select
    parishSelect.removeAttribute('name');
    otherInput.setAttribute('name', 'entry.349600665');
  } else {
    otherGroup.style.display = 'none';
    otherInput.required = false;
    // Restore name attribute to the select
    parishSelect.setAttribute('name', 'entry.349600665');
    otherInput.removeAttribute('name');
  }
  // Save state after toggle
  saveFormData();
}

// Community Intercession Logic
const INTERCESSION_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc4gO2CAUQszRyTXvz_Abguu0x4RK6_YePiLlBd6XZRUScyQw/formResponse";
const INTERCESSION_SHEET_URL = "https://docs.google.com/spreadsheets/d/1eV5MnL10zexogVszd8qJH-OODmB0Atelw-Lok_X1yBs/gviz/tq?tqx=out:json&gid=1891816628";
const PRAYER_TYPE_FIELD = "entry.941995307";
const PRAYER_COUNT_FIELD = "entry.1423921248";

async function fetchPrayerTotals() {
  try {
    const response = await fetch(INTERCESSION_SHEET_URL);
    const text = await response.text();
    // Google Visualization API returns a JSON wrapped in a function call
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

    const rows = json.table.rows;
    const totals = {};
    let grandTotal = 0;

    rows.forEach(row => {
      const type = row.c[0] ? row.c[0].v : null;
      const count = row.c[1] ? (parseInt(row.c[1].v) || 0) : 0;
      if (type) {
        totals[type] = count;
        grandTotal += count;
      }
    });

    updateCountDisplay(totals, grandTotal);
  } catch (error) {
    console.error("Error fetching prayer totals:", error);
  }
}

function updateCountDisplay(totals, grandTotal) {
  const mappings = {
    "Hail Mary": "count-hail-mary",
    "Our Father": "count-our-father",
    "Holy Mass": "count-holy-mass",
    "Fasting": "count-fasting"
  };

  // Update Grand Total
  const grandTotalEl = document.getElementById("grand-total-count");
  if (grandTotalEl) {
    grandTotalEl.innerText = grandTotal.toLocaleString();
  }

  for (const [type, id] of Object.entries(mappings)) {
    const element = document.getElementById(id);
    if (element) {
      const newCount = totals[type] || 0;
      // Simple animation if count changes
      if (element.innerText !== "..." && element.innerText !== newCount.toString()) {
        element.style.transform = "scale(1.2)";
        element.style.color = "var(--gold-accent)";
        setTimeout(() => {
          element.style.transform = "scale(1)";
          element.style.color = "var(--deep-red)";
        }, 300);
      }
      element.innerText = newCount.toLocaleString();
    }
  }
}

async function submitPrayer(type, count) {
  // 1. Disable buttons briefly
  const card = document.querySelector(`.intercession-card[data-prayer="${type}"]`);
  const buttons = card.querySelectorAll("button");
  buttons.forEach(btn => btn.disabled = true);

  // 2. Show Toast
  const toast = document.getElementById("prayer-toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);

  // 3. Submit to Google Form
  const formData = new FormData();
  formData.append(PRAYER_TYPE_FIELD, type);
  formData.append(PRAYER_COUNT_FIELD, count);

  try {
    // using no-cors as required for Google Form submission via fetch
    await fetch(INTERCESSION_FORM_URL, {
      method: "POST",
      body: formData,
      mode: "no-cors"
    });
  } catch (error) {
    console.error("Submission error:", error);
  }

  // 4. Re-enable buttons after a delay
  setTimeout(() => {
    buttons.forEach(btn => btn.disabled = false);
    fetchPrayerTotals(); // Fetch latest totals after submission
  }, 2000);
}

// Initial fetch and interval
document.addEventListener("DOMContentLoaded", () => {
  fetchPrayerTotals();
  setInterval(fetchPrayerTotals, 5000); // Refresh every 5 seconds
});
