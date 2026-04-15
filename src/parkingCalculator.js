function calculateParking(minutesParked, hourlyRate = 100) {
  if (minutesParked < 0) {
    throw new Error('Время не может быть отрицательным');
  }

  if (hourlyRate < 0) {
    throw new Error('Тариф не может быть отрицательным');
  }

  if (minutesParked <= 15) {
    return 0;
  }

  const billableMinutes = minutesParked - 15;
  const hours = Math.ceil(billableMinutes / 60);
  return hours * hourlyRate;
}

module.exports = calculateParking;
