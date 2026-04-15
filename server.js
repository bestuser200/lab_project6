const express = require('express');
const calculateParking = require('./src/parkingCalculator');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const RATE_PER_HOUR = 100;

// База для UI-тестов: номер -> минут назад от текущего момента
const seedParkingDB = {
  'А001АА77': 10,
  'Б002ББ77': 16,
  'В003ВВ77': 61,
  'Г004ГГ77': 75,
  'Д005ДД77': 120,
};

// Хранилище динамически зарегистрированных въездов (для BDD/API)
const dynamicEntries = {};

function buildEntryTimeFromMinutesAgo(minutesAgo) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

// GET /api/parking/entry/:plate
// 1) если передан ?minutesAgo=Х -> регистрируем въезд динамически
// 2) если машина уже регистрировалась динамически -> отдаем её entryTime
// 3) иначе берем из seedParkingDB для UI
app.get('/api/parking/entry/:plate', (req, res) => {
  const { plate } = req.params;
  const minutesAgoParam = req.query.minutesAgo;

  if (minutesAgoParam !== undefined) {
    const minutesAgo = Number(minutesAgoParam);
    if (Number.isNaN(minutesAgo) || minutesAgo < 0) {
      return res.status(400).json({ status: 'error', message: 'Некорректное значение minutesAgo' });
    }

    const entryTime = buildEntryTimeFromMinutesAgo(minutesAgo);
    dynamicEntries[plate] = entryTime;
    return res.status(200).json({ plate, entryTime, minutesAgo });
  }

  if (dynamicEntries[plate]) {
    return res.status(200).json({ plate, entryTime: dynamicEntries[plate] });
  }

  if (!(plate in seedParkingDB)) {
    return res.status(404).json({ status: 'error', error: 'Автомобиль не найден в базе парковки' });
  }

  const minutesAgo = seedParkingDB[plate];
  const entryTime = buildEntryTimeFromMinutesAgo(minutesAgo);
  return res.status(200).json({ plate, entryTime, minutesAgo });
});

// POST /api/parking/exit
app.post('/api/parking/exit', (req, res) => {
  try {
    const { plate, entryTime, hourlyRate = RATE_PER_HOUR } = req.body;

    if (!plate || String(plate).trim() === '') {
      return res.status(400).json({ status: 'error', error: 'Введите номер автомобиля' });
    }

    if (!entryTime) {
      return res.status(400).json({ status: 'error', error: 'Не передано время въезда' });
    }

    const entry = new Date(entryTime);
    if (Number.isNaN(entry.getTime())) {
      return res.status(400).json({ status: 'error', error: 'Некорректный формат времени въезда' });
    }

    const now = new Date();
    const diffMs = now - entry;
    if (diffMs < 0) {
      return res.status(400).json({ status: 'error', error: 'Время въезда не может быть в будущем' });
    }

    const minutesParked = Math.floor(diffMs / 60000);
    const cost = calculateParking(minutesParked, hourlyRate);

    if (cost === 0) {
      return res.status(200).json({
        plate,
        minutesParked,
        cost: 0,
        status: 'free',
        message: 'Бесплатно (до 15 минут)'
      });
    }

    const billableMinutes = minutesParked - 15;
    const billableHours = Math.ceil(billableMinutes / 60);

    return res.status(200).json({
      plate,
      minutesParked,
      billableHours,
      cost,
      status: 'paid',
      message: `Стоимость: ${cost} руб.`
    });
  } catch (error) {
    return res.status(400).json({ status: 'error', message: error.message, error: error.message });
  }
});

if (require.main === module) {
  app.listen(3000, () => {
    console.log('Сервер запущен: http://localhost:3000');
  });
}

module.exports = app;
