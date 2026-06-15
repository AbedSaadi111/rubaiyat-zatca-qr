import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  return (
    <s-page heading="Rubaiyat ZATCA QR">
      <s-section heading="App is running">
        <s-paragraph>
          This app will generate ZATCA QR codes for paid Shopify orders and save
          them to the order metafields for Order Printer invoices.
        </s-paragraph>
      </s-section>

      <s-section heading="Status">
        <s-paragraph>QR generator setup: ready</s-paragraph>
        <s-paragraph>Next: add paid order webhook</s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};