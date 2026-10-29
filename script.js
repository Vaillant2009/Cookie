
const form = document.getElementById("colorForm");
const nameInput = document.getElementById("colorName");
const typeInput = document.getElementById("colorType");
const codeInput = document.getElementById("colorCode");
const palette = document.getElementById("palette");
const emptyMessage = document.getElementById("emptyMessage");
const nameError = document.getElementById("nameError");
const codeError = document.getElementById("codeError");
const successMessage = document.getElementById("successMessage");

let colors = loadColors();

function saveColors() {
    const value = encodeURIComponent(JSON.stringify(colors));
    document.cookie = "colorPalette=" + value + "; max-age=10800; path=/; SameSite=Lax";
}

function loadColors() {
    const cookies = document.cookie.split("; ");

    for (const cookie of cookies) {
        if (cookie.startsWith("colorPalette=")) {
            try {
                const value = decodeURIComponent(
                    cookie.substring("colorPalette=".length)
                );

                const parsed = JSON.parse(value);

                if (Array.isArray(parsed)) {
                    return parsed;
                }
            } catch (error) {
                return [];
            }
        }
    }

    return [];
}

function getColorCss(type, code) {
    if (type === "HEX") {
        return code;
    }

    if (type === "RGB") {
        return "rgb(" + code + ")";
    }

    return "rgba(" + code + ")";
}

function validateName(name) {
    if (name.length === 0) {
        return "Введіть назву кольору.";
    }

    if (!/^\p{L}+$/u.test(name)) {
        return "Назва має містити тільки літери без пробілів і цифр.";
    }

    const exists = colors.some(function(color) {
        return color.name.toLowerCase() === name.toLowerCase();
    });

    if (exists) {
        return "Колір із такою назвою вже існує.";
    }

    return "";
}

function validateCode(type, code) {
    if (code.length === 0) {
        return "Введіть код кольору.";
    }

    if (type === "RGB" || type === "RGBA") {
        const parts = code.split(",").map(function(part) {
            return part.trim();
        });

        const expectedLength = type === "RGB" ? 3 : 4;

        if (
            parts.length !== expectedLength ||
            parts.some(function(part) {
                return part === "" || !/^\d+(\.\d+)?$/.test(part);
            })
        ) {
            return type === "RGB"
                ? "RGB має містити 3 числа через кому."
                : "RGBA має містити 4 числа через кому.";
        }

        const numbers = parts.map(Number);

        if (numbers.slice(0, 3).some(function(number) {
            return number < 0 || number > 255;
        })) {
            return "Перші три числа мають бути від 0 до 255.";
        }

        if (
            type === "RGBA" &&
            (numbers[3] < 0 || numbers[3] > 1)
        ) {
            return "Останнє число RGBA має бути від 0 до 1.";
        }

        return "";
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(code)) {
        return "HEX має містити # і 6 цифр або літер від A до F.";
    }

    return "";
}

function renderColors() {
    palette.replaceChildren();

    colors.forEach(function(color) {
        const card = document.createElement("article");
        card.className = "color-card";

        const preview = document.createElement("div");
        preview.className = "color-preview";
        preview.style.backgroundColor = getColorCss(
            color.type,
            color.code
        );

        const info = document.createElement("div");
        info.className = "color-info";

        const title = document.createElement("h3");
        title.textContent = color.name;

        const type = document.createElement("p");
        type.textContent = "Тип: " + color.type;

        const code = document.createElement("p");
        code.textContent = "Код: " + color.code;

        info.append(title, type, code);
        card.append(preview, info);
        palette.appendChild(card);
    });

    emptyMessage.hidden = colors.length > 0;
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    nameError.textContent = "";
    codeError.textContent = "";
    successMessage.textContent = "";

    const name = nameInput.value.trim();
    const type = typeInput.value;
    const code = codeInput.value.trim();

    const nameMessage = validateName(name);
    const codeMessage = validateCode(type, code);

    nameError.textContent = nameMessage;
    codeError.textContent = codeMessage;

    if (nameMessage || codeMessage) {
        return;
    }

    colors.push({
        name: name,
        type: type,
        code: code
    });

    saveColors();
    renderColors();

    form.reset();
    successMessage.textContent = "Колір успішно додано!";
});

nameInput.addEventListener("input", function() {
    nameError.textContent = "";
    successMessage.textContent = "";
});

typeInput.addEventListener("change", function() {
    codeError.textContent = "";
    successMessage.textContent = "";
});

codeInput.addEventListener("input", function() {
    codeError.textContent = "";
    successMessage.textContent = "";
});

renderColors();
