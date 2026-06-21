/* ── Translations ── */
const translations = {
  en: {
    appName: "Freeapps Uploader",
    uploadTitle: "Upload a file",
    uploadSubtitle: "Encrypted, fast, and free",
    dropText1: "Drag & drop or",
    browse: "browse",
    dropHint: "Any file type supported",
    passwordLabel: "Password",
    passwordPlaceholder: "Optional",
    expiresLabel: "Expires in",
    expiresPlaceholder: "1 - 7 days",
    uploadBtn: "Upload",
    uploadingBtn: "Uploading...",
    storage: "Storage",
    madeBy: "Made by",
    dlPasswordLabel: "Password",
    dlPasswordPlaceholder: "Enter password to decrypt",
    dlBtn: "Download",
    closeBtn: "Close",
    copyBtn: "Copy",
    downloadComplete: "Download complete",
    startingDownload: "Starting download...",
    errorProcessing: "Error processing file",
    uploadError: "Upload error",
    connectionError: "Connection error",
    networkError: "Network error",
    wrongPassword: "Wrong password or download failed",
    error: "error",
    notFound: "not found",
    enterPassword: "Enter password (if any)",
    passwordLabelResult: "Password",
    none: "none",
  },
  fa: {
    appName: "آپلودر رایگان",
    uploadTitle: "آپلود فایل",
    uploadSubtitle: "رمزنگاری‌شده، سریع و رایگان",
    dropText1: "بکشید و رها کنید یا",
    browse: "انتخاب کنید",
    dropHint: "همه فرمت‌ها پشتیبانی می‌شود",
    passwordLabel: "رمز عبور",
    passwordPlaceholder: "اختیاری",
    expiresLabel: "مدت اعتبار",
    expiresPlaceholder: "۱ تا ۷ روز",
    uploadBtn: "آپلود",
    uploadingBtn: "در حال آپلود...",
    storage: "فضای ذخیره‌سازی",
    madeBy: "ساخته شده توسط",
    dlPasswordLabel: "رمز عبور",
    dlPasswordPlaceholder: "رمز عبور را وارد کنید",
    dlBtn: "دانلود",
    closeBtn: "بستن",
    copyBtn: "کپی",
    downloadComplete: "دانلود کامل شد",
    startingDownload: "شروع دانلود...",
    errorProcessing: "خطا در پردازش فایل",
    uploadError: "خطا در آپلود",
    connectionError: "خطا در ارتباط",
    networkError: "خطا در شبکه",
    wrongPassword: "رمز اشتباست یا دانلود ناموفق بود",
    error: "خطا",
    notFound: "یافت نشد",
    enterPassword: "رمز عبور را وارد کنید (در صورت وجود)",
    passwordLabelResult: "رمز عبور",
    none: "ندارد",
  },
};

let currentLang = localStorage.getItem("lang") || "fa";
let currentTheme = localStorage.getItem("theme") || "dark";

/* ── Theme Toggle ── */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const sunIcon = document.querySelector(".sun-icon");
  const moonIcon = document.querySelector(".moon-icon");
  if (theme === "light") {
    sunIcon.style.display = "none";
    moonIcon.style.display = "block";
  } else {
    sunIcon.style.display = "block";
    moonIcon.style.display = "none";
  }
  localStorage.setItem("theme", theme);
  currentTheme = theme;
}

document.getElementById("themeToggle").addEventListener("click", () => {
  applyTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ── Language Toggle ── */
function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.getElementById("langLabel").textContent = lang.toUpperCase();

  const isRTL = lang === "fa";
  document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lang);

  const t = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (t[key]) el.setAttribute("placeholder", t[key]);
  });
}

document.getElementById("langToggle").addEventListener("click", () => {
  applyLang(currentLang === "en" ? "fa" : "en");
});

/* ── Init Theme & Lang ── */
applyTheme(currentTheme);
applyLang(currentLang);

/* ── Helpers ── */
const enc = new TextEncoder();

const getKey = async (password) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: enc.encode("salt"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const encryptFile = async (file, password) => {
  const key = await getKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buffer);
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv, 0);
  result.set(new Uint8Array(encrypted), iv.length);
  return result;
};

const decryptFile = async (buffer, password) => {
  const key = await getKey(password);
  const iv = buffer.slice(0, 12);
  const data = buffer.slice(12);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
};

const copyText = (text) => {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
};

const fallbackCopy = (text) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try { document.execCommand("copy"); } catch (err) {}
  document.body.removeChild(textarea);
};

function t(key) {
  return translations[currentLang][key] || key;
}

function resetUploadUI() {
  const progressBar = document.getElementById("progressBar");
  const speedDisplay = document.getElementById("speedDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const progressPercent = document.getElementById("progressPercent");
  const uploadBtn = document.getElementById("uploadBtn");
  const progressSection = document.getElementById("progressSection");

  progressBar.style.width = "0%";
  speedDisplay.textContent = "0 KB/s";
  timeDisplay.textContent = "--:--";
  progressPercent.textContent = "0%";
  progressSection.style.display = "none";

  if (uploadBtn) {
    uploadBtn.disabled = false;
    uploadBtn.querySelector("span").textContent = t("uploadBtn");
  }
}

/* ── Drop Zone ── */
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("uploadFile");
const dropZoneContent = dropZone.querySelector(".drop-zone-content");
const dropZoneSelected = document.getElementById("dropZoneSelected");
const selectedFileName = document.getElementById("selectedFileName");
const removeFileBtn = document.getElementById("removeFileBtn");

dropZone.addEventListener("click", (e) => {
  if (e.target === removeFileBtn || e.target.closest(".remove-file-btn")) return;
  fileInput.click();
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    showSelectedFile(files[0].name);
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) {
    showSelectedFile(fileInput.files[0].name);
  }
});

removeFileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  fileInput.value = "";
  dropZoneContent.style.display = "flex";
  dropZoneSelected.style.display = "none";
});

function showSelectedFile(name) {
  selectedFileName.textContent = name;
  dropZoneContent.style.display = "none";
  dropZoneSelected.style.display = "flex";
}

/* ── Download Popup ── */
let cachedFileBuffer = null;
const showDownloadPopup = async (data) => {
  const popup = document.createElement("div");
  const popupDiv = document.createElement("div");
  popupDiv.className = "popup";

  const previewBox = document.createElement("div");
  previewBox.id = "previewBox";
  popupDiv.appendChild(previewBox);

  const fileName = document.createElement("p");
  fileName.className = "file-name";
  fileName.textContent = data.originalName;
  fileName.title = data.originalName;
  popupDiv.appendChild(fileName);

  if (data.passwordProtected) {
    const inputBox = document.createElement("div");
    inputBox.id = "inputBox";
    const inputHead = document.createElement("span");
    inputHead.textContent = t("dlPasswordLabel");
    const input = document.createElement("input");
    input.type = "password";
    input.id = "dlPass";
    input.placeholder = t("dlPasswordPlaceholder");
    inputBox.appendChild(inputHead);
    inputBox.appendChild(input);
    popupDiv.appendChild(inputBox);
  }

  const progressContainer = document.createElement("div");
  progressContainer.id = "downloadProgressContainer";
  progressContainer.style.display = "none";
  const progressBar = document.createElement("div");
  progressBar.id = "downloadProgressBar";
  progressContainer.appendChild(progressBar);
  popupDiv.appendChild(progressContainer);

  const statusText = document.createElement("p");
  statusText.id = "downloadStatusText";
  popupDiv.appendChild(statusText);

  const fatherEl = document.createElement("div");
  fatherEl.id = "fatherElement";

  const btn = document.createElement("button");
  btn.id = "dlBtn";
  btn.textContent = t("dlBtn");

  const closeBtn = document.createElement("button");
  closeBtn.id = "closeBtn";
  closeBtn.textContent = t("closeBtn");
  closeBtn.onclick = () => {
    resetUploadUI();
    document.getElementById("result").style.display = "none";
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  fatherEl.appendChild(btn);
  fatherEl.appendChild(closeBtn);
  popupDiv.appendChild(fatherEl);

  popup.innerHTML = "";
  popup.appendChild(popupDiv);
  document.getElementById("result").style.display = "block";
  document.getElementById("result").appendChild(popup);

  if (!data.passwordProtected) {
    const ext = data.originalName.split(".").pop().toLowerCase();
    const previewableExts = ["png","jpg","jpeg","gif","webp","mp4","webm","mov","mp3","wav","m4a"];
    if (previewableExts.includes(ext)) {
      try {
        let buffer;
        if (cachedFileBuffer) {
          buffer = cachedFileBuffer;
        } else {
          const res = await fetch("/api/file/" + encodeURIComponent(data.name));
          if (!res.ok) { alert(t("error")); return; }
          cachedFileBuffer = await res.clone().arrayBuffer();
          buffer = cachedFileBuffer;
        }

        const mime = getMime(ext);
        const blob = new Blob([buffer], { type: mime });
        const url = URL.createObjectURL(blob);

        const previewEl = document.getElementById("previewBox");
        if (mime.startsWith("image/")) {
          const img = document.createElement("img");
          img.src = url;
          img.onclick = () => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              img.requestFullscreen();
            }
          };
          previewEl.appendChild(img);
        } else if (mime.startsWith("video/")) {
          const video = document.createElement("video");
          video.src = url;
          video.controls = true;
          previewEl.appendChild(video);
        } else if (mime.startsWith("audio/")) {
          const audio = document.createElement("audio");
          audio.src = url;
          audio.controls = true;
          previewEl.appendChild(audio);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  document.getElementById("dlBtn").onclick = async () => {
    const pass = document.getElementById("dlPass")?.value;
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    statusText.textContent = t("startingDownload");

    try {
      const res = await fetch("/api/file/" + encodeURIComponent(data.name));
      if (!res.ok) { alert(t("error")); return; }

      const totalSize = parseInt(res.headers.get("Content-Length")) || 0;
      let receivedSize = 0;
      const chunks = [];
      const startTime = Date.now();
      const reader = res.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        receivedSize += value.length;

        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTime) / 1000;
        const speed = receivedSize / elapsedTime;
        const remainingSize = totalSize - receivedSize;
        const eta = speed > 0 ? remainingSize / speed : 0;

        if (totalSize > 0) {
          const percent = (receivedSize / totalSize) * 100;
          progressBar.style.width = percent + "%";
          statusText.textContent = `${formatSpeed(speed)} | ETA: ${formatTimeSimple(eta)}`;
        }
      }

      const fullBuffer = new Uint8Array(receivedSize);
      let offset = 0;
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset);
        offset += chunk.length;
      }

      const buffer = fullBuffer.buffer;
      let finalBuffer;
      if (data.passwordProtected) {
        finalBuffer = await decryptFile(buffer, pass);
      } else {
        finalBuffer = buffer;
      }

      const ext = data.originalName.split(".").pop().toLowerCase();
      const mime = getMime(ext);
      const blob = new Blob([finalBuffer], { type: mime });
      const url = URL.createObjectURL(blob);

      const imageExt = ["png", "jpg", "jpeg", "gif", "webp"];
      const videoExt = ["mp4", "webm", "ogg", "mov"];
      const audioExt = ["mp3", "wav", "ogg", "m4a"];
      const previewBox = document.getElementById("previewBox");
      previewBox.innerHTML = "";

      if (!data.passwordProtected) {
        if (imageExt.includes(ext)) {
          const img = document.createElement("img");
          img.src = url;
          previewBox.appendChild(img);
        } else if (videoExt.includes(ext)) {
          const video = document.createElement("video");
          video.src = url;
          video.controls = true;
          previewBox.appendChild(video);
        } else if (audioExt.includes(ext)) {
          const audio = document.createElement("audio");
          audio.src = url;
          audio.controls = true;
          previewBox.appendChild(audio);
        }
      }

      const a = document.createElement("a");
      a.href = url;
      a.download = data.originalName;
      a.click();

      statusText.textContent = t("downloadComplete");
      progressBar.style.width = "100%";
    } catch (err) {
      console.log(err);
      alert(t("wrongPassword"));
      statusText.textContent = t("error");
      progressBar.style.background = "var(--danger)";
    }
  };
};

function getMime(ext) {
  const map = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
    gif: "image/gif", webp: "image/webp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4",
  };
  return map[ext] || "application/octet-stream";
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatSpeed(bytesPerSec) {
  if (bytesPerSec < 1024) return bytesPerSec.toFixed(1) + " B/s";
  if (bytesPerSec < 1024 * 1024) return (bytesPerSec / 1024).toFixed(1) + " KB/s";
  if (bytesPerSec < 1024 * 1024 * 1024) return (bytesPerSec / (1024 * 1024)).toFixed(1) + " MB/s";
  return (bytesPerSec / (1024 * 1024 * 1024)).toFixed(1) + " GB/s";
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatTimeSimple(seconds) {
  if (seconds < 60) return Math.ceil(seconds) + "s";
  return Math.floor(seconds / 60) + "m " + Math.ceil(seconds % 60) + "s";
}

/* ── Init ── */
window.onload = async () => {
  const params = new URLSearchParams(location.search);
  const file = params.get("file");
  if (!file) return;
  const res = await fetch("/api/info/" + file);
  if (!res.ok) return;
  const data = await res.json();
  showDownloadPopup(data);
};

/* ── Upload ── */
document.getElementById("uploadBtn").onclick = async () => {
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const pass = document.getElementById("passwordUpload").value;
  const hours = document.getElementById("expireHours").value;

  if (!file) return;

  const progressBar = document.getElementById("progressBar");
  const speedDisplay = document.getElementById("speedDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const progressPercent = document.getElementById("progressPercent");
  const uploadBtn = document.getElementById("uploadBtn");
  const progressSection = document.getElementById("progressSection");

  uploadBtn.disabled = true;
  uploadBtn.querySelector("span").textContent = t("uploadingBtn");
  progressSection.style.display = "block";
  progressBar.style.width = "0%";
  speedDisplay.textContent = "0 KB/s";
  timeDisplay.textContent = "--:--";
  progressPercent.textContent = "0%";

  let finalFileBuffer;
  try {
    if (pass) {
      finalFileBuffer = await encryptFile(file, pass);
    } else {
      finalFileBuffer = new Uint8Array(await file.arrayBuffer());
    }
  } catch (err) {
    alert(t("errorProcessing"));
    uploadBtn.disabled = false;
    uploadBtn.querySelector("span").textContent = t("uploadBtn");
    return;
  }

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percentComplete = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percentComplete + "%";
      progressPercent.textContent = percentComplete + "%";

      const now = Date.now();
      const timeDiff = (now - startTime) / 1000;
      if (timeDiff > 0) {
        const speedBytes = e.loaded / timeDiff;
        speedDisplay.textContent = formatSpeed(speedBytes);
        const remainingBytes = e.total - e.loaded;
        const remainingTime = remainingBytes / speedBytes;
        timeDisplay.textContent = formatTime(remainingTime);
      }
    }
  });

  xhr.addEventListener("load", () => {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      if (response.success) {
        showResultPopup(response.originalName, pass, response.link, response.expire_in_days);
        fileInput.value = "";
        dropZoneContent.style.display = "flex";
        dropZoneSelected.style.display = "none";
      } else {
        alert(t("uploadError"));
      }
    } else {
      alert(t("connectionError"));
    }
    uploadBtn.disabled = false;
    uploadBtn.querySelector("span").textContent = t("uploadBtn");
  });

  xhr.addEventListener("error", () => {
    alert(t("networkError"));
    uploadBtn.disabled = false;
    uploadBtn.querySelector("span").textContent = t("uploadBtn");
  });

  const blob = new Blob([finalFileBuffer], { type: file.type });
  const fileToSend = new File([blob], file.name, { type: file.type });

  const form = new FormData();
  form.append("file", fileToSend);
  form.append("expire_in_days", hours || 1);
  form.append("passwordProtected", pass ? "true" : "false");

  const startTime = Date.now();
  xhr.open("POST", "/api/upload");
  xhr.send(form);
};

/* ── Upload Result Popup ── */
const showResultPopup = (name, pass, link, days) => {
  const wrapper = document.createElement("div");
  wrapper.className = "popupbox";
  wrapper.id = "popupbox";

  const popup = document.createElement("div");
  popup.className = "popup";

  const row0 = document.createElement("div");
  row0.id = "row0";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.onclick = () => {
    resetUploadUI();
    wrapper.remove();
  };
  svg.setAttribute("class", "CloseSvg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("height", "24px");
  svg.setAttribute("viewBox", "0 -960 960 960");
  svg.setAttribute("width", "24px");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z");
  svg.appendChild(path);
  row0.appendChild(svg);

  const fileNameEl = document.createElement("p");
  fileNameEl.className = "file-name";
  fileNameEl.textContent = name;

  const passRow = document.createElement("div");
  passRow.className = "popup-value";
  const passLabel = document.createElement("span");
  passLabel.textContent = `${t("passwordLabelResult")}: ${pass || t("none")}`;
  const passBtn = document.createElement("button");
  passBtn.className = "copy-btn";
  passBtn.textContent = t("copyBtn");
  passBtn.onclick = () => copyText(pass);
  passRow.appendChild(passLabel);
  passRow.appendChild(passBtn);

  const linkRow = document.createElement("div");
  linkRow.className = "popup-value";
  const linkLabel = document.createElement("span");
  linkLabel.textContent = location.origin + link;
  const linkBtn = document.createElement("button");
  linkBtn.className = "copy-btn";
  linkBtn.textContent = t("copyBtn");
  linkBtn.onclick = () => copyText(location.origin + link);
  linkRow.appendChild(linkLabel);
  linkRow.appendChild(linkBtn);

  const timer = document.createElement("p");
  timer.id = "timer";

  popup.appendChild(row0);
  popup.appendChild(fileNameEl);
  popup.appendChild(passRow);
  popup.appendChild(linkRow);
  popup.appendChild(timer);
  wrapper.appendChild(popup);
  document.body.appendChild(wrapper);

  let time = days * 86400;
  const interval = setInterval(() => {
    time--;
    const d = Math.floor(time / 86400);
    const h = Math.floor((time % 86400) / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    timer.textContent = `${d}d ${h}h ${m}m ${s}s`;
    if (time <= 0) clearInterval(interval);
  }, 1000);
};

/* ── Storage Status ── */
async function updateStorageUI() {
  try {
    const response = await fetch("/api/storage-status");
    if (!response.ok) throw new Error("Failed to fetch storage status");
    const data = await response.json();
    const { used, remaining, total } = data;

    document.getElementById("storageText").textContent =
      `${formatBytes(remaining)} / ${formatBytes(total)}`;

    const percentageUsed = (used / total) * 100;
    const percentageRemaining = 100 - percentageUsed;
    const progressBar = document.getElementById("storageProgressBar");
    progressBar.style.width = `${percentageUsed}%`;

    if (percentageRemaining < 10) {
      progressBar.classList.add("low");
    } else {
      progressBar.classList.remove("low");
    }

    document.getElementById("storageBarContainer").style.display = "block";
  } catch (error) {
    console.error("Error updating storage UI:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateStorageUI();
});

/* ── Paste Support ── */
document.addEventListener("paste", (event) => {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items;
  let file = null;
  for (let i = 0; i < items.length; i++) {
    if (items[i].kind === "file") {
      file = items[i].getAsFile();
      break;
    }
  }
  if (file) {
    const fileInput = document.getElementById("uploadFile");
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      showSelectedFile(file.name);
    }
  }
});
