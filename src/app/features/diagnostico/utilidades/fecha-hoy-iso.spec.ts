import { fechaHoyIso } from './fecha-hoy-iso';

describe('fechaHoyIso', () => {
  it('should devolver YYYY-MM-DD', () => {
    expect(fechaHoyIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
