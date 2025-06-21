import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://alamwqisxflupghrbius.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14" // Replace with your anon key
);

// Elements
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

// Utility: upload file to Supabase storage and return public URL
async function uploadFile(bucket, file, userId, prefix) {
  if (!file) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefix}-${userId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  // Upload
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (error) {
    alert(`Upload failed: ${error.message}`);
    return null;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

// Show/hide user menu helper (optional)
function hideUserMenu() {
  const menu = document.getElementById("userMenu");
  if (menu.style.display === "flex") menu.style.display = "none";
}

// Show Sign In modal
signInBtn.addEventListener("click", () => {
  authFeedback.textContent = "";
  authEmail.value = "";
  authPassword.value = "";
  authModal.style.display = "flex";
  hideUserMenu();
});

// Close Auth modal
closeAuthModal.addEventListener("click", () => {
  authModal.style.display = "none";
});

// Logout
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  location.reload();
});

// Login
loginBtn.addEventListener("click", async () => {
  authFeedback.textContent = "";
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authFeedback.textContent = "Please enter email and password.";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    authFeedback.textContent = `Login failed: ${error.message}`;
  } else {
    authModal.style.display = "none";
    await loadProfile();
  }
});

// Register
registerBtn.addEventListener("click", async () => {
  authFeedback.textContent = "";
  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (!email || !password) {
    authFeedback.textContent = "Please enter email and password.";
    return;
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    authFeedback.textContent = `Registration failed: ${error.message}`;
  } else {
    authFeedback.textContent = "Check your email to confirm registration.";
  }
});

// Load profile data and update UI
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in: reset UI
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

  // Signed in UI
  signInBtn.style.display = "none";
  logOutBtn.style.display = "inline";
  editProfileBtn.disabled = false;

  // Fetch profile row
  let { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile doesn't exist, create empty one for this user
  if (error && error.code === "PGRST116") {
    // Insert empty profile row
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      username: "",
      avatar_url: "",
      banner_url: "",
      age: null,
      roles: []
    });

    if (insertError) {
      alert("Failed to create profile row: " + insertError.message);
      return;
    }
    // Refetch after insert
    ({ data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single());
  } else if (error) {
    alert("Failed to fetch profile: " + error.message);
    return;
  }

  // Update UI with profile data
  usernameBtn.textContent = data.username || "Unknown";
  ageBtn.textContent = data.age || "-";
  rolesBtn.textContent = (data.roles || []).join(", ") || "-";
  profilePhoto.src = data.avatar_url || "/Images/favicon/UX.png";
  bannerPhoto.src = data.banner_url || "/Images/Profile/Banner/DarkRed_eyes.png";
}

// Open Edit modal and fill inputs
editProfileBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be signed in to edit your profile.");
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    alert("Failed to load profile: " + error.message);
    return;
  }

  usernameInput.value = data.username || "";
  ageInput.value = data.age || "";
  rolesInput.value = (data.roles || []).join(", ");
  avatarUpload.value = "";
  bannerUpload.value = "";
  editModal.style.display = "flex";
});

// Cancel edit modal
cancelProfileBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

// Save profile
saveProfileBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("You must be signed in to save your profile.");
    return;
  }

  // Show loading or disable save button if you want here...

  // Upload avatar and banner if files selected
  let avatarUrl = null;
  let bannerUrl = null;

  if (avatarUpload.files.length > 0) {
    avatarUrl = await uploadFile("avatars", avatarUpload.files[0], user.id, "avatar");
  }
  if (bannerUpload.files.length > 0) {
    bannerUrl = await uploadFile("banners", bannerUpload.files[0], user.id, "banner");
  }

  // Prepare data for upsert
  const updates = {
    id: user.id,
    username: usernameInput.value.trim(),
    age: ageInput.value ? parseInt(ageInput.value) : null,
    roles: rolesInput.value ? rolesInput.value.split(",").map(r => r.trim()) : [],
    // Only update URLs if new ones uploaded, else keep existing values
    ...(avatarUrl && { avatar_url: avatarUrl }),
    ...(bannerUrl && { banner_url: bannerUrl }),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from("profiles").upsert(updates);

  if (error) {
    alert("Error saving profile: " + error.message);
  } else {
    editModal.style.display = "none";
    await loadProfile();
    alert("Profile updated!");
  }
});

// Close modals on outside click (optional)
window.addEventListener("click", (e) => {
  if (e.target === authModal) authModal.style.display = "none";
  if (e.target === editModal) editModal.style.display = "none";
});

// Initial load
loadProfile();



// 1. Show image previews when user selects new avatar/banner files
avatarUpload.addEventListener("change", () => {
  const file = avatarUpload.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    profilePhoto.src = url; // live preview
  }
});

bannerUpload.addEventListener("change", () => {
  const file = bannerUpload.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bannerPhoto.src = url; // live preview
  }
});

// 2. Upload images to Supabase Storage and get public URLs
async function uploadImage(file, folder, userId) {
  if (!file) return null;

  // Generate unique filename to avoid overwriting
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${userId}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars-banners')  // Make sure you create this bucket in Supabase Storage!
    .upload(fileName, file, { cacheControl: '3600', upsert: true });

  if (error) {
    console.error("Upload error:", error.message);
    return null;
  }

  // Get public URL for the uploaded file
  const { publicURL, error: urlError } = supabase.storage
    .from('avatars-banners')
    .getPublicUrl(fileName);

  if (urlError) {
    console.error("Get URL error:", urlError.message);
    return null;
  }

  return publicURL;
}

// 3. Update saveProfileBtn click handler to upload images first, then save profile
saveProfileBtn.addEventListener("click", async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("You must be signed in.");

  // Upload avatar and banner if selected
  const avatarFile = avatarUpload.files[0];
  const bannerFile = bannerUpload.files[0];

  let avatar_url = null;
  let banner_url = null;

  if (avatarFile) {
    avatar_url = await uploadImage(avatarFile, 'avatars', user.id);
  }

  if (bannerFile) {
    banner_url = await uploadImage(bannerFile, 'banners', user.id);
  }

  // Prepare updated data, include avatar/banner URLs if uploaded
  const updates = {
    id: user.id,
    username: usernameInput.value.trim(),
    age: parseInt(ageInput.value.trim()) || null,
    roles: rolesInput.value.split(",").map(r => r.trim()),
    updated_at: new Date().toISOString(),
  };

  if (avatar_url) updates.avatar_url = avatar_url;
  if (banner_url) updates.banner_url = banner_url;

  const { error } = await supabase.from("profiles").upsert(updates);

  if (error) {
    alert("Error saving profile: " + error.message);
  } else {
    alert("Profile updated successfully!");
    editModal.style.display = "none";
    loadProfile(); // reload profile data including new images
  }
});

