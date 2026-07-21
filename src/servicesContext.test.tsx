import React from 'react';
import { renderHook } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ServicesProvider, useServices } from './servicesContext';

test('useServices hook loads correctly in ServicesProvider', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServicesProvider>{children}</ServicesProvider>
  );

  const { result } = renderHook(() => useServices(), { wrapper });
  expect(result.current.goodService).toBeDefined();
  expect(result.current.townService).toBeDefined();
  expect(result.current.businessService).toBeDefined();
  expect(result.current.shipService).toBeDefined();
  expect(result.current.buildingService).toBeDefined();
});
