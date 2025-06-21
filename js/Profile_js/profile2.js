import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://alamwqisxflupghrbius.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14"
);

const signInBtn = document.getElementById("signInBtn");
const logOutBtn = document.getElementById("logOutBtn");
const authModal = document.getElementById("authModal");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const closeAuthModal = document.getElementById("closeAuthModal");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authFeedback = document.getElementById("authFeedback");

const editProfileBtn = document.getElementById("editProfileBtn");
const editProfileModal = document.getElementById("editProfileModal");

// Disable edit button by default (if not signed in)
editProfileBtn.disabled = true;

async function updateUIForUser() {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User signed in
    signInBtn.style.display = "none";
    logOutBtn.style.display = "inline";
    editProfileBtn.disabled = false;

    // Optionally load user profile info from your table here
    // For now just showing username from user metadata or email
    // For example:
    const profileUsername = user.user_metadata.full_name || user.email;
    document.getElementById("usernameBtn").textContent = profileUsername;

  } else {
    // No user signed in
    signInBtn.style.display = "inline";
    logOutBtn.style.display = "none";
    editProfileBtn.disabled = true;
  }
}

// Show auth modal when sign in clicked
signInBtn.addEventListener("click", () => {
  authModal.style.display = "flex";
});

// Hide auth modal
closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
  authFeedback.textContent = "";
  authEmail.value = "";
  authPassword.value = "";
});

// Log in user
loginButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value
  });

  if (error) {
    authFeedback.textContent = "Login failed: " + error.message;
  } else {
    authFeedback.textContent = "Login successful!";
    authModal.style.display = "none";
    updateUIForUser();
  }
});

// Register user
registerButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signUp({
    email: authEmail.value,
    password: authPassword.value
  });

  if (error) {
    authFeedback.textContent = "Registration failed: " + error.message;
  } else {
    authFeedback.textContent = "Check your email to confirm your account.";
  }
});

// Log out user
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  updateUIForUser();
});

// Edit button click: open modal only if signed in
editProfileBtn.addEventListener("click", () => {
  if (editProfileBtn.disabled) return;
  editProfileModal.style.display = "flex";

  // Optionally populate modal inputs here from user profile data
});

// Cancel edit modal
document.getElementById("cancelProfileBtn").addEventListener("click", () => {
  editProfileModal.style.display = "none";
});

// On page load, set UI according to auth status
updateUIForUser();

// Also subscribe to auth changes in case user logs in/out elsewhere
supabase.auth.onAuthStateChange(() => {
  updateUIForUser();
});
