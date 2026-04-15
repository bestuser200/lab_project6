const { test, expect } = require('@playwright/test');
const ParkingPage = require('./pages/ParkingPage');

test.describe('Расчёт стоимости парковки', () => {
  let parkingPage;

  test.beforeEach(async ({ page }) => {
    parkingPage = new ParkingPage(page);
    await parkingPage.navigate();
  });

  test('Парковка 10 минут — бесплатно', async () => {
    await parkingPage.setPlate('А001АА77');
    await parkingPage.calculate();
    const msg = await parkingPage.getFreeMessage();
    expect(msg).toContain('0 руб.');
    expect(msg).toContain('Бесплатно');
  });

  test('Парковка 16 минут — округление до 1 часа', async () => {
    await parkingPage.setPlate('Б002ББ77');
    await parkingPage.calculate();
    const msg = await parkingPage.getSuccessMessage();
    expect(msg).toContain('Стоимость');
    expect(msg).toContain('1');
  });

  test('Парковка 61 минута — 1 оплачиваемый час', async () => {
    await parkingPage.setPlate('В003ВВ77');
    await parkingPage.calculate();
    const msg = await parkingPage.getSuccessMessage();
    expect(msg).toContain('100 руб.');
  });

  test('Парковка 120 минут — отображение стоимости', async () => {
    await parkingPage.setPlate('Д005ДД77');
    await parkingPage.calculate();
    const msg = await parkingPage.getSuccessMessage();
    expect(msg).toContain('Д005ДД77');
    expect(msg).toContain('200 руб.');
  });

  test('Пустой номер автомобиля — ошибка', async () => {
    await parkingPage.calculate();
    const err = await parkingPage.getErrorMessage();
    expect(err).toContain('Введите номер автомобиля');
  });

  test('Несуществующий номер — ошибка 404', async () => {
    await parkingPage.setPlate('Х999ХХ99');
    await parkingPage.calculate();
    const err = await parkingPage.getErrorMessage();
    expect(err.toLowerCase()).toContain('не найден');
  });

  test('Data-Driven: проверка разных автомобилей и статусов', async ({ page }) => {
    const cases = [
      { plate: 'А001АА77', isFree: true },
      { plate: 'Б002ББ77', isFree: false },
      { plate: 'В003ВВ77', isFree: false },
      { plate: 'Г004ГГ77', isFree: false },
    ];

    for (const { plate, isFree } of cases) {
      const pp = new ParkingPage(page);
      await pp.navigate();
      await pp.setPlate(plate);
      await pp.calculate();

      const result = await pp.getAnyResult();
      expect(result).toBeTruthy();

      if (isFree) {
        expect(result).toContain('0 руб.');
      } else {
        expect(result).toContain('руб.');
      }
    }
  });
});
