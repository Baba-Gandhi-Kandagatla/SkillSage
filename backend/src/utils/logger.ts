import AuditLog from "../models/Audit_logs.js";

export const logEvent = async (roll_number: string, ipaddress: string, event: string, message: string, useragent: string) => {
    try {
        await AuditLog.create({
            roll_number,
            ipaddress,
            event,
            message,
            useragent,
            time: new Date(),
        });
    } catch (error) {
        console.error("Error logging event:", error);
    }
};