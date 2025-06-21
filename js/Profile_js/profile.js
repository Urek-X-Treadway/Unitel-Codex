import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://alamwqisxflupghrbius.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14"  // <-- Replace with your actual public anon key
);

const signInBtn = document.getElementById("signInBtn");
const logOutBtn = document.getElementById("logOutBtn");
const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginButton");
const registerBtn = document.getElementById("registerButton");
const closeAuthModal = document.getElementById("closeAuthModal");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authFeedback = document.getElementById("authFeedback");

const usernameBtn = document.getElementById("usernameBtn");
const ageBtn = document.getElementById("ageBtn");
const rolesBtn = document.getElementById("rolesBtn");
const profilePhoto = document.getElementById("profilePhoto");
const bannerPhoto = document.getElementById("bannerPhoto");
const editProfileBtn = document.getElementById("editProfileBtn");

const editModal = document.getElementById("editProfileModal");
const usernameInput = document.getElementById("usernameInput");
const ageInput = document.getElementById("ageInput");
const rolesInput = document.getElementById("rolesInput");
const avatarUpload = document.getElementById("avatarUpload");
const bannerUpload = document.getElementById("bannerUpload");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");

function toggleMenu() { // Make sure this matches your HTML
  const menu = document.getElementById("userMenu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}
window.toggleMenu = toggleMenu;

// Auth modal
signInBtn.onclick = () => (authModal.style.display = "flex");
closeAuthModal.onclick = () => (authModal.style.display = "none");

// Logout
logOutBtn.onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// Login/Register
loginBtn.onclick = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail.value,
    password: authPassword.value
  });
  authFeedback.textContent = error ? "Login error: " + error.message : "";
  if (!error) location.reload();
};

registerBtn.onclick = async () => {
  const { error } = await supabase.auth.signUp({
    email: authEmail.value,
    password: authPassword.value
  });
  authFeedback.textContent = error
    ? "Registration error: " + error.message
    : "Check your email to confirm.";
};

// Load profile
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  signInBtn.style.display = "none";
  logOutBtn.style.display = "inline";
  editProfileBtn.disabled = false;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (data) {
    usernameBtn.textContent = data.username || "Guest";
    ageBtn.textContent = data.age || "-";
    rolesBtn.textContent = (data.roles || []).join(", ");
    if (data.avatar_url) profilePhoto.src = data.avatar_url;
    if (data.banner_url) bannerPhoto.src = data.banner_url;
  }
}

// Edit flow
editProfileBtn.onclick = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Please sign in first.");

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  usernameInput.value = data?.username || "";
  ageInput.value = data?.age || "";
  rolesInput.value = (data?.roles || []).join(", ");
  editModal.style.display = "flex";
};

// Cancel edit
cancelProfileBtn.onclick = () => (editModal.style.display = "none");

// Save edit
saveProfileBtn.onclick = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  let avatar_url, banner_url;

  if (avatarUpload.files[0]) {
    const file = avatarUpload.files[0];
    const { data } = await supabase.storage
      .from("avatars")
      .upload(`avatar-${user.id}`, file, { upsert: true });
    avatar_url = supabase.storage.from("avatars").getPublicUrl(data.path).data.publicUrl;
  }

  if (bannerUpload.files[0]) {
    const file = bannerUpload.files[0];
    const { data } = await supabase.storage
      .from("banners")
      .upload(`banner-${user.id}`, file, { upsert: true });
    banner_url = supabase.storage.from("banners").getPublicUrl(data.path).data.publicUrl;
  }

  const updates = {
    id: user.id,
    username: usernameInput.value,
    age: parseInt(ageInput.value) || null,
    roles: rolesInput.value.split(",").map(r => r.trim()),
    ...(avatar_url && { avatar_url }),
    ...(banner_url && { banner_url }),
    updated_at: new Date().toISOString()
  };

  await supabase.from("profiles").upsert(updates);
  editModal.style.display = "none";
  loadProfile();
};

// Initial load
loadProfile();
