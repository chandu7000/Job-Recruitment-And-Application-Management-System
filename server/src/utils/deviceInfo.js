import { UAParser } from "ua-parser-js";

const getClientIpAddress = (req) => {
  const forwardedFor =
    req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor
      .split(",")[0]
      .trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
};

const getDeviceInfo = (req) => {
  const userAgent =
    req.headers["user-agent"] || "";

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browserName =
    result.browser.name ||
    "Unknown Browser";

  const browserVersion =
    result.browser.version || "";

  const operatingSystemName =
    result.os.name || "Unknown OS";

  const operatingSystemVersion =
    result.os.version || "";

  const deviceVendor =
    result.device.vendor || "";

  const deviceModel =
    result.device.model || "";

  const deviceType =
    result.device.type || "Desktop";

  const browser = browserVersion
    ? `${browserName} ${browserVersion}`
    : browserName;

  const operatingSystem =
    operatingSystemVersion
      ? `${operatingSystemName} ${operatingSystemVersion}`
      : operatingSystemName;

  const detectedDeviceName = [
    deviceVendor,
    deviceModel
  ]
    .filter(Boolean)
    .join(" ");

  const deviceName =
    detectedDeviceName || deviceType;

  return {
    userAgent,
    ipAddress: getClientIpAddress(req),
    deviceName,
    browser,
    operatingSystem
  };
};

export { getDeviceInfo };