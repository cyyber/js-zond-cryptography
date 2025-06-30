import { decrypt, encrypt } from "../../src/aes";
import { hexToBytes, toHex } from "../../src/utils";
import { deepStrictEqual, rejects } from "./assert";
// Test vectors taken from https://github.com/paulmillr/noble-ciphers/blob/main/test/vectors/wycheproof/aes_gcm_test.json
const TEST_VECTORS = [
  {
    mode: "aes-256-gcm",
    key: "80ba3192c803ce965ea371d5ff073cf0f43b6a2ab576b208426e11409c09b9b0",
    iv: "4da5bf8dfd5852c1ea12379d",
    msg: "",
    cypherText:
      "4771a7c404a472966cea8f73c8bfe17a",
    pkcs7PaddingEnabled: false,
  },
  {
    mode: "aes-256-gcm",
    key: "cc56b680552eb75008f5484b4cb803fa5063ebd6eab91f6ab6aef4916a766273",
    iv: "99e23ec48985bccdeeab60f1",
    msg: "2a",
    cypherText:
      "06633c1e9703ef744ffffb40edf9d14355",
    pkcs7PaddingEnabled: false,
  },
  {
    mode: "aes-256-gcm",
    key: "cc56b680552eb75008f5484b4cb803fa5063ebd6eab91f6ab6aef4916a766273",
    iv: "99e23ec48985bccdeeab60f1",
    msg: "2a",
    cypherText:
      "06633c1e9703ef744ffffb40edf9d14355",
    pkcs7PaddingEnabled: true,
  },
  {
    mode: "aes-256-gcm",
    key: "51e4bf2bad92b7aff1a4bc05550ba81df4b96fabf41c12c7b00e60e48db7e152",
    iv: "4f07afedfdc3b6c2361823d3",
    msg: "be3308f72a2c6aed",
    cypherText:
      "cf332a12fdee800b602e8d7c4799d62c140c9bb834876b09",
    pkcs7PaddingEnabled: false,
  },
  {
    mode: "aes-256-gcm",
    key: "67119627bd988eda906219e08c0d0d779a07d208ce8a4fe0709af755eeec6dcb",
    iv: "68ab7fdbf61901dad461d23c",
    msg: "51f8c1f731ea14acdb210a6d973e07",
    cypherText:
      "43fc101bff4b32bfadd3daf57a590eec04aacb7148a8b8be44cb7eaf4efa69",
    pkcs7PaddingEnabled: false,
  },
];

describe("aes", () => {
  for (const [i, vector] of TEST_VECTORS.entries()) {
    it(`Should encrypt the test ${i} correctly`, async () => {
      const encrypted = await encrypt(
        hexToBytes(vector.msg),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode,
        vector.pkcs7PaddingEnabled
      );

      deepStrictEqual(toHex(encrypted), vector.cypherText);
    });

    it(`Should decrypt the test ${i} correctly`, async () => {
      const decrypted = await decrypt(
        hexToBytes(vector.cypherText),
        hexToBytes(vector.key),
        hexToBytes(vector.iv),
        vector.mode,
        vector.pkcs7PaddingEnabled
      );

      deepStrictEqual(toHex(decrypted), vector.msg);
    });
  }

  it("Should throw when not padding automatically and the message isn't the right size", async () => {
    rejects(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "aes-256-gcm",
        false
      )
    );
  });

  it("Should throw when trying to use non-aes modes", async () => {
    rejects(() =>
      encrypt(
        hexToBytes("abcd"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
        "asd-256-gcm",
        false
      )
    );
  });
});
