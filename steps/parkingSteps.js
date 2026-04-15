const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../server');

let entryTime = null;
let currentPlate = null;
let response = null;

Given('я регистрирую въезд автомобиля {string} с временем {int} минут назад', async function (plate, minutes) {
  currentPlate = plate;
  const res = await request(app).get(`/api/parking/entry/${encodeURIComponent(plate)}?minutesAgo=${minutes}`);
  if (res.status !== 200) {
    throw new Error('Не удалось зарегистрировать въезд');
  }
});

When('я получаю время въезда для автомобиля {string}', async function (plate) {
  const res = await request(app).get(`/api/parking/entry/${encodeURIComponent(plate)}`);
  if (res.status !== 200) {
    throw new Error('Не удалось получить время въезда');
  }
  entryTime = res.body.entryTime;
  currentPlate = plate;
});

When(/я отправляю запрос на выезд с тарифом (\d+) руб\/час/, async function (rate) {
  response = await request(app)
    .post('/api/parking/exit')
    .send({
      plate: currentPlate,
      entryTime,
      hourlyRate: Number(rate)
    });
});

Then('стоимость парковки должна быть {int} рублей', function (expectedCost) {
  if (response.body.cost !== expectedCost) {
    throw new Error(`Ожидалась стоимость ${expectedCost}, получено ${response.body.cost}`);
  }
});

Then('статус ответа должен быть {int}', function (expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(`Ожидался статус ${expectedStatus}, получен ${response.status}`);
  }
});
