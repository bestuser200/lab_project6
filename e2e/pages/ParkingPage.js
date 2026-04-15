class ParkingPage {
  constructor(page) {
    this.page = page;
    this.plateInput = '#plate';
    this.calculateBtn = '#calculateBtn';
    this.resultArea = '#resultArea';
  }

  async navigate() {
    await this.page.goto('http://localhost:3000');
  }

  async setPlate(value) {
    await this.page.fill(this.plateInput, String(value));
  }

  async calculate() {
    await this.page.click(this.calculateBtn);
  }

  async getSuccessMessage() {
    const el = this.page.locator('.success');
    await el.waitFor({ state: 'visible', timeout: 5000 });
    return el.textContent();
  }

  async getFreeMessage() {
    const el = this.page.locator('.free');
    await el.waitFor({ state: 'visible', timeout: 5000 });
    return el.textContent();
  }

  async getErrorMessage() {
    const el = this.page.locator('.error');
    await el.waitFor({ state: 'visible', timeout: 5000 });
    return el.textContent();
  }

  async getAnyResult() {
    const locator = this.page.locator('.success, .free, .error');
    await locator.first().waitFor({ state: 'visible', timeout: 5000 });
    return locator.first().textContent();
  }
}

module.exports = ParkingPage;
