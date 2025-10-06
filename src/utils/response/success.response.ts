import { Response } from "express";

import { Response } from "express";

export const succsesResponse = <T>({
  res,
  statusCode = 200,
  message = "Done",
  info,
  data,
}: {
  res: Response;
  statusCode?: number;
  message?: string;
  info?: string | object;
  data?: T;
}): Response => {
  return res.status(statusCode).json({
    message,
    info,
    statusCode,
    data,
  });
};
