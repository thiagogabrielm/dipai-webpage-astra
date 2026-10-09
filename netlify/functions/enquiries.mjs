import { createEnquiryHandler } from '../../server/enquiries.mjs';
const handle = createEnquiryHandler();
export default (request, context) => handle(request, context.ip);
export const config = { path: '/api/enquiries' };
