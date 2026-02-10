/**
 * Utility functions for the chess bot platform
 */

// ==================== MODAL MANAGEMENT ====================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

// Close modals when clicking on background
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.classList.remove("show");
    document.body.style.overflow = "";
  }
});

// Close modals with close button or cancel button
document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const modal = e.target.closest(".modal");
    if (modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    }
  });
});

// ==================== TAB MANAGEMENT ====================
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      
      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });
}

// ==================== THEME MANAGEMENT ====================
function loadTheme() {
  const theme = localStorage.getItem("theme") || "light";
  setTheme(theme);
}

function setTheme(theme) {
  localStorage.setItem("theme", theme);
  const body = document.body;
  if (theme === "dark") {
    body.classList.add("dark-mode");
    document.getElementById("theme-toggle").textContent = "☀";
  } else {
    body.classList.remove("dark-mode");
    document.getElementById("theme-toggle").textContent = "🌙";
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = "info", duration = 3000) {
  const alertId = `alert-${Date.now()}`;
  const alertElement = document.createElement("div");
  alertElement.id = alertId;
  alertElement.className = `alert alert-${type}`;
  alertElement.textContent = message;
  alertElement.style.position = "fixed";
  alertElement.style.top = "20px";
  alertElement.style.right = "20px";
  alertElement.style.zIndex = "10000";
  alertElement.style.minWidth = "300px";
  alertElement.style.maxWidth = "500px";
  
  document.body.appendChild(alertElement);
  
  setTimeout(() => {
    alertElement.remove();
  }, duration);
}

// ==================== LOADING STATE ====================
function showLoading(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  if (element) {
    element.disabled = true;
    const originalText = element.textContent;
    element.innerHTML = '<span class="spinner"></span> Loading...';
    element.dataset.originalText = originalText;
  }
}

function hideLoading(element) {
  if (typeof element === "string") {
    element = document.getElementById(element);
  }
  if (element) {
    element.disabled = false;
    element.textContent = element.dataset.originalText || "Submit";
  }
}

// ==================== API UTILITIES ====================
async function apiCall(endpoint, options = {}) {
  const defaultOptions = {
    headers: { "Content-Type": "application/json" },
  };
  
  const response = await fetch(endpoint, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: response.statusText || "Unknown error",
    }));
    throw new Error(error.detail || error.message || "API request failed");
  }
  
  return response.json();
}

async function apiGet(endpoint) {
  return apiCall(endpoint, { method: "GET" });
}

async function apiPost(endpoint, data) {
  return apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== DOM UTILITIES ====================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

function formatDuration(seconds) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

function getResultBadge(result) {
  const badges = {
    white: '<span class="badge badge-primary">White Win</span>',
    black: '<span class="badge badge-primary">Black Win</span>',
    draw: '<span class="badge badge-warning">Draw</span>',
    forfeit: '<span class="badge badge-danger">Forfeit</span>',
  };
  return badges[result] || `<span class="badge badge-info">${result}</span>`;
}

function createCard(data = {}) {
  const card = document.createElement("div");
  card.className = "card";
  
  let html = "";
  if (data.header) {
    html += `<div class="card-header">${data.header}`;
    if (data.badge) html += ` ${data.badge}`;
    html += `</div>`;
  }
  if (data.body) {
    html += `<div class="card-body">${data.body}</div>`;
  }
  if (data.footer) {
    html += `<div class="card-footer">${data.footer}</div>`;
  }
  
  card.innerHTML = html;
  return card;
}

// ==================== FORM UTILITIES ====================
function disableForm(form) {
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = true;
  });
}

function enableForm(form) {
  form.querySelectorAll("input, select, textarea, button").forEach((el) => {
    el.disabled = false;
  });
}

function resetForm(form) {
  form.reset();
  form.querySelectorAll("input[type=checkbox]").forEach((el) => {
    el.checked = false;
  });
}

// ==================== FILTERING & SEARCH ====================
function filterCards(cards, searchTerm, searchFields = ["header"]) {
  const term = searchTerm.toLowerCase();
  return cards.filter((card) => {
    return searchFields.some((field) => {
      const element = card.querySelector(`.${field}`);
      return element && element.textContent.toLowerCase().includes(term);
    });
  });
}

// ==================== PAGINATION ====================
function renderPagination(currentPage, totalPages, onPageChange) {
  const paginationEl = document.getElementById("matches-pagination");
  if (!paginationEl) return;
  
  paginationEl.innerHTML = "";
  
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = `btn btn-small ${i === currentPage ? "active" : ""}`;
    button.addEventListener("click", () => onPageChange(i));
    paginationEl.appendChild(button);
  }
}

// ==================== INITIALIZE ====================
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadTheme();
  
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});
