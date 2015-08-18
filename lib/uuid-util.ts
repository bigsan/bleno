export function removeDashes(uuid) {
  if (uuid) {
    uuid = uuid.replace(/-/g, '');
  }

  return uuid;
}
