import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/Audit_logs.js';

export const auditLogMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  const ipaddress = req.headers['x-forwarded-for']
    ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
    : req.socket.remoteAddress || 'unknown';

  const requestData = {
    method: req.method,
    body: req.body || {},
    query: req.query || {},
    headers: req.headers || {},
  };

  let responseBody: any = null;
  const responseChunks: Buffer[] = [];

  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk: any) {
    responseChunks.push(Buffer.from(chunk));
    return originalWrite.apply(this, arguments as any);
  };

  res.end = function (chunk: any) {
    if (chunk) responseChunks.push(Buffer.from(chunk));
    responseBody = Buffer.concat(responseChunks).toString();
    return originalEnd.apply(this, arguments as any);
  };

  res.on('finish', async () => {
    try {
      const roll_number = res.locals.jwtData?.rollnumber || 'unknown';
      const route = req.originalUrl;
      const status = res.statusCode.toString();
      const responseTime = Date.now() - startTime;

      // Safely parse response body
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseBody);
      } catch {
        parsedResponse = responseBody;
      }

      const logData = {
        roll_number,
        ipaddress,
        route,
        status,
        data: {
          request: requestData,
          response: parsedResponse,
        },
        responseTime: `${responseTime}ms`,
        time: new Date(),
      };

      try {
        await AuditLog.create(logData);
      } catch (error) {
        console.error('Failed to log audit entry. DB may be down:', error.message);
      }
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  });

  next();
};
