import { prisma } from "../utils";
import { globalState } from "../state";

const startSession = async () => {
  const session = await prisma.session.create({
    data: {
      state: 0,
    },
  });

  globalState.currentSessionId = session.id;
};

export default startSession;
