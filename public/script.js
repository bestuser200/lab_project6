document.getElementById('calculateBtn').addEventListener('click', async () => {
  const plate = document.getElementById('plate').value.trim();
  const resultArea = document.getElementById('resultArea');

  resultArea.innerHTML = '';

  if (!plate) {
    resultArea.innerHTML = '<div class="error">Введите номер автомобиля</div>';
    return;
  }

  try {
    const entryRes = await fetch(`http://localhost:3000/api/parking/entry/${encodeURIComponent(plate)}`);
    const entryData = await entryRes.json();

    if (!entryRes.ok) {
      resultArea.innerHTML = `<div class="error">${entryData.error || entryData.message}</div>`;
      return;
    }

    const exitRes = await fetch('http://localhost:3000/api/parking/exit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plate, entryTime: entryData.entryTime })
    });

    const exitData = await exitRes.json();

    if (!exitRes.ok) {
      resultArea.innerHTML = `<div class="error">${exitData.error || exitData.message}</div>`;
      return;
    }

    if (exitData.status === 'free') {
      resultArea.innerHTML = `
        <div class="free">
          <strong>Бесплатно!</strong><br>
          Автомобиль: ${plate}<br>
          Время на парковке: ${exitData.minutesParked} мин.<br>
          Стоимость: <strong>0 руб.</strong>
        </div>`;
    } else {
      resultArea.innerHTML = `
        <div class="success">
          Автомобиль: ${plate}<br>
          Время на парковке: ${exitData.minutesParked} мин.<br>
          Оплачиваемых часов: ${exitData.billableHours}<br>
          Стоимость: <strong>${exitData.cost} руб.</strong>
        </div>`;
    }
  } catch (error) {
    resultArea.innerHTML = '<div class="error">Ошибка соединения с сервером</div>';
  }
});
