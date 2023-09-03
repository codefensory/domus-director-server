import { prisma } from "../utils";
import { globalState } from "../state";

const endSession = async () => {
  globalState.currentSessionId = null;
};

export default endSession;
