import debug from "debug";
import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "oxide.ts";
import fs from "fs";

import endSession from "./events/endSession";
import startSession from "./events/startSession";
import startCamera from "./events/startCamera";

export const prisma = new PrismaClient();

const logger = debug("api:utils:send-arduino-command");

export async function sendArduinoCommand(command: string): Promise<Result<Response, Error>> {
  const commands = JSON.parse(fs.readFileSync("public/config.json", "utf-8"));

  const arduinoCommand = commands[command].arduinoCommand;

  if (!arduinoCommand) {
    return Ok(new Response());
  }

  const responseResult = await Result.safe(fetch(arduinoCommand));

  if (responseResult.isErr()) {
    const error = responseResult.unwrapErr();

    logger(error);

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
  startCamera,
  startSession,
};
