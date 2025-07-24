🧠 eval() and exec() in Python

# <span style="color: rgb(224, 62, 45);">🧠 `eval()` and `exec()` in Python</span>

## <span style="color: rgb(194, 224, 244);">⚙️ <span style="color: rgb(224, 62, 45);">What They Are</span></span>

| <span style="color: rgb(224, 62, 45);">Function</span> | <span style="color: rgb(224, 62, 45);">Purpose</span> |
| --- | --- |
| <span style="color: rgb(194, 224, 244);">`eval()`</span> | <span style="color: rgb(194, 224, 244);">Evaluates a string as a Python expression and returns the result.</span> |
| <span style="color: rgb(194, 224, 244);">`exec()`</span> | <span style="color: rgb(194, 224, 244);">Executes a string as Python code, including full statements (loops, functions, etc.).</span> |

* * *

## <span style="color: rgb(194, 224, 244);">🔍 <span style="color: rgb(224, 62, 45);">`eval()` – Evaluate Expressions</span></span>

### <span style="color: rgb(224, 62, 45);">✅ Syntax:</span>

```python
eval(expression[, globals[, locals]])
```

### <span style="color: rgb(224, 62, 45);">✅ Example:</span>

```python
x = 10
result = eval("x + 5")
print(result)  # → 15
```

- <span style="color: rgb(194, 224, 244);">`eval()` only works with expressions (something that returns a value).</span>
    
- <span style="color: rgb(194, 224, 244);">You can’t use loops, function defs, assignments, etc. with `eval()`.</span>
    

### <span style="color: rgb(224, 62, 45);">🔒 Safe version with restricted scope:</span>

```python
safe_result = eval("2 + 2", {"__builtins__": {}})
print(safe_result)  # → 4
```

* * *

## <span style="color: rgb(194, 224, 244);">🛠️ <span style="color: rgb(224, 62, 45);">`exec()` – Execute Full Python Code</span></span>

### <span style="color: rgb(224, 62, 45);">✅ Syntax:</span>

```python
exec(code[, globals[, locals]])
```

### <span style="color: rgb(224, 62, 45);">✅ Example:</span>

```python
code = """
for i in range(3):
    print("Hello", i)
"""
exec(code)
```

- <span style="color: rgb(194, 224, 244);">`exec()` supports multi-line code, including loops, functions, classes, etc.</span>
    
- <span style="color: rgb(194, 224, 244);">It doesn’t return a value — it just runs the code.</span>
    

### <span style="color: rgb(224, 62, 45);">➕ Example with dynamic variable creation:</span>

```python
exec("x = 5")
print(x)  # → 5
```

* * *

## <span style="color: rgb(224, 62, 45);">🧨 Key Differences</span>

| <span style="color: rgb(224, 62, 45);">Feature</span> | <span style="color: rgb(194, 224, 244);">`eval()`</span> | <span style="color: rgb(194, 224, 244);">`exec()`</span> |
| --- | --- | --- |
| <span style="color: rgb(194, 224, 244);">Returns a value?</span> | <span style="color: rgb(194, 224, 244);">✅ Yes (returns result)</span> | <span style="color: rgb(194, 224, 244);">❌ No (returns `None`)</span> |
| <span style="color: rgb(194, 224, 244);">Handles expressions</span> | <span style="color: rgb(194, 224, 244);">✅ Yes</span> | <span style="color: rgb(194, 224, 244);">✅ Yes</span> |
| <span style="color: rgb(194, 224, 244);">Handles statements</span> | <span style="color: rgb(194, 224, 244);">❌ No</span> | <span style="color: rgb(194, 224, 244);">✅ Yes (full code supported)</span> |
| <span style="color: rgb(194, 224, 244);">Use case</span> | <span style="color: rgb(194, 224, 244);">Math, simple expressions</span> | <span style="color: rgb(194, 224, 244);">Full dynamic scripting</span> |

* * *

## <span style="color: rgb(224, 62, 45);">⚠️ WARNING – Security Risk</span>

<span style="color: rgb(194, 224, 244);">Both `eval()` and `exec()` are dangerous if used with untrusted input (e.g., from a user, file, or web).</span>

```python
# BAD: Never do this with user input!
user_input = "os.system('rm -rf /')"
eval(user_input)  # Dangerous
```

<span style="color: rgb(194, 224, 244);">If you need dynamic behavior, always validate input or use safe alternatives (e.g., `ast.literal_eval()`).</span>

* * *

## <span style="color: rgb(224, 62, 45);">✅ Safe Alternative to `eval()`:</span>

<span style="color: rgb(194, 224, 244);">Use `ast.literal_eval()` to safely evaluate strings containing only Python literals (numbers, strings, lists, dicts):</span>

```python
import ast

safe_input = "[1, 2, 3]"
result = ast.literal_eval(safe_input)
print(result)  # → [1, 2, 3]
```

* * *

<span style="color: rgb(194, 224, 244);">Let me know if you want real-world use cases or how this ties into ethical hacking (like building payload loaders or script interpreters).</span>

Absolutely — let’s break this down and **elaborate** on *why* using `eval()` and `exec()` with **untrusted input** is dangerous, what kind of attacks can happen, and how to avoid them.

* * *

## ⚠️ Why `eval()` / `exec()` Are Dangerous with Untrusted Input

### 🔥 Problem:

When you use `eval()` or `exec()` with input that comes from **outside your code** — like a user form, a network request, or even a file — you’re **giving the user permission to run arbitrary Python code** on your machine.

> This can turn your program into an **attack surface**, letting someone **steal data**, **delete files**, **install malware**, or even **take control of the entire system**.

* * *

## 🧨 Real-World Attack Examples

### 🧱 1. **Command Execution**

```python
user_input = "__import__('os').system('rm -rf /')"
eval(user_input)
```

- This would **wipe your entire filesystem** on Linux/macOS.
    
- Equivalent to giving a stranger root access.
    

* * *

### 🧱 2. **Stealing Data**

```python
user_input = "__import__('os').popen('cat /etc/passwd').read()"
print(eval(user_input))
```

- This prints sensitive system information.
    
- Could be used to extract credentials, config files, tokens, etc.
    

* * *

### 🧱 3. **Bypass Security Logic**

```python
# Assume you have something like:
allowed = eval(user_input)  # expecting something like "2 + 2"

# Attacker sends:
user_input = "__import__('builtins').exec('open(\"backdoor.py\", \"w\").write(\"...\")')"
```

- They just **wrote and executed their own malware** using your app.

* * *

## 🔍 Why This Happens

Python is a **powerful scripting language**, and functions like `eval()` and `exec()` basically act as **live interpreters** of code — they turn strings into *executable instructions*. So:

- `"2 + 2"` becomes a math operation
    
- `"os.system('ls')"` becomes a system command
    
- `"open('secret.txt').read()"` becomes file access
    

And so on.

* * *

## ✅ How to Protect Your Code

### 1\. **NEVER Use `eval()` or `exec()` with User Input**

```python
# BAD
eval(user_input)
exec(user_input)
```

* * *

### 2\. **Use `ast.literal_eval()` for Safe Literals**

```python
import ast

# Safe: Only evaluates literals like numbers, strings, lists, dicts, etc.
value = ast.literal_eval("[1, 2, 3]")  # ✅ Safe
```

* * *

### 3\. **Use Explicit Parsers**

Instead of evaluating strings as code, write **your own parser** or use **safe libraries** to process structured data (like JSON, YAML, etc.).

```python
import json

user_data = '{"username": "admin"}'
parsed = json.loads(user_data)  # ✅ Safe
```

* * *

## 💀 Worst Case: Remote Code Execution (RCE)

If your app accepts Python code via a web interface, and runs `eval()` or `exec()` on it, you’re wide open to **Remote Code Execution** — one of the **most dangerous vulnerabilities**.

This is why Python exploit payloads (like in CTFs or pentests) often try to find a way to get `eval()` access — it’s game over if they succeed.

* * *

## ✅ Bottom Line:

- **`eval()`/`exec()` = dangerous unless you control every single character of the string.**
    
- If you’re taking input from **any external source**, do **not** pass it into those functions.
    
- Use alternatives like `ast.literal_eval()`, `json.loads()`, or write controlled logic.
    

* * *

Want to see how this connects to payload writing or how attackers slip malicious input through `eval()` calls in vulnerable Python web apps?

Exactly — **you nailed it.**

* * *

### ✅ `eval()` is **safe** when:

You’re using it **only with trusted, internal values** — i.e., your app *generates the input itself*, and the user **cannot alter the string passed into `eval()`**.

#### Example: Safe Calculator with Predefined Buttons

```python
expression = "2 + 3 * 5"   # internally generated string
result = eval(expression)  # ✅ safe
print(result)
```

No external input. No danger. You’re just using `eval()` as a math engine.

* * *

### ⚠️ `eval()` becomes **dangerous** when:

The **user** can influence what’s being passed in, like this:

```python
user_input = input("Enter expression: ")  # user can enter *anything*
result = eval(user_input)  # ❌ DANGEROUS
```

Now they could enter:

```python
__import__('os').system('rm -rf /')

```

Boom. Game over.

* * *

### 🧠 Rule of Thumb:

> ❗ **If the user can type it, they can hack it.**
> 
> ✅ If **your code controls the string**, `eval()` is *relatively safe* (still avoid it unless needed).

* * *

Let me know if you want to see how to **build a safe calculator** with or without `eval()`, or how to write a **sandboxed eval-like function** that filters allowed characters.

Great question — let’s break it down.

* * *

### 🧪 Code:

```python
__import__('os').system('getcwd')
```

### ❌ No, it **doesn’t work** as you might expect.

#### Reason:

- `os.system()` is used to run **shell commands**, not Python functions.
    
- `'getcwd'` is **not** a shell command — it’s a Python function (`os.getcwd()`), so the shell doesn’t recognize it.
    

* * *

### 🔍 What Happens:

```bash
getcwd: command not found
```

The shell tries to find a command named `getcwd`, fails, and returns an error.

* * *

### ✅ Correct Way:

If you want to use `os.getcwd()` from a payload:

```python
__import__('os').getcwd()
```

- ✅ This works.
    
- It returns the **current working directory** as a string.
    

* * *

### ✅ If you wanted to use `os.system()` properly:

You need to use an actual shell command, like:

```python
__import__('os').system('pwd')   # on Linux/macOS
__import__('os').system('cd')    # on Windows
```

* * *

### TL;DR:

| Code | Works? | Why |
| --- | --- | --- |
| `__import__('os').system('getcwd')` | ❌   | `getcwd` is Python, not a shell command |
| `__import__('os').getcwd()` | ✅   | Executes Python code directly |
| `__import__('os').system('pwd')` | ✅   | Shell command for current dir |

Let me know if you want to explore more payload tricks or safe sandboxing!

id: 2fc8f321c36848a0afbfcc833aa2dfdf
parent_id: 8b71464d2f164cc5aec7befa39a6122e
created_time: 2025-07-20T17:38:49.972Z
updated_time: 2025-07-20T18:49:12.881Z
is_conflict: 0
latitude: 49.89975410
longitude: -97.13749370
altitude: 0.0000
author: 
source_url: 
is_todo: 0
todo_due: 0
todo_completed: 0
source: joplin-desktop
source_application: net.cozic.joplin-desktop
application_data: 
order: 0
user_created_time: 2025-07-20T17:38:49.972Z
user_updated_time: 2025-07-20T18:49:12.881Z
encryption_cipher_text: 
encryption_applied: 0
markup_language: 1
is_shared: 0
share_id: 
conflict_original_id: 
master_key_id: 
user_data: 
deleted_time: 0
type_: 1
