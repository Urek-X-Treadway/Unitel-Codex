const copyBtn = document.getElementById('copyBtn');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const runBtn = document.getElementById('runBtn');
const codeWrapper = document.getElementById('codeWrapper');
const fileNameElem = document.getElementById('fileName');
const languageSelect = document.getElementById('languageSelect');
const consoleDiv = document.getElementById('console');

let originalCode = '';
let isEditing = false;

const defaultCodes = {
  python: `def greet():
    print("Hello, dark world!")`,
  javascript: `function greet() {
  console.log("Hello, dark world!");
}
greet();`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, dark world!\\n");
    return 0;
}`,
  html: `<!DOCTYPE html>
<html>
<head><title>Hello</title></head>
<body>
  <h1>Hello, dark world!</h1>
</body>
</html>`,
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, dark world!");
  }
}`
};

function getLanguage() {
  return languageSelect.value;
}

function getFileName(lang) {
  switch(lang) {
    case 'python': return 'script.py';
    case 'javascript': return 'script.js';
    case 'c': return 'program.c';
    case 'html': return 'index.html';
    case 'java': return 'Main.java';
    default: return 'script.txt';
  }
}

function initCode() {
  const lang = getLanguage();
  fileNameElem.textContent = getFileName(lang);

  const pre = document.createElement('pre');
  pre.className = 'line-numbers';
  const code = document.createElement('code');
  code.className = `language-${lang}`;
  code.id = 'codeBlock';
  code.textContent = defaultCodes[lang] || '';
  pre.appendChild(code);

  codeWrapper.innerHTML = '';
  codeWrapper.appendChild(pre);
  Prism.highlightElement(code);

  consoleDiv.textContent = 'Console output will appear here...';
}

function enableAutoClosePairs(textarea) {
  textarea.addEventListener('keydown', (e) => {
    const pairs = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };
    const openChar = e.key;
    if (pairs[openChar]) {
      e.preventDefault();

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      const newValue = value.substring(0, start) + openChar + pairs[openChar] + value.substring(end);
      textarea.value = newValue;

      textarea.selectionStart = textarea.selectionEnd = start + 1;
    } else if (e.key === 'Backspace') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end && start > 0) {
        const val = textarea.value;
        const prevChar = val[start - 1];
        const nextChar = val[start];
        if (pairs[prevChar] === nextChar) {
          e.preventDefault();
          textarea.value = val.slice(0, start - 1) + val.slice(start + 1);
          textarea.selectionStart = textarea.selectionEnd = start - 1;
        }
      }
    }
  });
}

copyBtn.addEventListener('click', () => {
  let codeText = '';
  if (isEditing) {
    const textarea = document.getElementById('codeBlock');
    codeText = textarea.value;
  } else {
    const codeElem = document.getElementById('codeBlock');
    codeText = codeElem.innerText;
  }
  navigator.clipboard.writeText(codeText).then(() => {
    const copyMsg = document.getElementById('copyMessage');
    copyMsg.classList.add('visible');
    setTimeout(() => {
      copyMsg.classList.remove('visible');
    }, 2000);
  }).catch(() => {
    const copyMsg = document.getElementById('copyMessage');
    copyMsg.textContent = 'Failed to copy!';
    copyMsg.classList.add('visible');
    setTimeout(() => {
      copyMsg.classList.remove('visible');
      copyMsg.textContent = 'Copied!'; // reset text
    }, 2000);
  });
});

editBtn.addEventListener('click', () => {
  if (isEditing) return;
  const codeElem = document.getElementById('codeBlock');
  originalCode = codeElem.innerText;

  const textarea = document.createElement('textarea');
  textarea.id = 'codeBlock';
  textarea.value = originalCode;

  codeWrapper.innerHTML = '';
  codeWrapper.appendChild(textarea);

  enableAutoClosePairs(textarea);

  toggleButtons(true);
  isEditing = true;
});

saveBtn.addEventListener('click', () => {
  if (!isEditing) return;
  const textarea = document.getElementById('codeBlock');
  const newCode = textarea.value;

  const lang = getLanguage();
  const pre = document.createElement('pre');
  pre.className = 'line-numbers';
  const code = document.createElement('code');
  code.className = `language-${lang}`;
  code.id = 'codeBlock';
  code.textContent = newCode;

  codeWrapper.innerHTML = '';
  codeWrapper.appendChild(pre);
  pre.appendChild(code);

  Prism.highlightElement(code);

  toggleButtons(false);
  isEditing = false;

  consoleDiv.textContent = 'Console output will appear here...';
});

cancelBtn.addEventListener('click', () => {
  if (!isEditing) return;

  const lang = getLanguage();
  const pre = document.createElement('pre');
  pre.className = 'line-numbers';
  const code = document.createElement('code');
  code.className = `language-${lang}`;
  code.id = 'codeBlock';
  code.textContent = originalCode;

  codeWrapper.innerHTML = '';
  codeWrapper.appendChild(pre);
  pre.appendChild(code);

  Prism.highlightElement(code);

  toggleButtons(false);
  isEditing = false;
});

languageSelect.addEventListener('change', () => {
  if (isEditing) {
    if (!confirm("Changing language will discard unsaved changes. Continue?")) {
      languageSelect.value = getLanguage(); // revert select
      return;
    }
    isEditing = false;
    toggleButtons(false);
  }
  initCode();
});

function toggleButtons(editing) {
  editBtn.style.display = editing ? 'none' : 'inline-block';
  saveBtn.style.display = editing ? 'inline-block' : 'none';
  cancelBtn.style.display = editing ? 'inline-block' : 'none';
}

// Run button logic
runBtn.addEventListener('click', () => {
  consoleDiv.textContent = ''; // clear previous output
  const lang = getLanguage();

  if (isEditing) {
    alert("Please save your changes before running the code.");
    return;
  }

  const codeText = document.getElementById('codeBlock').innerText;

  if (lang === 'javascript') {
    try {
      // Capture console.log calls
      const logs = [];
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalConsoleLog.apply(console, args);
      };
      // Run user JS code
      new Function(codeText)();
      console.log = originalConsoleLog;

      consoleDiv.textContent = logs.length ? logs.join('\n') : 'Code executed. No output.';
    } catch (err) {
      consoleDiv.textContent = 'Error: ' + err.message;
    }
  } else {
    // For other languages, no execution engine, just show placeholder
    consoleDiv.textContent = `Running ${lang.toUpperCase()} code is not supported in this demo.\n\nYour code:\n\n${codeText}`;
  }
});




let blockCounter = 0;

function addCodeBlock() {
  blockCounter++;

  const lang = "python";
  const fileName = `script${blockCounter}.py`;
  const defaultCode = `def greet():\n    print("Hello from block ${blockCounter}!")`;

  const container = document.getElementById('codeBlocksContainer');

  const block = document.createElement('div');
  block.className = 'container';
  block.innerHTML = `
    <div class="code-header">
      <span class="file-name">${fileName}</span>
      <div class="code-actions">
        <button class="copyBtn">Copy</button>
        <span class="copyMessage">Copied!</span>
        <button class="editBtn">Edit</button>
        <button class="saveBtn" style="display:none;">Save</button>
        <button class="cancelBtn" style="display:none;">Cancel</button>
        <button class="runBtn">Run</button>
      </div>
    </div>
    <div class="codeWrapper">
      <pre class="line-numbers"><code class="language-python codeBlock">${defaultCode}</code></pre>
    </div>
    <div class="console">Console output will appear here...</div>
  `;

  container.appendChild(block);

  Prism.highlightAllUnder(block);
  bindEventsToBlock(block);
}






function bindEventsToBlock(block) {
  const codeWrapper = block.querySelector('.codeWrapper');
  const copyBtn = block.querySelector('.copyBtn');
  const editBtn = block.querySelector('.editBtn');
  const saveBtn = block.querySelector('.saveBtn');
  const cancelBtn = block.querySelector('.cancelBtn');
  const runBtn = block.querySelector('.runBtn');
  const copyMessage = block.querySelector('.copyMessage');
  const consoleDiv = block.querySelector('.console');
  const codeBlock = block.querySelector('.codeBlock');

  let originalCode = codeBlock.innerText;
  let isEditing = false;

  function toggleButtons(editing) {
    editBtn.style.display = editing ? 'none' : 'inline-block';
    saveBtn.style.display = editing ? 'inline-block' : 'none';
    cancelBtn.style.display = editing ? 'inline-block' : 'none';
  }

  copyBtn.addEventListener('click', () => {
    let codeText = isEditing ? block.querySelector('textarea').value : codeBlock.innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      copyMessage.classList.add('visible');
      setTimeout(() => copyMessage.classList.remove('visible'), 2000);
    });
  });

  editBtn.addEventListener('click', () => {
    if (isEditing) return;
    originalCode = codeBlock.innerText;

    const textarea = document.createElement('textarea');
    textarea.className = 'codeBlock';
    textarea.value = originalCode;
    enableAutoClosePairs(textarea);

    codeWrapper.innerHTML = '';
    codeWrapper.appendChild(textarea);

    isEditing = true;
    toggleButtons(true);
  });

  saveBtn.addEventListener('click', () => {
    if (!isEditing) return;
    const textarea = codeWrapper.querySelector('textarea');
    const newCode = textarea.value;

    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    const code = document.createElement('code');
    code.className = 'language-python codeBlock';
    code.textContent = newCode;

    pre.appendChild(code);
    codeWrapper.innerHTML = '';
    codeWrapper.appendChild(pre);

    Prism.highlightElement(code);
    isEditing = false;
    toggleButtons(false);
    consoleDiv.textContent = 'Console output will appear here...';
  });

  cancelBtn.addEventListener('click', () => {
    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    const code = document.createElement('code');
    code.className = 'language-python codeBlock';
    code.textContent = originalCode;

    pre.appendChild(code);
    codeWrapper.innerHTML = '';
    codeWrapper.appendChild(pre);

    Prism.highlightElement(code);
    isEditing = false;
    toggleButtons(false);
  });

  runBtn.addEventListener('click', () => {
    if (isEditing) {
      alert("Please save your code before running it.");
      return;
    }
    const codeText = codeBlock.innerText;
    consoleDiv.textContent = `Running PYTHON code is not supported in this demo.\n\nYour code:\n\n${codeText}`;
  });
}










// Initialize on load
initCode();





