



document.querySelectorAll('.container').forEach(container => {
  const languageSelect = container.querySelector('.languageSelect');
  const fileNameElem = container.querySelector('.fileName');
  const codeWrapper = container.querySelector('.codeWrapper');
  const consoleDiv = container.querySelector('.console');

  const defaultCodes = {
    python: container.dataset.defaultPython,
    bash: container.dataset.defaultBash,
    javascript: container.dataset.defaultJavascript,
    c: container.dataset.defaultC,
    html: container.dataset.defaultHtml,
    java: container.dataset.defaultJava
  };

  const fileNames = {
    python: 'script.py',
    bash: 'script.sh',
    javascript: 'script.js',
    c: 'program.c',
    html: 'index.html',
    java: 'Main.java'
  };

  languageSelect.addEventListener('change', () => {
    const lang = languageSelect.value;
    const newCode = defaultCodes[lang] || '';

    // Update file name
    fileNameElem.textContent = fileNames[lang] || 'script.txt';

    // Update code block
    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    const code = document.createElement('code');
    code.className = `language-${lang} codeBlock`;
    code.textContent = newCode;
    pre.appendChild(code);

    codeWrapper.innerHTML = '';
    codeWrapper.appendChild(pre);
    Prism.highlightElement(code);

    consoleDiv.textContent = 'Console output will appear here...';
  });
});




function getDefaultCodes(container) {
  return {
    python: container.dataset.defaultPython || `def greet():\n    print("Hello, dark world!")`,
    javascript: `console.log("Hello, dark world!");`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, dark world!\\n");\n    return 0;\n}`,
    html: `<h1>Hello, dark world!</h1>`,
    java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, dark world!");\n  }\n}`,
    bash: container.dataset.defaultBash || `#!/bin/bash\n\necho "Hello, world!"`
  };
}

// Enable auto close pairs for textarea
function enableAutoClosePairs(textarea) {
  textarea.addEventListener('keydown', (e) => {
    const pairs = {'(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`'};
    const openChar = e.key;
    if (pairs[openChar]) {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const newVal = val.substring(0, start) + openChar + pairs[openChar] + val.substring(end);
      textarea.value = newVal;
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

document.querySelectorAll('.container').forEach(container => {
  const copyBtn = container.querySelector('.copyBtn');
  const editBtn = container.querySelector('.editBtn');
  const saveBtn = container.querySelector('.saveBtn');
  const cancelBtn = container.querySelector('.cancelBtn');
  const runBtn = container.querySelector('.runBtn');
  const languageSelect = container.querySelector('.languageSelect');
  const codeWrapper = container.querySelector('.codeWrapper');
  const fileNameElem = container.querySelector('.fileName');
  const consoleDiv = container.querySelector('.console');
  let codeBlock = container.querySelector('.codeBlock');

  let originalCode = codeBlock.innerText.trim();
  let isEditing = false;

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
      case 'bash': return 'script.sh';
      case 'terminal': return 'Terminal';
      default: return 'terminal';
    }
  }

  function updateCodeBlock(lang, code) {
    codeWrapper.innerHTML = '';
    const pre = document.createElement('pre');
    pre.className = 'line-numbers';
    const codeElem = document.createElement('code');
    codeElem.className = `language-${lang} codeBlock`;
    codeElem.textContent = code || defaultCodes[lang] || '';
    pre.appendChild(codeElem);
    codeWrapper.appendChild(pre);
    Prism.highlightElement(codeElem);
    codeBlock = codeElem; // update reference
  }

  function toggleButtons(editing) {
    editBtn.style.display = editing ? 'none' : 'inline-block';
    saveBtn.style.display = editing ? 'inline-block' : 'none';
    cancelBtn.style.display = editing ? 'inline-block' : 'none';
  }

  function init() {
    // Set filename based on language
    const lang = getLanguage();
    fileNameElem.textContent = getFileName(lang);

    // If code block is empty, load default
    if (!codeBlock.innerText.trim()) {
      updateCodeBlock(lang, defaultCodes[lang]);
      originalCode = defaultCodes[lang];
    }
  }

  // Initialize on load for each container
  init();

  languageSelect.addEventListener('change', () => {
    if (isEditing) {
      if (!confirm("Changing language will discard unsaved changes. Continue?")) {
        languageSelect.value = getLanguage();
        return;
      }
      isEditing = false;
      toggleButtons(false);
    }
    const lang = getLanguage();
    fileNameElem.textContent = getFileName(lang);
    updateCodeBlock(lang, defaultCodes[lang]);
    originalCode = defaultCodes[lang];
    consoleDiv.textContent = 'Console output will appear here...';
  });

  copyBtn.addEventListener('click', () => {
    let codeText = isEditing ? codeWrapper.querySelector('textarea').value : codeBlock.innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      const copyMsg = container.querySelector('.copyMessage');
      copyMsg.style.display = 'inline';
      setTimeout(() => copyMsg.style.display = 'none', 2000);
    }).catch(() => {
      const copyMsg = container.querySelector('.copyMessage');
      copyMsg.textContent = 'Failed to copy!';
      copyMsg.style.display = 'inline';
      setTimeout(() => {
        copyMsg.textContent = 'Copied!';
        copyMsg.style.display = 'visible';
      }, 2000);
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

    const lang = getLanguage();
    updateCodeBlock(lang, newCode);

    isEditing = false;
    toggleButtons(false);
    consoleDiv.textContent = 'Console output will appear here...';
  });

  cancelBtn.addEventListener('click', () => {
    if (!isEditing) return;

    const lang = getLanguage();
    updateCodeBlock(lang, originalCode);

    isEditing = false;
    toggleButtons(false);
  });

  runBtn.addEventListener('click', () => {
    if (isEditing) {
      alert("Please save your code before running it.");
      return;
    }
    const lang = getLanguage();
    const codeText = codeBlock.innerText;

    if (lang === 'javascript') {
      try {
        const logs = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
          originalConsoleLog.apply(console, args);
        };
        new Function(codeText)();
        console.log = originalConsoleLog;
        consoleDiv.textContent = logs.length ? logs.join('\n') : 'Code executed. No output.';
      } catch (err) {
        consoleDiv.textContent = 'Error: ' + err.message;
      }
    } else {
      consoleDiv.textContent = `Running ${lang.toUpperCase()} code is not supported in this demo.\n\nYour code:\n\n${codeText}`;
    }
  });

});





