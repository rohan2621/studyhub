/**
 * Mocks for all Expo native modules that can't run in Node (Jest) environment.
 * Imported via jest.config moduleNameMapper.
 */

// expo-crypto
export const CryptoDigestAlgorithm = { SHA256: 'SHA-256' };
export const digestStringAsync = jest.fn((_alg: string, data: string) =>
  Promise.resolve(`mock-hash-${data.length}`)
);

// expo-secure-store
export const setItemAsync    = jest.fn(() => Promise.resolve());
export const getItemAsync    = jest.fn(() => Promise.resolve(null));
export const deleteItemAsync = jest.fn(() => Promise.resolve());

// expo-device
export const isDevice  = false;
export const modelName = 'Jest Test Device';
export const brand     = 'Test';

// expo-application
export const nativeApplicationVersion = '1.0.0';
export const nativeBuildVersion       = '1';
export const applicationId            = 'com.studyhub.test';

// expo-constants
const Constants = {
  expoConfig: {
    name:  'StudyHub',
    slug:  'studyhub',
    extra: { eas: { projectId: 'test-project-id' } },
  },
};
export default Constants;
