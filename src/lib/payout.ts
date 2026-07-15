export function formatPayoutDetailsHtml(
  payoutMethod: string | null,
  payoutDetails: Record<string, string> | null
): string {
  if (!payoutMethod || !payoutDetails) {
    return "<p style=\"color:#DC2626\">No payout details on file for this freelancer yet — ask them to add it in Settings.</p>";
  }
  if (payoutMethod === "bank_transfer") {
    return `<ul>
<li><strong>Method:</strong> Bank transfer</li>
<li><strong>Account holder:</strong> ${payoutDetails.account_holder ?? "—"}</li>
<li><strong>Account number:</strong> ${payoutDetails.account_number ?? "—"}</li>
<li><strong>IFSC code:</strong> ${payoutDetails.ifsc ?? "—"}</li>
</ul>`;
  }
  const label = payoutMethod === "paypal" ? "PayPal" : "Wise";
  return `<ul>
<li><strong>Method:</strong> ${label}</li>
<li><strong>Email:</strong> ${payoutDetails.email ?? "—"}</li>
</ul>`;
}
