import { globalState } from "./state.js";

const canSkip = () => {
  console.log("canSkip")

  globalState.canSkip = true;
};

export default {
  canSkip,
};
