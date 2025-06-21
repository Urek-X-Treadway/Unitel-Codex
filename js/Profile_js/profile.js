


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://alamwqisxflupghrbius.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14"
);

// DOM elements
const signInBtn = document.getElementById("signInBtn");
const logOutBtn = document.getElementById("logOutBtn");
const authModal = document.getElementById("authModal");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const closeAuthModal = document.getElementById("closeAuthModal");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authFeedback = document.getElementById("authFeedback");

// Show modal
signInBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
});

// Close modal
closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

// Login
loginButton.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value
  });

  if (error) {
    authFeedback.textContent = "Login failed: " + error.message;
  } else {
    authFeedback.textContent = "Login successful!";
    authModal.style.display = "none";
    signInBtn.style.display = "none";
    logOutBtn.style.display = "inline";
    location.reload();
  }
});

// Register
registerButton.addEventListener("click", async () => {
  const { data, error } = await supabase.auth.signUp({
    email: authEmail.value,
    password: authPassword.value
  });

  if (error) {
    authFeedback.textContent = "Registration failed: " + error.message;
  } else {
    authFeedback.textContent = "Check your email to confirm your account.";
  }
});

// Logout
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  signInBtn.style.display = "inline";
  logOutBtn.style.display = "none";
  location.reload();
});

// Auto check
window.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    signInBtn.style.display = "none";
    logOutBtn.style.display = "inline";
  } else {
    signInBtn.style.display = "inline";
    logOutBtn.style.display = "none";
  }
});


