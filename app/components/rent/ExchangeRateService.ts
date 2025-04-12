export class ExchangeRateService {
  private static CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache

  static async getRUBToUSDRate(): Promise<number> {
    // Try to get from cache first
    const cachedRate = this.getCachedRate();
    if (cachedRate) return cachedRate;

    try {
      // First try Google's rate
      const googleRate = await this.getGoogleRate();
      if (googleRate) {
        this.cacheRate(googleRate);
        return googleRate;
      }

      // Fallback to exchangerate-api
      const apiRate = await this.getApiRate();
      if (apiRate) {
        this.cacheRate(apiRate);
        return apiRate;
      }

      // Final fallback
      return 0.011; // Approximate fallback rate
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      return 0.011; // Approximate fallback rate
    }
  }

  private static async getGoogleRate(): Promise<number | null> {
    try {
      const response = await fetch(
        `https://www.google.com/search?q=1+RUB+to+USD`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      const text = await response.text();
      const regex = /1 Russian Ruble = ([0-9.]+) United States Dollar/;
      const match = text.match(regex);

      if (match && match[1]) {
        return parseFloat(match[1]);
      }
      return null;
    } catch (error) {
      console.error("Error fetching Google rate:", error);
      return null;
    }
  }

  private static async getApiRate(): Promise<number> {
    try {
      const response = await fetch(
        "https://api.exchangerate-api.com/v4/latest/RUB"
      );
      const data = await response.json();
      return data.rates["USD"] || 0.011;
    } catch (error) {
      console.error("Error fetching API rate:", error);
      return 0.011;
    }
  }

  private static getCachedRate(): number | null {
    const cached = localStorage.getItem("rubUsdRate");
    if (!cached) return null;

    const { rate, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < this.CACHE_DURATION) {
      return rate;
    }
    return null;
  }

  private static cacheRate(rate: number): void {
    localStorage.setItem(
      "rubUsdRate",
      JSON.stringify({
        rate,
        timestamp: Date.now(),
      })
    );
  }
}
