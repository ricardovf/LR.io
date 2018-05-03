export const multiTrim = (input, noSpaces = true) => {
  return input
    .trim()
    .replace(
      /[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/g,
      noSpaces ? '' : ' '
    )
    .replace(/\n\n+/g, '\n')
    .split('\n')
    .map(line => {
      return line.trim();
    })
    .join('\n')
    .trim();
};
