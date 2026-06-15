import QRCode from "qrcode";
import { authenticate } from "../shopify.server";

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

export const action = async ({ request }) => {
  const { payload, admin, topic, shop } = await authenticate.webhook(request);

  console.log(`ZATCA webhook received: ${topic} from ${shop}`);

  const orderId = payload.admin_graphql_api_id;
  const timestamp = payload.created_at;
  const total = Number(payload.total_price || 0).toFixed(2);
  const vatAmount = Number(payload.total_tax || 0).toFixed(2);

  const qrBase64 = generateZatcaBase64({
    sellerName: SELLER_NAME,
    vatNumber: VAT_NUMBER,
    timestamp,
    total,
    vatAmount,
  });

  const qrImage = await QRCode.toDataURL(qrBase64);

  const response = await admin.graphql(
    `#graphql
    mutation SetZatcaQr($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        metafields: [
          {
            ownerId: orderId,
            namespace: "zatca",
            key: "qr_image",
            type: "multi_line_text_field",
            value: qrImage,
          },
          {
            ownerId: orderId,
            namespace: "zatca",
            key: "qr_base64",
            type: "multi_line_text_field",
            value: qrBase64,
          },
        ],
      },
    },
  );

  const result = await response.json();
  console.log("ZATCA metafield result:", JSON.stringify(result, null, 2));

  return new Response("OK", { status: 200 });
};