import { setupWorker } from "msw/browser";
import authMockApi from "./handlers/_auth";
import demoMockApi from "./handlers/_demo";
import orgMockApi from "./handlers/_org";
import userMockApi from "./handlers/_user";

const handlers = [...authMockApi, ...userMockApi, ...orgMockApi, ...demoMockApi];
const worker = setupWorker(...handlers);

export default worker;
