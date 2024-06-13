const popularColors = [
    "#FFC000", // Pantone 101
    "#FFF700", // Process Yellow-2
    "#D1E231", // Pantone 374
    "#A5C8E1", // Pantone 304
    "#78BFE4", // Pantone 305
    "#1CA0E0", // Process Cyan-2
    "#009688", // Pantone 345
    "#EF5350", // Pantone 210
    "#E91E63", // Process Magenta-2
    "#9E9D24", // Pantone 123
    "#FF5722", // Pantone Orange 021
    "#F44336", // Pantone Red 032
    "#00796B", // Pantone 327
    "#5D4037", // Pantone 329
    "#3F51B5", // Pantone 286
    "#1A237E", // Pantone 266
    "#4CAF50", // Pantone 354
    "#607D8B", // Pantone 429
];

function getRandomColors() {
    const shuffled = popularColors.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function setInitialColors() {
    const colors = getRandomColors().join(', ');
    document.getElementById('colors').value = colors;
    generateInitialColorScales(colors);
}

function generateInitialColorScales(colorsInput) {
    const colors = colorsInput.split(',').map(color => parseColor(color.trim()));
    const steps = parseInt(document.getElementById('steps').value.trim());
    const lightnessMin = parseInt(document.getElementById('lightnessMin').value.trim());
    const lightnessMax = parseInt(document.getElementById('lightnessMax').value.trim());

    if (colors.length > 0 && steps > 1 && lightnessMin >= 0 && lightnessMax <= 100) {
        generateColorScales(colors, steps, lightnessMin, lightnessMax);
    }
}

document.addEventListener('DOMContentLoaded', setInitialColors);

document.getElementById('colorForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const colorsInput = document.getElementById('colors').value.trim();
    const steps = parseInt(document.getElementById('steps').value.trim());
    const lightnessMin = parseInt(document.getElementById('lightnessMin').value.trim());
    const lightnessMax = parseInt(document.getElementById('lightnessMax').value.trim());
    const colors = colorsInput.split(',').map(color => parseColor(color.trim()));
    
    if (colors.length > 0 && steps > 1 && lightnessMin >= 0 && lightnessMax <= 100) {
        generateColorScales(colors, steps, lightnessMin, lightnessMax);
    }
});

function parseColor(color) {
    // Handle different color formats
    if (color.startsWith('hsl')) {
        const hsl = color.match(/\d+/g).map(Number);
        return { type: 'hsl', values: hsl };
    } else if (color.startsWith('#')) {
        return { type: 'hex', values: [color] };
    } else if (color.includes(',')) {
        const rgb = color.split(',').map(Number);
        return { type: 'rgb', values: rgb };
    }
    return null;
}

function generateColorScales(colors, steps, lightnessMin, lightnessMax) {
    const output = document.getElementById('output');
    const colorChips = document.getElementById('colorChips');
    output.innerHTML = '';
    colorChips.innerHTML = '';

    colors.forEach((color, index) => {
        const colorScale = createColorScale(color, steps, lightnessMin, lightnessMax);
        colorChips.innerHTML += generateColorChips(colorScale, index + 1);
        output.innerHTML += generateCSSVariables(colorScale, index + 1);
    });
}

function createColorScale(color, steps, lightnessMin, lightnessMax) {
    let h, s, l, lStep;

    if (color.type === 'hsl') {
        [h, s, l] = color.values;
        lStep = (lightnessMax - lightnessMin) / (steps - 1);
    } else if (color.type === 'rgb') {
        const [r, g, b] = color.values;
        const hsl = rgbToHsl(r, g, b);
        [h, s, l] = hsl;
        lStep = (lightnessMax - lightnessMin) / (steps - 1);
    } else if (color.type === 'hex') {
        const rgb = hexToRgb(color.values[0]);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        [h, s, l] = hsl;
        lStep = (lightnessMax - lightnessMin) / (steps - 1);
    }

    return Array.from({ length: steps }, (_, i) => ({
        h,
        s: Math.round(s * (1 - i / (steps - 1) * 0.5)),
        l: Math.round(lightnessMin + i * lStep)
    }));
}

function generateColorChips(colorScale, scaleIndex) {
    return colorScale.map((c, i) => {
        const hex = hslToHex(c.h, c.s, c.l);
        return `
            <div class="color-box" title="Color Scale ${scaleIndex}-${i + 1}" style="background-color: ${hex}; width: 48px; height: 48px; border: 1px solid #ccc; margin: 4px;"></div>
        `;
    }).join('');
}

function generateCSSVariables(colorScale, scaleIndex) {
    let cssVariables = `
        <div class="table-container col-md-6">
            <h3>Color Scale ${scaleIndex}</h3>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Swatch</th>
                        <th>HSL</th>
                        <th>HEX</th>
                    </tr>
                </thead>
                <tbody>
    `;
    colorScale.forEach((c, i) => {
        const hex = hslToHex(c.h, c.s, c.l);
        cssVariables += `
            <tr>
                <td style="background-color: ${hex}; width: 48px; height: 48px;"></td>
                <td class="editable" contenteditable="true" onclick="changeColor(this, 'hsl')">hsl(${c.h}, ${c.s}%, ${c.l}%)</td>
                <td class="editable" contenteditable="true" onclick="changeColor(this, 'hex')">${hex}</td>
            </tr>
        `;
    });
    cssVariables += `
                </tbody>
            </table>
        </div>
    `;
    return cssVariables;
}

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function changeColor(element, type) {
    if (type === 'hsl') {
        element.setAttribute('contenteditable', 'false');
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = hslToHex(...element.innerText.match(/\d+/g).map(Number));
        colorPicker.addEventListener('input', (e) => {
            element.innerText = hexToHsl(e.target.value);
            element.setAttribute('contenteditable', 'true');
        });
        colorPicker.click();
    } else if (type === 'hex') {
        element.setAttribute('contenteditable', 'false');
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = element.innerText;
        colorPicker.addEventListener('input', (e) => {
            element.innerText = e.target.value;
            element.setAttribute('contenteditable', 'true');
        });
        colorPicker.click();
    }
}

function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [h, s, l] = rgbToHsl(r, g, b);
    return `hsl(${h}, ${s}%, ${l}%)`;
}
