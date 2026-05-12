/**
 * DigiKhata
 * Core Javascript Logic with Mobile UI Support
 */

// State Management
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let expenseChart = null;

// DOM Elements Selection
const elements = {
  totalBalance: document.getElementById("total-balance"),
  totalIncome: document.getElementById("total-income"),
  totalExpense: document.getElementById("total-expense"),
  totalSavings: document.getElementById("total-savings"),
  list: document.getElementById("transactions-list"),
  form: document.getElementById("transaction-form"),
  title: document.getElementById("title"),
  amount: document.getElementById("amount"),
  type: document.getElementById("type"),
  category: document.getElementById("category"),
  date: document.getElementById("date"),
  editId: document.getElementById("edit-id"),
  submitBtnText: document.getElementById("submit-btn-text"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  formTitle: document.getElementById("form-title"),
  searchInput: document.getElementById("search-input"),
  filterCategory: document.getElementById("filter-category"),
  emptyState: document.getElementById("empty-state"),
  themeToggle: document.getElementById("theme-toggle"),

  // Mobile Views
  navItems: document.querySelectorAll(".nav-item"),
  viewOverview: document.getElementById("overview-section"),
  viewAdd: document.getElementById("view-add"),
  viewAnalytics: document.getElementById("view-analytics"),
  viewTransactions: document.getElementById("view-transactions"),
};

// Utilities & Formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

// Icon Mapping
const categoryIcons = {
  Food: "fa-utensils",
  Travel: "fa-plane",
  Bills: "fa-file-invoice-dollar",
  Shopping: "fa-bag-shopping",
  Salary: "fa-money-bill-wave",
  Health: "fa-heart-pulse",
  Savings: "fa-piggy-bank",
  Other: "fa-circle-question",
};

const setDateToToday = () => {
  elements.date.valueAsDate = new Date();
};

const updateLocalStorage = () => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

const generateID = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Toast Notification System
const showToast = (message, type = "success") => {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let icon = "fa-check-circle";
  if (type === "error") icon = "fa-times-circle";
  if (type === "warning") icon = "fa-exclamation-triangle";

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Core UI Updates
const updateMetrics = () => {
  // Collect specific amounts based on type
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  // Calculate specifically categorized savings
  const savings = transactions
    .filter((t) => t.category === "Savings")
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const total = income - expense;

  elements.totalBalance.innerText = formatCurrency(total);
  elements.totalIncome.innerText = formatCurrency(income);
  elements.totalExpense.innerText = formatCurrency(expense);
  elements.totalSavings.innerText = formatCurrency(savings);

  // Dynamic color coding for balance
  elements.totalBalance.style.color =
    total < 0 ? "var(--danger-color)" : "var(--primary-color)";
};

const updateChart = () => {
  const expenses = transactions.filter((t) => t.type === "expense");

  // Group expenses by category
  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);
  const ctx = document.getElementById("expense-chart").getContext("2d");
  const isDark = document.body.classList.contains("dark-mode");

  // Destroy previous chart instance if it exists to render anew
  if (expenseChart) {
    expenseChart.destroy();
  }

  if (data.length === 0) {
    // Fallback for empty state or no expenses
    expenseChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["No Expenses"],
        datasets: [
          {
            data: [1],
            backgroundColor: [isDark ? "#374151" : "#e5e7eb"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });
    return;
  }

  // Distinct colors for each category slice
  const brandColors = [
    "#f43f5e",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#0ea5e9",
    "#ec4899",
  ];

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: brandColors,
          borderWidth: 2,
          borderColor: isDark ? "#1f2937" : "#ffffff",
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: window.innerWidth <= 768 ? "right" : "bottom",
          labels: {
            color: isDark ? "#f9fafb" : "#1f2937",
            padding: 15,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              family: "Inter",
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: isDark ? "#374151" : "#ffffff",
          titleColor: isDark ? "#ffffff" : "#1f2937",
          bodyColor: isDark ? "#d1d5db" : "#4b5563",
          borderColor: isDark ? "#4b5563" : "#e5e7eb",
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += formatCurrency(context.parsed);
              }
              return label;
            },
          },
        },
      },
    },
  });
};

const createTransactionElement = (transaction) => {
  const isIncome = transaction.type === "income";
  const li = document.createElement("div");
  li.className = `transaction-item ${isIncome ? "income" : "expense"}`;
  li.dataset.id = transaction.id;

  const iconClass = categoryIcons[transaction.category] || "fa-circle-question";

  // Format date string beautifully
  const dateObj = new Date(transaction.date);
  const dateFormatted = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  li.innerHTML = `
        <div class="item-info">
            <div class="item-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="item-details">
                <h4>${transaction.title}</h4>
                <p><i class="far fa-calendar-alt"></i> ${dateFormatted} • ${transaction.category}</p>
            </div>
        </div>
        <div class="item-actions">
            <div class="item-amount">
                ${isIncome ? "+" : "-"}${formatCurrency(transaction.amount)}
            </div>
            <div class="action-btns">
                <button class="action-btn edit-btn" onclick="editTransaction('${transaction.id}')" aria-label="Edit" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteTransaction('${transaction.id}')" aria-label="Delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;

  return li;
};

const renderList = () => {
  elements.list.innerHTML = "";

  let filteredTransactions = [...transactions];
  const searchTerm = elements.searchInput.value.toLowerCase();
  const categoryTerm = elements.filterCategory.value;

  // Apply Search Filter
  if (searchTerm) {
    filteredTransactions = filteredTransactions.filter((t) =>
      t.title.toLowerCase().includes(searchTerm),
    );
  }

  // Apply Category Filter
  if (categoryTerm !== "All") {
    filteredTransactions = filteredTransactions.filter(
      (t) => t.category === categoryTerm,
    );
  }

  if (filteredTransactions.length === 0) {
    elements.emptyState.classList.remove("hidden");
  } else {
    elements.emptyState.classList.add("hidden");
    // Sort newest first
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredTransactions.forEach((t) => {
      elements.list.appendChild(createTransactionElement(t));
    });
  }
};

const resetForm = () => {
  elements.title.value = "";
  elements.amount.value = "";
  elements.editId.value = "";
  elements.formTitle.innerText = "Add New Transaction";
  elements.submitBtnText.innerText = "Add Transaction";
  elements.cancelEditBtn.classList.add("hidden");
  setDateToToday();

  // UX improvement: Switch back to expense by default after success
  elements.type.value = "expense";
  elements.category.value = "Food";
};

// Event Listeners
elements.form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleVal = elements.title.value.trim();
  const amountVal = parseFloat(elements.amount.value);

  // Validation
  if (!titleVal || isNaN(amountVal) || amountVal <= 0) {
    showToast("Please provide a valid title and amount.", "error");
    return;
  }

  const transaction = {
    id: elements.editId.value ? elements.editId.value : generateID(),
    title: titleVal,
    amount: amountVal,
    type: elements.type.value,
    category: elements.category.value,
    date: elements.date.value,
  };

  if (elements.editId.value) {
    // Edit mode
    transactions = transactions.map((t) =>
      t.id === transaction.id ? transaction : t,
    );
    showToast("Transaction updated successfully");
    resetForm();
  } else {
    // Add mode
    transactions.push(transaction);
    showToast("Transaction added successfully");
    elements.title.value = "";
    elements.amount.value = "";
  }

  updateLocalStorage();
  initRender();

  // Switch to home view on mobile if added successfully
  if (window.innerWidth <= 768) {
    switchMobileView("home");
  }
});

window.deleteTransaction = (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((t) => t.id !== id);
    updateLocalStorage();
    initRender();
    showToast("Transaction deleted", "warning");
  }
};

window.editTransaction = (id) => {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    elements.title.value = transaction.title;
    elements.amount.value = transaction.amount;
    elements.type.value = transaction.type;
    elements.category.value = transaction.category;
    elements.date.value = transaction.date;
    elements.editId.value = transaction.id;

    elements.formTitle.innerText = "Edit Transaction";
    elements.submitBtnText.innerText = "Update Transaction";
    elements.cancelEditBtn.classList.remove("hidden");

    // On mobile, switch to add view to edit
    if (window.innerWidth <= 768) {
      switchMobileView("add");
    } else {
      // Scroll up nicely on desktop
      elements.form.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
};

elements.cancelEditBtn.addEventListener("click", () => {
  resetForm();
  if (window.innerWidth <= 768) {
    switchMobileView("home");
  }
});

elements.searchInput.addEventListener("input", renderList);
elements.filterCategory.addEventListener("change", renderList);

// Auto-switch category based on type for better UX
elements.type.addEventListener("change", () => {
  if (elements.type.value === "income") {
    elements.category.value = "Salary";
  } else if (elements.category.value === "Salary") {
    elements.category.value = "Food";
  }
});

// Mobile Navigation Logic
const switchMobileView = (viewName) => {
  // Only applied on mobile CSS (display matches mobile-active class)

  // Update active nav item
  elements.navItems.forEach((btn) => {
    if (btn.dataset.view === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Remove active class from all sections
  elements.viewOverview.classList.remove("mobile-active");
  elements.viewAdd.classList.remove("mobile-active");
  elements.viewAnalytics.classList.remove("mobile-active");
  elements.viewTransactions.classList.remove("mobile-active");

  // Add active class to corresponding sections
  if (viewName === "home") {
    elements.viewOverview.classList.add("mobile-active");
    elements.viewTransactions.classList.add("mobile-active");
  } else if (viewName === "analytics") {
    elements.viewOverview.classList.add("mobile-active");
    elements.viewAnalytics.classList.add("mobile-active");
    // Need to update chart specifically when taking place in DOM as display might reset canvas size
    setTimeout(updateChart, 50);
  } else if (viewName === "add") {
    elements.viewAdd.classList.add("mobile-active");
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => {
    switchMobileView(item.dataset.view);
  });
});

// Theme Management
const applyTheme = (isDark) => {
  if (isDark) {
    document.body.classList.add("dark-mode");
    elements.themeToggle.value = "dark";
  } else {
    document.body.classList.remove("dark-mode");
    elements.themeToggle.value = "light";
  }
};

elements.themeToggle.addEventListener("change", (e) => {
  const isDark = e.target.value === "dark";
  applyTheme(isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateChart(); // Re-render chart for color adaptation
});

// Watch resize events for correct desktop/mobile view resetting
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    // Desktop handles all viewing purely with CSS block/grid
    // Let's just update the chart once on resize to fix any layout shifts
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(updateChart, 250);
  }
});

// App Initialization
const initRender = () => {
  renderList();
  updateMetrics();
  updateChart();
};

const initApp = () => {
  // Check local storage for theme preference
  const savedTheme = localStorage.getItem("theme");
  // Or check system default
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    applyTheme(true);
  } else {
    applyTheme(false);
  }

  // Setup mobile view default if needed
  if (window.innerWidth <= 768) {
    switchMobileView("home");
  }

  setDateToToday();
  initRender();
};

// Start
document.addEventListener("DOMContentLoaded", initApp);
