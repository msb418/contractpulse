import { z } from "zod";

export const ContractCreateSchema = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  currency: z.enum(["USD","EUR","GBP","MXN","JPY"]).optional(),
  status: z.enum(["Draft","Active","Pending","Expired","Cancelled"]).default("Draft"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  autoRenew: z.boolean().optional(),
  noticeDays: z.number().int().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const ContractUpdateSchema = ContractCreateSchema.partial();