// Получаем элементы холста и кнопок управления
const canvas = document.getElementById('canvas'); // Получаем холст
const ctx = canvas.getContext('2d'); // Получаем контекст рисования 2D
const lineButton = document.getElementById('lineButton'); // Кнопка для выбора режима рисования отрезка
const circleButton = document.getElementById('circleButton'); // Кнопка для выбора режима рисования окружности
const drawButton = document.getElementById('draw'); // Кнопка для рисования по координатам
const clearButton = document.getElementById('clear'); // Кнопка для очистки холста
const pointAInput = document.getElementById('pointA'); // Ввод координаты A
const pointBInput = document.getElementById('pointB'); // Ввод координаты B

// Переменные для управления режимом рисования
let drawingLine = true; // По умолчанию выбран режим рисования отрезка
let startPoint = null; // Начальная точка рисования
let endPoint = null; // Конечная точка рисования

// Очищаем холст и рисуем оси координат
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем ось X
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'red'; // Цвет оси X
    ctx.lineWidth = 2; // Толщина линии
    ctx.stroke();

    // Рисуем ось Y
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = 'blue'; // Цвет оси Y
    ctx.lineWidth = 2; // Толщина линии
    ctx.stroke();

    // Сменяем цвет пера на черный
    ctx.strokeStyle = 'black';
}

// Функция для рисования отрезка с использованием алгоритма Брезенхэма
function drawLineBresenham(x0, y0, x1, y1) {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;

    let x = x0;
    let y = y0;
    let err = dx - dy;

    while (x !== x1 || y !== y1) {
        setPixel(x, y);

        const e2 = err * 2;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

// Функция для рисования окружности с использованием алгоритма Брезенхэма
function drawCircleBresenham(X1, Y1, R) {
    let x = 0;
    let y = R;
    let delta = 1 - 2 * R;
    let error = 0;

    while (y >= 0) {
        setPixel(X1 + x, Y1 + y);
        setPixel(X1 + x, Y1 - y);
        setPixel(X1 - x, Y1 + y);
        setPixel(X1 - x, Y1 - y);
        error = 2 * (delta + y) - 1;
        if (delta < 0 && error <= 0) {
            delta += 2 * ++x + 1;
        } else if (delta > 0 && error > 0) {
            delta += 1 - 2 * --y;
        } else {
            x++;
            delta += 2 * (x - y);
            y--;
        }
    }
}

// Функция для установки цвета пикселя на холсте
function setPixel(x, y) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, 1, 1);
}

// Обработчик события при нажатии кнопки мыши на холсте
canvas.addEventListener('mousedown', (e) => {
    if (drawingLine || drawingCircle) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvas.width / 2;
        const y = e.clientY - rect.top - canvas.height / 2;

        if (!startPoint) {
            startPoint = { x, y };
        } else {
            endPoint = { x, y };
            if (drawingLine) {
                drawLineBresenham(startPoint.x + canvas.width / 2, startPoint.y + canvas.height / 2, endPoint.x + canvas.width / 2, endPoint.y + canvas.height / 2);
            } else if (drawingCircle) {
                const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
                drawCircleBresenham(startPoint.x + canvas.width / 2, startPoint.y + canvas.height / 2, radius);
            }
            startPoint = null;
            endPoint = null;
        }
    }
});

// Обработчик события при нажатии кнопки "Рисовать"
drawButton.addEventListener('click', () => {
    const pointA = parsePoint(pointAInput.value);
    const pointB = parsePoint(pointBInput.value);

    if (drawingLine) {
        drawLineBresenham(pointA.x + canvas.width / 2, pointA.y + canvas.height / 2, pointB.x + canvas.width / 2, pointB.y + canvas.height / 2);
    } else if (drawingCircle) {
        const radius = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2));
        drawCircleBresenham(pointA.x + canvas.width / 2, pointA.y + canvas.height / 2, radius);
    }
});

// Обработчик события при нажатии кнопки "Очистить"
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearCanvas();
    pointAInput.value = '';
    pointBInput.value = '';
});

// Обработчики событий для кнопок выбора режима
lineButton.addEventListener('click', () => {
    drawingLine = true;
    drawingCircle = false;
    lineButton.classList.add('selected');
    circleButton.classList.remove('selected');
});

circleButton.addEventListener('click', () => {
    drawingLine = false;
    drawingCircle = true;
    lineButton.classList.remove('selected');
    circleButton.classList.add('selected');
});

// Функция для разбора введенных координат (x, y)
function parsePoint(inputValue) {
    const [x, y] = inputValue.split(',').map(coord => parseFloat(coord));
    return { x, y };
}

// Рисуем оси координат при загрузке страницы
window.addEventListener('load', () => {
    clearCanvas();
});
