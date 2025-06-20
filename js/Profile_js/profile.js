

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = 'https://alamwqisxflupghrbius.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14' // <-- replace with actual anon key string
const supabase = createClient(supabaseUrl, supabaseKey)

// DOM Elements
const signInBtn = document.getElementById("signInBtn");
const logOutBtn = document.getElementById("logOutBtn");

const usernameBtn = document.getElementById("usernameBtn");
const ageBtn = document.getElementById("ageBtn");
const rolesBtn = document.getElementById("rolesBtn");
const editProfileBtn = document.getElementById("editProfileBtn");

const profilePhoto = document.getElementById("profilePhoto");
const bannerPhoto = document.getElementById("bannerPhoto");

const modal = document.getElementById("editProfileModal");
const usernameInput = document.getElementById("usernameInput");
const ageInput = document.getElementById("ageInput");
const rolesInput = document.getElementById("rolesInput");
const avatarUpload = document.getElementById("avatarUpload");
const bannerUpload = document.getElementById("bannerUpload");
const saveProfileBtn = document.getElementById("saveProfileBtn");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");

const userIcon = document.querySelector(".user-icon");


// Parse hash and set session if redirected from OAuth
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    // Signed in successfully
    window.history.replaceState({}, document.title, window.location.pathname); // Clean URL
    updateUIAfterLogin(session);
  }
});

// Helper: Upload image to Supabase storage
async function uploadImage(file, bucket) {
  if (!file) return null;
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
  if (error) {
    console.error('Upload error:', error);
    return null;
  }
  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

// Update UI based on auth state
async function updateAuthUI() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Signed in
    signInBtn.style.display = "none";
    logOutBtn.style.display = "inline-block";
    editProfileBtn.style.display = "inline-block";

    // Load profile info
    await loadProfile();
  } else {
    // Signed out
    signInBtn.style.display = "inline-block";
    logOutBtn.style.display = "none";
    editProfileBtn.style.display = "none";

    // Clear profile info or set defaults
    usernameBtn.textContent = "Not signed in";
    ageBtn.textContent = "-";
    rolesBtn.textContent = "-";
    profilePhoto.src = "/Images/favicon/UX.png";
    bannerPhoto.src = "/Images/Profile/Banner/DarkRed_eyes.png";
    userIcon.src = "/Images/favicon/UX.png";
  }
}

// Auth: Google Sign-In
signInBtn.addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({ 
    provider: "google", 
    options: { redirectTo: location.href } 
  });
});
// Auth: Logout
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// Load Profile data & update UI
async function loadProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.log("No user session");
    return;
  }

  const user = session.user;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile load error:", error);
    return;
  }

  // Update page buttons and images with profile data
  usernameBtn.textContent = profile.username || "No username";
  ageBtn.textContent = profile.age || "No age";
  rolesBtn.textContent = profile.roles ? profile.roles.join(", ") : "No roles";

  profilePhoto.src = profile.avatar_url || "/Images/favicon/UX.png";
  bannerPhoto.src = profile.banner_url || "/Images/Profile/Banner/DarkRed_eyes.png";
  userIcon.src = profile.avatar_url || "/Images/favicon/UX.png";

  // Also fill inputs in modal for editing
  usernameInput.value = profile.username || "";
  ageInput.value = profile.age || "";
  rolesInput.value = profile.roles ? profile.roles.join(", ") : "";
}

// Show modal on Edit Profile click
editProfileBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Cancel button closes modal without saving
cancelProfileBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Save changes on Save button click
saveProfileBtn.addEventListener("click", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    alert("You must be signed in to save profile.");
    return;
  }

  const userId = session.user.id;

  // Upload images if selected
  let avatarUrl = profilePhoto.src;
  let bannerUrl = bannerPhoto.src;

  if (avatarUpload.files.length > 0) {
    const uploadedAvatarUrl = await uploadImage(avatarUpload.files[0], "avatars");
    if (uploadedAvatarUrl) avatarUrl = uploadedAvatarUrl;
  }

  if (bannerUpload.files.length > 0) {
    const uploadedBannerUrl = await uploadImage(bannerUpload.files[0], "banners");
    if (uploadedBannerUrl) bannerUrl = uploadedBannerUrl;
  }

  // Prepare roles array
  const rolesArray = rolesInput.value.split(",").map(r => r.trim()).filter(r => r.length > 0);

  // Upsert profile data
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    username: usernameInput.value,
    age: parseInt(ageInput.value),
    roles: rolesArray,
    avatar_url: avatarUrl,
    banner_url: bannerUrl
  });

  if (error) {
    alert("Error saving profile: " + error.message);
    return;
  }

  // Update UI immediately
  usernameBtn.textContent = usernameInput.value;
  ageBtn.textContent = ageInput.value;
  rolesBtn.textContent = rolesArray.join(", ");
  profilePhoto.src = avatarUrl;
  bannerPhoto.src = bannerUrl;
  userIcon.src = avatarUrl;

  // Reset file inputs
  avatarUpload.value = "";
  bannerUpload.value = "";

  // Close modal
  modal.style.display = "none";
});

// On page load check auth and set UI accordingly
window.onload = updateAuthUI;


function updateUIAfterLogin(session) {
  // Hide Sign In, Show Log Out
  signInBtn.style.display = "none";
  logOutBtn.style.display = "inline-block";

  // Show edit button if available
  const editProfileBtn = document.getElementById("editProfileBtn");
  if (editProfileBtn) {
    editProfileBtn.style.display = "inline-block";
  }

  // Load profile info
  loadProfile();
}


window.onload = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    updateUIAfterLogin(session);
  }
};


