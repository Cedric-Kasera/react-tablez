import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up React components after each test run
afterEach(() => {
  cleanup();
});
