// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // send users straight to the contracts list
  redirect("/contracts");
}