export function utf8ByteLength(value: string): number {
  let bytes = 0;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code < 0x80) {
      bytes += 1;
      continue;
    }

    if (code < 0x800) {
      bytes += 2;
      continue;
    }

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);

      if (next >= 0xdc00 && next <= 0xdfff) {
        bytes += 4;
        index += 1;
        continue;
      }
    }

    bytes += 3;
  }

  return bytes;
}
