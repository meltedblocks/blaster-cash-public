export function shortenAddress(address: string) {
  if (!address || address.length < 5) {
    return '';
  }
  return address.slice(0, 4) + '..' + address.slice(-4);
}
