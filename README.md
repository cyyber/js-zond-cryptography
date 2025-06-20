# zond-cryptography

Pure JS library containing all Zond-related cryptographic primitives. Implemented with 6 [noble & scure](https://paulmillr.com/noble/) dependencies.

## Usage

```shell
npm install zond-cryptography
```

We explicitly support major browsers and Node.js on x86 and arm64. Other major runtimes and platforms are supported on a best-effort basis.
Refer to `engines` field of `package.json` for runtime support information for each version.
Tests are being ran with Webpack, Rollup, Parcel and Browserify.

This package has no single entry-point, but submodule for each cryptographic
primitive. The reason for this is that importing everything from a single file will lead to huge bundles when using this package for the web. This could be
avoided through tree-shaking, but the possibility of it not working properly
on one of [the supported bundlers](#browser-usage) is too high.

- [Usage](#usage)
  - [Dependencies](#dependencies)
  - [hashes: keccak](#hashes-sha256-sha512-keccak)
  - [kdfs: pbkdf2, scrypt](#kdfs-pbkdf2-scrypt)
  - [random: secure randomness](#random-secure-randomness)
  - [aes: encryption](#aes-encryption)
  - [utils: generic utilities](#utils-generic-utilities)
  - [All imports](#all-imports)
- [Caveats](#caveats)
  - [Browser usage: Rollup setup](#browser-usage-rollup-setup)
  - [AES](#aes)
    - [Encrypting with passwords](#encrypting-with-passwords)
    - [Operation modes](#operation-modes)
    - [Padding plaintext messages](#padding-plaintext-messages)
    - [How to use the IV parameter](#how-to-use-the-iv-parameter)
    - [How to handle errors with this module](#how-to-handle-errors-with-this-module)
- [Upgrading](#upgrading)
  - [Changelog](#changelog)
- [Security](#security)
- [License](#license)

### Dependencies

All functionality of the module is simple
re-export of 6 audited [noble & scure libraries](https://paulmillr.com/noble/):

- noble-curves, noble-ciphers, noble-hashes
- scure-base, scure-bip32, scure-bip39

zond-cryptography pins versions of the libraries to ensure good
protection against supply chain attacks. Ideally, your app would also
pin version of zond-cryptography. That means, no `^3.1.0` - use `3.1.0` instead.

### hashes: keccak

```js
import {
  keccak256,
  keccak224,
  keccak384,
  keccak512,
} from "zond-cryptography/keccak.js";
keccak256(Uint8Array.from([1, 2, 3])); // A: buffers

import { utf8ToBytes } from "zond-cryptography/utils.js";
keccak256(utf8ToBytes("abc")); // B: strings

import { bytesToHex as toHex } from "zond-cryptography/utils.js";
toHex(keccak256(utf8ToBytes("abc"))); // C: hex
```

### kdfs: pbkdf2, scrypt

```js
import { pbkdf2, pbkdf2Sync } from "zond-cryptography/pbkdf2.js";
import { scrypt, scryptSync } from "zond-cryptography/scrypt.js";
import { utf8ToBytes } from "zond-cryptography/utils.js";

// Pass Uint8Array, or convert strings to Uint8Array
const pass = utf8ToBytes("password");
const salt = utf8ToBytes("salt");
const iters = 131072;
const outLength = 32;
console.log(await pbkdf2(pass, salt, iters, outLength, "sha256"));

const N = 262144;
const r = 8;
const p = 1;
const outLengths = 32;
console.log(await scrypt(pass, salt, N, r, p, outLengths));
```

The `pbkdf2` submodule has two functions implementing the PBKDF2 key
derivation algorithm in synchronous and asynchronous ways. This algorithm is
very slow, and using the synchronous version in the browser is not recommended,
as it will block its main thread and hang your UI. The KDF supports `sha256` and `sha512` digests.

The `scrypt` submodule has two functions implementing the Scrypt key
derivation algorithm in synchronous and asynchronous ways. This algorithm is
very slow, and using the synchronous version in the browser is not recommended,
as it will block its main thread and hang your UI.

Encoding passwords is a frequent source of errors. Please read
[notes](https://github.com/ricmoo/scrypt-js/tree/0eb70873ddf3d24e34b53e0d9a99a0cef06a79c0#encoding-notes)
before using these submodules.

### random: secure randomness

```js
import { getRandomBytesSync } from "zond-cryptography/random.js";
console.log(getRandomBytesSync(32));
```

The `random` submodule has functions to generate cryptographically strong
pseudo-random data in synchronous and asynchronous ways. Backed by [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) in browser and by [`crypto.randomBytes`](https://nodejs.org/api/crypto.html#crypto_crypto_randombytes_size_callback) in node.js. If backends are somehow not available, the module would throw an error and won't work, as keeping them working would be insecure.

### aes: encryption

```js
import * as aes from "zond-cryptography/aes.js";
import { hexToBytes, utf8ToBytes } from "zond-cryptography/utils.js";

console.log(
  aes.encrypt(
    utf8ToBytes("message"),
    hexToBytes("2b7e151628aed2a6abf7158809cf4f3c"),
    hexToBytes("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")
  )
);
// const mode = "aes-256-gcm";
// function encrypt(msg: Uint8Array, key: Uint8Array, iv: Uint8Array, mode = "aes-256-gcm"): Uint8Array;
// function decrypt(cipherText: Uint8Array, key: Uint8Array, iv: Uint8Array, mode = "aes-256-gcm"): Uint8Array;
```

### utils: generic utilities

```js
import { hexToBytes, toHex, utf8ToBytes } from "zond-cryptography/utils.js";
```

### All imports

```js
import {
  keccak256,
  keccak224,
  keccak384,
  keccak512,
} from "zond-cryptography/keccak.js";

import { pbkdf2Sync } from "zond-cryptography/pbkdf2.js";
import { scryptSync } from "zond-cryptography/scrypt.js";

import { getRandomBytesSync } from "zond-cryptography/random.js";

import { encrypt } from "zond-cryptography/aes.js";

import { hexToBytes, toHex, utf8ToBytes } from "zond-cryptography/utils.js";
```

## Caveats

### Browser usage: Rollup setup

Using this library with Rollup requires the following plugins:

- [`@rollup/plugin-commonjs`](https://www.npmjs.com/package/@rollup/plugin-commonjs)
- [`@rollup/plugin-node-resolve`](https://www.npmjs.com/package/@rollup/plugin-node-resolve)

These can be used by setting your `plugins` array like this:

```js
plugins: [
  commonjs(),
  resolve({
    browser: true,
    preferBuiltins: false,
  }),
];
```

### AES

#### Encrypting with passwords

AES is not supposed to be used directly with a password. Doing that will
compromise your users' security.

The `key` parameters in this submodule are meant to be strong cryptographic
keys. If you want to obtain such a key from a password, please use a
[key derivation function](https://en.wikipedia.org/wiki/Key_derivation_function)
like [pbkdf2](#kdfs-pbkdf2-scrypt) or [scrypt](#kdfs-pbkdf2-scrypt).

#### Operation modes

This submodule works with different [block cipher modes of operation](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation). If you are using this module in a new
application, we recommend using the default.

While this module may work with any mode supported by OpenSSL, we only test it
with `aes-256-gcm. If you use another module a warning will be printed in the 
console.

We only recommend using `aes-256-gcm` to decrypt already encrypted data.

#### How to use the IV parameter

The `iv` parameter of the `encrypt` function must be unique, or the security
of the encryption algorithm can be compromised.

You can generate a new `iv` using the `random` module.

Note that to decrypt a value, you have to provide the same `iv` used to encrypt
it.

#### How to handle errors with this module

Sensitive information can be leaked via error messages when using this module.
To avoid this, you should make sure that the errors you return don't
contain the exact reason for the error. Instead, errors must report general
encryption/decryption failures.

Note that implementing this can mean catching all errors that can be thrown
when calling on of this module's functions, and just throwing a new generic
exception.

## Upgrading

### Changelog

## License

`zond-cryptography` is released under The MIT License (MIT)

Copyright (c) 2021 Patricio Palladino, Paul Miller, ethereum-cryptography contributors

See [LICENSE](./LICENSE) file.