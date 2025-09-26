'use client';
import React, { useState, useEffect } from 'react';

const currencies = [
  { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
  { code: 'EUR', name: 'يورو', flag: '🇪🇺' },
  { code: 'EGP', name: 'جنيه مصري', flag: '🇪🇬' },
  { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' },
  { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪' },
  { code: 'KWD', name: 'دينار كويتي', flag: '🇰🇼' },
  { code: 'JOD', name: 'دينار أردني', flag: '🇯🇴' },
  { code: 'BHD', name: 'دينار بحريني', flag: '🇧🇭' },
  { code: 'OMR', name: 'ريال عماني', flag: '🇴🇲' },
  { code: 'IQD', name: 'دينار عراقي', flag: '🇮🇶' },
  { code: 'LYD', name: 'دينار ليبي', flag: '🇱🇾' },
  { code: 'MAD', name: 'درهم مغربي', flag: '🇲🇦' },
  { code: 'TND', name: 'دينار تونسي', flag: '🇹🇳' },
  { code: 'SDG', name: 'جنيه سوداني', flag: '🇸🇩' },
  { code: 'QAR', name: 'ريال قطري', flag: '🇶🇦' },
  { code: 'TRY', name: 'ليرة تركية', flag: '🇹🇷' },
];

interface ExchangeRates {
  [key: string]: number;
}

const ConverterWithBTC: React.FC = () => {
  const [rates, setRates] = useState<ExchangeRates>({});
  const [btcPriceUSD, setBtcPriceUSD] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EGP');

  // جلب أسعار صرف العملات مقابل الدولار
  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('فشل في جلب أسعار صرف العملات');

      const data = await res.json();
      if (data.result !== 'success') throw new Error('الاستجابة غير ناجحة من API');

      setRates(data.rates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
    } finally {
      setLoading(false);
    }
  };

  // جلب سعر البيتكوين مقابل الدولار من CoinGecko
  const fetchBtcPrice = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      if (!res.ok) throw new Error('فشل في جلب سعر البيتكوين');

      const data = await res.json();
      setBtcPriceUSD(data.bitcoin.usd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في جلب سعر البيتكوين');
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    fetchBtcPrice();
  }, []);

  // تحويل amount من fromCurrency إلى toCurrency باستخدام الدولار كوسيط
  const convert = (): number => {
    if (!rates[fromCurrency] || !rates[toCurrency]) return 0;

    // المبلغ بالدولار
    const amountInUSD = amount / rates[fromCurrency];

    // المبلغ بالعملة الهدف
    const amountInToCurrency = amountInUSD * rates[toCurrency];
    return amountInToCurrency;
  };

  // حساب كم يعادل المبلغ بالبيتكوين
  const convertToBTC = (): number => {
    if (!btcPriceUSD || !rates[fromCurrency]) return 0;

    const amountInUSD = amount / rates[fromCurrency];
    return amountInUSD / btcPriceUSD;
  };

  const convertedAmount = convert();
  const btcEquivalent = convertToBTC();

  // تبادل العملات
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  // الحصول على معلومات العملة
  const getCurrencyInfo = (code: string) => {
    return currencies.find(currency => currency.code === code) || { code, name: code, flag: '' };
  };

  const fromCurrencyInfo = getCurrencyInfo(fromCurrency);
  const toCurrencyInfo = getCurrencyInfo(toCurrency);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-md transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            محول العملات مع البيتكوين
          </h1>
          <p className="text-gray-700 mt-2 text-lg font-medium">حول بين العملات مع معرفة القيمة بالبيتكوين</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <span className="mr-3 text-gray-800 text-lg font-medium">جاري تحميل البيانات...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="font-medium text-lg text-red-800">{error}</p>
            <button 
              onClick={() => {
                fetchExchangeRates();
                fetchBtcPrice();
              }}
              className="mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-lg"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold text-gray-900 text-lg">المبلغ:</label>
                  <span className="text-blue-800 font-bold bg-blue-100 px-3 py-1 rounded-lg">
                    {fromCurrencyInfo.flag} {fromCurrency} - {fromCurrencyInfo.name}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full border border-gray-400 rounded-xl px-4 py-4 text-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    placeholder="أدخل المبلغ"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900 text-lg">من:</label>
                    <span className="text-blue-800 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                      {fromCurrencyInfo.name}
                    </span>
                  </div>
                  <select
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={swapCurrencies}
                  className="mt-6 p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors border border-blue-300"
                  aria-label="تبديل العملات"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-semibold text-gray-900 text-lg">إلى:</label>
                    <span className="text-blue-800 text-sm font-medium bg-blue-100 px-2 py-1 rounded">
                      {toCurrencyInfo.name}
                    </span>
                  </div>
                  <select
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* عرض النتائج */}
            <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl text-white text-center space-y-4 shadow-lg">
              <div className="text-3xl md:text-4xl font-bold">
                {convertedAmount.toFixed(2)} <span className="text-2xl">{toCurrencyInfo.flag} {toCurrency}</span>
              </div>
              
              <div className="text-lg font-medium">
                {amount} {fromCurrencyInfo.flag} {fromCurrency} =
              </div>

              <div className="pt-4 border-t border-blue-400 border-opacity-50">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-300 font-bold text-xl">
                      {btcEquivalent.toFixed(8)} BTC
                    </span>
                  </div>
                  <p className="text-sm font-medium opacity-90">{toCurrencyInfo.name}</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              fetchExchangeRates();
              fetchBtcPrice();
            }}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 text-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            {loading ? 'جاري التحديث...' : 'تحديث الأسعار'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="text-sm text-gray-700 text-center font-medium">
            يتم تحديث الأسعار تلقائيًا من مصادر موثوقة. القيم المعروضة لأغراض إعلامية فقط.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConverterWithBTC;