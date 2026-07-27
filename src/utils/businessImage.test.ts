import { describe, it, expect } from 'vitest';
import { getBusinessImagePath } from './businessImage';

describe('getBusinessImagePath', () => {
  it('dovrebbe convertire gli ID in percorsi immagine corretti', () => {
    expect(getBusinessImagePath('grain_farm')).toBe('/images/businesses/grain-farm.png');
    expect(getBusinessImagePath('brewery')).toBe('/images/businesses/brewery.png');
    expect(getBusinessImagePath('whale_fishery')).toBe('/images/businesses/whale-fishery.png');
  });
});
