import { z } from 'zod';

export const trackTokenParamSchema = {
  params: z.object({ token: z.string().trim().min(1).max(200) }),
};

export const genericTrackBodySchema = {
  body: z.object({ activityType: z.string().trim().max(100).optional() }),
};

export const awsTrackBodySchema = {
  body: z.object({
    service: z.string().trim().max(100).optional(),
    region: z.string().trim().max(50).optional(),
    action: z.string().trim().max(100).optional(),
  }),
};

// Deliberately permissive: this is a payload from an untrusted client we
// still want to capture even if malformed, so bounds are generous ceilings
// against abuse (huge strings/arrays) rather than strict shape validation.
const boundedString = (max = 500) => z.string().max(max).optional().nullable();
const boundedStringArray = (maxItems = 200, maxLen = 200) =>
  z.array(z.string().max(maxLen)).max(maxItems).optional().nullable();

export const fingerprintBodySchema = {
  body: z.object({
    fingerprintHash: boundedString(128),
    canvasHash: boundedString(128),
    webglHash: boundedString(128),
    webglVendor: boundedString(200),
    webglRenderer: boundedString(200),
    audioHash: boundedString(128),
    screenResolution: boundedString(32),
    colorDepth: z.number().optional().nullable(),
    pixelRatio: z.number().optional().nullable(),
    timezone: boundedString(64),
    languages: boundedStringArray(20, 16),
    platform: boundedString(64),
    hardwareConcurrency: z.number().optional().nullable(),
    deviceMemory: z.number().optional().nullable(),
    touchSupport: z.boolean().optional().nullable(),
    fonts: boundedStringArray(200, 64),
    plugins: boundedStringArray(200, 128),
    cookiesEnabled: z.boolean().optional().nullable(),
    doNotTrack: boundedString(16),
    webdriver: z.boolean().optional().nullable(),
    incognitoGuess: z.boolean().optional().nullable(),
  }),
};

export default { trackTokenParamSchema, genericTrackBodySchema, awsTrackBodySchema, fingerprintBodySchema };
