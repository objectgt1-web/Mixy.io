
const SUPABASE_URL = "https://vrbtneqfibpnkffknpjm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable__1Rias6NsIkph8mRM6s00A_siuLqGS";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const form = document.getElementById("submissionForm");
const steps = [...document.querySelectorAll(".form-step")];
const stepItems = [...document.querySelectorAll(".step")];

const titles = [
  ["Name your app", "Start with the basic identity of your game."],
  ["Choose a category", "Help players find your game."],
  ["App specifications", "Tell us about the technical requirements."],
  ["App details", "Give reviewers and players the important information."],
  ["Upload your assets", "Add your APK and store images."],
  ["Content rating", "Tell us who your app is suitable for."]
];

let currentStep = 0;
let currentUser = null;

const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const formError = document.getElementById("formError");

function showError(message) {
  formError.textContent = message;
}

function showStep(index) {
  currentStep = index;

  steps.forEach((step, i) => {
    step.classList.toggle("active", i === index);
  });

  stepItems.forEach((item, i) => {
    item.classList.toggle("active", i === index);
    item.classList.toggle("complete", i < index);
  });

  document.getElementById("stepTitle").textContent = titles[index][0];
  document.getElementById("stepDescription").textContent = titles[index][1];
  document.getElementById("progressLabel").textContent =
    `STEP ${index + 1} OF 6`;

  document.getElementById("progressBar").style.width =
    `${((index + 1) / 6) * 100}%`;

  backBtn.disabled = index === 0;
  nextBtn.hidden = index === steps.length - 1;
  submitBtn.hidden = index !== steps.length - 1;

  formError.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function validateCurrentStep() {
  const activeStep = steps[currentStep];
  const fields = [...activeStep.querySelectorAll("input, select, textarea")];

  for (const field of fields) {
    if (field.type === "checkbox" && field.required) {
      if (!field.checked) {
        field.reportValidity();
        return false;
      }
    } else if (field.type !== "checkbox" && !field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }

  if (currentStep === 2) {
    const permissions = [
      ...document.querySelectorAll("#permissions input:checked")
    ].map(input => input.value);

    if (permissions.length === 0) {
      showError("Select the permissions your app uses, or select No permissions.");
      return false;
    }

    if (permissions.includes("None") && permissions.length > 1) {
      showError("No permissions cannot be selected with other permissions.");
      return false;
    }
  }

  if (currentStep === 5) {
    const descriptors = [
      ...document.querySelectorAll("#contentDescriptors input:checked")
    ].map(input => input.value);

    if (
      descriptors.includes("None") &&
      descriptors.length > 1
    ) {
      showError("None of these cannot be selected with other content descriptors.");
      return false;
    }
  }

  return true;
}

nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  showStep(Math.min(currentStep + 1, steps.length - 1));
});

backBtn.addEventListener("click", () => {
  showStep(Math.max(currentStep - 1, 0));
});

async function uploadFile(file, folder) {
  if (!file) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${currentUser.id}/${Date.now()}_${folder}_${safeName}`;

  const { error } = await db.storage
    .from("game-apks")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream"
    });

  if (error) throw error;

  return path;
}

function checkedValues(container) {
  return [...document.querySelectorAll(`${container} input:checked`)]
    .map(input => input.value)
    .filter(value => value !== "None");
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  if (currentStep !== 5 || !validateCurrentStep()) return;

  const apk = document.getElementById("apkFile").files[0];
  const icon = document.getElementById("iconFile").files[0];
  const featureGraphic = document.getElementById("featureGraphic").files[0];
  const screenshots = [
    ...document.getElementById("screenshots").files
  ];

  if (!apk || !icon) {
    showError("Your APK and app icon are required.");
    return;
  }

  if (!apk.name.toLowerCase().endsWith(".apk")) {
    showError("Please select a valid APK file.");
    return;
  }

  const imageFiles = [icon, featureGraphic, ...screenshots].filter(Boolean);

  if (imageFiles.some(file => !file.type.startsWith("image/"))) {
    showError("One of your image files is not a valid image.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Uploading and submitting...";
  backBtn.disabled = true;
  nextBtn.disabled = true;
  showError("Uploading your files. Please don't close this page.");

  try {
    const apkPath = await uploadFile(apk, "apk");
    const iconPath = await uploadFile(icon, "icon");
    const featurePath = featureGraphic
      ? await uploadFile(featureGraphic, "feature")
      : null;

    const screenshotPaths = [];

    for (const screenshot of screenshots) {
      screenshotPaths.push(
        await uploadFile(screenshot, "screenshot")
      );
    }

    const permissions = checkedValues("#permissions");
    const descriptors = checkedValues("#contentDescriptors");

    const submission = {
      creator_id: currentUser.id,
      title: document.getElementById("appName").value.trim(),
      app_id: document.getElementById("packageName").value.trim(),
      package_name: document.getElementById("packageName").value.trim(),
      developer_name: document.getElementById("developerName").value.trim(),
      category: document.getElementById("category").value,
      version: document.getElementById("version").value.trim(),
      version_code: Number(document.getElementById("versionCode").value),
      min_android_version: document.getElementById("minAndroid").value.trim(),
      target_sdk: Number(document.getElementById("targetSdk").value),
      permissions,
      short_description: document.getElementById("shortDescription").value.trim(),
      description: document.getElementById("description").value.trim(),
      support_email: document.getElementById("supportEmail").value.trim(),
      privacy_policy_url: document.getElementById("privacyUrl").value.trim(),
      contains_ads: document.getElementById("containsAds").value === "true",
      data_safety: document.getElementById("dataSafety").value,
      testing_instructions: document.getElementById("testingInstructions").value.trim(),
      known_issues: document.getElementById("knownIssues").value.trim(),
      release_notes: document.getElementById("releaseNotes").value.trim(),
      target_audience: document.getElementById("targetAudience").value,
      content_rating: document.getElementById("contentRating").value,
      content_descriptors: descriptors,
      apk_path: apkPath,
      icon_path: iconPath,
      feature_graphic_path: featurePath,
      screenshots: screenshotPaths,
      file_size: apk.size,
      status: "pending"
    };

    const { error } = await db
      .from("games")
      .insert(submission);

    if (error) throw error;

    form.hidden = true;
    document.getElementById("successNotice").hidden = false;
    document.getElementById("progressBar").style.width = "100%";
  } catch (error) {
    console.error("Submission error:", error);
    showError(error.message || "Submission failed. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit for review";
    backBtn.disabled = false;
    nextBtn.disabled = false;
  }
});

async function initializeDeveloperPortal() {
  const { data, error } = await db.auth.getUser();

  if (error || !data.user) {
    document.getElementById("accountLabel").textContent = "Not logged in";
    document.getElementById("loginNotice").hidden = false;
    return;
  }

  currentUser = data.user;

  document.getElementById("accountLabel").textContent =
    "@" + (currentUser.user_metadata?.username || currentUser.email);

  form.hidden = false;
  showStep(0);
}

initializeDeveloperPortal();
