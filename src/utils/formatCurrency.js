export const formatPrice = (price, currency = "PYG", country = "es-PY") => {
  return new Intl.NumberFormat(country, {
    style: "currency",
    currency: currency,
  }).format(Number(price));
};
