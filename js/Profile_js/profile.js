
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://alamwqisxflupghrbius.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14"
);


// Grab elements
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

const editModal = document.getElementById("editProfileModal");
const editProfileBtn = document.getElementById("editProfileBtn");
const usernameInput = document.getElementById("usernameInput");
const ageInput = document.getElementById("ageInput");
const rolesInput = document.getElementById("rolesInput");
const avatarUpload = document.getElementById("avatarUpload");
const bannerUpload = document.getElementById("bannerUpload");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");

function hideUserMenu() {
  const menu = document.getElementById("userMenu");
  if (menu.style.display === "flex") menu.style.display = "none";
}

// --- Auth Modal Handlers ---
signInBtn.addEventListener("click", () => {
  authFeedback.textContent = "";
  authEmail.value = "";
  authPassword.value = "";
  authModal.style.display = "flex";
  hideUserMenu();
});
closeAuthModal.addEventListener("click", () => authModal.style.display = "none");
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

loginBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail.value.trim(),
    password: authPassword.value
  });
  if (error) authFeedback.textContent = `Login failed: ${error.message}`;
  else { authModal.style.display = "none"; loadProfile(); }
});

registerBtn.addEventListener("click", async () => {
  const { error } = await supabase.auth.signUp({
    email: authEmail.value.trim(),
    password: authPassword.value
  });
  authFeedback.textContent = error
    ? `Registration failed: ${error.message}`
    : "Check your email to confirm registration.";
});

// --- Image upload helper ---
async function uploadFile(bucket, file, userId, prefix) {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${prefix}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: true });
  if (error) return alert(`Upload failed: ${error.message}`), null;

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

avatarUpload.addEventListener("change", () => {
  const file = avatarUpload.files[0];
  if (file) profilePhoto.src = URL.createObjectURL(file);
});
bannerUpload.addEventListener("change", () => {
  const file = bannerUpload.files[0];
  if (file) bannerPhoto.src = URL.createObjectURL(file);
});

// --- Load profile / UI state ---
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    signInBtn.style.display = "inline";
    logOutBtn.style.display = "none";
    editProfileBtn.disabled = true;

    usernameBtn.textContent = "Guest";
    ageBtn.textContent = "-";
    rolesBtn.textContent = "-";
    profilePhoto.src = "/Images/favicon/UX.png";
    bannerPhoto.src = "/Images/Profile/Banner/DarkRed_eyes.png";
    return;
  }

  signInBtn.style.display = "none";
  logOutBtn.style.display = "inline";
  editProfileBtn.disabled = false;

  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error?.code === "PGRST116") {
    await supabase.from("profiles").insert({
      id: user.id, username: "", avatar_url: "", banner_url: "",
      age: null, roles: []
    });
    ({ data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single());
  } else if (error) {
    return alert("Error fetching profile: " + error.message);
  }

  usernameBtn.textContent = data.username || "Unknown";
  ageBtn.textContent = data.age != null ? data.age : "-";
  rolesBtn.textContent = Array.isArray(data.roles) && data.roles.length
    ? data.roles.join(", ")
    : "-";
  profilePhoto.src = data.avatar_url || "/Images/favicon/UX.png";
  bannerPhoto.src = data.banner_url || "/Images/Profile/Banner/DarkRed_eyes.png";
}

// --- Edit Profile Modal ---
editProfileBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Sign in to edit");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return alert("Error loading: " + error.message);

  usernameInput.value = data.username || "";
  ageInput.value = data.age || "";
  rolesInput.value = Array.isArray(data.roles) ? data.roles.join(", ") : "";
  avatarUpload.value = "";
  bannerUpload.value = "";
  editModal.style.display = "flex";
});

cancelProfileBtn.addEventListener("click", () => editModal.style.display = "none");

// --- Save Profile ---
saveProfileBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Sign in first.");

  let avatarUrl = null, bannerUrl = null;
  if (avatarUpload.files.length > 0) {
    avatarUrl = await uploadFile("avatars", avatarUpload.files[0], user.id, "avatar");
  }
  if (bannerUpload.files.length > 0) {
    bannerUrl = await uploadFile("banners", bannerUpload.files[0], user.id, "banner");
  }

  const updates = {
    id: user.id,
    username: usernameInput.value.trim(),
    age: ageInput.value ? parseInt(ageInput.value) : null,
    roles: rolesInput.value
      ? rolesInput.value.split(",").map(r => r.trim())
      : [],
    updated_at: new Date().toISOString(),
    ...(avatarUrl && { avatar_url: avatarUrl }),
    ...(bannerUrl && { banner_url: bannerUrl })
  };

  const { error } = await supabase.from("profiles").upsert(updates);
  if (error) return alert("Error saving profile: " + error.message);

  editModal.style.display = "none";
  await loadProfile();
  alert("Profile updated!");
});

// Close modals when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
  if (e.target === editModal) editModal.style.display = "none";
});

// Initial load
loadProfile();
