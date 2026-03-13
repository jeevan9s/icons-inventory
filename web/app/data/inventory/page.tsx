import Layout from "@/app/components/Layout";
import InventoryTable from "@/app/components/InventoryTable";

export default function InventoryPage() {
  return (
    <Layout>
      <InventoryTable data = {[]} />
    </Layout>
  );
}
