const calculateParkingCost = require('../src/parkingMeter');

describe('parkingMeter: unit-тесты расчёта стоимости парковки', () => {
  let barrierSystem;

  beforeEach(() => {
    barrierSystem = {
      getEntryTime: jest.fn()
    };
  });

  test('Ровно 15 минут — бесплатно', async () => {
    barrierSystem.getEntryTime.mockResolvedValue(new Date('2024-05-10T10:00:00'));
    const exitTime = new Date('2024-05-10T10:15:00');

    const cost = await calculateParkingCost('A123BC', exitTime, barrierSystem);
    expect(cost).toBe(0);
  });

  test('16 минут — оплата за 1 час', async () => {
    barrierSystem.getEntryTime.mockResolvedValue(new Date('2024-05-10T10:00:00'));
    const exitTime = new Date('2024-05-10T10:16:00');

    const cost = await calculateParkingCost('A123BC', exitTime, barrierSystem);
    expect(cost).toBe(100);
  });

  test('Переход через сутки — 1ч40мин = 200 руб', async () => {
    barrierSystem.getEntryTime.mockResolvedValue(new Date('2024-05-10T23:30:00'));
    const exitTime = new Date('2024-05-11T01:10:00');

    const cost = await calculateParkingCost('B777BB', exitTime, barrierSystem);
    expect(cost).toBe(200);
  });

  test('Ошибка, если не указан номер автомобиля', async () => {
    await expect(calculateParkingCost('', new Date(), barrierSystem))
      .rejects.toThrow('Не указан номер автомобиля');
  });

  test('Ошибка, если время выезда раньше въезда', async () => {
    barrierSystem.getEntryTime.mockResolvedValue(new Date('2024-05-10T12:00:00'));
    const exitTime = new Date('2024-05-10T11:00:00');

    await expect(calculateParkingCost('A123BC', exitTime, barrierSystem))
      .rejects.toThrow('Время выезда раньше времени въезда');
  });

  test('Ошибка при падении BarrierSystem', async () => {
    barrierSystem.getEntryTime.mockRejectedValue(new Error('API Error'));

    await expect(calculateParkingCost('A123BC', new Date(), barrierSystem))
      .rejects.toThrow('API Error');
  });

  test('Ошибка, если система вернула не Date', async () => {
    barrierSystem.getEntryTime.mockResolvedValue('invalid-date-string');

    await expect(calculateParkingCost('A123BC', new Date(), barrierSystem))
      .rejects.toThrow('Некорректное время');
  });
});
