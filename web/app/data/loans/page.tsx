import Layout from "@/app/components/Layout";
import Inventory from "@/app/components/InventoryTable";

export default function InventoryPage() {
  return (
    <Layout>
      <Inventory data = {[]} />
    </Layout>
  );
}