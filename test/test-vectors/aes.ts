import { decrypt, encrypt } from "zond-cryptography/aes";
import { hexToBytes, toHex } from "zond-cryptography/utils";
import { deepStrictEqual, throws } from "./assert";
// Test vectors taken from https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf
const TEST_VECTORS = [
  {
    mode: "aes-256-gcm",
    key: "2b7e151628aed2a6abf7158809cf4f3c",
    iv: "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff",
    msg: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
    cypherText:
      "874d6191b620e3261bef6864990db6ce9806f66b7970fdff8617187bb9fffdff5ae4df3edbd5d35e5b4f09020db03eab1e031dda2fbe03d1792170a0f3009cee"
  },
  // Same as the previous one, but with default params
  {
    mode: undefined,
    key: "2b7e151628aed2a6abf7158809cf4f3c",
    iv: "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff",
    msg: "6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e5130c81c46a35ce411e5fbc1191a0a52eff69f2445df4f9b17ad2b417be66c3710",
    cypherText:
      "874d6191b620e3261bef6864990db6ce9806f66b7970fdff8617187bb9fffdff5ae4df3edbd5d35e5b4f09020db03eab1e031dda2fbe03d1792170a0f3009cee"
  },
];

describe("aes", () => {
  for (const [i, vector] of TEST_VECTORS.entries()) {
    it(`Should encrypt the test ${i} correctly`, () => {
      const encrypted = encrypt(
        hexToBytes(vector.msg),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode
      );

      deepStrictEqual(toHex(encrypted), vector.cypherText);
    });

    it(`Should decrypt the test ${i} correctly`, () => {
      const decrypted = decrypt(
        hexToBytes(vector.cypherText),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode
      );

      deepStrictEqual(toHex(decrypted), vector.msg);
    });
  }

  it("Should throw when not padding automatically and the message isn't the right size", () => {
    throws(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "aes-256-gcm"
      )
    );
  });

  it("Should throw when trying to use non-aes modes", () => {
    throws(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "asd-256-gcm"
      )
    );
  });
});
