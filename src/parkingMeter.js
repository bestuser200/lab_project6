async function calculateParkingCost(carPlate, exitTime, barrierSystem, ratePerHour = 100) {
  if (!carPlate) {
    throw new Error('Не указан номер автомобиля');
  }

  const entryTime = await barrierSystem.getEntryTime(carPlate);

  if (!(entryTime instanceof Date) || !(exitTime instanceof Date)) {
    throw new Error('Некорректное время');
  }

  const diffMs = exitTime - entryTime;

  if (diffMs < 0) {
    throw new Error('Время выезда раньше времени въезда');
  }

  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes <= 15) {
    return 0;
  }

  const hours = Math.ceil(minutes / 60);
  return hours * ratePerHour;
}

module.exports = calculateParkingCost;
