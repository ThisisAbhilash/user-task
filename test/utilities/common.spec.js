const cmn = require('../../src/utilities/common');

describe('Common Utility Function to check for empty', () => {
  it('Empty string should return true', () => {
    expect(cmn.isEmpty('')).toBeTruthy();
  });

  it('0 should return false', () => {
    expect(cmn.isEmpty(0)).toBeFalsy();
  });

  it('Empty object should return true', () => {
    expect(cmn.isEmpty({})).toBeTruthy();
  });

  it('Empty array should return true', () => {
    expect(cmn.isEmpty([])).toBeTruthy();
  });

  it('Valid string should return false', () => {
    expect(cmn.isEmpty('hello')).toBeFalsy();
  });
});
