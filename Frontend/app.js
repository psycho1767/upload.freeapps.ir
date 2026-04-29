const enc = new TextEncoder();
const dec = new TextDecoder();

const getKey = async (password) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
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

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    buffer,
  );

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
  navigator.clipboard.writeText(text);
};
function resetUploadUI() {
  const progressBar = document.getElementById("progressBar");
  const speedDisplay = document.getElementById("speedDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const uploadBtn = document.getElementById("uploadBtn");

  // ریست کردن مقادیر
  progressBar.style.width = "0%";
  progressBar.textContent = "0%";
  speedDisplay.textContent = "0 KB/s";
  timeDisplay.textContent = "00:00";

  // فعال کردن دوباره دکمه آپلود
  if (uploadBtn) {
    uploadBtn.disabled = false;
  }
}

const showDownloadPopup = (data) => {
  const popup = document.createElement("div");
  const popupDiv = document.createElement("div");
  popupDiv.className = "popup";

  const p = document.createElement("p");
  p.textContent = data.originalName;
  popupDiv.appendChild(p);

  if (data.passwordProtected) {
    const inputBox = document.createElement("div");
    inputBox.id = "inputBox";
    const inputHead = document.createElement("span");
    inputHead.textContent = "Password :";

    const input = document.createElement("input");
    input.type = "password";
    input.id = "dlPass";
    inputBox.appendChild(inputHead);
    inputBox.appendChild(input);
    popupDiv.appendChild(inputBox);
  }

  const progressContainer = document.createElement("div");
  progressContainer.id = "downloadProgressContainer";
  progressContainer.style.width = "100%";
  progressContainer.style.height = "5px";
  progressContainer.style.backgroundColor = "#e0e0e0";
  progressContainer.style.marginTop = "10px";
  progressContainer.style.display = "none";

  const progressBar = document.createElement("div");
  progressBar.id = "downloadProgressBar";
  progressBar.style.width = "0%";
  progressBar.style.height = "100%";
  progressBar.style.backgroundColor = "#4caf50";
  progressBar.style.transition = "width 0.2s ease";

  progressContainer.appendChild(progressBar);
  popupDiv.appendChild(progressContainer);

  const statusText = document.createElement("p");
  statusText.id = "downloadStatusText";
  statusText.style.fontSize = "12px";
  statusText.style.color = "#666";
  statusText.style.marginTop = "5px";
  statusText.style.height = "15px";
  popupDiv.appendChild(statusText);

  const fatherEl = document.createElement("div");
  fatherEl.id = "fatherElement";

  const btn = document.createElement("button");
  btn.id = "dlBtn";
  btn.textContent = "Download";

  const closeBtn = document.createElement("button");
  closeBtn.id = "closeBtn";
  closeBtn.textContent = "Close";
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
  document.getElementById("result").style.display = "flex";
  document.getElementById("result").appendChild(popup);

  document.getElementById("dlBtn").onclick = async () => {
    const pass = document.getElementById("dlPass")?.value;
    progressContainer.style.display = "block";
    progressBar.style.width = "0%";
    statusText.textContent = "Starting download...";

    try {
      const res = await fetch("/api/file/" + data.name);
      if (!res.ok) {
        alert("error");
        return;
      }

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

        const formatSpeed = (bytes) => {
          if (bytes < 1024) return bytes + " B/s";
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB/s";
          return (bytes / (1024 * 1024)).toFixed(2) + " MB/s";
        };

        const formatTime = (seconds) => {
          if (seconds < 60) return Math.ceil(seconds) + "s";
          return Math.floor(seconds / 60) + "m " + Math.ceil(seconds % 60) + "s";
        };

        if (totalSize > 0) {
          const percent = (receivedSize / totalSize) * 100;
          progressBar.style.width = percent + "%";
          statusText.textContent = `${formatSpeed(speed)} | ETA: ${formatTime(eta)}`;
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

      const blob = new Blob([finalBuffer]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = data.originalName;
      a.click();

      statusText.textContent = "Download Complete";
      progressBar.style.backgroundColor = "#4caf50";

    } catch (err) {
      alert("wrong password or download failed");
      statusText.textContent = "Error";
      progressBar.style.backgroundColor = "#f44336";
    }
  };
};


window.onload = async () => {
  const params = new URLSearchParams(location.search);
  const file = params.get("file");

  if (!file) return;

  const res = await fetch("/api/info/" + file);
  if (!res.ok) return;

  const data = await res.json();

  showDownloadPopup(data);
};

document.getElementById("uploadBtn").onclick = async () => {
  const fileInput = document.getElementById("uploadFile");
  const file = fileInput.files[0];
  const pass = document.getElementById("passwordUpload").value;
  const hours = document.getElementById("expireHours").value;

  if (!file) return;

  const progressBar = document.getElementById("progressBar");
  const speedDisplay = document.getElementById("speedDisplay");
  const timeDisplay = document.getElementById("timeDisplay");
  const uploadBtn = document.getElementById("uploadBtn");

  uploadBtn.disabled = true;
  progressBar.style.width = "0%";
  progressBar.textContent = "0%";
  speedDisplay.textContent = "0 KB/s";
  timeDisplay.textContent = "00:00";

  let finalFileBuffer;

  try {
    if (pass) {
      finalFileBuffer = await encryptFile(file, pass);
    } else {
      finalFileBuffer = new Uint8Array(await file.arrayBuffer());
    }
  } catch (err) {
    alert("خطا در پردازش فایل");
    uploadBtn.disabled = false;
    return;
  }

  const totalSize = finalFileBuffer.length;
  let loadedSize = 0;
  let startTime = Date.now();

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percentComplete = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = percentComplete + "%";
      progressBar.textContent = percentComplete + "%";

      const now = Date.now();
      const timeDiff = (now - startTime) / 1000;

      if (timeDiff > 0) {
        const speedBytes = e.loaded / timeDiff;
        speedDisplay.textContent = formatBytes(speedBytes) + "/s";

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
        showResultPopup(
          response.originalName,
          pass,
          response.link,
          response.expire_in_hours,
        );
        fileInput.value = "";
      } else {
        alert("خطا در آپلود");
      }
    } else {
      alert("خطا در ارتباط");
    }
    uploadBtn.disabled = false;
  });

  xhr.addEventListener("error", () => {
    alert("خطا در شبکه");
    uploadBtn.disabled = false;
  });

  const blob = new Blob([finalFileBuffer], { type: file.type });
  const fileToSend = new File([blob], file.name, { type: file.type });

  const form = new FormData();
  form.append("file", fileToSend);
  form.append("expire_in_hours", hours || 1);
  form.append("passwordProtected", pass ? "true" : "false");

  startTime = Date.now();
  xhr.open("POST", "/api/upload");
  xhr.send(form);
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

document.getElementById("downloadBtn").onclick = async () => {
  const name = document.getElementById("downloadName").value;
  if (!name) return;

  const res = await fetch("/api/file/" + name);

  if (!res.ok) {
    document.getElementById("status").innerText = "not found";
    return;
  }

  const progressBar = document.getElementById("progressContainer");
  if (progressBar) progressBar.style.display = "block";

  const totalSize = parseInt(res.headers.get("Content-Length")) || 0;
  let receivedSize = 0;

  const reader = res.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    receivedSize += value.length;

    if (progressBar && totalSize > 0) {
      const percent = (receivedSize / totalSize) * 100;
      progressBar.style.width = percent + "%";
    }
  }

  // ترکیب تمام قطعات در یک آرایه یکپارچه
  const fullBuffer = new Uint8Array(receivedSize);
  let offset = 0;
  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.length;
  }

  const buffer = fullBuffer.buffer; // تبدیل به ArrayBuffer برای رمزگشایی

  const pass = prompt("Enter password (if any)");
  let finalBuffer;

  try {
    if (pass) {
      finalBuffer = await decryptFile(buffer, pass);
    } else {
      finalBuffer = buffer;
    }

    const disposition = res.headers.get("Content-Disposition");
    let fileName = name;

    if (disposition) {
      const match = disposition.match(/filename="(.+)"/);
      if (match) fileName = match[1];
    }

    // نکته: در کد قبلی تو نوشته بودی decrypted ولی متغیر finalBuffer بود
    const blob = new Blob([finalBuffer]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();

    // مخفی کردن نوار بعد از دانلود
    if (progressBar) progressBar.style.display = "none";
  } catch (err) {
    alert("wrong password");
    if (progressBar) progressBar.style.display = "none";
  }
};

const showResultPopup = (name, pass, link, hours) => {
  const firstdiv = document.createElement("div");
  const popupbox = document.createElement("div");
  popupbox.className = "popupbox";
  popupbox.id = "popupbox";
  const container = document.createElement("div");
  container.className = "popup";

  const row0 = document.createElement("div");
  row0.id = "row0";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.onclick = () => {
    resetUploadUI();
    document.getElementById("popupbox").remove();
  };
  svg.setAttribute("class", "CloseSvg");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("height", "24px");
  svg.setAttribute("viewBox", "0 -960 960 960");
  svg.setAttribute("width", "24px");
  // svg.setAttribute("fill", "#FF0000");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z",
  );
  svg.appendChild(path);
  row0.appendChild(svg);

  const row1 = document.createElement("p");
  row1.textContent = `Name: ${name}`;
  row1.style.marginBottom = "20px";
  // const btn1 = document.createElement("button");
  // btn1.textContent = "copy";
  // btn1.onclick = () => (window.copyText = copyText(name));
  // row1.appendChild(btn1);

  const row2 = document.createElement("p");
  row2.textContent = `Password: ${pass || "none"}`;
  const btn2 = document.createElement("button");
  btn2.textContent = "copy";
  btn2.onclick = () => (window.copyText = copyText(pass));
  row2.appendChild(btn2);

  const row3 = document.createElement("p");
  row3.textContent = location.origin + link;
  const btn3 = document.createElement("button");
  btn3.textContent = "copy";
  btn3.onclick = () => (window.copyText = copyText(location.origin + link));
  row3.appendChild(btn3);

  const timer = document.createElement("p");
  timer.id = "timer";

  container.appendChild(row0);
  container.appendChild(row1);
  container.appendChild(row2);
  container.appendChild(row3);
  container.appendChild(timer);
  popupbox.appendChild(container);
  firstdiv.appendChild(popupbox);

  document.body.appendChild(firstdiv);

  let time = hours * 3600;

  const interval = setInterval(() => {
    time--;
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;

    firstdiv.querySelector("#timer").innerText = `${h}h ${m}m ${s}s`;

    if (time <= 0) clearInterval(interval);
  }, 1000);
};

async function updateStorageUI() {
  try {
    const response = await fetch("/api/storage-status");
    if (!response.ok) throw new Error("Failed to fetch storage status");

    const data = await response.json();
    const { used, remaining, total } = data;

    const formatBytes = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const usedGB = formatBytes(used);
    const remainingGB = formatBytes(remaining);
    const totalGB = formatBytes(total);

    const percentageUsed = (used / total) * 100;
    const percentageRemaining = 100 - percentageUsed;

    document.getElementById("storageText").innerText =
      `${remainingGB} from ${totalGB}`;

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
