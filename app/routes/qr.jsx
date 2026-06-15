import QRCode from "qrcode";

const SELLER_NAME = "Rubaiyat Modern Luxury Products Company Ltd.";
const VAT_NUMBER = "300004775421003";

function tlv(tag, value) {
  const valueBuffer = Buffer.from(String(value || ""), "utf8");

  return Buffer.concat([
    Buffer.from([tag]),
    Buffer.from([valueBuffer.length]),
    valueBuffer,
  ]);
}

function generateZatcaBase64({ sellerName, vatNumber, timestamp, total, vatAmount }) {
  const buffer = Buffer.concat([
    tlv(1, sellerName),
    tlv(2, vatNumber),
    tlv(3, timestamp),
    tlv(4, total),
    tlv(5, vatAmount),
  ]);

  return buffer.toString("base64");
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  const timestamp = url.searchParams.get("timestamp") || new Date().toISOString();
  const total = url.searchParams.get("total") || "0.00";
  const vatAmount = url.searchParams.get("tax") || "0.00";

  const qrBase64 = generateZatcaBase64({
    sellerName: SELLER_NAME,
    vatNumber: VAT_NUMBER,
    timestamp,
    total,
    vatAmount,
  });

  const qrPng = await QRCode.toBuffer(qrBase64, {
    type: "png",
    width: 220,
    margin: 1,
  });

  return new Response(qrPng, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
};