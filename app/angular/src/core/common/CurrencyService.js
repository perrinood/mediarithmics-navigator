define(['./module'], function (module) {
  "use strict";


  var currencies = {"JPY": "￥",
    "SGD": "S$",
    "ILS": "&#1513;&#1495;",
    "RUB": "&#1088;&#1091;&#1073;.",
    "BYR": "&#1056;&#1091;&#1073;",
    "SVC": "C",
    "HRK": "Kn",
    "PEN": "S/",
    "CHF": "SFr.",
    "OMR": "&#1585;.&#1593;.&#8207;",
    "NOK": "kr",
    "IQD": "&#1583;.&#1593;.&#8207;",
    "ALL": "Lek",
    "LTL": "Lt",
    "AUD": "$",
    "NZD": "$",
    "TRY": "TL",
    "USD": "US$",
    "UYU": "NU$",
    "BAM": "&#1050;&#1052;.",
    "MAD": "&#1583;.&#1605;.&#8207;",
    "BHD": "&#1583;.&#1576;.&#8207;",
    "SEK": "kr",
    "EUR": "€",
    "LBP": "&#1604;.&#1604;.&#8207;",
    "AED": "&#1583;.&#1573;.&#8207;",
    "HKD": "HK$",
    "BOB": "B$",
    "VEF": "BsF.",
    "KRW": "&#65510;",
    "KWD": "&#1583;.&#1603;.&#8207;",
    "RSD": "RSD",
    "QAR": "&#1585;.&#1602;.&#8207;",
    "TND": "&#1583;.&#1578;.&#8207;",
    "MKD": "Den",
    "YER": "&#1585;.&#1610;.&#8207;",
    "BRL": "R$",
    "LVL": "Ls",
    "GBP": "£",
    "RON": "LEI",
    "PAB": "B",
    "MXN": "$",
    "SDG": "&#1580;.&#1587;.&#8207;",
    "PYG": "G",
    "SYP": "&#1604;.&#1587;.&#8207;",
    "BGN": "&#1083;&#1074;.",
    "THB": "&#3647;",
    "SAR": "&#1585;.&#1587;.&#8207;",
    "PLN": "z&#322;",
    "GTQ": "Q",
    "ISK": "kr.",
    "NIO": "$C",
    "UAH": "&#1075;&#1088;&#1085;.",
    "MYR": "RM",
    "CSD": "CSD",
    "INR": "Rs.",
    "DZD": "&#1583;.&#1580;.&#8207;",
    "VND": "&#273;",
    "EGP": "&#1580;.&#1605;.&#8207;",
    "PHP": "Php",
    "COP": "$",
    "HNL": "L",
    "CLP": "Ch$",
    "DOP": "RD$",
    "ARS": "$",
    "TWD": "NT$",
    "CNY": "&#65509;",
    "HUF": "Ft",
    "CRC": "C",
    "JOD": "&#1583;.&#1571;.&#8207;",
    "ZAR": "R",
    "IDR": "Rp",
    "LYD": "&#1583;.&#1604;.&#8207;",
    "DKK": "kr",
    "CZK": "K&#269;",
    "CAD": "$CAN"
  };

  var safeCurrency = function (currencyCode) {
    return currencies[currencyCode] || currencyCode;
  };

  module.factory('core/common/CurrencyService',
    [function () {
      var service = {};
      service.getCurrencySymbol = safeCurrency;
      return service;

    }
    ]);

  module.filter('currencyWithSymbol', function () {
    return function (input, currencyCode) {
      input = input || '';
      var currency = safeCurrency(currencyCode) || "";
      //FIXME very naive approach, use js-world or something like this
      var out = input + currency;

      return out;
    };
  });
});
  


