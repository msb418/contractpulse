// src/app/(app)/contracts/new/page.tsx
import ContractForm from "@/components/ContractForm";

export default function NewContractPage() {
  return (
    <div className="page-shell px-4 py-6 sm:px-6">
      <div className="card w-full max-w-3xl mx-auto">
        <h2 className="mb-6 text-lg sm:text-xl font-semibold">New Contract</h2>
        {/* Uses your existing form component */}
        <ContractForm />
      </div>
    </div>
  );
}