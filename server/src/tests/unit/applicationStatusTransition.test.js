import { assertApplicationTransition } from "../../utils/applicationStatusTransition.js";
describe("application status transition",()=>{test("allows APPLIED to UNDER_REVIEW",()=>expect(()=>assertApplicationTransition("APPLIED","UNDER_REVIEW")).not.toThrow());test("blocks terminal transition",()=>expect(()=>assertApplicationTransition("REJECTED","HIRED")).toThrow());});
