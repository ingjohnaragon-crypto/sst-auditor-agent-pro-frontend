import { dispararDescargaBlob, formatearTamanoBytes } from './formato-archivo';

describe('formato-archivo', () => {
  it('should formatear bytes, KB y MB', () => {
    expect(formatearTamanoBytes(512)).toBe('512 B');
    expect(formatearTamanoBytes(2048)).toBe('2.0 KB');
    expect(formatearTamanoBytes(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('should disparar descarga con object URL', () => {
    const createObjectURL = jest.fn(() => 'blob:mock');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });

    const click = jest.fn();
    const appendChild = jest.spyOn(document.body, 'appendChild').mockImplementation((n) => n);
    const remove = jest.fn();
    const createElement = jest.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      rel: '',
      click,
      remove,
    } as unknown as HTMLAnchorElement);

    dispararDescargaBlob(new Blob(['x']), 'acta.pdf');

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    createElement.mockRestore();
    appendChild.mockRestore();
  });
});
