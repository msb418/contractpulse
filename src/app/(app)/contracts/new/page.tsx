// src/app/(app)/contracts/new/page.tsx
import ContractForm from "@/components/ContractForm";

export default function NewContractPage() {
  return (
    <div className="page-shell">
      <div className="card">
        <h2 className="mb-6 text-xl font-semibold">New Contract</h2>
        {/* Uses your existing form component */}
        <ContractForm />
      </div>
    </div>
  );
}