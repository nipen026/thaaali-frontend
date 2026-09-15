// The one place the "250g" vs "3×" quantity-label rule lives — used everywhere a cart/order/
// bill line's quantity is shown (TablesPage, KDSPage, OrdersPage, BillingPage, PrintBillPage,
// WhatsAppShare) so gram-priced items never get mislabeled as if they were unit counts.
export function formatQty(qty, unit) {
  return unit === 'gram' ? `${qty}g` : `${qty}×`;
}
