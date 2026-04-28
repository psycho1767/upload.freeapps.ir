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

const showDownloadPopup = (data) => {
  const popup = document.createElement("div");

  popup.innerHTML = `
    <div class="popup">
      <p>${data.originalName}</p>
      ${data.passwordProtected ? `<input type="password" id="dlPass">` : ""}
      <button id="dlBtn">Download</button>
    </div>
  `;

  // document.body.appendChild(popup);
  document.getElementById("result").appendChild(popup);

  document.getElementById("dlBtn").onclick = async () => {
    const pass = document.getElementById("dlPass")?.value;

    const res = await fetch("/api/file/" + data.name);
    if (!res.ok) return alert("error");

    const buffer = await res.arrayBuffer();

    let finalBuffer;

    try {
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
    } catch {
      alert("wrong password");
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
  const file = document.getElementById("uploadFile").files[0];
  const pass = document.getElementById("passwordUpload").value;
  const hours = document.getElementById("expireHours").value;

  if (!file) return;

  let finalFile;

  if (pass) {
    finalFile = await encryptFile(file, pass);
  } else {
    finalFile = new Uint8Array(await file.arrayBuffer());
  }

  const form = new FormData();
  form.append("file", new File([finalFile], file.name));
  form.append("expire_in_hours", hours || 24);
  form.append("passwordProtected", pass ? "true" : "false");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (data.success) {
    showResultPopup(data.name, pass, data.link, data.expire_in_hours);
  }
};

document.getElementById("downloadBtn").onclick = async () => {
  const name = document.getElementById("downloadName").value;
  if (!name) return;

  const res = await fetch("/api/file/" + name);

  if (!res.ok) {
    document.getElementById("status").innerText = "not found";
    return;
  }

  const buffer = await res.arrayBuffer();

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

    const blob = new Blob([decrypted]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  } catch {
    alert("wrong password");
  }
};

const showResultPopup = (name, pass, link, hours) => {
  const popup = document.createElement("div");
  const container = document.createElement("div");
  container.className = "popup";

  const row1 = document.createElement("p");
  row1.textContent = `Name: ${name}`;
  const btn1 = document.createElement("button");
  btn1.textContent = "copy";
  btn1.onclick = () => (window.copyText = copyText(name));
  row1.appendChild(btn1);

  const row2 = document.createElement("p");
  row2.textContent = `Password: ${pass || "none"}`;
  const btn2 = document.createElement("button");
  btn2.textContent = "copy";
  btn2.onclick = () => (window.copyText = copyText(pass));
  row2.appendChild(btn2);

  const row3 = document.createElement("p");
  row3.textContent = `Link: ${location.origin + link}`;
  const btn3 = document.createElement("button");
  btn3.textContent = "copy";
  btn3.onclick = () => (window.copyText = copyText(location.origin + link));
  row3.appendChild(btn3);

  const timer = document.createElement("p");
  timer.id = "timer";

  container.appendChild(row1);
  container.appendChild(row2);
  container.appendChild(row3);
  container.appendChild(timer);
  popup.appendChild(container);

  document.body.appendChild(popup);

  let time = hours * 3600;

  const interval = setInterval(() => {
    time--;
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;

    popup.querySelector("#timer").innerText = `${h}h ${m}m ${s}s`;

    if (time <= 0) clearInterval(interval);
  }, 1000);
};
