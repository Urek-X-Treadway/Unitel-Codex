import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://unitel-codex-db.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsYW13cWlzeGZsdXBnaHJiaXVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTAyNTksImV4cCI6MjA2NTk2NjI1OX0.Fdd5xdjYQHKnHz63A4DMB5vRfNHSfVYd1zCuP-4Jo14" // ← Replace with your actual anon key
);

// DOM Elements
const signInBtn = document.getElementById("signInBtn");
const logOutBtn = document.getElementById("logOutBtn");
const usernameInput = document.getElementById("usernameInput");
const ageInput = document.getElementById("ageInput");
const rolesInput = document.getElementById("rolesInput");
const profileImg = document.getElementById("avatarImage");
const bannerImg = document.getElementById("bannerImage");
const avatarUpload = document.getElementById("avatarUpload");
const bannerUpload = document.getElementById("bannerUpload");
const saveUsername = document.getElementById("saveUsername");
const saveAge = document.getElementById("saveAge");
const saveRoles = document.getElementById("saveRoles");
const userIcon = document.querySelector(".user-icon");

// Helper: Upload image to Supabase storage
async function uploadImage(file, bucket) {
  const filePath = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  if (error) return null;

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

// Auth: Google Sign-In
signInBtn.addEventListener("click", async () => {
  await supabase.auth.signInWithOAuth({ provider: "google" });
});

// Auth: Logout
logOutBtn.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.reload();
});

// Load Profile
async function loadProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const user = session.user;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || error) {
    console.error("Profile load error:", error);
    return;
  }

  // Fill fields
  usernameInput.value = profile.username || "";
  ageInput.value = profile.age || "";
  rolesInput.value = profile.roles ? profile.roles.join(", ") : "";

  profileImg.src = profile.avatar_url || "/Images/favicon/UX.png";
  bannerImg.src = profile.banner_url || "/Images/Profile/Banner/DarkRed_eyes.png";

  // Also update top-right avatar
  userIcon.src = profile.avatar_url || "/Images/favicon/UX.png";
}

// Save Handlers
saveUsername.addEventListener("click", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from("profiles").upsert({ id: session.user.id, username: usernameInput.value });
});

saveAge.addEventListener("click", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from("profiles").upsert({ id: session.user.id, age: parseInt(ageInput.value) });
});

saveRoles.addEventListener("click", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const rolesArray = rolesInput.value.split(",").map(r => r.trim());
  await supabase.from("profiles").upsert({ id: session.user.id, roles: rolesArray });
});

// Avatar Upload
avatarUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const publicUrl = await uploadImage(file, "avatars");
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from("profiles").upsert({ id: session.user.id, avatar_url: publicUrl });
  profileImg.src = publicUrl;
  userIcon.src = publicUrl;
});

// Banner Upload
bannerUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const publicUrl = await uploadImage(file, "banners");
  const { data: { session } } = await supabase.auth.getSession();
  await supabase.from("profiles").upsert({ id: session.user.id, banner_url: publicUrl });
  bannerImg.src = publicUrl;
});

// Load on page open
loadProfile();





