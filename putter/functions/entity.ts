import { z } from 'zod';

export const RequestBody = z.object({
    database_id: z.string(),
    content: z.string(),
});
export type RequestBodyType = z.infer<typeof RequestBody>;
