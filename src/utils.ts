import debug from "debug";
import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "oxide.ts";
import fs from "fs";

import endSession from "./events/endSession";
import startSession from "./events/startSession";
import record from "./events/record";
import recordAndSave from "./events/recordAndSave";

export const prisma = new PrismaClient();

const logger = debug("api:utils:send-arduino-command");

export async function sendArduinoCommand(command: string): Promise<Result<Response, Error>> {
  const commands = JSON.parse(fs.readFileSync("public/config.json", "utf-8"));

  const arduinoCommand = commands[command].arduinoCommand;

  if (!arduinoCommand) {
    return Ok(new Response());
  }

  const responseResult = await Result.safe(fetch(`${process.env.ARDUINO_URL}${arduinoCommand}`));

  if (responseResult.isErr()) {
    const error = responseResult.unwrapErr();

    logger("Error sending command to arduino", error);

    return Err(error);
  }

  const response = responseResult.unwrap();

  if (!response.ok) {
    logger("Error: arduino error");

    return Err(new Error("arduino error"));
  }

  return Ok(response);
}

export const events: Record<string, (sessionId: number) => Promise<void>> = {
  endSession,
  record,
  record2: record,
  recordAndSave,
  startSession,
};
