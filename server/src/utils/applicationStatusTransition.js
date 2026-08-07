import AppError from "./AppError.js"; import { APPLICATION_TRANSITIONS } from "../constants/application.constants.js";
export const assertApplicationTransition=(from,to)=>{if(from===to)return; if(!(APPLICATION_TRANSITIONS[from]||[]).includes(to)) throw new AppError(`Application status cannot change from ${from} to ${to}.`,409,"INVALID_APPLICATION_STATUS_TRANSITION");};
