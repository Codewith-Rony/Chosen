/**
 * script.js - Optimized version
 * Consolidates DOM access, uses modern observers for better performance, 
 * and standardizes API submission logic.
 */

// --- Constants & Configuration ---
const CONFIG = {
  slideInterval: 5000,
  prayerRefreshInterval: 8000,
  formStorageKey: 'chosen_2026_reg_form',
  gasUploadUrl: "https://script.google.com/macros/s/AKfycbwelH6EmxgOE5W4ds0lnLhNJPjSwkbBULzBU66BRc5cs_oWo2A9E5UAO1XsPcdZq59C/exec",
  regFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLScA0bsPDocm0PwPZJVWdehvWoaWDpsO4votctEkZPbezeTGPA/formResponse",
  intercessionFormUrl: "https://docs.google.com/forms/d/e/1FAIpQLSc4gO2CAUQszRyTXvz_Abguu0x4RK6_YePiLlBd6XZRUScyQw/formResponse",
  intercessionSheetUrl: "https://docs.google.com/spreadsheets/d/1eV5MnL10zexogVszd8qJH-OODmB0Atelw-Lok_X1yBs/gviz/tq?tqx=out:json&gid=1891816628",
  fields: {
    paymentLink: "entry.1783117236",
    prayerType: "entry.941995307",
    prayerCount: "entry.1423921248",
    parish: "entry.349600665"
  },
  intercessions: [
    { type: "Hail Mary", icon: "🌸", description: "Your effort matters." },
    { type: "Our Father", icon: "🙏", description: "Your effort matters." },
    { type: "Memorare", icon: "📜", description: "Your effort matters." },
    { type: "Creed", icon: "✝️", description: "Your effort matters." },
    { type: "Rosary", icon: "📿", description: "Your effort matters." },
    { type: "Mercy Rosary", icon: "🥀", description: "Your effort matters." },
    { type: "Holy Mass", icon: "⛪", description: "Your effort matters." },
    { type: "Fasting", icon: "🍞", description: "Your effort matters." }
  ]
};

// --- State Management ---
let state = {
  currentSlide: 0,
  slideTimer: null,
  isSubmitted: false,
  localPrayers: {
    "Hail Mary": 0, "Our Father": 0, "Memorare": 0, "Creed": 0,
    "Rosary": 0, "Mercy Rosary": 0, "Holy Mass": 0, "Fasting": 0
  }
};

// --- DOM Elements Cache ---
const elements = {
  preloader: document.getElementById('preloader'),
  slides: document.querySelectorAll('.carousel-slide'),
  dots: document.querySelectorAll('.dot'),
  regForm: document.getElementById('registration-form'),
  formMessage: document.getElementById('form-message'),
  fileInput: document.getElementById('payment_screenshot'),
  filePreview: document.getElementById('file-preview'),
  intercessionGrid: document.querySelector('.intercession-grid'),
  parishSelect: document.getElementById('parish_select')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  renderDynamicContent();
  initPreloader();
  initForm();
  initIntercessions();
  initSmoothScroll();
});

const renderDynamicContent = () => {
  // 1. Render Intercessions
  if (elements.intercessionGrid) {
    elements.intercessionGrid.innerHTML = CONFIG.intercessions.map(p => `
      <div class="intercession-card" data-prayer="${p.type}" id="card-${p.type.toLowerCase().replace(/\s+/g, '-')}">
        <div class="card-main">
          <div class="card-icon">${p.icon}</div>
          <h3>${p.type}</h3>
          <div class="count" id="count-${p.type.toLowerCase().replace(/\s+/g, '-')}">...</div>
          <p class="count-label">Global Total</p>
          <div class="user-controls">
            <div class="stepper">
              <button onclick="changeLocalCount('${p.type}', -1)">−</button>
              <span id="local-${p.type.toLowerCase().replace(/\s+/g, '-')}">0</span>
              <button onclick="changeLocalCount('${p.type}', 1)">+</button>
            </div>
            <button class="offer-btn" onclick="submitLocalPrayers('${p.type}')">Offer Prayers</button>
          </div>
        </div>
        <div class="card-thanks">
          <div class="thanks-content">
            <span>✨</span>
            <h4>Thank you for the prayers!</h4>
            <p>${p.description}</p>
            <button class="reset-btn" onclick="resetCard('${p.type}')">Pray More</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 2. Parishes are now static in HTML
};

// --- Preloader & Animations ---
const initPreloader = () => {
  const hidePreloader = () => {
    if (elements.preloader && !elements.preloader.classList.contains('fade-out')) {
      elements.preloader.classList.add('fade-out');
      setTimeout(startAnimations, 1000);
    }
  };

  window.addEventListener('load', () => setTimeout(hidePreloader, 1500));
  setTimeout(hidePreloader, 6000); // Safety fallback
};

const startAnimations = () => {
  initScrollReveal();
  initCarousel();
};

const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// --- Hero Carousel ---
const initCarousel = () => {
  if (!elements.slides.length) return;

  const showSlide = (index) => {
    elements.slides.forEach(s => s.classList.remove('active'));
    elements.dots.forEach(d => d.classList.remove('active'));

    elements.slides[index].classList.add('active');
    elements.dots[index].classList.add('active');
    state.currentSlide = index;
  };

  const nextSlide = () => showSlide((state.currentSlide + 1) % elements.slides.length);

  state.slideTimer = setInterval(nextSlide, CONFIG.slideInterval);

  elements.dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(state.slideTimer);
      showSlide(i);
      state.slideTimer = setInterval(nextSlide, CONFIG.slideInterval);
    });
  });
};

// --- Registration Form ---
const initForm = () => {
  if (!elements.regForm) return;

  loadFormData();
  elements.regForm.addEventListener('input', saveFormData);

  elements.regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = elements.regForm.querySelector('button[type="submit"]');
    const originalText = btn.innerText;

    try {
      const file = elements.fileInput.files[0];
      if (!file) throw new Error("Please upload a payment screenshot.");

      btn.disabled = true;
      btn.innerText = "Processing Payment...";

      // 1. Upload to Drive
      const uploadResp = await uploadFileToGAS(file);
      if (!uploadResp.success) throw new Error(uploadResp.error || "Upload failed");

      // 2. Submit Form
      btn.innerText = "Finalizing Registration...";

      const submissionData = new URLSearchParams();
      const currentFormData = new FormData(elements.regForm);

      // Add all text fields, skip binary file data (Google Forms rejects binary)
      for (const [key, value] of currentFormData.entries()) {
        if (!(value instanceof File)) {
          submissionData.append(key, value);
        }
      }

      // Specifically add the payment link generated from the upload
      submissionData.append(CONFIG.fields.paymentLink, uploadResp.link);

      await fetch(CONFIG.regFormUrl, {
        method: 'POST',
        body: submissionData,
        mode: 'no-cors'
      });

      // 3. Success UI
      handleFormSuccess();
      localStorage.removeItem(CONFIG.formStorageKey);
    } catch (err) {
      alert(err.message);
      btn.disabled = false;
      btn.innerText = originalText;
    }
  });
};

const handleFormSuccess = () => {
  elements.regForm.style.display = 'none';
  elements.formMessage.style.display = 'block';
  elements.formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

const handleFileSelect = (input) => {
  const file = input.files[0];
  if (file && elements.filePreview) {
    const reader = new FileReader();
    reader.onload = (e) => {
      elements.filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-height: 300px; border-radius: 8px;">`;
    };
    reader.readAsDataURL(file);
  }
};

const uploadFileToGAS = async (file) => {
  const base64 = await toBase64(file);
  const params = new URLSearchParams({
    file: base64.split(',')[1],
    filename: file.name,
    type: file.type
  });

  const resp = await fetch(CONFIG.gasUploadUrl, { method: 'POST', body: params });
  return await resp.json();
};

const toBase64 = (file) => new Promise((res, rej) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => res(reader.result);
  reader.onerror = rej;
});

// --- Local Storage Persistence ---
const saveFormData = () => {
  const data = {};
  new FormData(elements.regForm).forEach((val, key) => data[key] = val);
  localStorage.setItem(CONFIG.formStorageKey, JSON.stringify(data));
};

const loadFormData = () => {
  const saved = localStorage.getItem(CONFIG.formStorageKey);
  if (!saved) return;
  const data = JSON.parse(saved);
  Object.keys(data).forEach(key => {
    const field = elements.regForm.querySelector(`[name="${key}"]`);
    if (field) field.value = data[key];
  });
  // Check parish state
  const parishSelect = document.getElementById('parish_select');
  if (parishSelect?.value === 'other') toggleOtherParish('other');
};

// --- Parish Toggle ---
const toggleOtherParish = (val) => {
  const group = document.getElementById('other-parish-group');
  const input = document.getElementById('other_parish');
  const select = document.getElementById('parish_select');

  const isOther = val === 'other';
  group.style.display = isOther ? 'block' : 'none';
  input.required = isOther;

  if (isOther) {
    select.removeAttribute('name');
    input.setAttribute('name', CONFIG.fields.parish);
  } else {
    select.setAttribute('name', CONFIG.fields.parish);
    input.removeAttribute('name');
  }
  saveFormData();
};

// --- Community Intercessions ---
const initIntercessions = () => {
  fetchPrayerTotals();
  setInterval(fetchPrayerTotals, CONFIG.prayerRefreshInterval);
};

const fetchPrayerTotals = async () => {
  try {
    const resp = await fetch(CONFIG.intercessionSheetUrl);
    const text = await resp.text();
    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

    let grandTotal = 0;
    const totals = json.table.rows.reduce((acc, row) => {
      const type = row.c[0]?.v;
      const val = parseInt(row.c[1]?.v) || 0;
      if (type) { acc[type] = val; grandTotal += val; }
      return acc;
    }, {});

    updateIntercessionUI(totals, grandTotal);
  } catch (e) {
    console.error("Fetch totals error", e);
  }
};

const updateIntercessionUI = (totals, grand) => {
  const grandEl = document.getElementById('grand-total-count');
  if (grandEl) grandEl.innerText = grand.toLocaleString();

  CONFIG.intercessions.forEach(p => {
    const id = `count-${p.type.toLowerCase().replace(/\s+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) {
      const val = totals[p.type] || 0;
      if (el.innerText !== "..." && el.innerText !== val.toLocaleString()) {
        el.classList.add('bump');
        setTimeout(() => el.classList.remove('bump'), 500);
      }
      el.innerText = val.toLocaleString();
    }
  });
};

const changeLocalCount = (type, delta) => {
  state.localPrayers[type] = Math.max(0, (state.localPrayers[type] || 0) + delta);
  const id = `local-${type.toLowerCase().replace(/\s+/g, '-')}`;
  const el = document.getElementById(id);
  if (el) el.innerText = state.localPrayers[type];
};

const submitLocalPrayers = async (type) => {
  const count = state.localPrayers[type];
  if (count <= 0) return;

  const cardId = `card-${type.toLowerCase().replace(/\s+/g, '-')}`;
  const card = document.getElementById(cardId);
  const btn = card?.querySelector('.offer-btn');

  try {
    if (btn) { btn.disabled = true; btn.innerText = "Sending..."; }

    const body = new URLSearchParams({
      [CONFIG.fields.prayerType]: type,
      [CONFIG.fields.prayerCount]: count
    });

    await fetch(CONFIG.intercessionFormUrl, { method: 'POST', body, mode: 'no-cors' });

    if (card) card.classList.add('offered');
    setTimeout(fetchPrayerTotals, 1000);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.innerText = "Retry"; }
  }
};

const resetCard = (type) => {
  const idPrefix = type.toLowerCase().replace(/\s+/g, '-');
  const card = document.getElementById(`card-${idPrefix}`);
  if (card) {
    card.classList.remove('offered');
    state.localPrayers[type] = 0;
    const label = document.getElementById(`local-${idPrefix}`);
    if (label) label.innerText = "0";
    const btn = card.querySelector('.offer-btn');
    if (btn) { btn.disabled = false; btn.innerText = "Offer Prayers"; }
  }
};

// --- Global Exports ---
// Exposing these functions to the window so they can be called from HTML onclick/onchange
window.handleFileSelect = handleFileSelect;
window.toggleOtherParish = toggleOtherParish;
window.changeLocalCount = changeLocalCount;
window.submitLocalPrayers = submitLocalPrayers;
window.resetCard = resetCard;

// --- Utils ---
const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
};
